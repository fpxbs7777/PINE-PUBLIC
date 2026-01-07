

# ============================================================================
# CONFIGURACIÓN DE CREDENCIALES IOL (COMPLETAR ANTES DE EJECUTAR)
# ============================================================================

# IMPORTANTE: Configurar con tus credenciales de InvertirOnline antes de ejecutar
IOL_USERNAME = ""  # Ingresar tu email de IOL aquí
IOL_PASSWORD = ""  # Ingresar tu contraseña de IOL aquí

# ============================================================================

import subprocess
import sys
import os

# ============================================================================
# INSTALACIÓN AUTOMÁTICA DE DEPENDENCIAS
# ============================================================================

def instalar_dependencias():
    """Instala automáticamente todas las dependencias necesarias"""
    dependencias = [
        'requests',      # Para IOL API
        'yfinance',
        'pandas',
        'numpy',
        'matplotlib',
        'seaborn',
        'openpyxl',
        'statsmodels',
        'scipy'
    ]
    
    print("="*80)
    print("INSTALANDO DEPENDENCIAS")
    print("="*80)
    
    for paquete in dependencias:
        try:
            __import__(paquete)
            print(f"✓ {paquete} ya está instalado")
        except ImportError:
            print(f"⚙ Instalando {paquete}...")
            try:
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', paquete, '--quiet'])
                print(f"✓ {paquete} instalado correctamente")
            except Exception as e:
                print(f"✗ Error instalando {paquete}: {e}")
    
    print("\n" + "="*80 + "\n")

# Ejecutar instalación de dependencias
instalar_dependencias()

# ============================================================================
# IMPORTACIONES
# ============================================================================

import requests
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime
import warnings
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging
from pathlib import Path

warnings.filterwarnings('ignore')
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# ============================================================================
# MÓDULOS DE IOL INTEGRADOS (NO REQUIERE ARCHIVOS EXTERNOS)
# ============================================================================

import time
import json

class IOLClient:
    """Cliente para interactuar con la API de InvertirOnline"""
    
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.access_token = None
        self.refresh_token = None
        self.token_expiry = 0
        self.base_url = "https://api.invertironline.com"

    def obtener_tokens(self):
        token_url = f'{self.base_url}/token'
        payload = {
            'username': self.username,
            'password': self.password,
            'grant_type': 'password'
        }
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        try:
            logger.info("Intentando autenticar con usuario: %s", self.username)
            response = requests.post(token_url, data=payload, headers=headers)
            if response.status_code == 200:
                tokens = response.json()
                self.access_token = tokens['access_token']
                self.refresh_token = tokens['refresh_token']
                self.token_expiry = time.time() + tokens.get('expires_in', 300)
                print("Autenticación exitosa.")
                return True
            else:
                logger.warning('Error en la solicitud de token: %s', response.status_code)
                logger.debug('Detalle de respuesta token: %s', response.text)
                return False
        except Exception as e:
            logger.exception('Excepción al obtener tokens: %s', e)
            return False

    def refrescar_token(self):
        token_url = f'{self.base_url}/token'
        payload = {
            'refresh_token': self.refresh_token,
            'grant_type': 'refresh_token'
        }
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        try:
            response = requests.post(token_url, data=payload, headers=headers)
            if response.status_code == 200:
                tokens = response.json()
                self.access_token = tokens['access_token']
                self.refresh_token = tokens['refresh_token']
                self.token_expiry = time.time() + tokens.get('expires_in', 300)
                return True
            else:
                logger.warning('Error al refrescar token: %s', response.status_code)
                logger.debug('Detalle refrescar token: %s', response.text)
                return False
        except Exception as e:
            logger.exception('Excepción al refrescar token: %s', e)
            return False

    def _ensure_token(self):
        if not self.access_token:
            return self.obtener_tokens()
        if time.time() > self.token_expiry - 60:
            if not self.refrescar_token():
                return self.obtener_tokens()
        return True

    def obtener_serie_historica(self, simbolo, mercado, fecha_desde, fecha_hasta, ajustada='SinAjustar'):
        if not self._ensure_token():
            return None

        url = f"{self.base_url}/api/v2/{mercado}/Titulos/{simbolo}/Cotizacion/seriehistorica/{fecha_desde}/{fecha_hasta}/{ajustada}"
        headers = {
            'Accept': 'application/json',
            'Authorization': f'Bearer {self.access_token}'
        }
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data:
                    return pd.DataFrame(data)
                return None
            else:
                if response.status_code != 404:
                    logger.warning("Error al obtener serie histórica para %s en %s: %s", simbolo, mercado, response.status_code)
                    logger.debug('Detalle serie histórica: %s', response.text)
                return None
        except Exception as e:
            logger.exception('Excepción al obtener serie histórica: %s', e)
            return None

    def obtener_portafolio(self, pais='argentina'):
        """Obtiene el portafolio del usuario para un país específico"""
        if not self._ensure_token():
            return None

        url = f"{self.base_url}/api/v2/portafolio/{pais}"
        headers = {
            'Accept': 'application/json',
            'Authorization': f'Bearer {self.access_token}'
        }
        try:
            logger.info("Solicitando portafolio para %s...", pais)
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                if 'activos' in data:
                    return pd.DataFrame(data['activos'])
                elif isinstance(data, list):
                     return pd.DataFrame(data)
                logger.warning("Estructura de respuesta no reconocida para portafolio.")
                return pd.DataFrame()
            else:
                logger.warning('Error al obtener portafolio: %s', response.status_code)
                logger.debug('Detalle portafolio: %s', response.text)
                return None
        except Exception as e:
            logger.exception('Excepción al obtener portafolio: %s', e)
            return None

    def obtener_cotizacion(self, simbolo, mercado='BCBA', plazo='t0'):
        """Obtiene la cotización actual de un título"""
        if not self._ensure_token():
            return None

        url = f"{self.base_url}/api/v2/{mercado}/Titulos/{simbolo}/Cotizacion"
        headers = {
            'Accept': 'application/json',
            'Authorization': f'Bearer {self.access_token}'
        }
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                return None
        except Exception as e:
            logger.exception('Excepción al obtener cotización: %s', e)
            return None

    def obtener_lista_clientes(self):
        """Obtiene la lista de clientes asesorados"""
        if not self._ensure_token():
            return None
        
        url = f"{self.base_url}/api/v2/Asesores/Clientes"
        headers = {
            'Accept': 'application/json',
            'Authorization': f'Bearer {self.access_token}'
        }
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning('Error al obtener clientes: %s', response.status_code)
                return None
        except Exception as e:
            logger.exception('Excepción al obtener clientes: %s', e)
            return None

    def obtener_portafolio_asesor(self, id_cliente, pais='argentina'):
        """Obtiene el portafolio de un cliente asesorado"""
        if not self._ensure_token():
            return None

        url = f"{self.base_url}/api/v2/Asesores/Portafolio/{id_cliente}/{pais}"
        headers = {
            'Accept': 'application/json',
            'Authorization': f'Bearer {self.access_token}'
        }
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                if 'activos' in data:
                    return pd.DataFrame(data['activos'])
                elif isinstance(data, list):
                     return pd.DataFrame(data)
                return pd.DataFrame()
            else:
                logger.warning('Error al obtener portafolio asesor (%s): %s', id_cliente, response.status_code)
                return None
        except Exception as e:
            logger.exception('Excepción al obtener portafolio asesor: %s', e)
            return None

    def obtener_operaciones_asesor(self, id_cliente, estado='todas', pais='argentina', fecha_desde=None, fecha_hasta=None):
        """Obtiene las operaciones de un cliente asesorado"""
        if not self._ensure_token():
            return None

        url = f"{self.base_url}/api/v2/Asesores/Operaciones"
        params = {
            'IdClienteAsesorado': id_cliente,
            'Estado': estado,
            'Pais': pais
        }
        if fecha_desde:
            params['FechaDesde'] = fecha_desde
        if fecha_hasta:
            params['FechaHasta'] = fecha_hasta

        headers = {
            'Accept': 'application/json',
            'Authorization': f'Bearer {self.access_token}'
        }
        try:
            response = requests.get(url, headers=headers, params=params)
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning('Error al obtener operaciones asesor (%s): %s', id_cliente, response.status_code)
                logger.debug('Detalle operaciones asesor: %s', response.text)
                return None
        except Exception as e:
            logger.exception('Excepción al obtener operaciones asesor: %s', e)
            return None

    def obtener_estado_cuenta_asesor(self, id_cliente):
        """Obtiene el estado de cuenta de un cliente asesorado"""
        if not self._ensure_token():
            return None

        url = f"{self.base_url}/api/v2/Asesores/EstadoDeCuenta/{id_cliente}"
        headers = {
            'Accept': 'application/json',
            'Authorization': f'Bearer {self.access_token}'
        }
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning('Error al obtener estado de cuenta asesor (%s): %s', id_cliente, response.status_code)
                return None
        except Exception as e:
            logger.exception('Excepción al obtener estado de cuenta asesor: %s', e)
            return None


