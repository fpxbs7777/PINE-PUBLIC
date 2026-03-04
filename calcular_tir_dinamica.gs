/**
 * Calcula la TIR estimada para cualquier bono u ON ante cambios de precio.
 * @param {number} tirRef TIR de referencia (ej: 0.082 para 8.2%).
 * @param {number} precioRef Precio al que corresponde esa TIR (ej: 1427.60).
 * @param {number} precioAct Precio actual de mercado (IOL).
 * @param {number} duration Duration del activo (ej: 3.85).
 * @param {number} convexity Convexidad del activo (ej: 20.11).
 * @customfunction
 */
function CALCULAR_TIR_DINAMICA(tirRef, precioRef, precioAct, duration, convexity) {
  if (!tirRef || !precioRef || !precioAct || !duration) return "Faltan datos";
  
  // Variación porcentual del precio (dP/P)
  var dP = (precioAct / precioRef) - 1;
  
  // Estimación de la variación de la tasa (dy)
  // Usamos la fórmula de Taylor de segundo orden para mayor precisión:
  // dP/P ≈ -Dur * dy + 0.5 * Conv * dy^2
  // Simplificando para despejar dy (variación de TIR):
  var deltaTir = -dP / duration;
  
  // Ajuste opcional por convexidad (si se provee)
  if (convexity) {
    deltaTir = deltaTir + (0.5 * convexity * Math.pow(deltaTir, 2));
  }
  
  return tirRef + deltaTir;
}
