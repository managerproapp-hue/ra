import { 
    CriterioEvaluacion,
    AcademicGrades, 
    StudentCalculatedGrades,
    ResultadoAprendizaje
} from '../types';

/**
 * Obtiene la nota de un alumno para una actividad de evaluación específica.
 * Esta función mapea IDs de actividad a sus correspondientes notas en la estructura de datos.
 */
const getGradeForActivity = (
    activityId: string,
    studentId: string,
    academicGrades: AcademicGrades,
    calculatedGrades: Record<string, StudentCalculatedGrades>
): number | null => {
    const studentAcademic = academicGrades[studentId];
    const studentCalculated = calculatedGrades[studentId];

    // Mapeo de IDs de actividad a sus orígenes de datos de calificación
    const activityGradeMap: Record<string, () => number | null> = {
        'act-1': () => studentAcademic?.t1?.manualGrades?.examen1 ?? null,
        'act-2': () => studentAcademic?.t1?.manualGrades?.examen2 ?? null,
        'act-8': () => studentAcademic?.t2?.manualGrades?.examen1 ?? null,
        'act-9': () => studentAcademic?.t2?.manualGrades?.examen2 ?? null,
        'act-6': () => studentCalculated?.serviceAverages?.t1 ?? null,
        'act-13': () => studentCalculated?.serviceAverages?.t2 ?? null,
        'act-7': () => studentCalculated?.practicalExams?.t1 ?? null,
        'act-14': () => studentCalculated?.practicalExams?.t2 ?? null,
        // Otras actividades (Fichas, Trabajos, P. Diaria) no tienen origen de datos definido aún
    };

    const gradeFn = activityGradeMap[activityId];
    return gradeFn ? gradeFn() : null;
};

/**
 * Calcula la nota final para un criterio de evaluación promediando las notas de sus actividades asociadas.
 */
export const calculateCriterioGrade = (
    criterio: CriterioEvaluacion,
    studentId: string,
    academicGrades: AcademicGrades,
    calculatedGrades: Record<string, StudentCalculatedGrades>
): number | null => {
    if (!criterio.asociaciones || criterio.asociaciones.length === 0) {
        return null;
    }

    const associatedActivities = criterio.asociaciones.flatMap(asoc => asoc.activityIds);
    if (associatedActivities.length === 0) {
        return null;
    }

    const grades = associatedActivities
        .map(actId => getGradeForActivity(actId, studentId, academicGrades, calculatedGrades))
        .filter(g => g !== null) as number[];

    if (grades.length === 0) {
        return null;
    }

    // Promedio simple de todas las actividades vinculadas al criterio
    const sum = grades.reduce((acc, grade) => acc + grade, 0);
    return sum / grades.length;
};

/**
 * Calcula la nota ponderada final para un Resultado de Aprendizaje (RA) basándose en las notas de sus criterios.
 */
export const calculateRAGrade = (
    ra: ResultadoAprendizaje,
    studentId: string,
    criteriosEvaluacion: Record<string, CriterioEvaluacion>,
    academicGrades: AcademicGrades,
    calculatedGrades: Record<string, StudentCalculatedGrades>
): { grade: number | null, ponderacionTotal: number } => {
    let weightedSum = 0;
    let ponderacionTotalEvaluada = 0;

    ra.criteriosEvaluacion.forEach(criterioId => {
        const criterio = criteriosEvaluacion[criterioId];
        if (criterio) {
            const criterioGrade = calculateCriterioGrade(criterio, studentId, academicGrades, calculatedGrades);
            
            if (criterioGrade !== null) {
                // La nota del criterio ya está sobre 10, se multiplica por su peso porcentual
                weightedSum += criterioGrade * (criterio.ponderacion / 100);
                ponderacionTotalEvaluada += criterio.ponderacion;
            }
        }
    });

    if (ponderacionTotalEvaluada === 0) {
        return { grade: null, ponderacionTotal: 0 };
    }

    // Normalizar la nota final sobre 10
    const finalGrade = (weightedSum / (ponderacionTotalEvaluada / 100));
    return { grade: finalGrade, ponderacionTotal: ponderacionTotalEvaluada };
};
