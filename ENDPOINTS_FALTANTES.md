# Endpoints Faltantes / Necesarios

Este documento lista los endpoints que se necesitan implementar en el backend pero que no están disponibles en la API actual.

## 🔴 Endpoints Críticos Faltantes

### 1. Gestión de Usuarios (Admin)
**Endpoint necesario**: `GET /api/users`
- **Descripción**: Listar todos los usuarios del sistema con paginación
- **Respuesta esperada**: Lista de usuarios con id, email, role, full_name, branch_id, active, created_at
- **Parámetros**: limit, offset, role (filtro opcional)

**Endpoint necesario**: `POST /api/users`
- **Descripción**: Crear un nuevo usuario
- **Body**: { email, password, role, full_name, branch_id? }
- **Respuesta**: Usuario creado

**Endpoint necesario**: `PUT /api/users/{userId}`
- **Descripción**: Actualizar información de un usuario
- **Body**: { email?, role?, full_name?, branch_id?, active? }

**Endpoint necesario**: `DELETE /api/users/{userId}`
- **Descripción**: Eliminar/desactivar un usuario

**Endpoint necesario**: `GET /api/users/{userId}`
- **Descripción**: Obtener detalles de un usuario específico

### 2. Gestión de Roles y Permisos
**Endpoint necesario**: `GET /api/roles`
- **Descripción**: Listar todos los roles disponibles
- **Respuesta**: [{ id, name, description, permissions[] }]

**Endpoint necesario**: `GET /api/permissions`
- **Descripción**: Listar todos los permisos disponibles en el sistema

### 3. Gestión de Sucursales/Tiendas
**Endpoint actual**: `GET /api/logistics/stores` ✅ (existe)
- Verificar que retorne: id, name, address, phone, active, manager_id

**Endpoint necesario**: `POST /api/stores`
- **Descripción**: Crear una nueva sucursal
- **Body**: { name, address, phone, city, state, manager_id? }

**Endpoint necesario**: `PUT /api/stores/{storeId}`
- **Descripción**: Actualizar información de una sucursal

**Endpoint necesario**: `DELETE /api/stores/{storeId}`
- **Descripción**: Eliminar/desactivar una sucursal

### 4. Órdenes por Sucursal (Empleado)
**Endpoint necesario**: `GET /api/orders/branch/{branchId}`
- **Descripción**: Obtener órdenes asignadas a una sucursal específica
- **Parámetros**: status (pending, in_progress, completed, cancelled)
- **Respuesta**: Lista de órdenes con todos sus detalles

**Endpoint necesario**: `PUT /api/orders/{orderId}/status`
- **Descripción**: Actualizar el estado de una orden
- **Body**: { status: "pending" | "in_progress" | "completed" | "cancelled" }

**Endpoint necesario**: `PUT /api/orders/{orderId}/assign-branch`
- **Descripción**: Asignar una orden a una sucursal (usado por Logística)
- **Body**: { branch_id, delivery_date, notes? }

### 5. Autenticación
**Endpoint necesario**: `POST /api/auth/login`
- **Descripción**: Iniciar sesión
- **Body**: { email, password }
- **Respuesta**: { token, user: { id, email, role, full_name, branch_id } }

**Endpoint necesario**: `POST /api/auth/logout`
- **Descripción**: Cerrar sesión (invalidar token)

**Endpoint necesario**: `POST /api/auth/refresh`
- **Descripción**: Refrescar token de autenticación

**Endpoint actual parcial**: `POST /api/auth/profile` ✅ (existe pero solo recibe email)
- Debería funcionar con el token Bearer sin necesidad de enviar email en el body

### 6. Dashboard Estadísticas por Rol
**Endpoint necesario**: `GET /api/dashboard/admin`
- **Descripción**: Estadísticas generales para administrador
- **Respuesta**: { total_orders, pending_orders, total_users, active_conversations, orders_by_branch[], revenue_stats }

**Endpoint necesario**: `GET /api/dashboard/logistics`
- **Descripción**: Estadísticas para usuario de logística
- **Respuesta**: { pending_assignments, today_deliveries, unassigned_orders, conversation_summary }

**Endpoint necesario**: `GET /api/dashboard/employee`
- **Descripción**: Estadísticas para empleado de sucursal
- **Respuesta**: { my_pending_orders, today_orders, completed_today, branch_stats }

### 7. Notificaciones
**Endpoint necesario**: `GET /api/notifications`
- **Descripción**: Obtener notificaciones del usuario
- **Parámetros**: read (true/false), limit, offset

**Endpoint necesario**: `PUT /api/notifications/{notificationId}/mark-read`
- **Descripción**: Marcar notificación como leída

## ⚠️ Endpoints Existentes a Verificar

Estos endpoints existen pero necesito verificar que retornen la información necesaria:

1. **`GET /api/conversations`** - Verificar que permita filtrar por sucursal/usuario
2. **`GET /api/orders`** - Verificar filtros por sucursal, estado, fecha
3. **`GET /api/logistics/orders/pending`** ✅ - Existe
4. **`GET /api/logistics/dashboard`** ✅ - Existe
5. **`GET /api/stats`** - Verificar que retorne estadísticas globales

## 📝 Notas de Implementación

### Workarounds Temporales
Mientras se implementan los endpoints faltantes, usaré:
- Datos mock para gestión de usuarios
- localStorage para simular autenticación básica
- Filtrado del lado del cliente cuando sea posible

### Prioridad de Implementación Backend
1. **Alta**: Autenticación (login/logout), Gestión de usuarios
2. **Alta**: Órdenes por sucursal, Asignar órdenes a sucursales
3. **Media**: Dashboard estadísticas por rol
4. **Baja**: Notificaciones, Gestión de sucursales (CRUD completo)

### Variables de Entorno Necesarias
```env
NEXT_PUBLIC_API_URL=https://api-meta-service.vercel.app
NEXT_PUBLIC_API_TOKEN=sk-meta-xxxxx
```
