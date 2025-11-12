import React, { useState, useEffect } from 'react';
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
        // Prepare data for textareas
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
                                <label className="block text-sm font-medium text-gray-700">Ponderación (%)</label>
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
    const [expandedRAs, setExpandedRAs] = useState<Set<string>>(new Set());
    const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'ra' | 'criterio' | null; data: any; parentRaId?: string | null }>({ isOpen: false, type: null, data: null });

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

    const handleCloseModal = () => {
        setModalState({ isOpen: false, type: null, data: null });
    };

    const handleSave = (data: any) => {
        if (modalState.type === 'ra') {
            setResultadosAprendizaje(prev => ({ ...prev, [data.id]: data as ResultadoAprendizaje }));
            addToast('Resultado de Aprendizaje guardado.', 'success');
        } else if (modalState.type === 'criterio' && modalState.parentRaId) {
            setCriteriosEvaluacion(prev => ({ ...prev, [data.id]: data as CriterioEvaluacion }));
            // If it's a new criterion, add its ID to the parent RA
            const parentRA = resultadosAprendizaje[modalState.parentRaId];
            if (parentRA && !parentRA.criteriosEvaluacion.includes(data.id)) {
                const updatedRA = { ...parentRA, criteriosEvaluacion: [...parentRA.criteriosEvaluacion, data.id] };
                setResultadosAprendizaje(prev => ({ ...prev, [updatedRA.id]: updatedRA }));
            }
            addToast('Criterio de Evaluación guardado.', 'success');
        }
        handleCloseModal();
    };

    const handleDelete = (type: 'ra' | 'criterio', id: string, parentRaId?: string | null) => {
        if (type === 'ra') {
            if (window.confirm(`¿Seguro que quieres eliminar este RA y todos sus criterios asociados?`)) {
                const raToDelete = resultadosAprendizaje[id];
                const criteriaIdsToDelete = raToDelete.criteriosEvaluacion;
                
                setResultadosAprendizaje(prev => {
                    const newState = { ...prev };
                    delete newState[id];
                    return newState;
                });
                setCriteriosEvaluacion(prev => {
                    const newState = { ...prev };
                    criteriaIdsToDelete.forEach(critId => delete newState[critId]);
                    return newState;
                });
                addToast('RA eliminado.', 'info');
            }
        } else if (type === 'criterio' && parentRaId) {
            if (window.confirm(`¿Seguro que quieres eliminar este criterio?`)) {
                setCriteriosEvaluacion(prev => {
                    const newState = { ...prev };
                    delete newState[id];
                    return newState;
                });
                const parentRA = resultadosAprendizaje[parentRaId];
                const updatedRA = { ...parentRA, criteriosEvaluacion: parentRA.criteriosEvaluacion.filter(critId => critId !== id) };
                setResultadosAprendizaje(prev => ({ ...prev, [updatedRA.id]: updatedRA }));
                addToast('Criterio eliminado.', 'info');
            }
        }
    };

    return (
        <div>
            <header className="flex justify-between items-center mb-6">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                        <FileTextIcon className="w-8 h-8 mr-3 text-purple-500" />
                        Gestión de Resultados de Aprendizaje
                    </h1>
                    <p className="text-gray-500 mt-1">Define la estructura de evaluación para tus exámenes prácticos.</p>
                </div>
                <button onClick={() => handleOpenModal('ra', { id: `ra_${Date.now()}`, nombre: '', descripcion: '', competencias: [], criteriosEvaluacion: [] })} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition">
                    <PlusIcon className="w-5 h-5 mr-1" /> Nuevo RA
                </button>
            </header>

            <div className="space-y-4">
                {/* FIX: Add explicit types for sort and map callbacks to resolve type inference issues. */}
                {Object.values(resultadosAprendizaje).sort((a: ResultadoAprendizaje, b: ResultadoAprendizaje) => a.nombre.localeCompare(b.nombre)).map((ra: ResultadoAprendizaje) => {
                    const isExpanded = expandedRAs.has(ra.id);
                    return (
                        <div key={ra.id} className="bg-white rounded-lg shadow-sm transition-all duration-300">
                            <div className="flex items-center p-4 cursor-pointer" onClick={() => toggleExpand(ra.id)}>
                                <button className="p-1 rounded-full hover:bg-gray-100">{isExpanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}</button>
                                <div className="flex-1 ml-2">
                                    <h3 className="font-bold text-gray-800">{ra.nombre}</h3>
                                    <p className="text-sm text-gray-500">{ra.descripcion}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal('ra', ra); }} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete('ra', ra.id); }} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="border-t p-4 bg-gray-50">
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-sm mb-1">Competencias:</h4>
                                        <p className="text-sm text-gray-600">{ra.competencias.join(', ') || 'No definidas'}</p>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-sm">Criterios de Evaluación ({ra.criteriosEvaluacion.length})</h4>
                                        <button onClick={() => handleOpenModal('criterio', { id: `crit_${Date.now()}`, descripcion: '', ponderacion: 0, indicadores: [], instrumentos: [] }, ra.id)} className="text-sm flex items-center text-blue-600 hover:text-blue-800 font-semibold"><PlusIcon className="w-4 h-4 mr-1"/>Añadir Criterio</button>
                                    </div>
                                    <div className="space-y-2">
                                        {ra.criteriosEvaluacion.map(critId => {
                                            const criterio = criteriosEvaluacion[critId];
                                            if (!criterio) return <div key={critId} className="text-red-500 text-sm">Error: Criterio no encontrado (ID: {critId})</div>;
                                            return (
                                                <div key={criterio.id} className="bg-white p-3 rounded-md border flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{criterio.descripcion}</p>
                                                        <p className="text-xs text-gray-500">Ponderación: {criterio.ponderacion}%</p>
                                                    </div>
                                                     <div className="flex items-center space-x-1">
                                                        <button onClick={() => handleOpenModal('criterio', criterio, ra.id)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"><PencilIcon className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete('criterio', criterio.id, ra.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>
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
            
            <FormModal 
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                initialData={modalState.data}
                type={modalState.type!}
            />
        </div>
    );
};

export default RAView;