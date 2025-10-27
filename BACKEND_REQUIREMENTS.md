# Requerimientos de Backend - Dashboard Capriccio CRM

## Estado Actual del Dashboard

El dashboard de Capriccio está **completamente funcional** con todos los módulos implementados para:
- **Admin** - Gestión completa del sistema
- **Logistics/Logística** - Gestión de órdenes, asignaciones y conversaciones
- **Empleado/Employee** - Vista de tareas y órdenes de sucursal

Sin embargo, **algunos módulos funcionan con datos mock** debido a endpoints faltantes o incompletos.

---

## 🔴 PRIORIDAD CRÍTICA

### 1. Campo `branch` en Respuesta de Autenticación ✅ IMPLEMENTADO

**Endpoint:** `GET /api/auth/profile` y `POST /api/auth/login`

El backend ya debe estar devolviendo:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "empleado@capriccio.com",
    "role": "empleado",
    "full_name": "Juan Pérez",
    "branch_id": "branch_001",
    "branch": {
      "id": "branch_001",
      "name": "Tienda Central",
      "address": "Av. Principal 123",
      "phone": "+52 33 1234 5678",
      "city": "Guadalajara",
      "state": "Jalisco"
    }
  }
}
```

**Estado:** ✅ Debe estar implementado según tu confirmación

---

### 2. Endpoint de Dashboard para Empleados ⚠️ REQUERIDO

**Endpoint:** `GET /api/dashboard/employee`

**Query Parameters:**
- `branch_id` (opcional): Se puede inferir del token del usuario

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "employee": {
      "id": "user_123",
      "full_name": "Juan Pérez",
      "email": "empleado@capriccio.com",
      "role": "empleado",
      "branch_id": "branch_001",
      "branch_name": "Tienda Central"
    },
    "stats": {
      "pending_tasks": 5,
      "completed_today": 3,
      "total_completed_month": 45,
      "pending_orders": 8,
      "my_orders_count": 12
    },
    "my_tasks": [
      {
        "id": "task_001",
        "title": "Preparar pedido #ORD-2025-001",
        "description": "Empacar 15 productos para cliente VIP",
        "priority": "high",
        "status": "pending",
        "due_date": "2025-01-15T14:00:00Z",
        "assigned_by": "María González",
        "order_id": "order_001",
        "created_at": "2025-01-14T09:00:00Z"
      }
    ],
    "my_orders": [
      {
        "id": "order_001",
        "order_number": "ORD-2025-001",
        "customer_name": "Cliente ABC",
        "customer_phone": "+52 33 9876 5432",
        "total_amount": 450.00,
        "status": "assigned",
        "delivery_date": "2025-01-15",
        "assigned_at": "2025-01-14T10:00:00Z",
        "items_count": 3
      }
    ]
  }
}
```

**Notas:**
- Este endpoint actualmente usa datos mock
- Debe filtrar automáticamente por la sucursal del empleado autenticado
- Solo mostrar órdenes y tareas asignadas a esa sucursal

---

## 🟡 PRIORIDAD ALTA

### 3. Gestión de Tareas para Empleados ⚠️ NUEVO

#### GET `/api/employees/tasks`

**Query Parameters:**
- `status`: `pending`, `in_progress`, `completed`
- `priority`: `high`, `medium`, `low`
- `employee_id`: (opcional, se infiere del token)
- `branch_id`: (opcional, se infiere del empleado)
- `limit`: número de resultados
- `offset`: para paginación

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task_001",
      "title": "Preparar pedido #ORD-2025-001",
      "description": "Preparar y empacar pedido de 15 productos",
      "priority": "high",
      "status": "pending",
      "due_date": "2025-01-15T14:00:00Z",
      "assigned_to": "user_123",
      "assigned_employee_name": "Juan Pérez",
      "assigned_by": "user_456",
      "assigned_by_name": "María González",
      "order_id": "order_001",
      "branch_id": "branch_001",
      "created_at": "2025-01-14T09:00:00Z",
      "updated_at": "2025-01-14T09:00:00Z",
      "completed_at": null
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

