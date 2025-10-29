# Solicitudes de Ajustes al Backend

---

## 🆕 NUEVA SOLICITUD: Endpoint para Restablecer Estado de Conversación

### Problema Identificado

Cuando un usuario en WhatsApp se queda "atascado" sin ver el menú de opciones (por ejemplo, después de que el sistema envía el catálogo pero no muestra las opciones del menú), el agente humano necesita poder restablecer manualmente el estado de la conversación desde el dashboard.

**Caso de Uso Real:**
```
Cliente: "Me gustaría hacer un pedido"
Bot: [Envía catálogo y opciones]
Cliente: "Qué productos tienes"
Cliente: "Ver menu"
[El bot no responde con el menú - CONVERSACIÓN ATASCADA]
```

### Endpoint Requerido

#### **POST /api/conversations/:platform/:contactId/reset-state**

o alternativamente:

#### **POST /api/ai/reset-conversation-state**

**Método:** `POST`

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "platform": "whatsapp",
  "contact_id": "52123456789",
  "reset_type": "menu" // o "full" para resetear completamente
}
```

**Response Exitosa (200):**
```json
{
  "success": true,
  "message": "Estado de conversación restablecido exitosamente",
  "data": {
    "platform": "whatsapp",
    "contact_id": "52123456789",
    "previous_state": "waiting_catalog_response",
    "new_state": "menu",
    "reset_at": "2025-10-27T17:21:00Z",
    "reset_by": "user_logistica_123"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "error": "Conversación no encontrada",
  "code": "CONVERSATION_NOT_FOUND"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "Tipo de reset inválido",
  "code": "INVALID_RESET_TYPE"
}
```

### Funcionalidad Esperada

1. **Limpiar el estado de la conversación** en la base de datos del bot IA
2. **Restablecer el contexto** a "menu" (estado inicial)
3. **Limpiar variables de sesión** del usuario (carrito temporal, selecciones anteriores, etc.)
4. **Enviar automáticamente el menú** al usuario por WhatsApp
5. **Registrar en logs** quién hizo el reset y cuándo

### Tipos de Reset

| Tipo | Descripción | Acción |
|------|-------------|--------|
| `menu` | Restablecer solo al menú principal | Limpia estado y muestra menú |
| `full` | Reset completo | Limpia todo incluyendo historial de interacciones |
| `cart` | Limpiar solo el carrito | Mantiene el estado pero vacía el carrito |

### Integración en el Frontend

El botón de reset se agregará en el módulo de Conversaciones (`/dashboard/logistics/conversations/[platform]/[contactId]`):

```jsx
// Ubicación: Header de la conversación, junto a los botones IA/Manual
<button
  onClick={handleResetConversation}
  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
  title="Restablecer estado de conversación"
>
  <RefreshCw size={18} />
  Resetear Conversación
</button>
```

### Campos Adicionales para el Modelo de Conversación

Para trackear mejor estos eventos, sería útil agregar a la tabla de conversaciones:

```json
{
  "conversation_state": "menu" | "browsing_catalog" | "adding_to_cart" | "checkout" | "waiting_payment",
  "last_state_reset_at": "2025-10-27T17:21:00Z",
  "last_state_reset_by": "user_logistica_123",
  "state_reset_count": 3
}
```

### Prioridad

**🔴 ALTA** - Este problema afecta directamente la experiencia del cliente y requiere intervención manual actualmente.

### Notas de Implementación

1. El reset debe ser **atómico** - si falla el envío del menú, debe hacer rollback del estado
2. Debe haber un **rate limit** para evitar spam (máximo 5 resets por conversación en 10 minutos)
3. Debe **notificar al agente** en el dashboard cuando el reset se complete exitosamente
4. Considerar agregar un **mensaje automático** al cliente tipo: "Te he enviado el menú principal nuevamente 📋"

### Endpoints Relacionados (para contexto)

- `GET /api/conversations/:platform/:contactId` - Obtener conversación actual
- `POST /api/conversations/:platform/:contactId/messages` - Enviar mensaje
- `PATCH /api/conversations/:platform/:contactId/mode` - Cambiar entre IA/Manual

---

## Solicitudes Anteriores - Módulo de Sucursales

## Estado Actual

El módulo de Sucursales en el dashboard está consumiendo dos endpoints:

1. **`GET /api/ipos/locations`** - Endpoint principal actualmente en uso
2. **`GET /api/branches`** - Endpoint alternativo con más campos pero sin datos completos

## Problemas Identificados

### 1. Endpoint `/api/ipos/locations` - Faltan Campos Críticos

**Respuesta Actual:**
```json
{
  "success": true,
  "data": [
    {
      "ID": "1",
      "Name": "TIENDA CENTRAL",
      "Type": "STORE",
      "Status": "ACTIVE",
      "PiceType": "REGULAR",
      "ClientAddress": "NO"
    }
  ]
}
```

**Campos Faltantes:**
- `Address` o `address` - Dirección física de la sucursal
- `Phone` o `phone` - Teléfono de contacto
- `City` o `city` - Ciudad
- `State` o `state` - Estado
- `ManagerID` o `manager_id` - ID del encargado/manager
- `ManagerName` o `manager_name` - Nombre del encargado/manager

### 2. Endpoint `/api/branches` - Datos Incompletos

**Respuesta Actual:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Tienda Central",
      "address": "Dirección pendiente de configurar",
      "phone": null,
      "city": null,
      "state": null,
      "manager_id": null,
      "active": true,
      "created_at": "2025-10-07T15:16:41.603722-06:00",
      "updated_at": "2025-10-07T15:16:41.603722-06:00"
    }
  ]
}
```

**Problema:** Todos los campos importantes están en `null` o con valores placeholder.

## Soluciones Propuestas

### Opción 1: Mejorar el Endpoint `/api/ipos/locations` (RECOMENDADO)

Agregar los campos faltantes a la respuesta de iPOS locations. El endpoint debería devolver:

```json
{
  "success": true,
  "data": [
    {
      "ID": "1",
      "Name": "TIENDA CENTRAL",
      "Type": "STORE",
      "Status": "ACTIVE",
      "PiceType": "REGULAR",
      "ClientAddress": "NO",

      // CAMPOS A AGREGAR:
      "Address": "Av. Principal 123, Col. Centro",
      "Phone": "+52 33 1234 5678",
      "City": "Guadalajara",
      "State": "Jalisco",
      "ZipCode": "44100",
      "ManagerID": "user_123",
      "ManagerName": "Juan Pérez",
      "Email": "central@tienda.com"
    }
  ]
}
```

**Beneficios:**
- El dashboard ya está consumiendo este endpoint
- No requiere cambios en el frontend
- Mantiene la sincronización con iPOS

### Opción 2: Completar los Datos del Endpoint `/api/branches`

Asegurarse de que el endpoint `/api/branches` devuelva datos reales en lugar de `null`:

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Tienda Central",
      "address": "Av. Principal 123, Col. Centro",
      "phone": "+52 33 1234 5678",
      "city": "Guadalajara",
      "state": "Jalisco",
      "zip_code": "44100",
      "manager_id": "user_123",
      "manager_name": "Juan Pérez",
      "email": "central@tienda.com",
      "active": true,
      "created_at": "2025-10-07T15:16:41.603722-06:00",
      "updated_at": "2025-10-07T15:16:41.603722-06:00"
    }
  ]
}
```

**Beneficios:**
- Estructura más completa
- Mejor separación de responsabilidades
- Incluye campo `manager_name` directamente

**Requiere:** Actualizar el frontend para usar este endpoint en lugar de `/api/ipos/locations`

### Opción 3: Crear Endpoint Híbrido (ÓPTIMO)

Crear un nuevo endpoint `/api/logistics/stores` o mejorar `/api/logistics/stores` existente que combine datos de iPOS con información adicional:

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "TIENDA CENTRAL",
      "address": "Av. Principal 123, Col. Centro",
      "phone": "+52 33 1234 5678",
      "city": "Guadalajara",
      "state": "Jalisco",
      "zip_code": "44100",
      "manager_id": "user_123",
      "manager_name": "Juan Pérez",
      "email": "central@tienda.com",
      "active": true,
      "ipos_id": "1",
      "ipos_type": "STORE",
      "ipos_price_type": "REGULAR",
      "created_at": "2025-10-07T15:16:41.603722-06:00",
      "updated_at": "2025-10-07T15:16:41.603722-06:00"
    }
  ]
}
```

