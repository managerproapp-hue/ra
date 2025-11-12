import { useCallback, useMemo } from 'react';
import { Evaluacion } from '../types';
import { calculos } from '../utils/calculos';
import { PRACTICAL_EXAM_RUBRIC } from '../data/constants';

export const useCalculosEvaluacion = (evaluaciones: Evaluacion[]) => {
  
  const calcularNotaRA = useCallback((alumnoId: string, raId: string): number | null => {
    const criteriosRA = evaluaciones.filter(e =>
      e.alumnoId === alumnoId && e.resultadoAprendizaje === raId
    );

    const notasValidas = criteriosRA
      .map(e => e.nota)
      .filter(nota => nota !== null) as number[];

    if (notasValidas.length === 0) {
      return null;
    }

    // Simple average of criteria for now. Ponderations can be added later.
    const average = calculos.promedio(notasValidas);
    return calculos.redondear(average, 2);
  }, [evaluaciones]);

  const calcularPromedioGeneral = useCallback((alumnoId: string): number | null => {
    const notasRA = PRACTICAL_EXAM_RUBRIC.map(ra => {
      const nota = calcularNotaRA(alumnoId, ra.id);
      return { valor: nota ?? 0, peso: ra.weight };
    }).filter(item => item.valor > 0); // Only consider RAs that have been scored

    if (notasRA.length === 0) {
      return null;
    }

    const promedioPonderado = calculos.promedioPonderado(notasRA);
    return calculos.redondear(promedioPonderado, 2);
  }, [calcularNotaRA]);

  return {
    calcularNotaRA,
    calcularPromedioGeneral,
  };
};
