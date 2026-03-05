/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║              BALANZ — Funciones personalizadas Google Sheets v7              ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  ── BONOS ──────────────────────────────────────────────────────────────     ║
 * ║  =BALANZ_PRECIO(ticker)                   Precio limpio                      ║
 * ║  =BALANZ_TIR(ticker)                      TIR / YTM                          ║
 * ║  =BALANZ_TNA(ticker)                      Tasa nominal anual                 ║
 * ║  =BALANZ_PARIDAD(ticker)                  Paridad                            ║
 * ║  =BALANZ_DURATION(ticker)                 Duration modificada                ║
 * ║  =BALANZ_CONVEXITY(ticker)                Convexity                          ║
 * ║  =BALANZ_CY(ticker)                       Current Yield                      ║
 * ║  =BALANZ_NOMBRE(ticker)                   Nombre del instrumento             ║
 * ║                                                                              ║
 * ║  ── CUALQUIER INSTRUMENTO ──────────────────────────────────────────────     ║
 * ║  =BALANZ_ULTIMO(ticker)                   Último precio                      ║
 * ║  =BALANZ_VARIACION(ticker)                Variación % del día                ║
 * ║  =BALANZ_VOLUMEN(ticker)                  Volumen operado                    ║
 * ║  =BALANZ_APERTURA(ticker)                 Precio apertura                    ║
 * ║  =BALANZ_MAXIMO(ticker)                   Máximo del día                     ║
 * ║  =BALANZ_MINIMO(ticker)                   Mínimo del día                     ║
 * ║  =BALANZ_CIERRE(ticker)                   Cierre anterior                    ║
 * ║  =BALANZ_VWAP(ticker)                     VWAP del día                       ║
 * ║  =BALANZ(ticker, campo)                   Campo libre de cualquier ticker    ║
 * ║  =BALANZ_FILA(ticker)                     Fila completa de datos             ║
 * ║  =BALANZ_HEADER()                         Cabecera para BALANZ_FILA          ║
 * ║                                                                              ║
 * ║  ── HISTÓRICO DE PRECIOS (OHLCV) ───────────────────────────────────────     ║
 * ║  =BALANZ_HIST(ticker, desde, hasta, campo)  Histórico campo libre            ║
 * ║  =BALANZ_HIST_PRECIO(ticker, desde, hasta)  Precios de cierre                ║
 * ║  =BALANZ_HIST_MAXIMO(ticker, desde, hasta)  Máximos históricos               ║
 * ║  =BALANZ_HIST_MINIMO(ticker, desde, hasta)  Mínimos históricos               ║
 * ║  =BALANZ_HIST_VOLUMEN(ticker, desde, hasta) Volumen histórico                ║
 * ║  =BALANZ_HIST_OHLCV(ticker, desde, hasta)   Tabla completa OHLCV             ║
 * ║                                                                              ║
 * ║  ── EVOLUCIÓN DE CARTERA (histórico de portafolio) ─────────────────────     ║
 * ║  =BALANZ_EVOL(desde, hasta)               Evolución histórica de cartera     ║
 * ║  =BALANZ_EVOL_HEADER()                    Cabecera para BALANZ_EVOL          ║
 * ║                                                                              ║
 * ║  ── ESTADO ACTUAL DE CUENTA ────────────────────────────────────────────     ║
 * ║  =BALANZ_SALDO()                          Saldo disponible en pesos (CI)     ║
 * ║  =BALANZ_SALDO_24()                       Saldo disponible pesos 24hs        ║
 * ║  =BALANZ_SALDO_USD()                      Saldo disponible USD (CI)          ║
 * ║  =BALANZ_SALDO_USD_24()                   Saldo disponible USD 24hs          ║
 * ║  =BALANZ_MEP()                            Dólar MEP actual                   ║
 * ║  =BALANZ_CCL()                            Dólar CCL actual                   ║
 * ║  =BALANZ_TENENCIA_TOTAL()                 Tenencia total en pesos             ║
 * ║  =BALANZ_PORTAFOLIO_HEADER()              Cabecera de posiciones              ║
 * ║  =BALANZ_PORTAFOLIO()                     Posiciones actuales                 ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 *  Endpoints verificados:
 *  · Cotización:   /api/v1/cotizacioninstrumento?idCuenta={id}&ticker={t}
 *  · Histórico:    /api/v1/historico/eventos?ticker={t}&plazo=1&fullNormalize=false
 *  · Ev. cartera:  /api/v1/evoluciondecartera/{id}?FechaDesde={d}&FechaHasta={h}&idMoneda=1&Tenencia=1&Eventos=1
 *  · Estado cta:   /api/v1/estadodecuenta/{id}?Fecha={d}&ta=1&idMoneda=1
 */

// ─── MENÚ ─────────────────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📊 Balanz")
    .addItem("🔑 Pegar token",             "mostrarPanelToken")
    .addItem("📖 Instrucciones y fórmulas", "mostrarInstrucciones")
    .addItem("🚪 Cerrar sesión",            "cerrarSesion")
    .addToUi();

  if (!PropertiesService.getUserProperties().getProperty('balanz_token')) {
    mostrarPanelToken();
  }
}

