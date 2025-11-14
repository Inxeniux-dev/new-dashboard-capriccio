# Implementación del Sistema de Categorización Jerárquica

## Resumen

Se ha implementado un sistema de categorización jerárquica de 3 niveles para productos de Capriccio, siguiendo las especificaciones del backend. Este sistema permite categorizar productos seleccionando:

1. **Categoría principal** (Chocolate, Pistache/Nuez, Almendra)
2. **Subcategoría** (tipos específicos según la categoría)
3. **Presentación** (formato y tamaño del empaque)

## Archivos Creados

### 1. Servicio de Categorización
**Archivo:** `src/services/categorizationService.ts`

Servicio que gestiona todas las interacciones con la API de categorización del backend:

- `getAllCategories()` - Obtiene todas las categorías disponibles
- `getOptions(params)` - Obtiene opciones dinámicas para selección en cascada (RECOMENDADO)
- `getHierarchy()` - Obtiene jerarquía completa de categorías
- `validateCombination(data)` - Valida una combinación de categoría/subcategoría/presentación
- `categorizeProduct(productId, data)` - Asigna categorización a un producto
- `getAllPresentations()` - Obtiene todas las presentaciones disponibles
- `getProductsByCategory(params)` - Obtiene productos por categorización

### 2. Hook de Categorización
**Archivo:** `src/hooks/useCategorization.ts`

Hook personalizado que maneja la lógica de selección en cascada:

- Gestiona estados de selección (categoría, subcategoría, presentación)
- Carga opciones dinámicamente según la selección
- Valida que la selección esté completa
- Proporciona función para obtener la combinación seleccionada
- Incluye manejo de errores y estados de carga

**Uso:**
```typescript
const {
  categories,
  subcategories,
  presentations,
  selectedCategory,
  selectedSubcategory,
  selectedPresentation,
  setSelectedCategory,
  setSelectedSubcategory,
  setSelectedPresentation,
  isValid,
  getCombination,
  loading,
  error
} = useCategorization({
  initialCategoryId: 1,
  initialSubcategoryId: 2,
  initialPresentationId: 4,
  autoLoadOnMount: true
});
```

### 3. Componente CategorySelector
**Archivo:** `src/components/metadata/CategorySelector.tsx`

Componente reutilizable de UI para selección en cascada:

- Tres selectores dependientes (categoría → subcategoría → presentación)
- Deshabilita selectores hasta que se seleccione el nivel anterior
- Muestra información de tamaño para presentaciones
- Indica presentaciones por defecto con ⭐
- Muestra un resumen cuando la selección está completa
- Incluye estados de carga y manejo de errores
- Totalmente tipado con TypeScript

