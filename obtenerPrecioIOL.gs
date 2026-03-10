// ==========================================
//   CREDENCIALES
// ==========================================
var USUARIO_IOL = 'XXX@gmail.com';
var PASS_IOL = 'XXX';

// ==========================================
//   TOKEN
// ==========================================
function getIOLToken() {
  var url = 'https://api.invertironline.com/token';
  var payload = {
    'username': USUARIO_IOL,
    'password': PASS_IOL,
    'grant_type': 'password'
  };
  var options = {
    'method': 'post',
    'contentType': 'application/x-www-form-urlencoded',
    'payload': payload,
    'muteHttpExceptions': true
  };
  var response = UrlFetchApp.fetch(url, options);
  Logger.log('Token response: ' + response.getContentText());
  return JSON.parse(response.getContentText()).access_token;
}

// ==========================================
//   PRECIO ACTUAL (busca en todos los paneles)
// ==========================================
/**
 * Busca el precio de un ticker en todos los mercados de IOL.
 * @param {string} ticker El símbolo (ej: "AE38", "GD30", "YPFD").
 * @customfunction
 */
function getPrecioIOL(ticker) {
  if (!ticker) return "";
  var token = getIOLToken();
  var tipos = [
    {inst: 'titulosPublicos',        pais: 'argentina'},
    {inst: 'obligacionesNegociables', pais: 'argentina'},
    {inst: 'acciones',               pais: 'argentina'},
    {inst: 'cedears',                pais: 'argentina'},
    {inst: 'acciones',               pais: 'estados_unidos'}
  ];
  for (var i = 0; i < tipos.length; i++) {
    var url = "https://api.invertironline.com/api/v2/Cotizaciones/" 
              + tipos[i].inst + "/" + tipos[i].pais + "/Todos";
    var options = {
      'method': 'get',
      'headers': {'Authorization': 'Bearer ' + token},
      'muteHttpExceptions': true
    };
    var response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      var data = JSON.parse(response.getContentText());
      var activo = data.titulos.find(function(t) { return t.simbolo === ticker; });
      if (activo) return activo.ultimoPrecio;
    }
  }
  return "No encontrado";
}

// ==========================================
//   DATO ESPECÍFICO (ultimo, var, volumen)
// ==========================================
/**
 * Obtiene un dato puntual de IOL por mercado y símbolo.
 * @param {string} mercado  Ej: "bCBA"
 * @param {string} simbolo  Ej: "YPFD"
 * @param {string} dato     "ultimo", "var" o "volumen"
 * @customfunction
 */
function getDatoIOL(mercado, simbolo, dato) {
  if (!simbolo) return "";
  var token = getIOLToken();
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion";
  try {
    var response = UrlFetchApp.fetch(url, {
      'headers': {'Authorization': 'Bearer ' + token},
      'muteHttpExceptions': true
    });
    var res = JSON.parse(response.getContentText());
    if (!res || res.ultimoPrecio === undefined) return "N/A";
    var d = (dato || "ultimo").toLowerCase().trim();
    if (d === "ultimo")  return res.ultimoPrecio;
    if (d === "var")     return res.variacion || 0;
    if (d === "volumen") return res.volumenNominal || 0;
    return res.ultimoPrecio;
  } catch(e) { return "Error: " + e.message; }
}

// ==========================================
//   HISTORIAL (tabla)
// ==========================================
/**
 * Devuelve tabla histórica de IOL.
 * @param {string} mercado  Ej: "bCBA"
 * @param {string} simbolo  Ej: "YPFD"
 * @param {date}   desde    Fecha inicio
 * @param {date}   hasta    Fecha fin
 * @customfunction
 */
