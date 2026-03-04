var USUARIO_IOL = 'XXXX@gmail.com';
var PASS_IOL = 'XXXXX'; 

function getIOLToken() {
  var url = 'https://api.invertironline.com/token';
  var payload = { 'username': USUARIO_IOL, 'password': PASS_IOL, 'grant_type': 'password' };
  var options = { 'method': 'post', 'contentType': 'application/x-www-form-urlencoded', 'payload': payload, 'muteHttpExceptions': true };
  var response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText()).access_token;
}

/**
 * FUNCIÓN DINÁMICA: Trae datos reales. Si hoy es 0, trae el cierre de la última rueda.
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
    
    // Si los datos de hoy están vacíos (Mercado cerrado), buscamos la última vela de la serie histórica
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
         var h = resHist[resHist.length - 1]; // Datos de la última rueda operada
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
      case "ytd":
        var anioPasado = new Date().getFullYear() - 1;
        var urlYTD = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + anioPasado + "-12-26/" + anioPasado + "-12-31/SinAjustar";
        var resYTD = JSON.parse(UrlFetchApp.fetch(urlYTD, {'headers': {'Authorization': 'Bearer ' + token}}).getContentText());
        if (resYTD && resYTD.length > 0) {
          return (ultimo / resYTD[resYTD.length - 1].ultimoPrecio) - 1;
        }
        return "N/A";
      default: return ultimo;
    }
  } catch(e) { return "Error"; }
}
