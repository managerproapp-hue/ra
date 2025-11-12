import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
// FIX: Changed UserIcon to UsersIcon as it is the correct exported member.
import { FileTextIcon, SaveIcon, UsersIcon, CalculatorIcon, ListIcon } from '../components/icons';
import { useEvaluacion } from '../hooks/useEvaluacion';
import { useCalculosEvaluacion } from '../hooks/useCalculosEvaluacion';
import { PRACTICAL_EXAM_RUBRIC } from '../data/constants';
import CampoNota from '../components/CampoNota';

const RAView: React.FC = () => {
    const { students } = useAppContext();
    const [activeTab, setActiveTab] = useState('tabla-general');
    
    // Main data management hook
    const {
      evaluaciones,
      loading,
      error,
      hayCambiosPendientes,
      actualizarEvaluacion,
      guardarEvaluaciones,
    } = useEvaluacion();

    // Calculation hook
    const {
        calcularNotaRA,
        calcularPromedioGeneral,
    } = useCalculosEvaluacion(evaluaciones);

    if (students.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-700">No hay alumnos cargados</h2>
                <p className="text-gray-500 mt-2">Para poder usar el Centro de Evaluación, primero debes importar alumnos.</p>
            </div>
        );
    }
    
    if (loading) {
        return <div>Cargando datos de evaluación...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    const renderTablaGeneral = () => {
        return (
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full text-xs text-center border-collapse">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="p-2 border font-semibold text-gray-600 w-48 text-left sticky left-0 bg-gray-100 z-20" rowSpan={2}>Alumno</th>
                            {PRACTICAL_EXAM_RUBRIC.map(ra => (
                                <th key={ra.id} className="p-2 border font-semibold text-gray-600" colSpan={ra.criteria.length + 1}>
                                    {ra.name} ({ra.weight * 100}%)
                                </th>
                            ))}
                            <th className="p-2 border font-semibold text-gray-600 bg-gray-200" rowSpan={2}>NOTA FINAL</th>
                        </tr>
                        <tr>
                            {PRACTICAL_EXAM_RUBRIC.flatMap(ra => [
                                ...ra.criteria.map(criterion => (
                                    <th key={criterion.id} className="p-2 border font-semibold text-gray-500 text-[10px] w-20">{criterion.name}</th>
                                )),
                                <th key={`${ra.id}-avg`} className="p-2 border font-bold text-gray-700 bg-gray-200 w-20">MEDIA RA</th>
                            ])}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => {
                             const finalAverage = calcularPromedioGeneral(student.id);
                             return (
                                <tr key={student.id} className="hover:bg-gray-50 group">
                                    <td className="p-1 border text-left font-semibold text-gray-800 w-48 sticky left-0 bg-white group-hover:bg-gray-50 z-10">{`${student.apellido1} ${student.apellido2}, ${student.nombre}`}</td>
                                    {PRACTICAL_EXAM_RUBRIC.flatMap(ra => {
                                        const raAverage = calcularNotaRA(student.id, ra.id);
                                        return [
                                            ...ra.criteria.map(criterion => {
                                                const id = `${student.id}-${ra.id}-${criterion.id}`;
                                                const evaluacion = evaluaciones.find(e => e.id === id);
                                                return (
                                                    <td key={id} className="border p-0.5">
                                                        <CampoNota
                                                            value={evaluacion?.nota ?? null}
                                                            onChange={(newNota) => actualizarEvaluacion(id, { nota: newNota })}
                                                        />
                                                    </td>
                                                );
                                            }),
                                            <td key={`${ra.id}-avg`} className={`p-1.5 border font-bold ${raAverage !== null && raAverage < 5 ? 'text-red-600' : 'text-black'} bg-gray-200`}>
                                                {raAverage?.toFixed(2) ?? '-'}
                                            </td>
                                        ];
                                    })}
                                    <td className={`p-1.5 border font-bold text-base ${finalAverage !== null && finalAverage < 5 ? 'text-red-600' : 'text-black'} bg-gray-200`}>
                                        {finalAverage?.toFixed(2) ?? '-'}
                                    </td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center space-x-3">
                    <FileTextIcon className="w-8 h-8 text-purple-500" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Centro de Evaluación</h1>
                        <p className="text-gray-500 mt-1">Gestión de calificaciones para los Resultados de Aprendizaje (RA).</p>
                    </div>
                </div>
                 <button 
                    onClick={guardarEvaluaciones} 
                    disabled={!hayCambiosPendientes} 
                    className={`flex items-center px-4 py-2 rounded-lg font-semibold transition ${!hayCambiosPendientes ? 'bg-green-200 text-green-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                >
                    <SaveIcon className="w-5 h-5 mr-1" /> Guardar Cambios
                </button>
            </header>
            
            <div className="border-b border-gray-200">
                <nav className="flex space-x-2">
                     <button onClick={() => setActiveTab('tabla-general')} className={`flex items-center px-4 py-2 font-medium text-sm rounded-md ${activeTab === 'tabla-general' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}><ListIcon className="w-4 h-4 mr-2"/> Tabla General</button>
                     <button onClick={() => setActiveTab('por-alumno')} className={`flex items-center px-4 py-2 font-medium text-sm rounded-md ${activeTab === 'por-alumno' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}><UsersIcon className="w-4 h-4 mr-2"/> Por Alumno</button>
                     <button onClick={() => setActiveTab('ponderaciones')} className={`flex items-center px-4 py-2 font-medium text-sm rounded-md ${activeTab === 'ponderaciones' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}><CalculatorIcon className="w-4 h-4 mr-2"/> Ponderaciones</button>
                </nav>
            </div>
            
            {activeTab === 'tabla-general' && renderTablaGeneral()}
            {activeTab === 'por-alumno' && <div className="p-8 text-center bg-white rounded-lg shadow-md">Funcionalidad "Vista por Alumno" en desarrollo.</div>}
            {activeTab === 'ponderaciones' && <div className="p-8 text-center bg-white rounded-lg shadow-md">Funcionalidad "Calculadora de Ponderaciones" en desarrollo.</div>}

        </div>
    );
};

export default RAView;