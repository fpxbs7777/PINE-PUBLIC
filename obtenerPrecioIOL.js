var USUARIO = 'xxxxx@gmail.com';
var PASS = 'xxxxx';

// Función para obtener el Token (equivalente a tu obtener_tokens)
function getIOLToken() {
  var url = 'https://api.invertironline.com/token';
  var payload = {
    'username': USUARIO,
    'password': PASS,
    'grant_type': 'password'
  };
  var options = {
    'method': 'post',
    'contentType': 'application/x-www-form-urlencoded',
    'payload': payload,
    'muteHttpExceptions': true
  };
  var response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText()).access_token;
}

/**
 * Busca el precio de un ticker en TODOS los paneles (como tu df_todos)
 * @param {string} ticker El símbolo (ej: "AE38", "GD30", "YPFD").
 * @customfunction
 */
function getPrecioIOL(ticker) {
  if (!ticker) return "";
  
  var token = getIOLToken();
  // Lista de instrumentos según tus funciones de Python
  var tipos = [
    {inst: 'titulosPublicos', pais: 'argentina'},
    {inst: 'obligacionesNegociables', pais: 'argentina'},
    {inst: 'acciones', pais: 'argentina'},
    {inst: 'cedears', pais: 'argentina'},
    {inst: 'acciones', pais: 'estados_unidos'}
  ];

  for (var i = 0; i < tipos.length; i++) {
    var url = "https://api.invertironline.com/api/v2/Cotizaciones/" + tipos[i].inst + "/" + tipos[i].pais + "/Todos";
    var options = {
      'method': 'get',
      'headers': {'Authorization': 'Bearer ' + token},
      'muteHttpExceptions': true
    };

    var response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      var data = JSON.parse(response.getContentText());
      // Buscamos el ticker dentro del array 'titulos' (como hacías con el DataFrame)
      var activo = data.titulos.find(t => t.simbolo === ticker);
      if (activo) {
        return activo.ultimoPrecio;
      }
    }
  }
  return "No encontrado";
}
