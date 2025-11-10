# 🧪 Ejemplos de Uso - API de Configuración de IA

Este documento contiene ejemplos prácticos de uso de los endpoints de configuración de IA usando `curl` y JavaScript/fetch.

---

## 📋 Prerequisitos

Antes de ejecutar estos ejemplos, asegúrate de tener:

1. **Token de autenticación** válido de Supabase
2. **Permisos de administrador** en tu cuenta
3. **Base URL** del API: `https://api-capriccio.vercel.app` o `http://localhost:4000`

---

## 🔑 Obtener Token de Autenticación

### Desde el Frontend (JavaScript)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@capriccio.com',
  password: 'tu_password'
});

if (data.session) {
  const token = data.session.access_token;
  console.log('Token:', token);
  // Usar este token en los headers de las peticiones
}
```

---

## 1️⃣ GET - Obtener Configuración Actual

### cURL

```bash
curl -X GET "https://api-capriccio.vercel.app/api/ai/config" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### JavaScript/Fetch

```javascript
async function getAIConfig() {
  const response = await fetch('https://api-capriccio.vercel.app/api/ai/config', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error:', error);
    return null;
  }

  const data = await response.json();
  console.log('Configuración actual:', data);
  return data;
}

// Uso
const config = await getAIConfig();
console.log('Assistant Name:', config.data.assistant_name);
console.log('Model:', config.data.model);
console.log('Platforms:', config.data.enabled_platforms);
```

### Respuesta Esperada

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
    "openai_api_key": "sk-proj-****************************wxyz",
    "enabled_platforms": {
      "whatsapp": true,
      "messenger": true,
      "instagram": false,
      "facebook": false
    },
    "platform_configs": [
      {
        "id": 1,
        "platform": "whatsapp",
        "ai_enabled": true,
        "auto_response_enabled": true,
        "system_prompt": "Eres un asistente de ventas...",
        "fallback_message": "Gracias por tu mensaje...",
        "created_at": "2025-01-07T10:30:00Z",
        "updated_at": "2025-01-07T11:00:00Z"
      }
      // ... más plataformas
    ]
  }
}
```

---

## 2️⃣ PUT - Actualizar Configuración Global

### cURL

```bash
curl -X PUT "https://api-capriccio.vercel.app/api/ai/config" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_name": "Asistente Capriccio Pro",
    "model": "gpt-4-turbo",
    "temperature": 0.8,
    "max_tokens": 800,
    "response_delay_ms": 1500,
    "primary_language": "es",
    "enabled_platforms": {
      "whatsapp": true,
      "messenger": true,
      "instagram": true,
      "facebook": false
    }
  }'
```

### JavaScript/Fetch

```javascript
async function updateAIConfig(config) {
  const response = await fetch('https://api-capriccio.vercel.app/api/ai/config', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assistant_name: config.assistantName,
      model: config.model,
      temperature: parseFloat(config.temperature),
      max_tokens: parseInt(config.maxTokens),
      response_delay_ms: parseInt(config.responseDelay),
      primary_language: config.language,
      enabled_platforms: config.enabledPlatforms
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar configuración');
  }

  return await response.json();
}

// Uso
try {
  const result = await updateAIConfig({
    assistantName: 'Asistente Capriccio',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 500,
    responseDelay: 1000,
    language: 'es',
    enabledPlatforms: {
      whatsapp: true,
      messenger: true,
      instagram: true,
      facebook: false
    }
  });

  console.log('✅ Configuración actualizada:', result);
} catch (error) {
  console.error('❌ Error:', error.message);
}
```

### Actualizar SOLO la API Key

```bash
curl -X PUT "https://api-capriccio.vercel.app/api/ai/config" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "openai_api_key": "sk-proj-NEW_API_KEY_HERE"
  }'
```

**Nota:** Si solo envías `openai_api_key`, el backend solo actualizará ese campo, manteniendo los demás valores.

---

## 3️⃣ POST - Probar Configuración con OpenAI

### cURL

```bash
curl -X POST "https://api-capriccio.vercel.app/api/ai/config/test" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "test_message": "Hola, ¿cómo estás?"
  }'
```

### JavaScript/Fetch

```javascript
async function testAIConfiguration(testMessage = null) {
  const response = await fetch('https://api-capriccio.vercel.app/api/ai/config/test', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      test_message: testMessage || 'Hola, ¿puedes ayudarme con información sobre productos?'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al probar configuración');
  }

  return await response.json();
}

// Uso
try {
  const result = await testAIConfiguration('¿Cuál es tu nombre?');

  console.log('✅ Prueba exitosa:');
  console.log('Respuesta:', result.data.response);
  console.log('Modelo usado:', result.data.model_used);
  console.log('Tokens usados:', result.data.tokens_used);
  console.log('Tiempo de respuesta:', result.data.response_time_ms, 'ms');
} catch (error) {
  console.error('❌ Error en prueba:', error.message);
}
```

### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Prueba exitosa",
  "data": {
    "response": "¡Hola! Soy Asistente Capriccio, tu asistente virtual. Estoy aquí para ayudarte con información sobre nuestros productos, pedidos y entregas. ¿En qué puedo ayudarte hoy?",
    "model_used": "gpt-4",
    "tokens_used": 52,
    "response_time_ms": 1234,
    "test_timestamp": "2025-01-07T11:15:00Z"
  }
}
```

### Respuesta con Error (API Key Inválida)

