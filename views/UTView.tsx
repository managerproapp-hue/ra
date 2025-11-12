import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { UnidadTrabajo, CriterioEvaluacion, ResultadoAprendizaje, EvaluationActivity, InstrumentoEvaluacion } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, SaveIcon, XIcon, BookOpenIcon } from '../components/icons';

interface UTFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: UnidadTrabajo) => void;
    initialData: UnidadTrabajo;
}

const UTFormModal: React.FC<UTFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const { resultadosAprendizaje, criteriosEvaluacion, instrumentosEvaluacion } = useAppContext();
    const [formData, setFormData] = useState(initialData);
    const [selectedRA, setSelectedRA] = useState('');
    const [selectedCriterio, setSelectedCriterio] = useState('');

    if (!isOpen) return null;

    const allActivities = useMemo(() => {
        // FIX: Explicitly type 'inst' to avoid 'unknown' type error.
        return Object.values(instrumentosEvaluacion).flatMap((inst: InstrumentoEvaluacion) => inst.activities);
    }, [instrumentosEvaluacion]);

    const handleToggleActivity = (raId: string, criterioId: string, activityId: string) => {
        setFormData(prev => {
            const newAsociaciones = [...prev.asociaciones];
            const asocIndex = newAsociaciones.findIndex(a => a.raId === raId && a.criterioId === criterioId);

            if (asocIndex === -1) { // This shouldn't happen if UI is correct
                newAsociaciones.push({ raId, criterioId, activityIds: [activityId] });
            } else {
                const asoc = newAsociaciones[asocIndex];
                const activityIndex = asoc.activityIds.indexOf(activityId);
                if (activityIndex > -1) {
                    asoc.activityIds.splice(activityIndex, 1);
                } else {
                    asoc.activityIds.push(activityId);
                }
            }
            return { ...prev, asociaciones: newAsociaciones };
        });
    };
    
    const handleAddAsociacion = () => {
        if(selectedRA && selectedCriterio) {
            const exists = formData.asociaciones.some(a => a.raId === selectedRA && a.criterioId === selectedCriterio);
            if (!exists) {
                setFormData(prev => ({ ...prev, asociaciones: [...prev.asociaciones, { raId: selectedRA, criterioId: selectedCriterio, activityIds: [] }] }));
            }
        }
    };
    
    const handleRemoveAsociacion = (index: number) => {
         setFormData(prev => ({ ...prev, asociaciones: prev.asociaciones.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const availableCriterios = useMemo(() => {
        if (!selectedRA) return [];
        return resultadosAprendizaje[selectedRA]?.criteriosEvaluacion.map(id => criteriosEvaluacion[id]).filter(Boolean) || [];
    }, [selectedRA, resultadosAprendizaje, criteriosEvaluacion]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{initialData.id.startsWith('ut_') ? 'Nueva Unidad de Trabajo' : 'Editar Unidad de Trabajo'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon className="w-6 h-6 text-gray-600" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" value={formData.nombre} onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))} required className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea value={formData.descripcion} onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))} rows={2} className="mt-1 w-full p-2 border rounded-md"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Asociaciones (RA, Criterios y Actividades)</label>
                        <div className="bg-gray-50 p-3 rounded-md border">
                            <div className="flex items-end gap-2 mb-2">
                                <div className="flex-1">
                                    <label className="text-xs font-medium">1. Seleccionar RA</label>
                                    <select value={selectedRA} onChange={e => { setSelectedRA(e.target.value); setSelectedCriterio(''); }} className="w-full p-2 border rounded-md bg-white">
                                        <option value="">-- Elige un RA --</option>
                                        {Object.values(resultadosAprendizaje).map((ra: ResultadoAprendizaje) => <option key={ra.id} value={ra.id}>{ra.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                     <label className="text-xs font-medium">2. Seleccionar Criterio</label>
                                     <select value={selectedCriterio} onChange={e => setSelectedCriterio(e.target.value)} disabled={!selectedRA} className="w-full p-2 border rounded-md bg-white disabled:bg-gray-200">
                                        <option value="">-- Elige un Criterio --</option>
                                        {availableCriterios.map((c: CriterioEvaluacion) => <option key={c.id} value={c.id}>{c.descripcion}</option>)}
                                     </select>
                                </div>
                                <button type="button" onClick={handleAddAsociacion} disabled={!selectedCriterio} className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"><PlusIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
                            {formData.asociaciones.map((asoc, index) => (
                                <div key={index} className="p-3 bg-gray-100 rounded">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-sm">{resultadosAprendizaje[asoc.raId]?.nombre || 'RA no encontrado'}</p>
                                            <p className="text-xs text-gray-600">{criteriosEvaluacion[asoc.criterioId]?.descripcion || 'Criterio no encontrado'}</p>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveAsociacion(index)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                    <div className="mt-2 pt-2 border-t">
                                        <p className="text-xs font-bold mb-1">3. Asignar Actividades de Evaluación:</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {allActivities.map(activity => (
                                                <label key={activity.id} className="flex items-center text-xs p-1.5 bg-white rounded border cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={asoc.activityIds.includes(activity.id)}
                                                        onChange={() => handleToggleActivity(asoc.raId, asoc.criterioId, activity.id)}
                                                        className="h-3 w-3 mr-2"
                                                    />
                                                    {activity.name} ({activity.trimester.toUpperCase()})
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
                 <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold flex items-center"><SaveIcon className="w-5 h-5 mr-2" />Guardar</button>
                </div>
            </div>
        </div>
    );
};

const UTView: React.FC = () => {
    const { unidadesTrabajo, setUnidadesTrabajo, resultadosAprendizaje, criteriosEvaluacion, addToast, instrumentosEvaluacion } = useAppContext();
    const [modalState, setModalState] = useState<{ isOpen: boolean; data: UnidadTrabajo | null }>({ isOpen: false, data: null });

    const allActivities = useMemo(() => {
        // FIX: Explicitly type 'inst' to avoid 'unknown' type error.
        return Object.values(instrumentosEvaluacion).flatMap((inst: InstrumentoEvaluacion) => inst.activities);
    }, [instrumentosEvaluacion]);

    const getActivityNameById = (id: string) => allActivities.find(act => act.id === id)?.name || 'Actividad no encontrada';

    const handleOpenModal = (data: UnidadTrabajo | null) => {
        setModalState({ isOpen: true, data: data || { id: `ut_${Date.now()}`, nombre: '', descripcion: '', asociaciones: [] } });
    };

    const handleCloseModal = () => setModalState({ isOpen: false, data: null });

    const handleSave = (data: UnidadTrabajo) => {
        setUnidadesTrabajo(prev => ({ ...prev, [data.id]: data }));
        addToast('Unidad de Trabajo guardada.', 'success');
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Seguro que quieres eliminar esta Unidad de Trabajo?')) {
            setUnidadesTrabajo(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
            addToast('Unidad de Trabajo eliminada.', 'info');
        }
    };

    return (
        <div>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center"><BookOpenIcon className="w-8 h-8 mr-3 text-purple-500"/>Unidades de Trabajo (UT)</h1>
                    <p className="text-gray-500 mt-1">Define las unidades didácticas y asócialas con los criterios y actividades de evaluación.</p>
                </div>
                <button onClick={() => handleOpenModal(null)} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"><PlusIcon className="w-5 h-5 mr-1" /> Nueva UT</button>
            </header>
            <div className="space-y-4">
                {Object.values(unidadesTrabajo).map((ut: UnidadTrabajo) => (
                    <div key={ut.id} className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{ut.nombre}</h3>
                                <p className="text-sm text-gray-600">{ut.descripcion}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleOpenModal(ut)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(ut.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Asociaciones</h4>
                            <div className="space-y-2">
                                {ut.asociaciones.map((asoc, index) => (
                                    <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                                        <p><span className="font-semibold">{resultadosAprendizaje[asoc.raId]?.nombre || 'RA no encontrado'}:</span> {criteriosEvaluacion[asoc.criterioId]?.descripcion || 'Criterio no encontrado'}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {asoc.activityIds.map(actId => (
                                                <span key={actId} className="bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full text-[10px] font-medium">{getActivityNameById(actId)}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {ut.asociaciones.length === 0 && <p className="text-xs text-gray-500">Sin asociaciones.</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {modalState.isOpen && <UTFormModal isOpen={modalState.isOpen} onClose={handleCloseModal} onSave={handleSave} initialData={modalState.data!} />}
        </div>
    );
};

export default UTView;