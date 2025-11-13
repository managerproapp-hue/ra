import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ResultadoAprendizaje, CriterioEvaluacion, AsociacionCriterio } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, SaveIcon, XIcon, FileTextIcon, SettingsIcon } from '../components/icons';

interface AsociacionesModalProps {
    isOpen: boolean;
    onClose: () => void;
    criterio: CriterioEvaluacion;
}

const AsociacionesModal: React.FC<AsociacionesModalProps> = ({ isOpen, onClose, criterio }) => {
    const { unidadesTrabajo, instrumentosEvaluacion, setCriteriosEvaluacion, addToast } = useAppContext();
    const [asociaciones, setAsociaciones] = useState<AsociacionCriterio[]>(criterio.asociaciones);
    const [nuevaAsociacion, setNuevaAsociacion] = useState<{ utId: string; instrumentoIds: string[] }>({ utId: '', instrumentoIds: [] });

    useEffect(() => {
        setAsociaciones(criterio.asociaciones);
    }, [criterio]);

    if (!isOpen) return null;
    
    const handleAddAsociacion = () => {
        if (nuevaAsociacion.utId && nuevaAsociacion.instrumentoIds.length > 0) {
            setAsociaciones([...asociaciones, { ...nuevaAsociacion, id: `asoc_${Date.now()}` }]);
            setNuevaAsociacion({ utId: '', instrumentoIds: [] });
        } else {
            addToast('Selecciona una UT y al menos un instrumento.', 'error');
        }
    };
    
    const handleDeleteAsociacion = (id: string) => {
        setAsociaciones(asociaciones.filter(a => a.id !== id));
    };

    const handleSave = () => {
        setCriteriosEvaluacion(prev => ({
            ...prev,
            [criterio.id]: {
                ...criterio,
                asociaciones: asociaciones
            }
        }));
        addToast('Asociaciones guardadas.', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Gestionar Asociaciones</h3>
                        <p className="text-sm text-gray-500 truncate max-w-lg">{criterio.descripcion}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon className="w-6 h-6 text-gray-600" /></button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {asociaciones.map(asoc => (
                        <div key={asoc.id} className="bg-gray-50 p-3 rounded-md border flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{unidadesTrabajo[asoc.utId]?.nombre || 'UT no encontrada'}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {asoc.instrumentoIds.map(instId => (
                                        <span key={instId} className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">{instrumentosEvaluacion[instId]?.nombre || 'Inválido'}</span>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => handleDeleteAsociacion(asoc.id)} className="p-2 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    ))}

                    <div className="border-t pt-4">
                         <h4 className="font-semibold mb-2">Añadir Nueva Asociación</h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Unidad de Trabajo</label>
                                <select value={nuevaAsociacion.utId} onChange={e => setNuevaAsociacion(p => ({ ...p, utId: e.target.value }))} className="mt-1 w-full p-2 border rounded-md bg-white">
                                    <option value="">Seleccionar...</option>
                                    {Object.values(unidadesTrabajo).map(ut => <option key={ut.id} value={ut.id}>{ut.nombre}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Instrumentos de Evaluación</label>
                                 <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                    {Object.values(instrumentosEvaluacion).map(inst => (
                                         <label key={inst.id} className="flex items-center p-1 cursor-pointer">
                                            <input type="checkbox" checked={nuevaAsociacion.instrumentoIds.includes(inst.id)} onChange={() => {
                                                const currentIds = nuevaAsociacion.instrumentoIds;
                                                const newIds = currentIds.includes(inst.id) ? currentIds.filter(id => id !== inst.id) : [...currentIds, inst.id];
                                                setNuevaAsociacion(p => ({...p, instrumentoIds: newIds}));
                                            }} className="h-4 w-4 rounded border-gray-300"/>
                                            <span className="ml-2">{inst.nombre}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                         </div>
                         <button onClick={handleAddAsociacion} className="mt-2 w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-semibold">Añadir Asociación</button>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold flex items-center"><SaveIcon className="w-5 h-5 mr-2" />Guardar</button>
                </div>
            </div>
        </div>
    );
};

const RAView: React.FC = () => {
    const { resultadosAprendizaje, criteriosEvaluacion, addToast, setResultadosAprendizaje, setCriteriosEvaluacion } = useAppContext();
    const [expandedRAs, setExpandedRAs] = useState<Set<string>>(new Set());
    const [modalState, setModalState] = useState<{ isOpen: boolean; criterio: CriterioEvaluacion | null }>({ isOpen: false, criterio: null });

    const toggleExpand = (raId: string) => {
        setExpandedRAs(prev => {
            const newSet = new Set(prev);
            newSet.has(raId) ? newSet.delete(raId) : newSet.add(raId);
            return newSet;
        });
    };
    
    return (
        <div>
            <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center"><FileTextIcon className="w-8 h-8 mr-3 text-purple-500"/>Resultados de Aprendizaje y Criterios</h1>
                    <p className="text-gray-500 mt-1">Define los RAs, sus criterios y gestiona cómo se evalúan en las distintas Unidades de Trabajo.</p>
                </div>
            </header>
            
            <div className="space-y-4">
                {/* FIX: Cast Object.values to an array of ResultadoAprendizaje to fix type errors. */}
                {(Object.values(resultadosAprendizaje) as ResultadoAprendizaje[]).sort((a, b) => a.nombre.localeCompare(b.nombre)).map((ra) => {
                    const isExpanded = expandedRAs.has(ra.id);
                    return (
                        <div key={ra.id} className="bg-white rounded-lg shadow-sm transition-all duration-300">
                            <div className="flex items-center p-4 cursor-pointer" onClick={() => toggleExpand(ra.id)}>
                                <button className="p-1 rounded-full hover:bg-gray-100">{isExpanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}</button>
                                <div className="flex-1 ml-2">
                                    <h3 className="font-bold text-gray-800">{ra.nombre}</h3>
                                    <p className="text-sm text-gray-500">{ra.descripcion}</p>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="border-t p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-sm">Criterios de Evaluación ({ra.criteriosEvaluacion.length})</h4>
                                    </div>
                                    <div className="space-y-2">
                                        {ra.criteriosEvaluacion.map(critId => {
                                            const criterio = criteriosEvaluacion[critId];
                                            if (!criterio) return <div key={critId} className="text-red-500 text-sm">Error: Criterio no encontrado (ID: {critId})</div>;
                                            return (
                                                <div key={criterio.id} className="bg-white p-3 rounded-md border flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{criterio.descripcion}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Asociado a {criterio.asociaciones.length} UT(s)</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button onClick={() => setModalState({ isOpen: true, criterio: criterio })} className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 font-semibold">
                                                            <SettingsIcon className="w-4 h-4 mr-1"/> Gestionar Asociaciones
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {ra.criteriosEvaluacion.length === 0 && <p className="text-sm text-gray-500 text-center py-2">No hay criterios definidos para este RA.</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {modalState.isOpen && modalState.criterio && <AsociacionesModal 
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, criterio: null })}
                criterio={modalState.criterio}
            />}
        </div>
    );
};

export default RAView;