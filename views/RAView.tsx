import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ResultadoAprendizaje, CriterioEvaluacion, AsociacionCriterio, UnidadTrabajo, InstrumentoEvaluacion, EvaluationActivity } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, SaveIcon, XIcon, FileTextIcon, SettingsIcon } from '../components/icons';

// Modal for RA/Criterio Form
interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData: any;
    type: 'ra' | 'criterio';
}

const FormModal: React.FC<FormModalProps> = ({ isOpen, onClose, onSave, initialData, type }) => {
    const [formData, setFormData] = useState(() => {
        const dataForForm = { ...initialData };
        if (type === 'ra') {
            dataForForm.competencias = (initialData.competencias || []).join(', ');
        }
        if (type === 'criterio') {
            dataForForm.indicadores = (initialData.indicadores || []).join(', ');
        }
        return dataForForm;
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = { ...formData };
        if (type === 'ra') {
            dataToSave.competencias = (formData.competencias || '').split(',').map((s: string) => s.trim()).filter(Boolean);
            dataToSave.ponderacion = parseInt(String(formData.ponderacion), 10) || 0;
        }
        if (type === 'criterio') {
            dataToSave.indicadores = (formData.indicadores || '').split(',').map((s: string) => s.trim()).filter(Boolean);
            dataToSave.ponderacion = parseInt(String(formData.ponderacion), 10) || 0;
        }
        onSave(dataToSave);
    };
    
    const title = type === 'ra' ? (initialData.id.startsWith('ra_') ? 'Nuevo RA' : 'Editar RA') : (initialData.id.startsWith('crit_') ? 'Nuevo Criterio' : 'Editar Criterio');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     {type === 'ra' ? (
                        <>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre del RA" required className="w-full p-2 border rounded-md" />
                            <input type="number" name="ponderacion" value={formData.ponderacion || ''} onChange={handleChange} placeholder="Ponderación (%)" min="0" max="100" className="w-full p-2 border rounded-md" />
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción" rows={3} className="w-full p-2 border rounded-md"></textarea>
                            <textarea name="competencias" value={formData.competencias} onChange={handleChange} placeholder="Competencias (separadas por coma)" rows={2} className="w-full p-2 border rounded-md"></textarea>
                        </>
                    ) : (
                         <>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción del Criterio" required rows={3} className="w-full p-2 border rounded-md" />
                            <input type="number" name="ponderacion" value={formData.ponderacion} onChange={handleChange} placeholder="Ponderación en el RA (%)" required min="0" max="100" className="w-full p-2 border rounded-md" />
                            <textarea name="indicadores" value={formData.indicadores} onChange={handleChange} placeholder="Indicadores (separados por coma)" rows={2} className="w-full p-2 border rounded-md"></textarea>
                        </>
                    )}
                    <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Guardar</button></div>
                </form>
            </div>
        </div>
    );
};

// Modal for Associations
interface AsociacionesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (criterio: CriterioEvaluacion) => void;
    criterio: CriterioEvaluacion;
}

