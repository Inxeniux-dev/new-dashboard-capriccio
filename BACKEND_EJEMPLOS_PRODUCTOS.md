# Ejemplos de Respuestas API - Productos en Órdenes

Este documento muestra ejemplos concretos de cómo el backend debe estructurar las respuestas.

---

## ❌ Respuesta INCORRECTA (Actual)

### Problemas:
- Campo `items` ausente o vacío
- Usa `products` o `order_items` como objetos genéricos
- Faltan campos obligatorios

```json
{
  "success": true,
  "data": {
    "id": "12345",
    "order_number": "ORD-2024-001",
    "customer_name": "Juan Pérez",
    "customer_phone": "+52 999 123 4567",
    "total_amount": 450.00,
    "status": "assigned",

    // ❌ INCORRECTO - Campo products sin estructura definida
    "products": [
      {
        "name": "Pizza Hawaiana Grande",
        "qty": 2
      }
    ],

    // ❌ INCORRECTO - Campo items ausente
    "items": null
  }
}
```

---

## ✅ Respuesta CORRECTA (Requerida)

### Características:
- Campo `items` presente y poblado
- Estructura `OrderItem` completa
- Todos los campos obligatorios incluidos
- Campos opcionales presentes (aunque sean null)

```json
{
  "success": true,
  "data": {
    "id": "12345",
    "order_number": "ORD-2024-001",
    "customer_name": "Juan Pérez",
    "customer_phone": "+52 999 123 4567",
    "customer_email": "juan@example.com",
    "delivery_address": "Calle Principal #123, Col. Centro, Mérida, Yuc.",
    "delivery_date": "2024-01-15T14:00:00.000Z",
    "total_amount": 450.00,
    "status": "assigned",
    "branch_id": "branch-001",
    "branch_name": "Sucursal Centro",
    "platform": "whatsapp",
    "payment_method": "Efectivo",
    "payment_status": "Pendiente",
    "notes": "Entregar antes de las 2pm",
    "logistics_notes": "Cliente en edificio azul, tocar timbre 3",
    "created_at": "2024-01-14T10:30:00.000Z",
    "updated_at": "2024-01-14T11:45:00.000Z",

    // ✅ CORRECTO - Campo items con estructura completa
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
        "subtotal": 150.00,
        "notes": null
      }
    ]
  }
}
```

---

## Ejemplo: Orden con Múltiples Productos

```json
{
  "success": true,
  "data": {
    "id": "67890",
    "order_number": "ORD-2024-002",
    "customer_name": "María García",
    "customer_phone": "+52 999 555 1234",
    "customer_email": "maria.garcia@example.com",
    "delivery_address": "Av. Colón #456, Fracc. Montecristo, Mérida",
    "delivery_date": "2024-01-16T18:30:00.000Z",
    "total_amount": 875.50,
    "status": "in_progress",
    "branch_id": "branch-002",
    "branch_name": "Sucursal Norte",
    "platform": "whatsapp",
    "payment_method": "Tarjeta",
    "payment_status": "Pagado",
    "notes": null,
    "logistics_notes": "Dejar con portería",
    "created_at": "2024-01-16T14:20:00.000Z",
    "updated_at": "2024-01-16T15:10:00.000Z",

    "items": [
      {
        "id": "item-101",
        "product_id": "PROD-789",
        "product_name": "Hamburguesa Doble con Queso",
        "quantity": 3,
        "unit_price": 120.00,
        "subtotal": 360.00,
        "notes": "Sin pepinillos, con jalapeños"
      },
      {
        "id": "item-102",
        "product_id": "PROD-234",
        "product_name": "Papas Fritas Grandes",
        "quantity": 2,
        "unit_price": 65.00,
        "subtotal": 130.00,
        "notes": null
      },
      {
        "id": "item-103",
        "product_id": "PROD-567",
        "product_name": "Malteada de Chocolate",
        "quantity": 2,
        "unit_price": 85.00,
        "subtotal": 170.00,
        "notes": "Extra chocolate"
      },
      {
        "id": "item-104",
        "product_id": "PROD-890",
        "product_name": "Ensalada César",
        "quantity": 1,
        "unit_price": 95.50,
        "subtotal": 95.50,
        "notes": "Aderezo aparte"
      },
      {
        "id": "item-105",
        "product_id": "PROD-345",
        "product_name": "Agua Natural 600ml",
        "quantity": 4,
        "unit_price": 30.00,
        "subtotal": 120.00,
        "notes": null
      }
    ]
  }
}
```

**Validaciones en este ejemplo:**
- ✅ Total de items: 5 productos
- ✅ Total de unidades: 3 + 2 + 2 + 1 + 4 = 12 unidades
- ✅ Suma de subtotales: 360 + 130 + 170 + 95.50 + 120 = **875.50**
- ✅ Coincide con `total_amount`: 875.50
- ✅ Cada item tiene todos los campos obligatorios
- ✅ El campo `notes` está presente (aunque sea `null`)

---

## Ejemplo: Orden Simple (1 Producto)

```json
{
  "success": true,
  "data": {
    "id": "54321",
    "order_number": "ORD-2024-003",
    "customer_name": "Pedro Sánchez",
    "customer_phone": "+52 999 888 7777",
    "total_amount": 250.00,
    "status": "pending",
    "branch_id": null,
    "branch_name": null,
    "delivery_date": null,
    "delivery_address": "Por definir",
    "platform": "messenger",
    "created_at": "2024-01-17T09:15:00.000Z",
    "updated_at": "2024-01-17T09:15:00.000Z",

    "items": [
      {
        "id": "item-201",
        "product_id": "PROD-111",
        "product_name": "Pastel de Chocolate Mediano",
        "quantity": 1,
        "unit_price": 250.00,
        "subtotal": 250.00,
        "notes": "Decoración personalizada: Feliz Cumpleaños Ana"
      }
    ]
  }
}
```

