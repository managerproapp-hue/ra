
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Student, PracticeGroup, Service, ServiceEvaluation, ServiceRole, EntryExitRecord, 
    AcademicGrades, CourseGrades, PracticalExamEvaluation, TeacherData, InstituteData, Toast, 
    StudentCalculatedGrades, Trimester, TrimesterDates
} from '../types';
import { parseFile } from '../services/csvParser';
import { mockStudents } from '../data/mockStudents'; // For initial data
import { calculateStudentPeriodAverages } from '../services/gradeCalculator';

// --- Custom Hook for Local Storage ---
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// --- Context Definition ---
interface AppContextType {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  practiceGroups: PracticeGroup[];
  setPracticeGroups: React.Dispatch<React.SetStateAction<PracticeGroup[]>>;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  serviceEvaluations: ServiceEvaluation[];
  setServiceEvaluations: React.Dispatch<React.SetStateAction<ServiceEvaluation[]>>;
  serviceRoles: ServiceRole[];
  setServiceRoles: React.Dispatch<React.SetStateAction<ServiceRole[]>>;
  entryExitRecords: EntryExitRecord[];
  setEntryExitRecords: React.Dispatch<React.SetStateAction<EntryExitRecord[]>>;
  academicGrades: AcademicGrades;
  setAcademicGrades: React.Dispatch<React.SetStateAction<AcademicGrades>>;
  courseGrades: CourseGrades;
  setCourseGrades: React.Dispatch<React.SetStateAction<CourseGrades>>;
  practicalExamEvaluations: PracticalExamEvaluation[];
  setPracticalExamEvaluations: React.Dispatch<React.SetStateAction<PracticalExamEvaluation[]>>;
  teacherData: TeacherData;
  setTeacherData: React.Dispatch<React.SetStateAction<TeacherData>>;
  instituteData: InstituteData;
  setInstituteData: React.Dispatch<React.SetStateAction<InstituteData>>;
  trimesterDates: TrimesterDates;
  setTrimesterDates: React.Dispatch<React.SetStateAction<TrimesterDates>>;

  calculatedStudentGrades: Record<string, StudentCalculatedGrades>;
  
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  
  handleFileUpload: (file: File) => Promise<void>;
  handleSaveEntryExitRecord: (record: Omit<EntryExitRecord, 'id' | 'studentId'>, studentIds: string[]) => void;
  handleCreateService: (trimester: Trimester) => string;
  handleSaveServiceAndEvaluation: (service: Service, evaluation: ServiceEvaluation) => void;
  handleDeleteService: (serviceId: string) => void;
  onDeleteRole: (roleId: string) => void;
  handleUpdateStudent: (updatedStudent: Student) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Provider Component ---
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useLocalStorage<Student[]>('students', []);
  const [practiceGroups, setPracticeGroups] = useLocalStorage<PracticeGroup[]>('practiceGroups', []);
  const [services, setServices] = useLocalStorage<Service[]>('services', []);
  const [serviceEvaluations, setServiceEvaluations] = useLocalStorage<ServiceEvaluation[]>('serviceEvaluations', []);
  const [serviceRoles, setServiceRoles] = useLocalStorage<ServiceRole[]>('serviceRoles', []);
  const [entryExitRecords, setEntryExitRecords] = useLocalStorage<EntryExitRecord[]>('entryExitRecords', []);
  const [academicGrades, setAcademicGrades] = useLocalStorage<AcademicGrades>('academicGrades', {});
  const [courseGrades, setCourseGrades] = useLocalStorage<CourseGrades>('courseGrades', {});
  const [practicalExamEvaluations, setPracticalExamEvaluations] = useLocalStorage<PracticalExamEvaluation[]>('practicalExamEvaluations', []);
  const [teacherData, setTeacherData] = useLocalStorage<TeacherData>('teacher-app-data', { name: '', email: '', logo: null });
  const [instituteData, setInstituteData] = useLocalStorage<InstituteData>('institute-app-data', { name: '', address: '', cif: '', logo: null });
  const [trimesterDates, setTrimesterDates] = useLocalStorage<TrimesterDates>('trimester-dates', {
    t1: { start: '', end: '' }, t2: { start: '', end: '' }, t3: { start: '', end: '' }
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const calculatedStudentGrades = useMemo(() => {
    const result: Record<string, StudentCalculatedGrades> = {};
    students.forEach(student => {
      // Logic for service averages
      const gradesByTrimester: { [key in Trimester]: number[] } = { t1: [], t2: [], t3: [] };
      services.forEach(service => {
        const evalData = serviceEvaluations.find(e => e.serviceId === service.id)?.serviceDay.individualScores[student.id];
        if (evalData?.attendance) {
          const totalScore = (evalData.scores || []).reduce((sum, score) => sum + (score || 0), 0);
          gradesByTrimester[service.trimester].push(totalScore);
        }
      });

      // Logic for practical exam averages
      const practicalsByTrimester: { [key: string]: number[] } = { t1: [], t2: [], t3: [], rec: [] };
      practicalExamEvaluations.forEach(e => {
          if (e.studentId === student.id && e.finalScore !== undefined) {
              practicalsByTrimester[e.examPeriod].push(e.finalScore);
          }
      });

      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a,b)=> a+b, 0) / arr.length : null;

      result[student.id] = {
        serviceAverages: {
          t1: avg(gradesByTrimester.t1),
          t2: avg(gradesByTrimester.t2),
          t3: avg(gradesByTrimester.t3),
        },
        practicalExams: {
          t1: avg(practicalsByTrimester.t1),
          t2: avg(practicalsByTrimester.t2),
          t3: avg(practicalsByTrimester.t3),
          rec: avg(practicalsByTrimester.rec),
        }
      };
    });
    return result;
  }, [students, services, serviceEvaluations, practicalExamEvaluations]);
  
