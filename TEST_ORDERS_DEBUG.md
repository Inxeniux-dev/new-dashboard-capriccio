# Guía de Testing - Productos en Órdenes

## Cambios Implementados en Frontend

### ✅ Actualizaciones Realizadas

1. **Utilidad de Validación** (`src/utils/testOrderData.ts`)
   - Función `normalizeOrderItems()` - Convierte cualquier formato de items al formato correcto
   - Función `validateOrderItems()` - Valida estructura de datos
   - Función `printOrderValidation()` - Imprime reporte en consola
   - Función `calculateOrderTotal()` - Calcula total esperado
   - Función `validateOrderTotal()` - Valida que el total coincida

2. **OrderDetailsModal Mejorado**
   - Ahora usa `normalizeOrderItems()` para manejar diferentes formatos
   - Muestra validación en consola cuando se abre el modal
   - Compatible con formatos antiguos y nuevos del backend

3. **Compatibilidad Retroactiva**
   - Soporta `items` (nuevo formato - recomendado)
   - Soporta `products` (formato antiguo)
   - Soporta `order_items` (formato alternativo)
   - Normaliza automáticamente al formato correcto

---

## Cómo Probar

### 1. Abrir la Consola del Navegador

1. Abre el Dashboard
2. Presiona `F12` o `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
3. Ve a la pestaña **Console**

### 2. Ver Órdenes

1. Ve a **Mis Órdenes** (empleado) o **Órdenes** (logística)
2. Haz clic en **"Ver Detalle"** de cualquier orden
3. En la consola verás un reporte como este:

```
🔍 Validación de Orden ORD-2024-001
  ✅ Válida: true
  📦 Productos: 2

  ┌─────────┬──────────────────────┬──────────┬─────────┬───────────┬───────┐
  │ (index) │       nombre         │ cantidad │  precio │ subtotal  │ notas │
  ├─────────┼──────────────────────┼──────────┼─────────┼───────────┼───────┤
  │    0    │ 'Pizza Hawaiana'     │    2     │  150.00 │  300.00   │  '✓'  │
  │    1    │ 'Refresco Coca-Cola' │    3     │   50.00 │  150.00   │  '-'  │
  └─────────┴──────────────────────┴──────────┴─────────┴───────────┴───────┘
```

### 3. Verificar Errores

Si hay problemas con los datos, verás:

```
🔍 Validación de Orden ORD-2024-002
  ✅ Válida: false
  ❌ Errores:
    ⚠ Item 0: falta product_name o name
    ⚠ Item 1: quantity debe ser un número
  ⚠️ Advertencias:
    ⚠ Item 0: no tiene ID
    ⚠ Item 2: el subtotal no coincide
```

---

## Casos de Prueba

### ✅ Caso 1: Orden con Formato Nuevo (Correcto)

**Backend envía:**
```json
{
  "items": [
    {
      "id": "item-001",
      "product_id": "PROD-123",
      "product_name": "Pizza Hawaiana",
      "quantity": 2,
      "unit_price": 150.00,
      "subtotal": 300.00,
      "notes": "Sin piña"
    }
  ]
}
```

**Frontend muestra:**
- ✅ Nombre: "Pizza Hawaiana"
- ✅ Cantidad: "2 unidades"
- ✅ Precio: "$150.00"
- ✅ Subtotal: "$300.00"
- ✅ ID Producto: "PROD-123"
- ✅ Nota: "Sin piña" (en recuadro ámbar)

---

### ⚠️ Caso 2: Orden con Formato Antiguo (Compatibilidad)

**Backend envía:**
```json
{
  "products": [
    {
      "name": "Pizza Hawaiana",
      "qty": 2,
      "price": 150.00
    }
  ]
}
```

**Frontend muestra:**
- ✅ Nombre: "Pizza Hawaiana"
- ✅ Cantidad: "2 unidades"
- ✅ Precio: "$150.00"
- ✅ Subtotal: "$300.00" (calculado automáticamente)
- ⚠️ ID Producto: No se muestra (no disponible)
- ⚠️ Nota: No disponible

**Consola muestra:**
```
⚠️ Advertencias:
  Item 0: no tiene ID
  Item 0: no tiene product_id
