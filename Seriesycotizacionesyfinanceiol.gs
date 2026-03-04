/**
 * CONFIGURACIÓN DE CREDENCIALES IOL
 */
var USUARIO_IOL = 'xxx@gmail.com';
var PASS_IOL = 'xxxx'; 

// --- SECCIÓN: INVERTIRONLINE (IOL) ---

/**
 * Obtiene el token de acceso para la API de InvertirOnline.
 */
function getIOLToken() {
  var url = 'https://api.invertironline.com/token';
  var payload = { 'username': USUARIO_IOL, 'password': PASS_IOL, 'grant_type': 'password' };
  var options = { 'method': 'post', 'contentType': 'application/x-www-form-urlencoded', 'payload': payload, 'muteHttpExceptions': true };
  var response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText()).access_token;
}

/**
 * Obtiene datos en tiempo real de IOL (Merval, Bonos, Cedears en BYMA).
 * @param {string} mercado Mercado (ej: "BCBA", "NYSE", "NASDAQ").
 * @param {string} simbolo Ticker (ej: "AL30", "GGAL").
 * @param {string} dato Campo a obtener (ultimo, var, ytm, apertura, etc).
 * @customfunction
 */
function getDatoIOL(mercado, simbolo, dato) {
  if (!simbolo) return "";
  var token = getIOLToken();
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion";
  
  try {
    var response = UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}, 'muteHttpExceptions': true});
    var res = JSON.parse(response.getContentText());
    if (!res || res.ultimoPrecio === undefined) return "N/A";

    var ultimo = res.ultimoPrecio;
    var cierreAnt = res.cierreAnterior;
    
    // Si el mercado está cerrado o no hay trade, buscamos en histórica reciente
    if (res.precioApertura === 0 || res.maximo === 0) {
       var hoy = new Date();
       var hace5dias = new Date(hoy.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
       var hoyStr = hoy.toISOString().split('T')[0];
       var urlHist = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + hace5dias + "/" + hoyStr + "/SinAjustar";
       var resHist = JSON.parse(UrlFetchApp.fetch(urlHist, {'headers': {'Authorization': 'Bearer ' + token}}).getContentText());
       
       if (resHist && resHist.length > 0) {
         var h = resHist[resHist.length - 1];
         if (ultimo === 0) ultimo = h.ultimoPrecio;
       }
    }

    switch(dato.toLowerCase()) {
      case "ultimo": return ultimo > 0 ? ultimo : cierreAnt;
      case "var": return (cierreAnt > 0) ? (ultimo / cierreAnt) - 1 : 0;
      case "ytm": return (res.tir || res.yield || 0) / 100;
      case "apertura": return res.precioApertura || 0;
      case "maximo": return res.maximo || 0;
      case "minimo": return res.minimo || 0;
      case "volumen": return res.volumenNominal || 0;
      case "descripcion": return res.descripcion || "N/A";
      default: return ultimo;
    }
  } catch(e) { return "Error IOL"; }
}

// --- SECCIÓN: YAHOO FINANCE (YF) ---

/**
 * Obtiene el precio actual o info básica de Yahoo Finance.
 * @param {string} ticker Ticker (ej: "AAPL", "GGAL", "BTC-USD").
 * @param {string} tipo Opcional: "price" (defecto), "name", "currency", "exchange".
 * @customfunction
 */
function getDatoYF(ticker, tipo) {
  if (!ticker) return "Falta Ticker";
  tipo = tipo || "price";
  ticker = ticker.toString().trim().toUpperCase();
  
  try {
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker;
    var res = UrlFetchApp.fetch(url, { "headers": { "User-Agent": "Mozilla/5.0" } });
    var json = JSON.parse(res.getContentText());
    var meta = json.chart.result[0].meta;
    
    switch(tipo.toLowerCase()) {
      case "price": return meta.regularMarketPrice;
      case "name": return meta.symbol;
      case "currency": return meta.currency;
      case "exchange": return meta.exchangeName;
      default: return meta.regularMarketPrice;
    }
  } catch(e) { return "Error YF"; }
}

/**
 * Obtiene la SERIE HISTÓRICA de precios de Yahoo Finance.
 * Devuelve una tabla con Fecha y Precio de Cierre.
 * @param {string} ticker Ticker (ej: "AAPL").
 * @param {string} intervalo "1d", "1wk", "1mo".
 * @param {string} rango "1mo", "3mo", "1y", "5y", "max".
 * @customfunction
 */
function getHistoryYF(ticker, intervalo, rango) {
  if (!ticker) return "Falta Ticker";
  intervalo = intervalo || "1d";
  rango = rango || "1mo";
  
  try {
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker + "?interval=" + intervalo + "&range=" + rango;
    var res = UrlFetchApp.fetch(url, { "headers": { "User-Agent": "Mozilla/5.0" } });
    var json = JSON.parse(res.getContentText());
    
    var timestamps = json.chart.result[0].timestamp;
    var quotes = json.chart.result[0].indicators.adjclose[0].adjclose; // Usamos precio ajustado
    
    var result = [["Fecha", "Cierre Ajustado"]];
    
    for (var i = 0; i < timestamps.length; i++) {
      var date = new Date(timestamps[i] * 1000);
      // Formateamos la fecha a YYYY-MM-DD
      var dateStr = date.toISOString().split('T')[0];
      result.push([dateStr, quotes[i]]);
    }
    
    return result;
  } catch(e) {
    return "Error en serie histórica";
  }
}