# Cliente global de IOL
_client = None

def get_client():
    """Obtiene o crea una instancia del cliente IOL"""
    global _client
    if _client is None:
        _client = IOLClient(IOL_USERNAME, IOL_PASSWORD)
        if not _client.obtener_tokens():
            logger.warning("Fallo al autenticar con la API de IOL")
            _client = None
    return _client


def get_historical_data(symbol, market="BCBA", start_date="2020-01-01", end_date=None):
    """
    Obtiene datos históricos de la API de IOL y devuelve un DataFrame con columnas 'date' y 'close'
    """
    client = get_client()
    if not client:
        return pd.DataFrame()

    if end_date is None:
        import datetime
        end_date = datetime.date.today().strftime("%Y-%m-%d")

    # Manejar sufijo .BA para mercado BCBA
    if isinstance(symbol, str) and symbol.endswith('.BA'):
        symbol = symbol.replace('.BA', '')
        market = 'BCBA'

    logger.info("Obteniendo datos para %s en %s desde %s hasta %s...", symbol, market, start_date, end_date)
    df = client.obtener_serie_historica(symbol, market, start_date, end_date)
    
    if df is None or getattr(df, 'empty', True):
        logger.debug("No se encontraron datos para %s", symbol)
        return pd.DataFrame()

    # Renombrar y seleccionar columnas
    if 'fechaHora' in df.columns and 'ultimoPrecio' in df.columns:
        df['date'] = pd.to_datetime(df['fechaHora'], format='mixed')
        df['close'] = df['ultimoPrecio']
        return df[['date', 'close']].sort_values(by='date').reset_index(drop=True)
    
    return pd.DataFrame()


# Marcar que IOL está disponible (ya que está integrado)
IOL_DISPONIBLE = True

# ============================================================================
# CONFIGURACIÓN: Tickers base para obtener listas de sectores
# ============================================================================

# Lista de tickers del S&P 500 y otros índices principales para screening
# Se usarán para obtener dinámicamente tickers por sector
TICKERS_BASE_USA = [
    # Tickers principales que cubren todos los sectores
    'SPY',  # S&P 500 ETF (para referencia)
    # Los sectores y tickers se obtendrán dinámicamente desde yfinance
]

# ETFs sectoriales (solo para referencia de benchmark)
SECTORES_ETF = {
    'Technology': 'XLK',
    'Healthcare': 'XLV',
    'Financial Services': 'XLF',
    'Financial': 'XLF',
    'Energy': 'XLE',
    'Consumer Discretionary': 'XLY',
    'Consumer Cyclical': 'XLY',
    'Consumer Staples': 'XLP',
    'Consumer Defensive': 'XLP',
    'Industrials': 'XLI',
    'Materials': 'XLB',
    'Basic Materials': 'XLB',
    'Real Estate': 'XLRE',
    'Utilities': 'XLU',
    'Communication Services': 'XLC'
}

# ============================================================================
# FUNCIONES DE CÁLCULO DE RATIOS FUNDAMENTALES (CORREGIDAS)
# ============================================================================

