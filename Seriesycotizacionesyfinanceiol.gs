var USUARIO = 'XXXX@gmail.com';
var PASS = 'XXXX'; 

// --- 1. OBTENCIÓN DE TOKEN IOL ---
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

// --- 2. SERIE HISTÓRICA IOL ---
/**
 * @customfunction
 */
function getSerieIOL(mercado, simbolo, desde, hasta) {
  var token = getIOLToken();
  var fDesde = (desde instanceof Date) ? desde.toISOString().split('T')[0] : desde;
  var fHasta = (hasta instanceof Date) ? hasta.toISOString().split('T')[0] : hasta;

  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + fDesde + "/" + fHasta + "/SinAjustar";
  
  var options = {
    'method': 'get',
    'headers': {'Authorization': 'Bearer ' + token},
    'muteHttpExceptions': true
  };

  var response = UrlFetchApp.fetch(url, options);
  var data = JSON.parse(response.getContentText());
  
  if (!data || data.length === 0 || !data.forEach) return "Sin datos";

  var resultado = [["Fecha", "Cierre", "Max", "Min", "Volumen"]];
  data.forEach(function(f) {
    resultado.push([f.fechaHora.split("T")[0], f.ultimoPrecio, f.maximo, f.minimo, f.volumenNominal]);
  });
  return resultado;
}

// --- 3. SERIE HISTÓRICA YFINANCE ---
/**
 * Simula el comportamiento de yfinance.history()
 * @param {"AAPL"} ticker Ticker (ej: "AAPL", "GGAL.BA", "ARS=X").
 * @param {"2025-01-01"} desde Fecha inicio.
 * @param {"2026-03-01"} hasta Fecha fin.
 * @customfunction
 */
function getSerieYF(ticker, desde, hasta) {
  // Yahoo requiere fechas en formato Unix Timestamp (segundos)
  var d1 = Math.floor(new Date(desde).getTime() / 1000);
  var d2 = Math.floor(new Date(hasta).getTime() / 1000);
  
  var url = "https://query1.finance.yahoo.com/v7/finance/download/" + ticker + "?period1=" + d1 + "&period2=" + d2 + "&interval=1d&events=history";
  
  try {
    var response = UrlFetchApp.fetch(url);
    var csvData = Utilities.parseCsv(response.getContentText());
    return csvData; // Retorna la tabla: Date, Open, High, Low, Close, Adj Close, Volume
  } catch(e) {
    return "Error: Ticker no encontrado en Yahoo Finance";
  }
}

// --- 4. PRECIOS ACTUALES (Para cálculos de MEP / Divisas) ---

/**
 * Precio actual de IOL (para MEP)
 * @customfunction
 */
function getPrecioIOL(ticker) {
  if (!ticker) return 0;
  var token = getIOLToken();
  var url = "https://api.invertironline.com/api/v2/Cotizaciones/titulosPublicos/argentina/Todos";
  var res = UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}});
  var data = JSON.parse(res.getContentText());
  var activo = data.titulos.find(t => t.simbolo === ticker);
  return activo ? Number(activo.ultimoPrecio) : "No encontrado";
}

/**
 * Precio actual de Yahoo Finance (para Dólar Oficial o Cedears)
 * @param {"ARS=X"} ticker Ticker (ej: "ARS=X", "AAPL").
 * @customfunction
 */
function getPrecioYF(ticker) {
  if (!ticker) return 0;
  try {
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker;
    var res = UrlFetchApp.fetch(url);
    var json = JSON.parse(res.getContentText());
    return Number(json.chart.result[0].meta.regularMarketPrice);
  } catch(e) {
    return "Error";
  }
}
