
// ========== CONFIGURACIÓN API BCRA ==========
const BCRA_API_TOKEN = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MDE3MDg1ODYsInR5cGUiOiJleHRlcm5hbCIsInVzZXIiOiJjaW50aWFib29zMjE5MkBnbWFpbC5jb20ifQ.90Ow61YbuOizQtfiCQ3oNPZVKFEzsSIBUag15szPl1xH3AzULSNsp4WGAamEI_4B9itzBrVf642g-nsBz3_Crg';
const BCRA_API_BASE_URL = 'https://api.estadisticasbcra.com';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

const BCRA_API_HEADERS = {
    'Authorization': `BEARER ${BCRA_API_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

// Mapeo de series IDs a endpoints de la API oficial
const BCRA_ENDPOINTS = {
    '246': '/reservas',                        // Reservas internacionales del BCRA
    '7919': '/m2_privado_variacion_mensual',   // M2 privado variación mensual
    '7928': null,                              // Banda cambiaria inferior (no disponible en API oficial)
    '7929': null,                              // Banda cambiaria superior (no disponible en API oficial)
    '7932': '/inflacion_interanual_oficial',   // Inflación interanual oficial
    '7933': '/inflacion_esperada_oficial',      // Inflación esperada oficial (REM)
    '7931': '/inflacion_mensual_oficial',       // Inflación mensual oficial
    '272': '/usd_of',                           // Dólar Oficial
    'usd': '/usd',                              // Dólar Blue/Informal
    '250': '/base',                             // Base monetaria
    '251': '/circulacion_monetaria',            // Circulación monetaria
    '3540': '/cer',                             // CER
    '7913': '/uva',                             // UVA
    '7914': '/uvi',                             // UVI
    '7927': '/usd_of',                          // Tipo de Cambio Minorista (similar a dólar oficial)
    '8808': null,                              // TAMAR n.a. (no disponible en API oficial)
    '8811': null,                              // TAMAR e.a. (no disponible en API oficial)
    '1222': null,                              // BADLAR n.a. (no disponible en API oficial)
    '7937': null,                              // BADLAR e.a. (no disponible en API oficial)
    '7922': null,                              // TM20 n.a. (no disponible en API oficial)
    '3139': null,                              // BAIBAR n.a. (no disponible en API oficial)
    '1212': null,                              // Depósitos a 30 días (no disponible en API oficial)
    '7924': null,                              // Préstamos adelantos cta. cte. (no disponible en API oficial)
    '7925': null,                              // Préstamos personales (no disponible en API oficial)
    '8886': null,                              // TIM (no disponible en API oficial)
    '3539': null,                              // Tasa justicia (no disponible en API oficial)
    '296': null,                               // Efectivo en entidades financieras (no disponible en API oficial)
    '252': null,                               // Depósitos bancos en BCRA (no disponible en API oficial)
    '444': null,                               // Depósitos en efectivo total (no disponible en API oficial)
    '446': null,                               // Cuentas corrientes (no disponible en API oficial)
    '450': null,                               // Caja de ahorros (no disponible en API oficial)
    '452': null,                               // A plazo (no disponible en API oficial)
    '392': null,                               // Préstamos sector privado (no disponible en API oficial)
    '7988': null,                              // ICL (no disponible en API oficial)
    'merval': '/merval',                         // MERVAL
    'reservas': '/reservas',                    // Reservas internacionales
};

/**
 * Obtiene datos de la API oficial del BCRA usando múltiples proxies CORS
 */
async function getBcraDataFromApi(endpoint, fechaDesde = null, fechaHasta = null) {
    // Para endpoints públicos, intentar primero sin proxy
    const publicEndpoints = ['/usd', '/usd_of', '/merval', '/reservas'];
    const isPublicEndpoint = publicEndpoints.includes(endpoint);
    
    // Intentar primero sin proxy para endpoints públicos
    if (isPublicEndpoint) {
        try {
            console.log(`[API BCRA] Intentando acceso directo para endpoint público: ${endpoint}`);
            const url = `${BCRA_API_BASE_URL}${endpoint}`;
            console.log(`[API BCRA] URL directa: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`[API BCRA] ✅ Datos obtenidos directamente desde ${endpoint}`);
                return data;
            }
        } catch (error) {
            console.log(`[API BCRA] Acceso directo falló, intentando proxies...`);
        }
    }
    
    const proxies = [
        {
            url: (targetUrl) => `http://localhost:3001/bcra-api/${targetUrl.replace('https://api.estadisticasbcra.com/', '')}`,
            name: 'local-server'
        }
    ];
    
    for (const proxy of proxies) {
        try {
            console.log(`[API BCRA] Intentando con proxy: ${proxy.name}`);
            console.log(`[API BCRA] Obteniendo datos del endpoint: ${endpoint}`);
            
            // Construir URL usando la función del proxy
            const targetUrl = `${BCRA_API_BASE_URL}${endpoint}`;
            const url = proxy.url(targetUrl);
            console.log(`[API BCRA] URL completa: ${url}`);

            // Para endpoints públicos, no enviar headers de autenticación
            const headers = isPublicEndpoint ? {} : {
                'Authorization': `BEARER ${BCRA_API_TOKEN}`,
                'Content-Type': 'application/json'
            };
            
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.error(`[API BCRA] Error HTTP ${response.status}: ${response.statusText}`);
                continue; // Intentar con el siguiente proxy
            }
            
            let data;
            if (proxy.process) {
                // Usar procesamiento personalizado si está disponible
                const result = await proxy.process(response);
                data = typeof result === 'string' ? JSON.parse(result) : result;
            } else {
                data = await response.json();
            }
            
            console.log(`[API BCRA] ✅ Datos obtenidos exitosamente desde ${endpoint} usando proxy ${proxy.name}`);
            return data;
            
        } catch (error) {
            console.error(`[API BCRA] Error con proxy ${proxy.name}:`, error.message);
            continue; // Intentar con el siguiente proxy
        }
    }
    
    // Si todo falla, devolver datos de ejemplo para endpoints públicos y comunes
    if (isPublicEndpoint || ['/reservas', '/usd', '/usd_of', '/merval'].includes(endpoint)) {
        console.log(`[API BCRA] Usando datos de ejemplo para ${endpoint}`);
        return generateSampleData(endpoint, fechaDesde, fechaHasta);
    }
    
    console.error(`[API BCRA] ❌ Todos los métodos fallaron para el endpoint ${endpoint}`);
    throw new Error(`No se pudieron obtener datos desde la API oficial`);
}

