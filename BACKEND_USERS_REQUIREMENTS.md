# 👥 Requisitos del Backend - Gestión de Usuarios

## Estado: 🟡 VERIFICACIÓN NECESARIA

**Fecha:** 2024-11-02
**Página:** `/dashboard/admin/users`
**Para:** Backend Team

---

## Resumen

La página de gestión de usuarios ya está implementada en el frontend y requiere los siguientes endpoints del backend. Algunos pueden estar parcialmente implementados, pero necesitan verificación y ajustes.

---

## Endpoints Requeridos

### 1. Listar Usuarios
```http
GET /api/users
```

#### Parámetros Query (opcionales):
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `limit` | number | Límite de resultados | `50` |
| `offset` | number | Desplazamiento para paginación | `0` |
| `role` | string | Filtrar por rol específico | `admin`, `empleado`, `logistics` |

#### Respuesta esperada:
```json
{
  "success": true,
  "data": [
    {
      "id": "user-001",
      "email": "admin@capriccio.com",
      "full_name": "Administrador Principal",
      "role": "admin",
      "branch_id": null,
      "branch": null,
      "active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_login": "2024-11-02T10:30:00.000Z",
      "permissions": ["all"]
    },
    {
      "id": "user-002",
      "email": "empleado1@capriccio.com",
      "full_name": "Juan Pérez",
      "role": "empleado",
      "branch_id": "branch-001",
      "branch": {
        "id": "branch-001",
        "name": "Tienda Central"
      },
      "active": true,
      "created_at": "2024-02-01T00:00:00.000Z",
      "last_login": "2024-11-01T14:20:00.000Z",
      "permissions": ["view_orders", "update_orders"]
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

---

### 2. Obtener Usuario por ID
```http
GET /api/users/{userId}
```

#### Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "id": "user-001",
    "email": "admin@capriccio.com",
    "full_name": "Administrador Principal",
    "role": "admin",
    "branch_id": null,
    "branch": null,
    "active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_login": "2024-11-02T10:30:00.000Z",
    "permissions": ["all"]
  }
}
```

---

### 3. Crear Usuario
```http
POST /api/users
```

#### Body (JSON):
```json
{
  "email": "nuevo@capriccio.com",
  "password": "SecurePassword123!",
  "full_name": "Nombre Completo",
  "role": "empleado",
  "branch_id": "branch-001"  // Opcional
}
```

#### Validaciones requeridas:
- ✅ Email único (no duplicado)
- ✅ Email formato válido
- ✅ Password mínimo 8 caracteres
- ✅ Rol válido: `admin`, `empleado`, `logistics`, `manager`
- ✅ Si se proporciona branch_id, debe existir

#### Respuesta esperada (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "user-new-001",
    "email": "nuevo@capriccio.com",
    "full_name": "Nombre Completo",
    "role": "empleado",
    "branch_id": "branch-001",
    "branch": {
      "id": "branch-001",
      "name": "Tienda Central"
    },
    "active": true,
    "created_at": "2024-11-02T12:00:00.000Z",
    "permissions": ["view_orders", "update_orders"]
  },
  "message": "Usuario creado exitosamente"
}
```

---

### 4. Actualizar Usuario
```http
PUT /api/users/{userId}
```

#### Body (JSON) - Todos los campos son opcionales:
```json
{
  "email": "actualizado@capriccio.com",
  "full_name": "Nombre Actualizado",
  "role": "manager",
  "branch_id": "branch-002",
  "active": false
}
```

**Nota importante:** NO se debe actualizar la contraseña en este endpoint. Usar un endpoint separado para cambio de contraseña.

#### Validaciones:
- ✅ Si se actualiza email, verificar que sea único
- ✅ Si se actualiza rol, verificar que sea válido
- ✅ Si se actualiza branch_id, verificar que existe

#### Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "id": "user-001",
    "email": "actualizado@capriccio.com",
    "full_name": "Nombre Actualizado",
    "role": "manager",
    "branch_id": "branch-002",
    "branch": {
      "id": "branch-002",
      "name": "Tienda Nueva"
    },
    "active": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-11-02T12:30:00.000Z"
  },
  "message": "Usuario actualizado exitosamente"
}
```

---

### 5. Eliminar Usuario
```http
DELETE /api/users/{userId}
```

#### Consideraciones:
- ⚠️ Preferiblemente hacer "soft delete" (marcar como inactivo)
- ⚠️ No permitir eliminar el último usuario admin
- ⚠️ No permitir que un usuario se elimine a sí mismo

