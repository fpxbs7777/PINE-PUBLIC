/**
 * BALANZ - Funciones personalizadas para Google Sheets
 * =====================================================
 * Uso: =BALANZ(ticker, campo)
 * Campos: precio, tir, tna, paridad, duration, convexity, currentyield, descripcion
 *
 * =BALANZ("AL30D", "tir")
 * =BALANZ("GD30D", "precio")
 * =BALANZ(A2, "paridad")
 * =BALANZ_FILA("AL30D")  ← todos los datos en una fila
 *
 * RENOVAR TOKEN (~8hs): menú 📊 Balanz > Actualizar Token
 * Obtenerlo: F12 > Network > cualquier request > Request Headers > authorization
 */

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────

const TOKEN_BALANZ = "5DB2F7D9-4205-41B1-B40A-76BBFAB0342A"; // ← tu token
const ID_CUENTA    = "96552";                                   // ← tu idCuenta

// ─── MENÚ ────────────────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📊 Balanz")
    .addItem("🔑 Actualizar Token", "actualizarToken")
    .addToUi();
}

// ─── FUNCIÓN PRINCIPAL ───────────────────────────────────────────────────────

/**
 * Obtiene un dato de un bono de Balanz.
 * @param {string} ticker  Ej: "AL30D", "GD30D", "AE38"
 * @param {string} campo   precio | tir | tna | paridad | duration | convexity | currentyield | descripcion
 * @return El valor del campo
 * @customfunction
 */
function BALANZ(ticker, campo) {
  if (!ticker) return "Falta ticker";
  if (!campo)  return "Falta campo";

  const t = String(ticker).trim().toUpperCase();
  const c = String(campo).trim().toLowerCase().replace(/[^a-z]/g, "");

  const data = fetchBondData_(t);

  const mapa = {
    "precio":       data.precio,
    "tir":          data.tir,
    "ytm":          data.tir,
    "tna":          data.tna,
    "paridad":      data.paridad,
    "duration":     data.duration,
    "convexity":    data.convexity,
    "currentyield": data.currentYield,
    "cy":           data.currentYield,
    "descripcion":  data.descripcion,
    "nombre":       data.descripcion,
  };

  if (!(c in mapa)) {
    return `Campo inválido. Usá: precio, tir, tna, paridad, duration, convexity, currentyield, descripcion`;
  }

  return mapa[c];
}

/**
 * Devuelve todos los datos del bono en una sola fila.
 * Orden: Ticker | Descripción | Paridad | TIR | TNA | Duration | Convexity | CurrentYield | Precio
 * @param {string} ticker  Ej: "AL30D"
 * @return Fila con todos los datos
 * @customfunction
 */
function BALANZ_FILA(ticker) {
  if (!ticker) return [["Falta ticker"]];
  const t = String(ticker).trim().toUpperCase();
  const d = fetchBondData_(t);
  return [[t, d.descripcion, d.paridad, d.tir, d.tna, d.duration, d.convexity, d.currentYield, d.precio]];
}

/**
 * Devuelve la cabecera de columnas para usar con BALANZ_FILA.
 * Poné =BALANZ_HEADER() en la fila de arriba de tus datos.
 * @return Fila con los nombres de columna
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
      "authorization":   token,
      "accept":          "application/json",
      "content-type":    "application/json",
      "lang":            "es",
      "referer":         "https://clientes.balanz.com/app/detalleinstrumento?ticker=" + ticker,
      "origin":          "https://clientes.balanz.com",
      "user-agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
      "sec-fetch-dest":  "empty",
      "sec-fetch-mode":  "cors",
      "sec-fetch-site":  "same-origin",
      "cache-control":   "no-cache",
      "pragma":          "no-cache",
    },
    muteHttpExceptions: true,
  });

  const code = response.getResponseCode();
  const body = response.getContentText();

  if (body.includes("Sesion%20Expirada") || body.includes("CodigoError=-1001")) {
    throw new Error("Token vencido — renovalo con el menú 📊 Balanz > Actualizar Token");
  }
  if (code === 403) {
    throw new Error("Token inválido o vencido (403) — renovalo con el menú 📊 Balanz > Actualizar Token");
  }
  if (code !== 200) {
    throw new Error(`HTTP ${code} para ${ticker}`);
  }

  const json = JSON.parse(body);
  return parseResponse_(json, ticker);
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

// ─── RENOVAR TOKEN ────────────────────────────────────────────────────────────

function actualizarToken() {
  const ui     = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '🔑 Renovar Token de Balanz',
    'Pegá tu token.\n\nCómo obtenerlo:\n1. F12 > Network\n2. Buscá cualquier bono en Balanz\n3. Clickeá la request a cotizacioninstrumento\n4. Request Headers > authorization\n5. Copiá el UUID',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() !== ui.Button.OK) return;

  const nuevoToken = result.getResponseText().trim();
  if (!nuevoToken) { ui.alert("Token vacío, no se actualizó."); return; }

  PropertiesService.getUserProperties().setProperty('balanz_token', nuevoToken);
  ui.alert('✅ Token guardado. Las fórmulas BALANZ() ya pueden usarse.');
}

// ─── HELPER ───────────────────────────────────────────────────────────────────

function getToken_() {
  return PropertiesService.getUserProperties().getProperty('balanz_token') || TOKEN_BALANZ;
}