**Props:**
```typescript
interface CategorySelectorProps {
  initialCategoryId?: number;
  initialSubcategoryId?: number;
  initialPresentationId?: number;
  onCategoryChange?: (categoryId: number | null) => void;
  onSubcategoryChange?: (subcategoryId: number | null) => void;
  onPresentationChange?: (presentationId: number | null) => void;
  disabled?: boolean;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

## Archivos Modificados

### 1. ProductMetadataService
**Archivo:** `src/services/productMetadataService.ts`

Se agregaron nuevos campos a la interfaz `CustomMetadata`:
- `category_id?: number | null`
- `subcategory_id?: number | null`
- `presentation_id?: number | null`

Estos campos almacenan los IDs de la categorización jerárquica.

### 2. ProductMetadataForm
**Archivo:** `src/components/metadata/ProductMetadataForm.tsx`

Actualizaciones principales:
- Integración del hook `useCategorization`
- Reemplazo de selectores antiguos con `CategorySelector`
- Validación asíncrona de combinaciones con el backend
- Guardado de categorización antes de guardar metadatos
- Mejor manejo de errores y feedback visual

### 3. Exports del Módulo
**Archivo:** `src/components/metadata/index.ts`

Se agregó export del nuevo componente:
```typescript
export { CategorySelector } from './CategorySelector';
```

## Flujo de Trabajo

### Para Administradores (modo 'full')

1. Usuario abre formulario de edición de producto
2. Sistema carga categorías disponibles automáticamente
3. Usuario selecciona categoría → sistema carga subcategorías
4. Usuario selecciona subcategoría → sistema carga presentaciones
5. Usuario selecciona presentación
6. Sistema valida la combinación con el backend
7. Usuario guarda → se categoriza el producto y se guardan los metadatos

### Para Logística (modo 'simple')

Similar al flujo de administradores, pero sin campos avanzados como:
- Descripción para IA
- Palabras clave
- Información de alérgenos

## Integración con Backend

### Endpoints Utilizados

1. **GET** `/api/categories/options`
   - Obtiene opciones dinámicas según selección
   - Parámetros: `category_id`, `subcategory_id`

2. **POST** `/api/categories/validate`
   - Valida combinación antes de guardar
   - Body: `{ category_id, subcategory_id, presentation_id }`

3. **POST** `/api/categories/products/{productId}/categorize`
   - Asigna categorización a un producto
   - Body: `{ category_id, subcategory_id, presentation_id }`

### Manejo de Errores

- Validación local de campos requeridos
- Validación remota de combinaciones válidas
- Mensajes de error específicos para el usuario
- Logging de errores en consola para debugging
- Continuación del flujo aunque falle la categorización específica

## Características Implementadas

✅ Selección en cascada de 3 niveles
✅ Carga dinámica de opciones según selección
✅ Validación de combinaciones con backend
✅ Indicadores visuales de estado (carga, error, éxito)
✅ Soporte para valores iniciales (edición)
✅ Presentaciones por defecto marcadas
✅ Información de tamaño de presentaciones
✅ Resumen visual de selección completa
✅ Manejo robusto de errores
✅ TypeScript completo
✅ Compatible con modo oscuro
✅ Diseño responsive

## Uso en Código

### Importar y usar el servicio directamente:

```typescript
import { categorizationService } from '@/services/categorizationService';

// Obtener opciones dinámicas
const { data } = await categorizationService.getOptions({
  category_id: 1,
  subcategory_id: 2
});

// Validar combinación
const validation = await categorizationService.validateCombination({
  category_id: 1,
  subcategory_id: 2,
  presentation_id: 4
});

// Categorizar producto
await categorizationService.categorizeProduct('PROD123', {
  category_id: 1,
  subcategory_id: 2,
  presentation_id: 4
});
```

### Usar el componente en un formulario:

```typescript
import { CategorySelector } from '@/components/metadata';

function MyForm() {
  return (
    <CategorySelector
      initialCategoryId={product.category_id}
      initialSubcategoryId={product.subcategory_id}
      initialPresentationId={product.presentation_id}
      onCategoryChange={(id) => handleCategoryChange(id)}
      onSubcategoryChange={(id) => handleSubcategoryChange(id)}
      onPresentationChange={(id) => handlePresentationChange(id)}
      showLabels={true}
      size="md"
    />
  );
}
```

## Próximos Pasos Sugeridos

1. **Testing**: Crear pruebas unitarias para:
   - `useCategorization` hook
   - `categorizationService`
   - `CategorySelector` component

2. **Optimización**: Implementar caché para categorías (no cambian frecuentemente)

3. **Búsqueda**: Agregar filtro de búsqueda para presentaciones largas

4. **Bulk Operations**: Implementar categorización masiva de productos

5. **Analytics**: Agregar métricas sobre categorías más usadas

## Notas Importantes

- El sistema mantiene compatibilidad con los campos antiguos (`custom_category`, `custom_subcategory`, `custom_presentation`)
- Los nuevos campos (`category_id`, `subcategory_id`, `presentation_id`) son los recomendados
- La validación se realiza tanto en cliente como en servidor
- El componente es totalmente reutilizable en otros contextos
- Todos los warnings de ESLint son menores y no afectan funcionalidad

## Variables de Entorno Requeridas

Asegurarse de tener configuradas:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_TOKEN=your_token_here
```

---

**Implementado por:** Claude Code
**Fecha:** 14 de Noviembre de 2025
**Versión:** 1.0.0
