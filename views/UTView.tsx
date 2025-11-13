import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { UnidadTrabajo, CriterioEvaluacion, ResultadoAprendizaje } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, SaveIcon, XIcon, BookOpenIcon, ChevronDownIcon, ChevronRightIcon } from '../components/icons';

interface UTFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: UnidadTrabajo) => void;
    initialData: UnidadTrabajo;
}

const UTFormModal: React.FC<UTFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState(initialData);

    if (!isOpen) return null;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{initialData.id.startsWith('ut_') ? 'Nueva Unidad de Trabajo' : 'Editar Unidad de Trabajo'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon className="w-6 h-6 text-gray-600" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" value={formData.nombre} onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))} required className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea value={formData.descripcion} onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea>
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
    const { unidadesTrabajo, resultadosAprendizaje, criteriosEvaluacion, handleSaveUT, handleDeleteUT } = useAppContext();
    const [modalState, setModalState] = useState<{ isOpen: boolean; data: UnidadTrabajo | null }>({ isOpen: false, data: null });
    const [expandedUTs, setExpandedUTs] = useState<Set<string>>(new Set());

    const handleOpenModal = (data: UnidadTrabajo | null) => {
        setModalState({ isOpen: true, data: data || { id: `ut_${Date.now()}`, nombre: '', descripcion: '' } });
    };

    const handleCloseModal = () => setModalState({ isOpen: false, data: null });
    
    const toggleExpand = (utId: string) => {
        setExpandedUTs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(utId)) {
                newSet.delete(utId);
            } else {
                newSet.add(utId);
            }
            return newSet;
        });
    };

    const AsociacionesSummary: React.FC<{ ut: UnidadTrabajo }> = ({ ut }) => {
        const CriteriosAsociados = useMemo(() => {
            const allCriterios = Object.values(criteriosEvaluacion);
            // FIX: Add type annotation for 'c' to resolve 'unknown' type error.
            const criteriaForThisUT = allCriterios.filter((c: CriterioEvaluacion) => 
                c.asociaciones.some(a => a.utId === ut.id)
            );
            
            // FIX: Add type annotation for 'crit' to resolve 'unknown' type error.
            const groupedByRA = criteriaForThisUT.reduce<Record<string, { ra: ResultadoAprendizaje; criterios: CriterioEvaluacion[] }>>((acc, crit: CriterioEvaluacion) => {
                const raId = crit.raId;
                if (!raId) return acc;
                if (!acc[raId]) {
                    const ra = resultadosAprendizaje[raId];
                    if (ra) {
                        acc[raId] = { ra, criterios: [] };
                    }
                }
                if (acc[raId]) {
                    // FIX: Type annotation on 'crit' resolves the error here.
                    acc[raId].criterios.push(crit);
                }
                return acc;
            }, {});

            return Object.values(groupedByRA);
        }, [ut.id]);

        if (CriteriosAsociados.length === 0) {
            return <p className="text-xs text-gray-500">Esta UT no está asociada a ningún criterio de evaluación.</p>;
        }

        return (
            <div className="space-y-2">
                {CriteriosAsociados.map(({ ra, criterios }) => (
                    <div key={ra.id} className="text-xs bg-gray-100 p-2 rounded">
                        <p className="font-semibold">{ra.nombre}</p>
                        <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
                            {criterios.map(c => <li key={c.id} className="text-gray-700">{c.descripcion}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center"><BookOpenIcon className="w-8 h-8 mr-3 text-purple-500"/>Unidades de Trabajo (UT)</h1>
                    <p className="text-gray-500 mt-1">Define las unidades didácticas. Las asociaciones se gestionan desde la vista de RA.</p>
                </div>
                <button onClick={() => handleOpenModal(null)} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"><PlusIcon className="w-5 h-5 mr-1" /> Nueva UT</button>
            </header>
            <div className="space-y-4">
                {Object.values(unidadesTrabajo || {}).map((ut: UnidadTrabajo) => {
                    const isExpanded = expandedUTs.has(ut.id);
                    return (
                        <div key={ut.id} className="bg-white rounded-lg shadow-sm">
                            <div className="flex items-center p-4">
                                <button onClick={() => toggleExpand(ut.id)} className="p-1 rounded-full hover:bg-gray-100">
                                    {isExpanded ? <ChevronDownIcon className="w-5 h-5"/> : <ChevronRightIcon className="w-5 h-5"/>}
                                </button>
                                <div className="flex-1 ml-2 cursor-pointer" onClick={() => toggleExpand(ut.id)}>
                                    <h3 className="font-bold text-lg text-gray-800">{ut.nombre}</h3>
                                    <p className="text-sm text-gray-600">{ut.descripcion}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => handleOpenModal(ut)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteUT(ut.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="mt-3 pt-3 border-t p-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Resumen de Criterios Asociados (Solo Lectura)</h4>
                                    <AsociacionesSummary ut={ut} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {modalState.isOpen && <UTFormModal isOpen={modalState.isOpen} onClose={handleCloseModal} onSave={handleSaveUT} initialData={modalState.data!} />}
        </div>
    );
};

export default UTView;
