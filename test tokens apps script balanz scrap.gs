function testToken() {
  const token = PropertiesService.getUserProperties().getProperty('balanz_token');
  const cuenta = PropertiesService.getUserProperties().getProperty('balanz_id_cuenta');
  
  Logger.log("Token guardado: " + token);
  Logger.log("Cuenta: " + cuenta);
  
  const url = `https://clientes.balanz.com/api/v1/cotizacioninstrumento?idCuenta=${cuenta}&ticker=GGAL`;
  
  const resp = UrlFetchApp.fetch(url, {
    method: "GET",
    headers: {
      "authorization": token,
      "accept": "application/json",
      "content-type": "application/json",
      "lang": "es",
      "origin": "https://clientes.balanz.com",
      "referer": "https://clientes.balanz.com/",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    },
    muteHttpExceptions: true,
  });
  
  Logger.log("HTTP Code: " + resp.getResponseCode());
  Logger.log("Respuesta: " + resp.getContentText().substring(0, 500));
}
