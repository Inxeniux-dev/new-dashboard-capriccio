// Componente de selección de categorías y presentaciones
// Simplificado: se eliminaron subcategorías (ahora se usa sistema de componentes)
import React, { useState, useEffect, useCallback } from 'react';
import { categorizationService } from '@/services/categorizationService';
import type { Category, Presentation } from '@/services/categorizationService';

interface CategorySelectorProps {
  initialCategoryId?: number;
  initialPresentationId?: number;
  onCategoryChange?: (categoryId: number | null) => void;
  onPresentationChange?: (presentationId: number | null) => void;
  disabled?: boolean;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  initialCategoryId,
  initialPresentationId,
  onCategoryChange,
  onPresentationChange,
  disabled = false,
  showLabels = true,
  size = 'md',
}) => {
  // Estados de datos
  const [categories, setCategories] = useState<Category[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de selección
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    initialCategoryId || null
  );
  const [selectedPresentation, setSelectedPresentation] = useState<number | null>(
    initialPresentationId || null
  );

  // Cargar opciones
  const loadOptions = useCallback(async (categoryId?: number | null) => {
    setLoading(true);
    setError(null);

    try {
      const params: { category_id?: number } = {};
      if (categoryId) params.category_id = categoryId;

      const result = await categorizationService.getOptions(params);
      setCategories(result.data.categories);
      setPresentations(result.data.presentations);
    } catch (err) {
      console.error('Error loading categorization options:', err);
      setError(
        err instanceof Error ? err.message : 'Error al cargar opciones de categorización'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    loadOptions(initialCategoryId);
  }, [initialCategoryId, loadOptions]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setSelectedCategory(value);
    onCategoryChange?.(value);
    // Recargar presentaciones si cambia la categoría
    loadOptions(value);
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

  // Obtener presentación seleccionada para mostrar descripción
  const selectedPresentationData = presentations.find(p => p.id === selectedPresentation);

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
            Categoría
            <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">(Opcional)</span>
          </label>
        )}
        <select
          value={selectedCategory || ''}
          onChange={handleCategoryChange}
          disabled={disabled || loading}
          className={selectClasses}
        >
          <option value="">Ninguno</option>
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

      {/* Presentación */}
      <div>
        {showLabels && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Presentación
            <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">(Opcional)</span>
          </label>
        )}
        <select
          value={selectedPresentation || ''}
          onChange={handlePresentationChange}
          disabled={disabled || loading}
          className={selectClasses}
        >
          <option value="">Ninguno</option>
          {presentations.map((pres) => (
            <option key={pres.id} value={pres.id}>
              {pres.name}
              {pres.size_info && ` (${pres.size_info})`}
              {pres.is_default && ' *'}
            </option>
          ))}
        </select>
        {loading && !selectedPresentation && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Cargando presentaciones...
          </p>
        )}
        {/* Mostrar descripción de la presentación si existe */}
        {selectedPresentationData?.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
            {selectedPresentationData.description}
          </p>
        )}
      </div>

      {/* Indicador de selección */}
      {(selectedCategory || selectedPresentation) && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
              Categorización seleccionada
            </span>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-0.5">
            {selectedCategory ? (
              <p>
                <span className="font-medium">Categoría:</span>{' '}
                {categories.find((c) => c.id === selectedCategory)?.name}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                <span className="font-medium">Categoría:</span> Ninguno
              </p>
            )}
            {selectedPresentation ? (
              <p>
                <span className="font-medium">Presentación:</span>{' '}
                {presentations.find((p) => p.id === selectedPresentation)?.name}
                {selectedPresentationData?.size_info &&
                  ` (${selectedPresentationData.size_info})`}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                <span className="font-medium">Presentación:</span> Ninguno
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
