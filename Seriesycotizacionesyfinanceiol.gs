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
 * OBTIENE EL DATO DE UNA FECHA ESPECÍFICA (MEP Histórico)
 * Si la fecha es feriado, busca hasta 5 días atrás automáticamente.
 */
function getDatoIOLHistorico(mercado, simbolo, dato, fecha) {
  if (!simbolo || !mercado) return "Faltan parámetros";
  if (!fecha || fecha === "") return getDatoIOL(mercado, simbolo, dato);

  var token = getIOLToken();
  var fechaFinStr;
  var fechaInicioStr;

  try {
    var d = new Date(fecha);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    fechaFinStr = Utilities.formatDate(d, "GMT", "yyyy-MM-dd");
    
    // Rango de 5 días atrás por si la fecha elegida fue feriado/finde
    var dInicio = new Date(d);
    dInicio.setDate(d.getDate() - 5);
    fechaInicioStr = Utilities.formatDate(dInicio, "GMT", "yyyy-MM-dd");
  } catch(e) { return "Fecha Inválida"; }

  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + fechaInicioStr + "/" + fechaFinStr + "/SinAjustar";
  
  try {
    var response = UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}, 'muteHttpExceptions': true});
    var data = JSON.parse(response.getContentText());
    if (data && data.length > 0) {
      var registro = data[data.length - 1]; // El más cercano a la fecha pedida
      switch(dato.toLowerCase().trim()) {
        case "ultimo": return registro.ultimoPrecio;
        case "apertura": return registro.apertura;
        case "maximo": return registro.maximo;
        case "minimo": return registro.minimo;
        case "volumen": return registro.volumenNominal;
        default: return registro.ultimoPrecio;
      }
    }
    return "Sin datos";
  } catch(e) { return "Error API"; }
}

/**
 * OBTIENE DATOS ACTUALES DE IOL
 * Soporta refresco automático mediante el 4to parámetro.
 */
function getDatoIOL(mercado, simbolo, dato, refresco) {
  if (!simbolo) return "";
  var token = getIOLToken();
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion";
  
  try {
    var response = UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}, 'muteHttpExceptions': true});
    var res = JSON.parse(response.getContentText());
    if (!res || res.ultimoPrecio === undefined) return "N/A";

    var ultimo = res.ultimoPrecio;
    var cierreAnt = res.cierreAnterior;

    // Si el mercado está cerrado (precio 0), intenta rescatar del histórico reciente
    if (ultimo === 0) {
       return getDatoIOLHistorico(mercado, simbolo, dato, new Date());
    }

    switch(dato.toLowerCase().trim()) {
      case "ultimo": return ultimo;
      case "var": return (cierreAnt > 0) ? (ultimo / cierreAnt) - 1 : 0;
      case "apertura": return res.precioApertura;
      case "minimo": return res.minimo;
      case "maximo": return res.maximo;
      case "volumen": return res.volumenNominal || 0;
      case "ytm": return res.tir ? (res.tir / 100) : "N/A";
      default: return ultimo;
    }
  } catch(e) { return "Error IOL"; }
}

// ==========================================
//   SECCIÓN 2: YAHOO FINANCE (YF)
// ==========================================

function getDatoYF(ticker, dato, refresco) {
  if (!ticker) return "";
  try {
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker;
    var res = UrlFetchApp.fetch(url, { "headers": { "User-Agent": "Mozilla/5.0" } });
    var json = JSON.parse(res.getContentText());
    var meta = json.chart.result[0].meta;
    switch((dato || "price").toLowerCase()) {
      case "price": return meta.regularMarketPrice;
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
  var sheet = ss.getSheetByName("Panel"); // <--- Asegurate que tu pestaña se llame Panel
  if (sheet) {
    sheet.getRange("Z1").setValue(new Date().getTime());
  }
}
