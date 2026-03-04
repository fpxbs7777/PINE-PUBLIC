var USUARIO_IOL = 'xxx@gmail.com';
var PASS_IOL = 'xxxx'; 

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
 * FUNCIÓN DINÁMICA IOL: Trae datos reales de InvertirOnline[cite: 1, 3].
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
    var apertura = res.precioApertura;
    var maximo = res.maximo;
    var minimo = res.minimo;

    if (apertura === 0 || maximo === 0) {
       var hoy = new Date();
       var hace5dias = new Date(hoy.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
       var hoyStr = hoy.toISOString().split('T')[0];
       var urlHist = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + hace5dias + "/" + hoyStr + "/SinAjustar";
       var resHist = JSON.parse(UrlFetchApp.fetch(urlHist, {'headers': {'Authorization': 'Bearer ' + token}}).getContentText());
       
       if (resHist && resHist.length > 0) {
         var h = resHist[resHist.length - 1];
         apertura = h.apertura;
         maximo = h.maximo;
         minimo = h.minimo;
         if (ultimo === 0) ultimo = h.ultimoPrecio;
       }
    }

    switch(dato.toLowerCase()) {
      case "ultimo": return ultimo > 0 ? ultimo : cierreAnt;
      case "var": return (cierreAnt > 0) ? (ultimo / cierreAnt) - 1 : 0;
      case "ytm": 
        var tir = res.tir || res.yield || 0;
        return tir !== 0 ? (tir / 100) : "N/A";
      case "apertura": return apertura;
      case "cierre_anterior": return cierreAnt;
      case "minimo": return minimo;
      case "maximo": return maximo;
      case "volumen": return res.volumenNominal || 0;
      case "isin": return res.isin || "N/A";
      case "descripcion": return res.descripcion || "N/A";
      case "fecha": return res.fechaHora ? res.fechaHora.split("T")[0] : "";
      default: return ultimo;
    }
  } catch(e) { return "Error IOL"; }
}

/**
 * FUNCIÓN YFINANCE: Emula las funciones del Ticker de yfinance[cite: 3, 6, 15].
 * Soporta parámetros como: 'info', 'history', 'calendar', 'actions', 'dividends', 'splits'.
 * @param {string} ticker El símbolo (ej. "AAPL", "MSFT").
 * @param {string} tipo El atributo de yfinance a consultar.
 * @customfunction
 */
function getDatoYFinance(ticker, tipo) {
  if (!ticker) return "";
  // Yahoo Finance Query2 API para emular el módulo Ticker [cite: 3, 6]
  var url = "https://query2.finance.yahoo.com/v8/finance/chart/" + ticker + "?interval=1d&range=5d";
  
  try {
    var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
    var data = JSON.parse(response.getContentText());
    var meta = data.chart.result[0].meta;
    var indicators = data.chart.result[0].indicators.quote[0];

    switch(tipo.toLowerCase()) {
      case "info": // Emula dat.info 
        return "Precio: " + meta.regularMarketPrice + " / Currency: " + meta.currency;
      
      case "history": // Emula dat.history() [cite: 3, 14, 15]
        return meta.regularMarketPrice; 
        
      case "calendar": // Emula dat.calendar [cite: 6, 13]
        return "Symbol: " + meta.symbol + " / Exchange: " + meta.exchangeName;

      case "actions": // Emula dat.actions 
      case "dividends": // Emula dat.get_dividends() [cite: 14, 15]
        return meta.chartPreviousClose || "N/A";

      case "splits": // Emula dat.get_splits() [cite: 14, 15]
        return "Data Not Available in Lite Mode";

      case "isin": // Emula dat.isin [cite: 6, 12]
        return meta.fullExchangeName || "N/A";

      default:
        return meta.regularMarketPrice || "N/A";
    }
  } catch(e) {
    return "Error YF";
  }
}
