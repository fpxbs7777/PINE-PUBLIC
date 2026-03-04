/**
 * CONFIGURACIÓN DE CREDENCIALES IOL
 */
var USUARIO_IOL = 'xxxx@gmail.com';
var PASS_IOL = 'xxxx'; 

// ==========================================
//   SECCIÓN 1: INVERTIRONLINE (IOL)
// ==========================================

/**
 * Obtiene el token de acceso para la API de IOL.
 */
function getIOLToken() {
  var url = 'https://api.invertironline.com/token';
  var payload = { 'username': USUARIO_IOL, 'password': PASS_IOL, 'grant_type': 'password' };
  var options = { 'method': 'post', 'contentType': 'application/x-www-form-urlencoded', 'payload': payload, 'muteHttpExceptions': true };
  var response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText()).access_token;
}

/**
 * Obtiene datos específicos de un activo en IOL (ultimo, var, ytm, etc.).
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

    // Si no hay datos del día (mercado cerrado), intenta buscar el último histórico
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
 * Obtiene la SERIE HISTÓRICA de IOL con Variación Diaria.
 * @customfunction
 */
function getHistoryIOL(mercado, simbolo, desde, hasta) {
  if (!simbolo || !mercado || !desde || !hasta) return "Faltan parámetros";
  var token = getIOLToken();
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + desde + "/" + hasta + "/SinAjustar";
  
  try {
    var response = UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}});
    var data = JSON.parse(response.getContentText());
    var result = [["Fecha", "Cierre", "Variación %"]];
    
    for (var i = 0; i < data.length; i++) {
      var h = data[i];
      var varDiaria = (i > 0 && data[i-1].ultimoPrecio !== 0) ? (h.ultimoPrecio / data[i-1].ultimoPrecio) - 1 : 0;
      result.push([h.fechaHora.split("T")[0], h.ultimoPrecio, varDiaria]);
    }
    return result;
  } catch(e) { return "Error Histórico IOL"; }
}

// ==========================================
//   SECCIÓN 2: YAHOO FINANCE (YF)
// ==========================================

/**
 * Obtiene precio o info básica de Yahoo Finance.
 * @customfunction
 */
function getDatoYF(ticker, dato) {
  if (!ticker) return "";
  ticker = ticker.toString().trim().toUpperCase();
  dato = dato || "price";
  
  try {
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker;
    var res = UrlFetchApp.fetch(url, { "headers": { "User-Agent": "Mozilla/5.0" } });
    var json = JSON.parse(res.getContentText());
    var meta = json.chart.result[0].meta;
    
    switch(dato.toLowerCase()) {
      case "price": return meta.regularMarketPrice;
      case "name": return meta.symbol;
      case "currency": return meta.currency;
      case "exchange": return meta.exchangeName;
      default: return meta.regularMarketPrice;
    }
  } catch(e) { return "Error YF"; }
}

/**
 * Obtiene la SERIE HISTÓRICA de Yahoo Finance (Fecha a Fecha).
 * @customfunction
 */
function getHistoryYF(ticker, desde, hasta) {
  if (!ticker || !desde || !hasta) return "Faltan parámetros";
  var p1 = Math.floor(new Date(desde).getTime() / 1000);
  var p2 = Math.floor(new Date(hasta).getTime() / 1000);
  
  try {
    var url = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker + "?period1=" + p1 + "&period2=" + p2 + "&interval=1d";
    var res = UrlFetchApp.fetch(url, { "headers": { "User-Agent": "Mozilla/5.0" } });
    var json = JSON.parse(res.getContentText());
    var time = json.chart.result[0].timestamp;
    var close = json.chart.result[0].indicators.adjclose[0].adjclose;
    
    var result = [["Fecha", "Cierre Adj", "Variación %"]];
    for (var i = 0; i < time.length; i++) {
      var v = (i > 0 && close[i-1]) ? (close[i] / close[i-1]) - 1 : 0;
      result.push([new Date(time[i]*1000).toISOString().split('T')[0], close[i], v]);
    }
    return result;
  }  catch(e) { return "Error Histórico YF"; }
}/**
 * Obtiene un dato de cotización a una fecha determinada.
 * Si no se especifica fecha, trae el dato actual.
 * * @param {string} mercado "BCBA", "NYSE", etc.
 * @param {string} simbolo Ticker (ej: "AL30").
 * @param {string} dato Atributo deseado: "ultimo" (precio cierre), "apertura", "maximo", "minimo", "volumen".
 * @param {string} fecha [Opcional] Formato "YYYY-MM-DD". Si se omite, trae el actual.
 * @customfunction
 */
function getDatoIOLHistorico(mercado, simbolo, dato, fecha) {
  if (!simbolo || !mercado) return "Faltan parámetros";
  
  var token = getIOLToken();
  if (!token) return "Error Auth";

  mercado = mercado.toString().toUpperCase().trim();
  simbolo = simbolo.toString().toUpperCase().trim();
  dato = dato.toLowerCase().trim();

  // CASO 1: Si NO hay fecha, usamos el endpoint de cotización actual
  if (!fecha || fecha === "") {
    return getDatoIOL(mercado, simbolo, dato); // Llama a tu función existente
  }

  // CASO 2: Si HAY fecha, accedemos a la serie histórica
  var fechaFinStr;
  var fechaInicioStr;

  try {
    var d = new Date(fecha);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    fechaFinStr = Utilities.formatDate(d, "GMT", "yyyy-MM-dd");
    
    // Pedimos un rango de 5 días hacia atrás por si la fecha elegida fue feriado/finde
    var dInicio = new Date(d);
    dInicio.setDate(d.getDate() - 5);
    fechaInicioStr = Utilities.formatDate(dInicio, "GMT", "yyyy-MM-dd");
  } catch(e) { return "Fecha Inválida"; }

  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + fechaInicioStr + "/" + fechaFinStr + "/SinAjustar";
  
  try {
    var response = UrlFetchApp.fetch(url, {
      'headers': {'Authorization': 'Bearer ' + token},
      'muteHttpExceptions': true
    });
    
    var data = JSON.parse(response.getContentText());
    
    if (data && data.length > 0) {
      // Tomamos el último registro disponible en el rango (que es el más cercano a la fecha pedida)
      var registro = data[data.length - 1];
      
      switch(dato) {
        case "ultimo": return registro.ultimoPrecio;
        case "apertura": return registro.apertura;
        case "maximo": return registro.maximo;
        case "minimo": return registro.minimo;
        case "volumen": return registro.volumenNominal;
        case "fecha_real": return registro.fechaHora.split("T")[0]; // Para saber qué día trajo realmente
        default: return registro.ultimoPrecio;
      }
    }
    return "Sin datos";
  } catch(e) { return "Error API"; }
}
