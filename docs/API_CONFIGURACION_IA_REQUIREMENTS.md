# 📋 Requisitos de API para Módulo de Configuración de IA

## 🎯 Resumen Ejecutivo

Este documento especifica los endpoints y modificaciones de base de datos necesarios para implementar el módulo de **Configuración de IA** en el dashboard de Capriccio.

### Alcance del Módulo
Permite a administradores gestionar centralmente la configuración del asistente virtual de IA que interactúa con clientes en múltiples plataformas (WhatsApp, Messenger, Instagram, Facebook).

### Funcionalidades Principales
1. **Configuración Global de IA**: Nombre del asistente, modelo de OpenAI, temperatura, tokens, idioma
2. **Gestión de API Key**: Almacenamiento encriptado de credenciales de OpenAI
3. **Control por Plataforma**: Activar/desactivar IA individualmente por plataforma
4. **Pruebas en Vivo**: Endpoint para probar configuración con OpenAI
5. **Auditoría**: Registro completo de cambios de configuración

### Endpoints Requeridos
- `GET /api/ai/config` - Obtener configuración actual
- `PUT /api/ai/config` - Actualizar configuración global
- `POST /api/ai/config/test` - Probar con OpenAI
- `PUT /api/ai/config/toggle` - Activar/desactivar por plataforma
- `PUT /api/ai/config/toggle/:platform` - Toggle individual

### Cambios en Base de Datos
- ✅ Tabla `ai_configurations` ya existe → Agregar columnas nuevas
- ✨ Tabla `ai_configuration_audit` → Crear nueva para auditoría
- 🔄 Modificar constraints existentes (temperature, max_tokens)

### Tecnologías
- **Base de Datos**: PostgreSQL con Supabase
- **Autenticación**: Supabase Auth (JWT tokens)
- **Encriptación**: AES-256-CBC para API keys
- **IA**: OpenAI GPT-4/GPT-4-turbo
- **Deployment**: Vercel

---

## 🗄️ Contexto de Base de Datos Existente

**IMPORTANTE:** El sistema actualmente usa **PostgreSQL con Supabase** y ya tiene las siguientes tablas relevantes:

- ✅ `ai_configurations` - Configuración por plataforma (WhatsApp, Messenger, Instagram, Facebook)
- ✅ `ai_response_logs` - Logs de respuestas generadas por IA
- ✅ `prompt_improvements` - Historial de mejoras a prompts
- ✅ `configurations` - Tokens y credenciales de plataformas
- ✅ `messages` - Mensajes con campos `ai_enabled`, `ai_response_generated`, `ai_context`

---

## 📊 Cambios Requeridos en el Modelo de Datos

### 1. Tabla Existente: `ai_configurations`

**Estado actual:**
```sql
CREATE TABLE public.ai_configurations (
  id integer NOT NULL DEFAULT nextval('ai_configurations_id_seq'::regclass),
  platform character varying NOT NULL UNIQUE CHECK (platform::text = ANY (ARRAY['whatsapp'::character varying, 'messenger'::character varying, 'instagram'::character varying, 'facebook'::character varying]::text[])),
  ai_enabled boolean DEFAULT true,
  auto_response_enabled boolean DEFAULT true,
  response_delay_seconds integer DEFAULT 5 CHECK (response_delay_seconds >= 0 AND response_delay_seconds <= 300),
  max_tokens integer DEFAULT 150 CHECK (max_tokens >= 10 AND max_tokens <= 1000),
  temperature numeric DEFAULT 0.7 CHECK (temperature >= 0::numeric AND temperature <= 2::numeric),
  system_prompt text DEFAULT 'Eres un asistente de ventas profesional y amigable. Responde de manera útil y educada.'::text,
  fallback_message text DEFAULT 'Gracias por tu mensaje. Un agente se pondrá en contacto contigo pronto.'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

**⚠️ Campos faltantes para el módulo:**

Ejecutar la siguiente migración para agregar los campos necesarios:

```sql
-- Agregar campos para configuración global de IA
ALTER TABLE public.ai_configurations
ADD COLUMN IF NOT EXISTS assistant_name VARCHAR(255) DEFAULT 'Asistente Capriccio',
ADD COLUMN IF NOT EXISTS model VARCHAR(100) DEFAULT 'gpt-4',
ADD COLUMN IF NOT EXISTS primary_language VARCHAR(10) DEFAULT 'es',
ADD COLUMN IF NOT EXISTS openai_api_key TEXT,
ADD COLUMN IF NOT EXISTS openai_api_key_encrypted TEXT; -- Versión encriptada

