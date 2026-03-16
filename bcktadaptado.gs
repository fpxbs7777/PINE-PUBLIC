/**
 * CONFIGURACIÓN DE CREDENCIALES IOL
 */
var USUARIO_IOL = 'cxxx@gmail.com';
var PASS_IOL = 'xxxx'; 

// ==========================================
//   SECCIÓN 1: INVERTIRONLINE (IOL)
// ==========================================

function getIOLToken() {
  var url = 'https://api.invertironline.com/token';
  var payload = { 'username': USUARIO_IOL, 'password': PASS_IOL, 'grant_type': 'password' };
  var options = { 'method': 'post', 'contentType': 'application/x-www-form-urlencoded', 'payload': payload, 'muteHttpExceptions': true };
  var response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response.getContentText());
  return json.access_token;
}

/**
 * Obtiene datos actuales de IOL.
 * @customfunction
 */
function getDatoIOL(mercado, simbolo, dato, refresco) {
  if (!simbolo) return "";
  var token = getIOLToken();
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion";
  try {
    var response = UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}, 'muteHttpExceptions': true});
    var res = JSON.parse(response.getContentText());
    if (!res || res.ultimoPrecio === undefined) return "N/A";
    
    var d = (dato || "ultimo").toLowerCase().trim();
    if (d === "ultimo") return res.ultimoPrecio;
    if (d === "var") return res.variacion || 0;
    if (d === "volumen") return res.volumenNominal || 0;
    return res.ultimoPrecio;
  } catch(e) { return "Error IOL"; }
}

/**
 * Obtiene el historial de IOL para tablas.
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

    var res = [["Fecha", "Precio Cierre", "Volumen"]];
    for (var i = 0; i < data.length; i++) {
      var fecha = data[i].fechaHora.split("T")[0];
      var precio = data[i].ultimoPrecio || data[i].precio;
      var volumen = data[i].volumenNominal || data[i].cantidad;
      res.push([fecha, precio, volumen]);
    }
    return res;
  } catch(e) { return "Error Tabla IOL"; }
}

/**
 * Obtiene precio histórico específico para una celda (Cálculo MEP manual).
 * @customfunction
 */
function getDatoIOLHistorico(mercado, simbolo, dato, fecha) {
  if (!simbolo || !fecha) return "";
  var token = getIOLToken();
  var d = new Date(fecha);
  var fFin = Utilities.formatDate(d, "GMT-3", "yyyy-MM-dd");
  
  var dIni = new Date(d); 
  dIni.setDate(d.getDate() - 5); 
  var fIni = Utilities.formatDate(dIni, "GMT-3", "yyyy-MM-dd");
  
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + fIni + "/" + fFin + "/SinAjustar";
  
  try {
    var response = UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}, 'muteHttpExceptions': true});
    var res = JSON.parse(response.getContentText());
    if (res && res.length > 0) {
      var ultimoRegistro = res[res.length - 1];
      var valor = (dato.toLowerCase() === "volumen") ? 
                  (ultimoRegistro.volumenNominal || ultimoRegistro.cantidad) : 
                  (ultimoRegistro.ultimoPrecio || ultimoRegistro.precio);
      return valor;
    }
    return "N/A";
  } catch(e) { return "Error Hist."; }
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
    
    var d = (dato || "ultimo").toLowerCase().trim();
    if (d === "ultimo") return meta.regularMarketPrice;
    if (d === "currency") return meta.currency;
    return meta.regularMarketPrice;
  } catch(e) { return "Error YF"; }
}

function getHistoryYF(ticker, desde, hasta) {
  if (!ticker) return "Falta Ticker";
  try {
    var t1 = Math.floor(new Date(desde).getTime() / 1000);
    var t2 = Math.floor(new Date(hasta).getTime() / 1000);
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker + "?period1=" + t1 + "&period2=" + t2 + "&interval=1d";
    var res = UrlFetchApp.fetch(url, { "headers": { "User-Agent": "Mozilla/5.0" } });
    var json = JSON.parse(res.getContentText());
    
    var result = json.chart.result[0];
    var timestamps = result.timestamp;
    var prices = result.indicators.quote[0].close;
    
    var output = [["Fecha", "Precio"]];
    for (var i = 0; i < timestamps.length; i++) {
      var date = new Date(timestamps[i] * 1000);
      output.push([Utilities.formatDate(date, "GMT-3", "yyyy-MM-dd"), prices[i]]);
    }
    return output;
  } catch(e) { return "Error Hist. YF"; }
}

// ==========================================
//   SECCIÓN 3: CÁLCULOS DE RECORRIDO (MAE/MFE)
// ==========================================

/**
 * Calcula el Máximo o Mínimo de la posición desde la entrada hasta el SEGUNDO ACTUAL.
 * @param {string} fuente "IOL" o "YF"
 * @param {string} mercado "BCBA" para IOL o vacío para YF
 * @param {string} simbolo Ticker del activo
 * @param {date} fechaEntrada Fecha de compra
 * @param {string} tipo "MAX" para Máximo (MFE) o "MIN" para Mínimo (MAE)
 * @customfunction
 */
function getExtremoPosicion(fuente, mercado, simbolo, fechaEntrada, tipo) {
  if (!simbolo || !fechaEntrada) return "Faltan datos";
  
  var hoy = new Date();
  var datos;
  var precioActual;
  
  try {
    // 1. Obtener historial y precio actual según la fuente
    if (fuente.toUpperCase() === "IOL") {
      datos = getHistoryIOL(mercado, simbolo, fechaEntrada, hoy);
      precioActual = getDatoIOL(mercado, simbolo, "ultimo");
    } else {
      datos = getHistoryYF(simbolo, fechaEntrada, hoy);
      precioActual = getDatoYF(simbolo, "ultimo");
    }
    
    if (!Array.isArray(datos) || datos.length <= 1) return "Sin historial";

    // 2. Extraer precios del historial
    var precios = datos.slice(1).map(function(fila) { return fila[1]; });

    // 3. Incluir el precio actual para que el recorrido sea real al momento
    if (typeof precioActual === 'number') {
      precios.push(precioActual);
    }

    // 4. Calcular el extremo solicitado
    if (tipo.toUpperCase() === "MAX") {
      return Math.max.apply(null, precios);
    } else if (tipo.toUpperCase() === "MIN") {
      return Math.min.apply(null, precios);
    }
    
  } catch(e) {
    return "Error en cálculo";
  }
}

// ==========================================
//   SECCIÓN 4: MOTOR DE REFRESCO
// ==========================================

function refrescarDatosAutomatico() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Panel"); 
  if (sheet) sheet.getRange("Z1").setValue(new Date().getTime());
}