```json
{
  "success": false,
  "error": "OpenAI API Error",
  "message": "Error al conectar con OpenAI: Incorrect API key provided",
  "details": {
    "openai_error": "Incorrect API key provided: sk-proj-****. You can find your API key at https://platform.openai.com/account/api-keys.",
    "error_type": "invalid_request_error"
  }
}
```

---

## 4️⃣ PUT - Toggle IA por Plataforma

### Activar/Desactivar Todas las Plataformas

```bash
curl -X PUT "https://api-capriccio.vercel.app/api/ai/config/toggle" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled_platforms": {
      "whatsapp": true,
      "messenger": false,
      "instagram": false,
      "facebook": false
    }
  }'
```

### Activar/Desactivar Una Plataforma Específica

```bash
# Activar WhatsApp
curl -X PUT "https://api-capriccio.vercel.app/api/ai/config/toggle/whatsapp" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ai_enabled": true
  }'

# Desactivar Instagram
curl -X PUT "https://api-capriccio.vercel.app/api/ai/config/toggle/instagram" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ai_enabled": false
  }'
```

### JavaScript/Fetch

```javascript
async function toggleAIPlatform(platform, enabled) {
  const response = await fetch(
    `https://api-capriccio.vercel.app/api/ai/config/toggle/${platform}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ai_enabled: enabled
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al cambiar estado de plataforma');
  }

  return await response.json();
}

// Uso
try {
  // Activar WhatsApp
  await toggleAIPlatform('whatsapp', true);
  console.log('✅ WhatsApp IA activada');

  // Desactivar Instagram
  await toggleAIPlatform('instagram', false);
  console.log('✅ Instagram IA desactivada');
} catch (error) {
  console.error('❌ Error:', error.message);
}
```

---

## 🔐 Manejo de Errores Comunes

### 401 - No autenticado

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Token de autenticación inválido o expirado"
}
```

**Solución:** Refrescar el token de autenticación.

### 403 - Sin permisos

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "No tienes permisos para ver esta configuración"
}
```

**Solución:** Verificar que tu usuario tiene rol `administrador` o `super_usuario`.

### 400 - Validación fallida

```json
{
  "success": false,
  "error": "Validation error",
  "message": "Errores de validación en los datos enviados",
  "details": {
    "temperature": "El valor debe estar entre 0.0 y 1.0",
    "max_tokens": "El valor debe estar entre 10 y 4000"
  }
}
```

**Solución:** Corregir los valores según las especificaciones en `details`.

### 429 - Rate limit excedido

```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Has excedido el límite de 5 pruebas por minuto"
}
```

**Solución:** Esperar 1 minuto antes de volver a probar.

---

## 📦 Componente React de Ejemplo

```typescript
// hooks/useAIConfig.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AIConfig {
  assistant_name: string;
  model: string;
  temperature: number;
  max_tokens: number;
  response_delay_ms: number;
  primary_language: string;
  openai_api_key: string;
  enabled_platforms: {
    whatsapp: boolean;
    messenger: boolean;
    instagram: boolean;
    facebook: boolean;
  };
}

export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/config`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener configuración');
      }

      const result = await response.json();
      setConfig(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig: Partial<AIConfig>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/config`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newConfig)
        }
      );

      if (!response.ok) {
        throw new Error('Error al actualizar configuración');
      }

      const result = await response.json();
      setConfig(result.data);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const testConfig = async (testMessage?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/config/test`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ test_message: testMessage })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al probar configuración');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
    updateConfig,
    testConfig
  };
}
```

### Uso del Hook

```typescript
// components/AIConfigForm.tsx
'use client';

import { useAIConfig } from '@/hooks/useAIConfig';

export function AIConfigForm() {
  const { config, loading, error, updateConfig, testConfig } = useAIConfig();
  const [testResult, setTestResult] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateConfig({
        assistant_name: formData.assistantName,
        model: formData.model,
        temperature: parseFloat(formData.temperature),
        max_tokens: parseInt(formData.maxTokens),
        // ... más campos
      });

      alert('✅ Configuración actualizada exitosamente');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleTest = async () => {
    try {
      const result = await testConfig('Hola, ¿cómo estás?');
      setTestResult(result.data);
      alert('✅ Prueba exitosa');
    } catch (err) {
      alert('❌ Error en prueba: ' + err.message);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulario aquí */}
      <button type="submit">Guardar</button>
      <button type="button" onClick={handleTest}>
        Probar Configuración
      </button>
    </form>
  );
}
```

---

## 🔍 Testing con Postman

### Importar Colección

Crea una colección en Postman con las siguientes peticiones:

1. **Auth - Login** (POST a Supabase)
2. **GET AI Config**
3. **PUT Update AI Config**
4. **POST Test AI Config**
5. **PUT Toggle Platform**

### Variables de Entorno en Postman

```json
{
  "api_url": "https://api-capriccio.vercel.app",
  "token": "{{auth_token}}"
}
```

### Script Pre-request (para todas las peticiones)

```javascript
// Verificar que el token existe
if (!pm.environment.get("token")) {
    throw new Error("Token no configurado. Ejecuta primero 'Auth - Login'");
}
```

---

## 📚 Recursos Adicionales

- [Documentación de OpenAI API](https://platform.openai.com/docs/api-reference)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Especificación completa de endpoints](./API_CONFIGURACION_IA_REQUIREMENTS.md)

---

**Última actualización:** 2025-01-07
