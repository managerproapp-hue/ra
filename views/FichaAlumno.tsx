import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Student, EntryExitRecord, Service, TimelineEvent, PreServiceDayEvaluation, ResultadoAprendizaje, AcademicGrades, StudentCalculatedGrades, CourseGrades, ServiceEvaluation, TeacherData, InstituteData } from '../types';
import { 
    PencilIcon,
    CameraIcon,
    SaveIcon,
    ArrowRightLeftIcon,
    MessageCircleIcon,
    TrendingUpIcon,
    PrinterIcon,
    ChevronDownIcon,
    ChevronRightIcon
} from '../components/icons';
import { useAppContext } from '../context/AppContext';
import { generateStudentFilePDF } from '../services/reportGenerator';
import { calculateRAGrade, calculateCriterioGrade } from '../services/academicAnalytics';

interface FichaAlumnoProps {
  student: Student;
  onBack: () => void;
  onUpdatePhoto: (studentId: string, photoUrl: string) => void;
  onUpdateStudent: (student: Student) => void;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode; isEditing?: boolean; children?: React.ReactNode }> = ({ label, value, isEditing, children }) => (
    <div className="grid grid-cols-3 gap-4 px-4 py-3 hover:bg-gray-50">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 col-span-2">{isEditing ? children : (value || '-')}</dd>
    </div>
);

const Tab: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 font-medium text-sm rounded-md transition-colors
            ${isActive
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
    >
        {label}
    </button>
);


const FichaAlumno: React.FC<FichaAlumnoProps> = ({ student, onBack, onUpdatePhoto, onUpdateStudent }) => {
  const { 
    teacherData, 
    instituteData,
    resultadosAprendizaje, 
    criteriosEvaluacion, 
    academicGrades: allAcademicGrades,
    calculatedStudentGrades: allCalculatedGrades,
    courseGrades: allCourseGrades,
    services,
    serviceEvaluations,
    entryExitRecords: allEntryExitRecords,
  } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Student>(student);
  const [activeTab, setActiveTab] = useState('general');
  const [expandedRAs, setExpandedRAs] = useState<Set<string>>(new Set());

  const fullName = `${student.apellido1} ${student.apellido2}, ${student.nombre}`.trim();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setEditedStudent(student) }, [student]);

  const studentEntryExitRecords = useMemo(() => 
    allEntryExitRecords.filter(r => r.studentId === student.id), 
    [allEntryExitRecords, student.id]
  );

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

    studentEntryExitRecords.forEach(rec => {
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
  }, [studentEntryExitRecords, serviceEvaluations, services, student.id]);

  const raProgress = useMemo(() => {
    return (Object.values(resultadosAprendizaje) as ResultadoAprendizaje[]).map(ra => {
        const { grade } = calculateRAGrade(
            ra, 
            student.id, 
            criteriosEvaluacion,
            allAcademicGrades,
            allCalculatedGrades
        );
        return { ...ra, grade };
    }).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [student.id, resultadosAprendizaje, criteriosEvaluacion, allAcademicGrades, allCalculatedGrades]);

  const toggleRA = (raId: string) => {
    setExpandedRAs(prev => {
        const newSet = new Set(prev);
        if (newSet.has(raId)) {
            newSet.delete(raId);
        } else {
            newSet.add(raId);
        }
        return newSet;
    });
  };

  const handlePrint = () => {
      generateStudentFilePDF(
          student,
          allCalculatedGrades[student.id],
          allAcademicGrades[student.id],
          allCourseGrades[student.id],
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

      <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-2">
                <Tab label="Información General" isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} />
                <Tab label="Resumen Académico" isActive={activeTab === 'academico'} onClick={() => setActiveTab('academico')} />
            </nav>
        </div>

        {activeTab === 'general' && (
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Panel */}
                <div className="w-full xl:col-span-2 space-y-8">
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <TrendingUpIcon className="w-5 h-5 mr-2 text-blue-500"/> Progresión por Competencias (RA)
                        </h3>
                        <div className="space-y-4">
                            {raProgress.map(ra => {
                                const percentage = ra.grade !== null ? (ra.grade / 10) * 100 : 0;
                                const barColor = ra.grade === null ? 'bg-gray-200' : ra.grade < 5 ? 'bg-red-400' : ra.grade < 7 ? 'bg-yellow-400' : 'bg-green-400';
                                return (
                                    <div key={ra.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-gray-700">{ra.nombre}</span>
                                            <span className={`text-sm font-bold ${ra.grade === null ? 'text-gray-500' : ra.grade < 5 ? 'text-red-600' : 'text-gray-800'}`}>
                                                {ra.grade?.toFixed(2) ?? 'N/E'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className={`h-2.5 rounded-full ${barColor}`} 
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            })}
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
                <div className="w-full xl:col-span-1 space-y-6">
                    <div className="bg-white shadow-md rounded-lg p-4 sticky top-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Historial y Anotaciones</h3>
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
        )}
        
        {activeTab === 'academico' && (
            <div className="space-y-4">
                {raProgress.map(ra => {
                    const isExpanded = expandedRAs.has(ra.id);
                    const { grade, ponderacionTotal } = calculateRAGrade(
                        ra, 
                        student.id, 
                        criteriosEvaluacion,
                        allAcademicGrades,
                        allCalculatedGrades
                    );
                    
                    return (
                        <div key={ra.id} className="bg-white shadow-sm rounded-lg overflow-hidden">
                            <div 
                                className="flex items-center p-4 cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleRA(ra.id)}
                            >
                                {isExpanded ? <ChevronDownIcon className="w-5 h-5 mr-3"/> : <ChevronRightIcon className="w-5 h-5 mr-3"/>}
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800">{ra.nombre}</h4>
                                    <p className="text-xs text-gray-500">Ponderación de criterios evaluados: {ponderacionTotal}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-500">Nota RA</p>
                                    <p className={`text-2xl font-bold ${grade === null ? 'text-gray-400' : grade < 5 ? 'text-red-600' : 'text-green-600'}`}>
                                        {grade?.toFixed(2) ?? 'N/E'}
                                    </p>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t bg-gray-50 p-4">
                                    <h5 className="text-sm font-semibold text-gray-600 mb-2">Desglose de Criterios de Evaluación</h5>
                                    <div className="space-y-2">
                                        {ra.criteriosEvaluacion.map(criterioId => {
                                            const criterio = criteriosEvaluacion[criterioId];
                                            if (!criterio) return null;
                                            
                                            const criterioGrade = calculateCriterioGrade(
                                                criterio,
                                                student.id,
                                                allAcademicGrades,
                                                allCalculatedGrades
                                            );

                                            return (
                                                <div key={criterio.id} className="flex items-center justify-between p-2 bg-white rounded-md border">
                                                    <div className="flex-1 pr-4">
                                                        <p className="text-sm text-gray-800">{criterio.descripcion}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-xs text-gray-500">Pond: {criterio.ponderacion}%</p>
                                                        <p className={`font-bold ${criterioGrade === null ? 'text-gray-400' : criterioGrade < 5 ? 'text-red-500' : 'text-gray-800'}`}>
                                                            {criterioGrade?.toFixed(2) ?? 'N/E'}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )}
    </div>
  );
};

export default FichaAlumno;