-- Modificar constraint de temperature para permitir 0-1 (estándar OpenAI)
ALTER TABLE public.ai_configurations
DROP CONSTRAINT IF EXISTS ai_configurations_temperature_check;

ALTER TABLE public.ai_configurations
ADD CONSTRAINT ai_configurations_temperature_check
CHECK (temperature >= 0::numeric AND temperature <= 1.0::numeric);

-- Modificar constraint de max_tokens para permitir más tokens
ALTER TABLE public.ai_configurations
DROP CONSTRAINT IF EXISTS ai_configurations_max_tokens_check;

ALTER TABLE public.ai_configurations
ADD CONSTRAINT ai_configurations_max_tokens_check
CHECK (max_tokens >= 10 AND max_tokens <= 4000);

-- Modificar response_delay_seconds a response_delay_ms (milisegundos)
ALTER TABLE public.ai_configurations
ADD COLUMN IF NOT EXISTS response_delay_ms INTEGER;

-- Migrar datos existentes de seconds a milliseconds
UPDATE public.ai_configurations
SET response_delay_ms = response_delay_seconds * 1000
WHERE response_delay_ms IS NULL;

-- Crear índice para búsqueda por estado activo
CREATE INDEX IF NOT EXISTS idx_ai_config_enabled ON public.ai_configurations(ai_enabled, platform);

-- Trigger para updated_at (si no existe)
CREATE OR REPLACE FUNCTION update_ai_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ai_configurations_updated_at ON public.ai_configurations;

CREATE TRIGGER trigger_update_ai_configurations_updated_at
  BEFORE UPDATE ON public.ai_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_configurations_updated_at();

-- Comentarios para documentación
COMMENT ON COLUMN public.ai_configurations.assistant_name IS 'Nombre personalizado del asistente de IA';
COMMENT ON COLUMN public.ai_configurations.model IS 'Modelo de OpenAI a usar: gpt-4, gpt-4-turbo, gpt-4o, gpt-4o-mini, gpt-3.5-turbo';
COMMENT ON COLUMN public.ai_configurations.primary_language IS 'Idioma principal del asistente (ISO 639-1)';
COMMENT ON COLUMN public.ai_configurations.openai_api_key_encrypted IS 'API Key de OpenAI encriptada con AES-256';
COMMENT ON COLUMN public.ai_configurations.response_delay_ms IS 'Delay en milisegundos antes de enviar respuesta (simula escritura humana)';
```

### 2. Nueva Tabla: `ai_configuration_audit`

Crear tabla para auditoría de cambios:

```sql
CREATE TABLE public.ai_configuration_audit (
  id BIGSERIAL PRIMARY KEY,
  config_id INTEGER NOT NULL REFERENCES public.ai_configurations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  platform VARCHAR NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'updated', 'enabled', 'disabled', 'test_run')),
  changes JSONB, -- Campos que cambiaron: {"field": {"old": "valor_viejo", "new": "valor_nuevo"}}
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_audit_config ON public.ai_configuration_audit(config_id);
CREATE INDEX idx_ai_audit_user ON public.ai_configuration_audit(user_id);
CREATE INDEX idx_ai_audit_created ON public.ai_configuration_audit(created_at DESC);

