import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { UnidadTrabajo, CriterioEvaluacion } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, SaveIcon, XIcon, BookOpenIcon, ChevronDownIcon, ChevronRightIcon } from '../components/icons';

interface UTFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<UnidadTrabajo>) => void;
    initialData: Partial<UnidadTrabajo>;
}

const UTFormModal: React.FC<UTFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState(initialData);

    React.useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{initialData.id ? 'Editar' : 'Nueva'} Unidad de Trabajo</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon className="w-6 h-6 text-gray-600" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold flex items-center"><SaveIcon className="w-5 h-5 mr-2" />Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UTView: React.FC = () => {
    const { unidadesTrabajo, setUnidadesTrabajo, criteriosEvaluacion, resultadosAprendizaje, addToast } = useAppContext();
    const [modalState, setModalState] = useState<{ isOpen: boolean; data: Partial<UnidadTrabajo> | null }>({ isOpen: false, data: null });
    const [expandedUTs, setExpandedUTs] = useState<Set<string>>(new Set());

    const utAsociaciones = useMemo(() => {
        const map = new Map<string, { raNombre: string; criterioDesc: string; }[]>();
        // FIX: Cast Object.values to an array of UnidadTrabajo to fix type errors.
        (Object.values(unidadesTrabajo) as UnidadTrabajo[]).forEach(ut => map.set(ut.id, []));
        
        // FIX: Cast Object.values to an array of CriterioEvaluacion to fix type errors.
        (Object.values(criteriosEvaluacion) as CriterioEvaluacion[]).forEach(criterio => {
            criterio.asociaciones.forEach(asoc => {
                if(map.has(asoc.utId)) {
                    map.get(asoc.utId)!.push({
                        raNombre: resultadosAprendizaje[criterio.raId!]?.nombre || 'RA Desconocido',
                        criterioDesc: criterio.descripcion
                    });
                }
            });
        });
        return map;
    }, [unidadesTrabajo, criteriosEvaluacion, resultadosAprendizaje]);

    const toggleExpandUT = (utId: string) => {
        setExpandedUTs(prev => {
            const newSet = new Set(prev);
            newSet.has(utId) ? newSet.delete(utId) : newSet.add(utId);
            return newSet;
        });
    };

    const handleOpenModal = (data: Partial<UnidadTrabajo> | null) => {
        setModalState({ isOpen: true, data: data || { id: `ut_${Date.now()}`, nombre: '', descripcion: '' } });
    };

    const handleCloseModal = () => setModalState({ isOpen: false, data: null });

    const handleSave = (data: Partial<UnidadTrabajo>) => {
        if (!data.id) return;
        setUnidadesTrabajo(prev => ({ ...prev, [data.id!]: data as UnidadTrabajo }));
        addToast('Unidad de Trabajo guardada.', 'success');
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Seguro que quieres eliminar esta Unidad de Trabajo? Las asociaciones existentes en los criterios se mantendrán, pero apuntarán a una UT eliminada.')) {
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
                    <p className="text-gray-500 mt-1">Define las unidades didácticas y consulta los criterios asociados a ellas.</p>
                </div>
                <button onClick={() => handleOpenModal(null)} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"><PlusIcon className="w-5 h-5 mr-1" /> Nueva UT</button>
            </header>
            <div className="space-y-4">
                {Object.values(unidadesTrabajo || {}).map((ut: UnidadTrabajo) => {
                    const isExpanded = expandedUTs.has(ut.id);
                    const asociaciones = utAsociaciones.get(ut.id) || [];
                    return (
                        <div key={ut.id} className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start flex-1">
                                    <button onClick={() => toggleExpandUT(ut.id)} className="p-1 mr-2 mt-1 rounded-full hover:bg-gray-100">
                                        {isExpanded ? <ChevronDownIcon className="w-5 h-5 text-gray-600"/> : <ChevronRightIcon className="w-5 h-5 text-gray-600"/>}
                                    </button>
                                    <div onClick={() => toggleExpandUT(ut.id)} className="cursor-pointer flex-1">
                                        <h3 className="font-bold text-lg text-gray-800">{ut.nombre}</h3>
                                        <p className="text-sm text-gray-600">{ut.descripcion}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => handleOpenModal(ut)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(ut.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="mt-3 pt-3 border-t ml-10">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Criterios Evaluados en esta UT ({asociaciones.length})</h4>
                                    <div className="space-y-2">
                                        {asociaciones.map((asoc, index) => (
                                            <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                                                <p><span className="font-semibold">{asoc.raNombre}:</span> {asoc.criterioDesc}</p>
                                            </div>
                                        ))}
                                        {asociaciones.length === 0 && <p className="text-xs text-gray-500">Esta UT no está asociada a ningún criterio de evaluación.</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {modalState.isOpen && <UTFormModal isOpen={modalState.isOpen} onClose={handleCloseModal} onSave={handleSave} initialData={modalState.data!} />}
        </div>
    );
};

export default UTView;