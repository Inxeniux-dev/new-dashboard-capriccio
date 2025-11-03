# Configuración de Supabase Realtime - Capriccio Dashboard

## ✅ Implementación Completada

Se ha implementado la funcionalidad completa de Supabase Realtime para el dashboard de Capriccio siguiendo las instrucciones del equipo de backend.

## 📦 Instalación

```bash
npm install @supabase/supabase-js
```

## 🔧 Configuración

### 1. Variables de Entorno

Crear o actualizar el archivo `.env.local` con las credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Archivos de Sonido

Agregar los siguientes archivos MP3 en la carpeta `/public/sounds/`:
- `notification.mp3` - Sonido general de notificación
- `urgent.mp3` - Sonido para notificaciones urgentes
- `assigned.mp3` - Sonido cuando se asigna un agente
- `new-chat.mp3` - Sonido para nueva conversación

## 📁 Estructura de Archivos Creados

```
src/
├── utils/
│   ├── supabase-client.ts          # Cliente de Supabase y tipos
│   └── conversation-status.ts       # Mapeo de estados de conversación
├── hooks/
│   ├── useRealtimeConversation.ts  # Hook para conversación individual con realtime
│   └── useGlobalNotifications.ts   # Hook para notificaciones globales
├── components/
│   ├── RealtimeConversationView.tsx       # Vista de conversación con realtime
│   └── RealtimeConversationsDashboard.tsx # Dashboard de conversaciones con realtime
└── app/dashboard/logistics/conversations/
    └── realtime/
        └── page.tsx                 # Página de conversaciones con realtime
```

## 🎯 Características Implementadas

### ✅ Realtime en Conversaciones
- **Mensajes en tiempo real**: Se actualizan automáticamente cuando llegan nuevos mensajes
- **Estados de conversación**: Cambios de estado reflejados instantáneamente
- **Notificaciones**: Sistema de notificaciones integrado
- **Auto-scroll**: Scroll automático al último mensaje

### ✅ Estados de Conversación
- `menu_principal` - Usuario en menú principal
- `generar_orden_ia` - Procesando con IA (indicador animado)
- `asesor_humano` - Modo manual activo (alerta especial)
- `confirmando_direccion` - Validando dirección
- `esperando_pago` - Pendiente de pago
- `orden_completada` - Orden finalizada
- `informacion_general` - Consulta general

### ✅ Sistema de Notificaciones
- **Notificaciones del navegador**: Para mensajes de alta prioridad
- **Sonidos diferenciados**: Según el tipo de notificación
- **Contador de no leídas**: Badge con número de notificaciones
- **Panel desplegable**: Vista de todas las notificaciones

### ✅ Dashboard de Conversaciones
- **Filtros por estado**: Con contadores en tiempo real
- **Actualización automática**: Sin necesidad de recargar
- **Último mensaje**: Muestra el último mensaje de cada conversación
- **Indicadores visuales**: Colores y iconos según el estado

## 🚀 Uso

### Página de Conversaciones con Realtime

Acceder a: `/dashboard/logistics/conversations/realtime`

### Hooks Disponibles

#### useRealtimeConversation
```typescript
const {
  messages,
  conversationState,
  notifications,
  lastUpdate,
  markNotificationAsRead,
  isLoading,
  error
} = useRealtimeConversation(conversationId, userPhone);
```

#### useGlobalNotifications
```typescript
const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  isLoading
} = useGlobalNotifications(userRole);
```

## ⚠️ Importante

### El Frontend SOLO:
- 👀 Observa y reacciona a los cambios de la BD
- 🎨 Actualiza la UI según el estado
- 🔔 Muestra notificaciones al usuario
- ❌ NO inserta/actualiza directamente en BD

### El Backend maneja:
- ✅ Inserción de mensajes cuando llegan
- ✅ Actualización de conversation_states
- ✅ Cambios a modo asesor_humano
- ✅ Creación de notificaciones
- ✅ Todos los cambios de estado

## 🔒 Seguridad

- **RLS habilitado**: Row Level Security activo en Supabase
- **Filtros específicos**: Solo datos de la conversación/usuario actual
- **Validación de datos**: Verificación de pertenencia antes de mostrar

## 📊 Testing

Para probar el realtime en la consola del navegador:

```javascript
// Obtener el cliente de Supabase
const { createClient } = window.supabase;
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Escuchar cambios
client
  .channel('test-channel')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'messages' },
    payload => console.log('Change received!', payload)
  )
  .subscribe();
```

## 🔄 Migración

Para migrar de la versión anterior (con polling) a realtime:

1. Configurar las variables de entorno de Supabase
2. Agregar los archivos de sonido
3. Cambiar las rutas de `/dashboard/logistics/conversations` a `/dashboard/logistics/conversations/realtime`
4. Eliminar cualquier implementación de polling (setInterval, etc.)

## 📝 Notas Adicionales

- **Performance**: El realtime de Supabase es muy eficiente
- **Reconexión**: Manejo automático de reconexiones
- **Offline**: Considerar mostrar indicador cuando no hay conexión
- **Límites**: Hasta 100 canales simultáneos por cliente

## 🐛 Troubleshooting

### No llegan las actualizaciones en tiempo real
1. Verificar que las credenciales de Supabase están correctas
2. Confirmar que el realtime está habilitado en las tablas de Supabase
3. Revisar las políticas RLS en Supabase

### No se reproducen los sonidos
1. Verificar que los archivos MP3 están en `/public/sounds/`
2. Comprobar permisos del navegador para reproducir audio
3. Algunos navegadores requieren interacción del usuario primero

### Notificaciones del navegador no aparecen
1. Verificar permisos de notificación en el navegador
2. Comprobar que el sitio tiene HTTPS (requerido para notificaciones)

## 📧 Contacto

Para dudas o problemas con la implementación, contactar al equipo de desarrollo.