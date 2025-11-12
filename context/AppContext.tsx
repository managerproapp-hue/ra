import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
    Student, PracticeGroup, Service, ServiceEvaluation, ServiceRole, EntryExitRecord, 
    AcademicGrades, CourseGrades, PracticalExamEvaluation, TeacherData, InstituteData, Toast, ToastType, StudentCalculatedGrades, TrimesterDates,
    ResultadoAprendizaje, CriterioEvaluacion, InstrumentoEvaluacion, Profesor, UnidadTrabajo
} from '../types';
import { parseFile } from '../services/csvParser';
import { SERVICE_GRADE_WEIGHTS } from '../data/constants';

import { resultadosAprendizaje as mockRA } from '../data/ra-data';
import { criteriosEvaluacion as mockCriterios } from '../data/criterios-data';
import { instrumentosEvaluacion as mockInstrumentos } from '../data/instrumentos-data';
import { profesores as mockProfesores } from '../data/profesores-data';
import { unidadesTrabajo as mockUTs } from '../data/ut-data';


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

const defaultTrimesterDates: TrimesterDates = {
  t1: { start: '2025-09-01', end: '2025-12-22' },
  t2: { start: '2026-01-08', end: '2026-04-11' },
};


// --- App Context Definition ---
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
    
    // New data for auxiliary components
    resultadosAprendizaje: Record<string, ResultadoAprendizaje>;
    setResultadosAprendizaje: React.Dispatch<React.SetStateAction<Record<string, ResultadoAprendizaje>>>;
    criteriosEvaluacion: Record<string, CriterioEvaluacion>;
    setCriteriosEvaluacion: React.Dispatch<React.SetStateAction<Record<string, CriterioEvaluacion>>>;
    instrumentosEvaluacion: Record<string, InstrumentoEvaluacion>;
    setInstrumentosEvaluacion: React.Dispatch<React.SetStateAction<Record<string, InstrumentoEvaluacion>>>;
    profesores: Profesor[];
    setProfesores: React.Dispatch<React.SetStateAction<Profesor[]>>;
    unidadesTrabajo: Record<string, UnidadTrabajo>;
    setUnidadesTrabajo: React.Dispatch<React.SetStateAction<Record<string, UnidadTrabajo>>>;

    toasts: Toast[];
    addToast: (message: string, type?: ToastType) => void;
    
    handleFileUpload: (file: File) => Promise<void>;
    handleUpdateStudent: (student: Student) => void;

    handleCreateService: (trimester: 't1' | 't2' | 't3') => string;
    handleSaveServiceAndEvaluation: (service: Service, evaluation: ServiceEvaluation) => void;
    handleDeleteService: (serviceId: string) => void;
    onDeleteRole: (roleId: string) => void;
    handleDeleteInstrumento: (instrumentoId: string) => void;
    handleSaveEntryExitRecord: (record: Omit<EntryExitRecord, 'id' | 'studentId'>, studentIds: string[]) => void;
    handleSavePracticalExam: (evaluation: PracticalExamEvaluation) => void;
    
    calculatedStudentGrades: Record<string, StudentCalculatedGrades>;

    // Helper functions
    getRA: (raId: string) => ResultadoAprendizaje | undefined;
    getCriterio: (criterioId: string) => CriterioEvaluacion | undefined;
    getInstrumento: (instrumentoId: string) => InstrumentoEvaluacion | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
    const [trimesterDates, setTrimesterDates] = useLocalStorage<TrimesterDates>('trimester-dates', defaultTrimesterDates);
    
    const [resultadosAprendizaje, setResultadosAprendizaje] = useLocalStorage<Record<string, ResultadoAprendizaje>>('resultadosAprendizaje', mockRA);
    const [criteriosEvaluacion, setCriteriosEvaluacion] = useLocalStorage<Record<string, CriterioEvaluacion>>('criteriosEvaluacion', mockCriterios);
    const [instrumentosEvaluacion, setInstrumentosEvaluacion] = useLocalStorage<Record<string, InstrumentoEvaluacion>>('instrumentosEvaluacion', mockInstrumentos);
    const [profesores, setProfesores] = useLocalStorage<Profesor[]>('profesores', mockProfesores);
    const [unidadesTrabajo, setUnidadesTrabajo] = useLocalStorage<Record<string, UnidadTrabajo>>('unidadesTrabajo', mockUTs);

    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const needsMigration = services.some(s => !s.trimester);

        if (needsMigration) {
            console.log("Running migration for service trimesters...");
            
            const parseDateUTC = (dateStr: string) => {
                const [year, month, day] = dateStr.split('-').map(Number);
                return new Date(Date.UTC(year, month - 1, day));
            }

            const getTrimesterFromDate = (dateStr: string, dates: TrimesterDates): 't1' | 't2' | 't3' => {
                const serviceDate = parseDateUTC(dateStr);
                
                const t1Start = parseDateUTC(dates.t1.start);
                const t1End = parseDateUTC(dates.t1.end);
                const t2Start = parseDateUTC(dates.t2.start);
                const t2End = parseDateUTC(dates.t2.end);
                
                t1End.setUTCHours(23, 59, 59, 999);
                t2End.setUTCHours(23, 59, 59, 999);
                
                if (serviceDate >= t1Start && serviceDate <= t1End) return 't1';
                if (serviceDate >= t2Start && serviceDate <= t2End) return 't2';

                if (dates.t3) {
                    const t3Start = parseDateUTC(dates.t3.start);
                    const t3End = parseDateUTC(dates.t3.end);
                    t3End.setUTCHours(23, 59, 59, 999);
                    if (serviceDate >= t3Start && serviceDate <= t3End) return 't3';
                }
                
                console.warn(`Service date ${dateStr} is outside all defined trimester ranges. Defaulting to t1 for migration.`);
                return 't1'; 
            };

            const migratedServices = services.map(service => {
                if (!service.trimester) {
                    const trimester = getTrimesterFromDate(service.date, trimesterDates);
                    return { ...service, trimester };
                }
                return service;
            });
            setServices(migratedServices);
            addToast('Datos de servicios actualizados a la nueva versión.', 'info');
        }
    }, []);
    
    const calculatedStudentGrades = useMemo((): Record<string, StudentCalculatedGrades> => {
        const studentGrades: Record<string, StudentCalculatedGrades> = {};

        students.forEach(student => {
            const t1Exam = practicalExamEvaluations.find(e => e.studentId === student.id && e.examPeriod === 't1');
            const t2Exam = practicalExamEvaluations.find(e => e.studentId === student.id && e.examPeriod === 't2');
            const recExam = practicalExamEvaluations.find(e => e.studentId === student.id && e.examPeriod === 'rec');

            const trimesterScores: {
                t1: { individual: number[], group: number[] },
                t2: { individual: number[], group: number[] },
            } = {
                t1: { individual: [], group: [] },
                t2: { individual: [], group: [] },
            };

            serviceEvaluations.forEach(evaluation => {
                const service = services.find(s => s.id === evaluation.serviceId);
                if (!service || (service.trimester !== 't1' && service.trimester !== 't2')) return;

                const trimester = service.trimester;
                
                const individualEval = evaluation.serviceDay.individualScores[student.id];
                if (individualEval && individualEval.attendance) {
                    const hasIndividualScores = individualEval.scores && individualEval.scores.some(s => s !== null);
                    if (hasIndividualScores) {
                        const individualScore = (individualEval.scores || []).reduce((sum, score) => sum + (score || 0), 0);
                        trimesterScores[trimester].individual.push(individualScore);
                    }

                    const studentPracticeGroup = practiceGroups.find(pg => pg.studentIds.includes(student.id));
                    if (studentPracticeGroup) {
                        const groupEval = evaluation.serviceDay.groupScores[studentPracticeGroup.id];
                        const hasGroupScores = groupEval && groupEval.scores && groupEval.scores.some(s => s !== null);
                        if (hasGroupScores) {
                            const groupScore = (groupEval.scores || []).reduce((sum, score) => sum + (score || 0), 0);
                            trimesterScores[trimester].group.push(groupScore);
                        }
                    }
                }
            });
            
            const serviceAverages: { t1: number | null, t2: number | null } = { t1: null, t2: null };

            (['t1', 't2'] as const).forEach(trimester => {
                const individualAvg = trimesterScores[trimester].individual.length > 0
                    ? trimesterScores[trimester].individual.reduce((a, b) => a + b, 0) / trimesterScores[trimester].individual.length
                    : null;
                
                const groupAvg = trimesterScores[trimester].group.length > 0
                    ? trimesterScores[trimester].group.reduce((a, b) => a + b, 0) / trimesterScores[trimester].group.length
                    : null;

                if (individualAvg !== null && groupAvg !== null) {
                    serviceAverages[trimester] = (individualAvg * SERVICE_GRADE_WEIGHTS.individual) + (groupAvg * SERVICE_GRADE_WEIGHTS.group);
                } else if (individualAvg !== null) {
                    serviceAverages[trimester] = individualAvg;
                } else if (groupAvg !== null) {
                    serviceAverages[trimester] = groupAvg;
                } else {
                    serviceAverages[trimester] = null;
                }
            });
            
            studentGrades[student.id] = {
                serviceAverages,
                practicalExams: {
                    t1: t1Exam?.finalScore ?? null,
                    t2: t2Exam?.finalScore ?? null,
                    rec: recExam?.finalScore ?? null,
                }
            };
        });

        return studentGrades;
    }, [students, services, serviceEvaluations, practicalExamEvaluations, practiceGroups]);

    const addToast = (message: string, type: ToastType = 'info') => {
        const id = new Date().getTime().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
        }, 3000);
    };

    const handleFileUpload = async (file: File) => {
        const { data, error } = await parseFile(file);
        if (error) {
            addToast(error, 'error');
        } else {
            setStudents(data);
            addToast(`Se han importado ${data.length} alumnos correctamente.`, 'success');
        }
    };
    
    const handleUpdateStudent = (updatedStudent: Student) => {
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        addToast('Datos del alumno actualizados.', 'success');
    };

    const handleCreateService = (trimester: 't1' | 't2' | 't3'): string => {
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
        addToast('Rol de servicio eliminado.', 'info');
    };
    
    const handleDeleteInstrumento = (instrumentoId: string) => {
        if (window.confirm('¿Seguro que quieres eliminar este instrumento? También se eliminará de todos los criterios de evaluación asociados.')) {
            // Delete instrument
            setInstrumentosEvaluacion(prev => {
                const newState = { ...prev };
                delete newState[instrumentoId];
                return newState;
            });

            // Remove from criteria
            setCriteriosEvaluacion(prev => {
                const newState = { ...prev };
                Object.keys(newState).forEach(critId => {
                    const criterio = newState[critId];
                    const index = criterio.instrumentos.indexOf(instrumentoId);
                    if (index > -1) {
                        criterio.instrumentos.splice(index, 1);
                    }
                });
                return newState;
            });

            addToast('Instrumento eliminado.', 'info');
        }
    };


    const handleSaveEntryExitRecord = (record: Omit<EntryExitRecord, 'id' | 'studentId'>, studentIds: string[]) => {
        const newRecords = studentIds.map(studentId => ({
            ...record,
            id: `${studentId}-${Date.now()}-${Math.random()}`,
            studentId: studentId
        }));
        setEntryExitRecords(prev => [...prev, ...newRecords]);
        addToast(`Registro guardado para ${studentIds.length} alumno(s).`, 'success');
    };
    
    const handleSavePracticalExam = (evaluation: PracticalExamEvaluation) => {
        setPracticalExamEvaluations(prev => {
            const index = prev.findIndex(e => e.id === evaluation.id);
            if (index > -1) {
                const newEvals = [...prev];
                newEvals[index] = evaluation;
                return newEvals;
            }
            return [...prev, evaluation];
        });
        addToast('Examen práctico guardado.', 'success');
    };

    const contextValue: AppContextType = {
        students, setStudents, practiceGroups, setPracticeGroups, services, setServices, serviceEvaluations, setServiceEvaluations, serviceRoles, setServiceRoles, entryExitRecords, setEntryExitRecords, academicGrades, setAcademicGrades, courseGrades, setCourseGrades, practicalExamEvaluations, setPracticalExamEvaluations, teacherData, setTeacherData, instituteData, setInstituteData,
        trimesterDates, setTrimesterDates,
        resultadosAprendizaje, setResultadosAprendizaje,
        criteriosEvaluacion, setCriteriosEvaluacion,
        instrumentosEvaluacion, setInstrumentosEvaluacion,
        profesores, setProfesores,
        unidadesTrabajo, setUnidadesTrabajo,
        toasts, addToast,
        handleFileUpload, handleUpdateStudent,
        handleCreateService, handleSaveServiceAndEvaluation, handleDeleteService, onDeleteRole, handleDeleteInstrumento,
        handleSaveEntryExitRecord, handleSavePracticalExam,
        calculatedStudentGrades,
        getRA: (raId: string) => resultadosAprendizaje[raId],
        getCriterio: (criterioId: string) => criteriosEvaluacion[criterioId],
        getInstrumento: (instrumentoId: string) => instrumentosEvaluacion[instrumentoId],
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};