  const handleFileUpload = useCallback(async (file: File) => {
    const { data, error } = await parseFile(file);
    if (error) {
      addToast(error, 'error');
    } else {
      setStudents(data.sort((a,b) => a.apellido1.localeCompare(b.apellido1)));
      addToast(`${data.length} alumnos importados con éxito.`, 'success');
    }
  }, [addToast, setStudents]);

  const handleSaveEntryExitRecord = (record: Omit<EntryExitRecord, 'id' | 'studentId'>, studentIds: string[]) => {
    const newRecords: EntryExitRecord[] = studentIds.map(studentId => ({
      ...record,
      studentId,
      id: `rec-${studentId}-${Date.now()}`
    }));
    setEntryExitRecords(prev => [...prev, ...newRecords]);
    addToast('Registro guardado con éxito.', 'success');
  };

  const handleCreateService = (trimester: Trimester): string => {
    const newServiceId = `service-${Date.now()}`;
    const newService: Service = {
      id: newServiceId,
      name: `Nuevo Servicio ${new Date().toLocaleDateString('es-ES')}`,
      date: new Date().toISOString().split('T')[0],
      trimester: trimester,
      isLocked: false,
      assignedGroups: { comedor: [], takeaway: [] },
      elaborations: { comedor: [], takeaway: [] },
      studentRoles: [],
    };
    const newEvaluation: ServiceEvaluation = {
      id: `eval-${newServiceId}`,
      serviceId: newServiceId,
      preService: {},
      serviceDay: { groupScores: {}, individualScores: {} },
    };
    setServices(prev => [...prev, newService]);
    setServiceEvaluations(prev => [...prev, newEvaluation]);
    addToast('Nuevo servicio creado.', 'success');
    return newServiceId;
  };

  const handleSaveServiceAndEvaluation = (service: Service, evaluation: ServiceEvaluation) => {
    setServices(prev => prev.map(s => s.id === service.id ? service : s));
    setServiceEvaluations(prev => prev.map(e => e.serviceId === service.id ? evaluation : e));
    addToast(`Servicio "${service.name}" guardado.`, 'success');
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    setServiceEvaluations(prev => prev.filter(e => e.serviceId !== serviceId));
    addToast('Servicio eliminado.', 'info');
  };
  
  const onDeleteRole = (roleId: string) => {
    setServiceRoles(prev => prev.filter(r => r.id !== roleId));
    // Also remove assignments of this role in services
    setServices(prev => prev.map(s => ({
      ...s,
      studentRoles: s.studentRoles.filter(sr => sr.roleId !== roleId)
    })));
    addToast('Rol eliminado y desasignado de todos los servicios.', 'info');
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    addToast('Ficha del alumno actualizada.', 'success');
  };

  const value = {
    students, setStudents, practiceGroups, setPracticeGroups, services, setServices,
    serviceEvaluations, setServiceEvaluations, serviceRoles, setServiceRoles,
    entryExitRecords, setEntryExitRecords, academicGrades, setAcademicGrades,
    courseGrades, setCourseGrades, practicalExamEvaluations, setPracticalExamEvaluations,
    teacherData, setTeacherData, instituteData, setInstituteData,
    calculatedStudentGrades, toasts, addToast, handleFileUpload, handleSaveEntryExitRecord,
    handleCreateService, handleSaveServiceAndEvaluation, handleDeleteService, onDeleteRole,
    handleUpdateStudent, trimesterDates, setTrimesterDates
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- Custom Hook for consuming the context ---
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
