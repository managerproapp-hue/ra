import { UnidadTrabajo } from '../types';

export const unidadesTrabajo: Record<string, UnidadTrabajo> = {
    ut1: {
        id: 'ut1',
        nombre: 'UT 1: Fondos, Bases y Salsas',
        descripcion: 'Elaboración de fondos básicos, salsas madre y derivadas. Técnicas de ligado y emulsión.',
        asociaciones: [
            { raId: 'cocina_basica', criterioId: 'cocina_001' },
            { raId: 'cocina_basica', criterioId: 'cocina_002' },
        ],
    },
    ut2: {
        id: 'ut2',
        nombre: 'UT 2: Hortalizas y Verduras',
        descripcion: 'Técnicas de corte, cocción y conservación de productos vegetales.',
        asociaciones: [
            { raId: 'cocina_basica', criterioId: 'cocina_001' },
            { raId: 'cocina_basica', criterioId: 'cocina_003' },
            { raId: 'cocina_mediterranea', criterioId: 'med_001' },
        ],
    },
    ut3: {
        id: 'ut3',
        nombre: 'UT 3: Masas y Fermentación',
        descripcion: 'Introducción a las masas de panadería y bollería. Control de procesos de fermentación.',
        asociaciones: [
            { raId: 'panaderia_pasteleria', criterioId: 'pan_001' },
            { raId: 'cocina_basica', criterioId: 'cocina_005' },
        ],
    },
};
