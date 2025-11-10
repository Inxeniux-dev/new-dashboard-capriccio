-- Esquema de Base de Datos para Capriccio Dashboard
-- Supabase PostgreSQL Schema
-- Versión: 1.0.0
-- Fecha: 2025-11-03

-- ============================================
-- TABLA: messages
-- Descripción: Almacena todos los mensajes de las conversaciones
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID,
    sender_phone VARCHAR(20) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    message_content TEXT NOT NULL,
    direction VARCHAR(20) CHECK (direction IN ('incoming', 'outgoing')),
    message_type VARCHAR(50) DEFAULT 'text',
    status VARCHAR(50) DEFAULT 'sent',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Índices para mejorar el rendimiento
    INDEX idx_sender_phone (sender_phone),
    INDEX idx_receiver_phone (receiver_phone),
    INDEX idx_created_at (created_at DESC)
);

-- Comentarios de columnas
COMMENT ON COLUMN messages.id IS 'Identificador único del mensaje';
COMMENT ON COLUMN messages.conversation_id IS 'ID de la conversación a la que pertenece el mensaje';
COMMENT ON COLUMN messages.sender_phone IS 'Número de teléfono del remitente';
COMMENT ON COLUMN messages.receiver_phone IS 'Número de teléfono del receptor';
COMMENT ON COLUMN messages.message_content IS 'Contenido del mensaje';
COMMENT ON COLUMN messages.direction IS 'Dirección del mensaje (incoming/outgoing)';
COMMENT ON COLUMN messages.message_type IS 'Tipo de mensaje (text, image, audio, etc)';
COMMENT ON COLUMN messages.status IS 'Estado del mensaje (sent, delivered, read, failed)';
COMMENT ON COLUMN messages.metadata IS 'Metadatos adicionales del mensaje (is_ai_response, etc)';

-- ============================================
-- TABLA: conversation_states
-- Descripción: Mantiene el estado actual de cada conversación
-- ============================================

CREATE TABLE IF NOT EXISTS conversation_states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_identifier VARCHAR(20) NOT NULL,
    platform VARCHAR(20) DEFAULT 'whatsapp',
    current_status VARCHAR(50) DEFAULT 'menu_principal',
    status_data JSONB DEFAULT '{}',
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Restricción única para evitar duplicados
    UNIQUE(user_identifier, platform),

    -- Índices
    INDEX idx_user_identifier (user_identifier),
    INDEX idx_current_status (current_status),
    INDEX idx_last_interaction (last_interaction DESC)
);

-- Comentarios de columnas
COMMENT ON COLUMN conversation_states.user_identifier IS 'Identificador del usuario (número de teléfono)';
COMMENT ON COLUMN conversation_states.platform IS 'Plataforma de mensajería (whatsapp, telegram, etc)';
COMMENT ON COLUMN conversation_states.current_status IS 'Estado actual de la conversación';
COMMENT ON COLUMN conversation_states.status_data IS 'Datos adicionales del estado';
COMMENT ON COLUMN conversation_states.last_interaction IS 'Última vez que el usuario interactuó';

-- Estados válidos para conversation_states.current_status
COMMENT ON TABLE conversation_states IS 'Estados válidos: menu_principal, generar_orden_ia, asesor_humano, confirmando_direccion, esperando_pago, orden_completada, informacion_general';

-- ============================================
-- TABLA: notifications
-- Descripción: Sistema de notificaciones para usuarios y agentes
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_phone VARCHAR(20),
    recipient_role VARCHAR(50),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Índices
    INDEX idx_recipient_phone (recipient_phone),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at_notifications (created_at DESC),
    INDEX idx_type (type)
);

-- Comentarios de columnas
COMMENT ON COLUMN notifications.recipient_phone IS 'Teléfono del destinatario de la notificación';
COMMENT ON COLUMN notifications.recipient_role IS 'Rol del destinatario (agent, admin, logistics, etc)';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificación';
COMMENT ON COLUMN notifications.title IS 'Título de la notificación';
COMMENT ON COLUMN notifications.message IS 'Mensaje de la notificación';
COMMENT ON COLUMN notifications.priority IS 'Prioridad de la notificación';
COMMENT ON COLUMN notifications.is_read IS 'Si la notificación ha sido leída';
COMMENT ON COLUMN notifications.read_at IS 'Fecha y hora en que se leyó la notificación';

-- Tipos de notificación válidos
COMMENT ON TABLE notifications IS 'Tipos válidos: new_conversation, agent_assigned, human_assistance_required, order_status, system_alert';

-- ============================================
-- TABLA: users (opcional, si no existe)
-- Descripción: Usuarios del sistema
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Índices
    INDEX idx_phone_users (phone),
    INDEX idx_role (role)
);