```

---

### ✅ Caso 3: Orden con Múltiples Productos

**Backend envía:**
```json
{
  "items": [
    {
      "id": "item-001",
      "product_id": "PROD-123",
      "product_name": "Pizza Grande",
      "quantity": 2,
      "unit_price": 150.00,
      "subtotal": 300.00,
      "notes": null
    },
    {
      "id": "item-002",
      "product_id": "PROD-456",
      "product_name": "Refresco",
      "quantity": 3,
      "unit_price": 50.00,
      "subtotal": 150.00,
      "notes": "Bien fríos"
    }
  ],
  "total_amount": 450.00
}
```

**Frontend muestra:**
- ✅ 2 productos en tarjetas separadas
- ✅ Total de unidades: "5 unidades"
- ✅ Nota solo en el segundo producto
- ✅ Total correcto: "$450.00"

---

### ❌ Caso 4: Orden Sin Productos (Error)

**Backend envía:**
```json
{
  "items": []
}
```

**Frontend muestra:**
- ⚠️ Sección de productos vacía
- ⚠️ Mensaje: "No hay productos"

**Consola muestra:**
```
⚠️ Advertencias:
  La orden no tiene productos
```

---

## Verificación de Cálculos

El frontend ahora valida automáticamente que:

1. **Subtotal de cada item:**
   ```
   subtotal = quantity × unit_price
   ```

2. **Total de la orden:**
   ```
   total_amount = Σ(item.subtotal)
   ```

Si hay discrepancias, se muestra en consola:
```
⚠️ Item 1: el subtotal (299.00) no coincide con quantity * unit_price (300.00)
```

---

## Endpoints a Probar

### Para Empleados:
```
GET /api/orders/branch/{branchId}
```

### Para Logística:
```
GET /api/orders
GET /api/logistics/orders/pending
```

### Orden Individual:
```
GET /api/orders/{orderId}
```

---

## Checklist de Verificación

Cuando pruebes, verifica que:

- [ ] **Consola muestra validación** al abrir el modal
- [ ] **Nombre del producto** se muestra correctamente
- [ ] **Cantidad** se muestra con "unidades" o "unidad"
- [ ] **Precio unitario** se muestra con formato de moneda
- [ ] **Subtotal** se calcula correctamente
- [ ] **ID del producto** se muestra si está disponible
- [ ] **Notas del producto** aparecen en recuadro ámbar (si existen)
- [ ] **Total de unidades** se muestra al final
- [ ] **Total de la orden** coincide con suma de subtotales
- [ ] **No hay errores** en consola (excepto advertencias esperadas)

---

## Solución de Problemas

### Problema: No se ven productos

**Verificar en consola:**
```
❌ Errores:
  La orden no tiene campo items, products ni order_items
```

**Solución:** Backend no está enviando ningún campo de productos. Contactar al equipo de backend.

---

### Problema: Productos sin nombre

**Verificar en consola:**
```
❌ Errores:
  Item 0: falta product_name o name
```

**Solución:** Backend necesita incluir `product_name` en cada item.

---

### Problema: Total no coincide

**Verificar en consola:**
```
⚠️ Item 1: el subtotal (299.00) no coincide con quantity * unit_price (300.00)
```

**Solución:** Backend debe calcular correctamente los subtotales.

---

## Formato de Datos del Backend (Recordatorio)

### ✅ Formato Correcto:
```typescript
interface OrderItem {
  id: string;              // Requerido
  product_id: string;      // Requerido
  product_name: string;    // Requerido
  quantity: number;        // Requerido (> 0)
  unit_price: number;      // Requerido (>= 0)
  subtotal: number;        // Requerido (quantity * unit_price)
  notes?: string;          // Opcional
}
```

---

## Próximos Pasos

1. **Probar en desarrollo** con órdenes reales
2. **Verificar consola** para errores/advertencias
3. **Reportar problemas** al equipo de backend si hay errores
4. **Validar diferentes escenarios**:
   - 1 producto
   - Múltiples productos
   - Productos con notas
   - Productos sin notas
   - Órdenes antiguas (compatibilidad)
5. **Confirmar cálculos** de totales

---

**Documento de Testing**
**Fecha:** 2024
**Versión Frontend:** Actualizada con normalización de items
