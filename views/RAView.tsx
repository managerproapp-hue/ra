import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ResultadoAprendizaje, CriterioEvaluacion } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, SaveIcon, XIcon, FileTextIcon } from '../components/icons';

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData: any;
    type: 'ra' | 'criterio';
}

const FormModal: React.FC<FormModalProps> = ({ isOpen, onClose, onSave, initialData, type }) => {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        const dataForForm = { ...initialData };
        if (type === 'ra') {
            dataForForm.competencias = (initialData.competencias || []).join(', ');
        }
        if (type === 'criterio') {
            dataForForm.indicadores = (initialData.indicadores || []).join(', ');
            dataForForm.instrumentos = (initialData.instrumentos || []).join(', ');
        }
        setFormData(dataForForm);
    }, [initialData, type]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = { ...formData };
        if (type === 'ra') {
            dataToSave.competencias = formData.competencias.split(',').map((s: string) => s.trim()).filter(Boolean);
            dataToSave.ponderacion = parseInt(String(formData.ponderacion), 10) || 0;
        }
        if (type === 'criterio') {
            dataToSave.indicadores = formData.indicadores.split(',').map((s: string) => s.trim()).filter(Boolean);
            dataToSave.instrumentos = formData.instrumentos.split(',').map((s: string) => s.trim()).filter(Boolean);
            dataToSave.ponderacion = parseInt(String(formData.ponderacion), 10) || 0;
        }
        onSave(dataToSave);
    };

    const title = type === 'ra' ? (initialData.id.startsWith('ra_') ? 'Nuevo Resultado de Aprendizaje' : 'Editar Resultado de Aprendizaje') : (initialData.id.startsWith('crit_') ? 'Nuevo Criterio de Evaluación' : 'Editar Criterio de Evaluación');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon className="w-6 h-6 text-gray-600" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {type === 'ra' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Ponderación (%)</label>
                                <input type="number" name="ponderacion" value={formData.ponderacion || ''} onChange={handleChange} min="0" max="100" className="mt-1 w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Competencias (separadas por coma)</label>
                                <textarea name="competencias" value={formData.competencias} onChange={handleChange} rows={2} className="mt-1 w-full p-2 border rounded-md"></textarea>
                            </div>
                        </>
                    ) : (
                         <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} required rows={3} className="mt-1 w-full p-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Ponderación en el RA (%)</label>
                                <input type="number" name="ponderacion" value={formData.ponderacion} onChange={handleChange} required min="0" max="100" className="mt-1 w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Indicadores (separados por coma)</label>
                                <textarea name="indicadores" value={formData.indicadores} onChange={handleChange} rows={2} className="mt-1 w-full p-2 border rounded-md"></textarea>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Instrumentos (separados por coma)</label>
                                <textarea name="instrumentos" value={formData.instrumentos} onChange={handleChange} rows={2} className="mt-1 w-full p-2 border rounded-md"></textarea>
                            </div>
                        </>
                    )}
                </form>
                 <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold flex items-center"><SaveIcon className="w-5 h-5 mr-2" />Guardar</button>
                </div>
            </div>
        </div>
    );
};

