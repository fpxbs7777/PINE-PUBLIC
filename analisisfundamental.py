#!/usr/bin/env python3
"""
Script de Análisis Financiero con yfinance
Calcula ratios financieros clave para acciones usando datos de Yahoo Finance
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


class AnalizadorFinanciero:
    """Clase para analizar ratios financieros de empresas"""
    
    def __init__(self, ticker):
        """
        Inicializa el analizador con un ticker
        
        Args:
            ticker (str): Símbolo de la acción (ej: 'AAPL', 'MSFT')
        """
        self.ticker = ticker
        self.stock = yf.Ticker(ticker)
        self.info = None
        self.balance_sheet = None
        self.income_stmt = None
        self.cash_flow = None
        self.current_price = None
        
        # Cargar datos
        self._cargar_datos()
    
    def _cargar_datos(self):
        """Carga los datos financieros de la empresa"""
        try:
            print(f"\n{'='*60}")
            print(f"Cargando datos para {self.ticker}...")
            print(f"{'='*60}")
            
            # Información general
            self.info = self.stock.info
            
            # Estados financieros
            self.balance_sheet = self.stock.balance_sheet
            self.income_stmt = self.stock.income_stmt
            self.cash_flow = self.stock.cash_flow
            
            # Precio actual
            self.current_price = self.info.get('currentPrice', self.info.get('regularMarketPrice', 0))
            
            print(f"✓ Datos cargados exitosamente")
            print(f"✓ Empresa: {self.info.get('longName', 'N/A')}")
            print(f"✓ Sector: {self.info.get('sector', 'N/A')}")
            print(f"✓ Industria: {self.info.get('industry', 'N/A')}")
            
        except Exception as e:
            print(f"✗ Error al cargar datos: {str(e)}")
    
    def _obtener_valor(self, dataframe, campo, columna=0):
        """Obtiene un valor del dataframe de manera segura"""
        try:
            if dataframe is None or dataframe.empty:
                return None
            if campo in dataframe.index:
                return dataframe.loc[campo].iloc[columna]
            return None
        except:
            return None
    
    # ==================== RATIOS DE VALORACIÓN ====================
    
    def calcular_pe_ratio(self):
        """
        P/E Ratio - Price to Earnings
        Formula: Precio de mercado / Ganancias por acción
        """
        try:
            pe = self.info.get('trailingPE', None)
            forward_pe = self.info.get('forwardPE', None)
            
            print(f"\n📊 P/E Ratio (Price to Earnings)")
            print(f"   Formula: Precio de mercado / Ganancias por acción")
            if pe:
                print(f"   P/E Trailing: {pe:.2f}")
                print(f"   Interpretación: La acción cotiza a {pe:.2f}x sus ganancias")
                if pe < 15:
                    print(f"   ✓ P/E bajo - Potencialmente subvalorada")
                elif pe > 25:
                    print(f"   ⚠ P/E alto - Potencialmente sobrevalorada o alto crecimiento esperado")
                else:
                    print(f"   ✓ P/E moderado - Valoración razonable")
            
            if forward_pe:
                print(f"   P/E Forward: {forward_pe:.2f}")
            
            return {'pe_trailing': pe, 'pe_forward': forward_pe}
        except Exception as e:
            print(f"   ✗ Error calculando P/E: {str(e)}")
            return None
    
    def calcular_pb_ratio(self):
        """
        P/B Ratio - Price to Book Value
        Formula: (Precio * Acciones en circulación) / Patrimonio Neto
        """
        try:
            pb = self.info.get('priceToBook', None)
            
            print(f"\n📊 P/B Ratio (Price to Book Value)")
            print(f"   Formula: Precio de mercado / Valor en libros por acción")
            if pb:
                print(f"   P/B: {pb:.2f}")
                print(f"   Interpretación: La acción cotiza a {pb:.2f}x su valor contable")
                if pb < 1:
                    print(f"   ✓ P/B < 1 - Cotiza por debajo del valor en libros (oportunidad)")
                elif pb > 3:
                    print(f"   ⚠ P/B > 3 - Cotiza muy por encima del valor contable")
                else:
                    print(f"   ✓ P/B moderado")
            
            return pb
        except Exception as e:
            print(f"   ✗ Error calculando P/B: {str(e)}")
            return None
    
    def calcular_ps_ratio(self):
        """
        P/S Ratio - Price to Sales
        Formula: Precio de acción / Ventas por acción
        """
        try:
            ps = self.info.get('priceToSalesTrailing12Months', None)
            
            print(f"\n📊 P/S Ratio (Price to Sales)")
            print(f"   Formula: Precio de acción / Ventas por acción")
            if ps:
                print(f"   P/S: {ps:.2f}")
                print(f"   Interpretación: Pagas ${ps:.2f} por cada $1 de ventas")
                if ps < 1:
                    print(f"   ✓ P/S < 1 - Muy económico")
                elif ps > 10:
                    print(f"   ⚠ P/S > 10 - Muy caro, valoración basada en crecimiento futuro")
                else:
                    print(f"   ✓ P/S moderado")
            
            return ps
        except Exception as e:
            print(f"   ✗ Error calculando P/S: {str(e)}")
            return None
    
    def calcular_dividendo(self):
        """
        Dividend Yield
        Formula: Dividendo por acción / Precio de acción
        """
        try:
            div_yield = self.info.get('dividendYield', None)
            div_rate = self.info.get('dividendRate', None)
            
            print(f"\n💰 Dividendo")
            print(f"   Formula: Dividendo por acción / Precio de acción")
            if div_yield:
                print(f"   Dividend Yield: {div_yield*100:.2f}%")
                if div_rate:
                    print(f"   Dividendo anual: ${div_rate:.2f}")
                print(f"   Interpretación: Recibes {div_yield*100:.2f}% anual en dividendos")
                if div_yield > 0.04:
                    print(f"   ✓ Buen rendimiento de dividendos (>{4}%)")
            else:
                print(f"   Esta empresa no paga dividendos")
            
            return {'yield': div_yield, 'rate': div_rate}
        except Exception as e:
            print(f"   ✗ Error calculando dividendo: {str(e)}")
            return None
    
    def calcular_ev_ebitda(self):
        """
        EV/EBITDA
        Formula: (Market Cap + Deuda Total - Efectivo) / EBITDA
        """
        try:
            ev_ebitda = self.info.get('enterpriseToEbitda', None)
            
            print(f"\n📊 EV/EBITDA")
            print(f"   Formula: Enterprise Value / EBITDA")
            if ev_ebitda:
                print(f"   EV/EBITDA: {ev_ebitda:.2f}")
                print(f"   Interpretación: {ev_ebitda:.2f} años para recuperar inversión (EBITDA)")
                if ev_ebitda < 8:
                    print(f"   ✓ EV/EBITDA bajo - Valoración atractiva")
                elif ev_ebitda > 15:
                    print(f"   ⚠ EV/EBITDA alto - Valoración exigente")
                else:
                    print(f"   ✓ EV/EBITDA moderado")
            
            return ev_ebitda
        except Exception as e:
            print(f"   ✗ Error calculando EV/EBITDA: {str(e)}")
            return None
    
    # ==================== RATIOS DE RENTABILIDAD ====================
    
    def calcular_roa(self):
        """
        ROA - Return on Assets
        Formula: Resultado neto / Activo Total
        """
        try:
            roa = self.info.get('returnOnAssets', None)
            
            print(f"\n💹 ROA (Return on Assets)")
            print(f"   Formula: Resultado neto / Activo Total")
            if roa:
                print(f"   ROA: {roa*100:.2f}%")
                print(f"   Interpretación: Genera {roa*100:.2f}% de retorno sobre sus activos")
                if roa > 0.05:
                    print(f"   ✓ ROA > 5% - Buen uso de activos")
                elif roa < 0:
                    print(f"   ✗ ROA negativo - Empresa en pérdidas")
                else:
                    print(f"   ⚠ ROA bajo - Uso ineficiente de activos")
            
            return roa
        except Exception as e:
            print(f"   ✗ Error calculando ROA: {str(e)}")
            return None
    
    def calcular_roe(self):
        """
        ROE - Return on Equity
        Formula: Resultado neto / Patrimonio Neto
        """
        try:
            roe = self.info.get('returnOnEquity', None)
            
            print(f"\n💹 ROE (Return on Equity)")
            print(f"   Formula: Resultado neto / Patrimonio Neto")
            if roe:
                print(f"   ROE: {roe*100:.2f}%")
                print(f"   Interpretación: Genera {roe*100:.2f}% de retorno sobre el capital")
                if roe > 0.15:
                    print(f"   ✓ ROE > 15% - Excelente rentabilidad")
                elif roe > 0.10:
                    print(f"   ✓ ROE > 10% - Buena rentabilidad")
                elif roe < 0:
                    print(f"   ✗ ROE negativo - Destrucción de valor")
                else:
                    print(f"   ⚠ ROE bajo - Rentabilidad cuestionable")
            
            return roe
        except Exception as e:
            print(f"   ✗ Error calculando ROE: {str(e)}")
            return None
    
    def calcular_margenes(self):
        """
        Márgenes de Ganancia
        - Gross Margin: (Ingresos - Costo de Ventas) / Ingresos
        - Operating Margin: Operating Income / Ingresos
        """
        try:
            gross_margin = self.info.get('grossMargins', None)
            operating_margin = self.info.get('operatingMargins', None)
            profit_margin = self.info.get('profitMargins', None)
            
            print(f"\n📈 Márgenes de Ganancia")
            
            if gross_margin:
                print(f"\n   Margen Bruto (Gross Margin): {gross_margin*100:.2f}%")
                print(f"   Formula: (Ingresos - Costo de Ventas) / Ingresos")
                if gross_margin > 0.40:
                    print(f"   ✓ Excelente margen bruto (>40%)")
            
            if operating_margin:
                print(f"\n   Margen Operativo: {operating_margin*100:.2f}%")
                print(f"   Formula: Resultado Operativo / Ingresos")
                if operating_margin > 0.15:
                    print(f"   ✓ Excelente margen operativo (>15%)")
            
            if profit_margin:
                print(f"\n   Margen Neto: {profit_margin*100:.2f}%")
                print(f"   Formula: Resultado Neto / Ingresos")
                if profit_margin > 0.10:
                    print(f"   ✓ Excelente margen neto (>10%)")
            
            return {
                'gross': gross_margin,
                'operating': operating_margin,
                'profit': profit_margin
            }
        except Exception as e:
            print(f"   ✗ Error calculando márgenes: {str(e)}")
            return None
    
    # ==================== RATIOS DE LIQUIDEZ Y SOLVENCIA ====================
    
    def calcular_current_ratio(self):
        """
        Current Ratio (Liquidez Corriente)
        Formula: Activo Corriente / Pasivo Corriente
        """
        try:
            current_ratio = self.info.get('currentRatio', None)
            
            print(f"\n💧 Current Ratio (Liquidez Corriente)")
            print(f"   Formula: Activo Corriente / Pasivo Corriente")
            if current_ratio:
                print(f"   Current Ratio: {current_ratio:.2f}")
                print(f"   Interpretación: Por cada $1 de deuda CP, tiene ${current_ratio:.2f} en activos CP")
                if current_ratio > 2:
                    print(f"   ✓ Excelente liquidez (>2)")
                elif current_ratio > 1:
                    print(f"   ✓ Buena liquidez (>1)")
                else:
                    print(f"   ✗ Problemas de liquidez (<1)")
            
            return current_ratio
        except Exception as e:
            print(f"   ✗ Error calculando Current Ratio: {str(e)}")
            return None
    
    def calcular_quick_ratio(self):
        """
        Quick Ratio (Acid Test)
        Formula: (Activo Corriente - Inventario) / Pasivo Corriente
        """
        try:
            quick_ratio = self.info.get('quickRatio', None)
            
            print(f"\n💧 Quick Ratio (Prueba Ácida)")
            print(f"   Formula: (Activo Corriente - Inventario) / Pasivo Corriente")
            if quick_ratio:
                print(f"   Quick Ratio: {quick_ratio:.2f}")
                print(f"   Interpretación: Liquidez inmediata sin contar inventarios")
                if quick_ratio > 1:
                    print(f"   ✓ Buena liquidez inmediata (>1)")
                else:
                    print(f"   ⚠ Depende del inventario para liquidez")
            
            return quick_ratio
        except Exception as e:
            print(f"   ✗ Error calculando Quick Ratio: {str(e)}")
            return None
    
    def calcular_debt_to_equity(self):
        """
        Debt to Equity (Endeudamiento)
        Formula: Pasivo Total / Patrimonio Neto
        """
        try:
            debt_to_equity = self.info.get('debtToEquity', None)
            
            print(f"\n⚖️ Debt to Equity (Endeudamiento)")
            print(f"   Formula: Pasivo Total / Patrimonio Neto")
            if debt_to_equity:
                d_e_ratio = debt_to_equity / 100  # yfinance lo da en porcentaje
                print(f"   D/E Ratio: {d_e_ratio:.2f}")
                print(f"   Interpretación: Por cada $1 de capital, tiene ${d_e_ratio:.2f} de deuda")
                if d_e_ratio < 0.5:
                    print(f"   ✓ Bajo endeudamiento (<0.5)")
                elif d_e_ratio < 1:
                    print(f"   ✓ Endeudamiento moderado (<1)")
                elif d_e_ratio < 2:
                    print(f"   ⚠ Endeudamiento considerable (1-2)")
                else:
                    print(f"   ✗ Alto endeudamiento (>2)")
            
            return debt_to_equity
        except Exception as e:
            print(f"   ✗ Error calculando Debt to Equity: {str(e)}")
            return None
    
    def calcular_solvencia(self):
        """
        Solvencia
        Formula: Activo Total / Pasivo Total
        """
        try:
            total_assets = self._obtener_valor(self.balance_sheet, 'Total Assets')
            total_liabilities = self._obtener_valor(self.balance_sheet, 'Total Liabilities Net Minority Interest')
            
            print(f"\n⚖️ Solvencia")
            print(f"   Formula: Activo Total / Pasivo Total")
            
            if total_assets and total_liabilities:
                solvencia = total_assets / total_liabilities
                print(f"   Ratio de Solvencia: {solvencia:.2f}")
                print(f"   Interpretación: {'Puede pagar toda su deuda' if solvencia > 1 else 'Activos insuficientes'}")
                if solvencia > 2:
                    print(f"   ✓ Excelente solvencia (>2)")
                elif solvencia > 1:
                    print(f"   ✓ Buena solvencia (>1)")
                else:
                    print(f"   ✗ Problemas de solvencia (<1)")
                
                return solvencia
            else:
                print(f"   ⚠ Datos no disponibles")
                return None
                
        except Exception as e:
            print(f"   ✗ Error calculando Solvencia: {str(e)}")
            return None
    
    # ==================== RATIOS DE EFICIENCIA ====================
    
    def calcular_asset_turnover(self):
        """
        Asset Turnover
        Formula: Ingresos / Activo Total
        """
        try:
            total_revenue = self._obtener_valor(self.income_stmt, 'Total Revenue')
            total_assets = self._obtener_valor(self.balance_sheet, 'Total Assets')
            
            print(f"\n🔄 Asset Turnover (Rotación de Activos)")
            print(f"   Formula: Ingresos / Activo Total")
            
            if total_revenue and total_assets:
                asset_turnover = total_revenue / total_assets
                print(f"   Asset Turnover: {asset_turnover:.2f}x")
                print(f"   Interpretación: Genera ${asset_turnover:.2f} en ventas por cada $1 de activos")
                if asset_turnover > 1:
                    print(f"   ✓ Buena rotación de activos")
                else:
                    print(f"   ⚠ Baja rotación - Activos intensivos")
                
                return asset_turnover
            else:
                print(f"   ⚠ Datos no disponibles")
                return None
                
        except Exception as e:
            print(f"   ✗ Error calculando Asset Turnover: {str(e)}")
            return None
    
    def calcular_inventory_turnover(self):
        """
        Inventory Turnover
        Formula: Costo de Ventas / Inventario promedio
        """
        try:
            cogs = self._obtener_valor(self.income_stmt, 'Cost Of Revenue')
            inventory = self._obtener_valor(self.balance_sheet, 'Inventory')
            
            print(f"\n🔄 Inventory Turnover (Rotación de Inventario)")
            print(f"   Formula: Costo de Ventas / Inventario")
            
            if cogs and inventory:
                inv_turnover = cogs / inventory
                days = 365 / inv_turnover
                print(f"   Inventory Turnover: {inv_turnover:.2f}x al año")
                print(f"   Días de inventario: {days:.0f} días")
                print(f"   Interpretación: Vende su inventario {inv_turnover:.2f} veces al año")
                
                return {'turnover': inv_turnover, 'days': days}
            else:
                print(f"   ⚠ Datos no disponibles (puede no tener inventario)")
                return None
                
        except Exception as e:
            print(f"   ✗ Error calculando Inventory Turnover: {str(e)}")
            return None
    
    def calcular_ciclos_operativos(self):
        """
        Ciclos Operativos: DSI, DSO, DPO, Cash Conversion Cycle
        """
        try:
            print(f"\n🔄 Ciclos Operativos")
            
            # Obtener datos
            revenue = self._obtener_valor(self.income_stmt, 'Total Revenue')
            cogs = self._obtener_valor(self.income_stmt, 'Cost Of Revenue')
            inventory = self._obtener_valor(self.balance_sheet, 'Inventory')
            receivables = self._obtener_valor(self.balance_sheet, 'Accounts Receivable')
            payables = self._obtener_valor(self.balance_sheet, 'Accounts Payable')
            
            resultados = {}
            
            # DSI - Days Sales in Inventory
            if cogs and inventory:
                dsi = (inventory / cogs) * 365
                print(f"\n   DSI (Days Sales in Inventory): {dsi:.0f} días")
                print(f"   Formula: (Inventario / Costo de Ventas) × 365")
                print(f"   Interpretación: Tarda {dsi:.0f} días en vender su inventario")
                resultados['DSI'] = dsi
            
            # DSO - Days Sales Outstanding
            if revenue and receivables:
                dso = (receivables / revenue) * 365
                print(f"\n   DSO (Days Sales Outstanding): {dso:.0f} días")
                print(f"   Formula: (Cuentas por Cobrar / Ventas) × 365")
                print(f"   Interpretación: Tarda {dso:.0f} días en cobrar sus ventas")
                resultados['DSO'] = dso
            
            # DPO - Days Payable Outstanding
            if cogs and payables:
                dpo = (payables / cogs) * 365
                print(f"\n   DPO (Days Payable Outstanding): {dpo:.0f} días")
                print(f"   Formula: (Cuentas por Pagar / Costo de Ventas) × 365")
                print(f"   Interpretación: Tarda {dpo:.0f} días en pagar a proveedores")
                resultados['DPO'] = dpo
            
            # Cash Conversion Cycle
            if all(k in resultados for k in ['DSI', 'DSO', 'DPO']):
                ccc = resultados['DSI'] + resultados['DSO'] - resultados['DPO']
                print(f"\n   Cash Conversion Cycle: {ccc:.0f} días")
                print(f"   Formula: DSI + DSO - DPO")
                print(f"   Interpretación: Tarda {ccc:.0f} días en convertir inversión en efectivo")
                if ccc < 30:
                    print(f"   ✓ Excelente ciclo de conversión (<30 días)")
                elif ccc < 60:
                    print(f"   ✓ Buen ciclo de conversión (<60 días)")
                else:
                    print(f"   ⚠ Ciclo de conversión lento (>60 días)")
                resultados['CCC'] = ccc
            
            return resultados if resultados else None
            
        except Exception as e:
            print(f"   ✗ Error calculando ciclos: {str(e)}")
            return None
    
    # ==================== OTROS RATIOS IMPORTANTES ====================
    
    def calcular_interest_coverage(self):
        """
        Interest Coverage Ratio
        Formula: EBIT / Gastos por Intereses
        """
        try:
            ebit = self._obtener_valor(self.income_stmt, 'EBIT')
            interest_expense = self._obtener_valor(self.income_stmt, 'Interest Expense')
            
            print(f"\n🛡️ Interest Coverage Ratio")
            print(f"   Formula: EBIT / Gastos por Intereses")
            
            if ebit and interest_expense and interest_expense != 0:
                # Interest expense suele ser negativo, tomamos valor absoluto
                coverage = ebit / abs(interest_expense)
                print(f"   Interest Coverage: {coverage:.2f}x")
                print(f"   Interpretación: Ganancias cubren {coverage:.2f}x los intereses")
                if coverage > 5:
                    print(f"   ✓ Excelente cobertura (>5x)")
                elif coverage > 2.5:
                    print(f"   ✓ Buena cobertura (>2.5x)")
                elif coverage > 1.5:
                    print(f"   ⚠ Cobertura ajustada (1.5-2.5x)")
                else:
                    print(f"   ✗ Cobertura insuficiente (<1.5x)")
                
                return coverage
            else:
                print(f"   ⚠ Datos no disponibles o sin deuda con intereses")
                return None
                
        except Exception as e:
            print(f"   ✗ Error calculando Interest Coverage: {str(e)}")
            return None
    
    def calcular_peg_ratio(self):
        """
        PEG Ratio
        Formula: P/E Ratio / Tasa de crecimiento de ganancias
        """
        try:
            pe = self.info.get('trailingPE', None)
            peg = self.info.get('pegRatio', None)
            
            print(f"\n📊 PEG Ratio")
            print(f"   Formula: P/E Ratio / Tasa de crecimiento de ganancias")
            
            if peg:
                print(f"   PEG: {peg:.2f}")
                print(f"   Interpretación: Ajusta el P/E por crecimiento esperado")
                if peg < 1:
                    print(f"   ✓ PEG < 1 - Potencialmente subvalorada")
                elif peg < 2:
                    print(f"   ✓ PEG razonable (1-2)")
                else:
                    print(f"   ⚠ PEG > 2 - Potencialmente sobrevalorada")
                
                return peg
            else:
                print(f"   ⚠ PEG no disponible")
                return None
                
        except Exception as e:
            print(f"   ✗ Error calculando PEG: {str(e)}")
            return None
    
    def calcular_beta(self):
        """
        Beta - Volatilidad vs mercado
        """
        try:
            beta = self.info.get('beta', None)
            
            print(f"\n📉 Beta (Volatilidad)")
            if beta:
                print(f"   Beta: {beta:.2f}")
                print(f"   Interpretación:")
                if beta < 0.8:
                    print(f"   ✓ Beta < 0.8 - Menos volátil que el mercado (defensiva)")
                elif beta <= 1.2:
                    print(f"   ✓ Beta ≈ 1 - Volatilidad similar al mercado")
                else:
                    print(f"   ⚠ Beta > 1.2 - Más volátil que el mercado (agresiva)")
                
                return beta
            else:
                print(f"   ⚠ Beta no disponible")
                return None
                
        except Exception as e:
            print(f"   ✗ Error calculando Beta: {str(e)}")
            return None
    
    # ==================== ANÁLISIS COMPLETO ====================
    
    def analisis_completo(self):
        """Ejecuta un análisis completo de todos los ratios"""
        print(f"\n{'#'*60}")
        print(f"# ANÁLISIS FINANCIERO COMPLETO: {self.ticker}")
        print(f"# {self.info.get('longName', 'N/A')}")
        print(f"# Precio actual: ${self.current_price:.2f}")
        print(f"# Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'#'*60}")
        
        print(f"\n{'='*60}")
        print(f"SECCIÓN 1: RATIOS DE VALORACIÓN")
        print(f"{'='*60}")
        self.calcular_pe_ratio()
        self.calcular_pb_ratio()
        self.calcular_ps_ratio()
        self.calcular_dividendo()
        self.calcular_ev_ebitda()
        self.calcular_peg_ratio()
        
        print(f"\n{'='*60}")
        print(f"SECCIÓN 2: RATIOS DE RENTABILIDAD")
        print(f"{'='*60}")
        self.calcular_roa()
        self.calcular_roe()
        self.calcular_margenes()
        
        print(f"\n{'='*60}")
        print(f"SECCIÓN 3: RATIOS DE LIQUIDEZ Y SOLVENCIA")
        print(f"{'='*60}")
        self.calcular_current_ratio()
        self.calcular_quick_ratio()
        self.calcular_debt_to_equity()
        self.calcular_solvencia()
        self.calcular_interest_coverage()
        
        print(f"\n{'='*60}")
        print(f"SECCIÓN 4: RATIOS DE EFICIENCIA")
        print(f"{'='*60}")
        self.calcular_asset_turnover()
        self.calcular_inventory_turnover()
        self.calcular_ciclos_operativos()
        
        print(f"\n{'='*60}")
        print(f"SECCIÓN 5: RIESGO")
        print(f"{'='*60}")
        self.calcular_beta()
        
        print(f"\n{'='*60}")
        print(f"ANÁLISIS COMPLETADO")
        print(f"{'='*60}\n")
    
    def resumen_ejecutivo(self):
        """Genera un resumen ejecutivo del análisis"""
        print(f"\n{'*'*60}")
        print(f"RESUMEN EJECUTIVO: {self.ticker}")
        print(f"{'*'*60}")
        
        # Valoración
        pe = self.info.get('trailingPE', 0)
        pb = self.info.get('priceToBook', 0)
        
        print(f"\n🎯 VALORACIÓN:")
        if pe and pe < 15:
            print(f"   ✓ P/E bajo ({pe:.2f}) - Potencialmente atractiva")
        elif pe and pe > 30:
            print(f"   ⚠ P/E alto ({pe:.2f}) - Valoración exigente")
        
        # Rentabilidad
        roe = self.info.get('returnOnEquity', 0)
        profit_margin = self.info.get('profitMargins', 0)
        
        print(f"\n💰 RENTABILIDAD:")
        if roe and roe > 0.15:
            print(f"   ✓ ROE excelente ({roe*100:.1f}%)")
        if profit_margin and profit_margin > 0.10:
            print(f"   ✓ Margen neto sólido ({profit_margin*100:.1f}%)")
        
        # Salud Financiera
        current_ratio = self.info.get('currentRatio', 0)
        debt_to_equity = self.info.get('debtToEquity', 0)
        
        print(f"\n🏥 SALUD FINANCIERA:")
        if current_ratio and current_ratio > 1.5:
            print(f"   ✓ Buena liquidez ({current_ratio:.2f})")
        if debt_to_equity:
            d_e = debt_to_equity / 100
            if d_e < 0.5:
                print(f"   ✓ Bajo endeudamiento ({d_e:.2f})")
            elif d_e > 2:
                print(f"   ⚠ Alto endeudamiento ({d_e:.2f})")
        
        print(f"\n{'*'*60}\n")


def analizar_multiples_empresas(tickers):
    """
    Analiza múltiples empresas
    
    Args:
        tickers (list): Lista de símbolos ticker
    """
    resultados = {}
    
    for ticker in tickers:
        try:
            analizador = AnalizadorFinanciero(ticker)
            analizador.analisis_completo()
            analizador.resumen_ejecutivo()
            resultados[ticker] = analizador
        except Exception as e:
            print(f"\n✗ Error analizando {ticker}: {str(e)}\n")
    
    return resultados


def crear_tabla_comparativa(tickers):
    """
    Crea una tabla comparativa de múltiples empresas
    
    Args:
        tickers (list): Lista de símbolos ticker
    """
    print(f"\n{'='*80}")
    print(f"TABLA COMPARATIVA")
    print(f"{'='*80}\n")
    
    datos = []
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            
            datos.append({
                'Ticker': ticker,
                'Empresa': info.get('shortName', 'N/A')[:20],
                'Precio': f"${info.get('currentPrice', 0):.2f}",
                'P/E': f"{info.get('trailingPE', 0):.2f}" if info.get('trailingPE') else 'N/A',
                'P/B': f"{info.get('priceToBook', 0):.2f}" if info.get('priceToBook') else 'N/A',
                'ROE %': f"{info.get('returnOnEquity', 0)*100:.1f}" if info.get('returnOnEquity') else 'N/A',
                'Deuda/Cap': f"{info.get('debtToEquity', 0)/100:.2f}" if info.get('debtToEquity') else 'N/A',
                'Div %': f"{info.get('dividendYield', 0)*100:.2f}" if info.get('dividendYield') else 'N/A'
            })
        except:
            continue
    
    if datos:
        df = pd.DataFrame(datos)
        print(df.to_string(index=False))
        print(f"\n{'='*80}\n")
        return df
    else:
        print("No se pudieron obtener datos\n")
        return None


# ==================== MAIN ====================

if __name__ == "__main__":
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║       ANÁLISIS FINANCIERO CON YFINANCE                      ║
    ║       Script completo de ratios financieros                  ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Ejemplos de uso:
    
    # 1. Analizar una sola empresa
    print("\n" + "="*60)
    print("EJEMPLO 1: Análisis de una empresa")
    print("="*60)
    
    ticker_ejemplo = "AAPL"
    analizador = AnalizadorFinanciero(ticker_ejemplo)
    analizador.analisis_completo()
    analizador.resumen_ejecutivo()
    
    # 2. Analizar múltiples empresas
    print("\n" + "="*60)
    print("EJEMPLO 2: Comparación de empresas tecnológicas")
    print("="*60)
    
    tickers_tech = ["AAPL", "MSFT", "GOOGL"]
    crear_tabla_comparativa(tickers_tech)
    
    # 3. Análisis detallado de múltiples empresas
    # Descomenta las siguientes líneas para análisis completo de múltiples empresas:
    # print("\n" + "="*60)
    # print("EJEMPLO 3: Análisis completo de múltiples empresas")
    # print("="*60)
    # analizar_multiples_empresas(["AAPL", "MSFT"])
    
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                 ANÁLISIS COMPLETADO                          ║
    ║                                                              ║
    ║  Para usar este script con tus propias empresas:            ║
    ║  1. Modifica la variable 'ticker_ejemplo' con tu ticker     ║
    ║  2. O usa: analizar_multiples_empresas(['TICK1', 'TICK2'])  ║
    ║  3. O crea tabla comparativa: crear_tabla_comparativa([...])║
    ╚══════════════════════════════════════════════════════════════╝
    """)
