

// ==================== ALUMNO ====================
export interface Alumno {
  id: string;
  nombre: string;
  apellidos: string;
  dni: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  curso: string;
  grupo: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  resultadosAprendizaje: ResultadoAprendizajeAlumno[];
  observaciones?: string;
}
export interface ResultadoAprendizajeAlumno {
  raId: string;
  raNumero: number;
  raNombre: string;
  trimestre1: number;
  trimestre2: number;
  trimestre3: number;
  promedioGeneral: number;
  estado: EstadoResultado;
  ultimaEvaluacion: string;
}
export enum EstadoResultado {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  SUSPENDIDO = 'suspendido',
  EN_CURSO = 'en_curso'
}
// ==================== RESULTADOS DE APRENDIZAJE ====================
export interface ResultadoAprendizaje {
  id: string;
  numero: number;
  nombre: string;
  descripcion: string;
  codigo: string;
  trimestre: number;
  ponderacion: number;
  activo: boolean;
  criterios: Criterio[];
  fechaCreacion: string;
  fechaActualizacion: string;
}
// ==================== CRITERIOS ====================
export interface Criterio {
  id: string;
  raId: string;
  raNumero: number;
  codigo: string;
  descripcion: string;
  descripcionDetallada: string;
  instrumentoId: string;
  ponderacion: number;
  trimestre: number;
  activo: boolean;
  notas: NotaAlumno[];
  fechaCreacion: string;
  fechaActualizacion: string;
}
export interface NotaAlumno {
  id: string;
  alumnoId: string;
  criterioId: string;
  valor: number;
  fechaEvaluacion: string;
  observaciones?: string;
  instrumentoId: string;
  trimestre: number;
}
// ==================== INSTRUMENTOS ====================
export interface Instrumento {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: TipoInstrumento;
  ponderacion: number;
  activo: boolean;
  criterios: Criterio[];
  fechaCreacion: string;
  fechaActualizacion: string;
}
export enum TipoInstrumento {
  EXAMEN = 'examen',
  PRACTICA = 'practica',
  PROYECTO = 'proyecto',
  OBSERVACION = 'observacion',
  EXPOSICION = 'exposicion',
  PORTAFOLIO = 'portafolio',
  TRABAJO_GRUPAL = 'trabajo_grupal',
  PARTICIPACION = 'participacion'
}
// ==================== EVALUACIÓN (New Definition) ====================
export interface Evaluacion {
  id: string; // Composite key like `${studentId}-${raId}-${criterionId}`
  alumnoId: string;
  criterioId: string;
  resultadoAprendizaje: string;
  instrumento: string; // Not in the new design, but needed for compatibility
  trimestre: number;
  nota: number | null;
  fechaEvaluacion: Date;
  ultimaModificacion: Date;
  modificado?: boolean; // UI state flag
}
export interface ConfiguracionEvaluacion {
  autoSave: boolean;
  intervaloAutoSave: number; // en segundos
  validacionesActivas: boolean;
  redondeoAutomatico: boolean;
  decimalesPermitidos: number;
  notaMinima: number;
  notaMaxima: number;
  notificarCambios: boolean;
}
// ==================== PONDERACIONES ====================
export interface Ponderacion {
  id: string;
  raNumero: number;
  trimestre: number;
  porcentaje: number;
  cursoAcademico: string;
  activa: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Keep original types and export them for compatibility
export type GradeValue = number | null;

// FIX: Type 'Student' recursively references itself as a base type.
// The original file had a circular dependency and was missing the Student interface definition.
export interface Student {
  id: string;
  nre: string;
  expediente: string;
  apellido1: string;
  apellido2: string;
  nombre: string;
  grupo: string;
  subgrupo: string;
  fechaNacimiento: string;
  telefono: string;
  emailPersonal: string;
  emailOficial: string;
  fotoUrl: string;
}

export interface PracticeGroup {
  id: string;
  name: string;
  color: string;
  studentIds: string[];
}

export interface ServiceRole {
    id: string;
    name: string;
    color: string;
    type: 'leader' | 'secondary';
}

export interface StudentRoleAssignment {
    studentId: string;
    roleId: string;
}

export interface Elaboration {
    id: string;
    name: string;
    responsibleGroupId: string;
}

export interface Service {
    id: string;
    name: string;
    date: string;
    trimester: 't1' | 't2' | 't3';
    isLocked: boolean;
    assignedGroups: {
        comedor: string[];
        takeaway: string[];
    };
    elaborations: {
        comedor: Elaboration[];
        takeaway: Elaboration[];
    };
    studentRoles: StudentRoleAssignment[];
}

export interface PreServiceBehaviorScores {
    [itemId: string]: number | null;
}

export interface PreServiceIndividualEvaluation {
    attendance: boolean;
    hasFichas: boolean;
    hasUniforme: boolean;
    hasMaterial: boolean;
    behaviorScores: PreServiceBehaviorScores;
    observations: string;
}

export interface PreServiceDayEvaluation {
    name: string;
    groupObservations: { [groupId: string]: string };
    individualEvaluations: { [studentId: string]: PreServiceIndividualEvaluation };
}

export interface ServiceDayIndividualScores {
    attendance: boolean;
    scores: (number | null)[];
    observations: string;
}

export interface ServiceDayGroupScores {
    scores: (number | null)[];
    observations: string;
}

export interface ServiceEvaluation {
    id: string;
    serviceId: string;
    preService: { [date: string]: PreServiceDayEvaluation };
    serviceDay: {
        groupScores: { [groupId: string]: ServiceDayGroupScores };
        individualScores: { [studentId: string]: ServiceDayIndividualScores };
    };
}

export interface EntryExitRecord {
    id: string;
    studentId: string;
    date: string;
    type: 'Salida Anticipada' | 'Llegada Tarde';
    reason: string;
}

export interface PrincipalGrade {
    servicios: GradeValue;
    practico: GradeValue;
    teorico1: GradeValue;
    teorico2: GradeValue;
}

export interface PrincipalGrades {
  [studentId: string]: {
    t1: PrincipalGrade;
    t2: PrincipalGrade;
    t3: PrincipalGrade;
    recFinal: GradeValue;
  };
}

export interface OtherModuleGrade {
    t1: GradeValue;
    t2: GradeValue;
    t3: GradeValue;
    rec: GradeValue;
}

export interface OtherGrades {
    [studentId: string]: {
        [moduleName: string]: OtherModuleGrade;
    };
}

export type ExamPeriod = 't1' | 't2' | 't3' | 'rec';

export interface PracticalExamCriterionScore {
    score: number | null;
    notes: string;
}

export interface PracticalExamEvaluation {
    id: string;
    studentId: string;
    examPeriod: ExamPeriod;
    scores: {
        [raId: string]: {
            [criterionId: string]: PracticalExamCriterionScore;
        };
    };
    finalScore?: number;
}

export interface StudentAcademicPeriodGrades {
    manualGrades: { [instrumentKey: string]: GradeValue };
}

export interface StudentAcademicGrades {
    [periodKey: string]: StudentAcademicPeriodGrades;
}

export interface AcademicGrades {
    [studentId: string]: StudentAcademicGrades;
}

export interface CourseModuleGrades {
    t1: GradeValue;
    t2: GradeValue;
    t3: GradeValue;
    rec: GradeValue;
}

export interface StudentCourseGrades {
    [module: string]: Partial<CourseModuleGrades>;
}

export interface CourseGrades {
    [studentId: string]: StudentCourseGrades;
}

export interface TeacherData {
    name: string;
    email: string;
    logo: string | null;
}

export interface InstituteData {
    name: string;
    address: string;
    cif: string;
    logo: string | null;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

export interface StudentCalculatedGrades {
    serviceAverages: {
        t1: number | null;
        t2: number | null;
        t3: number | null;
    };
    practicalExams: {
        t1: number | null;
        t2: number | null;
        t3: number | null;
        rec: number | null;
    };
}

export interface ReportViewModel {
    service: Service;
    evaluation: ServiceEvaluation;
    students: Student[];
    practiceGroups: PracticeGroup[];
    serviceRoles: ServiceRole[];
    teacherData: TeacherData;
    instituteData: InstituteData;
    participatingStudents: Student[];
    groupedStudentsInService: {
        group: PracticeGroup;
        students: Student[];
    }[];
    entryExitRecords: EntryExitRecord[];
}

export interface TrimesterDateRange {
    start: string;
    end: string;
}

export interface TrimesterDates {
    t1: TrimesterDateRange;
    t2: TrimesterDateRange;
    t3: TrimesterDateRange;
}

export interface TimelineEvent {
  date: Date;
  type: 'incidencia' | 'observacion';
  title: string;
  content: string;
  serviceName?: string;
}

export interface RADashboardSummary {
  totalStudents: number;
  overallAverage: number | null;
  passingStudents: number;
  atRiskStudents: number;
}

export interface RAProgressData {
  id: string;
  name: string;
  average: number | null;
  weight: number;
}

export interface HighlightedStudent {
    id: string;
    name: string;
    score: number;
    fotoUrl: string;
}

export interface EstadoEvaluacion {
  total: number;
  completadas: number;
  pendientes: number;
  porcentajeCompletado: number;
  promedioGeneral: number;
}