COMMENT ON TABLE public.ai_configuration_audit IS 'Registro de auditoría de cambios en configuración de IA';
```

### 3. Descripción de Campos Actualizados

| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|--------------|
| `platform` | string | Plataforma (único por registro) | `whatsapp`, `messenger`, `instagram`, `facebook` |
| `assistant_name` | string | Nombre del asistente virtual | Máx 255 caracteres |
| `model` | string | Modelo de IA de OpenAI | `gpt-4`, `gpt-4-turbo`, `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo` |
| `temperature` | numeric | Creatividad de respuestas (0-1) | 0 = conservador, 1 = creativo |
| `max_tokens` | integer | Máximo de tokens por respuesta | Rango: 10-4000 |
| `response_delay_ms` | integer | Delay en milisegundos | Rango: 0-5000 ms |
| `primary_language` | string | Idioma principal del asistente | Código ISO 639-1 (`es`, `en`, `pt`, `fr`) |
| `openai_api_key_encrypted` | text | API Key de OpenAI encriptada | Encriptada con AES-256-CBC |
| `system_prompt` | text | Prompt del sistema para el modelo | Texto libre |
| `fallback_message` | text | Mensaje cuando IA falla | Texto libre |
| `ai_enabled` | boolean | Si IA está habilitada globalmente | true/false |
| `auto_response_enabled` | boolean | Si auto-respuesta está activa | true/false |

---

## 🔌 Endpoints Requeridos

### Base URL
```
https://api-capriccio.vercel.app/api
```

### Autenticación
Todos los endpoints requieren Bearer token en el header:
```http
Authorization: Bearer {API_TOKEN}
```

**Permisos requeridos:** Los endpoints solo están disponibles para usuarios con rol `administrador` o `super_usuario` (verificar contra tabla `profiles`).

---

## 1️⃣ GET `/ai/config` - Obtener Configuración Global

Obtiene la configuración de IA para todas las plataformas.

**Nota:** Como la tabla `ai_configurations` tiene un registro por plataforma, este endpoint debe:
1. Obtener todos los registros de plataforma
2. Extraer campos compartidos (assistant_name, model, openai_api_key, etc.)
3. Construir un objeto con plataformas habilitadas

### Request
```http
GET /api/ai/config
Authorization: Bearer {token}
```

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "assistant_name": "Asistente Capriccio",
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 500,
    "response_delay_ms": 1000,
    "primary_language": "es",
    "openai_api_key": "sk-proj-****************************", // Parcialmente oculta
    "enabled_platforms": {
      "whatsapp": true,
      "messenger": true,
      "instagram": true,
      "facebook": false
    },
    "platform_configs": [
      {
        "id": 1,
        "platform": "whatsapp",
        "ai_enabled": true,
        "auto_response_enabled": true,
        "system_prompt": "Eres un asistente de ventas profesional...",
        "fallback_message": "Gracias por tu mensaje...",
        "created_at": "2025-01-07T10:30:00Z",
        "updated_at": "2025-01-07T10:30:00Z"
      },
      {
        "id": 2,
        "platform": "messenger",
        "ai_enabled": true,
        "auto_response_enabled": true,
        "system_prompt": "Eres un asistente de ventas profesional...",
        "fallback_message": "Gracias por tu mensaje...",
        "created_at": "2025-01-07T10:30:00Z",
        "updated_at": "2025-01-07T10:30:00Z"
      }
      // ... más plataformas
    ]
  }
}
```

### Lógica del Backend

```javascript
// Pseudo-código para construir la respuesta
async function getAIConfig() {
  // 1. Obtener todas las configuraciones de plataforma
  const configs = await db.query(
    'SELECT * FROM ai_configurations ORDER BY platform'
  );

  if (configs.length === 0) {
    return { success: false, error: 'No configuration found' };
  }

  // 2. Tomar campos compartidos del primer registro (o del más reciente)
  const baseConfig = configs[0];

  // 3. Construir objeto de respuesta
  return {
    success: true,
    data: {
      assistant_name: baseConfig.assistant_name,
      model: baseConfig.model,
      temperature: parseFloat(baseConfig.temperature),
      max_tokens: baseConfig.max_tokens,
      response_delay_ms: baseConfig.response_delay_ms,
      primary_language: baseConfig.primary_language,
      openai_api_key: maskApiKey(decryptApiKey(baseConfig.openai_api_key_encrypted)),
      enabled_platforms: configs.reduce((acc, c) => {
        acc[c.platform] = c.ai_enabled;
        return acc;
      }, {}),
      platform_configs: configs
    }
  };
}
```

### Response Error (404)
```json
{
  "success": false,
  "error": "No se encontró configuración",
  "message": "No existe configuración de IA. Contacta al administrador del sistema."
}
```