def calcular_ratios_fundamentales(ticker):
    """
    Calcula todos los ratios fundamentales para un ticker.
    
    CORRECCIONES IMPLEMENTADAS:
    1. Recovery Rate = EBIT / Pasivo Total (NO beneficio neto)
    2. Invested Capital con validación completa
    3. Tax Rate validado y limitado
    4. Du Pont ROE con validación de división por cero
    
    Returns:
        dict: Diccionario con todos los ratios calculados
    """
    try:
        stock = yf.Ticker(ticker)
        
        # Obtener estados financieros
        try:
            income_stmt = stock.income_stmt
            quarterly_income = stock.quarterly_income_stmt
            balance = stock.balance_sheet
            cashflow = stock.cashflow
        except Exception:
            income_stmt = pd.DataFrame()
            quarterly_income = pd.DataFrame()
            balance = pd.DataFrame()
            cashflow = pd.DataFrame()
        
        info = stock.info or {}
        
        # Detectar si es CEDEAR y obtener datos del subyacente
        es_cedear = ticker.endswith('.BA')
        pais_origen = info.get('country', '')
        es_cedear_extranjero = es_cedear and pais_origen not in ['Argentina', 'AR', None, '']
        
        # Si es CEDEAR extranjero, obtener ratios del subyacente
        info_subyacente = None
        ticker_subyacente = None
        if es_cedear_extranjero:
            ticker_subyacente = ticker.replace('.BA', '')
            logger.info(f"{ticker} es CEDEAR, obteniendo ratios del subyacente {ticker_subyacente}")
            try:
                stock_subyacente = yf.Ticker(ticker_subyacente)
                info_subyacente = stock_subyacente.info or {}
            except Exception as e:
                logger.warning(f"No se pudo obtener info del subyacente {ticker_subyacente}: {e}")
                info_subyacente = None
        
        def safe_get(df, keys, col_idx=0):
            """Obtiene un valor de forma segura desde un DataFrame"""
            if not isinstance(df, pd.DataFrame) or df.empty:
                return np.nan
            for key in keys if isinstance(keys, list) else [keys]:
                if key in df.index:
                    try:
                        if len(df.loc[key]) > col_idx:
                            val = df.loc[key].iloc[col_idx]
                            return float(val) if pd.notna(val) else np.nan
                    except Exception:
                        continue
            return np.nan
        
        # Extraer datos
        total_revenue = safe_get(income_stmt, ['Total Revenue', 'Total Revenues', 'Revenue'])
        cost_of_revenue = safe_get(income_stmt, ['Cost Of Revenue', 'Cost of Goods Sold'])
        gross_profit = safe_get(income_stmt, ['Gross Profit'])
        operating_income = safe_get(income_stmt, ['Operating Income'])
        ebit = safe_get(income_stmt, ['EBIT', 'Operating Income'])
        if np.isnan(ebit):
            ebit = operating_income
        
        interest_expense = abs(safe_get(income_stmt, ['Interest Expense']))
        income_before_tax = safe_get(income_stmt, ['Pretax Income', 'Income Before Tax'])
        tax_provision = safe_get(income_stmt, ['Tax Provision', 'Income Tax Expense'])
        net_income = safe_get(income_stmt, ['Net Income'])
        
        # Balance
        total_assets = safe_get(balance, ['Total Assets'])
        current_assets = safe_get(balance, ['Current Assets'])
        cash_and_equivalents = safe_get(balance, ['Cash And Cash Equivalents'])
        inventory = safe_get(balance, ['Inventory'])
        accounts_receivable = safe_get(balance, ['Accounts Receivable'])
        
        total_liabilities = safe_get(balance, ['Total Liabilities Net Minority Interest', 'Total Liabilities'])
        current_liabilities = safe_get(balance, ['Current Liabilities'])
        accounts_payable = safe_get(balance, ['Accounts Payable'])
        
        long_term_debt = safe_get(balance, ['Long Term Debt'])
        short_term_debt = safe_get(balance, ['Current Debt'])
        total_debt = safe_get(balance, ['Total Debt'])
        if np.isnan(total_debt):
            ltd = 0 if np.isnan(long_term_debt) else long_term_debt
            std = 0 if np.isnan(short_term_debt) else short_term_debt
            total_debt = ltd + std
        
        total_equity = safe_get(balance, ['Total Equity Gross Minority Interest', 'Stockholders Equity'])
        
        # Información del mercado
        market_cap = info.get('marketCap', np.nan)
        current_price = info.get('currentPrice', info.get('regularMarketPrice', np.nan))
        shares_outstanding = info.get('sharesOutstanding', np.nan)
        
        # EBITDA
        ebitda = info.get('ebitda', np.nan)
        if np.isnan(ebitda) and not np.isnan(operating_income):
            depreciation = safe_get(cashflow, ['Depreciation And Amortization'])
            if not np.isnan(depreciation):
                ebitda = operating_income + abs(depreciation)
        
        # Enterprise Value
        enterprise_value = info.get('enterpriseValue', np.nan)
        if np.isnan(enterprise_value) and not np.isnan(market_cap) and not np.isnan(total_debt):
            cash = 0 if np.isnan(cash_and_equivalents) else cash_and_equivalents
            enterprise_value = market_cap + total_debt - cash
        
        # CORRECCIÓN: Tasa impositiva con validación
        tax_rate = 0.25  # Default
        if not np.isnan(income_before_tax) and income_before_tax != 0 and not np.isnan(tax_provision):
            calculated_tax_rate = abs(tax_provision / income_before_tax)
            # Validar que esté en rango razonable (0% - 50%)
            if 0 <= calculated_tax_rate <= 0.50:
                tax_rate = calculated_tax_rate
            else:
                logger.warning(f"{ticker}: Tax rate calculada fuera de rango ({calculated_tax_rate*100:.1f}%), usando 25%")
        
        # Calcular ratios
        ratios = {
            'ticker': ticker,
            'nombre': info.get('longName', ticker),
            'sector': info.get('sector', 'N/A'),
            'industria': info.get('industry', 'N/A'),
            'pais': info.get('country', 'N/A'),
            
            # Valoración
            'precio_actual': current_price,
            'market_cap': market_cap,
            
            # RATIOS DE VALORACIÓN (del subyacente para CEDEARs)
            'pe_ratio': (info_subyacente.get('trailingPE') if (info_subyacente and info_subyacente.get('trailingPE') and 5 < info_subyacente.get('trailingPE') < 500) else (info.get('trailingPE') if (info.get('trailingPE') and 5 < info.get('trailingPE') < 500) else np.nan)),
            'forward_pe': (info_subyacente.get('forwardPE') if (info_subyacente and info_subyacente.get('forwardPE') and 5 < info_subyacente.get('forwardPE') < 500) else (info.get('forwardPE') if (info.get('forwardPE') and 5 < info.get('forwardPE') < 500) else np.nan)),
            'pb_ratio': (info_subyacente.get('priceToBook') if (info_subyacente and info_subyacente.get('priceToBook') and 0.1 < info_subyacente.get('priceToBook') < 50) else (info.get('priceToBook') if (info.get('priceToBook') and 0.1 < info.get('priceToBook') < 50) else np.nan)),
            'ps_ratio': (info_subyacente.get('priceToSalesTrailing12Months') if (info_subyacente and info_subyacente.get('priceToSalesTrailing12Months') and 0.1 < info_subyacente.get('priceToSalesTrailing12Months') < 50) else (info.get('priceToSalesTrailing12Months') if (info.get('priceToSalesTrailing12Months') and 0.1 < info.get('priceToSalesTrailing12Months') < 50) else np.nan)),
            'peg_ratio': (info_subyacente.get('pegRatio') if (info_subyacente and info_subyacente.get('pegRatio') and 0 < info_subyacente.get('pegRatio') < 5) else (info.get('pegRatio') if (info.get('pegRatio') and 0 < info.get('pegRatio') < 5) else np.nan)),
            'ev_ebitda': (info_subyacente.get('enterpriseToEbitda') if (info_subyacente and info_subyacente.get('enterpriseToEbitda') and 0 < info_subyacente.get('enterpriseToEbitda') < 50) else (info.get('enterpriseToEbitda') if (info.get('enterpriseToEbitda') and 0 < info.get('enterpriseToEbitda') < 50) else np.nan)),
            'ev_revenue': (info_subyacente.get('enterpriseToRevenue') if (info_subyacente and info_subyacente.get('enterpriseToRevenue') and 0 < info_subyacente.get('enterpriseToRevenue') < 20) else (info.get('enterpriseToRevenue') if (info.get('enterpriseToRevenue') and 0 < info.get('enterpriseToRevenue') < 20) else np.nan)),
            
            # Rentabilidad
            'roe': net_income / total_equity if not np.isnan(net_income) and not np.isnan(total_equity) and total_equity != 0 else np.nan,
            'roa': net_income / total_assets if not np.isnan(net_income) and not np.isnan(total_assets) and total_assets != 0 else np.nan,
            'rop': net_income / total_liabilities if not np.isnan(net_income) and not np.isnan(total_liabilities) and total_liabilities != 0 else np.nan,
            'roic': np.nan,  # Se calcula después
            
            # Márgenes
            'gross_margin': info.get('grossMargins', gross_profit / total_revenue if not np.isnan(gross_profit) and not np.isnan(total_revenue) and total_revenue != 0 else np.nan),
            'operating_margin': info.get('operatingMargins', operating_income / total_revenue if not np.isnan(operating_income) and not np.isnan(total_revenue) and total_revenue != 0 else np.nan),
            'profit_margin': info.get('profitMargins', net_income / total_revenue if not np.isnan(net_income) and not np.isnan(total_revenue) and total_revenue != 0 else np.nan),
            'ebitda_margin': (ebitda / total_revenue if (not np.isnan(ebitda) and not np.isnan(total_revenue) and total_revenue != 0 and ebitda > 0 and (ebitda / total_revenue) < 2 and (ebitda / total_revenue) > -0.5) else np.nan),
            
            # Solvencia y Estructura de Capital
            'endeudamiento': (total_liabilities / total_equity if (not np.isnan(total_liabilities) and not np.isnan(total_equity) and total_equity != 0 and 0 < (total_liabilities / total_equity) < 20) else np.nan),
            'solvencia': (total_assets / total_liabilities if (not np.isnan(total_assets) and not np.isnan(total_liabilities) and total_liabilities != 0 and 0.5 < (total_assets / total_liabilities) < 50) else np.nan),
            'liquidez_acida': ((current_assets - (inventory if not np.isnan(inventory) else 0)) / current_liabilities if (not np.isnan(current_assets) and not np.isnan(current_liabilities) and current_liabilities != 0 and 0 < ((current_assets - (inventory if not np.isnan(inventory) else 0)) / current_liabilities) < 20) else np.nan),
            'disponibilidad': (cash_and_equivalents / current_liabilities if (not np.isnan(cash_and_equivalents) and not np.isnan(current_liabilities) and current_liabilities != 0 and 0 < (cash_and_equivalents / current_liabilities) < 20) else np.nan),
            'apalancamiento': (total_assets / total_equity if (not np.isnan(total_assets) and not np.isnan(total_equity) and total_equity != 0 and 1 < (total_assets / total_equity) < 15) else np.nan),
            'debt_to_equity': (info.get('debtToEquity') / 100 if (info.get('debtToEquity') and 0 < info.get('debtToEquity') < 1000) else (total_debt / total_equity if (not np.isnan(total_debt) and not np.isnan(total_equity) and total_equity != 0 and 0 < (total_debt / total_equity) < 10) else np.nan)),
            'current_ratio': info.get('currentRatio', current_assets / current_liabilities if not np.isnan(current_assets) and not np.isnan(current_liabilities) and current_liabilities != 0 else np.nan),
            'quick_ratio': info.get('quickRatio', np.nan),
            
            # CORRECCIÓN: Recovery Rate = EBIT / Pasivo Total (capacidad de pago)
            # NO es lo mismo que ROP (que usa beneficio neto)
            'recovery_rate': ebit / total_liabilities if not np.isnan(ebit) and not np.isnan(total_liabilities) and total_liabilities != 0 else np.nan,
            
            'interest_coverage': ebit / interest_expense if not np.isnan(ebit) and not np.isnan(interest_expense) and interest_expense != 0 else np.nan,
            'valor_nominal': total_equity / shares_outstanding if not np.isnan(total_equity) and not np.isnan(shares_outstanding) and shares_outstanding != 0 else np.nan,
            
            # Gestión Operativa y Eficiencia
            'asset_turnover': total_revenue / total_assets if not np.isnan(total_revenue) and not np.isnan(total_assets) and total_assets != 0 else np.nan,
            'inventory_turnover': cost_of_revenue / inventory if not np.isnan(cost_of_revenue) and not np.isnan(inventory) and inventory != 0 else np.nan,
            'amortiguacion': current_assets / total_revenue if not np.isnan(current_assets) and not np.isnan(total_revenue) and total_revenue != 0 else np.nan,
            
            # Ciclo de Efectivo
            'dsi': (inventory / cost_of_revenue) * 365 if not np.isnan(inventory) and not np.isnan(cost_of_revenue) and cost_of_revenue != 0 else np.nan,
            'dso': (accounts_receivable / total_revenue) * 365 if not np.isnan(accounts_receivable) and not np.isnan(total_revenue) and total_revenue != 0 else np.nan,
            'dpo': (accounts_payable / cost_of_revenue) * 365 if not np.isnan(accounts_payable) and not np.isnan(cost_of_revenue) and cost_of_revenue != 0 else np.nan,
            'ciclo_operativo': np.nan,  # Se calcula después
            'cash_conversion_cycle': np.nan,  # Se calcula después
            
            # Crecimiento
            'revenue_growth': (info.get('revenueGrowth') if (info.get('revenueGrowth') and abs(info.get('revenueGrowth')) < 5) else np.nan),
            'earnings_growth': (info.get('earningsGrowth') if (info.get('earningsGrowth') and abs(info.get('earningsGrowth')) < 5) else np.nan),
            
            # Dividendos
            'dividend_yield': info.get('dividendYield') if (info.get('dividendYield') and 0 < info.get('dividendYield') < 0.5) else np.nan,
            'payout_ratio': info.get('payoutRatio', np.nan),
            
            # Beta y Volatilidad
            'beta': info.get('beta', np.nan),
            
            # CORRECCIÓN: Du Pont ROE con validación completa
            'dupont_roe': np.nan,  # Se calcula después
            
            # Datos absolutos (en millones)
            'ingresos_millones': total_revenue / 1e6 if not np.isnan(total_revenue) else np.nan,
            'beneficio_neto_millones': net_income / 1e6 if not np.isnan(net_income) else np.nan,
            'ebitda_millones': ebitda / 1e6 if not np.isnan(ebitda) else np.nan,
            'activos_totales_millones': total_assets / 1e6 if not np.isnan(total_assets) else np.nan,
            'deuda_total_millones': total_debt / 1e6 if not np.isnan(total_debt) else np.nan,
            
            # Datos para cálculos posteriores
            'total_revenue': total_revenue,
            'total_assets': total_assets,
            'total_equity': total_equity,
            'total_debt': total_debt,
            'cash_and_equivalents': cash_and_equivalents,
            'ebit': ebit,
            'tax_rate': tax_rate,
            
            'fecha_actualizacion': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # CORRECCIÓN: Calcular Du Pont ROE con validación completa
        if all(not np.isnan(x) and x != 0 for x in [net_income, total_revenue, total_assets, total_equity]):
            try:
                profit_margin = net_income / total_revenue
                asset_turnover = total_revenue / total_assets
                equity_multiplier = total_assets / total_equity
                dupont_roe = profit_margin * asset_turnover * equity_multiplier
                # Validar resultado razonable
                if -10 < dupont_roe < 10:  # ROE entre -1000% y 1000%
                    ratios['dupont_roe'] = dupont_roe
            except Exception as e:
                logger.warning(f"{ticker}: Error calculando Du Pont ROE: {e}")
        
        # CORRECCIÓN: Calcular ROIC con validación mejorada y corrección automática
        nopat = ebit * (1 - tax_rate) if not np.isnan(ebit) else np.nan
        
        # Invested Capital = Equity + Debt - Cash (con validación completa)
        invested_capital_calculado = False
        if all(not np.isnan(x) for x in [total_equity, total_debt, cash_and_equivalents]):
            invested_capital = total_equity + total_debt - cash_and_equivalents
            # CORRECCIÓN AUTOMÁTICA: Si invested capital es negativo, usar método alternativo
            if invested_capital <= 0:
                logger.info(f"{ticker}: CORRIGIENDO Invested Capital negativo ({invested_capital/1e6:.1f}M) - Usando método alternativo (Equity + Long-term Debt)")
                # Método alternativo: Equity + Long-term Debt (sin restar cash)
                if not np.isnan(total_equity) and not np.isnan(long_term_debt):
                    invested_capital = total_equity + long_term_debt
                    if invested_capital > 0:
                        invested_capital_calculado = True
                    else:
                        # Último recurso: solo usar total equity
                        if not np.isnan(total_equity) and total_equity > 0:
                            invested_capital = total_equity
                            invested_capital_calculado = True
                            logger.info(f"{ticker}: CORREGIDO usando solo Total Equity como Invested Capital")
            else:
                invested_capital_calculado = True
            
            if invested_capital_calculado and invested_capital > 0:
                roic = nopat / invested_capital if not np.isnan(nopat) and invested_capital != 0 else np.nan
                # Validar ROIC razonable (-100% a 100%)
                if not np.isnan(roic) and -1 < roic < 1:
                    ratios['roic'] = roic
                elif not np.isnan(roic):
                    logger.warning(f"{ticker}: ROIC fuera de rango razonable ({roic*100:.1f}%), invalidando")
                    ratios['roic'] = np.nan
        
        # Calcular ciclo operativo y cash conversion cycle
        dsi = ratios['dsi']
        dso = ratios['dso']
        dpo = ratios['dpo']
        
        if not np.isnan(dsi) and not np.isnan(dso):
            ratios['ciclo_operativo'] = dsi + dso
        
        if not np.isnan(dsi) and not np.isnan(dso) and not np.isnan(dpo):
            ratios['cash_conversion_cycle'] = dsi + dso - dpo
        
        # VALIDACIONES Y CORRECCIONES AUTOMÁTICAS
        advertencias = []
        
        # CEDEAR: Informar que se usaron datos del subyacente
        if es_cedear_extranjero and info_subyacente:
            mercado_origen = pais_origen
            if ticker_subyacente in ['MELI', 'GLOB']:
                mercado_origen = "NASDAQ (USA)"
            advertencias.append(f"CEDEAR ({ticker_subyacente}): Ratios de valoración del subyacente en {mercado_origen}")
        
        # CORRECCIÓN AUTOMÁTICA: EBITDA Margin debe ser >= Operating Margin
        if (ratios.get('ebitda_margin') and ratios.get('operating_margin') and 
            not np.isnan(ratios['ebitda_margin']) and not np.isnan(ratios['operating_margin'])):
            if ratios['ebitda_margin'] < ratios['operating_margin']:
                logger.info(f"{ticker}: CORRIGIENDO EBITDA Margin ({ratios['ebitda_margin']*100:.1f}%) menor que Operating Margin ({ratios['operating_margin']*100:.1f}%)")
                # Intentar recalcular EBITDA desde Operating Income + D&A
                depreciation = safe_get(cashflow, ['Depreciation And Amortization', 'Depreciation', 'Amortization'])
                if not np.isnan(operating_income) and not np.isnan(depreciation) and not np.isnan(total_revenue) and total_revenue != 0:
                    ebitda_corregido = operating_income + abs(depreciation)
                    ebitda_margin_corregido = ebitda_corregido / total_revenue
                    # Validar que ahora sea coherente
                    if ebitda_margin_corregido >= ratios['operating_margin'] and 0 < ebitda_margin_corregido < 2:
                        ratios['ebitda_margin'] = ebitda_margin_corregido
                        ratios['ebitda'] = ebitda_corregido
                        ratios['ebitda_millones'] = ebitda_corregido / 1e6
                        logger.info(f"{ticker}: EBITDA CORREGIDO exitosamente a {ebitda_margin_corregido*100:.1f}%")
                        advertencias.append(f"EBITDA recalculado (estaba inconsistente)")
                    else:
                        # Si no se puede corregir, invalidar
                        ratios['ebitda_margin'] = np.nan
                        advertencias.append("EBITDA Margin invalidado (imposible corregir)")
                else:
                    ratios['ebitda_margin'] = np.nan
                    advertencias.append("EBITDA Margin invalidado (datos insuficientes para corregir)")
        
        # CORRECCIÓN AUTOMÁTICA: P/E muy bajo con empresa rentable
        if ratios.get('pe_ratio') and not np.isnan(ratios['pe_ratio']) and ratios['pe_ratio'] < 5:
            if ratios.get('roe') and not np.isnan(ratios['roe']) and ratios['roe'] > 0.1:
                # P/E muy bajo puede indicar error de datos o situación especial
                # Intentar obtener Forward P/E como alternativa
                if ratios.get('forward_pe') and not np.isnan(ratios['forward_pe']) and ratios['forward_pe'] > 5:
                    logger.info(f"{ticker}: CORRIGIENDO P/E sospechoso ({ratios['pe_ratio']:.2f}) usando Forward P/E ({ratios['forward_pe']:.2f})")
                    ratios['pe_ratio'] = ratios['forward_pe']
                    advertencias.append(f"P/E reemplazado por Forward P/E (valor más confiable)")
                else:
                    advertencias.append(f"ADVERTENCIA: P/E = {ratios['pe_ratio']:.2f} muy bajo para empresa rentable (posible evento especial)")
        
        # CORRECCIÓN AUTOMÁTICA: Earnings Growth muy negativo con Revenue Growth positivo
        if (ratios.get('earnings_growth') and ratios.get('revenue_growth') and
            not np.isnan(ratios['earnings_growth']) and not np.isnan(ratios['revenue_growth'])):
            if ratios['earnings_growth'] < -0.5 and ratios['revenue_growth'] > 0.2:
                logger.info(f"{ticker}: CORRIGIENDO incoherencia - Earnings Growth {ratios['earnings_growth']*100:.1f}% negativo con Revenue Growth {ratios['revenue_growth']*100:.1f}% positivo")
                # Esta situación puede ocurrir por:
                # 1. Cargos extraordinarios (restructuración, impuestos especiales)
                # 2. Error de datos
                # 3. Deterioro de márgenes operativos
                
                # Intentar calcular earnings growth desde estados financieros
                try:
                    # Obtener ingresos netos de años consecutivos
                    if not quarterly_income.empty and len(quarterly_income.columns) >= 2:
                        net_incomes = []
                        for col_idx in range(min(2, len(quarterly_income.columns))):
                            ni = safe_get(quarterly_income, ['Net Income'], col_idx)
                            if not np.isnan(ni):
                                net_incomes.append(ni)
                        
                        if len(net_incomes) >= 2:
                            earnings_growth_calc = (net_incomes[0] - net_incomes[1]) / abs(net_incomes[1])
                            # Validar que sea más coherente
                            if abs(earnings_growth_calc) < abs(ratios['earnings_growth']) and abs(earnings_growth_calc) < 2:
                                ratios['earnings_growth'] = earnings_growth_calc
                                logger.info(f"{ticker}: Earnings Growth CORREGIDO a {earnings_growth_calc*100:.1f}%")
                                advertencias.append("Earnings Growth recalculado (incoherencia detectada)")
                            else:
                                # Si la incoherencia persiste, probablemente sea real (cargo extraordinario)
                                advertencias.append(f"Incoherencia confirmada: posible cargo extraordinario o deterioro de márgenes")
                        else:
                            ratios['earnings_growth'] = np.nan
                            advertencias.append("Earnings Growth invalidado (incoherencia no corregible)")
                    else:
                        ratios['earnings_growth'] = np.nan
                        advertencias.append("Earnings Growth invalidado (datos insuficientes para corregir)")
                except Exception as e:
                    logger.warning(f"{ticker}: Error intentando corregir Earnings Growth: {e}")
                    ratios['earnings_growth'] = np.nan
                    advertencias.append("Earnings Growth invalidado (error en corrección)")
        
        if advertencias:
            ratios['advertencias'] = advertencias
            for adv in advertencias:
                logger.warning(f"{ticker}: {adv}")
        
        return ratios
        
    except Exception as e:
        logger.error(f"Error calculando ratios para {ticker}: {str(e)}")
        return {
            'ticker': ticker,
            'error': str(e),
            'nombre': ticker,
            'sector': 'ERROR',
            'industria': 'ERROR'
        }


def obtener_ratios_multiples_tickers(tickers, max_workers=5):
    """Obtiene ratios para múltiples tickers en paralelo"""
    resultados = []
    total = len(tickers)
    
    logger.info(f"Procesando {total} tickers...")
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(calcular_ratios_fundamentales, ticker): ticker for ticker in tickers}
        
        for idx, future in enumerate(as_completed(futures), 1):
            ticker = futures[future]
            try:
                resultado = future.result()
                if resultado and 'error' not in resultado:
                    resultados.append(resultado)
                    logger.info(f"[{idx}/{total}] ✓ {ticker} procesado")
                else:
                    logger.warning(f"[{idx}/{total}] ✗ {ticker} falló")
            except Exception as e:
                logger.error(f"[{idx}/{total}] ✗ {ticker} error: {str(e)}")
    
    return resultados


