// Hook para gestionar la selección en cascada de categorías
import { useState, useEffect, useCallback } from 'react';
import { categorizationService } from '@/services/categorizationService';
import type {
  Category,
  Subcategory,
  Subsubcategory,
  Presentation,
} from '@/services/categorizationService';

interface UseCategorization {
  // Estados
  categories: Category[];
  subcategories: Subcategory[];
  subsubcategories: Subsubcategory[];
  presentations: Presentation[];
  loading: boolean;
  error: string | null;

  // Valores seleccionados
  selectedCategory: number | null;
  selectedSubcategory: number | null;
  selectedSubsubcategory: number | null;
  selectedPresentation: number | null;

  // Funciones de selección
  setSelectedCategory: (categoryId: number | null) => void;
  setSelectedSubcategory: (subcategoryId: number | null) => void;
  setSelectedSubsubcategory: (subsubcategoryId: number | null) => void;
  setSelectedPresentation: (presentationId: number | null) => void;

  // Funciones utilitarias
  reset: () => void;
  isValid: () => boolean;
  getCombination: () => {
    category_id: number | null;
    subcategory_id: number | null;
    subsubcategory_id: number | null;
    presentation_id: number | null;
  } | null;
}

interface UseCategorizationOptions {
  initialCategoryId?: number;
  initialSubcategoryId?: number;
  initialSubsubcategoryId?: number;
  initialPresentationId?: number;
  autoLoadOnMount?: boolean;
}

export function useCategorization(
  options: UseCategorizationOptions = {}
): UseCategorization {
  const {
    initialCategoryId = null,
    initialSubcategoryId = null,
    initialSubsubcategoryId = null,
    initialPresentationId = null,
    autoLoadOnMount = true,
  } = options;

  // Estados de datos
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subsubcategories, setSubsubcategories] = useState<Subsubcategory[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);

  // Estados de selección
  const [selectedCategory, setSelectedCategoryState] = useState<number | null>(
    initialCategoryId
  );
  const [selectedSubcategory, setSelectedSubcategoryState] = useState<number | null>(
    initialSubcategoryId
  );
  const [selectedSubsubcategory, setSelectedSubsubcategoryState] = useState<number | null>(
    initialSubsubcategoryId
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
    async (subcategoryId: number | null) => {
      setSelectedSubcategoryState(subcategoryId);
      setSelectedSubsubcategoryState(null);
      setSelectedPresentationState(null);
      setSubsubcategories([]);
      setPresentations([]);

      // Cargar sub-subcategorías si hay subcategoría seleccionada
      if (subcategoryId) {
        try {
          const subsubcategoriesRes = await categorizationService.getSubsubcategories(subcategoryId, true);
          setSubsubcategories(subsubcategoriesRes.data);
        } catch (err) {
          console.error('Error loading subsubcategories:', err);
          setSubsubcategories([]);
        }

        if (selectedCategory) {
          loadOptions(selectedCategory, subcategoryId);
        }
      }
    },
    [selectedCategory, loadOptions]
  );

  // Manejar cambio de sub-subcategoría
  const setSelectedSubsubcategory = useCallback((subsubcategoryId: number | null) => {
    setSelectedSubsubcategoryState(subsubcategoryId);
  }, []);

  // Manejar cambio de presentación
  const setSelectedPresentation = useCallback((presentationId: number | null) => {
    setSelectedPresentationState(presentationId);
  }, []);

  // Resetear todo
  const reset = useCallback(() => {
    setSelectedCategoryState(null);
    setSelectedSubcategoryState(null);
    setSelectedSubsubcategoryState(null);
    setSelectedPresentationState(null);
    setSubcategories([]);
    setSubsubcategories([]);
    setPresentations([]);
    loadOptions();
  }, [loadOptions]);

  // Validar si la selección está completa (ahora todos son opcionales)
  // Solo validamos que si hay algo seleccionado, la combinación tenga sentido
  const isValid = useCallback(() => {
    // Si no hay nada seleccionado, es válido (todo es opcional)
    if (!selectedCategory && !selectedSubcategory && !selectedSubsubcategory && !selectedPresentation) {
      return true;
    }
    // Si hay algo seleccionado, al menos debe haber categoría, subcategoría y presentación
    return (
      selectedCategory !== null &&
      selectedSubcategory !== null &&
      selectedPresentation !== null
    );
  }, [selectedCategory, selectedSubcategory, selectedSubsubcategory, selectedPresentation]);

  // Obtener combinación completa (ahora permite valores null)
  const getCombination = useCallback(() => {
    // Si no hay nada seleccionado, retornar null
    if (!selectedCategory && !selectedSubcategory && !selectedSubsubcategory && !selectedPresentation) {
      return null;
    }

    // Si hay selección parcial, retornar lo que haya
    return {
      category_id: selectedCategory,
      subcategory_id: selectedSubcategory,
      subsubcategory_id: selectedSubsubcategory,
      presentation_id: selectedPresentation,
    };
  }, [selectedCategory, selectedSubcategory, selectedSubsubcategory, selectedPresentation]);

  return {
    categories,
    subcategories,
    subsubcategories,
    presentations,
    loading,
    error,
    selectedCategory,
    selectedSubcategory,
    selectedSubsubcategory,
    selectedPresentation,
    setSelectedCategory,
    setSelectedSubcategory,
    setSelectedSubsubcategory,
    setSelectedPresentation,
    reset,
    isValid,
    getCombination,
  };
}