### Response Error (401)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "No tienes permisos para ver esta configuración"
}
```

---

## 2️⃣ PUT `/ai/config` - Actualizar Configuración Global

Actualiza la configuración de IA para todas las plataformas.

**Importante:** Este endpoint debe actualizar **todos los registros de plataforma** con los campos compartidos (assistant_name, model, temperature, etc.), pero respetar el estado individual `ai_enabled` de cada plataforma.

### Request
```http
PUT /api/ai/config
Authorization: Bearer {token}
Content-Type: application/json

{
  "assistant_name": "Asistente Capriccio",
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 500,
  "response_delay_ms": 1000,
  "primary_language": "es",
  "openai_api_key": "sk-proj-...", // Solo enviar si se va a cambiar
  "enabled_platforms": {
    "whatsapp": true,
    "messenger": true,
    "instagram": true,
    "facebook": false
  }
}
```

### Lógica del Backend

```javascript
async function updateAIConfig(data, userId) {
  const { enabled_platforms, openai_api_key, ...sharedFields } = data;

  // 1. Validar datos
  validateAIConfig(data);

  // 2. Encriptar API key si se proporciona
  let encryptedKey = null;
  if (openai_api_key) {
    // Validar que la API key es válida con OpenAI
    const isValid = await validateOpenAIKey(openai_api_key);
    if (!isValid) {
      throw new Error('API Key de OpenAI inválida');
    }
    encryptedKey = encryptApiKey(openai_api_key);
  }

  // 3. Obtener configuraciones actuales
  const currentConfigs = await db.query(
    'SELECT * FROM ai_configurations'
  );

  // 4. Actualizar cada plataforma
  const updatePromises = Object.keys(enabled_platforms).map(async (platform) => {
    const platformEnabled = enabled_platforms[platform];

    // Construir objeto de actualización
    const updateData = {
      ...sharedFields,
      ai_enabled: platformEnabled,
      updated_at: new Date()
    };

    // Solo actualizar API key si se proporcionó una nueva
    if (encryptedKey) {
      updateData.openai_api_key_encrypted = encryptedKey;
    }

    // Verificar si el registro existe
    const existingConfig = currentConfigs.find(c => c.platform === platform);

    if (existingConfig) {
      // UPDATE
      return db.query(
        `UPDATE ai_configurations
         SET ${Object.keys(updateData).map((k, i) => `${k} = $${i + 2}`).join(', ')}
         WHERE platform = $1`,
        [platform, ...Object.values(updateData)]
      );
    } else {
      // INSERT
      return db.query(
        `INSERT INTO ai_configurations (platform, ${Object.keys(updateData).join(', ')})
         VALUES ($1, ${Object.keys(updateData).map((_, i) => `$${i + 2}`).join(', ')})`,
        [platform, ...Object.values(updateData)]
      );
    }
  });

  await Promise.all(updatePromises);

  // 5. Registrar en auditoría
  await logAudit({
    user_id: userId,
    action: 'updated',
    changes: data
  });

  // 6. Retornar configuración actualizada
  return await getAIConfig();
}
```

### Validaciones del Backend

```javascript
// Pseudo-código de validaciones requeridas
{
  assistant_name: {
    required: true,
    minLength: 3,
    maxLength: 255
  },
  model: {
    required: true,
    enum: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini']
  },
  temperature: {
    required: true,
    type: 'float',
    min: 0.0,
    max: 1.0
  },
  max_tokens: {
    required: true,
    type: 'integer',
    min: 1,
    max: 4000
  },
  response_delay_ms: {
    required: true,
    type: 'integer',
    min: 0,
    max: 5000
  },
  primary_language: {
    required: true,
    enum: ['es', 'en', 'pt', 'fr'] // Según idiomas soportados
  },
  openai_api_key: {
    required: true,
    minLength: 20,
    pattern: /^sk-[a-zA-Z0-9-_]+$/ // Validar formato de OpenAI
  },
  enabled_platforms: {
    required: true,
    type: 'array',
    items: {
      enum: ['whatsapp', 'messenger', 'instagram', 'facebook']
    },
    minItems: 1 // Al menos una plataforma habilitada
  }
}
```

### Response Success (200)
```json
{
  "success": true,
  "message": "Configuración actualizada exitosamente para todas las plataformas",
  "data": {
    "assistant_name": "Asistente Capriccio",
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 500,
    "response_delay_ms": 1000,
    "primary_language": "es",
    "openai_api_key": "sk-proj-****************************",
    "enabled_platforms": {
      "whatsapp": true,
      "messenger": true,
      "instagram": true,
      "facebook": false
    },
    "updated_at": "2025-01-07T11:00:00Z",
    "platforms_updated": 4
  }
}
```

### Response Error (400)
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Errores de validación en los datos enviados",
  "details": {
    "temperature": "El valor debe estar entre 0.0 y 1.0",
    "max_tokens": "El valor debe estar entre 1 y 4000"
  }
}
```

