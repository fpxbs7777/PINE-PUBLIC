/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║              BALANZ — Funciones personalizadas Google Sheets v9              ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  ── BONOS / RENTA FIJA ─────────────────────────────────────────────────    ║
 * ║  =BALANZ_PRECIO(ticker)             Precio limpio                            ║
 * ║  =BALANZ_TIR(ticker)                TIR / YTM                                ║
 * ║  =BALANZ_TNA(ticker)                Tasa nominal anual                       ║
 * ║  =BALANZ_PARIDAD(ticker)            Paridad                                  ║
 * ║  =BALANZ_DURATION(ticker)           Duration modificada                      ║
 * ║  =BALANZ_MACAULAY(ticker)           Duration de Macaulay                     ║
 * ║  =BALANZ_CONVEXITY(ticker)          Convexity                                ║
 * ║  =BALANZ_CY(ticker)                 Current Yield                            ║
 * ║  =BALANZ_NOMBRE(ticker)             Nombre del instrumento                   ║
 * ║  =BALANZ_VENCIMIENTO(ticker)        Fecha de vencimiento                     ║
 * ║  =BALANZ_EMISION(ticker)            Fecha de emisión                         ║
 * ║  =BALANZ_PROXIMO_PAGO(ticker)       Fecha próximo pago                       ║
 * ║  =BALANZ_PROXIMO_PAGO_INFO(ticker)  Descripción próximo pago                 ║
 * ║  =BALANZ_DIAS_PAGO(ticker)          Días hasta próximo pago                  ║
 * ║  =BALANZ_CUPON(ticker)              Tasa de cupón                            ║
 * ║  =BALANZ_TIPO_CUPON(ticker)         Tipo de cupón                            ║
 * ║  =BALANZ_FRECUENCIA(ticker)         Frecuencia de pagos                      ║
 * ║  =BALANZ_RESIDUAL(ticker)           Valor residual                           ║
 * ║  =BALANZ_VALOR_TECNICO(ticker)      Valor técnico                            ║
 * ║  =BALANZ_INTERES_DEV(ticker)        Interés devengado                        ║
 * ║  =BALANZ_MONEDA(ticker)             Moneda del bono                          ║
 * ║  =BALANZ_JURISDICCION(ticker)       Jurisdicción (ARG / NY)                  ║
 * ║  =BALANZ_ISIN(ticker)               Código ISIN                              ║
 * ║                                                                              ║
 * ║  ── CUALQUIER INSTRUMENTO ──────────────────────────────────────────────     ║
 * ║  =BALANZ_ULTIMO(ticker)             Último precio                            ║
 * ║  =BALANZ_VARIACION(ticker)          Variación % del día                      ║
 * ║  =BALANZ_VOLUMEN(ticker)            Volumen operado                          ║
 * ║  =BALANZ_APERTURA(ticker)           Precio apertura                          ║
 * ║  =BALANZ_MAXIMO(ticker)             Máximo del día                           ║
 * ║  =BALANZ_MINIMO(ticker)             Mínimo del día                           ║
 * ║  =BALANZ_CIERRE(ticker)             Cierre anterior                          ║
 * ║  =BALANZ_VWAP(ticker)               VWAP del día                             ║
 * ║  =BALANZ(ticker, campo)             Campo libre — ver lista completa abajo   ║
 * ║  =BALANZ_FILA(ticker)               Fila completa de datos                   ║
 * ║  =BALANZ_HEADER()                   Cabecera para BALANZ_FILA                ║
 * ║                                                                              ║
 * ║  Campos válidos para =BALANZ(ticker, campo):                                 ║
 * ║  precio · tir · ytm · tna · paridad · duration · macaulay · convexity       ║
 * ║  cy · currentyield · descripcion · nombre · ultimo · variacion · volumen    ║
 * ║  apertura · maximo · minimo · cierre · vwap · vencimiento · emision         ║
 * ║  proximopago · proximopagoinfo · diaspago · cupon · tipocupon · frecuencia  ║
 * ║  residual · valortecnico · interesdev · moneda · jurisdiccion · isin        ║
 * ║                                                                              ║
 * ║  ── HISTÓRICO DE PRECIOS (OHLCV) ───────────────────────────────────────    ║
 * ║  =BALANZ_HIST(ticker, desde, hasta, campo)                                   ║
 * ║  =BALANZ_HIST_PRECIO(ticker, desde, hasta)                                   ║
 * ║  =BALANZ_HIST_MAXIMO(ticker, desde, hasta)                                   ║
 * ║  =BALANZ_HIST_MINIMO(ticker, desde, hasta)                                   ║
 * ║  =BALANZ_HIST_VOLUMEN(ticker, desde, hasta)                                  ║
 * ║  =BALANZ_HIST_OHLCV(ticker, desde, hasta)                                    ║
 * ║                                                                              ║
 * ║  ── EVOLUCIÓN DE CARTERA ────────────────────────────────────────────────    ║
 * ║  =BALANZ_EVOL(desde, hasta)                                                  ║
 * ║  =BALANZ_EVOL_HEADER()                                                       ║
 * ║                                                                              ║
 * ║  ── ESTADO ACTUAL DE CUENTA ────────────────────────────────────────────     ║
 * ║  =BALANZ_SALDO()                    Saldo disponible en pesos (CI)           ║
 * ║  =BALANZ_SALDO_24()                 Saldo disponible pesos 24hs              ║
 * ║  =BALANZ_SALDO_USD()                Saldo disponible USD (CI)                ║
 * ║  =BALANZ_SALDO_USD_24()             Saldo disponible USD 24hs                ║
 * ║  =BALANZ_MEP()                      Dólar MEP actual                         ║
 * ║  =BALANZ_CCL()                      Dólar CCL actual                         ║
 * ║  =BALANZ_TENENCIA_TOTAL()           Tenencia total en pesos                  ║
 * ║  =BALANZ_PORTAFOLIO_HEADER()        Cabecera de posiciones                   ║
 * ║  =BALANZ_PORTAFOLIO()               Posiciones actuales                      ║
 * ║                                                                              ║
 * ║  ── FCI — FONDOS COMUNES DE INVERSIÓN ──────────────────────────────────    ║
 * ║  =BALANZ_FCI_CUOTAPARTE(ticker)     Precio cuotaparte actual                 ║
 * ║  =BALANZ_FCI_VARIACION(ticker)      Variación % vs día anterior              ║
 * ║  =BALANZ_FCI_VAR_SEMANAL(ticker)    Variación % semanal                      ║
 * ║  =BALANZ_FCI_VAR_MES(ticker)        Variación % 1 mes                        ║
 * ║  =BALANZ_FCI_VAR_3MESES(ticker)     Variación % 3 meses                      ║
 * ║  =BALANZ_FCI_VAR_ANUAL(ticker)      Variación % 12 meses                     ║
 * ║  =BALANZ_FCI_VAR_YTD(ticker)        Variación % año a la fecha               ║
 * ║  =BALANZ_FCI_VAR_INICIO(ticker)     Variación % desde inicio del fondo       ║
 * ║  =BALANZ_FCI_FECHA(ticker)          Fecha del último dato                    ║
 * ║  =BALANZ_FCI_NOMBRE(ticker)         Nombre completo del fondo                ║
 * ║  =BALANZ_FCI_NOMBRE_CORTO(ticker)   Categoría / nombre corto                 ║
 * ║  =BALANZ_FCI_MONEDA(ticker)         Moneda del fondo (ARS / USD)             ║
 * ║  =BALANZ_FCI(ticker, campo)         Campo libre FCI                          ║
 * ║  =BALANZ_FCI_FILA(ticker)           Fila completa de datos FCI               ║
 * ║  =BALANZ_FCI_HEADER()               Cabecera para BALANZ_FCI_FILA            ║
 * ║  =BALANZ_FCI_HIST(ticker,desde,hasta) Histórico de cuotapartes               ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 *  Endpoints verificados:
 *  · Cotización:    /api/v1/cotizacioninstrumento?idCuenta={id}&ticker={t}
 *  · Histórico:     /api/v1/historico/eventos?ticker={t}&plazo=1&fullNormalize=false
 *  · Ev. cartera:   /api/v1/evoluciondecartera/{id}?FechaDesde={d}&FechaHasta={h}&idMoneda=1&Tenencia=1&Eventos=1
 *  · Estado cta:    /api/v1/estadodecuenta/{id}?Fecha={d}&ta=1&idMoneda=1
 *  · FCI info:      /api/v1/fondos?ticker={t}
 *  · FCI histórico: /api/v1/historico/eventos?ticker={t}&plazo=1&fullNormalize=false → valorcuotaparte
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

    <h3>Bonos / Renta fija</h3>
    <table>
      <tr><th>Fórmula</th><th>Descripción</th></tr>
      <tr><td><code>=BALANZ_PRECIO("AL30D")</code></td><td>Precio limpio</td></tr>
      <tr><td><code>=BALANZ_TIR("AL30D")</code></td><td>TIR / YTM</td></tr>
      <tr><td><code>=BALANZ_TNA("AL30D")</code></td><td>Tasa nominal anual</td></tr>
      <tr><td><code>=BALANZ_PARIDAD("AL30D")</code></td><td>Paridad</td></tr>
      <tr><td><code>=BALANZ_DURATION("AL30D")</code></td><td>Duration modificada</td></tr>
      <tr><td><code>=BALANZ_MACAULAY("AL30D")</code></td><td>Duration de Macaulay</td></tr>
      <tr><td><code>=BALANZ_CONVEXITY("AL30D")</code></td><td>Convexity</td></tr>
      <tr><td><code>=BALANZ_CY("AL30D")</code></td><td>Current Yield</td></tr>
      <tr><td><code>=BALANZ_VENCIMIENTO("AL30D")</code></td><td>Fecha de vencimiento</td></tr>
      <tr><td><code>=BALANZ_EMISION("AL30D")</code></td><td>Fecha de emisión</td></tr>
      <tr><td><code>=BALANZ_PROXIMO_PAGO("AL30D")</code></td><td>Fecha próximo pago</td></tr>
      <tr><td><code>=BALANZ_PROXIMO_PAGO_INFO("AL30D")</code></td><td>Info próximo pago</td></tr>
      <tr><td><code>=BALANZ_DIAS_PAGO("AL30D")</code></td><td>Días hasta próximo pago</td></tr>
      <tr><td><code>=BALANZ_CUPON("AL30D")</code></td><td>Tasa de cupón</td></tr>
      <tr><td><code>=BALANZ_TIPO_CUPON("AL30D")</code></td><td>Tipo de cupón</td></tr>
      <tr><td><code>=BALANZ_FRECUENCIA("AL30D")</code></td><td>Frecuencia de pagos</td></tr>
      <tr><td><code>=BALANZ_RESIDUAL("AL30D")</code></td><td>Valor residual</td></tr>
      <tr><td><code>=BALANZ_VALOR_TECNICO("AL30D")</code></td><td>Valor técnico</td></tr>
      <tr><td><code>=BALANZ_INTERES_DEV("AL30D")</code></td><td>Interés devengado</td></tr>
      <tr><td><code>=BALANZ_MONEDA("AL30D")</code></td><td>Moneda (USD / ARS)</td></tr>
      <tr><td><code>=BALANZ_JURISDICCION("AL30D")</code></td><td>Jurisdicción (ARG / NY)</td></tr>
      <tr><td><code>=BALANZ_ISIN("AL30D")</code></td><td>Código ISIN</td></tr>
      <tr><td><code>=BALANZ_NOMBRE("AL30D")</code></td><td>Nombre del instrumento</td></tr>
    </table>

    <h3>Campo libre — cualquier instrumento</h3>
    <table>
      <tr><th>Fórmula</th><th>Descripción</th></tr>
      <tr><td><code>=BALANZ("AL30D","vencimiento")</code></td><td>Campo libre</td></tr>
      <tr><td><code>=BALANZ_ULTIMO("GGAL")</code></td><td>Último precio</td></tr>
      <tr><td><code>=BALANZ_VARIACION("GGAL")</code></td><td>Variación % del día</td></tr>
      <tr><td><code>=BALANZ_VOLUMEN("GGAL")</code></td><td>Volumen operado</td></tr>
      <tr><td><code>=BALANZ_APERTURA("GGAL")</code></td><td>Precio apertura</td></tr>
      <tr><td><code>=BALANZ_MAXIMO("GGAL")</code></td><td>Máximo del día</td></tr>
      <tr><td><code>=BALANZ_MINIMO("GGAL")</code></td><td>Mínimo del día</td></tr>
      <tr><td><code>=BALANZ_CIERRE("GGAL")</code></td><td>Cierre anterior</td></tr>
      <tr><td><code>=BALANZ_VWAP("GGAL")</code></td><td>VWAP del día</td></tr>
      <tr><td><code>=BALANZ_FILA("AL30D")</code></td><td>Fila completa</td></tr>
      <tr><td><code>=BALANZ_HEADER()</code></td><td>Cabecera para BALANZ_FILA</td></tr>
    </table>
    <div class="box">
      Campos para =BALANZ(ticker, campo):<br>
      precio · tir · ytm · tna · paridad · duration · macaulay · convexity · cy · currentyield<br>
      descripcion · nombre · ultimo · variacion · volumen · apertura · maximo · minimo · cierre · vwap<br>
      vencimiento · emision · proximopago · proximopagoinfo · diaspago<br>
      cupon · tipocupon · frecuencia · residual · valortecnico · interesdev<br>
      moneda · jurisdiccion · isin
    </div>

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
    <div class="box">Campos para BALANZ_HIST: apertura · cierre · maximo · minimo · volumen · nominal</div>

    <h3>Evolución histórica de cartera</h3>
    <table>
      <tr><th>Fórmula</th><th>Descripción</th></tr>
      <tr><td><code>=BALANZ_EVOL_HEADER()</code></td><td>Cabecera</td></tr>
      <tr><td><code>=BALANZ_EVOL("2025-01-01","2026-03-09")</code></td><td>Evolución de tenencia diaria</td></tr>
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

    <h3>FCI — Fondos Comunes de Inversión</h3>
    <div class="warn">ℹ️ Balanz no expone volumen ni patrimonio por API para FCI. Las variaciones se calculan desde el histórico de cuotapartes.</div>
    <table>
      <tr><th>Fórmula</th><th>Descripción</th></tr>
      <tr><td><code>=BALANZ_FCI_CUOTAPARTE("BCAHA")</code></td><td>Precio cuotaparte actual</td></tr>
      <tr><td><code>=BALANZ_FCI_VARIACION("BCAHA")</code></td><td>Variación % vs día anterior</td></tr>
      <tr><td><code>=BALANZ_FCI_VAR_SEMANAL("BCAHA")</code></td><td>Variación % semanal (~5 háb.)</td></tr>
      <tr><td><code>=BALANZ_FCI_VAR_MES("BCAHA")</code></td><td>Variación % 1 mes (~21 háb.)</td></tr>
      <tr><td><code>=BALANZ_FCI_VAR_3MESES("BCAHA")</code></td><td>Variación % 3 meses</td></tr>
      <tr><td><code>=BALANZ_FCI_VAR_ANUAL("BCAHA")</code></td><td>Variación % 12 meses</td></tr>
      <tr><td><code>=BALANZ_FCI_VAR_YTD("BCAHA")</code></td><td>Variación % año a la fecha</td></tr>
      <tr><td><code>=BALANZ_FCI_VAR_INICIO("BCAHA")</code></td><td>Variación % desde inicio</td></tr>
      <tr><td><code>=BALANZ_FCI_FECHA("BCAHA")</code></td><td>Fecha del último dato</td></tr>
      <tr><td><code>=BALANZ_FCI_NOMBRE("BCAHA")</code></td><td>Nombre completo del fondo</td></tr>
      <tr><td><code>=BALANZ_FCI_NOMBRE_CORTO("BCAHA")</code></td><td>Categoría / nombre corto</td></tr>
      <tr><td><code>=BALANZ_FCI_MONEDA("BCAHA")</code></td><td>Moneda (ARS / USD)</td></tr>
      <tr><td><code>=BALANZ_FCI("BCAHA","varytd")</code></td><td>Campo libre FCI</td></tr>
      <tr><td><code>=BALANZ_FCI_FILA("BCAHA")</code></td><td>Fila completa</td></tr>
      <tr><td><code>=BALANZ_FCI_HEADER()</code></td><td>Cabecera para BALANZ_FCI_FILA</td></tr>
      <tr><td><code>=BALANZ_FCI_HIST("BCAHA","2026-01-01","2026-03-09")</code></td><td>Histórico cuotapartes</td></tr>
    </table>
    <div class="box">Campos para =BALANZ_FCI(ticker, campo):<br>
    cuotaparte · variacion · vardiaria · varsemanal · varmes · var3meses · varanual · varytd · varinicio · fecha · nombre · corto · moneda</div>
  `).setTitle('📖 Fórmulas Balanz').setWidth(440).setHeight(900);
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

function pct_(val) {
  if (!val && val !== 0) return 0;
  const n = parseFloat(String(val).replace("%","").trim());
  return isNaN(n) ? 0 : (n > 1 ? n / 100 : n);
}

function fmtFecha_(fecha) {
  if (!fecha) return '';
  return String(fecha).replace(/-/g, '').replace(/\//g, '').substring(0, 8);
}

// ─── COTIZACIÓN ACTUAL ────────────────────────────────────────────────────────

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
    // ── Descripción ───────────────────────────────────────────────────────────
    descripcion:      cotiz.Descripcion      || bond.description  || String(ticker).toUpperCase(),
    // ── Precio y cotización ───────────────────────────────────────────────────
    precio:           parseFloat(bond.cleanPrice            || cotiz.UltimoPrecio)   || 0,
    ultimo:           parseFloat(cotiz.UltimoPrecio)        || parseFloat(bond.cleanPrice) || 0,
    variacion:        parseFloat(cotiz.pcp)                 || 0,   // ya en %
    volumen:          parseFloat(cotiz.Volumen)             || 0,
    apertura:         parseFloat(cotiz.PrecioApertura)      || 0,
    maximo:           parseFloat(cotiz.PrecioMaximo)        || 0,
    minimo:           parseFloat(cotiz.PrecioMinimo)        || 0,
    cierre:           parseFloat(cotiz.PrecioCierreAnterior)|| 0,
    vwap:             parseFloat(cotiz.vwap)                || 0,
    // ── Renta fija — análisis ─────────────────────────────────────────────────
    tir:              pct_(bond.yield),
    tna:              pct_(bond.annualNominalRate),
    paridad:          parseFloat(bond.parity)               || 0,
    duration:         parseFloat(bond.duration)             || 0,
    macaulay:         parseFloat(bond.macaulayDuration)     || 0,
    convexity:        parseFloat(bond.convexity)            || 0,
    currentYield:     pct_(bond.currentYield),
    valorTecnico:     parseFloat(bond.technicalValue)       || 0,
    interesDevengado: parseFloat(bond.accruedInterest)      || 0,
    residual:         parseFloat(bond.residual)             || 0,
    // ── Renta fija — estructura ───────────────────────────────────────────────
    vencimiento:      bond.maturity          || "",   // "YYYY-MM-DD"
    emision:          bond.issuanceDate      || "",   // "YYYY-MM-DD"
    proximoPago:      bond.nextPaymentDate   || "",   // "YYYY-MM-DD"
    proximoPagoInfo:  bond.nextPaymentInfo   || "",   // "Renta X% + Amort. Y%"
    diasProximoPago:  parseInt(bond.nextPaymentDays  || 0),
    cupon:            bond.coupon            || "",   // "0.75%"
    tipoCupon:        bond.couponType        || "",   // "Fixed rate"
    frecuencia:       bond.frequency         || "",   // "Semiannual"
    tipoAmort:        bond.amortizationType  || "",   // "Sinkable"
    // ── Identificación ────────────────────────────────────────────────────────
    moneda:           bond.currency          || "",   // "USD"
    jurisdiccion:     bond.jurisdiction      || "",   // "ARG" / "NY"
    isin:             cotiz.ISIN             || "",
  };
}

// ─── HISTÓRICO DE PRECIOS ─────────────────────────────────────────────────────

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
  if (desde || hasta) {
    const d0 = desde ? new Date(desde) : null;
    const d1 = hasta ? new Date(hasta) : null;
    rows = rows.filter(r => { const f = new Date(r.fecha); return (!d0 || f >= d0) && (!d1 || f <= d1); });
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
 * Tabla completa OHLCV.
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
    rows = rows.filter(r => { const f = new Date(r.fecha); return (!d0 || f >= d0) && (!d1 || f <= d1); });
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

/**
 * Cabecera para BALANZ_EVOL.
 * @customfunction
 */
function BALANZ_EVOL_HEADER() {
  return [["Fecha","Tenencia Total","Pesos","Dólares","Bonos","FCI","Acciones","Monedas","Opciones"]];
}

/**
 * Evolución histórica de cartera entre dos fechas.
 * @param {string} desde  "YYYY-MM-DD"
 * @param {string} hasta  "YYYY-MM-DD"
 * @customfunction
 */
function BALANZ_EVOL(desde, hasta) {
  const cuenta = getCuenta_();
  if (!cuenta) return [["ID de cuenta no configurado — pegá el token con idCuenta"]];
  const d = fmtFecha_(desde || Utilities.formatDate(new Date(Date.now() - 30*86400000), "UTC", "yyyy-MM-dd"));
  const h = fmtFecha_(hasta || Utilities.formatDate(new Date(), "UTC", "yyyy-MM-dd"));
  const json = balanzGet_(
    `https://clientes.balanz.com/api/v1/evoluciondecartera/${cuenta}?FechaDesde=${d}&FechaHasta=${h}&idMoneda=1&Tenencia=1&Eventos=1`
  );
  const rows = json.evolucion || json.historico || json.data || json || [];
  if (!Array.isArray(rows) || rows.length === 0) return [["Sin datos en ese rango de fechas"]];
  return rows.map(r => [
    r.Fecha     || r.fecha     || "",
    parseFloat(r.Tenencia || 0),
    parseFloat(r.Pesos    || 0),
    parseFloat(r.Dolares  || 0),
    parseFloat(r.Bonos    || 0),
    parseFloat(r.FCI      || 0),
    parseFloat(r.Acciones || 0),
    parseFloat(r.Monedas  || 0),
    parseFloat(r.Opciones || 0),
  ]);
}