// ─── PANEL TOKEN ──────────────────────────────────────────────────────────────

function mostrarPanelToken() {
  const props = PropertiesService.getUserProperties();
  const ts    = parseInt(props.getProperty('balanz_token_ts') || '0');
  const horas = ts ? ((Date.now() - ts) / 3600000).toFixed(1) : null;
  const estadoTs = horas
    ? `<div class="info">⏱ Token guardado hace <b>${horas}h</b>. Válido ~8hs desde el login.</div>`
    : '';

  const html = HtmlService.createHtmlOutput(`<!DOCTYPE html><html><head>
    <style>
      *{box-sizing:border-box}
      body{font-family:Arial,sans-serif;padding:18px;font-size:13px;color:#222;margin:0}
      h2{color:#1a3a5c;margin-bottom:4px;font-size:15px}
      label{display:block;font-weight:bold;margin-bottom:4px;color:#333;margin-top:12px}
      textarea{width:100%;padding:8px;border:1px solid #ccd;border-radius:4px;font-size:11px;
               font-family:monospace;margin-bottom:10px;resize:vertical;height:70px}
      textarea:focus{border-color:#1a3a5c;outline:none}
      input{width:100%;padding:8px 10px;border:1px solid #ccd;border-radius:4px;font-size:13px;margin-bottom:10px;outline:none}
      input:focus{border-color:#1a3a5c}
      button{width:100%;background:#1a3a5c;color:#fff;border:none;padding:10px;border-radius:4px;font-size:14px;cursor:pointer;font-weight:bold}
      button:hover{background:#2a5a8c}
      button:disabled{background:#999;cursor:not-allowed}
      .msg{margin-top:10px;padding:8px 12px;border-radius:4px;font-size:12px;display:none}
      .ok{background:#f0fff4;color:#2d6a4f;border:1px solid #b7e4c7}
      .err{background:#fff0f0;color:#cc0000;border:1px solid #ffcccc}
      .info{background:#e8f4fd;border-left:3px solid #1a7abf;padding:8px 10px;border-radius:3px;margin-bottom:10px;font-size:11px}
      .steps{background:#f7f9fc;border:1px solid #dde;border-radius:4px;padding:10px 12px;margin-bottom:12px;font-size:12px;line-height:1.9}
      code{background:#eef;padding:1px 5px;border-radius:3px;font-size:11px}
    </style></head><body>
    <h2>🔑 Conectar con Balanz</h2>
    ${estadoTs}
    <div class="steps">
      <b>Cómo obtener tu token (30 seg):</b><br>
      1. Abrí <b>clientes.balanz.com</b> y logueate<br>
      2. Presioná <b>F12</b> → pestaña <b>Network</b><br>
      3. Recargá con <b>F5</b> → filtrá por <code>login</code><br>
      4. Click en la request → <b>Response</b><br>
      5. Copiá <code>AccessToken</code> e <code>idCuenta</code>
    </div>
    <label>AccessToken</label>
    <textarea id="token" placeholder="Pegá acá el AccessToken..."></textarea>
    <label>ID Cuenta <span style="font-weight:normal;color:#888">(ej: 96552)</span></label>
    <input type="text" id="cuenta" placeholder="Tu idCuenta de Balanz">
    <button id="btn" onclick="guardar()">💾 Guardar token</button>
    <div class="msg ok"  id="msgOk">✅ Token guardado. Ya podés usar las fórmulas.</div>
    <div class="msg err" id="msgErr"></div>
    <script>
      function guardar(){
        const token=document.getElementById('token').value.trim();
        const cuenta=document.getElementById('cuenta').value.trim();
        if(!token){mostrarErr('Pegá el AccessToken primero.');return}
        const btn=document.getElementById('btn');
        btn.textContent='⏳ Guardando...';btn.disabled=true;ocultarMensajes();
        google.script.run
          .withSuccessHandler(function(r){
            btn.textContent='💾 Guardar token';btn.disabled=false;
            if(r===true)document.getElementById('msgOk').style.display='block';
            else mostrarErr(r||'Error desconocido');
          })
          .withFailureHandler(function(e){
            btn.textContent='💾 Guardar token';btn.disabled=false;
            mostrarErr('Error: '+e.message);
          })
          .guardarTokenManual(token,cuenta);
      }
      function ocultarMensajes(){
        document.getElementById('msgOk').style.display='none';
        document.getElementById('msgErr').style.display='none';
      }
      function mostrarErr(m){
        var el=document.getElementById('msgErr');
        el.textContent='❌ '+m;el.style.display='block';
        document.getElementById('msgOk').style.display='none';
      }
    </script></body></html>
  `).setTitle('🔑 Token de Balanz').setWidth(340).setHeight(490);
  SpreadsheetApp.getUi().showSidebar(html);
}

function guardarTokenManual(token, idCuenta) {
  if (!token) return 'Token vacío.';
  try {
    const p = PropertiesService.getUserProperties();
    p.setProperty('balanz_token',    token.trim());
    p.setProperty('balanz_token_ts', String(Date.now()));
    if (idCuenta) p.setProperty('balanz_id_cuenta', idCuenta.trim());
    return true;
  } catch(e) { return e.message; }
}