# ============================================================================
# FUNCIONES PARA OBTENER TICKERS DE SECTORES DINÁMICAMENTE
# ============================================================================

def obtener_tickers_sector_dinamico(sector, industria=None, pais='United States', max_tickers=20):
    """
    Obtiene tickers de un sector dinámicamente desde yfinance.
    
    Args:
        sector (str): Sector objetivo
        industria (str): Industria específica (opcional)
        pais (str): País de origen
        max_tickers (int): Máximo de tickers a retornar
    
    Returns:
        list: Lista de tickers del sector
    """
    try:
        logger.info(f"Buscando tickers dinámicamente para sector: {sector} en {pais}")
        
        # Lista base de tickers grandes por capitalización para screening
        # Se obtienen los componentes del S&P 500 o índices principales
        tickers_screening = []
        
        # Para mercado USA: usar componentes del S&P 500
        if pais in ['United States', 'USA']:
            # Lista de tickers grandes del S&P 500 para screening rápido
            # En producción, esto se podría obtener de una API o scraping
            sp500_sample = [
                'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B', 'UNH', 'XOM',
                'JNJ', 'JPM', 'V', 'PG', 'MA', 'HD', 'CVX', 'ABBV', 'MRK', 'AVGO',
                'LLY', 'KO', 'PEP', 'COST', 'TMO', 'BAC', 'MCD', 'CSCO', 'WMT', 'ACN',
                'ABT', 'DHR', 'CRM', 'VZ', 'NEE', 'ADBE', 'LIN', 'ORCL', 'NKE', 'PFE',
                'DIS', 'TXN', 'BMY', 'PM', 'RTX', 'UPS', 'T', 'MS', 'AMD', 'HON',
                'COP', 'QCOM', 'UNP', 'LOW', 'AMGN', 'INTU', 'CAT', 'GE', 'BA', 'DE',
                'SBUX', 'GS', 'BLK', 'AXP', 'BKNG', 'NOW', 'SPGI', 'ISRG', 'TJX', 'AMT',
                'ADP', 'MMM', 'SYK', 'MDLZ', 'GILD', 'CVS', 'PLD', 'CI', 'REGN', 'ZTS',
                'ADI', 'TMUS', 'MO', 'SO', 'CB', 'DUK', 'BDX', 'SLB', 'EOG', 'PXD',
                'SCHW', 'USB', 'CME', 'MPC', 'PSX', 'VLO', 'OXY', 'CMCSA', 'NFLX', 'CHTR'
            ]
            tickers_screening = sp500_sample
        
        # Para Argentina: usar empresas locales
        elif pais in ['Argentina', 'AR']:
            tickers_screening = [
                'GGAL.BA', 'BMA.BA', 'SUPV.BA', 'BBAR.BA', 'COME.BA',
                'YPFD.BA', 'PAMP.BA', 'TGSU2.BA', 'TRAN.BA', 'CGPA2.BA',
                'ALUA.BA', 'TXAR.BA', 'CRES.BA', 'LOMA.BA', 'MIRG.BA',
                'EDN.BA', 'BYMA.BA', 'AGRO.BA', 'TECO2.BA', 'CEPU.BA',
                'VALO.BA', 'BOLT.BA', 'HARG.BA', 'IRSA.BA', 'MOLI.BA'
            ]
        else:
            # Para otros países, usar los mismos tickers del S&P 500
            tickers_screening = sp500_sample[:50]
        
        # Screening: obtener sector de cada ticker
        tickers_del_sector = []
        print(f"  Screening {len(tickers_screening)} tickers para encontrar sector {sector}...")
        
        for ticker in tickers_screening:
            try:
                stock = yf.Ticker(ticker)
                info = stock.info or {}
                
                ticker_sector = info.get('sector', '')
                ticker_industria = info.get('industry', '')
                ticker_pais = info.get('country', '')
                
                # Normalizar nombres de sectores
                sector_normalizado = sector.lower().replace(' ', '')
                ticker_sector_normalizado = ticker_sector.lower().replace(' ', '')
                
                # Verificar coincidencia de sector y país
                if sector_normalizado in ticker_sector_normalizado or ticker_sector_normalizado in sector_normalizado:
                    # Verificar país si es relevante
                    if pais in ['Argentina', 'AR']:
                        if ticker_pais in ['Argentina', 'AR'] or ticker.endswith('.BA'):
                            tickers_del_sector.append(ticker)
                            print(f"    ✓ {ticker}: {info.get('longName', ticker)[:50]}")
                    else:
                        # Para mercados internacionales, no filtrar estrictamente por país
                        tickers_del_sector.append(ticker)
                        if len(tickers_del_sector) <= 5:  # Mostrar solo primeros 5
                            print(f"    ✓ {ticker}: {info.get('longName', ticker)[:50]}")
                    
                    if len(tickers_del_sector) >= max_tickers:
                        break
            except Exception as e:
                continue
        
        if tickers_del_sector:
            print(f"  ✓ Se encontraron {len(tickers_del_sector)} tickers del sector {sector}")
        else:
            logger.warning(f"No se encontraron tickers para el sector {sector}")
        
        return tickers_del_sector[:max_tickers]
        
    except Exception as e:
        logger.error(f"Error obteniendo tickers del sector {sector}: {e}")
        return []


