# Configuración de Supabase para Capriccio Dashboard

## Guía de Instalación Rápida

### 1. Configurar las Tablas en Supabase

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Copia y pega el contenido del archivo `SUPABASE_SCHEMA.sql`
4. Ejecuta el script haciendo clic en **Run**

### 2. Habilitar Realtime

Para que las suscripciones en tiempo real funcionen correctamente:

1. Ve a **Database → Replication** en el dashboard de Supabase
2. Habilita la replicación para las siguientes tablas:
   - `messages`
   - `conversation_states`
   - `notifications`
   - `orders` (opcional)
   - `users` (opcional)

### 3. Configurar Variables de Entorno

Asegúrate de tener las siguientes variables en tu archivo `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 4. Verificar la Configuración

Ejecuta el siguiente comando en la consola del navegador para verificar la conexión:

```javascript
// Verificar conexión
const testConnection = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from('conversation_states')
    .select('count')
    .single();

  if (error) {
    console.error('Error de conexión:', error);
  } else {
    console.log('Conexión exitosa!', data);
  }
};

testConnection();
```

## Solución de Problemas Comunes

### Error: "column messages.sender_phone does not exist"

**Causa**: La tabla `messages` no tiene la estructura esperada.

**Solución**:
1. Verifica la estructura actual de tu tabla:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'messages';
   ```
2. Si la estructura es diferente, actualiza el esquema ejecutando el script `SUPABASE_SCHEMA.sql`

### Error: "Error loading conversations"

**Causa**: Las políticas RLS (Row Level Security) están bloqueando el acceso.

**Solución**:
1. Para desarrollo, temporalmente desactiva RLS:
   ```sql
   ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
   ALTER TABLE conversation_states DISABLE ROW LEVEL SECURITY;
   ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
   ```
2. Para producción, configura las políticas adecuadamente según tu sistema de autenticación

### No aparecen mensajes en tiempo real

**Causa**: La replicación no está habilitada para las tablas.

**Solución**:
1. Ve a **Database → Replication** en Supabase
2. Asegúrate de que las tablas tengan el switch activado
3. Espera unos minutos para que los cambios se propaguen

### La aplicación funciona pero sin mensajes

**Estado Actual**: La aplicación está configurada para funcionar incluso si la tabla `messages` tiene un esquema diferente o no está disponible.

**Qué funciona sin mensajes**:
- Vista de conversaciones
- Estados de conversación
- Notificaciones
- Cambios de estado en tiempo real

**Para habilitar mensajes**:
1. Ejecuta el script `SUPABASE_SCHEMA.sql` para crear la estructura correcta
2. Reinicia la aplicación

## Estructura de Tablas Esperada

### Tabla: messages
```sql
- id (UUID)
- conversation_id (UUID, opcional)
- sender_phone (VARCHAR)
- receiver_phone (VARCHAR)
- message_content (TEXT)
- direction (VARCHAR: 'incoming' | 'outgoing')
- message_type (VARCHAR)
- status (VARCHAR)
- metadata (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabla: conversation_states
```sql
- id (UUID)
- user_identifier (VARCHAR)
- platform (VARCHAR)
- current_status (VARCHAR)
- status_data (JSONB)
- last_interaction (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabla: notifications
```sql
- id (UUID)
- recipient_phone (VARCHAR)
- recipient_role (VARCHAR)
- type (VARCHAR)
- title (VARCHAR)
- message (TEXT)
- priority (VARCHAR)
- is_read (BOOLEAN)
- read_at (TIMESTAMP)
- metadata (JSONB)
- created_at (TIMESTAMP)
```

## Estados de Conversación Válidos

- `menu_principal` - Usuario en el menú principal
- `generar_orden_ia` - Generando orden con IA
- `asesor_humano` - Atención por asesor humano
- `confirmando_direccion` - Confirmando dirección de entrega
- `esperando_pago` - Esperando confirmación de pago
- `orden_completada` - Orden completada
- `informacion_general` - Consulta de información general

## Testing de Suscripciones Realtime

### Test de Mensajes
```javascript
// Insertar un mensaje de prueba
const testMessage = async () => {
  const { error } = await supabase
    .from('messages')
    .insert({
      sender_phone: '+525512345678',
      receiver_phone: 'system',
      message_content: 'Mensaje de prueba',
      direction: 'incoming'
    });

  if (error) console.error('Error:', error);
  else console.log('Mensaje enviado!');
};
```

### Test de Estado de Conversación
```javascript
// Actualizar estado de conversación
const updateState = async () => {
  const { error } = await supabase
    .from('conversation_states')
    .upsert({
      user_identifier: '+525512345678',
      platform: 'whatsapp',
      current_status: 'asesor_humano',
      last_interaction: new Date().toISOString()
    });

  if (error) console.error('Error:', error);
  else console.log('Estado actualizado!');
};
```

### Test de Notificaciones
```javascript
// Crear notificación
const createNotification = async () => {
  const { error } = await supabase
    .from('notifications')
    .insert({
      recipient_phone: '+525512345678',
      type: 'human_assistance_required',
      title: 'Asistencia Requerida',
      message: 'Un cliente necesita ayuda',
      priority: 'high'
    });

  if (error) console.error('Error:', error);
  else console.log('Notificación creada!');
};
```

## Monitoreo de Cambios en Tiempo Real

Para monitorear cambios en tiempo real desde la consola del navegador:

```javascript
// Suscribirse a todos los cambios
const monitorChanges = () => {
  const channel = supabase
    .channel('monitor-all')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'messages' },
      payload => console.log('Mensaje:', payload)
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'conversation_states' },
      payload => console.log('Estado:', payload)
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'notifications' },
      payload => console.log('Notificación:', payload)
    )
    .subscribe();

  // Para desuscribirse: supabase.removeChannel(channel)
  return channel;
};

const channel = monitorChanges();
```

## Recursos Adicionales

- [Documentación de Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Políticas RLS en Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## Contacto y Soporte

Si encuentras problemas con la configuración de Supabase, verifica:
1. Las credenciales en el archivo `.env`
2. La estructura de las tablas en la base de datos
3. Las políticas RLS configuradas
4. La habilitación de replicación para las tablas

Para más ayuda, revisa los logs en:
- Consola del navegador (F12)
- Terminal donde ejecutas `npm run dev`
- Logs de Supabase en el dashboard