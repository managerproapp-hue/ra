import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ResultadoAprendizaje, CriterioEvaluacion, AsociacionCriterio, UnidadTrabajo, InstrumentoEvaluacion } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, SaveIcon, XIcon, FileTextIcon, SettingsIcon } from '../components/icons';

// --- MODAL ASOCIACIONES ---
interface AsociacionesModalProps {
    isOpen: boolean;
    onClose: () => void;
    criterio: CriterioEvaluacion;
}

const AsociacionesModal: React.FC<AsociacionesModalProps> = ({ isOpen, onClose, criterio }) => {
    const { unidadesTrabajo, instrumentosEvaluacion, setCriteriosEvaluacion, addToast } = useAppContext();
    const [asociaciones, setAsociaciones] = useState<AsociacionCriterio[]>(criterio.asociaciones);
    const [nuevaAsociacion, setNuevaAsociacion] = useState<{ utId: string; instrumentoIds: string[] }>({ utId: '', instrumentoIds: [] });

    useEffect(() => { setAsociaciones(criterio.asociaciones || []); }, [criterio]);

    if (!isOpen) return null;
    
    const handleAddAsociacion = () => {
        if (nuevaAsociacion.utId && nuevaAsociacion.instrumentoIds.length > 0) {
            setAsociaciones([...asociaciones, { ...nuevaAsociacion, id: `asoc_${Date.now()}` }]);
            setNuevaAsociacion({ utId: '', instrumentoIds: [] });
        } else {
            addToast('Selecciona una UT y al menos un instrumento.', 'error');
        }
    };
    
    const handleDeleteAsociacion = (id: string) => setAsociaciones(asociaciones.filter(a => a.id !== id));

    const handleSave = () => {
        setCriteriosEvaluacion(prev => ({ ...prev, [criterio.id]: { ...criterio, asociaciones: asociaciones } }));
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
                                    {asoc.instrumentoIds.map(instId => <span key={instId} className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">{instrumentosEvaluacion[instId]?.nombre || 'Inválido'}</span>)}
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
                                    {(Object.values(unidadesTrabajo) as UnidadTrabajo[]).map(ut => <option key={ut.id} value={ut.id}>{ut.nombre}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Instrumentos de Evaluación</label>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">{(Object.values(instrumentosEvaluacion) as InstrumentoEvaluacion[]).map(inst => (<label key={inst.id} className="flex items-center p-1 cursor-pointer"><input type="checkbox" checked={nuevaAsociacion.instrumentoIds.includes(inst.id)} onChange={() => setNuevaAsociacion(p => ({...p, instrumentoIds: p.instrumentoIds.includes(inst.id) ? p.instrumentoIds.filter(id => id !== inst.id) : [...p.instrumentoIds, inst.id]}))} className="h-4 w-4 rounded border-gray-300"/><span className="ml-2">{inst.nombre}</span></label>))}</div>
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

// --- MODAL RA ---
const RAModal: React.FC<{ isOpen: boolean; onClose: () => void; initialData: Partial<ResultadoAprendizaje> | null }> = ({ isOpen, onClose, initialData }) => {
    const { saveRA } = useAppContext();
    const [data, setData] = useState<Partial<ResultadoAprendizaje>>({});
    
    useEffect(() => { setData(initialData || {}); }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setData({ ...data, [e.target.name]: e.target.value });
    const handleCompetenciasChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setData({ ...data, competencias: e.target.value.split('\n') });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveRA(data, data.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">{data.id ? 'Editar' : 'Nuevo'} RA</h3>
                <div className="space-y-4">
                    <input name="nombre" value={data.nombre || ''} onChange={handleChange} placeholder="Nombre del RA" required className="w-full p-2 border rounded" />
                    <textarea name="descripcion" value={data.descripcion || ''} onChange={handleChange} placeholder="Descripción" rows={2} className="w-full p-2 border rounded" />
                    <textarea value={data.competencias?.join('\n') || ''} onChange={handleCompetenciasChange} placeholder="Competencias (una por línea)" rows={3} className="w-full p-2 border rounded" />
                </div>
                <div className="flex justify-end space-x-2 mt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button></div>
            </form>
        </div>
    );
};

// --- MODAL CRITERIO ---
const CriterioModal: React.FC<{ isOpen: boolean; onClose: () => void; initialData: Partial<CriterioEvaluacion> | null; raId: string }> = ({ isOpen, onClose, initialData, raId }) => {
    const { saveCriterio } = useAppContext();
    const [data, setData] = useState<Partial<CriterioEvaluacion>>({});

    useEffect(() => { setData(initialData || {}); }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setData({ ...data, [e.target.name]: e.target.name === 'ponderacion' ? parseInt(e.target.value) : e.target.value });
    const handleIndicadoresChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setData({ ...data, indicadores: e.target.value.split('\n') });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveCriterio(data, raId, data.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">{data.id ? 'Editar' : 'Nuevo'} Criterio</h3>
                <div className="space-y-4">
                    <textarea name="descripcion" value={data.descripcion || ''} onChange={handleChange} placeholder="Descripción del criterio" required rows={3} className="w-full p-2 border rounded" />
                    <input type="number" name="ponderacion" value={data.ponderacion || ''} onChange={handleChange} placeholder="Ponderación (%)" className="w-full p-2 border rounded" />
                    <textarea value={data.indicadores?.join('\n') || ''} onChange={handleIndicadoresChange} placeholder="Indicadores (uno por línea)" rows={3} className="w-full p-2 border rounded" />
                </div>
                <div className="flex justify-end space-x-2 mt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button></div>
            </form>
        </div>
    );
};


const RAView: React.FC = () => {
    const { resultadosAprendizaje, criteriosEvaluacion, deleteRA, deleteCriterio } = useAppContext();
    const [expandedRAs, setExpandedRAs] = useState<Set<string>>(new Set());
    const [asociacionesModal, setAsociacionesModal] = useState<{ isOpen: boolean; criterio: CriterioEvaluacion | null }>({ isOpen: false, criterio: null });
    const [raModal, setRaModal] = useState<{ isOpen: boolean; data: Partial<ResultadoAprendizaje> | null }>({ isOpen: false, data: null });
    const [criterioModal, setCriterioModal] = useState<{ isOpen: boolean; data: Partial<CriterioEvaluacion> | null, raId: string }>({ isOpen: false, data: null, raId: '' });

    const toggleExpand = (raId: string) => {
        setExpandedRAs(prev => {
            const newSet = new Set(prev);
            newSet.has(raId) ? newSet.delete(raId) : newSet.add(raId);
            return newSet;
        });
    };
    
    const handleDeleteRA = (ra: ResultadoAprendizaje) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el Resultado de Aprendizaje "${ra.nombre}"?`)) {
            if (window.confirm(`¡ACCIÓN IRREVERSIBLE!\n\nEsto eliminará permanentemente el RA y sus ${ra.criteriosEvaluacion.length} criterios asociados.\n\n¿Estás SEGURO de que quieres continuar?`)) {
                deleteRA(ra.id);
            }
        }
    };
    
    return (
        <div>
            <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center"><FileTextIcon className="w-8 h-8 mr-3 text-purple-500"/>Resultados de Aprendizaje y Criterios</h1>
                    <p className="text-gray-500 mt-1">Define los RAs, sus criterios y gestiona cómo se evalúan en las distintas Unidades de Trabajo.</p>
                </div>
                <button onClick={() => setRaModal({ isOpen: true, data: null })} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"><PlusIcon className="w-5 h-5 mr-1" /> Nuevo RA</button>
            </header>
            
            <div className="space-y-4">
                {(Object.values(resultadosAprendizaje) as ResultadoAprendizaje[]).sort((a, b) => a.nombre.localeCompare(b.nombre)).map((ra) => {
                    const isExpanded = expandedRAs.has(ra.id);
                    return (
                        <div key={ra.id} className="bg-white rounded-lg shadow-sm transition-all duration-300">
                            <div className="flex items-center p-4">
                                <button onClick={() => toggleExpand(ra.id)} className="p-1 rounded-full hover:bg-gray-100">{isExpanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}</button>
                                <div className="flex-1 ml-2 cursor-pointer" onClick={() => toggleExpand(ra.id)}>
                                    <h3 className="font-bold text-gray-800">{ra.nombre}</h3>
                                    <p className="text-sm text-gray-500">{ra.descripcion}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => setRaModal({ isOpen: true, data: ra })} className="p-2 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteRA(ra)} className="p-2 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="border-t p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-sm">Criterios de Evaluación ({ra.criteriosEvaluacion.length})</h4>
                                        <button onClick={() => setCriterioModal({ isOpen: true, data: null, raId: ra.id })} className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"><PlusIcon className="w-3 h-3 mr-1"/>Nuevo Criterio</button>
                                    </div>
                                    <div className="space-y-2">
                                        {ra.criteriosEvaluacion.map(critId => {
                                            const criterio = criteriosEvaluacion[critId];
                                            if (!criterio) return null;
                                            return (
                                                <div key={criterio.id} className="bg-white p-3 rounded-md border flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{criterio.descripcion}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Asociado a {criterio.asociaciones.length} UT(s)</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button onClick={() => setAsociacionesModal({ isOpen: true, criterio: criterio })} className="flex items-center text-sm bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 font-semibold"><SettingsIcon className="w-4 h-4 mr-1"/> Asociaciones</button>
                                                        <button onClick={() => setCriterioModal({ isOpen: true, data: criterio, raId: ra.id })} className="p-2 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4"/></button>
                                                        <button onClick={() => deleteCriterio(criterio.id, ra.id)} className="p-2 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {ra.criteriosEvaluacion.length === 0 && <p className="text-sm text-gray-500 text-center py-2">No hay criterios definidos.</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {asociacionesModal.isOpen && <AsociacionesModal isOpen={asociacionesModal.isOpen} onClose={() => setAsociacionesModal({ isOpen: false, criterio: null })} criterio={asociacionesModal.criterio!} />}
            {raModal.isOpen && <RAModal isOpen={raModal.isOpen} onClose={() => setRaModal({ isOpen: false, data: null })} initialData={raModal.data} />}
            {criterioModal.isOpen && <CriterioModal isOpen={criterioModal.isOpen} onClose={() => setCriterioModal({ isOpen: false, data: null, raId: '' })} initialData={criterioModal.data} raId={criterioModal.raId} />}
        </div>
    );
};

export default RAView;