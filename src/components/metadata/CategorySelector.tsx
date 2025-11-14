// Componente de selección en cascada para categorización de productos
import React from 'react';
import { useCategorization } from '@/hooks/useCategorization';

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

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  initialCategoryId,
  initialSubcategoryId,
  initialPresentationId,
  onCategoryChange,
  onSubcategoryChange,
  onPresentationChange,
  disabled = false,
  showLabels = true,
  size = 'md',
}) => {
  const {
    categories,
    subcategories,
    presentations,
    loading,
    error,
    selectedCategory,
    selectedSubcategory,
    selectedPresentation,
    setSelectedCategory,
    setSelectedSubcategory,
    setSelectedPresentation,
  } = useCategorization({
    initialCategoryId,
    initialSubcategoryId,
    initialPresentationId,
    autoLoadOnMount: true,
  });

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setSelectedCategory(value);
    onCategoryChange?.(value);
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setSelectedSubcategory(value);
    onSubcategoryChange?.(value);
  };

  const handlePresentationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setSelectedPresentation(value);
    onPresentationChange?.(value);
  };

  // Clases dinámicas según el tamaño
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2',
    lg: 'px-4 py-3 text-lg',
  };

  const selectClasses = `w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]}`;

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
        <p className="font-medium">Error al cargar categorías</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Categoría Principal */}
      <div>
        {showLabels && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categoría <span className="text-red-500">*</span>
          </label>
        )}
        <select
          value={selectedCategory || ''}
          onChange={handleCategoryChange}
          disabled={disabled || loading}
          className={selectClasses}
        >
          <option value="">Seleccionar Categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {loading && !selectedCategory && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cargando categorías...</p>
        )}
      </div>

      {/* Subcategoría */}
      <div>
        {showLabels && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subcategoría <span className="text-red-500">*</span>
          </label>
        )}
        <select
          value={selectedSubcategory || ''}
          onChange={handleSubcategoryChange}
          disabled={disabled || loading || !selectedCategory}
          className={selectClasses}
        >
          <option value="">
            {selectedCategory ? 'Seleccionar Subcategoría' : 'Primero seleccione una categoría'}
          </option>
          {subcategories.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
        {loading && selectedCategory && !selectedSubcategory && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Cargando subcategorías...
          </p>
        )}
      </div>

      {/* Presentación */}
      <div>
        {showLabels && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Presentación <span className="text-red-500">*</span>
          </label>
        )}
        <select
          value={selectedPresentation || ''}
          onChange={handlePresentationChange}
          disabled={disabled || loading || !selectedSubcategory}
          className={selectClasses}
        >
          <option value="">
            {selectedSubcategory
              ? 'Seleccionar Presentación'
              : 'Primero seleccione una subcategoría'}
          </option>
          {presentations.map((pres) => (
            <option key={pres.id} value={pres.id}>
              {pres.name}
              {pres.size_info && ` (${pres.size_info})`}
              {pres.is_default && ' ⭐'}
            </option>
          ))}
        </select>
        {loading && selectedSubcategory && !selectedPresentation && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Cargando presentaciones...
          </p>
        )}
      </div>

      {/* Indicador de selección completa */}
      {selectedCategory && selectedSubcategory && selectedPresentation && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-green-700 dark:text-green-300 text-sm font-medium">
              ✓ Categorización completa
            </span>
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1 space-y-0.5">
            <p>
              <span className="font-medium">Categoría:</span>{' '}
              {categories.find((c) => c.id === selectedCategory)?.name}
            </p>
            <p>
              <span className="font-medium">Subcategoría:</span>{' '}
              {subcategories.find((s) => s.id === selectedSubcategory)?.name}
            </p>
            <p>
              <span className="font-medium">Presentación:</span>{' '}
              {presentations.find((p) => p.id === selectedPresentation)?.name}
              {presentations.find((p) => p.id === selectedPresentation)?.size_info &&
                ` (${presentations.find((p) => p.id === selectedPresentation)?.size_info})`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