---

## Ejemplo: Respuesta de Lista de Órdenes

```json
{
  "success": true,
  "data": [
    {
      "id": "1001",
      "order_number": "ORD-2024-100",
      "customer_name": "Cliente A",
      "customer_phone": "+52 999 111 1111",
      "total_amount": 300.00,
      "status": "assigned",
      "branch_id": "branch-001",
      "branch_name": "Sucursal Centro",
      "created_at": "2024-01-17T10:00:00.000Z",
      "updated_at": "2024-01-17T10:00:00.000Z",
      "items": [
        {
          "id": "item-301",
          "product_id": "PROD-001",
          "product_name": "Producto 1",
          "quantity": 2,
          "unit_price": 150.00,
          "subtotal": 300.00,
          "notes": null
        }
      ]
    },
    {
      "id": "1002",
      "order_number": "ORD-2024-101",
      "customer_name": "Cliente B",
      "customer_phone": "+52 999 222 2222",
      "total_amount": 450.00,
      "status": "in_progress",
      "branch_id": "branch-001",
      "branch_name": "Sucursal Centro",
      "created_at": "2024-01-17T11:00:00.000Z",
      "updated_at": "2024-01-17T11:30:00.000Z",
      "items": [
        {
          "id": "item-401",
          "product_id": "PROD-002",
          "product_name": "Producto 2",
          "quantity": 1,
          "unit_price": 200.00,
          "subtotal": 200.00,
          "notes": null
        },
        {
          "id": "item-402",
          "product_id": "PROD-003",
          "product_name": "Producto 3",
          "quantity": 5,
          "unit_price": 50.00,
          "subtotal": 250.00,
          "notes": "Empaque especial"
        }
      ]
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 2,
    "has_more": false
  }
}
```

---

## Casos Especiales

### Orden sin Productos (Error - No Permitido)

```json
{
  "success": false,
  "message": "Una orden debe tener al menos un producto",
  "error": "VALIDATION_ERROR"
}
```

**Una orden SIEMPRE debe tener al menos 1 producto en `items`.**

---

### Producto con Precio 0 (Promoción/Regalo)

```json
{
  "id": "item-501",
  "product_id": "PROD-PROMO",
  "product_name": "Galleta de Cortesía",
  "quantity": 1,
  "unit_price": 0.00,
  "subtotal": 0.00,
  "notes": "Regalo por compra mayor a $500"
}
```

✅ **Permitido** - El precio puede ser 0 para promociones

---

### Producto con Descuento

**OPCIÓN 1:** Aplicar descuento en el precio unitario

```json
{
  "id": "item-601",
  "product_id": "PROD-444",
  "product_name": "Pizza Pepperoni (30% descuento)",
  "quantity": 1,
  "unit_price": 140.00,
  "subtotal": 140.00,
  "notes": "Precio regular: $200, descuento aplicado: 30%"
}
```

**OPCIÓN 2:** Agregar campo de descuento (requiere actualizar tipos)

```json
{
  "id": "item-601",
  "product_id": "PROD-444",
  "product_name": "Pizza Pepperoni",
  "quantity": 1,
  "unit_price": 200.00,
  "discount_percent": 30,
  "discount_amount": 60.00,
  "subtotal": 140.00,
  "notes": null
}
```

**Recomendación:** Usar OPCIÓN 1 por ahora (más simple)

---

## Validación del Total

### Fórmula para validar:

```javascript
// Backend debe validar esto antes de guardar:
const calculatedTotal = items.reduce((sum, item) => {
  return sum + item.subtotal;
}, 0);

if (Math.abs(calculatedTotal - order.total_amount) > 0.01) {
  throw new Error('El total no coincide con la suma de productos');
}
```

---

## Testing con Postman/cURL

### Test 1: Obtener órdenes de una sucursal

```bash
curl -X GET \
  'https://api-meta-service.vercel.app/api/orders/branch/branch-001?limit=5' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json'
```

**Validar que la respuesta:**
- ✅ Cada orden tenga el campo `items`
- ✅ Cada item tenga todos los campos requeridos
- ✅ Los subtotales estén calculados correctamente
- ✅ El total de la orden coincida con la suma de subtotales

### Test 2: Obtener orden específica

```bash
curl -X GET \
  'https://api-meta-service.vercel.app/api/orders/12345' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json'
```

**Validar:**
- ✅ La orden tenga productos detallados
- ✅ Las notas de productos se muestren si existen

---

## Migración de Datos

Si tienen órdenes antiguas con estructura diferente:

```sql
-- Ejemplo en PostgreSQL/SQL para migrar datos
UPDATE orders
SET items = (
  SELECT json_agg(
    json_build_object(
      'id', gen_random_uuid()::text,
      'product_id', p.product_id,
      'product_name', p.name,
      'quantity', p.quantity,
      'unit_price', p.price,
      'subtotal', p.quantity * p.price,
      'notes', p.notes
    )
  )
  FROM jsonb_to_recordset(products::jsonb) AS p(
    product_id text,
    name text,
    quantity int,
    price numeric,
    notes text
  )
  WHERE products IS NOT NULL
)
WHERE items IS NULL AND products IS NOT NULL;
```

---

**Documento generado:** 2024
**Última actualización:** Equipo Frontend
**Versión:** 1.0
