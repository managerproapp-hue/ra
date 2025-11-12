
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
    const raProgressData = useMemo(() => calculateRAProgress(practicalExamEvaluations), [practicalExamEvaluations]);
    const highlights = useMemo(() => getStudentHighlights(students, practicalExamEvaluations), [students, practicalExamEvaluations]);

    return (
        <div className="space-y-6">
            <header className="mb-2">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <FileTextIcon className="w-8 h-8 mr-3 text-indigo-500" />
                    Dashboard de Resultados de Aprendizaje (RA)
                </h1>
                <p className="text-gray-500 mt-1">Análisis del rendimiento en los exámenes prácticos basado en la rúbrica.</p>
            </header>

            <SummaryStats summary={summary} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Progreso por RA</h2>
                    <RAProgress raProgressData={raProgressData} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Alumnos Destacados</h2>
                    <StudentHighlights highlights={highlights} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div>
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Alertas y Notificaciones</h2>
                    <Alerts />
                </div>
                 <div>
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Acciones Rápidas</h2>
                    <QuickActions />
                </div>
            </div>
        </div>
    );
};

export default RAView;
