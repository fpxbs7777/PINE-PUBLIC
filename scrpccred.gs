/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║           BALANZ - Funciones personalizadas Google Sheets        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                  ║
 * ║  FÓRMULAS DISPONIBLES:                                           ║
 * ║                                                                  ║
 * ║  =BALANZ_PRECIO("AL30D")      → Precio limpio                   ║
 * ║  =BALANZ_TIR("AL30D")         → TIR / YTM                       ║
 * ║  =BALANZ_TNA("AL30D")         → Tasa nominal anual              ║
 * ║  =BALANZ_PARIDAD("AL30D")     → Paridad                         ║
 * ║  =BALANZ_DURATION("AL30D")    → Duration                        ║
 * ║  =BALANZ_CONVEXITY("AL30D")   → Convexity                       ║
 * ║  =BALANZ_CY("AL30D")          → Current Yield                   ║
 * ║  =BALANZ_NOMBRE("AL30D")      → Nombre del bono                 ║
 * ║                                                                  ║
 * ║  =BALANZ_FILA("AL30D")        → Todos los datos en una fila     ║
 * ║  =BALANZ_HEADER()             → Cabecera para BALANZ_FILA       ║
 * ║  =BALANZ("AL30D","tir")       → Campo específico                ║
 * ║                                                                  ║
 * ║  SETUP (una sola vez):                                           ║
 * ║  1. Extensiones → Apps Script → pegá este código                ║
 * ║  2. Guardá (Ctrl+S)                                              ║
 * ║  3. Volvé al Sheet y recargá (F5)                                ║
 * ║  4. Listo — el token se renueva solo automáticamente            ║
 * ║                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────

const ID_CUENTA = "96552";
const BALANZ_USER = "cboos";
const BALANZ_PASS = "_";
const ID_DISPOSITIVO = "5b8a6cdc-f775-4e85-9ded-7fb213a52ac9";

// ─── MENÚ ────────────────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📊 Balanz")
    .addItem("📖 Instrucciones", "mostrarInstrucciones")
    .addToUi();
}

// ─── INSTRUCCIONES ───────────────────────────────────────────────────────────

