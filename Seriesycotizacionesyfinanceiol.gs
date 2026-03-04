var USUARIO = 'xxxxx@gmail.com';
var PASS = 'xxxx'; 

// ==========================================
// 1. NÚCLEO: AUTENTICACIÓN IOL
// ==========================================
function getIOLToken() {
  var url = 'https://api.invertironline.com/token';
  var payload = { 'username': USUARIO, 'password': PASS, 'grant_type': 'password' };
  var options = {
    'method': 'post',
    'contentType': 'application/x-www-form-urlencoded',
    'payload': payload,
    'muteHttpExceptions': true
  };
  var response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText()).access_token;
}

// ==========================================
// 2. PRECIOS EN TIEMPO REAL (Para el MEP)
// ==========================================

/**
 * Obtiene el precio actual de IOL.
 * @customfunction
 */
function getPrecioIOL(ticker, mercado) {
  if (!ticker) return "";
  var token = getIOLToken();
  var mkt = mercado || "BCBA";
  
  var paneles = (mkt === "BCBA") ? ['cedears', 'titulosPublicos', 'acciones'] : ['acciones'];
  var pais = (mkt === "BCBA") ? 'argentina' : 'estados_unidos';

  for (var i = 0; i < paneles.length; i++) {
    var url = "https://api.invertironline.com/api/v2/Cotizaciones/" + paneles[i] + "/" + pais + "/Todos";
    var res = UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}, 'muteHttpExceptions': true});
    if (res.getResponseCode() === 200) {
      var data = JSON.parse(res.getContentText());
      var activo = data.titulos.find(t => t.simbolo === ticker.toUpperCase());
      if (activo) return Number(activo.ultimoPrecio);
    }
  }
  return "No encontrado";
}

/**
 * Obtiene el precio actual de Yahoo Finance.
 * @customfunction
 */
function getPrecioYF(ticker) {
  if (!ticker) return "";
  try {
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(ticker.toUpperCase());
    var res = JSON.parse(UrlFetchApp.fetch(url).getContentText());
    return Number(res.chart.result[0].meta.regularMarketPrice);
  } catch(e) { return "Error"; }
}

// ==========================================
// 3. SERIES HISTÓRICAS (TABLAS)
// ==========================================

/**
 * Serie Histórica de IOL.
 * @customfunction
 */
function getSerieIOL(mercado, simbolo, desde, hasta) {
  var token = getIOLToken();
  var fDesde = (desde instanceof Date) ? desde.toISOString().split('T')[0] : desde;
  var fHasta = (hasta instanceof Date) ? hasta.toISOString().split('T')[0] : hasta;

  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + fDesde + "/" + fHasta + "/SinAjustar";
  
  var res = UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}, 'muteHttpExceptions': true});
  var data = JSON.parse(res.getContentText());
  
  if (!Array.isArray(data)) return "Error IOL: Datos no encontrados";

  var resultado = [["Fecha", "Cierre", "Max", "Min", "Volumen"]];
  data.forEach(function(f) {
    resultado.push([f.fechaHora.split("T")[0], f.ultimoPrecio, f.maximo, f.minimo, f.volumenNominal]);
  });
  return resultado;
}

/**
 * Serie Histórica de Yahoo Finance (Versión API v8 - Más estable)
 * @customfunction
 */
function getSerieYF(ticker, desde, hasta) {
  if (!ticker) return "Falta Ticker";
  try {
    var d1 = Math.floor(new Date(desde).getTime() / 1000);
    var d2 = Math.floor(new Date(hasta).getTime() / 1000);
    
    // Usamos el endpoint de CHART en lugar del de DOWNLOAD (CSV) porque es menos probable que Yahoo lo bloquee
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(ticker.toUpperCase()) + 
              "?period1=" + d1 + "&period2=" + d2 + "&interval=1d&events=history";
    
    var response = UrlFetchApp.fetch(url);
    var json = JSON.parse(response.getContentText());
    var result = json.chart.result[0];
    
    var timestamps = result.timestamp;
    var prices = result.indicators.quote[0];
    
    if (!timestamps) return "No hay datos para ese rango";

    var tabla = [["Fecha", "Open", "High", "Low", "Close", "Volume"]];
    for (var i = 0; i < timestamps.length; i++) {
      var fecha = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
      tabla.push([
        fecha, 
        prices.open[i], 
        prices.high[i], 
        prices.low[i], 
        prices.close[i], 
        prices.volume[i]
      ]);
    }
    return tabla;
    
  } catch(e) {
    return "Error Yahoo: " + e.message;
  }
}