const AsociacionesModal: React.FC<AsociacionesModalProps> = ({ isOpen, onClose, onSave, criterio }) => {
    const { unidadesTrabajo, instrumentosEvaluacion } = useAppContext();
    const [asociaciones, setAsociaciones] = useState<AsociacionCriterio[]>(criterio.asociaciones || []);
    const [selectedUT, setSelectedUT] = useState('');
    const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());

    if (!isOpen) return null;

    const getActivityInfo = (activityId: string) => {
        // FIX: Cast Object.values to InstrumentoEvaluacion[] to correctly type `inst`.
        for (const inst of Object.values(instrumentosEvaluacion) as InstrumentoEvaluacion[]) {
            const activity = inst.activities.find(act => act.id === activityId);
            if (activity) {
                return {
                    instrumentName: inst.nombre,
                    activityName: activity.name,
                    trimester: activity.trimester
                };
            }
        }
        return null;
    };

    const handleAddAsociacion = () => {
        if (!selectedUT || selectedActivities.size === 0) {
            alert('Debes seleccionar una Unidad de Trabajo y al menos una actividad de evaluación.');
            return;
        }
        const newAsociacion: AsociacionCriterio = {
            id: `asoc_${criterio.id}_${Date.now()}`,
            utId: selectedUT,
            activityIds: Array.from(selectedActivities),
        };
        setAsociaciones(prev => [...prev, newAsociacion]);
        setSelectedUT('');
        setSelectedActivities(new Set());
    };
    
    const handleRemoveAsociacion = (id: string) => {
        setAsociaciones(prev => prev.filter(a => a.id !== id));
    };

    const handleToggleActivity = (id: string) => {
        setSelectedActivities(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };
    
    const handleSaveChanges = () => {
        onSave({ ...criterio, asociaciones });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-2">Gestionar Asociaciones</h3>
                <p className="text-sm text-gray-600 mb-4 truncate">para: {criterio.descripcion}</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto">
                    {/* Add new association */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h4 className="font-semibold mb-2">Nueva Asociación</h4>
                        <div className="space-y-4">
                             <div>
                                <label className="text-sm font-medium">1. Unidad de Trabajo</label>
                                <select value={selectedUT} onChange={e => setSelectedUT(e.target.value)} className="w-full p-2 mt-1 border rounded bg-white">
                                    <option value="">Seleccionar UT...</option>
                                    {Object.values(unidadesTrabajo).map((ut: UnidadTrabajo) => <option key={ut.id} value={ut.id}>{ut.nombre}</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="text-sm font-medium">2. Actividades de Evaluación</label>
                                <div className="mt-1 space-y-2 max-h-40 overflow-y-auto border p-2 rounded bg-white">
                                    {/* FIX: Cast Object.values to InstrumentoEvaluacion[] to correctly type `inst`. */}
                                    {(Object.values(instrumentosEvaluacion) as InstrumentoEvaluacion[]).map(inst => (
                                        <div key={inst.id}>
                                            <h5 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">{inst.nombre}</h5>
                                            <div className="pl-2 space-y-1 mt-1">
                                                {inst.activities.map(activity => (
                                                    <label key={activity.id} className="flex items-center text-sm p-1 rounded hover:bg-gray-50 cursor-pointer">
                                                        <input type="checkbox" checked={selectedActivities.has(activity.id)} onChange={() => handleToggleActivity(activity.id)} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                                        {activity.name} ({activity.trimester.toUpperCase()})
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                             <button onClick={handleAddAsociacion} className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50" disabled={!selectedUT || selectedActivities.size === 0}>
                                <PlusIcon className="w-5 h-5 inline mr-1"/> Añadir Asociación
                             </button>
                        </div>
                    </div>
                    {/* List of current associations */}
                    <div className="overflow-y-auto pr-2">
                        <h4 className="font-semibold mb-2">Asociaciones Actuales ({asociaciones.length})</h4>
                        <div className="space-y-2">
                            {asociaciones.map(asoc => (
                                <div key={asoc.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-sm text-blue-800">{unidadesTrabajo[asoc.utId]?.nombre || 'UT Eliminada'}</p>
                                        <button onClick={() => handleRemoveAsociacion(asoc.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {asoc.activityIds.map(id => {
                                            const info = getActivityInfo(id);
                                            return (
                                                <span key={id} className="text-xs bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                                                    {info ? `${info.instrumentName}: ${info.activityName}` : 'ID Inválido'}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {asociaciones.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No hay asociaciones para este criterio.</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                    <button onClick={handleSaveChanges} className="px-4 py-2 bg-green-600 text-white rounded-md">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};

const RAView: React.FC = () => {
    const { 
        resultadosAprendizaje, 
        criteriosEvaluacion, 
        setCriteriosEvaluacion, 
        addToast, 
        unidadesTrabajo, 
        instrumentosEvaluacion,
        handleSaveRA,
        handleDeleteRA,
        handleSaveCriterio,
        handleDeleteCriterio
    } = useAppContext();
    const [expandedRAs, setExpandedRAs] = useState<Set<string>>(new Set());
    
    const [formModalState, setFormModalState] = useState<{ isOpen: boolean; type: 'ra' | 'criterio' | null; data: any; parentRaId?: string | null }>({ isOpen: false, type: null, data: null });
    const [asocModalState, setAsocModalState] = useState<{isOpen: boolean; criterio: CriterioEvaluacion | null}>({isOpen: false, criterio: null});

    const activityInfoMap = useMemo(() => {
        const map = new Map<string, { instrumentName: string, activityName: string, trimester: 't1' | 't2' }>();
        for (const inst of Object.values(instrumentosEvaluacion) as InstrumentoEvaluacion[]) {
            for (const act of inst.activities) {
                map.set(act.id, { instrumentName: inst.nombre, activityName: act.name, trimester: act.trimester });
            }
        }
        return map;
    }, [instrumentosEvaluacion]);

    const handleOpenFormModal = (type: 'ra' | 'criterio', data: any, parentRaId: string | null = null) => {
        setFormModalState({ isOpen: true, type, data, parentRaId });
    };

    const handleCloseFormModal = () => setFormModalState({ isOpen: false, type: null, data: null });
    
    const handleSaveFormModal = (data: any) => {
        const { type, parentRaId } = formModalState;
        
        if (type === 'ra') {
            handleSaveRA(data as ResultadoAprendizaje);
        } else if (type === 'criterio' && parentRaId) {
            handleSaveCriterio(data as CriterioEvaluacion, parentRaId);
        }
        handleCloseFormModal();
    };

    const handleDelete = (type: 'ra' | 'criterio', id: string, parentRaId?: string | null) => {
         if (type === 'ra') {
            const ra = resultadosAprendizaje[id];
            if (!ra) return;
            if (window.confirm(`¿Estás seguro de que quieres eliminar el RA "${ra.nombre}"?`)) {
                 if (window.confirm(`¡ATENCIÓN! Esta acción es irreversible y también eliminará todos sus criterios de evaluación. ¿Confirmas la eliminación?`)) {
                    handleDeleteRA(id);
                }
            }
        } else if (type === 'criterio' && parentRaId) {
            const criterio = criteriosEvaluacion[id];
            if (!criterio) return;
             if (window.confirm(`¿Estás seguro de que quieres eliminar el criterio "${criterio.descripcion.substring(0, 30)}..."?`)) {
                handleDeleteCriterio(id, parentRaId);
            }
        }
    };

    const toggleExpand = (raId: string) => {
        setExpandedRAs(prev => {
            const newSet = new Set(prev);
            newSet.has(raId) ? newSet.delete(raId) : newSet.add(raId);
            return newSet;
        });
    };

    const handleSaveAsociaciones = (criterio: CriterioEvaluacion) => {
        setCriteriosEvaluacion(prev => ({...prev, [criterio.id]: criterio}));
        addToast('Asociaciones guardadas.', 'success');
        setAsocModalState({isOpen: false, criterio: null});
    };

    return (
        <div>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center"><FileTextIcon className="w-8 h-8 mr-3 text-purple-500"/>Resultados de Aprendizaje y Criterios</h1>
                    <p className="text-gray-500 mt-1">Define y gestiona la estructura académica de RAs, criterios y sus asociaciones.</p>
                </div>
                <button onClick={() => handleOpenFormModal('ra', { id: `ra_${Date.now()}`, nombre: '', descripcion: '', ponderacion: 0, competencias: [], criteriosEvaluacion: [] })} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition">
                    <PlusIcon className="w-5 h-5 mr-1" /> Nuevo RA
                </button>
            </header>
            
            <div className="space-y-4">
                {(Object.values(resultadosAprendizaje) as ResultadoAprendizaje[]).sort((a, b) => a.nombre.localeCompare(b.nombre)).map((ra) => {
                    const isExpanded = expandedRAs.has(ra.id);
                    return (
                        <div key={ra.id} className="bg-white rounded-lg shadow-sm">
                            <div className="flex items-center p-4">
                                <button className="p-1" onClick={() => toggleExpand(ra.id)}>{isExpanded ? <ChevronDownIcon/> : <ChevronRightIcon/>}</button>
                                <div className="flex-1 ml-2"><h3 className="font-bold">{ra.nombre}</h3><p className="text-sm text-gray-500">{ra.descripcion}</p></div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => handleOpenFormModal('ra', ra)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDelete('ra', ra.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="border-t p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-2"><h4 className="font-semibold text-sm">Criterios de Evaluación</h4> <button onClick={() => handleOpenFormModal('criterio', { id: `crit_${Date.now()}`, descripcion: '', ponderacion: 0, indicadores: [], asociaciones: [] }, ra.id)} className="text-sm flex items-center text-blue-600"><PlusIcon className="w-4 h-4"/>Añadir Criterio</button></div>
                                    <div className="space-y-2">
                                        {(ra.criteriosEvaluacion || []).map(critId => {
                                            const criterio = criteriosEvaluacion[critId];
                                            if (!criterio) return null;
                                            const asociaciones = criterio.asociaciones || [];
                                            return (
                                                <div key={criterio.id} className="bg-white p-3 rounded-md border">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-sm font-medium flex-1 pr-4">{criterio.descripcion}</p>
                                                        <div className="flex items-center space-x-1 flex-shrink-0">
                                                            <button onClick={() => setAsocModalState({isOpen: true, criterio})} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Asociaciones ({asociaciones.length})</button>
                                                            <button onClick={() => handleOpenFormModal('criterio', criterio, ra.id)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                                                            <button onClick={() => handleDelete('criterio', criterio.id, ra.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-50 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t text-xs">
                                                        {asociaciones.map(asoc => (
                                                            <div key={asoc.id} className="flex gap-2 items-center">
                                                                <span className="font-bold">{unidadesTrabajo[asoc.utId]?.nombre}:</span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {(asoc.activityIds || []).map(id => {
                                                                        const info = activityInfoMap.get(id);
                                                                        return <span key={id} className="bg-gray-200 px-1.5 rounded">{info ? `${info.instrumentName}: ${info.activityName}` : 'Inválido'}</span>
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {asociaciones.length === 0 && <span className="text-gray-400">Sin asociaciones.</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {formModalState.isOpen && <FormModal isOpen={formModalState.isOpen} onClose={handleCloseFormModal} onSave={handleSaveFormModal} initialData={formModalState.data} type={formModalState.type!} />}
            {asocModalState.isOpen && <AsociacionesModal isOpen={asocModalState.isOpen} onClose={() => setAsocModalState({isOpen: false, criterio: null})} onSave={handleSaveAsociaciones} criterio={asocModalState.criterio!} />}
        </div>
    );
};

export default RAView;