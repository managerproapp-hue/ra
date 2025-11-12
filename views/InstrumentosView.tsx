import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { InstrumentoEvaluacion, EvaluationActivity } from '../types';
import { PencilIcon, SaveIcon, PlusIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, XIcon } from '../components/icons';

const ActivityRow: React.FC<{
    activity: EvaluationActivity;
    onUpdate: (activity: EvaluationActivity) => void;
    onDelete: () => void;
}> = ({ activity, onUpdate, onDelete }) => {
    return (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <input
                type="text"
                value={activity.name}
                onChange={e => onUpdate({ ...activity, name: e.target.value })}
                className="flex-grow p-1.5 border rounded-md text-sm"
                placeholder="Nombre de la actividad"
            />
            <select
                value={activity.trimester}
                onChange={e => onUpdate({ ...activity, trimester: e.target.value as 't1' | 't2' })}
                className="p-1.5 border rounded-md text-sm bg-white"
            >
                <option value="t1">1º Trimestre</option>
                <option value="t2">2º Trimestre</option>
            </select>
            <button onClick={onDelete} className="p-1.5 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
        </div>
    );
};

const InstrumentosView: React.FC = () => {
    const { instrumentosEvaluacion, setInstrumentosEvaluacion, addToast } = useAppContext();
    const [expandedInstrument, setExpandedInstrument] = useState<string | null>(null);

    const handleUpdateInstrument = (updatedInstrument: InstrumentoEvaluacion) => {
        setInstrumentosEvaluacion(prev => ({
            ...prev,
            [updatedInstrument.id]: updatedInstrument,
        }));
    };

    const handleAddActivity = (instrumentId: string) => {
        const instrument = instrumentosEvaluacion[instrumentId];
        const newActivity: EvaluationActivity = {
            id: `act-${Date.now()}`,
            name: `Nueva Actividad ${instrument.activities.length + 1}`,
            trimester: 't1'
        };
        const updatedInstrument = { ...instrument, activities: [...instrument.activities, newActivity] };
        handleUpdateInstrument(updatedInstrument);
    };
    
    const handleUpdateActivity = (instrumentId: string, updatedActivity: EvaluationActivity) => {
        const instrument = instrumentosEvaluacion[instrumentId];
        const updatedActivities = instrument.activities.map(act => act.id === updatedActivity.id ? updatedActivity : act);
        const updatedInstrument = { ...instrument, activities: updatedActivities };
        handleUpdateInstrument(updatedInstrument);
    };

    const handleDeleteActivity = (instrumentId: string, activityId: string) => {
        if (window.confirm('¿Seguro que quieres eliminar esta actividad?')) {
            const instrument = instrumentosEvaluacion[instrumentId];
            const updatedActivities = instrument.activities.filter(act => act.id !== activityId);
            const updatedInstrument = { ...instrument, activities: updatedActivities };
            handleUpdateInstrument(updatedInstrument);
        }
    };
    
    const handleSaveAll = () => {
        // FIX: Explicitly type totalPeso to ensure it's a number for comparison.
        const totalPeso: number = Object.values(instrumentosEvaluacion).reduce((sum: number, inst: InstrumentoEvaluacion) => sum + (inst.pesoTotal || 0), 0);
        if (totalPeso > 100) {
            addToast(`El peso total no puede superar el 100% (actual: ${totalPeso}%)`, 'error');
            return;
        }
        // Data is already saved in context, this is for user feedback
        addToast('Ponderaciones y actividades guardadas con éxito.', 'success');
    };

    const totalPeso = useMemo(() => Object.values(instrumentosEvaluacion).reduce((sum: number, inst: InstrumentoEvaluacion) => sum + (inst.pesoTotal || 0), 0), [instrumentosEvaluacion]);

    return (
        <div>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center"><PencilIcon className="w-8 h-8 mr-3 text-purple-500"/>Planificación y Ponderación</h1>
                    <p className="text-gray-500 mt-1">Define el peso de cada instrumento y planifica las actividades de evaluación.</p>
                </div>
                 <button onClick={handleSaveAll} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition">
                    <SaveIcon className="w-5 h-5 mr-1" /> Guardar Todo
                </button>
            </header>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 w-1/3">Tipo de Instrumento</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Valor Total (%)</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Utilizados</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Ponderación Individual (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(instrumentosEvaluacion).map((inst: InstrumentoEvaluacion) => {
                                const utilizados = inst.activities.length;
                                const ponderacionIndividual = utilizados > 0 ? (inst.pesoTotal || 0) / utilizados : 0;
                                const isExpanded = expandedInstrument === inst.id;

                                return (
                                    <React.Fragment key={inst.id}>
                                        <tr className="border-t">
                                            <td className="px-4 py-3 font-medium">
                                                <button onClick={() => setExpandedInstrument(isExpanded ? null : inst.id)} className="flex items-center gap-2">
                                                     {isExpanded ? <ChevronDownIcon className="w-4 h-4"/> : <ChevronRightIcon className="w-4 h-4"/>}
                                                    {inst.nombre}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="number" 
                                                    value={inst.pesoTotal || ''}
                                                    onChange={e => handleUpdateInstrument({ ...inst, pesoTotal: parseInt(e.target.value) || 0 })}
                                                    className="w-24 mx-auto p-1.5 text-center bg-yellow-50 border rounded-md"
                                                    min="0" max="100"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium">{utilizados}</td>
                                            <td className="px-4 py-3 text-center font-medium">{ponderacionIndividual.toFixed(2)}%</td>
                                        </tr>
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={4} className="p-4 bg-gray-100">
                                                    <div className="space-y-3">
                                                        <h4 className="font-semibold text-sm">Actividades Planificadas:</h4>
                                                        {inst.activities.map(activity => (
                                                            <ActivityRow 
                                                                key={activity.id}
                                                                activity={activity}
                                                                onUpdate={(updated) => handleUpdateActivity(inst.id, updated)}
                                                                onDelete={() => handleDeleteActivity(inst.id, activity.id)}
                                                            />
                                                        ))}
                                                        <button onClick={() => handleAddActivity(inst.id)} className="w-full text-sm flex items-center justify-center gap-1 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                                                            <PlusIcon className="w-4 h-4" /> Añadir Actividad
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-gray-100 border-t-2">
                            <tr>
                                <td className="px-4 py-3 font-bold text-right">TOTAL</td>
                                <td className={`px-4 py-3 text-center font-bold text-lg ${totalPeso > 100 ? 'text-red-600' : 'text-green-600'}`}>
                                    {totalPeso}%
                                </td>
                                <td colSpan={2} className="px-4 py-3">
                                    {totalPeso > 100 && <span className="text-xs text-red-600">¡El total supera el 100%!</span>}
                                    {totalPeso < 100 && <span className="text-xs text-yellow-600">El total es inferior al 100%.</span>}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InstrumentosView;