/**
 * Utilidades para cálculos matemáticos en el sistema de evaluación
 */
export const calculos = {
  /**
   * Redondear número a decimales especificados
   */
  redondear(numero: number, decimales: number = 2): number {
    if (isNaN(numero)) return 0;
    return Math.round(numero * Math.pow(10, decimales)) / Math.pow(10, decimales);
  },
  /**
   * Calcular promedio simple
   */
  promedio(numeros: number[]): number {
    if (numeros.length === 0) return 0;
    const sum = numeros.reduce((sum, num) => sum + num, 0);
    return sum / numeros.length;
  },
  /**
   * Calcular promedio ponderado
   */
  promedioPonderado(valores: Array<{ valor: number; peso: number }>, decimales: number = 2): number {
    if (valores.length === 0) return 0;
    
    const sumaPonderada = valores.reduce((sum, item) => sum + (item.valor * item.peso), 0);
    const sumaPesos = valores.reduce((sum, item) => sum + item.peso, 0);
    
    if (sumaPesos === 0) return 0;
    
    return this.redondear(sumaPonderada / sumaPesos, decimales);
  },
};
