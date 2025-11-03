// Mapeo de estados a indicadores visuales
export const STATUS_INDICATORS = {
  'menu_principal': {
    color: 'blue',
    icon: '📋',
    text: 'En menú principal',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  },
  'generar_orden_ia': {
    color: 'purple',
    icon: '🤖',
    text: 'Generando orden con IA',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    animated: true
  },
  'asesor_humano': {
    color: 'red',
    icon: '👤',
    text: 'Asesor humano activo',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    priority: 'high'
  },
  'confirmando_direccion': {
    color: 'orange',
    icon: '📍',
    text: 'Confirmando dirección',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800'
  },
  'esperando_pago': {
    color: 'yellow',
    icon: '💳',
    text: 'Esperando pago',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  'orden_completada': {
    color: 'green',
    icon: '✅',
    text: 'Orden completada',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  'informacion_general': {
    color: 'gray',
    icon: 'ℹ️',
    text: 'Consulta general',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800'
  }
} as const;

export type ConversationStatus = keyof typeof STATUS_INDICATORS;