function mostrarInstrucciones() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 16px; font-size: 13px; color: #222; }
      h2   { color: #1a3a5c; margin-bottom: 4px; }
      h3   { color: #1a3a5c; margin-top: 16px; margin-bottom: 6px; }
      code { background: #f0f4fa; padding: 2px 6px; border-radius: 3px; font-size: 12px; display:inline-block; margin: 2px 0; }
      .ok  { color: #2d6a4f; font-weight: bold; }
      ul   { padding-left: 18px; }
      li   { margin-bottom: 5px; }
      .box { background:#f0f4fa; border-left:3px solid #1a3a5c; padding:10px 14px; margin:8px 0; border-radius:3px; line-height:1.8; }
      .green { background:#f0fff4; border-left:3px solid #2d6a4f; padding:8px 12px; border-radius:3px; margin:8px 0; }
    </style>

    <h2>📊 Balanz para Google Sheets</h2>

    <div class="green">
      ✅ <b>Token automático</b> — no necesitás renovarlo manualmente. El script se loguea solo.
    </div>

    <h3>Fórmulas individuales</h3>
    <div class="box">
      <code>=BALANZ_PRECIO("AL30D")</code> Precio<br>
      <code>=BALANZ_TIR("AL30D")</code> TIR / YTM<br>
      <code>=BALANZ_TNA("AL30D")</code> Tasa Nominal Anual<br>
      <code>=BALANZ_PARIDAD("AL30D")</code> Paridad<br>
      <code>=BALANZ_DURATION("AL30D")</code> Duration<br>
      <code>=BALANZ_CONVEXITY("AL30D")</code> Convexity<br>
      <code>=BALANZ_CY("AL30D")</code> Current Yield<br>
      <code>=BALANZ_NOMBRE("AL30D")</code> Nombre del bono
    </div>

    <h3>Fila completa</h3>
    <div class="box">
      <code>=BALANZ_HEADER()</code> → cabecera (poné en fila 1)<br>
      <code>=BALANZ_FILA("AL30D")</code> → todos los datos expandidos
    </div>

    <h3>Setup nuevo usuario</h3>
    <ul>
      <li>Extensiones → Apps Script → pegá el código</li>
      <li>Guardá con Ctrl+S</li>
      <li>Recargá el Sheet (F5)</li>
      <li><span class="ok">✅ Listo — funciona sin configuración adicional</span></li>
    </ul>
  `)
  .setTitle('📊 Balanz — Instrucciones')
  .setWidth(400)
  .setHeight(460);
  SpreadsheetApp.getUi().showSidebar(html);
}

// ─── LOGIN AUTOMÁTICO ─────────────────────────────────────────────────────────

function generarUUID_() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase();
  });
}

function loginBalanz_() {
  const payload = {
    user:            BALANZ_USER,
    pass:            BALANZ_PASS,
    nonce:           generarUUID_(),
    source:          "WebV2",
    idDispositivo:   ID_DISPOSITIVO,
    TipoDispositivo: "Web",
    sc:              1,
    Nombre:          "Windows 11 Chrome 145.0.0.0",
    SistemaOperativo:"Windows",
    VersionSO:       "11",
    VersionAPP:      "2.32.5",
  };

  const response = UrlFetchApp.fetch(
    "https://clientes.balanz.com/api/v1/auth/login?avoidAuthRedirect=true",
    {
      method: "POST",
      headers: {
        "accept":       "application/json",
        "content-type": "application/json",
        "origin":       "https://clientes.balanz.com",
        "referer":      "https://clientes.balanz.com/",
        "user-agent":   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    }
  );

  const code = response.getResponseCode();
  if (code !== 200) throw new Error("Login fallido HTTP " + code);

  const json = JSON.parse(response.getContentText());
  const token = json.AccessToken;
  if (!token) throw new Error("Login OK pero no vino AccessToken");

  // Guardar token para todos los usuarios
  PropertiesService.getScriptProperties().setProperty('balanz_token', token);
  PropertiesService.getScriptProperties().setProperty('balanz_token_ts', String(Date.now()));

  return token;
}

// ─── HELPER: obtener token (renueva si vence) ─────────────────────────────────

function getToken_() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('balanz_token');
  const ts    = parseInt(props.getProperty('balanz_token_ts') || '0');
  const ahora = Date.now();
  const horasTranscurridas = (ahora - ts) / (1000 * 60 * 60);

  // Si no hay token o pasaron más de 7hs, renovar
  if (!token || horasTranscurridas > 7) {
    return loginBalanz_();
  }

  return token;
}

// ─── FETCH ───────────────────────────────────────────────────────────────────

function fetchBondData_(ticker) {
  let token = getToken_();

  const makeRequest_ = (t) => UrlFetchApp.fetch(
    `https://clientes.balanz.com/api/v1/cotizacioninstrumento?idCuenta=${ID_CUENTA}&ticker=${encodeURIComponent(ticker)}`,
    {
      method: "GET",
      headers: {
        "authorization":  t,
        "accept":         "application/json",
        "content-type":   "application/json",
        "lang":           "es",
        "referer":        "https://clientes.balanz.com/app/detalleinstrumento?ticker=" + ticker,
        "origin":         "https://clientes.balanz.com",
        "user-agent":     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "cache-control":  "no-cache",
        "pragma":         "no-cache",
      },
      muteHttpExceptions: true,
    }
  );

  let response = makeRequest_(token);
  let code     = response.getResponseCode();
  let body     = response.getContentText();

  // Si el token venció, renovar y reintentar una vez
  if (code === 403 || body.includes("Sesion%20Expirada") || body.includes("CodigoError=-1001")) {
    token    = loginBalanz_();
    response = makeRequest_(token);
    code     = response.getResponseCode();
    body     = response.getContentText();
  }

  if (code !== 200) throw new Error("HTTP " + code + " para " + ticker);

  return parseResponse_(JSON.parse(body), ticker);
}

// ─── PARSE ───────────────────────────────────────────────────────────────────

function parseResponse_(json, ticker) {
  if (!json) throw new Error("Respuesta vacía");
  const bond  = json.bond       || {};
  const cotiz = json.Cotizacion || {};

  function pct(val) {
    if (!val) return 0;
    const n = parseFloat(String(val).replace("%", "").trim());
    return n > 1 ? n / 100 : n;
  }

  return {
    descripcion:  cotiz.Descripcion || bond.description || ticker,
    paridad:      parseFloat(bond.parity)                           || 0,
    tir:          pct(bond.yield),
    tna:          pct(bond.annualNominalRate),
    duration:     parseFloat(bond.duration)                         || 0,
    convexity:    parseFloat(bond.convexity)                        || 0,
    currentYield: pct(bond.currentYield),
    precio:       parseFloat(bond.cleanPrice || cotiz.UltimoPrecio) || 0,
  };
}

// ─── FÓRMULAS INDIVIDUALES ────────────────────────────────────────────────────

/** Precio limpio del bono. @customfunction */
function BALANZ_PRECIO(ticker) {
  return fetchBondData_(String(ticker).trim().toUpperCase()).precio;
}

/** TIR / YTM del bono. @customfunction */
function BALANZ_TIR(ticker) {
  return fetchBondData_(String(ticker).trim().toUpperCase()).tir;
}

/** Tasa Nominal Anual. @customfunction */
function BALANZ_TNA(ticker) {
  return fetchBondData_(String(ticker).trim().toUpperCase()).tna;
}

/** Paridad del bono. @customfunction */
function BALANZ_PARIDAD(ticker) {
  return fetchBondData_(String(ticker).trim().toUpperCase()).paridad;
}

/** Duration del bono. @customfunction */
function BALANZ_DURATION(ticker) {
  return fetchBondData_(String(ticker).trim().toUpperCase()).duration;
}

/** Convexity del bono. @customfunction */
function BALANZ_CONVEXITY(ticker) {
  return fetchBondData_(String(ticker).trim().toUpperCase()).convexity;
}

/** Current Yield del bono. @customfunction */
function BALANZ_CY(ticker) {
  return fetchBondData_(String(ticker).trim().toUpperCase()).currentYield;
}

/** Nombre/descripción del bono. @customfunction */
function BALANZ_NOMBRE(ticker) {
  return fetchBondData_(String(ticker).trim().toUpperCase()).descripcion;
}

// ─── FÓRMULA GENÉRICA ────────────────────────────────────────────────────────

/**
 * Obtiene un campo específico de un bono.
 * @param {string} ticker   Ej: "AL30D"
 * @param {string} campo    precio | tir | tna | paridad | duration | convexity | currentyield | descripcion
 * @customfunction
 */
function BALANZ(ticker, campo) {
  if (!ticker) return "Falta ticker";
  if (!campo)  return "Falta campo";
  const c = String(campo).trim().toLowerCase().replace(/[^a-z]/g, "");
  const d = fetchBondData_(String(ticker).trim().toUpperCase());
  const mapa = {
    precio: d.precio, tir: d.tir, ytm: d.tir, tna: d.tna,
    paridad: d.paridad, duration: d.duration, convexity: d.convexity,
    currentyield: d.currentYield, cy: d.currentYield,
    descripcion: d.descripcion, nombre: d.descripcion,
  };
  return (c in mapa) ? mapa[c] : `Campo inválido: ${campo}`;
}

// ─── FILA COMPLETA + HEADER ───────────────────────────────────────────────────

/**
 * Todos los datos del bono en una fila. Usá =BALANZ_HEADER() encima.
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_FILA(ticker) {
  if (!ticker) return [["Falta ticker"]];
  const t = String(ticker).trim().toUpperCase();
  const d = fetchBondData_(t);
  return [[t, d.descripcion, d.paridad, d.tir, d.tna, d.duration, d.convexity, d.currentYield, d.precio]];
}

/**
 * Cabecera de columnas para usar encima de BALANZ_FILA.
 * @customfunction
 */
function BALANZ_HEADER() {
  return [["Ticker", "Descripción", "Paridad", "TIR", "TNA", "Duration", "Convexity", "Current Yield", "Precio"]];
}