#### PUT `/api/employees/tasks/:taskId/status`

**Body:**
```json
{
  "status": "in_progress",  // o "completed"
  "notes": "Iniciando preparación del pedido"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "task_001",
    "status": "in_progress",
    "updated_at": "2025-01-14T11:00:00Z",
    "completed_at": null
  }
}
```

#### POST `/api/employees/tasks` (Crear tarea)

**Body:**
```json
{
  "title": "Verificar inventario",
  "description": "Contar productos en almacén B",
  "priority": "medium",
  "due_date": "2025-01-16T18:00:00Z",
  "assigned_to": "user_123",
  "order_id": "order_002",  // opcional
  "branch_id": "branch_001"
}
```

---

### 4. Endpoint de Conversaciones por Plataforma ⚠️ MEJORAR

**Endpoint Actual:** `GET /api/conversations`

**Problema:** El frontend está haciendo múltiples llamadas para cada plataforma

**Query Parameters Actuales:**
- `platform`: whatsapp, messenger, instagram, facebook
- `limit`: número de resultados
- `offset`: paginación

**Mejoras Requeridas:**

1. **Asegurar que devuelve datos en este formato:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv_001",
      "contact_id": "1234567890",
      "platform": "whatsapp",
      "contact_name": "María García",
      "contact_phone": "+52 33 1234 5678",
      "last_message": "¿Tienen disponible el pan de elote?",
      "last_message_time": "2025-01-14T15:30:00Z",
      "unread_count": 3,
      "conversation_status": "active",
      "ai_enabled": true,
      "created_at": "2025-01-10T09:00:00Z",
      "updated_at": "2025-01-14T15:30:00Z"
    }
  ]
}
```

2. **Agregar endpoint para todas las plataformas:**
```
GET /api/conversations/all
```
Que devuelva conversaciones de todas las plataformas agregadas

---

### 5. Mensajes de Conversaciones ⚠️ MEJORAR

**Endpoints Actuales:**
- `GET /api/conversations/:platform/:contactId`
- `GET /api/messages/all`

**Problemas:**
- El frontend intenta 3 estrategias diferentes para obtener mensajes
- No siempre encuentra los datos

**Solución Requerida:**

#### GET `/api/conversations/:platform/:contactId`

Debe devolver:
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv_001",
      "contact_id": "1234567890",
      "platform": "whatsapp",
      "contact_name": "María García",
      "contact_phone": "+52 33 1234 5678",
      "ai_enabled": true
    },
    "messages": [
      {
        "id": 1,
        "message_id": "msg_whatsapp_001",
        "contact_id": "1234567890",
        "platform": "whatsapp",
        "direction": "incoming",
        "message_content": "¿Tienen pan de elote?",
        "message_type": "text",
        "timestamp": "2025-01-14T15:25:00Z",
        "read": true,
        "status": "delivered",
        "is_from_contact": true,
        "sent_by_user": null,
        "sender_type": "client"
      },
      {
        "id": 2,
        "message_id": "msg_whatsapp_002",
        "contact_id": "1234567890",
        "platform": "whatsapp",
        "direction": "outgoing",
        "message_content": "¡Sí! Tenemos pan de elote fresco hecho hoy",
        "message_type": "text",
        "timestamp": "2025-01-14T15:26:00Z",
        "read": true,
        "status": "delivered",
        "is_from_contact": false,
        "sent_by_user": "Asistente IA",
        "sender_type": "ai",
        "ai_response_generated": true
      }
    ]
  }
}
```

**Campos importantes para el frontend:**
- `is_from_contact`: true si es del cliente, false si es respuesta del sistema
- `sent_by_user`: null para mensajes del cliente, "Asistente IA" o nombre del agente
- `sender_type`: "client", "ai", o "agent"
- `ai_response_generated`: true si fue generado por IA

