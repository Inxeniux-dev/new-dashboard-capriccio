# Implementación de Supabase Realtime

## Resumen
Se ha implementado un sistema de suscripciones en tiempo real usando Supabase para eliminar el polling innecesario y mejorar el performance de la aplicación.

## Configuración

### Variables de Entorno
Asegúrate de tener las siguientes variables configuradas en tu archivo `.env`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Hooks Implementados

### 1. `useRealtimeConversation`
**Ubicación:** `src/hooks/useRealtimeConversation.ts`

Este hook gestiona las suscripciones en tiempo real para:
- **Messages**: Nuevos mensajes y actualizaciones de estado
- **Conversation States**: Cambios en el estado de la conversación
- **Notifications**: Nuevas notificaciones y actualizaciones

**Características:**
- Carga datos iniciales al montar el componente
- Se suscribe a cambios en tiempo real
- Reproduce sonidos para notificaciones importantes
- Muestra notificaciones toast para cambios de estado
- Auto-scroll a nuevos mensajes

### 2. `useRealtimeStats`
**Ubicación:** `src/hooks/useRealtimeStats.ts`

Este hook reemplaza el polling de estadísticas del sidebar con suscripciones en tiempo real:
- **Conversation States**: Actualiza contadores de conversaciones activas
- **Messages**: Actualiza contador de mensajes no leídos
- **Orders**: Actualiza contador de órdenes pendientes
- **Users**: Actualiza contador de usuarios (solo para admin)

**Mejoras de Performance:**
- Elimina el polling cada 30 segundos
- Actualiza las estadísticas solo cuando hay cambios reales
- Reduce la carga en el servidor y el uso de ancho de banda

### 3. `useSidebarStats`
**Ubicación:** `src/hooks/useSidebarStats.ts`

Este es un wrapper que mantiene la compatibilidad con el código existente pero usa `useRealtimeStats` internamente.

## Tablas de Supabase Monitoreadas

### 1. `messages`
- **INSERT**: Detecta nuevos mensajes
- **UPDATE**: Detecta cambios de estado (leído/no leído)

### 2. `conversation_states`
- **INSERT/UPDATE/DELETE**: Detecta cambios en estados de conversación

### 3. `notifications`
- **INSERT**: Detecta nuevas notificaciones
- **UPDATE**: Detecta cuando se marcan como leídas

### 4. `orders`
- **INSERT/UPDATE/DELETE**: Detecta cambios en órdenes

### 5. `users`
- **INSERT/UPDATE/DELETE**: Detecta cambios en usuarios (solo admin)

## Beneficios de la Implementación

1. **Mejor Performance**
   - Sin polling innecesario
   - Menos llamadas a la API
   - Menor uso de recursos del cliente

2. **Actualizaciones en Tiempo Real**
   - Los cambios se reflejan instantáneamente
   - Mejor experiencia de usuario
   - Datos siempre sincronizados

3. **Escalabilidad**
   - Reduce la carga del servidor
   - Más eficiente con múltiples usuarios
   - Mejor manejo de conexiones concurrentes

## Debugging

Para ver los logs de las suscripciones en tiempo real, abre la consola del navegador. Verás mensajes como:
- `📨 Nuevo mensaje recibido`
- `✏️ Mensaje actualizado`
- `🔄 Estado de conversación cambió`
- `🔔 Nueva notificación`
- `📊 Cambio en conversation_states`
- `📦 Cambio en órdenes`
- `👤 Cambio en usuarios`

## Consideraciones

1. **Conexión a Internet**: Las suscripciones requieren una conexión estable
2. **Reconexión Automática**: Supabase maneja la reconexión automáticamente
3. **Cleanup**: Los hooks limpian las suscripciones al desmontarse
4. **Límites**: Configurado para 10 eventos por segundo por canal

## Próximos Pasos Recomendados

1. Implementar indicadores de estado de conexión
2. Agregar retry logic para fallos de conexión
3. Implementar cache local para modo offline
4. Agregar métricas de performance para monitorear las suscripciones