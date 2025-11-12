
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

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

export interface Elaboration {
  id: string;
  name: string;
  responsibleGroupId: string;
}

export interface StudentRoleAssignment {
  studentId: string;
  roleId: string;
}

export type Trimester = 't1' | 't2' | 't3';

export interface Service {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  trimester: Trimester;
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

export interface PreServiceIndividualEvaluation {
  attendance: boolean;
  hasFichas: boolean;
  hasUniforme: boolean;
  hasMaterial: boolean;
  behaviorScores: { [behaviorId: string]: number | null };
  observations: string;
}

export interface PreServiceDayEvaluation {
  name: string;
  groupObservations: { [groupId: string]: string };
  individualEvaluations: { [studentId: string]: PreServiceIndividualEvaluation };
}

export interface ServiceDayGroupScores {
  scores: (number | null)[];
  observations: string;
}

export interface ServiceDayIndividualScores {
  attendance: boolean;
  scores: (number | null)[];
  observations: string;
}

export interface ServiceEvaluation {
  id: string;
  serviceId: string;
  preService: { [date: string]: PreServiceDayEvaluation }; // YYYY-MM-DD
  serviceDay: {
    groupScores: { [groupId: string]: ServiceDayGroupScores };
    individualScores: { [studentId: string]: ServiceDayIndividualScores };
  };
}

export interface ServiceRole {
  id: string;
  name: string;
  color: string;
  type: 'leader' | 'secondary';
}

export interface EntryExitRecord {
  id: string;
  studentId: string;
  date: string; // DD/MM/YYYY
  type: 'Salida Anticipada' | 'Llegada Tarde';
  reason: string;
}

export type GradeValue = number | null;

export interface ManualGrades {
  [instrumentKey: string]: GradeValue;
}

export interface PeriodGrades {
  manualGrades: ManualGrades;
}

export interface StudentAcademicGrades {
  t1?: PeriodGrades;
  t2?: PeriodGrades;
  t3?: PeriodGrades;
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

export type ExamPeriod = 't1' | 't2' | 'rec';

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

export interface TimelineEvent {
    date: Date;
    type: 'incidencia' | 'observacion';
    title: string;
    content: string;
    serviceName?: string;
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
    groupedStudentsInService: { group: PracticeGroup; students: Student[] }[];
    entryExitRecords: EntryExitRecord[];
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

export interface TrimesterDates {
  t1: { start: string; end: string };
  t2: { start: string; end: string };
  t3: { start: string; end: string };
}