#### Respuesta esperada:
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

---

## Endpoints Adicionales Recomendados

### 6. Cambiar Contraseña (Opcional pero recomendado)
```http
PUT /api/users/{userId}/password
```

#### Body:
```json
{
  "current_password": "OldPassword123!",  // Solo si es el propio usuario
  "new_password": "NewPassword456!"
}
```

### 7. Resetear Contraseña (Opcional)
```http
POST /api/users/{userId}/reset-password
```

#### Body:
```json
{
  "temporary_password": "TempPass123!"
}
```

---

## Roles y Permisos

### Roles disponibles en el sistema:

| Rol | Código | Permisos típicos | Descripción |
|-----|--------|------------------|-------------|
| Administrador | `admin` o `administrador` | Todos | Acceso completo al sistema |
| Logística | `logistics` o `logistica` | Gestión de órdenes y entregas | Coordinación de pedidos |
| Manager | `manager` | Gestión de sucursal | Administra una sucursal específica |
| Empleado | `empleado` o `employee` | Órdenes de su sucursal | Operaciones básicas |

**Nota:** El backend debe aceptar ambas versiones (español/inglés) de los roles.

---

## Validaciones de Negocio

1. **Email único**: No permitir emails duplicados
2. **Rol admin**: Al menos un usuario debe tener rol admin
3. **Sucursales**:
   - Empleados y managers DEBEN tener sucursal asignada
   - Admin y logística pueden o no tener sucursal
4. **Estado activo**: Por defecto, nuevos usuarios deben crearse como activos
5. **Permisos**: Asignar automáticamente según el rol

---

## Manejo de Errores

### Errores esperados:

| Código | Situación | Mensaje |
|--------|-----------|---------|
| 400 | Datos inválidos | "Los datos proporcionados son inválidos" |
| 401 | No autenticado | "Debe iniciar sesión" |
| 403 | Sin permisos | "No tiene permisos para esta acción" |
| 404 | Usuario no encontrado | "Usuario no encontrado" |
| 409 | Email duplicado | "El email ya está registrado" |
| 422 | Validación fallida | "Error de validación: [detalles]" |

---

## Casos de Prueba

### 1. Crear usuario empleado con sucursal
```json
POST /api/users
{
  "email": "test_empleado@capriccio.com",
  "password": "Test1234!",
  "full_name": "Empleado Test",
  "role": "empleado",
  "branch_id": "branch-001"
}
```

### 2. Actualizar rol de usuario
```json
PUT /api/users/{userId}
{
  "role": "manager"
}
```

### 3. Desactivar usuario
```json
PUT /api/users/{userId}
{
  "active": false
}
```

### 4. Listar solo administradores
```http
GET /api/users?role=admin
```

---

## Seguridad

### Requerimientos importantes:

1. **Contraseñas**:
   - Nunca retornar contraseñas en las respuestas
   - Hashear contraseñas con bcrypt o similar
   - Mínimo 8 caracteres

2. **Autenticación**:
   - Todos los endpoints requieren autenticación
   - Solo admin puede crear/editar/eliminar usuarios

3. **Autorización**:
   - Verificar que el usuario tenga permisos de admin
   - Los usuarios solo pueden editar su propio perfil (excepto rol y active)

---

## Estado Actual del Frontend

✅ **Ya implementado en el frontend:**
- Tabla de usuarios con paginación
- Modal de crear/editar usuario
- Botones de eliminar con confirmación
- Badges de rol y estado
- Integración con sucursales
- Manejo de errores

⏳ **Esperando del backend:**
- Confirmación de que todos los endpoints funcionan
- Manejo correcto de roles en español/inglés
- Validaciones de negocio
- Respuestas con la estructura esperada

---

## Notas para el Backend

1. **Normalización de roles**: El frontend envía roles como `admin`, `empleado`, `logistics`, `manager`. El backend debe aceptar también las variantes en español (`administrador`, `logistica`).

2. **Campo branch**: Cuando se retorna un usuario, incluir el objeto `branch` completo si tiene `branch_id`, no solo el ID.

3. **Soft delete**: Preferiblemente implementar soft delete (marcar como inactivo) en lugar de eliminar físicamente.

4. **Paginación**: Aunque no es crítico inicialmente, sería bueno soportar paginación para cuando haya muchos usuarios.

---

## Prioridad: 🟡 MEDIA-ALTA

La gestión de usuarios es funcionalidad core del sistema administrativo.

---

**Archivo creado:** 2024-11-02
**Para:** Equipo de Backend