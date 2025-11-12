import React, { useMemo } from 'react';
import { FileTextIcon } from '../components/icons';
import { useAppContext } from '../context/AppContext';
import { calculateRADashboardSummary, calculateRAProgress, getStudentHighlights } from '../services/dashboardAnalytics';
import SummaryStats from '../components/RADashboard/SummaryStats';
import RAProgress from '../components/RADashboard/RAProgress';
import StudentHighlights from '../components/RADashboard/StudentHighlights';
import Alerts from '../components/RADashboard/Alerts';
import QuickActions from '../components/RADashboard/QuickActions';

const RAView: React.FC = () => {
    const { students, practicalExamEvaluations } = useAppContext();

    const summary = useMemo(
        () => calculateRADashboardSummary(students, practicalExamEvaluations),
        [students, practicalExamEvaluations]
    );

    const raProgress = useMemo(
        () => calculateRAProgress(practicalExamEvaluations),
        [practicalExamEvaluations]
    );

    const studentHighlights = useMemo(
        () => getStudentHighlights(students, practicalExamEvaluations),
        [students, practicalExamEvaluations]
    );
    
    if (students.length === 0) {
        return (
             <div className="text-center p-8 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-700">No hay alumnos cargados</h2>
                <p className="text-gray-500 mt-2">Para poder ver el dashboard de Resultados de Aprendizaje, primero debes importar la lista de alumnos.</p>
            </div>
        );
    }

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <FileTextIcon className="w-8 h-8 mr-3 text-indigo-500" />
                    Dashboard de Resultados de Aprendizaje (RA)
                </h1>
                <p className="text-gray-500 mt-1">
                    Un resumen analítico del rendimiento de la clase basado en los RA de los exámenes prácticos.
                </p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                     <h2 className="text-lg font-semibold text-gray-700 mb-2">📊 Resumen General del Curso</h2>
                    <SummaryStats summary={summary} />
                </div>
                
                <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">⚠️ Alertas y Notificaciones</h2>
                    <Alerts />
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">👥 Alumnos Destacados</h2>
                    <StudentHighlights highlights={studentHighlights} />
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">🚀 Acceso Rápido</h2>
                    <QuickActions />
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">📈 Progreso por RA</h2>
                    <RAProgress raProgressData={raProgress} />
                </div>
            </div>
        </div>
    );
};

export default RAView;