# ============================================================================
# FUNCIONES DE PORTAFOLIO Y COMPARACIÓN
# ============================================================================

def obtener_portafolios_clientes():
    """Obtiene los portafolios de todos los clientes desde IOL"""
    if not IOL_DISPONIBLE:
        logger.error("Módulos de IOL no disponibles")
        return {}
    
    try:
        logger.info("Conectando con InvertirOnline...")
        
        client = get_client()
        if not client or not client.obtener_tokens():
            logger.error("No se pudo autenticar con IOL")
            return {}
        
        logger.info("Autenticación exitosa con IOL")
        
        clientes = client.obtener_lista_clientes()
        if not clientes:
            logger.warning("No se encontraron clientes")
            return {}
        
        logger.info(f"Se encontraron {len(clientes)} cliente(s)")
        
        portafolios = {}
        
        for idx, cliente in enumerate(clientes, 1):
            cliente_id = cliente.get('id')
            cliente_nombre = cliente.get('nombre', 'Sin nombre')
            
            logger.info(f"[{idx}/{len(clientes)}] Procesando: {cliente_nombre} (ID: {cliente_id})")
            
            try:
                portafolio = client.obtener_portafolio_asesor(cliente_id, pais='argentina')
                
                if portafolio is not None and not portafolio.empty:
                    tickers_cliente = []
                    
                    for _, row in portafolio.iterrows():
                        titulo = row.get('titulo', {})
                        if isinstance(titulo, dict):
                            simbolo = titulo.get('simbolo')
                            if simbolo:
                                ticker_completo = f"{simbolo}.BA"
                                tickers_cliente.append(ticker_completo)
                    
                    if tickers_cliente:
                        portafolios[cliente_nombre] = {
                            'cliente_id': cliente_id,
                            'tickers': list(set(tickers_cliente))
                        }
                        logger.info(f"  ✓ {len(tickers_cliente)} ticker(s) encontrados")
                    else:
                        logger.warning(f"  ⚠ No se encontraron tickers")
                else:
                    logger.warning(f"  ⚠ Portafolio vacío")
                    
            except Exception as e:
                logger.error(f"  ✗ Error procesando cliente {cliente_id}: {str(e)}")
                continue
        
        return portafolios
        
    except Exception as e:
        logger.error(f"Error general al obtener portafolios: {str(e)}")
        return {}


