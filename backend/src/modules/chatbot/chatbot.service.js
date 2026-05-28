const normalize = (text = '') => String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

const knowledgeBase = [
  {
    keywords: ['qr', 'codigo', 'escanear', 'entrada', 'salida'],
    answer: 'Para usar tu QR, entra al módulo “Mi QR”, selecciona tu vehículo y muestra el código al guardia. El guardia lo escanea para registrar entrada o salida. Si el QR expira, puedes regenerarlo desde el mismo módulo.'
  },
  {
    keywords: ['vehiculo', 'vehiculos', 'placa', 'registrar auto', 'registrar coche'],
    answer: 'Para registrar un vehículo entra a “Mis vehículos”, captura placa, marca, modelo, color y año. El sistema valida que la placa no exista y que no superes el límite de vehículos permitidos.'
  },
  {
    keywords: ['reserva', 'reservacion', 'reservar'],
    answer: 'Las reservas se crean desde el módulo “Reservas”. Un administrador debe aprobarlas. El sistema valida horarios, disponibilidad del cajón y conflictos antes de asignar un espacio.'
  },
  {
    keywords: ['mapa', 'espacio', 'cajon', 'disponible', 'ocupado'],
    answer: 'El mapa muestra los cajones en tiempo real. Verde significa disponible, rojo ocupado, naranja corresponde a espacios de motocicleta y los espacios de discapacidad tienen prioridad para usuarios autorizados.'
  },
  {
    keywords: ['incidente', 'reporte', 'problema'],
    answer: 'Para reportar un incidente entra a “Incidentes”, describe el problema y envíalo. El administrador podrá cambiar su estado a abierto, en revisión o resuelto.'
  },
  {
    keywords: ['notificacion', 'aviso', 'alerta'],
    answer: 'Las notificaciones aparecen en “Avisos”. Ahí recibirás información sobre QR, reservas, incidentes y cambios importantes del sistema.'
  },
  {
    keywords: ['administrador', 'admin', 'dashboard', 'metricas'],
    answer: 'El administrador puede revisar métricas, usuarios, reservas, incidentes, reportes y el mapa general desde el panel administrativo.'
  },
  {
    keywords: ['guardia', 'scanner', 'escaner'],
    answer: 'El guardia debe entrar al módulo de escaneo, leer el QR del usuario y confirmar si el sistema registró ENTRADA o SALIDA.'
  }
];

const fallback = 'Puedo ayudarte con QR, vehículos, reservas, mapa, incidentes, notificaciones, guardias y administración. Escribe tu duda con más detalle para orientarte mejor.';

const answerQuestion = async ({ message = '' }) => {
  const normalized = normalize(message);
  if (!normalized) return { answer: 'Escribe tu pregunta para poder ayudarte.', source: 'local' };

  const match = knowledgeBase.find((item) => item.keywords.some((keyword) => normalized.includes(normalize(keyword))));
  return {
    answer: match?.answer || fallback,
    source: 'local',
    suggestions: ['¿Cómo uso mi QR?', '¿Cómo registro un vehículo?', '¿Cómo funciona el mapa?', '¿Cómo reporto un incidente?']
  };
};

module.exports = { answerQuestion };
