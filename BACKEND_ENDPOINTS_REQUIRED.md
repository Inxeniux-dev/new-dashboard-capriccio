# Endpoints Requeridos para el Backend - Sistema de Categorización

## 📋 Resumen

Este documento detalla TODOS los endpoints que el equipo de backend debe implementar para que el módulo de administración de categorías funcione completamente.

**Estado Actual:** ✅ Solo 3 endpoints implementados (GET categories, GET options, POST categorize)
**Estado Requerido:** ⚠️ Se necesitan 15 endpoints adicionales

---

## 🔴 ENDPOINTS CRÍTICOS A IMPLEMENTAR

### 1. CATEGORÍAS (4 endpoints)

#### 1.1 Actualizar Categoría
```http
PUT /api/categories/{id}
Authorization: Bearer {TOKEN}
Content-Type: application/json

Body:
{
  "name": "Chocolate Premium",
  "description": "Productos de chocolate de alta calidad",
  "display_order": 1,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Categoría actualizada exitosamente",
  "data": {
    "id": 1,
    "code": "CHOCOLATE",
    "name": "Chocolate Premium",
    "description": "Productos de chocolate de alta calidad",
    "display_order": 1,
    "is_active": true
  },
  "affectedProducts": 45
}
```

**Comportamiento esperado:**
- Actualizar el registro de la categoría
- Actualizar TODOS los productos que tienen `category_id = {id}`
- Retornar el número de productos afectados
- NO permitir cambiar el `code` (es inmutable)

---

#### 1.2 Eliminar Categoría
```http
DELETE /api/categories/{id}
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "Categoría eliminada exitosamente",
  "affectedProducts": 45
}
```

**Comportamiento esperado:**
- **OPCIÓN RECOMENDADA**: Soft delete (marcar `is_active = false`)
- **OPCIÓN ALTERNATIVA**: Hard delete con cascada
- Si hay productos activos relacionados, retornar error 400:
  ```json
  {
    "success": false,
    "message": "No se puede eliminar. Hay 45 productos activos usando esta categoría"
  }
  ```

---

#### 1.3 Activar/Desactivar Categoría
```http
PATCH /api/categories/{id}/toggle-status
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "Estado de categoría actualizado",
  "data": {
    "id": 1,
    "code": "CHOCOLATE",
    "name": "Chocolate",
    "is_active": false
  }
}
```

**Comportamiento esperado:**
- Invertir el valor de `is_active` (true → false, false → true)
- Los productos relacionados se mantienen pero la categoría no aparece en selectores

---

#### 1.4 Contar Productos Afectados
```http
GET /api/categories/{id}/products-count
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "count": 45,
  "products": [
    {
      "product_id": "PROD001",
      "name": "Chocolate Oscuro 50g"
    },
    {
      "product_id": "PROD002",
      "name": "Chocolate con Leche 100g"
    }
    // ... hasta 10 productos máximo
  ]
}
```

---

### 2. SUBCATEGORÍAS (4 endpoints)

#### 2.1 Crear Subcategoría
```http
POST /api/categories/{categoryId}/subcategories
Authorization: Bearer {TOKEN}
Content-Type: application/json

Body:
{
  "code": "RUBY",
  "name": "Ruby",
  "display_order": 4
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subcategoría creada exitosamente",
  "data": {
    "id": 11,
    "code": "RUBY",
    "name": "Ruby",
    "category_id": 1,
    "display_order": 4,
    "is_active": true
  }
}
```

---

#### 2.2 Actualizar Subcategoría
```http
PUT /api/categories/subcategories/{id}
Authorization: Bearer {TOKEN}
Content-Type: application/json

Body:
{
  "name": "Chocolate Ruby",
  "category_id": 1,
  "display_order": 4,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subcategoría actualizada exitosamente",
  "data": {
    "id": 11,
    "code": "RUBY",
    "name": "Chocolate Ruby",
    "category_id": 1,
    "display_order": 4,
    "is_active": true
  },
  "affectedProducts": 12
}
```

**Comportamiento esperado:**
- Actualizar el registro de la subcategoría
- Actualizar TODOS los productos que tienen `subcategory_id = {id}`
- Retornar el número de productos afectados
- NO permitir cambiar el `code` (es inmutable)

---

#### 2.3 Eliminar Subcategoría
```http
DELETE /api/categories/subcategories/{id}
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "Subcategoría eliminada exitosamente",
  "affectedProducts": 12
}
```

**Comportamiento esperado:** (mismo que categorías)

---

#### 2.4 Contar Productos Afectados
```http
GET /api/categories/subcategories/{id}/products-count
Authorization: Bearer {TOKEN}
```

**Response:** (mismo formato que categorías)

---

### 3. PRESENTACIONES (7 endpoints)