### Response Error (401)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Token de autenticación inválido o expirado"
}
```

---

## 3️⃣ POST `/ai/config/test` - Probar Configuración

Prueba la configuración actual realizando una llamada de prueba a la API de OpenAI.

### Request
```http
POST /api/ai/config/test
Authorization: Bearer {token}
Content-Type: application/json

{
  "test_message": "Hola, ¿cuál es tu nombre?" // Opcional, usa mensaje default si no se envía
}
```

### Response Success (200)
```json
{
  "success": true,
  "message": "Prueba exitosa",
  "data": {
    "response": "¡Hola! Soy Asistente Capriccio, tu asistente virtual. ¿En qué puedo ayudarte hoy?",
    "model_used": "gpt-4",
    "tokens_used": 45,
    "response_time_ms": 1234,
    "test_timestamp": "2025-01-07T11:15:00Z"
  }
}
```

### Response Error (400)
```json
{
  "success": false,
  "error": "OpenAI API Error",
  "message": "Error al conectar con OpenAI: Invalid API key provided",
  "details": {
    "openai_error": "Incorrect API key provided: sk-proj-****. You can find your API key at https://platform.openai.com/account/api-keys.",
    "error_type": "invalid_request_error"
  }
}
```

### Response Error (404)
```json
{
  "success": false,
  "error": "No configuration found",
  "message": "No hay configuración activa para probar"
}
```

---

## 4️⃣ PUT `/ai/config/toggle` - Activar/Desactivar IA por Plataforma

Activa o desactiva el asistente de IA de manera individual por plataforma o global.

### Request - Toggle Global
```http
PUT /api/ai/config/toggle
Authorization: Bearer {token}
Content-Type: application/json

{
  "enabled_platforms": {
    "whatsapp": true,
    "messenger": true,
    "instagram": false,
    "facebook": false
  }
}
```

### Request - Toggle Individual
```http
PUT /api/ai/config/toggle/:platform
Authorization: Bearer {token}
Content-Type: application/json

{
  "ai_enabled": true
}
```

**Ejemplo:** `PUT /api/ai/config/toggle/whatsapp`

### Response Success (200)
```json
{
  "success": true,
  "message": "Estado del asistente actualizado exitosamente",
  "data": {
    "platform": "whatsapp",
    "ai_enabled": true,
    "updated_at": "2025-01-07T11:20:00Z"
  }
}
```

### Lógica del Backend

```javascript
async function toggleAIPlatform(platform, enabled, userId) {
  // Actualizar estado de la plataforma
  await db.query(
    `UPDATE ai_configurations
     SET ai_enabled = $1, updated_at = NOW()
     WHERE platform = $2`,
    [enabled, platform]
  );

  // Registrar en auditoría
  await db.query(
    `INSERT INTO ai_configuration_audit
     (config_id, user_id, platform, action, changes)
     SELECT id, $1, platform, $2, $3
     FROM ai_configurations
     WHERE platform = $4`,
    [userId, enabled ? 'enabled' : 'disabled', JSON.stringify({ ai_enabled: { old: !enabled, new: enabled } }), platform]
  );

  return {
    success: true,
    message: `IA ${enabled ? 'activada' : 'desactivada'} para ${platform}`,
    data: {
      platform,
      ai_enabled: enabled,
      updated_at: new Date()
    }
  };
}
```

### Response Error (404)
```json
{
  "success": false,
  "error": "Platform not found",
  "message": "No existe configuración para la plataforma especificada"
}
```

---

## 🔒 Seguridad

### Encriptación de API Key

La API key de OpenAI **DEBE** ser encriptada antes de almacenarse en la base de datos:

```javascript
// Ejemplo con Node.js (crypto)
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const ENCRYPTION_IV = process.env.ENCRYPTION_IV; // 16 bytes