const RAView: React.FC = () => {
    const { resultadosAprendizaje, setResultadosAprendizaje, criteriosEvaluacion, setCriteriosEvaluacion, addToast } = useAppContext();
    const [localRAs, setLocalRAs] = useState(resultadosAprendizaje);
    const [localCriterios, setLocalCriterios] = useState(criteriosEvaluacion);
    const [isDirty, setIsDirty] = useState(false);
    const [expandedRAs, setExpandedRAs] = useState<Set<string>>(new Set());
    const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'ra' | 'criterio' | null; data: any; parentRaId?: string | null }>({ isOpen: false, type: null, data: null });
    
    useEffect(() => {
        setLocalRAs(resultadosAprendizaje);
        setLocalCriterios(criteriosEvaluacion);
        setIsDirty(false);
    }, [resultadosAprendizaje, criteriosEvaluacion]);

    const handleRaPonderacionChange = (raId: string, value: string) => {
        const ponderacion = Math.max(0, Math.min(100, parseInt(value) || 0));
        setLocalRAs(prev => ({ ...prev, [raId]: { ...prev[raId], ponderacion } }));
        setIsDirty(true);
    };

    const handleCriterioPonderacionChange = (criterioId: string, value: string) => {
        const ponderacion = Math.max(0, Math.min(100, parseInt(value) || 0));
        setLocalCriterios(prev => ({ ...prev, [criterioId]: { ...prev[criterioId], ponderacion } }));
        setIsDirty(true);
    };
    
    const handleSaveAll = () => {
        setResultadosAprendizaje(localRAs);
        setCriteriosEvaluacion(localCriterios);
        setIsDirty(false);
        addToast('Ponderaciones guardadas con éxito.', 'success');
    };

    const totalRaPonderacion = useMemo(() => {
        // FIX: Add explicit type to reduce callback argument to fix type inference issue.
        return Object.values(localRAs).reduce((sum: number, ra: ResultadoAprendizaje) => sum + (ra.ponderacion || 0), 0);
    }, [localRAs]);

    const totalCriterioPonderacion = useMemo(() => {
        const totals: Record<string, number> = {};
        // FIX: Add explicit type to forEach callback argument to fix type inference issue.
        Object.values(localRAs).forEach((ra: ResultadoAprendizaje) => {
            totals[ra.id] = ra.criteriosEvaluacion.reduce((sum, critId) => sum + (localCriterios[critId]?.ponderacion || 0), 0);
        });
        return totals;
    }, [localRAs, localCriterios]);

    const getPonderacionColor = (total: number) => {
        if (total > 100) return 'text-red-600';
        if (total < 100) return 'text-yellow-600';
        return 'text-green-600';
    };

    const toggleExpand = (raId: string) => {
        setExpandedRAs(prev => {
            const newSet = new Set(prev);
            newSet.has(raId) ? newSet.delete(raId) : newSet.add(raId);
            return newSet;
        });
    };

    const handleOpenModal = (type: 'ra' | 'criterio', data: any, parentRaId: string | null = null) => {
        setModalState({ isOpen: true, type, data, parentRaId });
    };

    const handleCloseModal = () => setModalState({ isOpen: false, type: null, data: null });
    
    const handleSaveModal = (data: any) => {
        if (modalState.type === 'ra') {
            setLocalRAs(prev => ({ ...prev, [data.id]: data as ResultadoAprendizaje }));
        } else if (modalState.type === 'criterio' && modalState.parentRaId) {
            setLocalCriterios(prev => ({ ...prev, [data.id]: data as CriterioEvaluacion }));
            const parentRA = localRAs[modalState.parentRaId];
            if (parentRA && !parentRA.criteriosEvaluacion.includes(data.id)) {
                const updatedRA = { ...parentRA, criteriosEvaluacion: [...parentRA.criteriosEvaluacion, data.id] };
                setLocalRAs(prev => ({ ...prev, [updatedRA.id]: updatedRA }));
            }
        }
        setIsDirty(true);
        handleCloseModal();
    };


    const handleDeleteLocal = (type: 'ra' | 'criterio', id: string, parentRaId?: string | null) => {
        if (type === 'ra') {
            if (window.confirm(`¿Seguro que quieres eliminar este RA y todos sus criterios asociados?`)) {
                const raToDelete = localRAs[id];
                const criteriaIdsToDelete = raToDelete.criteriosEvaluacion;
                setLocalRAs(prev => { const newState = { ...prev }; delete newState[id]; return newState; });
                setLocalCriterios(prev => { const newState = { ...prev }; criteriaIdsToDelete.forEach(critId => delete newState[critId]); return newState; });
                setIsDirty(true);
            }
        } else if (type === 'criterio' && parentRaId) {
            if (window.confirm(`¿Seguro que quieres eliminar este criterio?`)) {
                setLocalCriterios(prev => { const newState = { ...prev }; delete newState[id]; return newState; });
                const parentRA = localRAs[parentRaId];
                const updatedRA = { ...parentRA, criteriosEvaluacion: parentRA.criteriosEvaluacion.filter(critId => critId !== id) };
                setLocalRAs(prev => ({ ...prev, [updatedRA.id]: updatedRA }));
                setIsDirty(true);
            }
        }
    };

    return (
        <div>
            <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center"><FileTextIcon className="w-8 h-8 mr-3 text-purple-500"/>Configuración de Ponderaciones</h1>
                    <p className="text-gray-500 mt-1">Asigna el peso de cada RA en la nota final y el peso de cada criterio dentro de su RA.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <span className="text-sm font-bold text-gray-600">PESO TOTAL DE RAs</span>
                        <p className={`text-2xl font-bold ${getPonderacionColor(totalRaPonderacion)}`}>
                            {totalRaPonderacion}% / 100%
                        </p>
                    </div>
                     <button onClick={() => handleOpenModal('ra', { id: `ra_${Date.now()}`, nombre: '', descripcion: '', ponderacion: 0, competencias: [], criteriosEvaluacion: [] })} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition">
                        <PlusIcon className="w-5 h-5 mr-1" /> Nuevo RA
                    </button>
                    <button onClick={handleSaveAll} disabled={!isDirty} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <SaveIcon className="w-5 h-5 mr-1" /> Guardar Cambios
                    </button>
                </div>
            </header>
            
            <div className="space-y-4">
                {/* FIX: Add explicit types for sort and map callback arguments to fix type inference issues. */}
                {Object.values(localRAs).sort((a: ResultadoAprendizaje, b: ResultadoAprendizaje) => a.nombre.localeCompare(b.nombre)).map((ra: ResultadoAprendizaje) => {
                    const isExpanded = expandedRAs.has(ra.id);
                    return (
                        <div key={ra.id} className="bg-white rounded-lg shadow-sm transition-all duration-300">
                            <div className="flex items-center p-4">
                                <button className="p-1 rounded-full hover:bg-gray-100" onClick={() => toggleExpand(ra.id)}>{isExpanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}</button>
                                <div className="flex-1 ml-2 cursor-pointer" onClick={() => toggleExpand(ra.id)}>
                                    <h3 className="font-bold text-gray-800">{ra.nombre}</h3>
                                    <p className="text-sm text-gray-500">{ra.descripcion}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-2">
                                        <label className="text-sm font-medium">Peso (%):</label>
                                        <input 
                                            type="number"
                                            value={ra.ponderacion || ''}
                                            onChange={(e) => handleRaPonderacionChange(ra.id, e.target.value)}
                                            className="w-20 p-1.5 text-center border rounded-md"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                    <button onClick={() => handleOpenModal('ra', ra)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteLocal('ra', ra.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="border-t p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-sm">Criterios de Evaluación ({ra.criteriosEvaluacion.length})</h4>
                                        <button onClick={() => handleOpenModal('criterio', { id: `crit_${Date.now()}`, descripcion: '', ponderacion: 0, indicadores: [], instrumentos: [] }, ra.id)} className="text-sm flex items-center text-blue-600 hover:text-blue-800 font-semibold"><PlusIcon className="w-4 h-4 mr-1"/>Añadir Criterio</button>
                                    </div>
                                    <div className="space-y-2">
                                        {ra.criteriosEvaluacion.map(critId => {
                                            const criterio = localCriterios[critId];
                                            if (!criterio) return <div key={critId} className="text-red-500 text-sm">Error: Criterio no encontrado (ID: {critId})</div>;
                                            return (
                                                <div key={criterio.id} className="bg-white p-3 rounded-md border flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{criterio.descripcion}</p>
                                                    </div>
                                                     <div className="flex items-center space-x-2">
                                                        <label className="text-xs font-medium">Peso en RA (%):</label>
                                                        <input 
                                                            type="number"
                                                            value={criterio.ponderacion || ''}
                                                            onChange={(e) => handleCriterioPonderacionChange(criterio.id, e.target.value)}
                                                            className="w-20 p-1.5 text-center border rounded-md"
                                                            min="0" max="100"
                                                        />
                                                        <button onClick={() => handleOpenModal('criterio', criterio, ra.id)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"><PencilIcon className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteLocal('criterio', criterio.id, ra.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {ra.criteriosEvaluacion.length === 0 && <p className="text-sm text-gray-500 text-center py-2">No hay criterios definidos para este RA.</p>}
                                    </div>
                                    <div className={`text-right font-bold mt-2 ${getPonderacionColor(totalCriterioPonderacion[ra.id])}`}>
                                        Total Criterios: {totalCriterioPonderacion[ra.id]}% / 100%
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {modalState.isOpen && <FormModal 
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                onSave={handleSaveModal}
                initialData={modalState.data}
                type={modalState.type!}
            />}
        </div>
    );
};

export default RAView;