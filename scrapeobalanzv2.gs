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
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                  ║
 * ║  SETUP (una sola vez):                                           ║
 * ║  1. Extensiones → Apps Script → pegá este código                ║
 * ║  2. Guardá (Ctrl+S)                                              ║
 * ║  3. Volvé al Sheet y recargá (F5)                                ║
 * ║  4. Menú 📊 Balanz → Obtener Bookmarklet → instalarlo           ║
 * ║                                                                  ║
 * ║  RENOVAR TOKEN (cada ~8hs):                                      ║
 * ║     · Entrá a clientes.balanz.com                                ║
 * ║     · Clickeá el marcador 🔑 en el browser                      ║
 * ║     · ✅ listo — se renueva para todos los usuarios             ║
 * ║                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────

const TOKEN_BALANZ = "060F945A-DD56-4044-8221-66946D4E7497";
const ID_CUENTA    = "96552";
const WEB_APP_URL  = "https://script.google.com/macros/s/AKfycbw5YfHNcNkiH-D9wO6wD7hEslr7V7L0LN5QApusRSWfkQCHOzyHnYdR8o1tNZjEsUPc/exec";
const BOOKMARKLET  = `javascript:window.open('${WEB_APP_URL}?token='+localStorage.getItem('token'),'_blank','width=420,height=280');`;

// ─── MENÚ ────────────────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📊 Balanz")
    .addItem("📖 Instrucciones", "mostrarInstrucciones")
    .addItem("🔖 Obtener Bookmarklet", "mostrarBookmarklet")
    .addItem("🔑 Renovar Token (manual)", "actualizarTokenManual")
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
      .warn { background:#fff8e1; border-left:3px solid #f9a825; padding:8px 12px; border-radius:3px; margin:8px 0; }
    </style>

    <h2>📊 Balanz para Google Sheets</h2>

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
      <code>=BALANZ_HEADER()</code> → poné en fila 1<br>
      <code>=BALANZ_FILA("AL30D")</code> → se expande con todos los datos
    </div>

    <h3>Renovar token (~cada 8hs)</h3>
    <div class="warn">
      ⚠️ El token vence cada ~8hs. Solo el administrador necesita renovarlo — se actualiza para todos los usuarios automáticamente.
    </div>
    <ul>
      <li>Entrá a <b>clientes.balanz.com</b></li>
      <li>Clickeá el marcador <b>🔑 Renovar Token Balanz</b> en el browser</li>
      <li><span class="ok">✅ Token renovado para todos los usuarios</span></li>
    </ul>
    <p>¿No tenés el marcador? Menú <b>📊 Balanz → Obtener Bookmarklet</b></p>
  `)
  .setTitle('📊 Balanz — Instrucciones')
  .setWidth(400)
  .setHeight(560);

  SpreadsheetApp.getUi().showSidebar(html);
}

// ─── BOOKMARKLET ─────────────────────────────────────────────────────────────

function mostrarBookmarklet() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; color: #222; }
      h2   { color: #1a3a5c; }
      .box { background:#f0f4fa; border:1px solid #ccd; padding:10px; border-radius:4px; word-break:break-all; font-size:11px; line-height:1.5; margin:10px 0; }
      button { background:#1a3a5c; color:#fff; border:none; padding:8px 16px; border-radius:4px; cursor:pointer; font-size:13px; margin:4px 0; }
      button:hover { background:#2a5a8c; }
      ol { padding-left:20px; }
      li { margin-bottom:6px; }
      .ok { color:#2d6a4f; font-weight:bold; }
      .warn { background:#fff8e1; border-left:3px solid #f9a825; padding:8px 12px; border-radius:3px; margin:8px 0; font-size:12px; }
    </style>

    <h2>🔖 Bookmarklet</h2>
    <p>Este marcador renueva el token con 1 click desde Balanz, para todos los usuarios.</p>

    <div class="box" id="bm">${BOOKMARKLET}</div>
    <button onclick="navigator.clipboard.writeText(document.getElementById('bm').innerText).then(()=>this.innerText='✅ Copiado!')">📋 Copiar</button>

    <h3>Cómo instalarlo (una sola vez):</h3>
    <ol>
      <li>Entrá a <b>clientes.balanz.com</b></li>
      <li>Clickeá la <b>estrella ⭐</b> en la barra de direcciones → guardá el favorito</li>
      <li>Click derecho sobre el favorito → <b>Editar</b></li>
      <li>Borrá la URL actual</li>
      <li><b>Escribí</b> <code>javascript:</code> a mano (no pegues)</li>
      <li>Luego <b>pegá</b> el resto del texto copiado arriba</li>
      <li>Guardar ✅</li>
    </ol>

    <div class="warn">⚠️ El paso 5 es clave: escribir <code>javascript:</code> a mano, después pegar el resto.</div>

    <p><b>Desde ahora:</b> entrás a Balanz → clickeás 🔑 → <span class="ok">token renovado para todos</span></p>
  `)
  .setTitle('🔖 Instalar Bookmarklet')
  .setWidth(420)
  .setHeight(540);

  SpreadsheetApp.getUi().showSidebar(html);
}