function encryptApiKey(apiKey) {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, ENCRYPTION_IV);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptApiKey(encryptedKey) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, ENCRYPTION_IV);
  let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### Respuesta Parcial de API Key

Al devolver la configuración al frontend, la API key debe mostrarse parcialmente oculta:

```javascript
function maskApiKey(apiKey) {
  if (!apiKey || apiKey.length < 10) return '****';

  const prefix = apiKey.substring(0, 7); // 'sk-proj'
  const suffix = apiKey.substring(apiKey.length - 4); // últimos 4 caracteres
  const masked = '*'.repeat(28);

  return `${prefix}-${masked}${suffix}`;
}

// Ejemplo: sk-proj-****************************abcd
```

### Permisos Requeridos

- **GET `/ai/config`**: Requiere rol `admin` o `superadmin`
- **PUT `/ai/config`**: Requiere rol `admin` o `superadmin`
- **POST `/ai/config/test`**: Requiere rol `admin` o `superadmin`
- **PUT `/ai/config/status`**: Requiere rol `superadmin` únicamente

---

## 📝 Notas de Implementación

### 1. Configuración por Plataforma
La tabla `ai_configurations` tiene un registro **POR PLATAFORMA** con constraint UNIQUE en `platform`:

```sql
-- Cada plataforma tiene su propio registro
-- whatsapp, messenger, instagram, facebook
SELECT * FROM ai_configurations;
-- Resultado esperado: 4 filas (una por plataforma)
```

**Importante:** Al actualizar configuración global, debe actualizarse en TODAS las plataformas simultáneamente.

### 2. Valores por Defecto al Crear Plataformas
Si no existen registros de plataforma, crearlos con defaults:

