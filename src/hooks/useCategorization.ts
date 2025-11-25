// Hook para gestionar la selección de categorías y presentaciones
// Simplificado: se eliminaron subcategorías (ahora se usa sistema de componentes)
import { useState, useEffect, useCallback } from 'react';
import { categorizationService } from '@/services/categorizationService';
import type { Category, Presentation } from '@/services/categorizationService';

interface UseCategorization {
  // Estados
  categories: Category[];
  presentations: Presentation[];
  loading: boolean;
  error: string | null;

  // Valores seleccionados
  selectedCategory: number | null;
  selectedPresentation: number | null;

  // Funciones de selección
  setSelectedCategory: (categoryId: number | null) => void;
  setSelectedPresentation: (presentationId: number | null) => void;

  // Funciones utilitarias
  reset: () => void;
  isValid: () => boolean;
  getCombination: () => {
    category_id: number | null;
    presentation_id: number | null;
  } | null;
}

interface UseCategorizationOptions {
  initialCategoryId?: number;
  initialPresentationId?: number;
  autoLoadOnMount?: boolean;
}

export function useCategorization(
  options: UseCategorizationOptions = {}
): UseCategorization {
  const {
    initialCategoryId = null,
    initialPresentationId = null,
    autoLoadOnMount = true,
  } = options;

  // Estados de datos
  const [categories, setCategories] = useState<Category[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);

  // Estados de selección
  const [selectedCategory, setSelectedCategoryState] = useState<number | null>(
    initialCategoryId
  );
  const [selectedPresentation, setSelectedPresentationState] = useState<number | null>(
    initialPresentationId
  );

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar opciones dinámicamente según la selección
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

  // Cargar categorías iniciales al montar
  useEffect(() => {
    if (autoLoadOnMount) {
      loadOptions(initialCategoryId);
    }
  }, [autoLoadOnMount, initialCategoryId, loadOptions]);

  // Manejar cambio de categoría
  const setSelectedCategory = useCallback(
    (categoryId: number | null) => {
      setSelectedCategoryState(categoryId);
      setSelectedPresentationState(null);
      setPresentations([]);

      if (categoryId) {
        loadOptions(categoryId);
      }
    },
    [loadOptions]
  );

  // Manejar cambio de presentación
  const setSelectedPresentation = useCallback((presentationId: number | null) => {
    setSelectedPresentationState(presentationId);
  }, []);

  // Resetear todo
  const reset = useCallback(() => {
    setSelectedCategoryState(null);
    setSelectedPresentationState(null);
    setPresentations([]);
    loadOptions();
  }, [loadOptions]);

  // Validar si la selección está completa
  // Como todos son opcionales, siempre es válido
  const isValid = useCallback(() => {
    // Si no hay nada seleccionado, es válido (todo es opcional)
    if (!selectedCategory && !selectedPresentation) {
      return true;
    }
    // Si hay algo seleccionado, consideramos que es válido
    return true;
  }, [selectedCategory, selectedPresentation]);

  // Obtener combinación completa
  const getCombination = useCallback(() => {
    // Si no hay nada seleccionado, retornar null
    if (!selectedCategory && !selectedPresentation) {
      return null;
    }

    return {
      category_id: selectedCategory,
      presentation_id: selectedPresentation,
    };
  }, [selectedCategory, selectedPresentation]);

  return {
    categories,
    presentations,
    loading,
    error,
    selectedCategory,
    selectedPresentation,
    setSelectedCategory,
    setSelectedPresentation,
    reset,
    isValid,
    getCombination,
  };
}
