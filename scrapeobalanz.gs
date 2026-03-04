/**
 * BALANZ SCRAPER - Apps Script
 * ============================
 * USA TU TOKEN DE BALANZ para obtener datos de bonos.
 *
 * SETUP:
 * 1. Pegá este código en Apps Script (Extensiones > Apps Script)
 * 2. Ejecutá setupSheet() la primera vez
 * 3. Cada vez que quieras actualizar: menú "📊 Balanz" > "Actualizar Todos"
 *
 * RENOVAR TOKEN (cuando venza, ~8hs):
 * 1. Andá a clientes.balanz.com logueado
 * 2. F12 > Console > pegá: localStorage.getItem('token')
 * 3. Copiá el valor y pegalo en TOKEN_BALANZ abajo
 */

// ─── CONFIGURACIÓN — EDITÁ ESTOS VALORES ────────────────────────────────────

const TOKEN_BALANZ = "EC3CF36F-8D3B-4B59-BDE2-F9C39A14F0E0"; // ← tu token
const ID_CUENTA    = "96552";                                   // ← tu idCuenta

// ─── NO TOCAR LO QUE SIGUE ──────────────────────────────────────────────────

const SHEET_NAME = "Bonos Balanz";
const HEADERS = ["Ticker", "Descripción", "Paridad", "TIR (YTM)", "TNA", "Duration", "Convexity", "Current Yield", "Precio", "Última actualización"];

function onOpen() { crearMenu(); }

function crearMenu() {
  SpreadsheetApp.getUi()
    .createMenu("📊 Balanz")
    .addItem("🔄 Actualizar Todos", "fetchAllBonds")
    .addItem("🔄 Actualizar Fila Seleccionada", "fetchSelectedRow")
    .addSeparator()
    .addItem("🔑 Actualizar Token", "actualizarToken")
    .addItem("⚙️ Configurar Hoja", "setupSheet")
    .addToUi();
}

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  const hRange = sheet.getRange(1, 1, 1, HEADERS.length);
  hRange.setValues([HEADERS]);
  hRange.setFontWeight("bold").setBackground("#1a3a5c").setFontColor("#ffffff").setHorizontalAlignment("center");

  sheet.setColumnWidth(1, 120); sheet.setColumnWidth(2, 260);
  sheet.setColumnWidth(3, 100); sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 100); sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 100); sheet.setColumnWidth(8, 120);
  sheet.setColumnWidth(9, 100); sheet.setColumnWidth(10, 170);

  if (sheet.getLastRow() < 2) {
    const ejemplos = [["TSC4O"],["TGS35"],["AL30D"],["GD30D"],["AE38D"]];
    sheet.getRange(2, 1, ejemplos.length, 1).setValues(ejemplos);
  }

  crearMenu();
  SpreadsheetApp.getUi().alert('✅ Hoja configurada!\n\nAgregá tickers en columna A y usá el menú 📊 Balanz > Actualizar Todos.');
}

// ─── FETCH PRINCIPAL ─────────────────────────────────────────────────────────

function fetchBondData(ticker) {
  const url = `https://clientes.balanz.com/api/v1/cotizacioninstrumento?idCuenta=${ID_CUENTA}&ticker=${encodeURIComponent(ticker)}`;

  const token = getToken();

  try {
    const response = UrlFetchApp.fetch(url, {
      method: "GET",
      headers: {
        "Authorization": token,
        "Lang": "es",
        "content-type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
        "Referer": "https://clientes.balanz.com/",
        "Origin": "https://clientes.balanz.com",
      },
      muteHttpExceptions: true,
    });

    const code = response.getResponseCode();
    const body = response.getContentText();

    if (body.includes("Sesion%20Expirada") || body.includes("CodigoError=-1001")) {
      throw new Error("Token vencido. Usá el menú 🔑 Actualizar Token.");
    }

    if (code !== 200) {
      throw new Error(`HTTP ${code}`);
    }

    const json = JSON.parse(body);
    const data = parseResponse(json, ticker);
    if (data) return data;
    throw new Error("Respuesta vacía o formato inesperado");

  } catch(e) {
    throw new Error(e.message);
  }
}

function parseResponse(json, ticker) {
  if (!json) return null;

  const bond  = json.bond       || {};
  const cotiz = json.Cotizacion || {};

  // Convierte "9.03%" -> 0.0903
  function pct(val) {
    if (!val) return 0;
    return parseFloat(String(val).replace("%", "").trim()) / 100;
  }

  return {
    descripcion:  cotiz.Descripcion || bond.description || ticker,
    paridad:      parseFloat(bond.parity)           || 0,
    tir:          pct(bond.yield),
    tna:          pct(bond.annualNominalRate),
    duration:     parseFloat(bond.duration)         || 0,
    convexity:    parseFloat(bond.convexity)        || 0,
    currentYield: pct(bond.currentYield),
    precio:       parseFloat(bond.cleanPrice || cotiz.UltimoPrecio) || 0,
  };
}