function getHistoryIOL(mercado, simbolo, desde, hasta) {
  if (!simbolo) return "Falta Simbolo";
  var token = getIOLToken();
  var f1 = (desde instanceof Date) ? Utilities.formatDate(desde, "GMT-3", "yyyy-MM-dd") : desde;
  var f2 = (hasta instanceof Date) ? Utilities.formatDate(hasta, "GMT-3", "yyyy-MM-dd") : hasta;
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo 
            + "/Cotizacion/seriehistorica/" + f1 + "/" + f2 + "/SinAjustar";
  try {
    var response = UrlFetchApp.fetch(url, {
      'headers': {'Authorization': 'Bearer ' + token},
      'muteHttpExceptions': true
    });
    var data = JSON.parse(response.getContentText());
    if (!data || !Array.isArray(data)) return "Sin datos";
    var res = [["Fecha", "Precio Cierre", "Volumen"]];
    for (var i = 0; i < data.length; i++) {
      res.push([
        data[i].fechaHora.split("T")[0],
        data[i].ultimoPrecio || data[i].precio,
        data[i].volumenNominal || data[i].cantidad
      ]);
    }
    return res;
  } catch(e) { return "Error: " + e.message; }
}

// ==========================================
//   DATO HISTÓRICO (celda única)
// ==========================================
/**
 * Obtiene un dato histórico puntual de IOL.
 * @param {string} mercado  Ej: "bCBA"
 * @param {string} simbolo  Ej: "YPFD"
 * @param {string} dato     "ultimo" o "volumen"
 * @param {date}   fecha    Fecha buscada
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
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo 
            + "/Cotizacion/seriehistorica/" + fIni + "/" + fFin + "/SinAjustar";
  try {
    var response = UrlFetchApp.fetch(url, {
      'headers': {'Authorization': 'Bearer ' + token},
      'muteHttpExceptions': true
    });
    var res = JSON.parse(response.getContentText());
    if (res && res.length > 0) {
      var ultimo = res[res.length - 1];
      return (dato.toLowerCase() === "volumen") 
        ? (ultimo.volumenNominal || ultimo.cantidad)
        : (ultimo.ultimoPrecio   || ultimo.precio);
    }
    return "N/A";
  } catch(e) { return "Error: " + e.message; }
}

// ==========================================
//   YAHOO FINANCE
// ==========================================
/**
 * Obtiene el último precio de Yahoo Finance.
 * @param {string} ticker  Ej: "AAPL", "YPF"
 * @param {string} dato    "ultimo" o "currency"
 * @customfunction
 */
function getDatoYF(ticker, dato) {
  if (!ticker) return "";
  try {
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" 
              + ticker.toString().trim().toUpperCase();
    var res = UrlFetchApp.fetch(url, {
      "headers": {"User-Agent": "Mozilla/5.0"},
      "muteHttpExceptions": true
    });
    var json = JSON.parse(res.getContentText());
    if (!json.chart || !json.chart.result) return "N/A";
    var meta = json.chart.result[0].meta;
    var d = (dato || "ultimo").toLowerCase().trim();
    if (d === "currency") return meta.currency;
    return meta.regularMarketPrice;
  } catch(e) { return "Error YF: " + e.message; }
}

/**
 * Devuelve tabla histórica de Yahoo Finance.
 * @param {string} ticker  Ej: "AAPL"
 * @param {date}   desde   Fecha inicio
 * @param {date}   hasta   Fecha fin
 * @customfunction
 */
function getHistoryYF(ticker, desde, hasta) {
  if (!ticker) return "Falta Ticker";
  try {
    var t1 = Math.floor(new Date(desde).getTime() / 1000);
    var t2 = Math.floor(new Date(hasta).getTime() / 1000);
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker 
              + "?period1=" + t1 + "&period2=" + t2 + "&interval=1d";
    var res = UrlFetchApp.fetch(url, {"headers": {"User-Agent": "Mozilla/5.0"}});
    var json = JSON.parse(res.getContentText());
    var result = json.chart.result[0];
    var timestamps = result.timestamp;
    var prices = result.indicators.quote[0].close;
    var output = [["Fecha", "Precio"]];
    for (var i = 0; i < timestamps.length; i++) {
      output.push([
        Utilities.formatDate(new Date(timestamps[i] * 1000), "GMT-3", "yyyy-MM-dd"),
        prices[i]
      ]);
    }
    return output;
  } catch(e) { return "Error Hist. YF: " + e.message; }
}

// ==========================================
//   REFRESCO AUTOMÁTICO
// ==========================================
function refrescarDatosAutomatico() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Panel");
  if (sheet) sheet.getRange("Z1").setValue(new Date().getTime());
}
