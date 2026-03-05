/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║           BALANZ - Funciones personalizadas Google Sheets        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                  ║
 * ║  =BALANZ_PRECIO("AL30D")      → Precio limpio                   ║
 * ║  =BALANZ_TIR("AL30D")         → TIR / YTM                       ║
 * ║  =BALANZ_TNA("AL30D")         → Tasa nominal anual              ║
 * ║  =BALANZ_PARIDAD("AL30D")     → Paridad                         ║
 * ║  =BALANZ_DURATION("AL30D")    → Duration                        ║
 * ║  =BALANZ_CONVEXITY("AL30D")   → Convexity                       ║
 * ║  =BALANZ_CY("AL30D")          → Current Yield                   ║
 * ║  =BALANZ_NOMBRE("AL30D")      → Nombre del bono                 ║
 * ║  =BALANZ_FILA("AL30D")        → Todos los datos en una fila     ║
 * ║  =BALANZ_HEADER()             → Cabecera para BALANZ_FILA       ║
 * ║  =BALANZ("AL30D","tir")       → Campo específico                ║
 * ║                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ─── MENÚ ────────────────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📊 Balanz")
    .addItem("📖 Cómo obtener el token", "mostrarInstrucciones")
    .addItem("🔑 Pegar token", "mostrarPanelToken")
    .addItem("🚪 Cerrar sesión", "cerrarSesion")
    .addToUi();

  const props = PropertiesService.getUserProperties();
  if (!props.getProperty('balanz_token')) {
    mostrarPanelToken();
  }
}

// ─── PANEL: PEGAR TOKEN ───────────────────────────────────────────────────────

