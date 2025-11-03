# 🚨 SOLICITUD URGENTE - Productos Faltantes en Órdenes

## Problema Identificado

**Estado:** 🔴 CRÍTICO - Los empleados NO pueden ver qué productos deben preparar

**Fecha:** 2024-10-30

**Afectados:** Todos los usuarios (Empleados, Logística, Admin)

---

## Descripción del Problema

Al consultar las órdenes desde el frontend, **NO se están recibiendo los productos**.

El objeto `Order` que retorna el backend **no incluye ninguno de estos campos:**
- ❌ `items`
- ❌ `products`
- ❌ `order_items`

### Ejemplo de lo que está llegando actualmente:

```json
{
  "id": "19",
  "order_number": "Orden #19",
  "customer_name": "No especificado",
  "customer_phone": "5214775813450",
  "delivery_address": "Santa Úrsula 172A, Portales de Santa Úrsula, León, Guanajuato 37290",
  "delivery_date": "2025-10-31T00:00:00.000Z",
  "total_amount": 542.00,
  "status": "in_progress",
  "payment_method": "link-temp",
  "created_at": "2025-10-27T00:00:00.000Z",

  // ❌ FALTAN ESTOS CAMPOS:
  "items": null,        // o undefined
  "products": null,     // o undefined
  "order_items": null   // o undefined
}
```

**Nota:** La orden tiene un `total_amount` de $542.00, lo que indica que SÍ tiene productos, pero no se están enviando en la respuesta.

---

## Lo que DEBE enviar el Backend

### ✅ Formato Correcto Requerido:

```json
{
  "id": "19",
  "order_number": "Orden #19",
  "customer_name": "No especificado",
  "customer_phone": "5214775813450",
  "delivery_address": "Santa Úrsula 172A, Portales de Santa Úrsula, León, Guanajuato 37290",
  "delivery_date": "2025-10-31T00:00:00.000Z",
  "total_amount": 542.00,
  "status": "in_progress",
  "payment_method": "link-temp",
  "created_at": "2025-10-27T00:00:00.000Z",

  // ✅ CAMPO REQUERIDO - DEBE INCLUIRSE
  "items": [
    {
      "id": "item-001",
      "product_id": "PROD-123",
      "product_name": "Producto A",
      "quantity": 2,
      "unit_price": 150.00,
      "subtotal": 300.00,
      "notes": "Especificaciones del cliente"  // opcional
    },
    {
      "id": "item-002",
      "product_id": "PROD-456",
      "product_name": "Producto B",
      "quantity": 1,
      "unit_price": 242.00,
      "subtotal": 242.00,
      "notes": null
    }
  ]
}
```

---

## Estructura del Campo `items`

### Cada objeto en el array `items` DEBE tener:

| Campo | Tipo | Requerido | Descripción | Ejemplo |
|-------|------|-----------|-------------|---------|
| `id` | string | ✅ Sí | ID único del item en la orden | `"item-001"` |
| `product_id` | string | ✅ Sí | ID del producto en el catálogo | `"PROD-123"` |
| `product_name` | string | ✅ Sí | Nombre del producto | `"Pizza Hawaiana Grande"` |
| `quantity` | number | ✅ Sí | Cantidad solicitada (> 0) | `2` |
| `unit_price` | number | ✅ Sí | Precio unitario (≥ 0) | `150.00` |
| `subtotal` | number | ✅ Sí | Subtotal (quantity × unit_price) | `300.00` |
| `notes` | string \| null | ⚠️ Opcional | Notas especiales del producto | `"Sin cebolla"` |

---

## Endpoints que DEBEN Actualizarse

**TODOS** los endpoints que retornan objetos `Order` deben incluir el campo `items`:

### 1. Obtener órdenes por sucursal (MUY IMPORTANTE)
```http
GET /api/orders/branch/{branchId}
```
**Usado por:** Empleados de sucursal
**Prioridad:** 🔴 CRÍTICA

### 2. Obtener todas las órdenes
```http
GET /api/orders
```
**Usado por:** Logística, Admin

### 3. Obtener orden específica
```http
GET /api/orders/{orderId}
```
**Usado por:** Todos los roles

### 4. Órdenes pendientes de logística
```http
GET /api/logistics/orders/pending
```
**Usado por:** Logística

### 5. Orden específica de logística
```http
GET /api/logistics/orders/{orderId}
```
**Usado por:** Logística

### 6. Crear orden
```http
POST /api/orders/create
```
**Retorna:** Objeto Order con items

### 7. Actualizar estado
```http
PUT /api/orders/{orderId}/status
```
**Retorna:** Objeto Order con items

### 8. Asignar a sucursal
```http
PUT /api/orders/{orderId}/assign-branch
```
**Retorna:** Objeto Order con items

---

## Validaciones Requeridas

### 1. Cálculo de Subtotales
```javascript
item.subtotal = item.quantity * item.unit_price
```

### 2. Cálculo del Total
```javascript
order.total_amount = sum(items.map(item => item.subtotal))
```

### 3. Validación de Datos
- ✅ Cada orden DEBE tener al menos 1 producto
- ✅ `quantity` debe ser > 0
- ✅ `unit_price` debe ser ≥ 0
- ✅ `subtotal` debe ser correcto
- ✅ `total_amount` debe coincidir con la suma de subtotales

---

## Pruebas Requeridas

### Test 1: Endpoint de Órdenes por Sucursal

```bash
curl -X GET \
  'https://api-meta-service.vercel.app/api/orders/branch/branch-001?limit=1' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json'
```

