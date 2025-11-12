import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Student, EntryExitRecord, StudentCalculatedGrades, StudentAcademicGrades, StudentCourseGrades, GradeValue, CourseModuleGrades, ServiceEvaluation, Service, TimelineEvent, PreServiceDayEvaluation } from '../types';
import { ACADEMIC_EVALUATION_STRUCTURE, COURSE_MODULES } from '../data/constants';
import { 
    PencilIcon,
    CameraIcon,
    SaveIcon,
    ArrowRightLeftIcon,
    MessageCircleIcon,
    TrendingUpIcon,
    PrinterIcon
} from '../components/icons';
import { calculateStudentPeriodAverages } from '../services/gradeCalculator';
import GradeTrendChart from '../components/GradeTrendChart';
import { useAppContext } from '../context/AppContext';
import { generateStudentFilePDF } from '../services/reportGenerator';

interface FichaAlumnoProps {
  student: Student;
  onBack: () => void;
  entryExitRecords: EntryExitRecord[];
  calculatedGrades: StudentCalculatedGrades;
  academicGrades?: StudentAcademicGrades;
  courseGrades?: StudentCourseGrades;
  serviceEvaluations: ServiceEvaluation[];
  services: Service[];
  onUpdatePhoto: (studentId: string, photoUrl: string) => void;
  onUpdateStudent: (student: Student) => void;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode; isEditing?: boolean; children?: React.ReactNode }> = ({ label, value, isEditing, children }) => (
    <div className="grid grid-cols-3 gap-4 px-4 py-3 hover:bg-gray-50">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 col-span-2">{isEditing ? children : (value || '-')}</dd>
    </div>
);

const calculateSimpleAverage = (grades: Partial<CourseModuleGrades>): string => {
    if (!grades) return '-';
    const validGrades = (Object.values(grades) as (GradeValue | undefined)[])
        .map(g => parseFloat(String(g)))
        .filter(g => !isNaN(g));
      
    if (validGrades.length === 0) return '-';
      
    const sum = validGrades.reduce((acc, curr) => acc + curr, 0);
    return (sum / validGrades.length).toFixed(2);
};

