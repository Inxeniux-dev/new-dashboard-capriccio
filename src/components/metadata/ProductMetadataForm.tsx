// Formulario para editar metadatos de productos
import React, { useState } from 'react';
import { toast } from 'sonner';
import { CategorySelector } from './CategorySelector';
import { useCategorization } from '@/hooks/useCategorization';
import { categorizationService } from '@/services/categorizationService';
import type { CustomMetadata, EnrichedProduct } from '@/services/productMetadataService';

interface ProductMetadataFormProps {
  product?: EnrichedProduct;
  productId: string;
  initialData?: CustomMetadata;
  onSave: (metadata: Partial<CustomMetadata>) => Promise<void>;
  onCancel: () => void;
  mode?: 'full' | 'simple'; // full para admin, simple para logística
}

export const ProductMetadataForm: React.FC<ProductMetadataFormProps> = ({
  product,
  productId,
  initialData,
  onSave,
  onCancel,
  mode = 'full',
}) => {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<CustomMetadata>>({
    custom_category: initialData?.custom_category || '',
    custom_subcategory: initialData?.custom_subcategory || '',
    custom_presentation: initialData?.custom_presentation || '',
    category_id: initialData?.category_id || null,
    subcategory_id: initialData?.subcategory_id || null,
    presentation_id: initialData?.presentation_id || null,
    ai_description: initialData?.ai_description || '',
    search_keywords: initialData?.search_keywords || [],
    allergen_info: initialData?.allergen_info || [],
  });

  // Hook para manejar categorización jerárquica
  const {
    setSelectedCategory,
    setSelectedSubcategory,
    setSelectedPresentation,
    isValid: isCategoryValid,
    getCombination,
  } = useCategorization({
    initialCategoryId: initialData?.category_id || undefined,
    initialSubcategoryId: initialData?.subcategory_id || undefined,
    initialPresentationId: initialData?.presentation_id || undefined,
    autoLoadOnMount: true,
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [allergenInput, setAllergenInput] = useState('');

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // Validar categorización jerárquica
    if (!isCategoryValid()) {
      newErrors.categorization = 'Debe seleccionar categoría, subcategoría y presentación';
    }

    if (formData.ai_description && formData.ai_description.length > 500) {
      newErrors.ai_description = 'La descripción no puede exceder 500 caracteres';
    }

    // Validar combinación con el backend si está completa
    if (isCategoryValid()) {
      const combination = getCombination();
      if (combination) {
        try {
          const validation = await categorizationService.validateCombination(combination);
          if (!validation.valid) {
            newErrors.categorization = validation.message || 'Combinación de categorías inválida';
          }
        } catch (err) {
          console.error('Error validating combination:', err);
          newErrors.categorization = 'Error al validar la combinación de categorías';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setSaving(true);

    try {
      // Obtener la combinación de categorías seleccionadas
      const combination = getCombination();

      // Preparar los datos completos con categorización jerárquica
      const metadataToSave = {
        ...formData,
        category_id: combination?.category_id || null,
        subcategory_id: combination?.subcategory_id || null,
        presentation_id: combination?.presentation_id || null,
      };

      // Primero guardar la categorización en el sistema de categorías
      if (combination) {
        try {
          await categorizationService.categorizeProduct(productId, combination);
        } catch (err) {
          console.error('Error categorizing product:', err);
          // Continuar aunque falle la categorización específica
        }
      }

      // Luego guardar todos los metadatos
      await onSave(metadataToSave);
    } catch (err) {
      console.error('Error saving metadata:', err);
      toast.error('Error al guardar los metadatos. Por favor, intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.search_keywords?.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        search_keywords: [...(formData.search_keywords || []), keywordInput.trim()],
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      search_keywords: formData.search_keywords?.filter((k) => k !== keyword) || [],
    });
  };

  const addAllergen = () => {
    if (allergenInput.trim() && !formData.allergen_info?.includes(allergenInput.trim())) {
      setFormData({
        ...formData,
        allergen_info: [...(formData.allergen_info || []), allergenInput.trim()],
      });
      setAllergenInput('');
    }
  };

  const removeAllergen = (allergen: string) => {
    setFormData({
      ...formData,
      allergen_info: formData.allergen_info?.filter((a) => a !== allergen) || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Información del producto */}
      {product && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Información del Producto</h4>
          <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <p><span className="font-medium">Nombre:</span> {product.name}</p>
            {product.brand && <p><span className="font-medium">Marca:</span> {product.brand}</p>}
            <p><span className="font-medium">ID:</span> {product.product_id}</p>
          </div>
        </div>
      )}

      {/* Metadatos Personalizados */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
          Categorización del Producto
        </h4>

        {/* Sistema de categorización jerárquica */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <CategorySelector
            initialCategoryId={formData.category_id || undefined}
            initialSubcategoryId={formData.subcategory_id || undefined}
            initialPresentationId={formData.presentation_id || undefined}
            onCategoryChange={(id) => setSelectedCategory(id)}
            onSubcategoryChange={(id) => setSelectedSubcategory(id)}
            onPresentationChange={(id) => setSelectedPresentation(id)}
            disabled={saving}
            showLabels={true}
            size="md"
          />
        </div>

        {errors.categorization && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-700 dark:text-red-300">{errors.categorization}</p>
          </div>
        )}

        {/* Campos avanzados solo para administrador */}
        {mode === 'full' && (
          <>
            {/* Descripción para IA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción para IA
                <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">(Opcional)</span>
              </label>
              <textarea
                value={formData.ai_description || ''}
                onChange={(e) => setFormData({ ...formData, ai_description: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                  errors.ai_description ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                }`}
                rows={3}
                placeholder="Información adicional para mejorar recomendaciones de la IA..."
                disabled={saving}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.ai_description?.length || 0} / 500 caracteres
              </p>
              {errors.ai_description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ai_description}</p>
              )}
            </div>

            {/* Palabras clave */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Palabras clave
                <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">(Opcional)</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Agregar palabra clave..."
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  disabled={saving || !keywordInput.trim()}
                >
                  + Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.search_keywords?.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                      disabled={saving}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Información de alérgenos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alérgenos
                <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">(Opcional)</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={allergenInput}
                  onChange={(e) => setAllergenInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAllergen();
                    }
                  }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Agregar alérgeno..."
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={addAllergen}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  disabled={saving || !allergenInput.trim()}
                >
                  + Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.allergen_info?.map((allergen) => (
                  <span
                    key={allergen}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm rounded-full"
                  >
                    ⚠️ {allergen}
                    <button
                      type="button"
                      onClick={() => removeAllergen(allergen)}
                      className="hover:text-amber-900 dark:hover:text-amber-100"
                      disabled={saving}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
};