#### 3.1 Obtener Todas las Presentaciones
```http
GET /api/categories/presentations
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "BOTE_CHICO",
      "name": "Bote chico",
      "size_info": "250g",
      "is_default": false,
      "is_active": true
    },
    {
      "id": 4,
      "code": "BARRA_INDIVIDUAL",
      "name": "Barra individual",
      "size_info": "50g",
      "is_default": true,
      "is_active": true
    }
  ]
}
```

---

#### 3.2 Crear Presentación
```http
POST /api/categories/presentations
Authorization: Bearer {TOKEN}
Content-Type: application/json

Body:
{
  "code": "BARRA_XL",
  "name": "Barra Extra Grande",
  "size_info": "300g",
  "is_default": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Presentación creada exitosamente",
  "data": {
    "id": 17,
    "code": "BARRA_XL",
    "name": "Barra Extra Grande",
    "size_info": "300g",
    "is_default": false,
    "is_active": true
  }
}
```

---

#### 3.3 Actualizar Presentación
```http
PUT /api/categories/presentations/{id}
Authorization: Bearer {TOKEN}
Content-Type: application/json

Body:
{
  "name": "Barra Extra Grande Premium",
  "size_info": "350g",
  "is_default": false,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Presentación actualizada exitosamente",
  "data": {
    "id": 17,
    "code": "BARRA_XL",
    "name": "Barra Extra Grande Premium",
    "size_info": "350g",
    "is_default": false,
    "is_active": true
  },
  "affectedProducts": 8
}
```

**Comportamiento esperado:** (mismo que categorías)

---

#### 3.4 Eliminar Presentación
```http
DELETE /api/categories/presentations/{id}
Authorization: Bearer {TOKEN}
```

**Response:** (mismo que categorías)

---

#### 3.5 Activar/Desactivar Presentación
```http
PATCH /api/categories/presentations/{id}/toggle-status
Authorization: Bearer {TOKEN}
```

**Response:** (mismo formato que categorías)

---

#### 3.6 Marcar como Default ⭐ **IMPORTANTE**
```http
PATCH /api/categories/presentations/{id}/set-default
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "Presentación marcada como default",
  "data": {
    "id": 17,
    "code": "BARRA_XL",
    "name": "Barra Extra Grande Premium",
    "size_info": "350g",
    "is_default": true,
    "is_active": true
  }
}
```

**Comportamiento esperado:**
- Marcar `is_default = true` para esta presentación
- Marcar `is_default = false` para TODAS las demás presentaciones (solo puede haber una default)

---

#### 3.7 Contar Productos Afectados
```http
GET /api/categories/presentations/{id}/products-count
Authorization: Bearer {TOKEN}
```

**Response:** (mismo formato que categorías)

---

## 📊 Tabla Resumen de Endpoints

| Recurso | Método | Endpoint | Estado | Prioridad |
|---------|--------|----------|--------|-----------|
| Categorías | GET | `/api/categories` | ✅ Implementado | - |
| Categorías | POST | `/api/categories` | ✅ Implementado | - |
| Categorías | PUT | `/api/categories/{id}` | ❌ Falta | 🔴 Alta |
| Categorías | DELETE | `/api/categories/{id}` | ❌ Falta | 🔴 Alta |
| Categorías | PATCH | `/api/categories/{id}/toggle-status` | ❌ Falta | 🟡 Media |
| Categorías | GET | `/api/categories/{id}/products-count` | ❌ Falta | 🟡 Media |
| Categorías | GET | `/api/categories/options` | ✅ Implementado | - |
| Categorías | GET | `/api/categories/hierarchy` | ✅ Implementado | - |
| Subcategorías | POST | `/api/categories/{catId}/subcategories` | ❌ Falta | 🔴 Alta |
| Subcategorías | PUT | `/api/categories/subcategories/{id}` | ❌ Falta | 🔴 Alta |
| Subcategorías | DELETE | `/api/categories/subcategories/{id}` | ❌ Falta | 🔴 Alta |
| Subcategorías | PATCH | `/api/categories/subcategories/{id}/toggle-status` | ❌ Falta | 🟡 Media |
| Subcategorías | GET | `/api/categories/subcategories/{id}/products-count` | ❌ Falta | 🟡 Media |
| Presentaciones | GET | `/api/categories/presentations` | ❌ Falta | 🔴 Alta |
| Presentaciones | POST | `/api/categories/presentations` | ❌ Falta | 🔴 Alta |
| Presentaciones | PUT | `/api/categories/presentations/{id}` | ❌ Falta | 🔴 Alta |
| Presentaciones | DELETE | `/api/categories/presentations/{id}` | ❌ Falta | 🔴 Alta |
| Presentaciones | PATCH | `/api/categories/presentations/{id}/toggle-status` | ❌ Falta | 🟡 Media |
| Presentaciones | PATCH | `/api/categories/presentations/{id}/set-default` | ❌ Falta | 🟡 Media |
| Presentaciones | GET | `/api/categories/presentations/{id}/products-count` | ❌ Falta | 🟡 Media |
| Productos | POST | `/api/categories/products/{id}/categorize` | ✅ Implementado | - |

