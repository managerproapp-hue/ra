
export const COURSE_MODULES = ['FOL', 'Inglés Técnico', 'EIE'];

export const PRACTICAL_EXAM_RUBRIC = [
    { 
        id: 'ra1', name: 'RA1: Realizar el aprovisionamiento', weight: 0.15, 
        criteria: [
            { id: 'ra1_c1', name: 'CE1.1: Identifica necesidades' },
            { id: 'ra1_c2', name: 'CE1.2: Cumplimenta documentación' },
            { id: 'ra1_c3', name: 'CE1.3: Realiza recepción' },
        ]
    },
    { 
        id: 'ra2', name: 'RA2: Preparar y presentar elaboraciones', weight: 0.50, 
        criteria: [
            { id: 'ra2_c1', name: 'CE2.1: Ejecuta técnicas de cocción' },
            { id: 'ra2_c2', name: 'CE2.2: Aplica técnicas de conservación' },
            { id: 'ra2_c3', name: 'CE2.3: Realiza emplatado estético' },
            { id: 'ra2_c4', name: 'CE2.4: Mantiene orden y limpieza' },
        ] 
    },
    { 
        id: 'ra3', name: 'RA3: Aplicar sistemas de gestión', weight: 0.20, 
        criteria: [
            { id: 'ra3_c1', name: 'CE3.1: Controla costes' },
            { id: 'ra3_c2', name: 'CE3.2: Aplica APPCC' },
        ]
    },
    { 
        id: 'ra4', name: 'RA4: Actuar bajo normas de seguridad', weight: 0.15, 
        criteria: [
            { id: 'ra4_c1', name: 'CE4.1: Aplica normas higiénico-sanitarias' },
            { id: 'ra4_c2', name: 'CE4.2: Utiliza EPIs correctamente' },
        ]
    },
];

export const SCORE_LEVELS = [
    { value: 10, label: 'Excelente', color: 'bg-green-600' },
    { value: 8, label: 'Bueno', color: 'bg-green-400' },
    { value: 6, label: 'Suficiente', color: 'bg-yellow-400' },
    { value: 4, label: 'Insuficiente', color: 'bg-red-400' },
];

export const ACADEMIC_EVALUATION_STRUCTURE = {
    periods: [
        { key: 't1', name: '1º Trimestre', instruments: [
            { key: 'servicios', name: 'Servicios', type: 'calculated', weight: 0.4 },
            { key: 'exPracticoT1', name: 'Ex. Práctico', type: 'calculated', weight: 0.3 },
            { key: 'teorico1', name: 'Ex. Teórico 1', type: 'manual', weight: 0.15 },
            { key: 'teorico2', name: 'Ex. Teórico 2', type: 'manual', weight: 0.15 },
        ]},
        { key: 't2', name: '2º Trimestre', instruments: [
            { key: 'servicios', name: 'Servicios', type: 'calculated', weight: 0.4 },
            { key: 'exPracticoT2', name: 'Ex. Práctico', type: 'calculated', weight: 0.3 },
            { key: 'teorico1', name: 'Ex. Teórico 1', type: 'manual', weight: 0.15 },
            { key: 'teorico2', name: 'Ex. Teórico 2', type: 'manual', weight: 0.15 },
        ]},
        { key: 't3', name: '3º Trimestre', instruments: [
            { key: 'servicios', name: 'Servicios', type: 'calculated', weight: 0.4 },
            { key: 'exPracticoT3', name: 'Ex. Práctico', type: 'calculated', weight: 0.3 },
            { key: 'teorico1', name: 'Ex. Teórico 1', type: 'manual', weight: 0.15 },
            { key: 'teorico2', name: 'Ex. Teórico 2', type: 'manual', weight: 0.15 },
        ]}
    ]
};

export const SERVICE_GRADE_WEIGHTS = {
    individual: 0.6,
    group: 0.4
};

export const PRE_SERVICE_BEHAVIOR_ITEMS = [
  { id: 'puntualidad', label: 'Puntualidad' },
  { id: 'uniformidad', label: 'Uniformidad e higiene personal' },
  { id: 'actitud', label: 'Actitud y respeto' },
  { id: 'organizacion', label: 'Organización y preparación previa' },
];

export const BEHAVIOR_RATING_MAP = [
  { value: 1, label: 'Positivo', symbol: '+', color: 'text-green-600 hover:bg-green-100', selectedColor: 'bg-green-500 text-white' },
  { value: 0, label: 'Neutro', symbol: '○', color: 'text-gray-500 hover:bg-gray-200', selectedColor: 'bg-gray-500 text-white' },
  { value: -1, label: 'Negativo', symbol: '-', color: 'text-red-600 hover:bg-red-100', selectedColor: 'bg-red-500 text-white' },
];

export const GROUP_EVALUATION_ITEMS = [
    { id: 'organizacion', label: 'Organización y Planificación', maxScore: 2.0 },
    { id: 'ejecucion', label: 'Ejecución y Técnicas', maxScore: 3.0 },
    { id: 'sabor', label: 'Sabor y Presentación', maxScore: 3.0 },
    { id: 'limpieza', label: 'Limpieza y Orden', maxScore: 2.0 },
];

export const INDIVIDUAL_EVALUATION_ITEMS = [
    { id: 'actitud', label: 'Actitud, Respeto y Colaboración', maxScore: 2.5 },
    { id: 'tecnicas', label: 'Técnicas Individuales y Destreza', maxScore: 4.0 },
    { id: 'responsabilidad', label: 'Responsabilidad y Autonomía', maxScore: 2.5 },
    { id: 'higiene', label: 'Higiene y Seguridad', maxScore: 1.0 },
];
