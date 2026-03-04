/**
 * CONFIGURACIÓN DE CREDENCIALES IOL
 */
var USUARIO_IOL = 'xxx@gmail.com';
var PASS_IOL = 'xxxx'; 

// ==========================================
//   SECCIÓN 1: INVERTIRONLINE (IOL)
// ==========================================

function getIOLToken() {
  var url = 'https://api.invertironline.com/token';
  var payload = { 'username': USUARIO_IOL, 'password': PASS_IOL, 'grant_type': 'password' };
  var options = { 'method': 'post', 'contentType': 'application/x-www-form-urlencoded', 'payload': payload, 'muteHttpExceptions': true };
  var response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText()).access_token;
}

/**
 * Obtiene datos actuales de IOL.
 */
function getDatoIOL(mercado, simbolo, dato, refresco) {
  if (!simbolo) return "";
  var token = getIOLToken();
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion";
  try {
    var response = UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}, 'muteHttpExceptions': true});
    var res = JSON.parse(response.getContentText());
    if (!res || res.ultimoPrecio === undefined) return "N/A";
    
    switch(dato.toLowerCase().trim()) {
      case "ultimo": return res.ultimoPrecio;
      case "var": return res.variacion || 0;
      case "volumen": return res.volumenNominal || 0;
      default: return res.ultimoPrecio;
    }
  } catch(e) { return "Error IOL"; }
}

/**
 * Obtiene el historial de IOL filtrado (Un valor por día).
 * @customfunction
 */
function getHistoryIOL(mercado, simbolo, desde, hasta) {
  if (!simbolo) return "Falta Simbolo";
  var token = getIOLToken();
  
  var f1 = (desde instanceof Date) ? Utilities.formatDate(desde, "GMT-3", "yyyy-MM-dd") : desde;
  var f2 = (hasta instanceof Date) ? Utilities.formatDate(hasta, "GMT-3", "yyyy-MM-dd") : hasta;
  
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + f1 + "/" + f2 + "/SinAjustar";
  
  try {
    var response = UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}, 'muteHttpExceptions': true});
    var data = JSON.parse(response.getContentText());
    
    if (!data || !Array.isArray(data)) return "Sin datos";

    // Usamos un objeto para quedarnos solo con la ÚLTIMA operación de cada día
    var diario = {};
    
    for (var i = 0; i < data.length; i++) {
      var fecha = data[i].fechaHora.split("T")[0];
      var precio = data[i].precio || data[i].ultimoPrecio;
      var volumen = data[i].cantidad || data[i].volumenNominal;
      
      // Al guardar por fecha, el último registro del JSON (que suele ser el más reciente del día) pisa al anterior
      diario[fecha] = {
        precio: precio,
        volumen: volumen
      };
    }

    var res = [["Fecha", "Precio Cierre", "Volumen"]];
    var fechasOrdenadas = Object.keys(diario).sort();
    
    for (var j = 0; j < fechasOrdenadas.length; j++) {
      var f = fechasOrdenadas[j];
      res.push([f, diario[f].precio, diario[f].volumen]);
    }
    
    return res;
  } catch(e) { return "Error Tabla IOL"; }
}

/**
 * Obtiene precio histórico para cálculos (MEP, etc).
 */
function getDatoIOLHistorico(mercado, simbolo, dato, fecha) {
  if (!simbolo || !fecha) return "";
  var token = getIOLToken();
  var d = new Date(fecha);
  var fFin = Utilities.formatDate(d, "GMT-3", "yyyy-MM-dd");
  var dIni = new Date(d); dIni.setDate(d.getDate() - 7);
  var fIni = Utilities.formatDate(dIni, "GMT-3", "yyyy-MM-dd");
  
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + fIni + "/" + fFin + "/SinAjustar";
  
  try {
    var res = JSON.parse(UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}}).getContentText());
    if (res && res.length > 0) {
      var h = res[res.length - 1];
      return (dato.toLowerCase() === "volumen") ? (h.cantidad || h.volumenNominal) : (h.precio || h.ultimoPrecio);
    }
    return "N/A";
  } catch(e) { return "Error Hist."; }
}

/**
 * Función MEP Optimizada.
 * @customfunction
 */
function getMEPHistorico(simboloPesos, simboloDolares, fecha) {
  var p1 = getDatoIOLHistorico("BCBA", simboloPesos, "ultimo", fecha);
  var p2 = getDatoIOLHistorico("BCBA", simboloDolares, "ultimo", fecha);
  if (isNaN(p1) || isNaN(p2) || p2 === 0) return "N/A";
  return p1 / p2;
}

// ==========================================
//   SECCIÓN 2: YAHOO FINANCE (YF)
// ==========================================

function getDatoYF(ticker, dato, refresco) {
  if (!ticker) return "";
  try {
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker.toString().trim().toUpperCase();
    var res = UrlFetchApp.fetch(url, { "headers": { "User-Agent": "Mozilla/5.0" }, "muteHttpExceptions": true });
    var json = JSON.parse(res.getContentText());
    if (!json.chart || !json.chart.result) return "N/A";
    var meta = json.chart.result[0].meta;
    switch((dato || "ultimo").toLowerCase().trim()) {
      case "ultimo": return meta.regularMarketPrice;
      case "currency": return meta.currency;
      default: return meta.regularMarketPrice;
    }
  } catch(e) { return "Error YF"; }
}

// ==========================================
//   SECCIÓN 3: MOTOR DE REFRESCO
// ==========================================

function refrescarDatosAutomatico() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Panel"); 
  if (sheet) sheet.getRange("Z1").setValue(new Date().getTime());
}