**Total: 21 endpoints**
- ✅ Implementados: 5 (24%)
- ❌ Faltan: 16 (76%)

---

## 🗄️ Estructura de Base de Datos Requerida

### Tabla: `product_categories`
```sql
CREATE TABLE product_categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `product_subcategories`
```sql
CREATE TABLE product_subcategories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  category_id INTEGER REFERENCES product_categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `product_presentations`
```sql
CREATE TABLE product_presentations (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  size_info VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `product_categorization` (relación con productos)
```sql
CREATE TABLE product_categorization (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  category_id INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
  subcategory_id INTEGER REFERENCES product_subcategories(id) ON DELETE SET NULL,
  presentation_id INTEGER REFERENCES product_presentations(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id)
);
```

---

## 🔒 Validaciones Requeridas

### Al Crear/Actualizar:
1. **Códigos:** Solo letras mayúsculas, números y guiones bajos
2. **Nombres:** No vacíos, máximo 100 caracteres
3. **Codes:** Únicos en toda la tabla
4. **display_order:** Mayor o igual a 0

### Al Eliminar:
1. Verificar si hay productos activos relacionados
2. Si hay productos, retornar error 400 con el conteo
3. Opción: Permitir eliminar solo si `force=true` en query params

### Al Marcar Default:
1. Solo UNA presentación puede ser default
2. Al marcar una nueva, desmarcar todas las demás

---

## 🚀 Priorización de Implementación

### Fase 1 - CRÍTICO (para funcionalidad básica) 🔴
1. `PUT /api/categories/{id}` - Editar categorías
2. `PUT /api/categories/subcategories/{id}` - Editar subcategorías
3. `GET /api/categories/presentations` - Listar presentaciones
4. `PUT /api/categories/presentations/{id}` - Editar presentaciones
5. `POST /api/categories/presentations` - Crear presentaciones

### Fase 2 - IMPORTANTE (para gestión completa) 🟠
6. `DELETE /api/categories/{id}` - Eliminar categorías
7. `DELETE /api/categories/subcategories/{id}` - Eliminar subcategorías
8. `DELETE /api/categories/presentations/{id}` - Eliminar presentaciones
9. `POST /api/categories/{catId}/subcategories` - Crear subcategorías

### Fase 3 - DESEABLE (para mejor UX) 🟡
10. `GET /api/categories/{id}/products-count` - Conteo de productos
11. `GET /api/categories/subcategories/{id}/products-count`
12. `GET /api/categories/presentations/{id}/products-count`
13. `PATCH /api/categories/{id}/toggle-status` - Toggle status
14. `PATCH /api/categories/presentations/{id}/set-default` - Marcar default

---

## 📝 Notas de Implementación

### Actualización en Cascada:
Cuando se actualiza el `name` de una categoría/subcategoría/presentación:
```sql
-- Ejemplo para categoría
UPDATE product_categories
SET name = 'Nuevo Nombre'
WHERE id = 1;

-- Los productos ya tienen la relación por ID,
-- por lo que automáticamente verán el nuevo nombre
```

### Soft Delete Recomendado:
```sql
-- En lugar de DELETE
UPDATE product_categories
SET is_active = false
WHERE id = 1;

-- Los productos mantienen la relación pero la categoría
-- no aparece en selectores nuevos
```

### Trigger para updated_at:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_categories_updated_at
BEFORE UPDATE ON product_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## ✅ Testing Checklist

Para cada endpoint, verificar:
- [ ] Autenticación requerida
- [ ] Validación de datos de entrada
- [ ] Manejo de errores (404, 400, 500)
- [ ] Respuestas con formato correcto
- [ ] Actualización en cascada de productos
- [ ] Conteo de productos afectados
- [ ] Logs de operaciones

---

## 🎯 Objetivo Final

Permitir que los administradores:
1. ✅ Creen nuevas categorías/subcategorías/presentaciones
2. ✅ Editen las existentes (nombre, descripción, orden)
3. ✅ Eliminen las que no se usen
4. ✅ Vean cuántos productos se verán afectados
5. ✅ Activen/desactiven sin eliminar
6. ✅ Marquen presentaciones por defecto

**TODO esto con propagación automática a los productos relacionados.**

---

**Fecha:** 14 de Noviembre de 2025
**Frontend Status:** ✅ Completo y listo
**Backend Status:** ⚠️ Requiere implementación de 16 endpoints
