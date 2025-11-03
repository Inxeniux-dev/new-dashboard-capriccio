// Utilidad para probar y validar la estructura de datos de órdenes
import type { Order, OrderItem } from "@/types/api";

/**
 * Valida que una orden tenga la estructura correcta de items
 */
export function validateOrderItems(order: Order): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verificar que existe el campo items
  if (!order.items && !order.products && !order.order_items) {
    errors.push("La orden no tiene campo items, products ni order_items");
    return { isValid: false, errors, warnings };
  }

  // Obtener los items de cualquier campo disponible
  const items = order.items || order.products || order.order_items || [];

  if (!Array.isArray(items)) {
    errors.push("El campo items no es un array");
    return { isValid: false, errors, warnings };
  }

  if (items.length === 0) {
    warnings.push("La orden no tiene productos");
  }

  // Validar cada item
  items.forEach((item, index) => {
    const typedItem = item as Partial<OrderItem>;

    // Campos obligatorios
    if (!typedItem.product_name && !(typedItem as { name?: string }).name) {
      errors.push(`Item ${index}: falta product_name o name`);
    }

    if (typeof typedItem.quantity !== 'number') {
      errors.push(`Item ${index}: quantity debe ser un número`);
    } else if (typedItem.quantity <= 0) {
      errors.push(`Item ${index}: quantity debe ser mayor a 0`);
    }

    if (typeof typedItem.unit_price !== 'number' && typeof (typedItem as { price?: number }).price !== 'number') {
      errors.push(`Item ${index}: falta unit_price o price`);
    }

    // Validar subtotal si existe
    if (typedItem.subtotal !== undefined) {
      const expectedSubtotal = (typedItem.quantity || 0) * (typedItem.unit_price || (typedItem as { price?: number }).price || 0);
      if (Math.abs(typedItem.subtotal - expectedSubtotal) > 0.01) {
        warnings.push(`Item ${index}: el subtotal (${typedItem.subtotal}) no coincide con quantity * unit_price (${expectedSubtotal})`);
      }
    }

    // Campos opcionales pero recomendados
    if (!typedItem.id && !(typedItem as { id?: string }).id) {
      warnings.push(`Item ${index}: no tiene ID`);
    }

    if (!typedItem.product_id) {
      warnings.push(`Item ${index}: no tiene product_id`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Imprime un reporte de validación en consola
 */
export function printOrderValidation(order: Order): void {
  console.group(`🔍 Validación de Orden ${order.order_number || order.id}`);

  const validation = validateOrderItems(order);

  console.log('✅ Válida:', validation.isValid);

  if (validation.errors.length > 0) {
    console.group('❌ Errores:');
    validation.errors.forEach(error => console.error(error));
    console.groupEnd();
  }

  if (validation.warnings.length > 0) {
    console.group('⚠️ Advertencias:');
    validation.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }

  // Mostrar estructura de items
  const items = order.items || order.products || order.order_items || [];
  console.log('📦 Productos:', items.length);

  if (items.length > 0) {
    console.table(items.map((item: unknown) => {
      const typedItem = item as Partial<OrderItem> & { name?: string; price?: number };
      return {
        nombre: typedItem.product_name || typedItem.name || 'N/A',
        cantidad: typedItem.quantity || 0,
        precio: typedItem.unit_price || typedItem.price || 0,
        subtotal: typedItem.subtotal || 0,
        notas: typedItem.notes ? '✓' : '-'
      };
    }));
  }

  console.groupEnd();
}

/**
 * Normaliza items de diferentes formatos al formato esperado
 */
export function normalizeOrderItems(order: Order): OrderItem[] {
  const items = order.items || order.products || order.order_items || [];

  return items.map((item, index) => {
    const typedItem = item as Partial<OrderItem> & {
      name?: string;
      price?: number;
      qty?: number;
    };

    const quantity = typedItem.quantity || typedItem.qty || 1;
    const unitPrice = typedItem.unit_price || typedItem.price || 0;

    return {
      id: typedItem.id || `item-${index}`,
      product_id: typedItem.product_id || `unknown-${index}`,
      product_name: typedItem.product_name || typedItem.name || 'Producto sin nombre',
      quantity,
      unit_price: unitPrice,
      subtotal: typedItem.subtotal || (quantity * unitPrice),
      notes: typedItem.notes
    };
  });
}

/**
 * Calcula el total esperado de una orden basado en sus items
 */
export function calculateOrderTotal(order: Order): number {
  const items = normalizeOrderItems(order);
  return items.reduce((total, item) => total + item.subtotal, 0);
}

/**
 * Valida que el total de la orden coincida con la suma de items
 */
export function validateOrderTotal(order: Order): {
  isValid: boolean;
  calculatedTotal: number;
  reportedTotal: number;
  difference: number;
} {
  const calculatedTotal = calculateOrderTotal(order);
  const reportedTotal = order.total_amount;
  const difference = Math.abs(calculatedTotal - reportedTotal);

  return {
    isValid: difference < 0.01, // Tolerancia de 1 centavo por redondeo
    calculatedTotal,
    reportedTotal,
    difference
  };
}