const FichaAlumno: React.FC<FichaAlumnoProps> = ({ student, onBack, entryExitRecords, calculatedGrades, academicGrades, courseGrades, serviceEvaluations, services, onUpdatePhoto, onUpdateStudent }) => {
  const { teacherData, instituteData } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Student>(student);

  const fullName = `${student.apellido1} ${student.apellido2}, ${student.nombre}`.trim();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setEditedStudent(student) }, [student]);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (typeof loadEvent.target?.result === 'string') onUpdatePhoto(student.id, loadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedStudent(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    onUpdateStudent(editedStudent);
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditedStudent(student);
    setIsEditing(false);
  };

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];
    const parseDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    };

    entryExitRecords.forEach(rec => {
        events.push({
            date: parseDate(rec.date),
            type: 'incidencia',
            title: rec.type,
            content: rec.reason,
        });
    });

    serviceEvaluations.forEach(ev => {
        const service = services.find(s => s.id === ev.serviceId);
        if(!service) return;

        Object.entries(ev.preService).forEach(([date, preServiceDay]) => {
            const obs = (preServiceDay as PreServiceDayEvaluation).individualEvaluations[student.id]?.observations;
            if (obs) {
                events.push({ date: new Date(date), type: 'observacion', title: `Observación Pre-Servicio`, content: obs, serviceName: service.name });
            }
        });

        const serviceDayObs = ev.serviceDay.individualScores[student.id]?.observations;
        if(serviceDayObs) {
            events.push({ date: new Date(service.date), type: 'observacion', title: `Observación Día de Servicio`, content: serviceDayObs, serviceName: service.name });
        }
    });

    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entryExitRecords, serviceEvaluations, services, student.id]);

  const finalAverages = useMemo(() => calculateStudentPeriodAverages(academicGrades, calculatedGrades), [academicGrades, calculatedGrades]);

  const handlePrint = () => {
      generateStudentFilePDF(
          student,
          calculatedGrades,
          academicGrades,
          courseGrades,
          timelineEvents,
          teacherData,
          instituteData
      );
  };

  const TimelineIcon: React.FC<{type: TimelineEvent['type']}> = ({ type }) => {
    const baseClass = "w-8 h-8 rounded-full flex items-center justify-center text-white";
    if (type === 'incidencia') return <div className={`${baseClass} bg-orange-500`}><ArrowRightLeftIcon className="w-5 h-5"/></div>;
    if (type === 'observacion') return <div className={`${baseClass} bg-blue-500`}><MessageCircleIcon className="w-5 h-5"/></div>;
    return null;
  };
  
  return (
    <div>
      <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex items-center">
            <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                <img className="h-20 w-20 rounded-full object-cover mr-4" src={student.fotoUrl} alt={`Foto de ${fullName}`} />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-300">
                    <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <div>
                <h1 className="text-4xl font-bold text-gray-800">{fullName}</h1>
                <p className="text-gray-500 text-lg">{student.grupo} | {student.emailOficial}</p>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            {isEditing ? (
                <>
                    <button onClick={handleSave} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"><SaveIcon className="w-4 h-4 mr-2" />Guardar</button>
                    <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                </>
            ) : (
                 <>
                    <button onClick={handlePrint} className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition">
                        <PrinterIcon className="w-4 h-4 mr-2" />Imprimir Ficha
                    </button>
                    <button onClick={() => setIsEditing(true)} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                        <PencilIcon className="w-4 h-4 mr-2" />Editar Ficha
                    </button>
                 </>
            )}
            <button onClick={onBack} className="text-gray-600 hover:text-gray-800 font-medium text-2xl leading-none p-1 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">&times;</button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Panel */}
        <div className="w-full lg:w-2/3 space-y-8">
            <div className="bg-white shadow-md rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center"><TrendingUpIcon className="w-5 h-5 mr-2 text-blue-500"/> Progresión Académica (Módulo Principal)</h3>
                <GradeTrendChart trimesterAverages={{ t1: finalAverages.t1, t2: finalAverages.t2, t3: finalAverages.t3 }} />
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-4 border-b"><h3 className="text-lg font-bold text-gray-800">Resumen de Calificaciones</h3></div>
                <dl className="divide-y divide-gray-200">
                    <InfoRow label="Media Servicios (T1)" value={calculatedGrades?.serviceAverages?.t1?.toFixed(2)} />
                    <InfoRow label="Media Ex. Práctico (T1)" value={calculatedGrades?.practicalExams?.t1?.toFixed(2)} />
                    <InfoRow label="Media Servicios (T2)" value={calculatedGrades?.serviceAverages?.t2?.toFixed(2)} />
                    <InfoRow label="Media Ex. Práctico (T2)" value={calculatedGrades?.practicalExams?.t2?.toFixed(2)} />
                     <InfoRow label="Media Servicios (T3)" value={calculatedGrades?.serviceAverages?.t3?.toFixed(2)} />
                    <InfoRow label="Media Ex. Práctico (T3)" value={calculatedGrades?.practicalExams?.t3?.toFixed(2)} />
                    <InfoRow label="Media Ex. Práctico (REC)" value={calculatedGrades?.practicalExams?.rec?.toFixed(2)} />
                </dl>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <h3 className="text-lg font-bold text-gray-800 p-4 border-b">Desglose de Calificaciones (Módulo Principal)</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-center">
                        <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Instrumento</th>
                                {ACADEMIC_EVALUATION_STRUCTURE.periods.map(p => <th key={p.key} className="px-4 py-3">{p.name}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {ACADEMIC_EVALUATION_STRUCTURE.periods[0].instruments.map(instrument => (
                                <tr key={instrument.key}>
                                    <td className="px-4 py-2 text-left font-medium">{instrument.name} ({instrument.weight * 100}%)</td>
                                    {ACADEMIC_EVALUATION_STRUCTURE.periods.map(period => {
                                        let grade: GradeValue | undefined = null;
                                        if (instrument.type === 'manual') grade = academicGrades?.[period.key]?.manualGrades?.[instrument.key];
                                        else if (instrument.key === 'servicios') grade = calculatedGrades?.serviceAverages?.[period.key as 't1'|'t2'|'t3'];
                                        else {
                                            const examKey = period.key as keyof typeof calculatedGrades.practicalExams;
                                            grade = calculatedGrades?.practicalExams?.[examKey];
                                        }
                                        return <td key={`${period.key}-${instrument.key}`} className="px-4 py-2">{grade?.toFixed(2) ?? '-'}</td>
                                    })}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold">
                             <tr>
                                <td className="px-4 py-2 text-left">MEDIA PONDERADA</td>
                                {ACADEMIC_EVALUATION_STRUCTURE.periods.map(p => (
                                    <td key={`avg-${p.key}`} className="px-4 py-2">{finalAverages[p.key as keyof typeof finalAverages]?.toFixed(2) ?? '-'}</td>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <h3 className="text-lg font-bold text-gray-800 p-4 border-b">Calificaciones de Otros Módulos</h3>
                <div className="overflow-x-auto">
                   <table className="min-w-full text-sm text-center">
                        <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Módulo</th>
                                <th className="px-4 py-3">T1</th>
                                <th className="px-4 py-3">T2</th>
                                <th className="px-4 py-3">T3</th>
                                <th className="px-4 py-3">REC</th>
                                <th className="px-4 py-3">Media Final</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {COURSE_MODULES.map(mod => {
                                const grades = courseGrades?.[mod] || {};
                                return (
                                    <tr key={mod}>
                                        <td className="px-4 py-2 text-left font-medium">{mod}</td>
                                        <td>{grades?.t1 ?? '-'}</td>
                                        <td>{grades?.t2 ?? '-'}</td>
                                        <td>{grades?.t3 ?? '-'}</td>
                                        <td>{grades?.rec ?? '-'}</td>
                                        <td className="font-bold bg-gray-50">{calculateSimpleAverage(grades)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-4 border-b"><h3 className="text-lg font-bold text-gray-800">Datos Personales</h3></div>
                <dl className="divide-y divide-gray-200">
                    <InfoRow label="NRE" value={editedStudent.nre} isEditing={isEditing}><input name="nre" value={editedStudent.nre} onChange={handleInputChange} className="w-full p-1 border rounded" /></InfoRow>
                    <InfoRow label="Nº Expediente" value={editedStudent.expediente} isEditing={isEditing}><input name="expediente" value={editedStudent.expediente} onChange={handleInputChange} className="w-full p-1 border rounded" /></InfoRow>
                    <InfoRow label="Fecha de Nacimiento" value={editedStudent.fechaNacimiento} isEditing={isEditing}><input name="fechaNacimiento" value={editedStudent.fechaNacimiento} onChange={handleInputChange} className="w-full p-1 border rounded" type="date" /></InfoRow>
                    <InfoRow label="Teléfono" value={editedStudent.telefono} isEditing={isEditing}><input name="telefono" value={editedStudent.telefono} onChange={handleInputChange} className="w-full p-1 border rounded" /></InfoRow>
                    <InfoRow label="Email Personal" value={editedStudent.emailPersonal} isEditing={isEditing}><input name="emailPersonal" value={editedStudent.emailPersonal} onChange={handleInputChange} className="w-full p-1 border rounded" type="email" /></InfoRow>
                </dl>
            </div>
        </div>

        {/* Side Panel */}
        <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white shadow-md rounded-lg p-4 sticky top-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Historial y Anotaciones</h3>
                <div className="space-y-2 mb-4">
                    <textarea rows={3} placeholder="Añadir una nueva anotación o resumen de tutoría..." className="w-full p-2 border rounded-md text-sm bg-gray-50"></textarea>
                    <button className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 text-sm">Guardar Anotación</button>
                </div>
                <div className="relative max-h-96 overflow-y-auto pr-2">
                    {timelineEvents.length > 0 ? timelineEvents.map((event, index) => (
                        <div key={index} className="flex gap-4 pb-6">
                            <div className="relative">
                                <TimelineIcon type={event.type} />
                                {index < timelineEvents.length - 1 && <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-200"></div>}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">{event.date.toLocaleDateString('es-ES')}{event.serviceName && ` - ${event.serviceName}`}</p>
                                <p className="font-bold text-sm">{event.title}</p>
                                <p className="text-sm text-gray-600">{event.content}</p>
                            </div>
                        </div>
                    )) : <p className="text-sm text-gray-500 text-center py-4">No hay eventos en el historial.</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FichaAlumno;