// Endpoint alternativo — intenta con variantes de la URL
function fetchAlternativo(ticker) {
  const endpoints = [
    `https://clientes.balanz.com/api/v1/cotizacioninstrumento?ticker=${ticker}`,
    `https://clientes.balanz.com/api/v2/cotizacioninstrumento?idCuenta=${ID_CUENTA}&ticker=${ticker}`,
    `https://clientes.balanz.com/api/v1/market/instrument?ticker=${ticker}`,
    `https://clientes.balanz.com/api/v1/bonos/cotizacion?ticker=${ticker}&idCuenta=${ID_CUENTA}`,
  ];

  for (const url of endpoints) {
    try {
      const r = UrlFetchApp.fetch(url, {
        headers: {
          "token": TOKEN_BALANZ,
          "Authorization": `Bearer ${TOKEN_BALANZ}`,
          "Accept": "application/json",
          "Referer": "https://clientes.balanz.com/",
        },
        muteHttpExceptions: true,
      });
      if (r.getResponseCode() === 200) {
        const body = r.getContentText();
        if (!body.includes("CodigoError")) {
          const json = JSON.parse(body);
          const data = parseResponse(json, ticker);
          if (data) return data;
        }
      }
    } catch(e) {}
  }

  throw new Error("Token vencido o endpoint incorrecto. Renová el token en el script.");
}

// ─── ESCRITURA EN HOJA ────────────────────────────────────────────────────────

function writeRow(sheet, row, ticker, data) {
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
  sheet.getRange(row, 1, 1, HEADERS.length).setValues([[
    ticker,
    data.descripcion,
    data.paridad,
    data.tir > 1 ? data.tir / 100 : data.tir,
    data.tna > 1 ? data.tna / 100 : data.tna,
    data.duration,
    data.convexity,
    data.currentYield > 1 ? data.currentYield / 100 : data.currentYield,
    data.precio,
    now,
  ]]);

  sheet.getRange(row, 3).setNumberFormat("0.000000");          // Paridad
  sheet.getRange(row, 4).setNumberFormat("0.00%");              // TIR
  sheet.getRange(row, 5).setNumberFormat("0.00%");              // TNA
  sheet.getRange(row, 6).setNumberFormat("0.000");              // Duration
  sheet.getRange(row, 7).setNumberFormat("0.000");              // Convexity
  sheet.getRange(row, 8).setNumberFormat("0.00%");              // Current Yield
  sheet.getRange(row, 9).setNumberFormat("0.0000");             // Precio

  const bg = row % 2 === 0 ? "#f0f4fa" : "#ffffff";
  sheet.getRange(row, 1, 1, HEADERS.length).setBackground(bg);
  sheet.getRange(row, 2).setFontColor("#000000"); // Limpiar color de error previo
}

// ─── ACTUALIZAR TODOS ─────────────────────────────────────────────────────────

function fetchAllBonds() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('Hoja no encontrada. Ejecutá setupSheet primero.');
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) { SpreadsheetApp.getUi().alert("No hay tickers en columna A."); return; }

  const tickers = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().filter(t => String(t).trim() !== "");
  let ok = 0, errores = [];

  for (let i = 0; i < tickers.length; i++) {
    const ticker = String(tickers[i]).trim().toUpperCase();
    const row = i + 2;
    try {
      const data = fetchBondData(ticker);
      writeRow(sheet, row, ticker, data);
      ok++;
    } catch(e) {
      errores.push(`${ticker}: ${e.message}`);
      sheet.getRange(row, 2).setValue("❌ " + e.message).setFontColor("#cc0000");
    }
    Utilities.sleep(400);
  }

  SpreadsheetApp.getUi().alert(
    `✅ Actualizados: ${ok}/${tickers.length}` +
    (errores.length ? `\n\n❌ Errores:\n${errores.join("\n")}` : "")
  );
}

// ─── ACTUALIZAR FILA SELECCIONADA ─────────────────────────────────────────────

function fetchSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveCell().getRow();
  if (row < 2) { SpreadsheetApp.getUi().alert("Seleccioná una fila con datos."); return; }

  const ticker = String(sheet.getRange(row, 1).getValue()).trim().toUpperCase();
  if (!ticker) { SpreadsheetApp.getUi().alert("La celda no tiene ticker."); return; }

  try {
    const data = fetchBondData(ticker);
    writeRow(sheet, row, ticker, data);
    SpreadsheetApp.getUi().alert(`✅ ${ticker} actualizado.`);
  } catch(e) {
    SpreadsheetApp.getUi().alert(`❌ Error: ${e.message}`);
  }
}

// ─── RENOVAR TOKEN ────────────────────────────────────────────────────────────

function actualizarToken() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '🔑 Renovar Token de Balanz',
    'Pegá tu token actual (obtenelo desde la consola del browser con: localStorage.getItem("token"))',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() !== ui.Button.OK) return;

  const nuevoToken = result.getResponseText().trim();
  if (!nuevoToken) { ui.alert("Token vacío, no se actualizó."); return; }

  // Guardar en PropertiesService para no perderlo
  PropertiesService.getUserProperties().setProperty('balanz_token', nuevoToken);
  ui.alert('✅ Token guardado. Actualizá también TOKEN_BALANZ en el código si querés que persista entre sesiones.');
}

// ─── HELPER: obtener token guardado ──────────────────────────────────────────

function getToken() {
  // Primero intenta el guardado via UI, luego el del código
  return PropertiesService.getUserProperties().getProperty('balanz_token') || TOKEN_BALANZ;
}