def buscar_tickers_sector_mismo_mercado(ticker_base, sector, industria, pais, max_tickers=20):
    """
    Busca tickers del mismo sector y mercado dinámicamente desde yfinance.
    
    Args:
        ticker_base (str): Ticker de referencia
        sector (str): Sector objetivo
        industria (str): Industria específica
        pais (str): País de origen
        max_tickers (int): Máximo de tickers a retornar
    
    Returns:
        list: Lista de tickers del mismo sector
    """
    
    # Si es CEDEAR con subyacente extranjero
    if ticker_base.endswith('.BA') and pais not in ['Argentina', 'AR', None]:
        print(f"  {ticker_base} es CEDEAR con subyacente de {pais}")
        print(f"  Buscando empresas del mercado {pais} en sector {sector}...")
        
        # Obtener tickers dinámicamente
        tickers = obtener_tickers_sector_dinamico(sector, industria, pais, max_tickers + 5)
        
        # Filtrar el ticker base
        ticker_sin_ba = ticker_base.replace('.BA', '')
        tickers = [t for t in tickers if not t.endswith('.BA') and t != ticker_sin_ba]
        
        if tickers:
            print(f"    Comparando con {len(tickers[:max_tickers])} empresas del mercado {pais}")
        
        return tickers[:max_tickers]
    
    # Si es ticker argentino REAL
    elif ticker_base.endswith('.BA') and pais in ['Argentina', 'AR']:
        print(f"  Buscando empresas argentinas del sector {sector}...")
        
        # Obtener tickers argentinos dinámicamente
        tickers = obtener_tickers_sector_dinamico(sector, industria, 'Argentina', max_tickers + 5)
        
        # Filtrar el ticker base
        tickers = [t for t in tickers if t != ticker_base]
        
        return tickers[:max_tickers]
    
    else:
        # Para mercado USA directo
        print(f"  Buscando empresas del mercado USA en sector {sector}...")
        
        # Obtener tickers dinámicamente
        tickers = obtener_tickers_sector_dinamico(sector, industria, 'United States', max_tickers + 5)
        
        # Filtrar el ticker base
        tickers = [t for t in tickers if t != ticker_base and not t.endswith('.BA')]
        
        return tickers[:max_tickers]


