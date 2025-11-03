# Requerimientos de Backend - Detalles de Productos en Órdenes

## Problema Actual

Actualmente, los productos en las órdenes no se están mostrando correctamente en el dashboard porque el backend no está enviando los datos en el formato esperado.

---

## Endpoints Afectados

Todos los endpoints que retornan órdenes (`Order`):

1. **GET** `/api/orders` - Obtener todas las órdenes
2. **GET** `/api/orders/{orderId}` - Obtener orden por ID
3. **GET** `/api/orders/branch/{branchId}` - Obtener órdenes por sucursal
4. **GET** `/api/logistics/orders/pending` - Órdenes pendientes
5. **GET** `/api/logistics/orders/{orderId}` - Orden específica de logística
6. **PUT** `/api/orders/{orderId}/status` - Actualizar estado (retorna orden)
7. **PUT** `/api/orders/{orderId}/assign-branch` - Asignar a sucursal (retorna orden)
8. **POST** `/api/orders/create` - Crear orden (retorna orden)

---

## Estructura de Datos Requerida

### Objeto Order debe incluir el campo `items`

El campo `items` debe ser un **array de objetos** con la siguiente estructura:

```typescript
interface OrderItem {
  id: string;                    // ID único del item en la orden
  product_id: string;            // ID del producto en el catálogo
  product_name: string;          // Nombre del producto
  quantity: number;              // Cantidad solicitada
  unit_price: number;            // Precio unitario del producto
  subtotal: number;              // Subtotal (quantity * unit_price)
  notes?: string;                // OPCIONAL: Notas especiales del producto
}
```

### Ejemplo de Respuesta Correcta

```json
{
  "success": true,
  "data": {
    "id": "12345",
    "order_number": "ORD-2024-001",
    "customer_name": "Juan Pérez",
    "customer_phone": "+52 999 123 4567",
    "customer_email": "juan@example.com",
    "delivery_address": "Calle Principal #123, Mérida, Yuc.",
    "delivery_date": "2024-01-15T14:00:00.000Z",
    "total_amount": 450.00,
    "status": "assigned",
    "branch_id": "branch-001",
    "branch_name": "Sucursal Centro",
    "platform": "whatsapp",
    "payment_method": "Efectivo",
    "payment_status": "Pendiente",
    "notes": "Entregar antes de las 2pm",
    "logistics_notes": "Cliente en edificio azul",
    "created_at": "2024-01-14T10:30:00.000Z",
    "updated_at": "2024-01-14T10:30:00.000Z",

    // ✅ CAMPO REQUERIDO - items con estructura correcta
    "items": [
      {
        "id": "item-001",
        "product_id": "PROD-123",
        "product_name": "Pizza Hawaiana Grande",
        "quantity": 2,
        "unit_price": 150.00,
        "subtotal": 300.00,
        "notes": "Sin piña, extra queso"
      },
      {
        "id": "item-002",
        "product_id": "PROD-456",
        "product_name": "Refresco Coca-Cola 2L",
        "quantity": 3,
        "unit_price": 50.00,
        "subtotal": 150.00
      }
    ]
  }
}
```

---

## Campos Opcionales (Deprecados)

Estos campos pueden existir por compatibilidad, pero **NO deben ser la fuente principal**:

- ❌ `order_items` - Deprecado
- ❌ `products` - Deprecado

**Importante:** El frontend intentará leer primero `items`, luego `products` y finalmente `order_items` como fallback, pero **la implementación correcta debe usar `items`**.

---

## Validaciones Requeridas

### En el Backend, cada orden debe:

1. **SIEMPRE incluir el campo `items`** con al menos un producto
2. Cada item debe tener **todos los campos obligatorios**:
   - ✅ `id` (string)
   - ✅ `product_id` (string)
   - ✅ `product_name` (string)
   - ✅ `quantity` (number, mayor a 0)
   - ✅ `unit_price` (number, mayor o igual a 0)
   - ✅ `subtotal` (number, igual a quantity * unit_price)
3. El campo `notes` es **opcional** pero debe estar presente como `null` o `string`

### Cálculos

```javascript
// El subtotal debe calcularse correctamente:
item.subtotal = item.quantity * item.unit_price

// El total de la orden debe ser la suma de todos los subtotales:
order.total_amount = sum(items.map(item => item.subtotal))
```

---

## Casos de Uso

### 1. Empleado de Sucursal ve sus órdenes
**Endpoint:** `GET /api/orders/branch/{branchId}`

El empleado necesita ver:
- Qué productos debe preparar
- Cuántas unidades de cada uno
- Notas especiales de cada producto
- El ID del producto para verificar inventario

### 2. Logística asigna orden a sucursal
**Endpoint:** `PUT /api/orders/{orderId}/assign-branch`

Después de asignar, el empleado debe poder ver inmediatamente todos los productos.

### 3. Ver detalle de orden individual
**Endpoint:** `GET /api/orders/{orderId}`

Debe mostrar el desglose completo de productos con precios y cantidades.

---

## Testing

### Endpoint de Prueba
```bash
GET /api/orders/branch/{branchId}?limit=1
```

### Respuesta Esperada
Debe retornar al menos una orden con:
- Campo `items` presente
- Al menos 1 producto en el array
- Todos los campos requeridos en cada producto

### Ejemplo de Testing con cURL

```bash
curl -X GET "https://api-meta-service.vercel.app/api/orders/branch/branch-001?limit=1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Checklist para el Equipo de Backend

- [ ] Actualizar todos los endpoints que retornan `Order` para incluir el campo `items`
- [ ] Asegurar que `items` sea un array de objetos con la estructura `OrderItem`
- [ ] Validar que todos los campos obligatorios estén presentes
- [ ] Calcular correctamente `subtotal` para cada item
- [ ] Verificar que `total_amount` = suma de todos los `subtotal`
- [ ] Incluir el campo `notes` en cada item (puede ser `null`)
- [ ] Probar con órdenes reales en desarrollo
- [ ] Verificar que las órdenes antiguas se migran correctamente
- [ ] Documentar el cambio en la API

---

## Migración de Datos Existentes

Si tienen órdenes existentes con `products` u `order_items`:

1. Crear un script de migración que convierta los datos al formato `items`
2. Mapear los campos antiguos a la nueva estructura
3. Validar que no se pierda información
4. Mantener los campos antiguos por compatibilidad (opcional)

---

## Soporte

Si tienen preguntas o necesitan aclaraciones sobre esta estructura:

1. Revisar el archivo TypeScript de tipos: `/src/types/api.ts` (líneas 245-253)
2. Ver la implementación del frontend en: `/src/components/OrderDetailsModal.tsx` (líneas 181-271)
3. Contactar al equipo de frontend para coordinar pruebas

---

## Fecha de Implementación Sugerida

**Prioridad:** Alta
**Estimación:** 2-4 horas de desarrollo + testing
**Impacto:** Los empleados no pueden ver qué productos preparar sin esta información

---

**Documento generado:** 2024
**Actualizado por:** Equipo Frontend