// ─── ESTADO DE CUENTA ─────────────────────────────────────────────────────────

function fetchEstadoCuenta_() {
  const cuenta = getCuenta_();
  if (!cuenta) throw new Error("ID de cuenta no configurado — pegá el token con idCuenta");
  const hoy = Utilities.formatDate(new Date(), "America/Argentina/Buenos_Aires", "yyyyMMdd");
  return balanzGet_(
    `https://clientes.balanz.com/api/v1/estadodecuenta/${cuenta}?Fecha=${hoy}&ta=1&idMoneda=1`
  );
}

/**
 * Saldo disponible en pesos — CI.
 * @customfunction
 */
function BALANZ_SALDO() {
  const liq = (fetchEstadoCuenta_().liquidez || []).find(l => l.idMoneda === 1) || {};
  return parseFloat(liq.DInm || liq.D24 || 0);
}

/**
 * Saldo disponible en pesos — 24hs.
 * @customfunction
 */
function BALANZ_SALDO_24() {
  const liq = (fetchEstadoCuenta_().liquidez || []).find(l => l.idMoneda === 1) || {};
  return parseFloat(liq.D24 || 0);
}

/**
 * Saldo disponible en dólares — CI.
 * @customfunction
 */
function BALANZ_SALDO_USD() {
  const liq = (fetchEstadoCuenta_().liquidez || []).find(l => l.idMoneda === 2) || {};
  return parseFloat(liq.DInm || liq.D24 || 0);
}