def obtener_ratios_benchmark_sector(ticker_base, sector, industria, pais):
    """Obtiene ratios promedio del sector usando tickers del mismo mercado"""
    tickers_sector = buscar_tickers_sector_mismo_mercado(ticker_base, sector, industria, pais)
    
    if not tickers_sector:
        logger.warning(f"No se encontraron tickers del sector {sector} en el mismo mercado")
        return {}
    
    print(f"\n  Calculando benchmark con {len(tickers_sector)} ticker(s) del sector {sector}")
    resultados = obtener_ratios_multiples_tickers(tickers_sector, max_workers=5)
    
    if not resultados:
        return {}
    
    df = pd.DataFrame(resultados)
    columnas_numericas = df.select_dtypes(include=[np.number]).columns.tolist()
    
    ratios_promedio = {}
    for col in columnas_numericas:
        valor_promedio = df[col].mean()
        if not np.isnan(valor_promedio):
            ratios_promedio[f"{col}_sector"] = valor_promedio
    
    ratios_promedio['sector'] = sector
    ratios_promedio['n_empresas_benchmark'] = len(resultados)
    ratios_promedio['tickers_benchmark'] = ', '.join([r['ticker'] for r in resultados])
    
    return ratios_promedio


def comparar_ticker_vs_sector(ticker_ratios, sector_ratios):
    """Compara los ratios de un ticker con los promedios del sector"""
    comparacion = {
        'ticker': ticker_ratios.get('ticker'),
        'nombre': ticker_ratios.get('nombre'),
        'sector': ticker_ratios.get('sector'),
    }
    
    # MENOR ES MEJOR
    ratios_menor_mejor = {
        'pe_ratio', 'pb_ratio', 'ps_ratio', 'peg_ratio', 'ev_ebitda', 'ev_revenue',
        'debt_to_equity', 'endeudamiento', 'apalancamiento',
        'dsi', 'dso', 'ciclo_operativo', 'cash_conversion_cycle'
    }
    
    # MAYOR ES MEJOR
    ratios_mayor_mejor = {
        'roa', 'roe', 'rop', 'roic', 'dividend_yield',
        'solvencia', 'liquidez_acida', 'current_ratio', 'quick_ratio', 
        'disponibilidad', 'recovery_rate', 'interest_coverage',
        'gross_margin', 'operating_margin', 'profit_margin', 'ebitda_margin',
        'inventory_turnover', 'asset_turnover', 'amortiguacion',
        'revenue_growth', 'earnings_growth',
        'dpo'  # DPO alto es bueno
    }
    
    ratios_comparar = list(ratios_menor_mejor) + list(ratios_mayor_mejor)
    
    for ratio in ratios_comparar:
        valor_ticker = ticker_ratios.get(ratio)
        valor_sector = sector_ratios.get(f"{ratio}_sector")
        
        if valor_ticker is not None and not np.isnan(valor_ticker):
            # Filtrar valores absurdos
            if ratio in ['pe_ratio', 'pb_ratio', 'ps_ratio'] and abs(valor_ticker) > 1000:
                continue
            if ratio in ['dividend_yield'] and abs(valor_ticker) > 1:
                continue
            if ratio in ['apalancamiento', 'debt_to_equity'] and abs(valor_ticker) > 100:
                continue
            
            comparacion[f"{ratio}_ticker"] = valor_ticker
            
            if valor_sector is not None and not np.isnan(valor_sector):
                comparacion[f"{ratio}_sector"] = valor_sector
                
                if valor_sector != 0:
                    if valor_sector < 0 and valor_ticker < 0:
                        diferencia_pct = ((valor_ticker - valor_sector) / abs(valor_sector)) * 100
                    else:
                        diferencia_pct = ((valor_ticker - valor_sector) / abs(valor_sector)) * 100
                    comparacion[f"{ratio}_diff_pct"] = diferencia_pct
                    
                    # Clasificar desempeño
                    if ratio in ratios_menor_mejor:
                        if diferencia_pct < -10:
                            comparacion[f"{ratio}_performance"] = "Superior"
                            comparacion[f"{ratio}_explicacion"] = "Menor es mejor"
                        elif diferencia_pct > 10:
                            comparacion[f"{ratio}_performance"] = "Inferior"
                            comparacion[f"{ratio}_explicacion"] = "Mayor es peor"
                        else:
                            comparacion[f"{ratio}_performance"] = "En línea"
                            comparacion[f"{ratio}_explicacion"] = "Similar al sector"
                    
                    elif ratio in ratios_mayor_mejor:
                        if diferencia_pct > 10:
                            comparacion[f"{ratio}_performance"] = "Superior"
                            comparacion[f"{ratio}_explicacion"] = "Mayor es mejor"
                        elif diferencia_pct < -10:
                            comparacion[f"{ratio}_performance"] = "Inferior"
                            comparacion[f"{ratio}_explicacion"] = "Menor es peor"
                        else:
                            comparacion[f"{ratio}_performance"] = "En línea"
                            comparacion[f"{ratio}_explicacion"] = "Similar al sector"
    
    return comparacion


# ============================================================================
# FUNCIÓN PRINCIPAL
# ============================================================================