-- ============================================
-- TABLA: orders (opcional, para estadísticas)
-- Descripción: Órdenes generadas por el sistema
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_phone VARCHAR(20) NOT NULL,
    order_number VARCHAR(50) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10, 2),
    delivery_address TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Índices
    INDEX idx_user_phone_orders (user_phone),
    INDEX idx_status_orders (status),
    INDEX idx_created_at_orders (created_at DESC)
);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con campo updated_at
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_states_updated_at BEFORE UPDATE ON conversation_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política para messages: Los usuarios pueden ver sus propios mensajes
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT
    USING (
        sender_phone = current_setting('app.current_user_phone')::text OR
        receiver_phone = current_setting('app.current_user_phone')::text
    );

-- Política para conversation_states: Los usuarios pueden ver su propio estado
CREATE POLICY "Users can view their own conversation state" ON conversation_states
    FOR SELECT
    USING (user_identifier = current_setting('app.current_user_phone')::text);

-- Política para notifications: Los usuarios pueden ver sus propias notificaciones
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT
    USING (recipient_phone = current_setting('app.current_user_phone')::text);

-- Para desarrollo/testing - Permitir acceso completo con la clave anon
-- NOTA: Ajustar estas políticas según los requerimientos de seguridad en producción
CREATE POLICY "Anon users can read all messages" ON messages
    FOR ALL
    USING (auth.role() = 'anon')
    WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Anon users can manage conversation_states" ON conversation_states
    FOR ALL
    USING (auth.role() = 'anon')
    WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Anon users can manage notifications" ON notifications
    FOR ALL
    USING (auth.role() = 'anon')
    WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Anon users can manage users" ON users
    FOR ALL
    USING (auth.role() = 'anon')
    WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Anon users can manage orders" ON orders
    FOR ALL
    USING (auth.role() = 'anon')
    WITH CHECK (auth.role() = 'anon');

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================

-- Insertar algunos estados de conversación de ejemplo
INSERT INTO conversation_states (user_identifier, platform, current_status, status_data)
VALUES
    ('+525512345678', 'whatsapp', 'menu_principal', '{}'),
    ('+525587654321', 'whatsapp', 'generar_orden_ia', '{"step": "collecting_items"}'),
    ('+525599887766', 'whatsapp', 'orden_completada', '{"order_id": "ORD-001"}')
ON CONFLICT (user_identifier, platform) DO NOTHING;

-- Insertar algunos mensajes de ejemplo
INSERT INTO messages (sender_phone, receiver_phone, message_content, direction, message_type)
VALUES
    ('+525512345678', 'system', 'Hola, bienvenido a Capriccio', 'incoming', 'text'),
    ('system', '+525512345678', 'Hola! En qué puedo ayudarte hoy?', 'outgoing', 'text'),
    ('+525512345678', 'system', 'Quiero hacer un pedido', 'incoming', 'text')
ON CONFLICT DO NOTHING;

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX idx_messages_conversation ON messages(sender_phone, receiver_phone, created_at DESC);
CREATE INDEX idx_conversation_states_platform_status ON conversation_states(platform, current_status);
CREATE INDEX idx_notifications_recipient_unread ON notifications(recipient_phone, is_read) WHERE is_read = FALSE;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista para conversaciones activas con último mensaje
CREATE OR REPLACE VIEW active_conversations AS
SELECT
    cs.id,
    cs.user_identifier,
    cs.platform,
    cs.current_status,
    cs.last_interaction,
    m.last_message,
    m.last_message_time
FROM conversation_states cs
LEFT JOIN LATERAL (
    SELECT
        message_content as last_message,
        created_at as last_message_time
    FROM messages
    WHERE sender_phone = cs.user_identifier
       OR receiver_phone = cs.user_identifier
    ORDER BY created_at DESC
    LIMIT 1
) m ON true
WHERE cs.last_interaction > NOW() - INTERVAL '7 days'
ORDER BY cs.last_interaction DESC;

-- Vista para estadísticas del dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM conversation_states WHERE current_status != 'orden_completada') as active_conversations,
    (SELECT COUNT(*) FROM messages WHERE created_at > NOW() - INTERVAL '24 hours') as messages_today,
    (SELECT COUNT(*) FROM orders WHERE created_at > NOW() - INTERVAL '24 hours') as orders_today,
    (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
    (SELECT COUNT(*) FROM notifications WHERE is_read = FALSE) as unread_notifications;

-- ============================================
-- NOTAS DE IMPLEMENTACIÓN
-- ============================================

/*
IMPORTANTE:
1. Ejecutar este script en el SQL Editor de Supabase
2. Verificar que las políticas RLS estén configuradas correctamente
3. Ajustar los permisos según el ambiente (desarrollo vs producción)
4. Configurar las variables de entorno en la aplicación:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
5. Para producción, implementar autenticación adecuada y ajustar las políticas RLS

SUBSCRIPCIONES REALTIME:
Para habilitar las suscripciones en tiempo real en Supabase:
1. Ir a Database -> Replication en el dashboard de Supabase
2. Habilitar replicación para las tablas:
   - messages
   - conversation_states
   - notifications
   - orders (opcional)
   - users (opcional)

TESTING:
Para probar las suscripciones, usar el siguiente código en la consola del navegador:
```javascript
const { createClient } = supabase
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const channel = supabaseClient
  .channel('test-channel')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' },
    payload => console.log('Change received!', payload)
  )
  .subscribe()
```
*/