function cerrarSesion() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('🚪 Cerrar sesión','¿Eliminar token guardado?', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  PropertiesService.getUserProperties().deleteAllProperties();
  ui.alert('✅ Token eliminado.');
}

// ─── INSTRUCCIONES ────────────────────────────────────────────────────────────

function mostrarInstrucciones() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body{font-family:Arial,sans-serif;padding:14px;font-size:12px;color:#222}
      h2{color:#1a3a5c;font-size:15px;margin-bottom:4px}
      h3{color:#1a3a5c;margin:14px 0 4px;font-size:13px;border-bottom:1px solid #dde;padding-bottom:3px}
      code{background:#f0f4fa;padding:1px 5px;border-radius:3px;font-size:11px;display:inline-block}
      .warn{background:#fff8e1;border-left:3px solid #f9a825;padding:7px 10px;border-radius:3px;margin:6px 0}
      table{width:100%;border-collapse:collapse;font-size:11px;margin:4px 0}
      td,th{padding:4px 6px;border:1px solid #dde}
      th{background:#f0f4fa;color:#1a3a5c;text-align:left}
      tr:nth-child(even){background:#f9f9f9}
      .box{background:#f7f9fc;border-left:3px solid #1a3a5c;padding:8px 12px;margin:6px 0;border-radius:3px;line-height:2;font-size:11px}
    </style>
    <h2>📊 Balanz para Google Sheets</h2>
    <div class="warn">⚠️ El token dura ~8 horas. Renovalo desde 📊 Balanz → 🔑 Pegar token.</div>

    <h3>Bonos — datos actuales</h3>
    <table>
      <tr><th>Fórmula</th><th>Descripción</th></tr>
      <tr><td><code>=BALANZ_PRECIO("AL30D")</code></td><td>Precio limpio</td></tr>
      <tr><td><code>=BALANZ_TIR("AL30D")</code></td><td>TIR / YTM</td></tr>
      <tr><td><code>=BALANZ_TNA("AL30D")</code></td><td>Tasa nominal anual</td></tr>
      <tr><td><code>=BALANZ_PARIDAD("AL30D")</code></td><td>Paridad</td></tr>
      <tr><td><code>=BALANZ_DURATION("AL30D")</code></td><td>Duration modificada</td></tr>
      <tr><td><code>=BALANZ_CONVEXITY("AL30D")</code></td><td>Convexity</td></tr>
      <tr><td><code>=BALANZ_CY("AL30D")</code></td><td>Current Yield</td></tr>
      <tr><td><code>=BALANZ_NOMBRE("AL30D")</code></td><td>Nombre del instrumento</td></tr>
    </table>

    <h3>Cualquier instrumento (acciones, CEDEARs, fondos, bonos)</h3>
    <table>
      <tr><th>Fórmula</th><th>Descripción</th></tr>
      <tr><td><code>=BALANZ_ULTIMO("GGAL")</code></td><td>Último precio</td></tr>
      <tr><td><code>=BALANZ_VARIACION("GGAL")</code></td><td>Variación % del día</td></tr>
      <tr><td><code>=BALANZ_VOLUMEN("GGAL")</code></td><td>Volumen operado</td></tr>
      <tr><td><code>=BALANZ_APERTURA("GGAL")</code></td><td>Precio apertura</td></tr>
      <tr><td><code>=BALANZ_MAXIMO("GGAL")</code></td><td>Máximo del día</td></tr>
      <tr><td><code>=BALANZ_MINIMO("GGAL")</code></td><td>Mínimo del día</td></tr>
      <tr><td><code>=BALANZ_CIERRE("GGAL")</code></td><td>Cierre anterior</td></tr>
      <tr><td><code>=BALANZ_VWAP("GGAL")</code></td><td>VWAP del día</td></tr>
      <tr><td><code>=BALANZ("GGAL","variacion")</code></td><td>Campo libre</td></tr>
      <tr><td><code>=BALANZ_FILA("GGAL")</code></td><td>Fila completa</td></tr>
      <tr><td><code>=BALANZ_HEADER()</code></td><td>Cabecera para BALANZ_FILA</td></tr>
    </table>

    <h3>Histórico de precios OHLCV</h3>
    <table>
      <tr><th>Fórmula</th><th>Descripción</th></tr>
      <tr><td><code>=BALANZ_HIST_PRECIO("AL30D","2024-01-01","2024-12-31")</code></td><td>Cierres históricos</td></tr>
      <tr><td><code>=BALANZ_HIST_MAXIMO("AL30D","2024-01-01","2024-12-31")</code></td><td>Máximos históricos</td></tr>
      <tr><td><code>=BALANZ_HIST_MINIMO("AL30D","2024-01-01","2024-12-31")</code></td><td>Mínimos históricos</td></tr>
      <tr><td><code>=BALANZ_HIST_VOLUMEN("AL30D","2024-01-01","2024-12-31")</code></td><td>Volumen histórico</td></tr>
      <tr><td><code>=BALANZ_HIST_OHLCV("AL30D","2024-01-01","2024-12-31")</code></td><td>Tabla OHLCV completa</td></tr>
      <tr><td><code>=BALANZ_HIST("AL30D","2024-01-01","2024-12-31","apertura")</code></td><td>Campo libre histórico</td></tr>
    </table>
    <div class="box">Campos disponibles para BALANZ_HIST: apertura · cierre · maximo · minimo · volumen · nominal</div>

    <h3>Evolución histórica de cartera</h3>
    <table>
      <tr><th>Fórmula</th><th>Descripción</th></tr>
      <tr><td><code>=BALANZ_EVOL_HEADER()</code></td><td>Cabecera</td></tr>
      <tr><td><code>=BALANZ_EVOL("2025-01-01","2026-03-05")</code></td><td>Evolución de tenencia diaria</td></tr>
    </table>

    <h3>Estado actual de cuenta</h3>
    <table>
      <tr><th>Fórmula</th><th>Descripción</th></tr>
      <tr><td><code>=BALANZ_SALDO()</code></td><td>Disponible pesos (CI)</td></tr>
      <tr><td><code>=BALANZ_SALDO_24()</code></td><td>Disponible pesos 24hs</td></tr>
      <tr><td><code>=BALANZ_SALDO_USD()</code></td><td>Disponible USD (CI)</td></tr>
      <tr><td><code>=BALANZ_SALDO_USD_24()</code></td><td>Disponible USD 24hs</td></tr>
      <tr><td><code>=BALANZ_MEP()</code></td><td>Dólar MEP</td></tr>
      <tr><td><code>=BALANZ_CCL()</code></td><td>Dólar CCL</td></tr>
      <tr><td><code>=BALANZ_TENENCIA_TOTAL()</code></td><td>Tenencia total en pesos</td></tr>
      <tr><td><code>=BALANZ_PORTAFOLIO_HEADER()</code></td><td>Cabecera posiciones</td></tr>
      <tr><td><code>=BALANZ_PORTAFOLIO()</code></td><td>Posiciones actuales</td></tr>
    </table>
  `).setTitle('📖 Fórmulas Balanz').setWidth(440).setHeight(680);
  SpreadsheetApp.getUi().showSidebar(html);
}

// ─── HELPERS INTERNOS ─────────────────────────────────────────────────────────

function getToken_() {
  const t = PropertiesService.getUserProperties().getProperty('balanz_token');
  if (!t) throw new Error("Token no configurado — usá 📊 Balanz → 🔑 Pegar token");
  return t;
}

function getCuenta_() {
  return PropertiesService.getUserProperties().getProperty('balanz_id_cuenta') || '';
}

/**
 * GET autenticado contra la API de Balanz.
 * Lanza error descriptivo si el token venció o hay otro problema.
 */
function balanzGet_(url) {
  const resp = UrlFetchApp.fetch(url, {
    method: "GET",
    headers: {
      "authorization": getToken_(),
      "accept":        "application/json",
      "content-type":  "application/json",
      "lang":          "es",
      "user-agent":    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    },
    muteHttpExceptions: true,
  });
  const code = resp.getResponseCode();
  if (code === 401 || code === 403)
    throw new Error("Token vencido — renovalo desde el menú 📊 Balanz → 🔑 Pegar token");
  if (code !== 200)
    throw new Error("HTTP " + code + " — " + resp.getContentText().substring(0, 120));
  return JSON.parse(resp.getContentText());
}

/** Convierte valores porcentuales que pueden venir como "10.02%" o como 10.02 */
function pct_(val) {
  if (!val && val !== 0) return 0;
  const n = parseFloat(String(val).replace("%","").trim());
  return isNaN(n) ? 0 : (n > 1 ? n / 100 : n);
}

/** Formatea fecha YYYY-MM-DD a YYYYMMDD (para parámetros de API) */
function fmtFecha_(fecha) {
  if (!fecha) return '';
  return String(fecha).replace(/-/g, '').replace(/\//g, '').substring(0, 8);
}

// ─── COTIZACIÓN ACTUAL (bonos, acciones, cedears, fondos) ─────────────────────

function fetchCotiz_(ticker) {
  const t = String(ticker).trim().toUpperCase();
  const c = getCuenta_();
  return balanzGet_(
    `https://clientes.balanz.com/api/v1/cotizacioninstrumento?idCuenta=${c}&ticker=${encodeURIComponent(t)}`
  );
}

function parseCotiz_(json, ticker) {
  const bond  = json.bond       || {};
  const cotiz = json.Cotizacion || {};
  return {
    descripcion:  cotiz.Descripcion || bond.description || String(ticker).toUpperCase(),
    precio:       parseFloat(bond.cleanPrice       || cotiz.UltimoPrecio)        || 0,
    tir:          pct_(bond.yield),
    tna:          pct_(bond.annualNominalRate),
    paridad:      parseFloat(bond.parity)          || 0,
    duration:     parseFloat(bond.duration)        || 0,
    convexity:    parseFloat(bond.convexity)       || 0,
    currentYield: pct_(bond.currentYield),
    ultimo:       parseFloat(cotiz.UltimoPrecio)   || parseFloat(bond.cleanPrice) || 0,
    variacion:    parseFloat(cotiz.pcp)            || 0,   // ya viene en %
    volumen:      parseFloat(cotiz.Volumen)        || 0,
    apertura:     parseFloat(cotiz.PrecioApertura) || 0,
    maximo:       parseFloat(cotiz.PrecioMaximo)   || 0,
    minimo:       parseFloat(cotiz.PrecioMinimo)   || 0,
    cierre:       parseFloat(cotiz.PrecioCierreAnterior) || 0,
    vwap:         parseFloat(cotiz.vwap)           || 0,
  };
}

// ─── HISTÓRICO DE PRECIOS ─────────────────────────────────────────────────────
// Endpoint verificado: /api/v1/historico/eventos?ticker=AE38&plazo=1&fullNormalize=false
// Campos JSON: fecha, precioapertura, preciocierre, preciominimo, preciomaximo,
//              totalnominal, volumen, ultimoprecio

/**
 * Histórico de precios para cualquier instrumento.
 * @param {string} ticker  Ej: "AL30D", "GGAL", "AE38"
 * @param {string} desde   Fecha inicio "YYYY-MM-DD" (opcional)
 * @param {string} hasta   Fecha fin    "YYYY-MM-DD" (opcional)
 * @param {string} campo   apertura|cierre|maximo|minimo|volumen|nominal (default: cierre)
 * @return {Array} Tabla con fecha y valor
 * @customfunction
 */
function BALANZ_HIST(ticker, desde, hasta, campo) {
  if (!ticker) return [["Falta ticker"]];
  const t = String(ticker).trim().toUpperCase();
  const c = (campo || "cierre").toLowerCase().trim();

  const json = balanzGet_(
    `https://clientes.balanz.com/api/v1/historico/eventos?ticker=${encodeURIComponent(t)}&plazo=1&fullNormalize=false`
  );

  let rows = json.historico || json.data || json || [];
  if (!Array.isArray(rows) || rows.length === 0) return [["Sin datos para " + t]];

  // Filtrar por rango de fechas si se especificó
  if (desde || hasta) {
    const d0 = desde ? new Date(desde) : null;
    const d1 = hasta ? new Date(hasta) : null;
    rows = rows.filter(r => {
      const f = new Date(r.fecha);
      return (!d0 || f >= d0) && (!d1 || f <= d1);
    });
  }

  const campoMap = {
    apertura: r => parseFloat(r.precioapertura) || 0,
    cierre:   r => parseFloat(r.preciocierre)   || parseFloat(r.ultimoprecio) || 0,
    maximo:   r => parseFloat(r.preciomaximo)   || 0,
    minimo:   r => parseFloat(r.preciominimo)   || 0,
    volumen:  r => parseFloat(r.volumen)        || 0,
    nominal:  r => parseFloat(r.totalnominal)   || 0,
    ultimo:   r => parseFloat(r.ultimoprecio)   || 0,
  };
  const fn = campoMap[c] || campoMap["cierre"];

  const label = c.charAt(0).toUpperCase() + c.slice(1);
  const out = [["Fecha", label]];
  rows.forEach(r => out.push([r.fecha, fn(r)]));
  return out;
}

/**
 * Histórico de precios de cierre.
 * @param {string} ticker  Ej: "AL30D"
 * @param {string} desde   "YYYY-MM-DD"
 * @param {string} hasta   "YYYY-MM-DD"
 * @customfunction
 */
function BALANZ_HIST_PRECIO(ticker, desde, hasta)  { return BALANZ_HIST(ticker, desde, hasta, "cierre"); }

/**
 * Histórico de precios máximos.
 * @param {string} ticker  Ej: "AL30D"
 * @param {string} desde   "YYYY-MM-DD"
 * @param {string} hasta   "YYYY-MM-DD"
 * @customfunction
 */
function BALANZ_HIST_MAXIMO(ticker, desde, hasta)  { return BALANZ_HIST(ticker, desde, hasta, "maximo"); }

/**
 * Histórico de precios mínimos.
 * @param {string} ticker  Ej: "AL30D"
 * @param {string} desde   "YYYY-MM-DD"
 * @param {string} hasta   "YYYY-MM-DD"
 * @customfunction
 */
function BALANZ_HIST_MINIMO(ticker, desde, hasta)  { return BALANZ_HIST(ticker, desde, hasta, "minimo"); }

/**
 * Histórico de volumen.
 * @param {string} ticker  Ej: "AL30D"
 * @param {string} desde   "YYYY-MM-DD"
 * @param {string} hasta   "YYYY-MM-DD"
 * @customfunction
 */
function BALANZ_HIST_VOLUMEN(ticker, desde, hasta) { return BALANZ_HIST(ticker, desde, hasta, "volumen"); }

/**
 * Tabla completa OHLCV (Apertura, Máximo, Mínimo, Cierre, Volumen).
 * @param {string} ticker  Ej: "AL30D"
 * @param {string} desde   "YYYY-MM-DD" (opcional)
 * @param {string} hasta   "YYYY-MM-DD" (opcional)
 * @customfunction
 */
function BALANZ_HIST_OHLCV(ticker, desde, hasta) {
  if (!ticker) return [["Falta ticker"]];
  const t = String(ticker).trim().toUpperCase();

  const json = balanzGet_(
    `https://clientes.balanz.com/api/v1/historico/eventos?ticker=${encodeURIComponent(t)}&plazo=1&fullNormalize=false`
  );

  let rows = json.historico || json.data || json || [];
  if (!Array.isArray(rows) || rows.length === 0) return [["Sin datos para " + t]];

  if (desde || hasta) {
    const d0 = desde ? new Date(desde) : null;
    const d1 = hasta ? new Date(hasta) : null;
    rows = rows.filter(r => {
      const f = new Date(r.fecha);
      return (!d0 || f >= d0) && (!d1 || f <= d1);
    });
  }

  const out = [["Fecha", "Apertura", "Máximo", "Mínimo", "Cierre", "Volumen", "Nominal"]];
  rows.forEach(r => out.push([
    r.fecha,
    parseFloat(r.precioapertura) || 0,
    parseFloat(r.preciomaximo)   || 0,
    parseFloat(r.preciominimo)   || 0,
    parseFloat(r.preciocierre)   || parseFloat(r.ultimoprecio) || 0,
    parseFloat(r.volumen)        || 0,
    parseFloat(r.totalnominal)   || 0,
  ]));
  return out;
}

// ─── EVOLUCIÓN HISTÓRICA DE CARTERA ──────────────────────────────────────────
// Endpoint verificado: /api/v1/evoluciondecartera/{idCuenta}?FechaDesde=YYYYMMDD&FechaHasta=YYYYMMDD&idMoneda=1&Tenencia=1&Eventos=1
// Campos JSON: Fecha, Tenencia, Dolares, Pesos, Bonos, FCI, Acciones, Monedas,
//              MonedasPesos, MonedasDolares, Opciones

/**
 * Cabecera para BALANZ_EVOL.
 * @customfunction
 */
function BALANZ_EVOL_HEADER() {
  return [["Fecha","Tenencia Total","Pesos","Dólares","Bonos","FCI","Acciones","Monedas","Opciones"]];
}

/**
 * Evolución histórica de cartera entre dos fechas.
 * @param {string} desde  Fecha inicio "YYYY-MM-DD"
 * @param {string} hasta  Fecha fin    "YYYY-MM-DD"
 * @customfunction
 */
function BALANZ_EVOL(desde, hasta) {
  const cuenta = getCuenta_();
  if (!cuenta) return [["ID de cuenta no configurado — pegá el token con idCuenta"]];

  const d = fmtFecha_(desde || Utilities.formatDate(new Date(Date.now() - 30*86400000), "UTC", "yyyy-MM-dd"));
  const h = fmtFecha_(hasta || Utilities.formatDate(new Date(), "UTC", "yyyy-MM-dd"));

  const url  = `https://clientes.balanz.com/api/v1/evoluciondecartera/${cuenta}?FechaDesde=${d}&FechaHasta=${h}&idMoneda=1&Tenencia=1&Eventos=1`;
  const json = balanzGet_(url);

  const rows = json.evolucion || json.historico || json.data || json || [];
  if (!Array.isArray(rows) || rows.length === 0) return [["Sin datos en ese rango de fechas"]];

  return rows.map(r => [
    r.Fecha        || r.fecha        || "",
    parseFloat(r.Tenencia      || 0),
    parseFloat(r.Pesos         || 0),
    parseFloat(r.Dolares       || 0),
    parseFloat(r.Bonos         || 0),
    parseFloat(r.FCI           || 0),
    parseFloat(r.Acciones      || 0),
    parseFloat(r.Monedas       || 0),
    parseFloat(r.Opciones      || 0),
  ]);
}

// ─── ESTADO DE CUENTA (saldos, tenencias, portafolio) ─────────────────────────
// Endpoint verificado: /api/v1/estadodecuenta/{idCuenta}?Fecha=YYYYMMDD&ta=1&idMoneda=1
// Campos JSON verificados:
//   liquidez[].idMoneda / .DInm (CI) / .D24 (24hs) / .CotizacionMEP
//   tenenciaActual[].TotalPesos / .CotizacionMEP / .CotizacionCCL
//   tenencia[] / tenenciaAgrupada[]

function fetchEstadoCuenta_() {
  const cuenta = getCuenta_();
  if (!cuenta) throw new Error("ID de cuenta no configurado — pegá el token con idCuenta");
  const hoy = Utilities.formatDate(new Date(), "America/Argentina/Buenos_Aires", "yyyyMMdd");
  return balanzGet_(
    `https://clientes.balanz.com/api/v1/estadodecuenta/${cuenta}?Fecha=${hoy}&ta=1&idMoneda=1`
  );
}

/**
 * Saldo disponible en pesos — liquidación inmediata (CI).
 * @customfunction
 */
function BALANZ_SALDO() {
  const json = fetchEstadoCuenta_();
  const liq  = (json.liquidez || []).find(l => l.idMoneda === 1) || {};
  return parseFloat(liq.DInm || liq.D24 || 0);
}

/**
 * Saldo disponible en pesos — 24hs.
 * @customfunction
 */
function BALANZ_SALDO_24() {
  const json = fetchEstadoCuenta_();
  const liq  = (json.liquidez || []).find(l => l.idMoneda === 1) || {};
  return parseFloat(liq.D24 || 0);
}

/**
 * Saldo disponible en dólares — liquidación inmediata (CI).
 * @customfunction
 */
function BALANZ_SALDO_USD() {
  const json = fetchEstadoCuenta_();
  const liq  = (json.liquidez || []).find(l => l.idMoneda === 2) || {};
  return parseFloat(liq.DInm || liq.D24 || 0);
}

/**
 * Saldo disponible en dólares — 24hs.
 * @customfunction
 */
function BALANZ_SALDO_USD_24() {
  const json = fetchEstadoCuenta_();
  const liq  = (json.liquidez || []).find(l => l.idMoneda === 2) || {};
  return parseFloat(liq.D24 || 0);
}

/**
 * Dólar MEP según Balanz.
 * @customfunction
 */
function BALANZ_MEP() {
  const json   = fetchEstadoCuenta_();
  const actual = (json.tenenciaActual || [])[0] || {};
  // También puede venir en cotizacionesDolar
  if (actual.CotizacionMEP) return parseFloat(actual.CotizacionMEP);
  const mep = (json.cotizacionesDolar || []).find(d => d.tipo === 2 || (d.Descripcion||"").toLowerCase().includes("mep"));
  return parseFloat((mep || {}).PrecioVenta || (mep || {}).PrecioCompra || 0);
}

/**
 * Dólar CCL según Balanz.
 * @customfunction
 */
function BALANZ_CCL() {
  const json   = fetchEstadoCuenta_();
  const actual = (json.tenenciaActual || [])[0] || {};
  if (actual.CotizacionCCL) return parseFloat(actual.CotizacionCCL);
  const ccl = (json.cotizacionesDolar || []).find(d => d.tipo === 3 || (d.Descripcion||"").toLowerCase().includes("cable") || (d.Descripcion||"").toLowerCase().includes("ccl"));
  return parseFloat((ccl || {}).PrecioVenta || (ccl || {}).PrecioCompra || 0);
}

/**
 * Tenencia total de la cuenta en pesos.
 * @customfunction
 */
function BALANZ_TENENCIA_TOTAL() {
  const json   = fetchEstadoCuenta_();
  const actual = (json.tenenciaActual || [])[0] || {};
  return parseFloat(actual.TotalPesos || actual.Total || 0);
}

/**
 * Cabecera para BALANZ_PORTAFOLIO.
 * @customfunction
 */
function BALANZ_PORTAFOLIO_HEADER() {
  return [["Ticker","Descripción","Cantidad","Disponible","Precio Costo","Precio Actual","Valor Actual","Rendimiento $","Rendimiento %","Moneda"]];
}

/**
 * Posiciones actuales de la cuenta (tenencias).
 * @customfunction
 */
function BALANZ_PORTAFOLIO() {
  const json  = fetchEstadoCuenta_();

  // Balanz puede devolver las posiciones en tenencia, tenenciaAgrupada, o items dentro de cada uno
  let items = [];

  // tenenciaAgrupada suele tener grupos con sub-items
  const agrupada = json.tenenciaAgrupada || [];
  agrupada.forEach(grupo => {
    const sub = grupo.tenencia || grupo.items || grupo.Tenencia || [];
    if (Array.isArray(sub)) items = items.concat(sub);
    else if (grupo.Ticker || grupo.ticker) items.push(grupo);
  });

  // tenencia plana
  if (items.length === 0) {
    items = json.tenencia || [];
  }

  if (!Array.isArray(items) || items.length === 0) {
    return [["Sin posiciones — la cuenta puede estar vacía o los datos aún no cargaron"]];
  }

  return items.map(i => [
    i.Ticker        || i.ticker        || i.Simbolo   || "",
    i.Descripcion   || i.descripcion   || i.Nombre    || "",
    parseFloat(i.Cantidad    || i.cantidad    || 0),
    parseFloat(i.Disponible  || i.disponible  || 0),
    parseFloat(i.PrecioCosto || i.precioCosto || i.PrecioPromedio || 0),
    parseFloat(i.PrecioActual|| i.precioActual|| i.UltimoPrecio   || 0),
    parseFloat(i.ValorActual || i.valorActual || 0),
    parseFloat(i.Rendimiento || i.rendimiento || i.GananciaPesos  || 0),
    parseFloat(i.RendimientoPorc || i.rendimientoPorc || i.GananciaPorcentaje || 0),
    i.Moneda        || i.moneda        || "",
  ]);
}

// ─── FÓRMULAS INDIVIDUALES ────────────────────────────────────────────────────

/**
 * Precio limpio del bono.
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_PRECIO(ticker)    { return parseCotiz_(fetchCotiz_(ticker), ticker).precio; }

/**
 * TIR / YTM del bono (número decimal, ej 0.1002 = 10.02%).
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_TIR(ticker)       { return parseCotiz_(fetchCotiz_(ticker), ticker).tir; }

/**
 * Tasa Nominal Anual del bono (decimal).
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_TNA(ticker)       { return parseCotiz_(fetchCotiz_(ticker), ticker).tna; }

/**
 * Paridad del bono (decimal, ej 0.785 = 78.5%).
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_PARIDAD(ticker)   { return parseCotiz_(fetchCotiz_(ticker), ticker).paridad; }

/**
 * Duration modificada del bono.
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_DURATION(ticker)  { return parseCotiz_(fetchCotiz_(ticker), ticker).duration; }

/**
 * Convexity del bono.
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_CONVEXITY(ticker) { return parseCotiz_(fetchCotiz_(ticker), ticker).convexity; }

/**
 * Current Yield del bono (decimal).
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_CY(ticker)        { return parseCotiz_(fetchCotiz_(ticker), ticker).currentYield; }

/**
 * Nombre o descripción del instrumento.
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_NOMBRE(ticker)    { return parseCotiz_(fetchCotiz_(ticker), ticker).descripcion; }

/**
 * Último precio del instrumento.
 * @param {string} ticker  Ej: "GGAL", "AL30D", "AAPLC"
 * @customfunction
 */
function BALANZ_ULTIMO(ticker)    { return parseCotiz_(fetchCotiz_(ticker), ticker).ultimo; }

/**
 * Variación porcentual del día (decimal, ej 0.0394 = 3.94%).
 * @param {string} ticker  Ej: "GGAL"
 * @customfunction
 */
function BALANZ_VARIACION(ticker) { return parseCotiz_(fetchCotiz_(ticker), ticker).variacion / 100; }

/**
 * Volumen operado en el día.
 * @param {string} ticker  Ej: "GGAL"
 * @customfunction
 */
function BALANZ_VOLUMEN(ticker)   { return parseCotiz_(fetchCotiz_(ticker), ticker).volumen; }

/**
 * Precio de apertura del día.
 * @param {string} ticker  Ej: "GGAL"
 * @customfunction
 */
function BALANZ_APERTURA(ticker)  { return parseCotiz_(fetchCotiz_(ticker), ticker).apertura; }

/**
 * Precio máximo del día.
 * @param {string} ticker  Ej: "GGAL"
 * @customfunction
 */
function BALANZ_MAXIMO(ticker)    { return parseCotiz_(fetchCotiz_(ticker), ticker).maximo; }

/**
 * Precio mínimo del día.
 * @param {string} ticker  Ej: "GGAL"
 * @customfunction
 */
function BALANZ_MINIMO(ticker)    { return parseCotiz_(fetchCotiz_(ticker), ticker).minimo; }

/**
 * Precio de cierre del día anterior.
 * @param {string} ticker  Ej: "GGAL"
 * @customfunction
 */
function BALANZ_CIERRE(ticker)    { return parseCotiz_(fetchCotiz_(ticker), ticker).cierre; }

/**
 * VWAP del día.
 * @param {string} ticker  Ej: "GGAL"
 * @customfunction
 */
function BALANZ_VWAP(ticker)      { return parseCotiz_(fetchCotiz_(ticker), ticker).vwap; }

/**
 * Campo libre de cualquier instrumento.
 * @param {string} ticker  Ej: "AL30D", "GGAL", "AAPLC"
 * @param {string} campo   precio|tir|tna|paridad|duration|convexity|cy|descripcion|ultimo|variacion|volumen|apertura|maximo|minimo|cierre|vwap
 * @customfunction
 */
function BALANZ(ticker, campo) {
  if (!ticker) return "Falta ticker";
  if (!campo)  return "Falta campo";
  const c = String(campo).trim().toLowerCase().replace(/[^a-z]/g,"");
  const d = parseCotiz_(fetchCotiz_(ticker), ticker);
  const m = {
    precio:d.precio, tir:d.tir, ytm:d.tir, tna:d.tna,
    paridad:d.paridad, duration:d.duration, convexity:d.convexity,
    cy:d.currentYield, currentyield:d.currentYield,
    descripcion:d.descripcion, nombre:d.descripcion,
    ultimo:d.ultimo, variacion:d.variacion/100,
    volumen:d.volumen, apertura:d.apertura,
    maximo:d.maximo, minimo:d.minimo, cierre:d.cierre, vwap:d.vwap,
  };
  return (c in m) ? m[c] : "Campo inválido: " + campo;
}

/**
 * Todos los datos del instrumento en una fila.
 * @param {string} ticker  Ej: "AL30D", "GGAL"
 * @customfunction
 */
function BALANZ_FILA(ticker) {
  if (!ticker) return [["Falta ticker"]];
  const t = String(ticker).trim().toUpperCase();
  const d = parseCotiz_(fetchCotiz_(t), t);
  return [[t, d.descripcion, d.ultimo, d.variacion/100, d.volumen,
           d.paridad, d.tir, d.tna, d.duration, d.convexity, d.currentYield, d.precio]];
}

/**
 * Cabecera de columnas para BALANZ_FILA.
 * @customfunction
 */
function BALANZ_HEADER() {
  return [["Ticker","Descripción","Último","Variación %","Volumen",
           "Paridad","TIR","TNA","Duration","Convexity","Current Yield","Precio Limpio"]];
}
