import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { InstrumentoEvaluacion } from '../types';
// FIX: Import TrashIcon to resolve 'Cannot find name' error.
import { PencilIcon, SaveIcon, XIcon, PlusIcon, TrashIcon } from '../components/icons';

interface InstrumentoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: InstrumentoEvaluacion) => void;
    instrumento: InstrumentoEvaluacion | null;
}

const InstrumentoModal: React.FC<InstrumentoModalProps> = ({ isOpen, onClose, onSave, instrumento }) => {
    const [formData, setFormData] = useState<InstrumentoEvaluacion | null>(instrumento);

    if (!isOpen || !formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: name === 'ponderacion' ? parseInt(value) || 0 : value } : null);
    };

    const handleEscalaChange = (index: number, field: string, value: string | number) => {
        const newEscalas = [...formData.escalas];
        (newEscalas[index] as any)[field] = value;
        setFormData(prev => prev ? { ...prev, escalas: newEscalas } : null);
    };
    
    const addEscala = () => {
        setFormData(prev => prev ? { ...prev, escalas: [...prev.escalas, { valor: prev.escalas.length + 1, etiqueta: '', descripcion: '' }] } : null);
    };

    const removeEscala = (index: number) => {
        setFormData(prev => prev ? { ...prev, escalas: prev.escalas.filter((_, i) => i !== index) } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-xl font-bold">Editar Instrumento de Evaluación</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4">
                    <div><label className="block text-sm font-medium">Nombre</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/></div>
                    <div><label className="block text-sm font-medium">Descripción</label><textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} className="mt-1 w-full p-2 border rounded-md"/></div>
                    <div><label className="block text-sm font-medium">Ponderación (%)</label><input type="number" name="ponderacion" value={formData.ponderacion || ''} onChange={handleChange} min="0" max="100" className="mt-1 w-full p-2 border rounded-md"/></div>
                    <div>
                        <h4 className="text-md font-semibold mb-2">Escalas</h4>
                        <div className="space-y-2">
                        {formData.escalas.map((escala, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <input type="number" value={escala.valor} onChange={e => handleEscalaChange(index, 'valor', parseInt(e.target.value))} className="col-span-1 p-1 border rounded text-center"/>
                                <input type="text" value={escala.etiqueta} onChange={e => handleEscalaChange(index, 'etiqueta', e.target.value)} placeholder="Etiqueta" className="col-span-3 p-1 border rounded"/>
                                <input type="text" value={escala.descripcion} onChange={e => handleEscalaChange(index, 'descripcion', e.target.value)} placeholder="Descripción" className="col-span-7 p-1 border rounded"/>
                                <button type="button" onClick={() => removeEscala(index)} className="col-span-1 text-red-500 p-1"><TrashIcon/></button>
                            </div>
                        ))}
                        </div>
                        <button type="button" onClick={addEscala} className="mt-2 text-sm text-blue-600 font-semibold flex items-center"><PlusIcon className="w-4 h-4 mr-1"/>Añadir Nivel de Escala</button>
                    </div>
                </form>
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold flex items-center"><SaveIcon className="w-5 h-5 mr-2"/>Guardar</button>
                </div>
            </div>
        </div>
    );
};

const InstrumentosView: React.FC = () => {
    const { instrumentosEvaluacion, setInstrumentosEvaluacion, addToast } = useAppContext();
    const [modalState, setModalState] = useState<{ isOpen: boolean; instrumento: InstrumentoEvaluacion | null }>({ isOpen: false, instrumento: null });
    
    const handleOpenModal = (instrumento: InstrumentoEvaluacion) => setModalState({ isOpen: true, instrumento });
    const handleCloseModal = () => setModalState({ isOpen: false, instrumento: null });

    const handleSave = (data: InstrumentoEvaluacion) => {
        setInstrumentosEvaluacion(prev => ({ ...prev, [data.id]: data }));
        addToast('Instrumento guardado.', 'success');
        handleCloseModal();
    };

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center"><PencilIcon className="w-8 h-8 mr-3 text-purple-500"/>Instrumentos de Evaluación</h1>
                <p className="text-gray-500 mt-1">Gestiona los instrumentos, sus ponderaciones y escalas de evaluación.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FIX: Add explicit type to 'inst' to resolve property access errors on 'unknown' type. */}
                {Object.values(instrumentosEvaluacion).map((inst: InstrumentoEvaluacion) => (
                    <div key={inst.id} className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{inst.nombre}</h3>
                                    <p className="text-sm text-gray-600">{inst.descripcion}</p>
                                </div>
                                <button onClick={() => handleOpenModal(inst)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                            </div>
                            <div className="text-sm my-3">
                                <span className="font-semibold">Ponderación:</span> <span className="text-blue-600 font-bold">{inst.ponderacion || 0}%</span>
                            </div>
                             <div className="text-xs space-y-1 bg-gray-50 p-2 rounded-md">
                                {inst.escalas.map(e => <div key={e.valor}><span className="font-bold">{e.etiqueta} ({e.valor}):</span> {e.descripcion}</div>)}
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t text-xs text-gray-500">
                           Usado en 5 evaluaciones (simulado)
                        </div>
                    </div>
                ))}
            </div>
            {modalState.isOpen && <InstrumentoModal isOpen={modalState.isOpen} onClose={handleCloseModal} onSave={handleSave} instrumento={modalState.instrumento} />}
        </div>
    );
};

export default InstrumentosView;
