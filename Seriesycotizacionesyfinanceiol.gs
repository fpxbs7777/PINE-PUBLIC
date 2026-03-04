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
    if (res.ultimoPrecio === 0) return getDatoIOLHistorico(mercado, simbolo, dato, new Date());
    switch(dato.toLowerCase().trim()) {
      case "ultimo": return res.ultimoPrecio;
      case "var": return (res.cierreAnterior > 0) ? (res.ultimoPrecio / res.cierreAnterior) - 1 : 0;
      case "volumen": return res.volumenNominal || 0;
      default: return res.ultimoPrecio;
    }
  } catch(e) { return "Error IOL"; }
}

/**
 * Obtiene el precio de IOL en una fecha específica (Para MEP).
 * @customfunction
 */
function getDatoIOLHistorico(mercado, simbolo, dato, fecha) {
  if (!simbolo || !fecha) return "";
  var token = getIOLToken();
  var d = new Date(fecha);
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  var fFin = Utilities.formatDate(d, "GMT", "yyyy-MM-dd");
  var dIni = new Date(d); dIni.setDate(d.getDate() - 7);
  var fIni = Utilities.formatDate(dIni, "GMT", "yyyy-MM-dd");
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + fIni + "/" + fFin + "/SinAjustar";
  try {
    var res = JSON.parse(UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}}).getContentText());
    if (res && res.length > 0) {
      var h = res[res.length - 1];
      return (dato.toLowerCase() === "volumen") ? h.volumenNominal : h.ultimoPrecio;
    }
    return "N/A";
  } catch(e) { return "Error Hist."; }
}

/**
 * Obtiene una TABLA completa de IOL.
 * @customfunction
 */
function getHistoryIOL(mercado, simbolo, desde, hasta) {
  var token = getIOLToken();
  var f1 = (desde instanceof Date) ? Utilities.formatDate(desde, "GMT", "yyyy-MM-dd") : desde;
  var f2 = (hasta instanceof Date) ? Utilities.formatDate(hasta, "GMT", "yyyy-MM-dd") : hasta;
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + f1 + "/" + f2 + "/SinAjustar";
  try {
    var data = JSON.parse(UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}}).getContentText());
    var res = [["Fecha", "Cierre", "Volumen"]];
    for (var i=0; i<data.length; i++) res.push([data[i].fechaHora.split("T")[0], data[i].ultimoPrecio, data[i].volumenNominal]);
    return res;
  } catch(e) { return "Error Tabla IOL"; }
}

// ==========================================
//   SECCIÓN 2: YAHOO FINANCE (YF)
// ==========================================

/**
 * Obtiene datos actuales de Yahoo Finance.
 * @customfunction
 */
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
      case "name": return meta.symbol;
      case "currency": return meta.currency;
      default: return meta.regularMarketPrice;
    }
  } catch(e) { return "Error YF"; }
}

/**
 * Obtiene el historial de Yahoo Finance en una tabla.
 * @customfunction
 */
function getHistoryYF(ticker, desde, hasta) {
  var p1 = Math.floor(new Date(desde).getTime() / 1000);
  var p2 = Math.floor(new Date(hasta).getTime() / 1000);
  try {
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker + "?period1=" + p1 + "&period2=" + p2 + "&interval=1d";
    var res = UrlFetchApp.fetch(url, { "headers": { "User-Agent": "Mozilla/5.0" } });
    var json = JSON.parse(res.getContentText());
    var t = json.chart.result[0].timestamp;
    var c = json.chart.result[0].indicators.adjclose[0].adjclose;
    var resTab = [["Fecha", "Cierre Adj"]];
    for (var i=0; i<t.length; i++) resTab.push([Utilities.formatDate(new Date(t[i]*1000), "GMT", "yyyy-MM-dd"), c[i]]);
    return resTab;
  } catch(e) { return "Error Tabla YF"; }
}

// ==========================================
//   SECCIÓN 3: MOTOR DE REFRESCO
// ==========================================

function refrescarDatosAutomatico() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Panel"); 
  if (sheet) sheet.getRange("Z1").setValue(new Date().getTime());
}
