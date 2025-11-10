# Sistema de Gestión de Metadatos de Productos

## Descripción General

Este módulo permite a los usuarios de Capriccio (administradores y logística) gestionar metadatos personalizados de productos sincronizados desde iPOS. Estos metadatos mejoran las recomendaciones de la IA y no se sobrescriben durante las sincronizaciones.

## Estructura del Proyecto

```
src/
├── services/
│   └── productMetadataService.ts       # Servicio de API para metadatos
├── hooks/
│   ├── useEnrichedProducts.ts          # Hook para obtener productos
│   ├── useMetadataOptions.ts           # Hook para opciones de dropdowns
│   └── useMetadataStats.ts             # Hook para estadísticas
├── components/
│   └── metadata/
│       ├── MetadataBadge.tsx           # Badge para categorías/presentaciones
│       ├── MetadataSelect.tsx          # Select con autocompletado
│       ├── ProductCard.tsx             # Tarjeta de producto
│       ├── ProductMetadataForm.tsx     # Formulario de edición
│       ├── Modal.tsx                   # Modal reutilizable
│       ├── MetadataStatsCard.tsx       # Tarjetas de estadísticas
│       └── index.ts                    # Exportaciones centralizadas
└── app/
    └── dashboard/
        ├── admin/
        │   └── productos/
        │       └── page.tsx            # Página para administradores
        └── logistics/
            └── productos/
                └── page.tsx            # Página para logística
```

## Variables de Entorno

Las siguientes variables ya están configuradas en `.env`:

```bash
NEXT_PUBLIC_API_URL=https://api-meta-service.vercel.app
NEXT_PUBLIC_API_TOKEN=sk-meta-01a23b45c67d89ef01234567abcdef89
```

## Rutas de Navegación

### Para Administradores
- **URL**: `/dashboard/admin/productos`
- **Acceso desde**: Sidebar → Sección "OPERACIONES" → "Productos"

### Para Logística
- **URL**: `/dashboard/logistics/productos`
- **Acceso desde**: Sidebar → Sección "LOGÍSTICA" → "Productos"

## Características por Rol

### Administrador
- ✅ Ver todos los productos (activos e inactivos)
- ✅ Editar todos los campos de metadatos
- ✅ Eliminar metadatos
- ✅ Sincronizar productos desde iPOS
- ✅ Ver estadísticas completas
- ✅ Agregar descripción para IA, keywords y alérgenos

### Logística
- ✅ Ver productos activos
- ✅ Editar categoría, subcategoría y presentación
- ✅ Ver productos pendientes de categorización
- ⚠️ Sin acceso a sincronización
- ⚠️ Sin acceso a campos avanzados (IA, keywords, alérgenos)
- ⚠️ No puede eliminar metadatos

## Uso del Servicio de API

### Ejemplo: Obtener productos enriquecidos

