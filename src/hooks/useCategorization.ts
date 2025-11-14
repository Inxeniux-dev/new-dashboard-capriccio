// Hook para gestionar la selección en cascada de categorías
import { useState, useEffect, useCallback } from 'react';
import { categorizationService } from '@/services/categorizationService';
import type {
  Category,
  Subcategory,
  Presentation,
} from '@/services/categorizationService';

interface UseCategorization {
  // Estados
  categories: Category[];
  subcategories: Subcategory[];
  presentations: Presentation[];
  loading: boolean;
  error: string | null;

  // Valores seleccionados
  selectedCategory: number | null;
  selectedSubcategory: number | null;
  selectedPresentation: number | null;

  // Funciones de selección
  setSelectedCategory: (categoryId: number | null) => void;
  setSelectedSubcategory: (subcategoryId: number | null) => void;
  setSelectedPresentation: (presentationId: number | null) => void;

  // Funciones utilitarias
  reset: () => void;
  isValid: () => boolean;
  getCombination: () => {
    category_id: number;
    subcategory_id: number;
    presentation_id: number;
  } | null;
}

interface UseCategorizationOptions {
  initialCategoryId?: number;
  initialSubcategoryId?: number;
  initialPresentationId?: number;
  autoLoadOnMount?: boolean;
}

export function useCategorization(
  options: UseCategorizationOptions = {}
): UseCategorization {
  const {
    initialCategoryId = null,
    initialSubcategoryId = null,
    initialPresentationId = null,
    autoLoadOnMount = true,
  } = options;

  // Estados de datos
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);

  // Estados de selección
  const [selectedCategory, setSelectedCategoryState] = useState<number | null>(
    initialCategoryId
  );
  const [selectedSubcategory, setSelectedSubcategoryState] = useState<number | null>(
    initialSubcategoryId
  );
  const [selectedPresentation, setSelectedPresentationState] = useState<number | null>(
    initialPresentationId
  );

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar opciones dinámicamente según la selección
  const loadOptions = useCallback(
    async (categoryId?: number | null, subcategoryId?: number | null) => {
      setLoading(true);
      setError(null);

      try {
        const params: { category_id?: number; subcategory_id?: number } = {};
        if (categoryId) params.category_id = categoryId;
        if (subcategoryId) params.subcategory_id = subcategoryId;

        const result = await categorizationService.getOptions(params);

        setCategories(result.data.categories);
        setSubcategories(result.data.subcategories);
        setPresentations(result.data.presentations);
      } catch (err) {
        console.error('Error loading categorization options:', err);
        setError(
          err instanceof Error ? err.message : 'Error al cargar opciones de categorización'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Cargar categorías iniciales al montar
  useEffect(() => {
    if (autoLoadOnMount) {
      loadOptions(initialCategoryId, initialSubcategoryId);
    }
  }, [autoLoadOnMount, initialCategoryId, initialSubcategoryId, loadOptions]);

  // Manejar cambio de categoría
  const setSelectedCategory = useCallback(
    (categoryId: number | null) => {
      setSelectedCategoryState(categoryId);
      setSelectedSubcategoryState(null);
      setSelectedPresentationState(null);
      setSubcategories([]);
      setPresentations([]);

      if (categoryId) {
        loadOptions(categoryId);
      }
    },
    [loadOptions]
  );

  // Manejar cambio de subcategoría
  const setSelectedSubcategory = useCallback(
    (subcategoryId: number | null) => {
      setSelectedSubcategoryState(subcategoryId);
      setSelectedPresentationState(null);
      setPresentations([]);

      if (subcategoryId && selectedCategory) {
        loadOptions(selectedCategory, subcategoryId);
      }
    },
    [selectedCategory, loadOptions]
  );

  // Manejar cambio de presentación
  const setSelectedPresentation = useCallback((presentationId: number | null) => {
    setSelectedPresentationState(presentationId);
  }, []);

  // Resetear todo
  const reset = useCallback(() => {
    setSelectedCategoryState(null);
    setSelectedSubcategoryState(null);
    setSelectedPresentationState(null);
    setSubcategories([]);
    setPresentations([]);
    loadOptions();
  }, [loadOptions]);

  // Validar si la selección está completa
  const isValid = useCallback(() => {
    return (
      selectedCategory !== null &&
      selectedSubcategory !== null &&
      selectedPresentation !== null
    );
  }, [selectedCategory, selectedSubcategory, selectedPresentation]);

  // Obtener combinación completa
  const getCombination = useCallback(() => {
    if (!isValid()) return null;

    return {
      category_id: selectedCategory!,
      subcategory_id: selectedSubcategory!,
      presentation_id: selectedPresentation!,
    };
  }, [selectedCategory, selectedSubcategory, selectedPresentation, isValid]);

  return {
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
    reset,
    isValid,
    getCombination,
  };
}
