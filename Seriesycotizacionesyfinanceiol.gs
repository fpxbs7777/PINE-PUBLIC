/**
 * CONFIGURACIÓN DE CREDENCIALES IOL
 */
var USUARIO_IOL = 'xxxx@gmail.com';
var PASS_IOL = 'xxxxx'; 

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
 * Obtiene datos actuales de IOL (Precio, Variación, Volumen, etc.)
 * @param {"BCBA"} mercado Mercado (BCBA, NYSE, NASDAQ).
 * @param {"AL30"} simbolo Ticker del activo.
 * @param {"ultimo"} dato Tipo de dato: "ultimo", "var", "apertura", "minimo", "maximo", "volumen".
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

    if (res.ultimoPrecio === 0 || res.precioApertura === 0) {
       var hoy = new Date();
       var hace5dias = new Date(hoy.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
       var hoyStr = hoy.toISOString().split('T')[0];
       var urlHist = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + hace5dias + "/" + hoyStr + "/SinAjustar";
       var resHist = JSON.parse(UrlFetchApp.fetch(urlHist, {'headers': {'Authorization': 'Bearer ' + token}}).getContentText());
       
       if (resHist && resHist.length > 0) {
         var h = resHist[resHist.length - 1];
         res.ultimoPrecio = h.ultimoPrecio;
         res.precioApertura = h.apertura;
         res.maximo = h.maximo;
         res.minimo = h.minimo;
         res.volumenNominal = h.volumenNominal;
       }
    }

    switch(dato.toLowerCase()) {
      case "ultimo": return res.ultimoPrecio > 0 ? res.ultimoPrecio : res.cierreAnterior;
      case "var": return (res.cierreAnterior > 0) ? (res.ultimoPrecio / res.cierreAnterior) - 1 : 0;
      case "apertura": return res.precioApertura;
      case "minimo": return res.minimo;
      case "maximo": return res.maximo;
      case "volumen": return res.volumenNominal || 0;
      case "descripcion": return res.descripcion || "N/A";
      case "fecha": return res.fechaHora ? res.fechaHora.split("T")[0] : "";
      default: return res.ultimoPrecio;
    }
  } catch(e) { return "Error IOL"; }
}

/**
 * Obtiene serie histórica de IOL.
 * @param {"BCBA"} mercado Mercado (BCBA, NYSE).
 * @param {"GGAL"} simbolo Ticker.
 * @param {"2024-01-01"} desde Fecha inicio.
 * @param {"2024-02-01"} hasta Fecha fin.
 * @customfunction
 */
function getHistoryIOL(mercado, simbolo, desde, hasta) {
  if (!simbolo || !mercado || !desde || !hasta) return "Faltan parámetros";
  if (desde instanceof Date) desde = Utilities.formatDate(desde, "GMT", "yyyy-MM-dd");
  if (hasta instanceof Date) hasta = Utilities.formatDate(hasta, "GMT", "yyyy-MM-dd");

  var token = getIOLToken();
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + desde + "/" + hasta + "/SinAjustar";
  
  try {
    var response = UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}});
    var data = JSON.parse(response.getContentText());
    var result = [["Fecha", "Cierre", "Volumen", "Variación %"]];
    
    for (var i = 0; i < data.length; i++) {
      var h = data[i];
      var varDiaria = (i > 0 && data[i-1].ultimoPrecio !== 0) ? (h.ultimoPrecio / data[i-1].ultimoPrecio) - 1 : 0;
      result.push([h.fechaHora.split("T")[0], h.ultimoPrecio, h.volumenNominal, varDiaria]);
    }
    return result;
  } catch(e) { return "Error Histórico IOL"; }
}

// ==========================================
//   SECCIÓN 2: YAHOO FINANCE (YF)
// ==========================================

/**
 * Obtiene datos actuales de Yahoo Finance (Precio, Nombre, Moneda).
 * @param {"AAPL"} ticker El ticker del activo (ej: "AAPL", "GGAL.BA").
 * @param {"price"} dato El tipo de dato: "price", "name", "currency".
 * @customfunction
 */
function getDatoYF(ticker, dato) {
  if (!ticker) return "";
  ticker = ticker.toString().trim().toUpperCase();
  try {
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker;
    var res = UrlFetchApp.fetch(url, { "headers": { "User-Agent": "Mozilla/5.0" }, "muteHttpExceptions": true });
    var json = JSON.parse(res.getContentText());
    
    if (!json.chart || !json.chart.result) return "Ticker no encontrado";
    var meta = json.chart.result[0].meta;
    
    switch((dato || "price").toLowerCase()) {
      case "price": return meta.regularMarketPrice;
      case "name": return meta.symbol;
      case "currency": return meta.currency;
      default: return meta.regularMarketPrice;
    }
  } catch(e) { return "Error YF"; }
}

/**
 * Obtiene el historial de precios y volumen de Yahoo Finance.
 * @param {"TSLA"} ticker El ticker del activo (ej: "TSLA").
 * @param {"2024-01-01"} desde Fecha de inicio.
 * @param {"2024-02-01"} hasta Fecha de fin.
 * @customfunction
 */
function getHistoryYF(ticker, desde, hasta) {
  if (!ticker || !desde || !hasta) return "Faltan parámetros";
  
  var p1 = Math.floor(new Date(desde).getTime() / 1000);
  var p2 = Math.floor(new Date(hasta).getTime() / 1000);
  
  try {
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker + "?period1=" + p1 + "&period2=" + p2 + "&interval=1d";
    var res = UrlFetchApp.fetch(url, { "headers": { "User-Agent": "Mozilla/5.0" }, "muteHttpExceptions": true });
    var json = JSON.parse(res.getContentText());
    
    if (!json.chart || !json.chart.result) return "Sin datos";
    
    var resultData = json.chart.result[0];
    var time = resultData.timestamp;
    var close = resultData.indicators.adjclose[0].adjclose;
    var vol = resultData.indicators.quote[0].volume;
    
    var result = [["Fecha", "Cierre Adj", "Volumen", "Variación %"]];
    for (var i = 0; i < time.length; i++) {
      var v = (i > 0 && close[i-1]) ? (close[i] / close[i-1]) - 1 : 0;
      var fecha = new Date(time[i] * 1000);
      result.push([Utilities.formatDate(fecha, "GMT", "yyyy-MM-dd"), close[i], vol[i], v]);
    }
    return result;
  } catch(e) { return "Error Histórico YF"; }
}