```typescript
import { productMetadataService } from '@/services/productMetadataService';

const fetchProducts = async () => {
  try {
    const result = await productMetadataService.getEnrichedProducts({
      search: 'chocolate',
      category: 'Chocolates',
      limit: 50
    });

    console.log('Productos:', result.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ejemplo: Guardar metadatos

```typescript
const saveMetadata = async (productId: string) => {
  try {
    await productMetadataService.saveProductMetadata(productId, {
      custom_category: 'Chocolates',
      custom_subcategory: 'Chocolate oscuro',
      custom_presentation: 'barra',
      ai_description: 'Chocolate artesanal con 70% de cacao'
    });

    console.log('Metadatos guardados exitosamente');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Uso de Hooks

### useEnrichedProducts

```typescript
import { useEnrichedProducts } from '@/hooks/useEnrichedProducts';

function MyComponent() {
  const { products, loading, error, refetch } = useEnrichedProducts({
    search: 'chocolate',
    category: 'Chocolates',
    limit: 50
  });

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.product_id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### useMetadataOptions

```typescript
import { useMetadataOptions } from '@/hooks/useMetadataOptions';

function MyForm() {
  const { options, loading } = useMetadataOptions();

  return (
    <select>
      {options.categories.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  );
}
```

### useMetadataStats

```typescript
import { useMetadataStats } from '@/hooks/useMetadataStats';

function StatsComponent() {
  const { stats, loading } = useMetadataStats();

  return (
    <div>
      <p>Total: {stats?.total}</p>
      <p>Con metadatos: {stats?.withMetadata}</p>
      <p>Porcentaje: {stats?.percentage}%</p>
    </div>
  );
}
```

## Componentes Reutilizables

### ProductCard

```typescript
import { ProductCard } from '@/components/metadata/ProductCard';

<ProductCard
  product={product}
  onEdit={(id) => console.log('Edit', id)}
  onDelete={(id) => console.log('Delete', id)}
  role="admin"
/>
```

### ProductMetadataForm

```typescript
import { ProductMetadataForm } from '@/components/metadata/ProductMetadataForm';

<ProductMetadataForm
  product={product}
  productId={product.product_id}
  initialData={product.custom_metadata || undefined}
  onSave={async (metadata) => {
    await productMetadataService.saveProductMetadata(
      product.product_id,
      metadata
    );
  }}
  onCancel={() => console.log('Cancelled')}
  mode="full" // "full" para admin, "simple" para logística
/>
```

### MetadataBadge

```typescript
import { MetadataBadge } from '@/components/metadata/MetadataBadge';

<MetadataBadge type="category" value="Chocolates" />
<MetadataBadge type="presentation" value="barra" size="md" />
```

## Flujos de Trabajo

### Flujo 1: Administrador agrega metadatos

1. Ir a `/dashboard/admin/productos`
2. Buscar producto sin metadatos (badge "⚠️ Sin metadatos")
3. Click en botón "➕"
4. Completar formulario con categoría, subcategoría, presentación
5. (Opcional) Agregar descripción IA, keywords, alérgenos
6. Click en "Guardar Cambios"
7. Producto ahora muestra badges de categoría y presentación

### Flujo 2: Logística actualiza productos

1. Ir a `/dashboard/logistics/productos`
2. Activar filtro "Mostrar solo pendientes"
3. Seleccionar producto pendiente
4. Click en "➕" o "✏️"
5. Seleccionar categoría y presentación
6. Click en "Guardar"
7. Producto sale de lista de pendientes

### Flujo 3: Sincronización desde iPOS (Admin)

1. Ir a `/dashboard/admin/productos`
2. Click en "🔄 Sincronizar iPOS"
3. Confirmar sincronización
4. Esperar progreso
5. Ver resumen:
   - Productos nuevos agregados
   - Productos actualizados
   - Metadatos preservados ✅
6. Cerrar modal

## API Endpoints

### Base URL
```
https://api-meta-service.vercel.app/api/products
```

### Autenticación
Todos los endpoints requieren el header:
```
Authorization: Bearer sk-meta-01a23b45c67d89ef01234567abcdef89
```

### Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/enriched` | Obtener productos con metadatos |
| GET | `/metadata/options` | Obtener opciones de dropdowns |
| GET | `/:productId/metadata` | Obtener metadatos de un producto |
| POST | `/:productId/metadata` | Crear/actualizar metadatos |
| PUT | `/:productId/metadata` | Actualizar metadatos existentes |
| DELETE | `/:productId/metadata` | Eliminar metadatos |
| POST | `/metadata/batch` | Actualización masiva (admin) |
| POST | `/sync` | Sincronizar desde iPOS (admin) |

## Troubleshooting

### Error: "Failed to fetch products"

**Solución**: Verificar que las variables de entorno estén configuradas correctamente y que la API esté disponible.

### Error: "Failed to save metadata"

**Posibles causas**:
- Token de API inválido
- Campos requeridos faltantes (categoría y presentación son obligatorios)
- Producto no existe en iPOS

### Productos no se actualizan después de guardar

**Solución**: Usar el método `refetch()` del hook `useEnrichedProducts` para recargar los datos.

```typescript
const { products, refetch } = useEnrichedProducts();

const handleSave = async (metadata) => {
  await productMetadataService.saveProductMetadata(productId, metadata);
  refetch(); // Recargar productos
};
```

## Próximas Mejoras

- [ ] Paginación mejorada con infinite scroll
- [ ] Exportar productos a CSV/Excel
- [ ] Historial de cambios de metadatos
- [ ] Sugerencias automáticas de categorías usando IA
- [ ] Edición masiva con preview
- [ ] Filtros guardados por usuario
- [ ] Notificaciones en tiempo real con Supabase

## Soporte

Para reportar problemas o solicitar nuevas características:
- Crear issue en GitHub
- Contactar al equipo de desarrollo

## Changelog

### v1.0.0 (2025-11-07)
- ✅ Implementación inicial del módulo
- ✅ Página para administradores
- ✅ Página simplificada para logística
- ✅ Componentes reutilizables
- ✅ Hooks personalizados
- ✅ Integración con sidebar
- ✅ Sincronización con iPOS
- ✅ Estadísticas de categorización
