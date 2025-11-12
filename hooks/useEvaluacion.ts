import { useState, useEffect, useCallback, useRef } from 'react';
import { Evaluacion } from '../types';
import { useAppContext } from '../context/AppContext';
import { PRACTICAL_EXAM_RUBRIC } from '../data/constants';

export const useEvaluacion = () => {
  const { students, practicalExamEvaluations, setPracticalExamEvaluations, addToast } = useAppContext();
  
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hayCambiosPendientes, setHayCambiosPendientes] = useState(false);
  const initialDataLoaded = useRef(false);

  // Function to transform source data into the unified 'Evaluacion' model
  const transformDataToEvaluaciones = useCallback(() => {
    const transformed: Evaluacion[] = [];
    students.forEach(student => {
      // For now, we only handle one type of exam ('t1'). This can be expanded.
      const examPeriod = 't1'; 
      const practicalExam = practicalExamEvaluations.find(
        e => e.studentId === student.id && e.examPeriod === examPeriod
      );

      PRACTICAL_EXAM_RUBRIC.forEach(ra => {
        ra.criteria.forEach(criterion => {
          const scoreData = practicalExam?.scores?.[ra.id]?.[criterion.id];
          transformed.push({
            id: `${student.id}-${ra.id}-${criterion.id}`,
            alumnoId: student.id,
            criterioId: criterion.id,
            resultadoAprendizaje: ra.id,
            instrumento: 'Examen Práctico', // Hardcoded for now
            trimestre: 1, // Hardcoded for now
            nota: scoreData?.score ?? null,
            fechaEvaluacion: new Date(),
            ultimaModificacion: new Date(),
          });
        });
      });
    });
    return transformed;
  }, [students, practicalExamEvaluations]);

  useEffect(() => {
    if (students.length > 0 && !initialDataLoaded.current) {
      setLoading(true);
      try {
        const initialEvaluaciones = transformDataToEvaluaciones();
        setEvaluaciones(initialEvaluaciones);
        initialDataLoaded.current = true;
      } catch (e) {
        setError("Error al procesar los datos de evaluación.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  }, [students, transformDataToEvaluaciones]);

  const actualizarEvaluacion = useCallback((evaluacionId: string, cambios: Partial<Evaluacion>) => {
    setEvaluaciones(prev =>
      prev.map(e =>
        e.id === evaluacionId
          ? { ...e, ...cambios, ultimaModificacion: new Date(), modificado: true }
          : e
      )
    );
    setHayCambiosPendientes(true);
  }, []);

  const guardarEvaluaciones = useCallback(() => {
    const evaluacionesModificadas = evaluaciones.filter(e => e.modificado);
    if (evaluacionesModificadas.length === 0) return;

    // This is where we would typically send data to an API.
    // For now, we update the main state in AppContext.
    const newPracticalExamEvals = [...practicalExamEvaluations];

    evaluacionesModificadas.forEach(mod => {
      // Find or create the corresponding PracticalExamEvaluation
      let examEval = newPracticalExamEvals.find(
        e => e.studentId === mod.alumnoId && e.examPeriod === 't1' // Hardcoded for now
      );

      if (!examEval) {
        examEval = {
          id: `${mod.alumnoId}-t1`,
          studentId: mod.alumnoId,
          examPeriod: 't1',
          scores: {},
        };
        newPracticalExamEvals.push(examEval);
      }

      // Update the score
      if (!examEval.scores[mod.resultadoAprendizaje]) {
        examEval.scores[mod.resultadoAprendizaje] = {};
      }
      if (!examEval.scores[mod.resultadoAprendizaje][mod.criterioId]) {
        examEval.scores[mod.resultadoAprendizaje][mod.criterioId] = { score: null, notes: '' };
      }
      examEval.scores[mod.resultadoAprendizaje][mod.criterioId].score = mod.nota;
    });

    setPracticalExamEvaluations(newPracticalExamEvals);
    
    // Reset modification flags
    setEvaluaciones(prev => prev.map(e => ({ ...e, modificado: false })));
    setHayCambiosPendientes(false);
    addToast('Calificaciones guardadas con éxito.', 'success');

  }, [evaluaciones, practicalExamEvaluations, setPracticalExamEvaluations, addToast]);

  return {
    evaluaciones,
    loading,
    error,
    hayCambiosPendientes,
    actualizarEvaluacion,
    guardarEvaluaciones,
  };
};