**Verificar que la respuesta incluya:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "items": [
        {
          "id": "...",
          "product_id": "...",
          "product_name": "...",
          "quantity": 2,
          "unit_price": 100.00,
          "subtotal": 200.00,
          "notes": null
        }
      ]
    }
  ]
}
```

### Test 2: Orden Individual

```bash
curl -X GET \
  'https://api-meta-service.vercel.app/api/orders/19' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json'
```

**Verificar:**
- ✅ Campo `items` presente
- ✅ Al menos 1 producto en el array
- ✅ Todos los campos obligatorios presentes
- ✅ Cálculos correctos

---

## Impacto Actual

### Sin esta corrección:

- ❌ Los empleados **NO pueden ver** qué productos preparar
- ❌ No pueden verificar cantidades
- ❌ No pueden ver especificaciones especiales (notas)
- ❌ No pueden verificar IDs de productos para inventario
- ❌ El sistema muestra: **"⚠️ No se encontraron productos"**

### Con la corrección:

- ✅ Los empleados ven listado completo de productos
- ✅ Pueden verificar cantidades y especificaciones
- ✅ Pueden preparar correctamente los pedidos
- ✅ Mejor experiencia de usuario
- ✅ Menos errores en preparación

---

## Timeline Sugerido

| Tarea | Tiempo Estimado | Prioridad |
|-------|----------------|-----------|
| Actualizar endpoints para incluir `items` | 2-3 horas | 🔴 CRÍTICA |
| Validar cálculos y estructura | 1 hora | 🔴 CRÍTICA |
| Testing con datos reales | 1 hora | 🟡 ALTA |
| Despliegue a producción | 30 min | 🟡 ALTA |
| **TOTAL** | **4-5 horas** | |

---

## Ejemplos Detallados

### Caso 1: Orden con 2 Productos

```json
{
  "id": "19",
  "order_number": "Orden #19",
  "total_amount": 542.00,
  "items": [
    {
      "id": "item-19-1",
      "product_id": "PROD-001",
      "product_name": "Pizza Familiar Hawaiana",
      "quantity": 2,
      "unit_price": 150.00,
      "subtotal": 300.00,
      "notes": "Sin piña, extra queso"
    },
    {
      "id": "item-19-2",
      "product_id": "PROD-002",
      "product_name": "Refresco Coca-Cola 2L",
      "quantity": 4,
      "unit_price": 60.50,
      "subtotal": 242.00,
      "notes": null
    }
  ]
}
```

**Verificación:**
- ✅ Subtotal item 1: 2 × $150.00 = $300.00
- ✅ Subtotal item 2: 4 × $60.50 = $242.00
- ✅ Total: $300.00 + $242.00 = **$542.00** ✓

---

### Caso 2: Orden Simple (1 Producto)

```json
{
  "id": "20",
  "order_number": "Orden #20",
  "total_amount": 250.00,
  "items": [
    {
      "id": "item-20-1",
      "product_id": "PROD-100",
      "product_name": "Pastel de Chocolate",
      "quantity": 1,
      "unit_price": 250.00,
      "subtotal": 250.00,
      "notes": "Decoración: Feliz Cumpleaños"
    }
  ]
}
```

---

## Checklist de Implementación

- [ ] Actualizar endpoint `/api/orders/branch/{branchId}`
- [ ] Actualizar endpoint `/api/orders`
- [ ] Actualizar endpoint `/api/orders/{orderId}`
- [ ] Actualizar endpoint `/api/logistics/orders/pending`
- [ ] Actualizar endpoint `/api/logistics/orders/{orderId}`
- [ ] Actualizar endpoint `POST /api/orders/create`
- [ ] Actualizar endpoint `PUT /api/orders/{orderId}/status`
- [ ] Actualizar endpoint `PUT /api/orders/{orderId}/assign-branch`
- [ ] Validar cálculos de subtotales
- [ ] Validar total de orden
- [ ] Probar con órdenes existentes
- [ ] Probar creación de nuevas órdenes
- [ ] Desplegar a desarrollo
- [ ] Testing con frontend
- [ ] Desplegar a producción

---

## Preguntas Frecuentes

### ¿Por qué se llama `items` y no `products`?

- `items` es más descriptivo (son items de una orden, no solo productos)
- Permite incluir información adicional como `quantity`, `notes`, `subtotal`
- Es el estándar en sistemas de comercio electrónico

### ¿Qué pasa con las órdenes antiguas?

Si tienen órdenes en la base de datos que no tienen `items`, necesitarán:
1. Migrar los datos existentes
2. O devolver un array vacío `[]` si no hay datos disponibles

### ¿El campo `notes` es obligatorio?

No, es opcional. Puede ser `null` o estar ausente. Pero si existe, el frontend lo mostrará en un recuadro especial.

---

## Contacto y Seguimiento

**Equipo Frontend:** Listo para testing
**Documentación:** Ver `BACKEND_REQUIREMENTS_PRODUCTOS.md` y `BACKEND_EJEMPLOS_PRODUCTOS.md`

**Una vez implementado, notificar para:**
1. Testing en desarrollo
2. Validación de datos
3. Deployment coordinado

---

## Referencias

- 📄 `BACKEND_REQUIREMENTS_PRODUCTOS.md` - Especificaciones técnicas completas
- 📄 `BACKEND_EJEMPLOS_PRODUCTOS.md` - Ejemplos detallados de respuestas
- 📄 `TEST_ORDERS_DEBUG.md` - Guía de testing para frontend

---

**Prioridad:** 🔴 CRÍTICA
**Impacto:** ALTO - Funcionalidad bloqueada para empleados
**Tiempo Estimado:** 4-5 horas
**Estado:** ⏳ PENDIENTE DE BACKEND

---

**Generado:** 2024-10-30
**Versión:** 1.0