def analizar_portafolios_clientes():
    """Función principal que analiza los portafolios de clientes vs sectores"""
    print("\n" + "="*80)
    print("ANÁLISIS COMPARATIVO: PORTAFOLIOS DE CLIENTES VS SECTORES")
    print("="*80)
    
    # 1. Obtener portafolios de clientes
    print("\n📡 Paso 1: Obteniendo portafolios de clientes desde IOL...")
    portafolios = obtener_portafolios_clientes()
    
    if not portafolios:
        print("\n❌ No se pudieron obtener portafolios de clientes")
        return None, None
    
    print(f"\n✓ Se obtuvieron portafolios de {len(portafolios)} cliente(s)")
    
    for cliente, datos in portafolios.items():
        print(f"\n  Cliente: {cliente}")
        print(f"  Tickers: {', '.join(datos['tickers'])}")
    
    # 2. Obtener todos los tickers únicos
    todos_tickers = set()
    for datos in portafolios.values():
        todos_tickers.update(datos['tickers'])
    todos_tickers = list(todos_tickers)
    
    print(f"\n📊 Paso 2: Calculando ratios para {len(todos_tickers)} ticker(s) únicos...")
    ratios_tickers = obtener_ratios_multiples_tickers(todos_tickers, max_workers=10)
    
    if not ratios_tickers:
        print("\n❌ No se pudieron obtener ratios para los tickers")
        return None, None
    
    print(f"\n  ✓ Se obtuvieron ratios para {len(ratios_tickers)} ticker(s)")
    
    ratios_dict = {r['ticker']: r for r in ratios_tickers}
    
    # 3. Identificar sectores únicos
    sectores_unicos = set()
    for ratios in ratios_tickers:
        sector = ratios.get('sector')
        if sector and sector != 'N/A':
            sectores_unicos.add(sector)
    
    print(f"\n🏢 Paso 3: Obteniendo benchmarks de {len(sectores_unicos)} sectores...")
    
    # 4. Obtener ratios de benchmark por sector
    benchmarks_sectores = {}
    ticker_sector_map = {}
    
    for ratios in ratios_tickers:
        ticker = ratios.get('ticker')
        sector = ratios.get('sector')
        if ticker and sector and sector != 'N/A':
            ticker_sector_map[ticker] = ratios
    
    for sector in sectores_unicos:
        ticker_referencia = None
        for ticker, ratios in ticker_sector_map.items():
            if ratios.get('sector') == sector:
                ticker_referencia = ticker
                break
        
        if ticker_referencia:
            print(f"\n  Procesando sector: {sector}...")
            industria = ticker_sector_map[ticker_referencia].get('industria', '')
            pais = ticker_sector_map[ticker_referencia].get('pais', '')
            benchmark = obtener_ratios_benchmark_sector(ticker_referencia, sector, industria, pais)
            if benchmark:
                benchmarks_sectores[sector] = benchmark
    
    # 5. Comparar cada ticker con su sector
    print(f"\n📊 Paso 4: Comparando tickers vs sectores...")
    comparaciones = []
    
    for cliente, datos in portafolios.items():
        for ticker in datos['tickers']:
            ticker_ratios = ratios_dict.get(ticker)
            if not ticker_ratios or 'error' in ticker_ratios:
                continue
            
            sector = ticker_ratios.get('sector')
            
            if sector and sector != 'N/A' and sector not in benchmarks_sectores:
                industria = ticker_ratios.get('industria', '')
                pais = ticker_ratios.get('pais', '')
                benchmark = obtener_ratios_benchmark_sector(ticker, sector, industria, pais)
                if benchmark:
                    benchmarks_sectores[sector] = benchmark
            
            if sector in benchmarks_sectores:
                comparacion = comparar_ticker_vs_sector(
                    ticker_ratios, 
                    benchmarks_sectores[sector]
                )
                comparacion['cliente'] = cliente
                comparaciones.append(comparacion)
    
    if not comparaciones:
        print("\n❌ No se pudieron generar comparaciones")
        return None, None
    
    # 6. Crear DataFrames
    df_comparaciones = pd.DataFrame(comparaciones)
    df_comparaciones['ratios_originales'] = df_comparaciones['ticker'].map(ratios_dict)
    
    # 7. Crear resumen por cliente
    print(f"\n📊 Paso 5: Generando resúmenes por cliente...")
    resumen_clientes = []
    
    for cliente in portafolios.keys():
        df_cliente = df_comparaciones[df_comparaciones['cliente'] == cliente]
        
        if df_cliente.empty:
            continue
        
        performance_cols = [col for col in df_cliente.columns if col.endswith('_performance')]
        
        resumen = {
            'cliente': cliente,
            'num_tickers': len(df_cliente),
            'sectores': ', '.join(df_cliente['sector'].unique()),
        }
        
        for col in performance_cols:
            ratio_name = col.replace('_performance', '')
            superior = (df_cliente[col] == 'Superior').sum()
            en_linea = (df_cliente[col] == 'En línea').sum()
            inferior = (df_cliente[col] == 'Inferior').sum()
            
            resumen[f"{ratio_name}_superior"] = superior
            resumen[f"{ratio_name}_en_linea"] = en_linea
            resumen[f"{ratio_name}_inferior"] = inferior
        
        resumen_clientes.append(resumen)
    
    df_resumen = pd.DataFrame(resumen_clientes)
    
    return df_comparaciones, df_resumen


def mostrar_resumen_ejecutivo(df_comparaciones, df_resumen):
    """Muestra un resumen ejecutivo de los resultados"""
    print("\n" + "="*80)
    print("RESUMEN EJECUTIVO DEL ANÁLISIS")
    print("="*80)
    
    print(f"\nTotal de clientes analizados: {len(df_resumen)}")
    print(f"Total de activos únicos: {len(df_comparaciones)}")
    print(f"Sectores cubiertos: {df_comparaciones['sector'].nunique()}")
    
    print("\n" + "-"*80)
    print("PERFORMANCE CONSOLIDADA POR CLIENTE")
    print("-"*80)
    
    for _, row in df_resumen.iterrows():
        cliente = row['cliente']
        num_tickers = row['num_tickers']
        
        print(f"\n{cliente}:")
        print(f"  - Activos analizados: {num_tickers}")
        print(f"  - Sectores: {row['sectores']}")
    
    print("\n" + "="*80)
    print("✅ Análisis completado exitosamente!")
    print("="*80)


def main():
    """Función principal"""
    # Verificar disponibilidad de IOL
    if not IOL_DISPONIBLE:
        print("\n❌ ERROR: Módulos de IOL no disponibles")
        print("Este script requiere conexión con InvertirOnline")
        return None, None
    
    # Ejecutar análisis
    df_comparaciones, df_resumen = analizar_portafolios_clientes()
    
    if df_comparaciones is None or df_resumen is None:
        print("\n❌ El análisis no pudo completarse")
        return None, None
    
    # Mostrar resumen ejecutivo
    mostrar_resumen_ejecutivo(df_comparaciones, df_resumen)
    
    # Guardar resultados
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    try:
        # Guardar CSV
        csv_file = f"analisis_portafolios_{timestamp}.csv"
        df_comparaciones.to_csv(csv_file, index=False, encoding='utf-8-sig')
        print(f"\n💾 Resultados guardados en: {csv_file}")
        
        # Guardar Excel
        excel_file = f"analisis_portafolios_{timestamp}.xlsx"
        with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
            df_comparaciones.to_excel(writer, sheet_name='Comparaciones', index=False)
            df_resumen.to_excel(writer, sheet_name='Resumen Clientes', index=False)
        print(f"💾 Resultados guardados en: {excel_file}")
    except Exception as e:
        logger.warning(f"Error al guardar resultados: {e}")
    
    return df_comparaciones, df_resumen


if __name__ == '__main__':
    df_comparaciones, df_resumen = main()