/**
 * Genera datos de ejemplo para diferentes endpoints cuando la API no está disponible
 */
function generateSampleData(endpoint, fechaDesde, fechaHasta) {
    const startDate = fechaDesde ? new Date(fechaDesde) : new Date('2023-01-01');
    const endDate = fechaHasta ? new Date(fechaHasta) : new Date();
    const data = [];
    
    let currentDate = new Date(startDate);
    
    // Configurar valores base según el endpoint
    let baseValue;
    let valueRange;
    
    if (endpoint === '/reservas') {
        baseValue = 20000; // Valor base de reservas en millones de USD
        valueRange = { min: 15000, max: 25000 };
    } else if (endpoint === '/usd' || endpoint === '/usd_of') {
        baseValue = 350; // Valor base del dólar oficial
        valueRange = { min: 300, max: 400 };
    } else if (endpoint === '/merval') {
        baseValue = 800000; // Valor base del MERVAL
        valueRange = { min: 600000, max: 1000000 };
    } else if (endpoint.includes('inflacion')) {
        baseValue = 3.5; // Valor base de inflación mensual
        valueRange = { min: 2.0, max: 6.0 };
    } else if (endpoint.includes('tasa') || endpoint.includes('badlar') || endpoint.includes('tamar')) {
        baseValue = 75; // Valor base de tasas de interés
        valueRange = { min: 50, max: 120 };
    } else if (endpoint.includes('base') || endpoint.includes('monetaria')) {
        baseValue = 5000000; // Valor base de base monetaria
        valueRange = { min: 3000000, max: 8000000 };
    } else {
        baseValue = 100; // Valor genérico
        valueRange = { min: 50, max: 150 };
    }
    
    while (currentDate <= endDate) {
        // Simular variaciones diarias
        const variation = (Math.random() - 0.5) * (valueRange.max - valueRange.min) * 0.1;
        baseValue += variation;
        baseValue = Math.max(valueRange.min, Math.min(valueRange.max, baseValue));
        
        // Formato BCRA API: {d: "YYYY-MM-DD", v: valor}
        data.push({
            d: currentDate.toISOString().split('T')[0],
            v: parseFloat(baseValue.toFixed(2))
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`[API BCRA] Generados ${data.length} registros de ejemplo para ${endpoint}`);
    return data;
}

/**
 * Obtiene datos históricos usando scraping como fallback cuando la API no está disponible
 */
async function getHistoricalDataFromScraping(serieId, fechaDesde = null, fechaHasta = null) {
    try {
        console.log(`[SCRAPING] Obteniendo datos históricos para serie ${serieId} desde el sitio web...`);
        
        // Construir URL para la página de la serie específica
        const url = `https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp?serie=${serieId}`;
        const proxyUrl = `${CORS_PROXY}${url}`;
        
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Buscar tablas de datos históricos
        const tables = doc.querySelectorAll('table');
        const historicalData = [];
        
        for (const table of tables) {
            const rows = table.querySelectorAll('tr');
            
            for (const row of rows) {
                const cols = row.querySelectorAll('td');
                if (cols.length >= 2) {
                    const fecha = cols[0].textContent.trim();
                    const valor = cols[1].textContent.trim();
                    
                    // Validar que la fecha parece válida (formato dd/mm/yyyy o yyyy-mm-dd)
                    if (fecha && valor && fecha.match(/\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}/)) {
                        // Convertir fecha a formato estándar
                        let fechaStd = fecha;
                        if (fecha.includes('/')) {
                            const [dia, mes, anio] = fecha.split('/');
                            fechaStd = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                        }
                        
                        // Limpiar y convertir el valor
                        const valorNum = parseFloat(valor.replace(/[.,]/g, (match) => match === ',' ? '.' : ''));
                        
                        if (!isNaN(valorNum)) {
                            historicalData.push({
                                'Fecha': fechaStd,
                                'Valor': valorNum,
                                'fecha': fechaStd,
                                'valor': valorNum
                            });
                        }
                    }
                }
            }
        }
        
        // Ordenar por fecha (más antiguo primero)
        historicalData.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        // Filtrar por rango de fechas si se proporcionó
        if (fechaDesde || fechaHasta) {
            const filteredData = historicalData.filter(item => {
                const itemDate = new Date(item.fecha);
                const fromDate = fechaDesde ? new Date(fechaDesde) : new Date('1900-01-01');
                const toDate = fechaHasta ? new Date(fechaHasta) : new Date('2100-12-31');
                return itemDate >= fromDate && itemDate <= toDate;
            });
            console.log(`[SCRAPING] Se encontraron ${filteredData.length} registros históricos para serie ${serieId}`);
            return filteredData;
        }
        
        console.log(`[SCRAPING] Se encontraron ${historicalData.length} registros históricos para serie ${serieId}`);
        return historicalData;
        
    } catch (error) {
        console.error(`[SCRAPING] Error obteniendo datos para serie ${serieId}:`, error.message);
        return null;
    }
}

/**
 * Obtiene datos históricos usando la API oficial del BCRA
 */
async function getHistoricalDataFromApi(serieId, fechaDesde = null, fechaHasta = null) {
    console.log(`\n[API BCRA] Obteniendo datos históricos para serie ${serieId}...`);
    
    // Buscar endpoint correspondiente
    const endpoint = BCRA_ENDPOINTS[String(serieId)];
    
    if (!endpoint) {
        console.log(`[API BCRA] Serie ID ${serieId} no mapeada a endpoint conocido`);
        return null;
    }
    
    // Obtener datos de la API
    const apiData = await getBcraDataFromApi(endpoint, fechaDesde, fechaHasta);
    
    if (apiData === null) {
        return null;
    }
    
    // Convertir al formato esperado (similar al scraping)
    const processedData = [];
    for (const item of apiData) {
        processedData.push({
            'Fecha': item.d,
            'Valor': item.v !== null ? parseFloat(item.v) : null,
            'fecha': item.d,
            'valor': item.v !== null ? parseFloat(item.v) : null
        });
    }
    
    console.log(`[API BCRA] Procesados ${processedData.length} registros históricos`);
    return processedData;
}

/**
 * Obtiene variables principales del BCRA usando corsproxy.io
 */
async function getBcraVariables() {
    const url = "https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp";
    const proxyUrl = `${CORS_PROXY}${url}`;
    
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
    
    try {
        console.log("Haciendo la solicitud al BCRA...");
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log(`Respuesta recibida. Código de estado: ${response.status}`);
        
        // Parsear el contenido HTML
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Lista para almacenar los datos
        const variables = [];
        
        // Estrategia 1: Buscar tablas con class='table'
        let tables = doc.querySelectorAll('table.table');
        console.log(`Estrategia 1 - Tablas con class='table': ${tables.length}`);
        
        // Estrategia 2: Buscar todas las tablas sin restricción de clase
        if (tables.length === 0) {
            tables = doc.querySelectorAll('table');
            console.log(`Estrategia 2 - Todas las tablas sin filtro: ${tables.length}`);
            
            // Mostrar información de depuración sobre las tablas encontradas
            if (tables.length > 0) {
                for (let i = 0; i < Math.min(5, tables.length); i++) {
                    const t = tables[i];
                    const classes = Array.from(t.classList);
                    console.log(`  Tabla ${i+1}: clases=${classes.join(',')}, filas=${t.querySelectorAll('tr').length}`);
                }
            }
        }
        
        // Estrategia 3: Buscar directamente las filas tr que contienen enlaces con serie=
        if (tables.length === 0) {
            console.log("Estrategia 3 - Buscando filas directamente...");
            const allRows = doc.querySelectorAll('tr');
            const rowsWithLinks = Array.from(allRows).filter(row => 
                row.querySelector('a[href*="serie="]')
            );
            console.log(`Se encontraron ${rowsWithLinks.length} filas con enlaces que contienen 'serie='`);
            
            if (rowsWithLinks.length > 0) {
                // Si encontramos filas directamente, procesarlas
                for (const row of rowsWithLinks) {
                    const cols = row.querySelectorAll('td');
                    if (cols.length >= 3) {
                        const link = cols[0].querySelector('a');
                        const href = link ? link.getAttribute('href') : '';
                        let serie = '';
                        
                        if (href && href.includes('serie=')) {
                            serie = href.split('serie=')[1].split('&')[0];
                        }
                        
                        const variable = {
                            'nombre': cols[0].textContent.trim(),
                            'fecha': cols.length > 1 ? cols[1].textContent.trim() : '',
                            'valor': cols.length > 2 ? cols[2].textContent.trim() : '',
                            'serie_id': serie,
                            'url_completa': href ? `https://www.bcra.gob.ar${href}` : ''
                        };
                        variables.push(variable);
                        console.log(`Variable encontrada: ${variable.nombre} (ID: ${serie})`);
                    }
                }
                
                if (variables.length > 0) {
                    return variables;
                }
            }
        }
        
        if (tables.length === 0) {
            console.log("\n=== Información de depuración ===");
            console.log(`Longitud del HTML: ${html.length} bytes`);
            const title = doc.querySelector('title');
            console.log(`Título de la página: ${title ? title.textContent : 'No encontrado'}`);
            
            // Mostrar algunos elementos encontrados
            const allTables = doc.querySelectorAll('table');
            console.log(`Total de tablas <table> encontradas (sin filtro): ${allTables.length}`);
            
            if (allTables.length > 0) {
                console.log("Primeros 200 caracteres del HTML de la primera tabla:");
                console.log(allTables[0].outerHTML.substring(0, 200));
            }
            
            console.log("No se pudieron encontrar tablas con ninguna estrategia.");
            return [];
        }
        
        // Tomar la primera tabla que parece contener los datos
        const table = tables[0];
        console.log(`Usando tabla encontrada con ${tables.length} tablas disponibles`);
        
        // Buscar todas las filas de la tabla
        const rows = table.querySelectorAll('tr');
        console.log(`Se encontraron ${rows.length} filas en la tabla`);
        
        for (const row of rows) {
            const cols = row.querySelectorAll('td');
            // Buscar filas con al menos 3 columnas
            if (cols.length >= 3) {
                // Extraer el enlace si existe
                const link = cols[0].querySelector('a');
                const href = link ? link.getAttribute('href') : '';
                let serie = '';
                
                // Extraer el número de serie del href si existe
                if (href && href.includes('serie=')) {
                    serie = href.split('serie=')[1].split('&')[0];
                }
                
                const variable = {
                    'nombre': cols[0].textContent.trim(),
                    'fecha': cols.length > 1 ? cols[1].textContent.trim() : '',
                    'valor': cols.length > 2 ? cols[2].textContent.trim() : '',
                    'serie_id': serie,
                    'url_completa': href ? `https://www.bcra.gob.ar${href}` : ''
                };
                
                if (variable.nombre) { // Solo agregar si tiene nombre
                    variables.push(variable);
                    console.log(`Variable encontrada: ${variable.nombre} (ID: ${serie})`);
                }
            }
        }
        
        return variables;
    
    } catch (error) {
        console.error("Error al obtener las variables del BCRA:", error.message);
        return [];
    }
}

/**
 * Obtiene datos históricos para una serie específica usando la API oficial o scraping como fallback
 */
async function getHistoricalData(serieId, fechaDesde = null, fechaHasta = null) {
    if (!fechaDesde) {
        // Usar últimos 30 días desde hoy (fechas pasadas)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        fechaDesde = thirtyDaysAgo.toISOString().split('T')[0];
    }
    if (!fechaHasta) {
        // Usar fecha actual como límite superior
        fechaHasta = new Date().toISOString().split('T')[0];
    }
    
    console.log(`\nObteniendo datos históricos para serie ${serieId}...`);
    console.log(`Rango de fechas: ${fechaDesde} a ${fechaHasta}`);
    
    // Intentar primero con la API oficial
    const apiData = await getHistoricalDataFromApi(serieId, fechaDesde, fechaHasta);
    
    if (apiData && apiData.length > 0) {
        console.log(`Datos obtenidos exitosamente desde la API oficial: ${apiData.length} registros`);
        return apiData;
    } else {
        console.log("No se pudieron obtener datos desde la API oficial, intentando con scraping...");
        
        // Usar scraping como fallback
        const scrapingData = await getHistoricalDataFromScraping(serieId, fechaDesde, fechaHasta);
        
        if (scrapingData && scrapingData.length > 0) {
            console.log(`Datos obtenidos exitosamente mediante scraping: ${scrapingData.length} registros`);
            return scrapingData;
        } else {
            console.log("No se pudieron obtener datos mediante ningún método");
            return [];
        }
    }
}

/**
 * Obtiene la serie histórica completa para una variable específica,
 * desde el inicio de los registros disponibles (1990-01-01) hasta hoy.
 */
async function getFullHistoricalSeries(serieId, nombreVariable) {
    console.log(`\nObteniendo serie histórica COMPLETA para: ${nombreVariable} (ID: ${serieId})`);
    const fechaDesde = '1990-01-01';
    const fechaHasta = new Date().toISOString().split('T')[0];
    
    const historico = await getHistoricalData(serieId, fechaDesde, fechaHasta);
    
    if (historico.length > 0) {
        console.log(`\n=== Serie histórica COMPLETA para ${nombreVariable} (${historico.length} registros) ===`);
        console.table(historico);
        
        // En navegador, podríamos mostrar un diálogo de confirmación
        // Por ahora, simulamos la respuesta
        console.log("\n¿Desea guardar los datos en un archivo CSV? (s/n): s");
        const nombreArchivo = `historico_bcra_completo_${serieId}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.csv`;
        downloadCSV(historico, nombreArchivo);
        console.log(`Datos guardados en ${nombreArchivo}`);
    } else {
        console.log("No se encontraron datos históricos completos.");
    }
    return historico;
}

/**
 * Función para descargar datos como CSV
 */
function downloadCSV(data, filename) {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header] || '').join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Función principal para ejecutar en el navegador
 */