```javascript
const DEFAULT_PLATFORMS = ['whatsapp', 'messenger', 'instagram', 'facebook'];

const DEFAULT_CONFIG = {
  assistant_name: 'Asistente Capriccio',
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 500,
  response_delay_ms: 1000,
  primary_language: 'es',
  ai_enabled: true,
  auto_response_enabled: true,
  system_prompt: 'Eres un asistente de ventas profesional y amigable para Capriccio. Ayudas a los clientes con información sobre productos, pedidos y entregas. Responde de manera útil, educada y concisa.',
  fallback_message: 'Gracias por tu mensaje. Un agente se pondrá en contacto contigo pronto.'
};

// Inicializar plataformas faltantes
async function initializePlatforms() {
  for (const platform of DEFAULT_PLATFORMS) {
    await db.query(
      `INSERT INTO ai_configurations (platform, assistant_name, model, temperature, max_tokens, response_delay_ms, primary_language, ai_enabled, auto_response_enabled, system_prompt, fallback_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (platform) DO NOTHING`,
      [platform, ...Object.values(DEFAULT_CONFIG)]
    );
  }
}
```

### 3. Relación con Otras Tablas

**Tabla `messages`:**
- Campo `ai_enabled` (boolean) - Si este mensaje específico debe usar IA
- Campo `ai_response_generated` (boolean) - Si ya se generó respuesta con IA
- Campo `ai_context` (jsonb) - Contexto de la conversación para IA
- Campo `response_mode` (varchar) - Modo de respuesta: 'ia' o 'manual'

**Tabla `ai_response_logs`:**
- Registra cada respuesta generada por IA
- Vincula con `message_id` de la tabla `messages`
- Almacena tokens usados, tiempo de respuesta, éxito/error

**Tabla `prompt_improvements`:**
- Historial de mejoras al system_prompt
- Útil para rastrear optimizaciones del prompt

```javascript
// Al generar respuesta de IA, registrar en ai_response_logs
async function logAIResponse(messageId, platform, input, response, tokensUsed, responseTime, success, error = null) {
  await db.query(
    `INSERT INTO ai_response_logs
     (message_id, platform, input_text, generated_response, tokens_used, response_time_ms, success, error_message)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [messageId, platform, input, response, tokensUsed, responseTime, success, error]
  );
}
```

### 3. Logs de Auditoría
Registrar todos los cambios en una tabla de auditoría:

```sql
CREATE TABLE ai_configuration_audit (
  id SERIAL PRIMARY KEY,
  config_id INTEGER REFERENCES ai_configuration(id),
  user_id INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'activated', 'deactivated'
  changes JSONB, -- Qué campos cambiaron
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Rate Limiting
Implementar rate limiting en el endpoint de prueba:

```javascript
// Máximo 5 pruebas por minuto por usuario
const TEST_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minuto
  max: 5
};
```

### 5. Validación de OpenAI API Key
Antes de guardar, validar que la API key es válida:

```javascript
async function validateOpenAIKey(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}
```

### 6. Autenticación con Supabase
El sistema usa Supabase Auth. Extraer el user_id del token JWT:

```javascript
// Middleware para validar token y extraer usuario
async function authenticateRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }

  const token = authHeader.split(' ')[1];

  // Verificar token con Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid token');
  }

  // Obtener perfil del usuario desde tabla profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('User profile not found');
  }

  // Verificar rol (solo admin y super_usuario pueden acceder)
  if (!['administrador', 'super_usuario'].includes(profile.role)) {
    throw new Error('Insufficient permissions');
  }

  return {
    userId: user.id,
    email: user.email,
    role: profile.role,
    profile
  };
}
```

### 7. Variables de Entorno Necesarias

Asegurarse de tener estas variables configuradas en el backend:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Encriptación (generar con: openssl rand -hex 32)
ENCRYPTION_KEY=tu_clave_encriptacion_32_bytes_hex
ENCRYPTION_IV=tu_vector_inicializacion_16_bytes_hex

# OpenAI (opcional para testing)
OPENAI_API_KEY=sk-proj-...

# API
API_PORT=4000
API_BASE_URL=https://api-capriccio.vercel.app
```

---

## 🧪 Casos de Prueba

### Test Case 1: Obtener configuración cuando no existe

**Request:**
```http
GET /api/ai/config
```

**Expected Response:**
```json
{
  "success": false,
  "error": "No se encontró configuración activa"
}
```

---

### Test Case 2: Actualizar con temperatura inválida

**Request:**
```http
PUT /api/ai/config
{
  "temperature": 1.5
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "temperature": "El valor debe estar entre 0.0 y 1.0"
  }
}
```

---

### Test Case 3: Probar con API key inválida

**Request:**
```http
POST /api/ai/config/test
```

**Expected Response:**
```json
{
  "success": false,
  "error": "OpenAI API Error",
  "message": "Error al conectar con OpenAI: Invalid API key provided"
}
```

---

### Test Case 4: Activar plataforma no soportada

**Request:**
```http
PUT /api/ai/config
{
  "enabled_platforms": ["whatsapp", "telegram"]
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "enabled_platforms": "Plataforma 'telegram' no está soportada"
  }
}
```

---

## 📚 Documentación Adicional

### Modelos de OpenAI Disponibles

| Modelo | Descripción | Tokens Máx | Precio Relativo |
|--------|-------------|------------|-----------------|
| `gpt-4` | Más preciso y capaz | 8,192 | Alto |
| `gpt-4-turbo` | Más rápido, más tokens | 128,000 | Medio-Alto |
| `gpt-4o` | Optimizado, multimodal | 128,000 | Medio |
| `gpt-4o-mini` | Más económico | 128,000 | Bajo |
| `gpt-3.5-turbo` | Rápido y económico | 16,385 | Muy Bajo |

### Idiomas Soportados

```javascript
const SUPPORTED_LANGUAGES = {
  'es': 'Español',
  'en': 'English',
  'pt': 'Português',
  'fr': 'Français'
};
```

### Plataformas Disponibles

```javascript
const SUPPORTED_PLATFORMS = {
  'whatsapp': 'WhatsApp',
  'messenger': 'Facebook Messenger',
  'instagram': 'Instagram Direct',
  'facebook': 'Facebook Comments'
};
```

---

## 📞 Contacto

Para dudas o aclaraciones sobre esta especificación:

- **Frontend Lead**: Diego Ramirez
- **Repositorio**: `new-dashboard-capriccio`
- **Documento creado**: 2025-01-07

---

## ✅ Checklist de Implementación

### Base de Datos
- [ ] Ejecutar migración: Agregar columnas nuevas a `ai_configurations` (assistant_name, model, primary_language, openai_api_key_encrypted, response_delay_ms)
- [ ] Ejecutar migración: Modificar constraints de temperature (0-1) y max_tokens (10-4000)
- [ ] Ejecutar migración: Crear tabla `ai_configuration_audit` para logs
- [ ] Ejecutar migración: Crear índices necesarios
- [ ] Ejecutar migración: Crear triggers para updated_at
- [ ] Inicializar registros de plataforma si no existen (whatsapp, messenger, instagram, facebook)

### Endpoints
- [ ] Implementar endpoint `GET /api/ai/config` (obtener config global)
- [ ] Implementar endpoint `PUT /api/ai/config` (actualizar config global)
- [ ] Implementar endpoint `POST /api/ai/config/test` (probar con OpenAI)
- [ ] Implementar endpoint `PUT /api/ai/config/toggle` (activar/desactivar por plataforma)
- [ ] Implementar endpoint `PUT /api/ai/config/toggle/:platform` (toggle individual)

### Seguridad y Validaciones
- [ ] Implementar encriptación AES-256 para API keys
- [ ] Implementar función para enmascarar API keys en respuestas
- [ ] Implementar validación de OpenAI API key antes de guardar
- [ ] Agregar middleware de autenticación con Supabase
- [ ] Verificar permisos de rol (admin/super_usuario únicamente)
- [ ] Agregar rate limiting (5 pruebas/minuto) en endpoint de test
- [ ] Validar campos según specs (temperature 0-1, max_tokens 10-4000, etc.)

### Auditoría y Logs
- [ ] Registrar cambios en tabla `ai_configuration_audit`
- [ ] Capturar IP y user_agent en auditoría
- [ ] Registrar respuestas de IA en `ai_response_logs` (ya existe)
- [ ] Logging de errores con stack traces

### Testing
- [ ] Test: GET sin configuración existente (404)
- [ ] Test: PUT con temperature inválida (400)
- [ ] Test: PUT con API key inválida de OpenAI (400)
- [ ] Test: POST /test con API key correcta (200)
- [ ] Test: POST /test con API key incorrecta (400)
- [ ] Test: Toggle platform individual (200)
- [ ] Test: Autenticación sin token (401)
- [ ] Test: Usuario sin permisos (403)
- [ ] Test: Rate limiting en /test (429)

### Documentación
- [ ] Documentar endpoints en Swagger/OpenAPI
- [ ] Agregar comentarios en código explicando lógica de encriptación
- [ ] Documentar formato de respuestas de error
- [ ] Crear guía de troubleshooting

### Variables de Entorno
- [ ] Configurar `ENCRYPTION_KEY` (32 bytes hex)
- [ ] Configurar `ENCRYPTION_IV` (16 bytes hex)
- [ ] Verificar `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`
- [ ] (Opcional) Configurar `OPENAI_API_KEY` para testing

### Integración
- [ ] Verificar que sistema de mensajes usa configuración de `ai_configurations`
- [ ] Asegurar que logs de IA se guardan en `ai_response_logs`
- [ ] Probar flow completo: usuario actualiza config → mensaje entra → IA responde

---

## 📞 Contacto y Soporte

**Frontend Team:**
- Lead: Diego Ramirez
- Repositorio: `new-dashboard-capriccio`

**Backend Team:**
- Responsables de implementar estos endpoints
- Base de datos: PostgreSQL con Supabase
- Deployment: Vercel

**Para dudas o aclaraciones:**
- Revisar este documento: `docs/API_CONFIGURACION_IA_REQUIREMENTS.md`
- Consultar schema de base de datos existente
- Contactar al equipo de frontend para coordinación

---

**Documento creado:** 2025-01-07
**Última actualización:** 2025-01-07
**Versión:** 2.0 (actualizado con estructura real de BD)
