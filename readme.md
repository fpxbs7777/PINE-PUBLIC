# 📊 Balanz para Google Sheets

Conectá tu cuenta de **Balanz** directamente a Google Sheets y consultá precios, bonos, tu cartera y más — sin salir de la planilla.

---

## ¿Qué hace esto?

Este script agrega fórmulas personalizadas a tu Google Sheets que traen datos en tiempo real desde tu cuenta de Balanz:

- Precios de acciones, bonos, CEDEARs y fondos
- Datos de bonos: TIR, TNA, paridad, duration, convexity
- Historial de precios (OHLCV)
- Saldos disponibles en pesos y dólares
- Dólar MEP y CCL
- Posiciones actuales de tu cartera
- Evolución histórica de la cartera

---

## Requisitos

- Una cuenta en **[clientes.balanz.com](https://clientes.balanz.com)**
- Una cuenta de **Google** con acceso a Google Sheets
- Nada más — no hace falta instalar ningún programa

---

## Instalación paso a paso

### 1. Abrí tu Google Sheet

Creá una planilla nueva en [sheets.google.com](https://sheets.google.com) o usá una que ya tengas.

### 2. Abrí el editor de scripts

En el menú de arriba: **Extensiones → Apps Script**

Se abre una ventana nueva con un editor de código.

### 3. Borrá el código que hay y pegá el nuevo

En el editor vas a ver algo como `function myFunction() {}`. Seleccioná todo (`Ctrl+A`) y borralo. Luego pegá todo el contenido del archivo `balanz.gs` de este repositorio.

### 4. Guardá

Hacé click en el ícono del diskette 💾 o presioná `Ctrl+S`. Podés ponerle cualquier nombre al proyecto.

### 5. Volvé a tu planilla y recargá la página

Cuando recargue, vas a ver un nuevo menú **📊 Balanz** en la barra superior.

---

## Cómo conectar tu cuenta (obtener el token)

Cada vez que iniciás sesión en Balanz, se genera un **token** que dura aproximadamente 8 horas. Este token es lo que permite que las fórmulas accedan a tus datos.

### Pasos para obtener el token:

1. Abrí **[clientes.balanz.com](https://clientes.balanz.com)** en tu navegador y logueate
2. Presioná **F12** para abrir las herramientas de desarrollador
3. Hacé click en la pestaña **Network** (Red)
4. Recargá la página con **F5**
5. En el buscador de requests, escribí `log`
6. Hacé click en la request `loginAvoid...` que aparece → pestaña **Response**
7. Buscá y copiá el valor de `AccessToken` y el de `idCuenta`

Así se ve la pantalla cuando encontrás la request correcta:

![Cómo obtener el token desde el Network tab](assets/network-token.png)

> 💡 El `AccessToken` es algo como `14C4E6C1-EBFF-4B8B-9811-4B6E812BE56C`  
> 💡 El `idCuenta` es algo como `96552` (campo `idPersona` en el Response)

### Pegá el token en la planilla:

1. En tu Google Sheet, hacé click en **📊 Balanz → 🔑 Pegar token**
2. Pegá el `AccessToken` en el primer campo
3. Pegá tu `idCuenta` en el segundo campo
4. Hacé click en **Guardar token**

¡Listo! Ya podés usar las fórmulas.

---

## Fórmulas disponibles

### Bonos

| Fórmula | Qué devuelve |
|---|---|
| `=BALANZ_PRECIO("AL30D")` | Precio limpio |
| `=BALANZ_TIR("AL30D")` | TIR / Yield to Maturity |
| `=BALANZ_TNA("AL30D")` | Tasa Nominal Anual |
| `=BALANZ_PARIDAD("AL30D")` | Paridad |
| `=BALANZ_DURATION("AL30D")` | Duration modificada |
| `=BALANZ_CONVEXITY("AL30D")` | Convexity |
| `=BALANZ_CY("AL30D")` | Current Yield |
| `=BALANZ_NOMBRE("AL30D")` | Nombre del instrumento |

### Cualquier instrumento (acciones, CEDEARs, fondos)

| Fórmula | Qué devuelve |
|---|---|
| `=BALANZ_ULTIMO("GGAL")` | Último precio |
| `=BALANZ_VARIACION("GGAL")` | Variación % del día |
| `=BALANZ_VOLUMEN("GGAL")` | Volumen operado |
| `=BALANZ_APERTURA("GGAL")` | Precio de apertura |
| `=BALANZ_MAXIMO("GGAL")` | Máximo del día |
| `=BALANZ_MINIMO("GGAL")` | Mínimo del día |
| `=BALANZ_CIERRE("GGAL")` | Cierre anterior |
| `=BALANZ_VWAP("GGAL")` | VWAP del día |
| `=BALANZ("GGAL", "variacion")` | Campo libre |
| `=BALANZ_FILA("GGAL")` | Fila completa de datos |
| `=BALANZ_HEADER()` | Cabecera para BALANZ_FILA |

### Histórico de precios

| Fórmula | Qué devuelve |
|---|---|
| `=BALANZ_HIST_PRECIO("AL30D","2024-01-01","2024-12-31")` | Cierres históricos |
| `=BALANZ_HIST_MAXIMO("AL30D","2024-01-01","2024-12-31")` | Máximos históricos |
| `=BALANZ_HIST_MINIMO("AL30D","2024-01-01","2024-12-31")` | Mínimos históricos |
| `=BALANZ_HIST_VOLUMEN("AL30D","2024-01-01","2024-12-31")` | Volumen histórico |
| `=BALANZ_HIST_OHLCV("AL30D","2024-01-01","2024-12-31")` | Tabla OHLCV completa |
| `=BALANZ_HIST("AL30D","2024-01-01","2024-12-31","apertura")` | Campo libre histórico |

Campos disponibles para `BALANZ_HIST`: `apertura` · `cierre` · `maximo` · `minimo` · `volumen` · `nominal`

### Estado de cuenta

| Fórmula | Qué devuelve |
|---|---|
| `=BALANZ_SALDO()` | Disponible en pesos (CI) |
| `=BALANZ_SALDO_24()` | Disponible en pesos 24hs |
| `=BALANZ_SALDO_USD()` | Disponible en dólares (CI) |
| `=BALANZ_SALDO_USD_24()` | Disponible en dólares 24hs |
| `=BALANZ_MEP()` | Dólar MEP |
| `=BALANZ_CCL()` | Dólar CCL |
| `=BALANZ_TENENCIA_TOTAL()` | Tenencia total en pesos |
| `=BALANZ_PORTAFOLIO_HEADER()` | Cabecera de posiciones |
| `=BALANZ_PORTAFOLIO()` | Posiciones actuales |

### Evolución de cartera

| Fórmula | Qué devuelve |
|---|---|
| `=BALANZ_EVOL_HEADER()` | Cabecera |
| `=BALANZ_EVOL("2025-01-01","2026-03-05")` | Evolución diaria de la cartera |

---

## Problemas frecuentes

### ❌ "Token vencido"

El token dura ~8 horas desde que iniciás sesión. Simplemente volvé a loguearte en Balanz, copiá el nuevo `AccessToken` y pegalo desde **📊 Balanz → 🔑 Pegar token**.

### ❌ Las fórmulas no se actualizan después de pegar un token nuevo

Google Sheets guarda en caché los resultados de las fórmulas. Para forzar la actualización:

1. Seleccioná las celdas con fórmulas BALANZ
2. Presioná `Ctrl+H` (buscar y reemplazar)
3. Buscá `=BALANZ` y reemplazá con `=BALANZ`
4. Click en "Reemplazar todo"

O bien usá el menú **📊 Balanz → 🔄 Forzar actualización** si lo tenés instalado.

### ❌ "ID de cuenta no configurado"

Al pegar el token, asegurate de completar también el campo **ID Cuenta**. Lo encontrás en el mismo Response del login como `idCuenta`.

### ❌ No veo el menú "📊 Balanz"

Recargá la página de Google Sheets. Si sigue sin aparecer, verificá que el script esté guardado correctamente en Extensiones → Apps Script.

---

## Seguridad

- El token se guarda en las **propiedades de usuario** de Google Apps Script — solo vos podés accederlo.
- Nunca se guarda en la planilla ni es visible para otras personas que tengan acceso al sheet.
- Podés eliminarlo en cualquier momento desde **📊 Balanz → 🚪 Cerrar sesión**.

---

## Créditos

Desarrollado para uso personal con la API de [Balanz](https://balanz.com). No es un producto oficial de Balanz.

<img width="1238" height="372" alt="image" src="https://github.com/user-attachments/assets/9c42ed2a-618f-4a28-95f6-35f7950cd121" />

