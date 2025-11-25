// Formulario para editar metadatos de productos
// Actualizado: Sistema de subcategorías reemplazado por componentes
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CategorySelector } from './CategorySelector';
import { DurationSelector } from './DurationSelector';
import { ComponentSelector } from './ComponentSelector';
import { componentService, type ProductComponent } from '@/services/componentService';
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

  // Estados para categorización
  const [categoryId, setCategoryId] = useState<number | null>(initialData?.category_id || null);
  const [presentationId, setPresentationId] = useState<number | null>(initialData?.presentation_id || null);
  const [durationId, setDurationId] = useState<number | null>(initialData?.duration_id || null);

  // Estado para componentes (nuevo sistema)
  const [selectedComponents, setSelectedComponents] = useState<ProductComponent[]>(
    initialData?.components || product?.components || []
  );

  // Estados para campos de texto
  const [aiDescription, setAiDescription] = useState(initialData?.ai_description || '');
  const [searchKeywords, setSearchKeywords] = useState<string[]>(initialData?.search_keywords || []);
  const [allergenInfo, setAllergenInfo] = useState<string[]>(initialData?.allergen_info || []);

  const [keywordInput, setKeywordInput] = useState('');
  const [allergenInput, setAllergenInput] = useState('');

  // Cargar componentes del producto al iniciar
  useEffect(() => {
    const loadProductComponents = async () => {
      if (productId && !initialData?.components && !product?.components) {
        try {
          const result = await componentService.getProductComponents(productId);
          if (result.data.length > 0) {
            setSelectedComponents(result.data);
          }
        } catch (err) {
          console.error('Error loading product components:', err);
        }
      }
    };

    loadProductComponents();
  }, [productId, initialData?.components, product?.components]);

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // Validar descripción de IA
    if (aiDescription && aiDescription.length > 500) {
      newErrors.ai_description = 'La descripción no puede exceder 500 caracteres';
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
      // Preparar metadatos
      const metadataToSave: Partial<CustomMetadata> = {
        category_id: categoryId,
        presentation_id: presentationId,
        duration_id: durationId,
        ai_description: aiDescription || null,
        search_keywords: searchKeywords.length > 0 ? searchKeywords : null,
        allergen_info: allergenInfo.length > 0 ? allergenInfo : null,
      };

      // Guardar metadatos básicos
      await onSave(metadataToSave);

      // Guardar componentes (llamada separada al API)
      try {
        const componentIds = selectedComponents.map(c => c.id);
        await componentService.setProductComponents(productId, componentIds);
      } catch (compErr) {
        console.error('Error saving components:', compErr);
        toast.error('Error al guardar los componentes');
      }

      toast.success('Metadatos guardados exitosamente');
    } catch (err) {
      console.error('Error saving metadata:', err);
      toast.error('Error al guardar los metadatos. Por favor, intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !searchKeywords.includes(keywordInput.trim())) {
      setSearchKeywords([...searchKeywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setSearchKeywords(searchKeywords.filter((k) => k !== keyword));
  };

  const addAllergen = () => {
    if (allergenInput.trim() && !allergenInfo.includes(allergenInput.trim())) {
      setAllergenInfo([...allergenInfo, allergenInput.trim()]);
      setAllergenInput('');
    }
  };

  const removeAllergen = (allergen: string) => {
    setAllergenInfo(allergenInfo.filter((a) => a !== allergen));
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

        {/* Sistema de categorización simplificado */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <CategorySelector
            initialCategoryId={categoryId || undefined}
            initialPresentationId={presentationId || undefined}
            onCategoryChange={(id) => setCategoryId(id)}
            onPresentationChange={(id) => setPresentationId(id)}
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

        {/* Selector de Duración */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-200 dark:bg-purple-700 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-200">
              T
            </div>
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Duración del Producto
              </h5>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Indica la vida útil o tipo de almacenamiento requerido
              </p>
            </div>
          </div>
          <DurationSelector
            value={durationId}
            onChange={(id) => setDurationId(id)}
            disabled={saving}
            showLabel={false}
            size="md"
          />
        </div>

        {/* Selector de Componentes (nuevo - reemplaza subcategorías) */}
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-200 dark:bg-teal-700 flex items-center justify-center text-xs font-bold text-teal-700 dark:text-teal-200">
              C
            </div>
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Componentes del Producto
              </h5>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Selecciona los ingredientes o componentes principales
              </p>
            </div>
          </div>
          <ComponentSelector
            selectedComponents={selectedComponents}
            onChange={setSelectedComponents}
            disabled={saving}
            showLabel={false}
            size="md"
          />
        </div>

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
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                  errors.ai_description ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                }`}
                rows={3}
                placeholder="Información adicional para mejorar recomendaciones de la IA..."
                disabled={saving}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {aiDescription.length} / 500 caracteres
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
                {searchKeywords.map((keyword) => (
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
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
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
                {allergenInfo.map((allergen) => (
                  <span
                    key={allergen}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm rounded-full"
                  >
                    {allergen}
                    <button
                      type="button"
                      onClick={() => removeAllergen(allergen)}
                      className="hover:text-amber-900 dark:hover:text-amber-100"
                      disabled={saving}
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
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