## Campos Adicionales Deseables (Opcional)

Para mejorar el módulo de sucursales, sería útil tener:

- `latitude` y `longitude` - Para mostrar en un mapa
- `email` - Email de contacto de la sucursal
- `opening_hours` - Horario de atención
- `employee_count` - Número de empleados
- `capacity` - Capacidad de almacenamiento/producción
- `delivery_zone` - Zona de cobertura para entregas

## Endpoints para Estadísticas

Actualmente el dashboard está calculando las estadísticas de cada sucursal haciendo múltiples llamadas a:
- `GET /api/orders/branch/:branchId`

Sería más eficiente tener un endpoint dedicado:

```
GET /api/branches/:branchId/stats
```

O mejor aún:

```
GET /api/logistics/branches/stats
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": [
    {
      "branch_id": "1",
      "total_orders": 150,
      "pending_orders": 12,
      "completed_today": 5,
      "revenue_total": 45000.00,
      "revenue_today": 3500.00,
      "average_order_value": 300.00
    }
  ]
}
```

## Prioridad

1. **ALTA**: Agregar campos de dirección, teléfono y manager a `/api/ipos/locations` (Opción 1)
2. **MEDIA**: Crear endpoint de estadísticas por sucursal
3. **BAJA**: Campos adicionales opcionales

## Notas Técnicas

- El frontend actualmente maneja ambos formatos de respuesta (camelCase y snake_case)
- La transformación de datos en el frontend está en `src/lib/api-client.ts` líneas 607-633
- El componente de sucursales está en `src/app/dashboard/logistics/branches/page.tsx`