function mostrarPanelToken() {
  const props = PropertiesService.getUserProperties();
  const ts    = parseInt(props.getProperty('balanz_token_ts') || '0');
  const horas = ts ? ((Date.now() - ts) / (1000 * 60 * 60)).toFixed(1) : null;
  const estadoTs = horas
    ? `<div class="info">⏱ Token guardado hace <b>${horas}h</b>. Válido ~8hs desde el login.</div>`
    : '';

  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
    <style>
      * { box-sizing: border-box; }
      body  { font-family: Arial, sans-serif; padding: 18px; font-size: 13px; color: #222; margin: 0; }
      h2    { color: #1a3a5c; margin-bottom: 4px; font-size: 15px; }
      label { display: block; font-weight: bold; margin-bottom: 4px; color: #333; margin-top: 12px; }
      textarea {
        width: 100%; padding: 8px; border: 1px solid #ccd;
        border-radius: 4px; font-size: 11px; font-family: monospace;
        margin-bottom: 10px; outline: none; resize: vertical; height: 70px;
      }
      textarea:focus { border-color: #1a3a5c; }
      input {
        width: 100%; padding: 8px 10px; border: 1px solid #ccd;
        border-radius: 4px; font-size: 13px; margin-bottom: 10px; outline: none;
      }
      input:focus { border-color: #1a3a5c; }
      button {
        width: 100%; background: #1a3a5c; color: #fff;
        border: none; padding: 10px; border-radius: 4px;
        font-size: 14px; cursor: pointer; font-weight: bold;
      }
      button:hover    { background: #2a5a8c; }
      button:disabled { background: #999; cursor: not-allowed; }
      .msg  { margin-top: 10px; padding: 8px 12px; border-radius: 4px; font-size: 12px; display: none; }
      .ok   { background: #f0fff4; color: #2d6a4f; border: 1px solid #b7e4c7; }
      .err  { background: #fff0f0; color: #cc0000; border: 1px solid #ffcccc; }
      .info { background: #e8f4fd; border-left: 3px solid #1a7abf; padding: 8px 10px;
              border-radius: 3px; margin-bottom: 10px; font-size: 11px; }
      .steps { background: #f7f9fc; border: 1px solid #dde; border-radius: 4px;
               padding: 10px 12px; margin-bottom: 12px; font-size: 12px; line-height: 1.9; }
      .steps b { color: #1a3a5c; }
      code { background: #eef; padding: 1px 5px; border-radius: 3px; font-size: 11px; }
    </style>
    </head>
    <body>
      <h2>🔑 Conectar con Balanz</h2>

      ${estadoTs}

      <div class="steps">
        <b>Cómo obtener tu token (30 segundos):</b><br>
        1. Abrí <b>clientes.balanz.com</b> y logueate<br>
        2. Presioná <b>F12</b> → pestaña <b>Network</b><br>
        3. Recargá la página con <b>F5</b><br>
        4. En el filtro escribí <code>login</code><br>
        5. Hacé click en la request → <b>Response</b><br>
        6. Copiá el valor de <code>AccessToken</code><br>
        7. También copiá tu <code>idCuenta</code> de <code>cuentas[0]</code>
      </div>

      <label>AccessToken</label>
      <textarea id="token" placeholder="Pegá acá el AccessToken (ej: 809254BC-006D-4B3C-AC75-...)"></textarea>

      <label>ID Cuenta <span style="font-weight:normal;color:#888">(ej: 96552)</span></label>
      <input type="text" id="cuenta" placeholder="Tu idCuenta de Balanz">

      <button id="btn" onclick="guardar()">💾 Guardar token</button>

      <div class="msg ok"  id="msgOk">✅ Token guardado. Ya podés usar las fórmulas.</div>
      <div class="msg err" id="msgErr"></div>

      <script>
        function guardar() {
          const token  = document.getElementById('token').value.trim();
          const cuenta = document.getElementById('cuenta').value.trim();
          if (!token) { mostrarErr('Pegá el AccessToken primero.'); return; }

          const btn = document.getElementById('btn');
          btn.textContent = '⏳ Guardando...';
          btn.disabled    = true;
          ocultarMensajes();

          google.script.run
            .withSuccessHandler(function(res) {
              btn.textContent = '💾 Guardar token';
              btn.disabled    = false;
              if (res === true) {
                document.getElementById('msgOk').style.display = 'block';
              } else {
                mostrarErr(res || 'Error desconocido');
              }
            })
            .withFailureHandler(function(e) {
              btn.textContent = '💾 Guardar token';
              btn.disabled    = false;
              mostrarErr('Error: ' + e.message);
            })
            .guardarTokenManual(token, cuenta);
        }

        function ocultarMensajes() {
          document.getElementById('msgOk').style.display  = 'none';
          document.getElementById('msgErr').style.display = 'none';
        }
        function mostrarErr(msg) {
          const el = document.getElementById('msgErr');
          el.textContent = '❌ ' + msg;
          el.style.display = 'block';
          document.getElementById('msgOk').style.display = 'none';
        }
      </script>
    </body>
    </html>
  `)
  .setTitle('🔑 Token de Balanz')
  .setWidth(340)
  .setHeight(500);

  SpreadsheetApp.getUi().showSidebar(html);
}

// ─── GUARDAR TOKEN MANUAL ─────────────────────────────────────────────────────

function guardarTokenManual(token, idCuenta) {
  if (!token) return 'Token vacío.';
  try {
    const props = PropertiesService.getUserProperties();
    props.setProperty('balanz_token',    token.trim());
    props.setProperty('balanz_token_ts', String(Date.now()));
    if (idCuenta) props.setProperty('balanz_id_cuenta', idCuenta.trim());
    return true;
  } catch(e) {
    return e.message;
  }
}

// ─── CERRAR SESIÓN ────────────────────────────────────────────────────────────

function cerrarSesion() {
  const ui = SpreadsheetApp.getUi();
  const r  = ui.alert('🚪 Cerrar sesión', '¿Querés eliminar tu token guardado?', ui.ButtonSet.YES_NO);
  if (r !== ui.Button.YES) return;
  PropertiesService.getUserProperties().deleteAllProperties();
  ui.alert('✅ Token eliminado.');
}

// ─── INSTRUCCIONES ───────────────────────────────────────────────────────────

function mostrarInstrucciones() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 16px; font-size: 13px; color: #222; }
      h2   { color: #1a3a5c; }
      h3   { color: #1a3a5c; margin-top: 16px; margin-bottom: 6px; }
      code { background: #f0f4fa; padding: 2px 6px; border-radius: 3px; font-size: 12px; display: inline-block; margin: 2px 0; }
      ol   { padding-left: 18px; line-height: 2; }
      .box  { background: #f0f4fa; border-left: 3px solid #1a3a5c; padding: 10px 14px; margin: 8px 0; border-radius: 3px; line-height: 1.8; }
      .warn { background: #fff8e1; border-left: 3px solid #f9a825; padding: 8px 12px; border-radius: 3px; margin: 8px 0; font-size: 12px; }
    </style>
    <h2>📖 Cómo obtener el token de Balanz</h2>
    <div class="warn">⚠️ El token dura ~8 horas. Cuando venza, repetí estos pasos.</div>
    <h3>Pasos</h3>
    <ol>
      <li>Abrí <b>clientes.balanz.com</b> e ingresá con tu usuario y contraseña</li>
      <li>Presioná <b>F12</b> para abrir las DevTools</li>
      <li>Hacé click en la pestaña <b>Network</b></li>
      <li>Recargá la página con <b>F5</b></li>
      <li>En el campo de filtro escribí <code>login</code></li>
      <li>Hacé click en la request que aparece</li>
      <li>Andá a la pestaña <b>Response</b></li>
      <li>Copiá el valor de <code>"AccessToken"</code></li>
      <li>Copiá también <code>"idCuenta"</code> de dentro de <code>cuentas[0]</code></li>
      <li>Pegá ambos en <b>📊 Balanz → 🔑 Pegar token</b></li>
    </ol>
    <h3>Fórmulas disponibles</h3>
    <div class="box">
      <code>=BALANZ_PRECIO("AL30D")</code> Precio<br>
      <code>=BALANZ_TIR("AL30D")</code> TIR / YTM<br>
      <code>=BALANZ_TNA("AL30D")</code> Tasa Nominal Anual<br>
      <code>=BALANZ_PARIDAD("AL30D")</code> Paridad<br>
      <code>=BALANZ_DURATION("AL30D")</code> Duration<br>
      <code>=BALANZ_CONVEXITY("AL30D")</code> Convexity<br>
      <code>=BALANZ_CY("AL30D")</code> Current Yield<br>
      <code>=BALANZ_NOMBRE("AL30D")</code> Nombre del bono<br>
      <code>=BALANZ_HEADER()</code> Cabecera<br>
      <code>=BALANZ_FILA("AL30D")</code> Todos los datos
    </div>
  `)
  .setTitle('📖 Instrucciones — Balanz')
  .setWidth(380)
  .setHeight(520);
  SpreadsheetApp.getUi().showSidebar(html);
}

// ─── UUID ─────────────────────────────────────────────────────────────────────

function generarUUID_() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase();
  });
}

// ─── HELPER: obtener token ────────────────────────────────────────────────────

function getToken_() {
  const props = PropertiesService.getUserProperties();
  const token = props.getProperty('balanz_token');
  if (!token) {
    throw new Error("Token no configurado. Usá el menú 📊 Balanz → 🔑 Pegar token");
  }
  return token;
}

// ─── FETCH BOND DATA ──────────────────────────────────────────────────────────

function fetchBondData_(ticker) {
  const props  = PropertiesService.getUserProperties();
  const token  = getToken_();
  const cuenta = props.getProperty('balanz_id_cuenta') || '96552';

  const response = UrlFetchApp.fetch(
    `https://clientes.balanz.com/api/v1/cotizacioninstrumento?idCuenta=${cuenta}&ticker=${encodeURIComponent(ticker)}`,
    {
      method: "GET",
      headers: {
        "authorization": token,
        "accept":        "application/json",
        "content-type":  "application/json",
        "lang":          "es",
        "user-agent":    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
      },
      muteHttpExceptions: true,
    }
  );

  const code = response.getResponseCode();
  const body = response.getContentText();

  if (code !== 200) {
    throw new Error("HTTP " + code + " para " + ticker + ". " +
      (code === 401 || code === 403
        ? "Token vencido — usá 📊 Balanz → 🔑 Pegar token"
        : body.substring(0, 80)));
  }

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
function BALANZ_PRECIO(ticker)    { return fetchBondData_(String(ticker).trim().toUpperCase()).precio; }
/** TIR / YTM del bono. @customfunction */
function BALANZ_TIR(ticker)       { return fetchBondData_(String(ticker).trim().toUpperCase()).tir; }
/** Tasa Nominal Anual. @customfunction */
function BALANZ_TNA(ticker)       { return fetchBondData_(String(ticker).trim().toUpperCase()).tna; }
/** Paridad del bono. @customfunction */
function BALANZ_PARIDAD(ticker)   { return fetchBondData_(String(ticker).trim().toUpperCase()).paridad; }
/** Duration del bono. @customfunction */
function BALANZ_DURATION(ticker)  { return fetchBondData_(String(ticker).trim().toUpperCase()).duration; }
/** Convexity del bono. @customfunction */
function BALANZ_CONVEXITY(ticker) { return fetchBondData_(String(ticker).trim().toUpperCase()).convexity; }
/** Current Yield del bono. @customfunction */
function BALANZ_CY(ticker)        { return fetchBondData_(String(ticker).trim().toUpperCase()).currentYield; }
/** Nombre/descripción del bono. @customfunction */
function BALANZ_NOMBRE(ticker)    { return fetchBondData_(String(ticker).trim().toUpperCase()).descripcion; }

// ─── FÓRMULA GENÉRICA ────────────────────────────────────────────────────────

/**
 * @param {string} ticker  Ej: "AL30D"
 * @param {string} campo   precio|tir|tna|paridad|duration|convexity|currentyield|descripcion
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
 * @param {string} ticker Ej: "AL30D"
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
