/**
 * CONFIGURACIÓN DE CREDENCIALES IOL
 * Nota: Es recomendable no dejar contraseñas en texto plano, 
 * pero mantengo tu estructura por compatibilidad.
 */
var USUARIO_IOL = 'xxxx@gmail.com';
var PASS_IOL = 'xxxxx'; 

function getIOLToken() {
  var url = 'https://api.invertironline.com/token';
  var payload = { 'username': USUARIO_IOL, 'password': PASS_IOL, 'grant_type': 'password' };
  var options = { 'method': 'post', 'contentType': 'application/x-www-form-urlencoded', 'payload': payload, 'muteHttpExceptions': true };
  var response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response.getContentText());
  return json.access_token;
}

/**
 * Obtiene datos actuales evitando el error de valores en 0.
 * @customfunction
 */
function getDatoIOL(mercado, simbolo, dato) {
  if (!simbolo) return "";
  var token = getIOLToken();
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion";
  
  try {
    var response = UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}, 'muteHttpExceptions': true});
    var res = JSON.parse(response.getContentText());
    
    // Si la API falla o el activo no existe
    if (!res || res.ultimoPrecio === undefined) return "N/A";

    // LÓGICA DE CORRECCIÓN: Si los datos clave son 0, buscamos el último cierre histórico.
    // Esto sucede en el pre-market o cuando no hubo operaciones hoy aún.
    if (res.ultimoPrecio === 0 || res.precioApertura === 0) {
       var hoy = new Date();
       var hace7dias = new Date(hoy.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
       var hoyStr = hoy.toISOString().split('T')[0];
       var urlHist = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + hace7dias + "/" + hoyStr + "/SinAjustar";
       var resHist = JSON.parse(UrlFetchApp.fetch(urlHist, {'headers': {'Authorization': 'Bearer ' + token}}).getContentText());
       
       if (resHist && resHist.length > 0) {
         var h = resHist[resHist.length - 1]; // El día más reciente con datos reales
         res.ultimoPrecio = h.ultimoPrecio;
         res.precioApertura = h.apertura;
         res.maximo = h.maximo;
         res.minimo = h.minimo;
         res.volumenNominal = h.volumenNominal;
         res.cierreAnterior = resHist.length > 1 ? resHist[resHist.length - 2].ultimoPrecio : h.apertura;
       }
    }

    switch(dato.toLowerCase()) {
      case "ultimo": return res.ultimoPrecio;
      case "apertura": return res.precioApertura;
      case "maximo": return res.maximo;
      case "minimo": return res.minimo;
      case "volumen": return res.volumenNominal || 0;
      case "var": return (res.cierreAnterior > 0) ? (res.ultimoPrecio / res.cierreAnterior) - 1 : 0;
      case "descripcion": return res.descripcion || "N/A";
      case "fecha": return res.fechaHora ? res.fechaHora.split("T")[0] : "";
      default: return res.ultimoPrecio;
    }
  } catch(e) { return "Error IOL"; }
}

/**
 * Obtiene la SERIE HISTÓRICA incluyendo VOLUMEN.
 * @customfunction
 */
function getHistoryIOL(mercado, simbolo, desde, hasta) {
  if (!simbolo || !mercado || !desde || !hasta) return "Faltan parámetros";
  
  // Formatear fechas si vienen como objetos de Google Sheets
  if (desde instanceof Date) desde = desde.toISOString().split('T')[0];
  if (hasta instanceof Date) hasta = hasta.toISOString().split('T')[0];

  var token = getIOLToken();
  var url = "https://api.invertironline.com/api/v2/" + mercado + "/Titulos/" + simbolo + "/Cotizacion/seriehistorica/" + desde + "/" + hasta + "/SinAjustar";
  
  try {
    var response = UrlFetchApp.fetch(url, {'headers': {'Authorization': 'Bearer ' + token}});
    var data = JSON.parse(response.getContentText());
    
    // Agregamos la columna "Volumen" al encabezado
    var result = [["Fecha", "Cierre", "Volumen", "Variación %"]];
    
    for (var i = 0; i < data.length; i++) {
      var h = data[i];
      // Cálculo de variación respecto al día anterior de la serie
      var varDiaria = (i > 0 && data[i-1].ultimoPrecio !== 0) ? (h.ultimoPrecio / data[i-1].ultimoPrecio) - 1 : 0;
      
      result.push([
        h.fechaHora.split("T")[0], 
        h.ultimoPrecio, 
        h.volumenNominal, // <--- Nueva columna
        varDiaria
      ]);
    }
    return result;
  } catch(e) { return "Error Histórico IOL"; }
}