/**
 * Saldo disponible en dólares — 24hs.
 * @customfunction
 */
function BALANZ_SALDO_USD_24() {
  const liq = (fetchEstadoCuenta_().liquidez || []).find(l => l.idMoneda === 2) || {};
  return parseFloat(liq.D24 || 0);
}

/**
 * Dólar MEP según Balanz.
 * @customfunction
 */
function BALANZ_MEP() {
  const json   = fetchEstadoCuenta_();
  const actual = (json.tenenciaActual || [])[0] || {};
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
  const actual = (fetchEstadoCuenta_().tenenciaActual || [])[0] || {};
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
 * Posiciones actuales de la cuenta.
 * @customfunction
 */
function BALANZ_PORTAFOLIO() {
  const json = fetchEstadoCuenta_();
  let items = [];
  const agrupada = json.tenenciaAgrupada || [];
  agrupada.forEach(grupo => {
    const sub = grupo.tenencia || grupo.items || grupo.Tenencia || [];
    if (Array.isArray(sub)) items = items.concat(sub);
    else if (grupo.Ticker || grupo.ticker) items.push(grupo);
  });
  if (items.length === 0) items = json.tenencia || [];
  if (!Array.isArray(items) || items.length === 0)
    return [["Sin posiciones — la cuenta puede estar vacía o los datos aún no cargaron"]];
  return items.map(i => [
    i.Ticker         || i.ticker         || i.Simbolo          || "",
    i.Descripcion    || i.descripcion    || i.Nombre           || "",
    parseFloat(i.Cantidad        || i.cantidad        || 0),
    parseFloat(i.Disponible      || i.disponible      || 0),
    parseFloat(i.PrecioCosto     || i.precioCosto     || i.PrecioPromedio   || 0),
    parseFloat(i.PrecioActual    || i.precioActual    || i.UltimoPrecio     || 0),
    parseFloat(i.ValorActual     || i.valorActual     || 0),
    parseFloat(i.Rendimiento     || i.rendimiento     || i.GananciaPesos    || 0),
    parseFloat(i.RendimientoPorc || i.rendimientoPorc || i.GananciaPorcentaje || 0),
    i.Moneda || i.moneda || "",
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
 * TIR / YTM del bono (decimal, ej: 0.0944 = 9.44%).
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
 * Paridad del bono (decimal, ej: 0.840 = 84%).
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
 * Duration de Macaulay del bono.
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_MACAULAY(ticker)  { return parseCotiz_(fetchCotiz_(ticker), ticker).macaulay; }

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
 * @param {string} ticker  Ej: "GGAL", "AL30D"
 * @customfunction
 */
function BALANZ_ULTIMO(ticker)    { return parseCotiz_(fetchCotiz_(ticker), ticker).ultimo; }

/**
 * Variación porcentual del día (decimal, ej: 0.0394 = 3.94%).
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
 * Fecha de vencimiento del bono (YYYY-MM-DD).
 * @param {string} ticker  Ej: "AL30D", "AE38", "GD30D"
 * @customfunction
 */
function BALANZ_VENCIMIENTO(ticker)       { return parseCotiz_(fetchCotiz_(ticker), ticker).vencimiento; }

/**
 * Fecha de emisión del bono (YYYY-MM-DD).
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_EMISION(ticker)           { return parseCotiz_(fetchCotiz_(ticker), ticker).emision; }

/**
 * Fecha del próximo pago de cupón/amortización (YYYY-MM-DD).
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_PROXIMO_PAGO(ticker)      { return parseCotiz_(fetchCotiz_(ticker), ticker).proximoPago; }

/**
 * Descripción del próximo pago (ej: "Renta 0.75% + Amort. 8%").
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_PROXIMO_PAGO_INFO(ticker) { return parseCotiz_(fetchCotiz_(ticker), ticker).proximoPagoInfo; }

/**
 * Días hasta el próximo pago.
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_DIAS_PAGO(ticker)         { return parseCotiz_(fetchCotiz_(ticker), ticker).diasProximoPago; }

/**
 * Tasa de cupón del bono (ej: "0.75%").
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_CUPON(ticker)             { return parseCotiz_(fetchCotiz_(ticker), ticker).cupon; }

/**
 * Tipo de cupón (ej: "Fixed rate").
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_TIPO_CUPON(ticker)        { return parseCotiz_(fetchCotiz_(ticker), ticker).tipoCupon; }

/**
 * Frecuencia de pagos (ej: "Semiannual").
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_FRECUENCIA(ticker)        { return parseCotiz_(fetchCotiz_(ticker), ticker).frecuencia; }

/**
 * Valor residual del bono (decimal, ej: 0.72 = 72%).
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_RESIDUAL(ticker)          { return parseCotiz_(fetchCotiz_(ticker), ticker).residual; }

/**
 * Valor técnico del bono.
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_VALOR_TECNICO(ticker)     { return parseCotiz_(fetchCotiz_(ticker), ticker).valorTecnico; }

/**
 * Interés devengado del bono.
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_INTERES_DEV(ticker)       { return parseCotiz_(fetchCotiz_(ticker), ticker).interesDevengado; }

/**
 * Moneda del bono (ej: "USD").
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_MONEDA(ticker)            { return parseCotiz_(fetchCotiz_(ticker), ticker).moneda; }

/**
 * Jurisdicción del bono ("ARG" = ley local, "NY" = ley Nueva York).
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_JURISDICCION(ticker)      { return parseCotiz_(fetchCotiz_(ticker), ticker).jurisdiccion; }

/**
 * Código ISIN del instrumento.
 * @param {string} ticker  Ej: "AL30D"
 * @customfunction
 */
function BALANZ_ISIN(ticker)              { return parseCotiz_(fetchCotiz_(ticker), ticker).isin; }

/**
 * Campo libre — obtiene cualquier dato de cualquier instrumento.
 * @param {string} ticker  Ej: "AL30D", "GGAL", "AE38"
 * @param {string} campo   Ver lista completa en el encabezado del script
 * @customfunction
 */
function BALANZ(ticker, campo) {
  if (!ticker) return "Falta ticker";
  if (!campo)  return "Falta campo";
  const c = String(campo).trim().toLowerCase().replace(/[^a-z]/g, "");
  const d = parseCotiz_(fetchCotiz_(ticker), ticker);
  const m = {
    // Precio y cotización
    precio:          d.precio,
    ultimo:          d.ultimo,
    variacion:       d.variacion / 100,
    volumen:         d.volumen,
    apertura:        d.apertura,
    maximo:          d.maximo,
    minimo:          d.minimo,
    cierre:          d.cierre,
    vwap:            d.vwap,
    // Análisis renta fija
    tir:             d.tir,
    ytm:             d.tir,
    tna:             d.tna,
    paridad:         d.paridad,
    duration:        d.duration,
    macaulay:        d.macaulay,
    convexity:       d.convexity,
    cy:              d.currentYield,
    currentyield:    d.currentYield,
    valortecnico:    d.valorTecnico,
    interesdev:      d.interesDevengado,
    residual:        d.residual,
    // Estructura del bono
    vencimiento:     d.vencimiento,
    emision:         d.emision,
    proximopago:     d.proximoPago,
    proximopagoinfo: d.proximoPagoInfo,
    diaspago:        d.diasProximoPago,
    cupon:           d.cupon,
    tipocupon:       d.tipoCupon,
    frecuencia:      d.frecuencia,
    // Identificación
    descripcion:     d.descripcion,
    nombre:          d.descripcion,
    moneda:          d.moneda,
    jurisdiccion:    d.jurisdiccion,
    isin:            d.isin,
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
  return [[
    t,
    d.descripcion,
    d.ultimo,
    d.variacion / 100,
    d.volumen,
    d.vencimiento,
    d.emision,
    d.proximoPago,
    d.diasProximoPago,
    d.proximoPagoInfo,
    d.paridad,
    d.tir,
    d.tna,
    d.duration,
    d.macaulay,
    d.convexity,
    d.currentYield,
    d.precio,
    d.valorTecnico,
    d.interesDevengado,
    d.residual,
    d.cupon,
    d.tipoCupon,
    d.frecuencia,
    d.moneda,
    d.jurisdiccion,
    d.isin,
  ]];
}

/**
 * Cabecera de columnas para BALANZ_FILA.
 * @customfunction
 */
function BALANZ_HEADER() {
  return [[
    "Ticker","Descripción","Último","Variación %","Volumen",
    "Vencimiento","Emisión","Próximo Pago","Días al Pago","Info Próximo Pago",
    "Paridad","TIR","TNA","Duration","Macaulay","Convexity",
    "Current Yield","Precio Limpio","Valor Técnico","Interés Dev.","Residual",
    "Cupón","Tipo Cupón","Frecuencia",
    "Moneda","Jurisdicción","ISIN",
  ]];
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SECCIÓN FCI — FONDOS COMUNES DE INVERSIÓN
// ═══════════════════════════════════════════════════════════════════════════════
//
//  Endpoints confirmados:
//  · Info:      GET /api/v1/fondos?ticker={t}  → Descripcion, NombreCorto, idMoneda
//  · Histórico: GET /api/v1/historico/eventos?ticker={t}&plazo=1&fullNormalize=false
//               → { historico: [ { fecha, valorcuotaparte } ] }
//
//  Nota: Balanz NO expone volumen ni patrimonio por API para FCI.
// ───────────────────────────────────────────────────────────────────────────────

function fetchFCIInfo_(ticker) {
  const t = String(ticker).trim().toUpperCase();

  // 1) Info del fondo
  const infoJson = balanzGet_(
    `https://clientes.balanz.com/api/v1/fondos?ticker=${encodeURIComponent(t)}`
  );
  const fondos = infoJson.fondos || [];
  const info = fondos.find(f => f.Ticker === t)
            || fondos.find(f => t.startsWith(f.Ticker))
            || fondos[0]
            || {};

  // 2) Histórico completo
  const histJson = balanzGet_(
    `https://clientes.balanz.com/api/v1/historico/eventos?ticker=${encodeURIComponent(t)}&plazo=1&fullNormalize=false`
  );
  const hist = histJson.historico || [];
  if (hist.length === 0) throw new Error("Sin datos históricos para " + t);

  const ultimo   = hist[hist.length - 1];
  const anterior = hist.length > 1 ? hist[hist.length - 2] : ultimo;
  const cp       = parseFloat(ultimo.valorcuotaparte);
  const cpAnt    = parseFloat(anterior.valorcuotaparte);
  const cpInicio = parseFloat(hist[0].valorcuotaparte);

  function cpHace(n) {
    const idx = hist.length - 1 - n;
    return idx >= 0 ? parseFloat(hist[idx].valorcuotaparte) : null;
  }

  const anioActual    = new Date(ultimo.fecha).getFullYear();
  const primerDelAnio = hist.find(r => new Date(r.fecha).getFullYear() === anioActual);
  const cpYTD         = primerDelAnio ? parseFloat(primerDelAnio.valorcuotaparte) : null;

  function varPct(base) {
    if (!base || base === 0) return null;
    return (cp - base) / base;
  }

  return {
    ticker:     t,
    nombre:     info.Descripcion || t,
    corto:      info.NombreCorto || "",
    moneda:     info.idMoneda === 2 ? "USD" : "ARS",
    idFondo:    info.idFondo || "",
    cuotaparte: cp,
    fecha:      ultimo.fecha,
    varDiaria:  varPct(cpAnt),
    varSemanal: varPct(cpHace(5)),
    varMes:     varPct(cpHace(21)),
    var3Meses:  varPct(cpHace(63)),
    varAnual:   varPct(cpHace(252)),
    varYTD:     varPct(cpYTD),
    varInicio:  varPct(cpInicio),
    hist:       hist,
  };
}

/**
 * Precio de cuotaparte actual del fondo.
 * @param {string} ticker  Ej: "BCAHA", "BCAHB", "BRT", "BCRF"
 * @customfunction
 */
function BALANZ_FCI_CUOTAPARTE(ticker) { return fetchFCIInfo_(ticker).cuotaparte; }

/**
 * Variación % del día vs cuotaparte anterior (decimal).
 * @param {string} ticker  Ej: "BCAHA"
 * @customfunction
 */
function BALANZ_FCI_VARIACION(ticker)   { return fetchFCIInfo_(ticker).varDiaria; }

/**
 * Variación % semanal (~5 días hábiles) en decimal.
 * @param {string} ticker  Ej: "BCAHA"
 * @customfunction
 */
function BALANZ_FCI_VAR_SEMANAL(ticker) { return fetchFCIInfo_(ticker).varSemanal; }

/**
 * Variación % del último mes (~21 días hábiles) en decimal.
 * @param {string} ticker  Ej: "BCAHA"
 * @customfunction
 */
function BALANZ_FCI_VAR_MES(ticker)     { return fetchFCIInfo_(ticker).varMes; }

/**
 * Variación % últimos 3 meses (~63 días hábiles) en decimal.
 * @param {string} ticker  Ej: "BCAHA"
 * @customfunction
 */
function BALANZ_FCI_VAR_3MESES(ticker)  { return fetchFCIInfo_(ticker).var3Meses; }

/**
 * Variación % últimos 12 meses (~252 días hábiles) en decimal.
 * @param {string} ticker  Ej: "BCAHA"
 * @customfunction
 */
function BALANZ_FCI_VAR_ANUAL(ticker)   { return fetchFCIInfo_(ticker).varAnual; }

/**
 * Variación % año a la fecha (YTD) en decimal.
 * @param {string} ticker  Ej: "BCAHA"
 * @customfunction
 */
function BALANZ_FCI_VAR_YTD(ticker)     { return fetchFCIInfo_(ticker).varYTD; }

/**
 * Variación % desde el primer día registrado del fondo en decimal.
 * @param {string} ticker  Ej: "BCAHA"
 * @customfunction
 */
function BALANZ_FCI_VAR_INICIO(ticker)  { return fetchFCIInfo_(ticker).varInicio; }

/**
 * Fecha del último dato disponible.
 * @param {string} ticker  Ej: "BCAHA"
 * @customfunction
 */
function BALANZ_FCI_FECHA(ticker)       { return fetchFCIInfo_(ticker).fecha; }

/**
 * Nombre completo del fondo.
 * @param {string} ticker  Ej: "BCAHA"
 * @customfunction
 */
function BALANZ_FCI_NOMBRE(ticker)      { return fetchFCIInfo_(ticker).nombre; }

/**
 * Nombre corto o categoría del fondo.
 * @param {string} ticker  Ej: "BCAHA"
 * @customfunction
 */
function BALANZ_FCI_NOMBRE_CORTO(ticker){ return fetchFCIInfo_(ticker).corto; }

/**
 * Moneda del fondo (ARS o USD).
 * @param {string} ticker  Ej: "BCAHA"
 * @customfunction
 */
function BALANZ_FCI_MONEDA(ticker)      { return fetchFCIInfo_(ticker).moneda; }

/**
 * Campo libre de un FCI.
 * @param {string} ticker  Ej: "BCAHA"
 * @param {string} campo   cuotaparte|variacion|vardiaria|varsemanal|varmes|var3meses|varanual|varytd|varinicio|fecha|nombre|corto|moneda
 * @customfunction
 */
function BALANZ_FCI(ticker, campo) {
  if (!ticker) return "Falta ticker";
  if (!campo)  return "Falta campo";
  const d = fetchFCIInfo_(ticker);
  const c = String(campo).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const m = {
    cuotaparte: d.cuotaparte,
    variacion:  d.varDiaria,
    vardiaria:  d.varDiaria,
    varsemanal: d.varSemanal,
    varmes:     d.varMes,
    var3meses:  d.var3Meses,
    varanual:   d.varAnual,
    varytd:     d.varYTD,
    varinicio:  d.varInicio,
    fecha:      d.fecha,
    nombre:     d.nombre,
    corto:      d.corto,
    moneda:     d.moneda,
  };
  return (c in m) ? m[c] : "Campo inválido: " + campo;
}

/**
 * Cabecera de columnas para BALANZ_FCI_FILA.
 * @customfunction
 */
function BALANZ_FCI_HEADER() {
  return [["Ticker","Nombre","Categoría","Moneda","Cuotaparte","Var. Diaria","Var. Semanal","Var. 1 Mes","Var. 3 Meses","Var. 12 Meses","Var. YTD","Var. Inicio","Fecha"]];
}

/**
 * Fila completa con todos los datos disponibles de un FCI.
 * @param {string} ticker  Ej: "BCAHA", "BRT", "BCRF"
 * @customfunction
 */
function BALANZ_FCI_FILA(ticker) {
  if (!ticker) return [["Falta ticker"]];
  const d = fetchFCIInfo_(ticker);
  return [[
    d.ticker, d.nombre, d.corto, d.moneda, d.cuotaparte,
    d.varDiaria, d.varSemanal, d.varMes, d.var3Meses,
    d.varAnual, d.varYTD, d.varInicio, d.fecha,
  ]];
}

/**
 * Histórico de cuotapartes de un FCI entre dos fechas.
 * @param {string} ticker  Ej: "BCAHA"
 * @param {string} desde   "YYYY-MM-DD" (opcional)
 * @param {string} hasta   "YYYY-MM-DD" (opcional)
 * @customfunction
 */
function BALANZ_FCI_HIST(ticker, desde, hasta) {
  if (!ticker) return [["Falta ticker"]];
  const d = fetchFCIInfo_(ticker);
  let rows = d.hist;
  if (desde || hasta) {
    const d0 = desde ? new Date(desde) : null;
    const d1 = hasta ? new Date(hasta) : null;
    rows = rows.filter(r => { const f = new Date(r.fecha); return (!d0 || f >= d0) && (!d1 || f <= d1); });
  }
  if (rows.length === 0) return [["Sin datos para " + ticker]];
  const out = [["Fecha", "Cuotaparte"]];
  rows.forEach(r => out.push([r.fecha, parseFloat(r.valorcuotaparte)]));
  return out;
}