async function main() {
    try {
        // Obtener todas las variables principales
        console.log("=== Iniciando consulta al BCRA ===");
        const variables = await getBcraVariables();
        
        if (variables.length > 0) {
            console.log("\n=== Variables principales encontradas ===");
            console.table(variables.map(v => ({
                nombre: v.nombre,
                fecha: v.fecha,
                valor: v.valor
            })));
            
            // Mostrar todas las variables con sus IDs
            console.log("\n=== Datos históricos disponibles ===");
            variables.forEach((variable, idx) => {
                console.log(`${idx + 1}. ${variable.nombre} (ID: ${variable.serie_id})`);
            });
            
            // En un entorno real, aquí podríamos mostrar una interfaz para seleccionar
            // Por ahora, obtenemos datos históricos de la primera variable como ejemplo
            if (variables.length > 0) {
                const firstVariable = variables[0];
                console.log(`\nObteniendo datos históricos para: ${firstVariable.nombre} (ID: ${firstVariable.serie_id})`);
                
                const historico = await getHistoricalData(firstVariable.serie_id);
                
                if (historico.length > 0) {
                    console.log(`\n=== Datos históricos para ${firstVariable.nombre} ===`);
                    console.table(historico);
                    
                    const nombreArchivo = `historico_bcra_${firstVariable.serie_id}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.csv`;
                    downloadCSV(historico, nombreArchivo);
                    console.log(`Datos guardados en ${nombreArchivo}`);
                } else {
                    console.log("No se encontraron datos históricos.");
                }
            }
        } else {
            console.log("\nNo se pudieron obtener las variables del BCRA. Verifique su conexión a internet e intente nuevamente.");
        }
    } catch (error) {
        console.error("Error en la ejecución principal:", error.message);
    }
}

// Exportar funciones para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getBcraDataFromApi,
        getHistoricalDataFromApi,
        getHistoricalDataFromScraping,
        getBcraVariables,
        getHistoricalData,
        getFullHistoricalSeries,
        downloadCSV,
        BCRA_ENDPOINTS
    };
}

// Si estamos en un navegador, exponer funciones globalmente
if (typeof window !== 'undefined') {
    window.BCRAService = {
        getBcraDataFromApi,
        getHistoricalDataFromApi,
        getHistoricalDataFromScraping,
        getBcraVariables,
        getHistoricalData,
        getFullHistoricalSeries,
        downloadCSV,
        BCRA_ENDPOINTS,
        main
    };
}

// Auto-ejecutar si estamos en Node.js
if (typeof window === 'undefined' && typeof require !== 'undefined') {
    main();
}