// ─── doGet — recibe token desde bookmarklet ───────────────────────────────────

function doGet(e) {
  const token = e && e.parameter && e.parameter.token ? e.parameter.token.trim() : null;

  if (!token) {
    return HtmlService.createHtmlOutput(`
      <html><body style="font-family:Arial,sans-serif;padding:24px;text-align:center">
        <h2>❌ Token vacío</h2>
        <p>Asegurate de estar en <b>clientes.balanz.com</b> antes de clickear el marcador.</p>
      </body></html>
    `);
  }

  // getScriptProperties → token compartido para todos los usuarios
  PropertiesService.getScriptProperties().setProperty('balanz_token', token);

  return HtmlService.createHtmlOutput(`
    <html><body style="font-family:Arial,sans-serif;padding:24px;text-align:center;background:#f0fff4">
      <h2 style="color:#2d6a4f">✅ Token actualizado</h2>
      <p>El token fue renovado para todos los usuarios.</p>
      <p style="color:#888;font-size:12px">Esta pestaña se cierra sola...</p>
      <script>setTimeout(()=>window.close(),2000)</script>
    </body></html>
  `);
}

// ─── RENOVAR TOKEN MANUAL ─────────────────────────────────────────────────────

function actualizarTokenManual() {
  const ui     = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '🔑 Renovar Token',
    'Pegá tu token.\n\nCómo obtenerlo:\nF12 → Network → cualquier request a cotizacioninstrumento → Request Headers → authorization',
    ui.ButtonSet.OK_CANCEL
  );
  if (result.getSelectedButton() !== ui.Button.OK) return;
  const t = result.getResponseText().trim();
  if (!t) { ui.alert("Token vacío."); return; }
  PropertiesService.getScriptProperties().setProperty('balanz_token', t);
  ui.alert('✅ Token guardado para todos los usuarios.');
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

// ─── FETCH ───────────────────────────────────────────────────────────────────

function fetchBondData_(ticker) {
  const url   = `https://clientes.balanz.com/api/v1/cotizacioninstrumento?idCuenta=${ID_CUENTA}&ticker=${encodeURIComponent(ticker)}`;
  const token = getToken_();

  const response = UrlFetchApp.fetch(url, {
    method: "GET",
    headers: {
      "authorization":  token,
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
  });

  const code = response.getResponseCode();
  const body = response.getContentText();

  if (body.includes("Sesion%20Expirada") || body.includes("CodigoError=-1001")) {
    throw new Error("Token vencido — usá el marcador 🔑 en clientes.balanz.com");
  }
  if (code === 403) throw new Error("Token vencido (403) — usá el marcador 🔑 en clientes.balanz.com");
  if (code !== 200) throw new Error(`HTTP ${code} para ${ticker}`);

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

// ─── HELPER ───────────────────────────────────────────────────────────────────

function getToken_() {
  // getScriptProperties → token compartido para todos los usuarios del script
  return PropertiesService.getScriptProperties().getProperty('balanz_token') || TOKEN_BALANZ;
}