---

### 6. Envío de Mensajes ⚠️ VERIFICAR

**Endpoint:** `POST /api/messages/send`

**Body Actual:**
```json
{
  "platform": "whatsapp",
  "to": "1234567890",
  "message": "Hola, ¿en qué puedo ayudarte?",
  "type": "text"
}
```

**Verificar que devuelve:**
```json
{
  "success": true,
  "data": {
    "message_id": "msg_whatsapp_003",
    "status": "sent",
    "timestamp": "2025-01-14T15:30:00Z"
  }
}
```

---

## 🟢 PRIORIDAD MEDIA

### 7. Control de IA por Conversación ⚠️ OPCIONAL

**Endpoints:**

#### GET `/api/ai/conversation/:platform/:contactId/status`

```json
{
  "success": true,
  "data": {
    "ai_enabled": true,
    "mode": "ia"
  }
}
```

#### PUT `/api/ai/conversation/:platform/:contactId/toggle`

**Body:**
```json
{
  "mode": "ia"  // o "manual"
}
```

---

### 8. Configuración de IA ⚠️ NUEVO

#### GET `/api/ai/config/:platform`

```json
{
  "success": true,
  "data": {
    "id": "config_001",
    "platform": "whatsapp",
    "ai_enabled": true,
    "auto_response_enabled": true,
    "response_delay_seconds": 2,
    "max_tokens": 500,
    "temperature": 0.7,
    "system_prompt": "Eres un asistente de Capriccio...",
    "fallback_message": "No entendí tu mensaje",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-14T12:00:00Z"
  }
}
```

#### PUT `/api/ai/config/:platform`

Para actualizar la configuración de IA

---

### 9. Estadísticas de Sucursales ⚠️ OPTIMIZACIÓN

#### GET `/api/branches/:branchId/stats`

En lugar de que el frontend calcule manualmente, proveer:

```json
{
  "success": true,
  "data": {
    "branch_id": "branch_001",
    "branch_name": "Tienda Central",
    "total_orders": 150,
    "pending_orders": 12,
    "completed_orders": 120,
    "cancelled_orders": 3,
    "revenue": {
      "today": 3500.00,
      "week": 25000.00,
      "month": 85000.00
    },
    "employees_count": 8,
    "average_order_value": 300.00
  }
}
```

---

### 10. Filtros Mejorados para Órdenes por Sucursal

**Endpoint:** `GET /api/orders/branch/:branchId`

**Query Parameters Adicionales:**
- `employee_id`: filtrar por empleado asignado
- `date_from`: fecha inicio
- `date_to`: fecha fin
- `payment_status`: paid, pending, failed
- `delivery_status`: pending, in_transit, delivered

**Agregar en respuesta:**
- `assigned_employee_name`: nombre del empleado asignado
- `branch_name`: nombre de la sucursal

---

## 🔵 PRIORIDAD BAJA (Funcionalidades Futuras)

### 11. Sistema de Gamificación

#### GET `/api/employees/performance/:employeeId`

```json
{
  "success": true,
  "data": {
    "employee_id": "user_123",
    "points": 1250,
    "level": 5,
    "next_level_points": 1500,
    "rating": 4.5,
    "tasks_completed": 45,
    "on_time_rate": 85.0,
    "achievements": [
      {
        "id": "achievement_001",
        "title": "Estrella del Mes",
        "description": "Mejor rendimiento",
        "icon": "⭐",
        "earned_date": "2025-01-07T00:00:00Z",
        "points": 100
      }
    ]
  }
}
```

---

## 📋 Resumen de Estado Actual

