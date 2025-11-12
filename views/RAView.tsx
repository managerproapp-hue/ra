import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { calculateRADashboardSummary, calculateRAProgress, getStudentHighlights } from '../services/dashboardAnalytics';
import SummaryStats from '../components/RADashboard/SummaryStats';
import RAProgress from '../components/RADashboard/RAProgress';
import StudentHighlights from '../components/RADashboard/StudentHighlights';
import Alerts from '../components/RADashboard/Alerts';
import QuickActions from '../components/RADashboard/QuickActions';
import { FileTextIcon } from '../components/icons';

const RAView: React.FC = () => {
    const { students, practicalExamEvaluations } = useAppContext();

    const summary = useMemo(() => calculateRADashboardSummary(students, practicalExamEvaluations), [students, practicalExamEvaluations]);
    const raProgress = useMemo(() => calculateRAProgress(practicalExamEvaluations), [practicalExamEvaluations]);
    const highlights = useMemo(() => getStudentHighlights(students, practicalExamEvaluations), [students, practicalExamEvaluations]);

    if (students.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-700">No hay alumnos cargados</h2>
                <p className="text-gray-500 mt-2">Para poder ver los datos de Resultados de Aprendizaje, primero debes importar alumnos y registrar evaluaciones de exámenes prácticos.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex items-center space-x-3">
                <FileTextIcon className="w-8 h-8 text-purple-500" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Resultados de Aprendizaje (RA)</h1>
                    <p className="text-gray-500 mt-1">Análisis y seguimiento del desempeño en los exámenes prácticos.</p>
                </div>
            </header>

            <section>
                <SummaryStats summary={summary} />
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Progreso por R.A.</h2>
                    <RAProgress raProgressData={raProgress} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Alumnos Destacados</h2>
                    <StudentHighlights highlights={highlights} />
                </div>
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Alertas y Notificaciones</h2>
                    <Alerts />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Acciones Rápidas</h2>
                    <QuickActions />
                </div>
            </section>
        </div>
    );
};

export default RAView;
