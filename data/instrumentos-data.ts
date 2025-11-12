import { InstrumentoEvaluacion } from '../types';

export const instrumentosEvaluacion: Record<string, InstrumentoEvaluacion> = {
  observacion_sistematica: {
    id: 'observacion_sistematica',
    nombre: 'Observación Sistemática',
    descripcion: 'Registro de comportamientos y competencias durante la práctica',
    ponderacion: 40,
    escalas: [
      { valor: 1, etiqueta: 'No observable', descripcion: 'No se evidencia la competencia' },
      { valor: 2, etiqueta: 'Básico', descripcion: 'Evidencia mínima de la competencia' },
      { valor: 3, etiqueta: 'Adecuado', descripcion: 'Demuestra competencia satisfactoriamente' },
      { valor: 4, etiqueta: 'Excelente', descripcion: 'Demuestra competencia de forma excepcional' }
    ],
    campos: [
      'Asistencia y puntualidad',
      'Cumplimiento de normas de higiene',
      'Uso correcto de técnicas',
      'Trabajo en equipo',
      'Organización del espacio'
    ]
  },
  lista_verificacion: {
    id: 'lista_verificacion',
    nombre: 'Lista de Verificación',
    descripcion: 'Verificación de cumplimiento de requisitos específicos',
    ponderacion: 20,
    escalas: [
      { valor: 0, etiqueta: 'No cumple', descripcion: 'No cumple el requisito' },
      { valor: 1, etiqueta: 'Cumple parcialmente', descripcion: 'Cumple el requisito de forma incompleta' },
      { valor: 2, etiqueta: 'Cumple completamente', descripcion: 'Cumple totalmente el requisito' }
    ],
    campos: [
      'Temperatura de cocción correcta',
      'Presentación adecuada',
      'Tiempo de elaboración apropiado',
      'Cumplimiento de receta',
      'Higiene personal y alimentaria'
    ]
  },
  evaluacion_practica: {
    id: 'evaluacion_practica',
    nombre: 'Evaluación Práctica',
    descripcion: 'Evaluación de ejecución de tareas prácticas específicas',
    ponderacion: 50,
    escalas: [
      { valor: 1, etiqueta: 'Insuficiente', descripcion: 'No alcanza el nivel esperado' },
      { valor: 2, etiqueta: 'Suficiente', descripcion: 'Alcanza el nivel mínimo aceptable' },
      { valor: 3, etiqueta: 'Bien', descripcion: 'Supera las expectativas básicas' },
      { valor: 4, etiqueta: 'Notable', descripcion: 'Demuestra alto nivel de competencia' },
      { valor: 5, etiqueta: 'Sobresaliente', descripcion: 'Excelencia en la competencia' }
    ],
    campos: [
      'Técnica de elaboración',
      'Calidad del resultado',
      'Eficiencia en el proceso',
      'Creatividad e innovación',
      'Presentación final'
    ]
  },
  autoevaluacion: {
    id: 'autoevaluacion',
    nombre: 'Autoevaluación',
    descripcion: 'Reflexión y evaluación personal del aprendizaje',
    ponderacion: 10,
    escalas: [
      { valor: 1, etiqueta: 'Necesito mejorar mucho', descripcion: 'Identifico grandes áreas de mejora' },
      { valor: 2, etiqueta: 'Necesito mejorar', descripcion: 'Identifico algunas áreas de mejora' },
      { valor: 3, etiqueta: 'Estoy progresando', descripcion: 'Veo progreso pero puedo mejorar' },
      { valor: 4, etiqueta: 'Me siento competente', descripcion: 'Me siento seguro de mis competencias' },
      { valor: 5, etiqueta: 'Domino la competencia', descripcion: 'Siento que domino completamente la competencia' }
    ],
    campos: [
      'Mi comprensión de los conceptos',
      'Mi habilidad técnica',
      'Mi confianza para realizar tareas',
      'Mi capacidad para trabajar en equipo',
      'Mi organización y planificación'
    ]
  }
};