### ✅ Endpoints Funcionando
1. `POST /api/auth/login` - Login
2. `GET /api/auth/profile` - Perfil de usuario (con campo `branch`)
3. `GET /api/users` - Lista de usuarios
4. `POST /api/users` - Crear usuario
5. `PUT /api/users/:id` - Actualizar usuario
6. `DELETE /api/users/:id` - Eliminar usuario
7. `GET /api/branches` - Lista de sucursales
8. `POST /api/branches` - Crear sucursal
9. `PUT /api/branches/:id` - Actualizar sucursal
10. `DELETE /api/branches/:id` - Eliminar sucursal
11. `GET /api/logistics/pending-orders` - Órdenes pendientes
12. `GET /api/orders/branch/:branchId` - Órdenes por sucursal
13. `PUT /api/orders/:id/assign-branch` - Asignar orden a sucursal
14. `PUT /api/orders/:id/status` - Actualizar estado de orden
15. `PUT /api/logistics/orders/:id` - Actualizar pago de orden
16. `GET /api/ipos/locations` - Sucursales desde iPOS

### ⚠️ Endpoints con Datos Mock (Necesitan Implementación)
1. `GET /api/dashboard/employee` - Dashboard de empleado
2. `GET /api/employees/tasks` - Tareas de empleado
3. `PUT /api/employees/tasks/:id/status` - Actualizar tarea
4. `POST /api/employees/tasks` - Crear tarea
5. `GET /api/ai/config/:platform` - Configuración de IA
6. `PUT /api/ai/config/:platform` - Actualizar config de IA

### ❓ Endpoints a Verificar (Pueden funcionar parcialmente)
1. `GET /api/conversations` - Conversaciones por plataforma
2. `GET /api/conversations/:platform/:contactId` - Mensajes de conversación
3. `GET /api/messages/all` - Todos los mensajes
4. `POST /api/messages/send` - Enviar mensaje
5. `GET /api/ai/conversation/:platform/:contactId/status` - Estado de IA
6. `PUT /api/ai/conversation/:platform/:contactId/toggle` - Toggle IA

---

## 🔒 Consideraciones de Seguridad

1. **Filtrado por Sucursal:**
   - Los empleados solo deben ver datos de su sucursal
   - Validar `branch_id` en el backend, no confiar en el frontend

2. **Roles y Permisos:**
   - Admin: acceso total
   - Logistics: ver todas las sucursales
   - Empleado: solo su sucursal

3. **Validación de Token:**
   - Todos los endpoints deben validar el JWT
   - Verificar que el usuario tenga permiso para la acción

---

## 📊 Formato de Respuestas

Todos los endpoints deben seguir este formato:

**Éxito:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa",
  "timestamp": "2025-01-14T12:00:00Z"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error al procesar la solicitud",
  "message": "Descripción detallada del error",
  "details": "Información técnica adicional",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-14T12:00:00Z"
}
```

**Con Paginación:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

---

## 🚀 Priorización de Implementación

### Sprint 1 (Crítico)
1. ✅ Campo `branch` en autenticación
2. Endpoint `GET /api/dashboard/employee`
3. Verificar y mejorar endpoints de conversaciones/mensajes

### Sprint 2 (Alta Prioridad)
4. Sistema de tareas para empleados
5. Mejoras en endpoint de mensajes
6. Estadísticas por sucursal

### Sprint 3 (Media Prioridad)
7. Configuración de IA
8. Control de IA por conversación
9. Filtros adicionales en órdenes

### Sprint 4 (Baja Prioridad - Futuro)
10. Sistema de gamificación
11. Logs de IA
12. Reportes avanzados

---

## 📞 Contacto y Soporte

Para dudas o aclaraciones sobre estos requerimientos:
- Revisar la implementación actual en el código frontend
- Los componentes están en `/src/app/dashboard/`
- Los tipos están definidos en `/src/types/api.ts`
- Los clientes API están en `/src/lib/api-client.ts`

**Nota:** El dashboard frontend está completamente funcional y listo para consumir estos endpoints una vez implementados.
