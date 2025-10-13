# Guía de Estilos para Inputs y Forms

Esta guía documenta los estilos estándar para inputs, selects y otros elementos de formulario en el Dashboard Capriccio.

## ✅ Problema Resuelto

**Problema**: Los inputs mostraban texto blanco sobre fondo blanco (invisible)

**Solución**: Agregar clases de color de texto y fondo explícitas a todos los inputs

## 🎨 Estilos Estándar

### Input de Texto / Email / Password

```tsx
<input
  type="text"
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400"
  placeholder="Texto de ejemplo"
/>
```

**Clases clave agregadas:**
- `bg-white` - Fondo blanco
- `text-gray-900` - Texto gris oscuro (visible)
- `placeholder:text-gray-400` - Placeholder gris claro

### Select / Dropdown

```tsx
<select
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-gray-900"
>
  <option value="">Selecciona una opción</option>
  <option value="1">Opción 1</option>
</select>
```

**Clases clave agregadas:**
- `bg-white` - Fondo blanco
- `text-gray-900` - Texto gris oscuro

### Input de Fecha

```tsx
<input
  type="date"
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-gray-900"
/>
```

### Input de Búsqueda (con icono)

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
  <input
    type="text"
    placeholder="Buscar..."
    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-gray-900 placeholder:text-gray-400"
  />
</div>
```

### Textarea

```tsx
<textarea
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400"
  placeholder="Escribe tu mensaje..."
  rows={4}
/>
```

## 📋 Clases Completas por Tipo

### Input Completo (estándar)
```
w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400
```

### Input Compacto (para modales o espacios reducidos)
```
w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-gray-900 placeholder:text-gray-400
```

### Select Completo
```
w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-gray-900
```

### Select Small
```
px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-gray-900
```

## 🎯 Variantes de Estado

### Input Deshabilitado

```tsx
<input
  disabled
  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
/>
```

### Input con Error

```tsx
<input
  className="w-full px-4 py-3 border-2 border-red-500 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white text-gray-900 placeholder:text-gray-400"
/>
<p className="mt-1 text-sm text-red-600">Mensaje de error</p>
```

### Input con Éxito

```tsx
<input
  className="w-full px-4 py-3 border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-gray-900"
/>
<p className="mt-1 text-sm text-green-600">Validación correcta</p>
```

## 📐 Estructura de Label + Input

```tsx
<div>
  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
    Email:
  </label>
  <input
    type="email"
    id="email"
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400"
    placeholder="tu@email.com"
    required
  />
</div>
```

## 🎨 Paleta de Colores para Forms

- **Texto principal**: `text-gray-900` (#111827)
- **Placeholder**: `placeholder:text-gray-400` (#9CA3AF)
- **Label**: `text-gray-700` (#374151)
- **Borde**: `border-gray-300` (#D1D5DB)
- **Fondo**: `bg-white` (#FFFFFF)
- **Focus ring**: `focus:ring-primary` (color primario del tema)
- **Disabled bg**: `bg-gray-100` (#F3F4F6)
- **Disabled text**: `text-gray-500` (#6B7280)

## ✅ Archivos Corregidos

1. ✅ `/src/app/page.tsx` - Login inputs (email, password)
2. ✅ `/src/app/dashboard/logistics/orders/page.tsx` - Modal inputs (select, date, filter)
3. ✅ `/src/components/Chat/ChatWindow.tsx` - Input de mensaje
4. ✅ `/src/components/Chat/ConversationsList.tsx` - Input de búsqueda y select de filtro

## 🚀 Mejores Prácticas

1. **Siempre incluir**:
   - `bg-white` - Para fondo visible
   - `text-gray-900` - Para texto legible
   - `placeholder:text-gray-400` - Para placeholders visibles (en inputs de texto)

2. **Focus states**:
   - `focus:ring-2` - Ring de 2px al hacer focus
   - `focus:ring-primary` - Color del ring según tema
   - `focus:border-transparent` - Quitar borde en focus

3. **Transiciones**:
   - `transition-all` - Para transiciones suaves

4. **Outline**:
   - `outline-none` - Quitar outline por defecto del navegador

## 📝 Componente Reutilizable Sugerido

```tsx
// src/components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

## 🔍 Cómo Verificar

Para verificar que los inputs se ven correctamente:

1. **Texto visible**: El texto debe ser gris oscuro sobre fondo blanco
2. **Placeholder visible**: El placeholder debe ser gris claro
3. **Focus state**: Al hacer click debe aparecer un ring azul/primary
4. **Select options**: Las opciones deben tener texto negro visible

## ⚠️ Errores Comunes a Evitar

❌ **No hacer esto**:
```tsx
// SIN color de texto - texto invisible
<input className="w-full px-4 py-3 border rounded-lg" />
```

✅ **Hacer esto**:
```tsx
// CON color de texto - texto visible
<input className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900" />
```

## 📚 Recursos

- [Tailwind Forms Plugin](https://github.com/tailwindlabs/tailwindcss-forms) (opcional para mejor reset)
- [Headless UI](https://headlessui.com/) (para componentes de form más complejos)
