// Formulario para crear/editar subcategorías
import React, { useState, useEffect } from 'react';
import { categorizationService } from '@/services/categorizationService';
import type { Subcategory, Category } from '@/services/categorizationService';
import type {
  CreateSubcategoryData,
  UpdateSubcategoryData,
} from '@/services/categoryAdminService';

interface SubcategoryFormProps {
  subcategory?: Subcategory;
  preselectedCategoryId?: number;
  onSubmit: (data: CreateSubcategoryData | UpdateSubcategoryData) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export const SubcategoryForm: React.FC<SubcategoryFormProps> = ({
  subcategory,
  preselectedCategoryId,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    code: subcategory?.code || '',
    name: subcategory?.name || '',
    category_id: subcategory?.category_id || preselectedCategoryId || 0,
    display_order: subcategory?.display_order || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await categorizationService.getAllCategories();
      setCategories(result.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código es obligatorio';
    } else if (!/^[A-Z_]+$/.test(formData.code)) {
      newErrors.code = 'El código debe contener solo letras mayúsculas y guiones bajos';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.category_id || formData.category_id === 0) {
      newErrors.category_id = 'Debe seleccionar una categoría';
    }

    if (formData.display_order < 0) {
      newErrors.display_order = 'El orden debe ser mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Error submitting subcategory:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Categoría Padre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Categoría Padre <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.category_id}
          onChange={(e) =>
            setFormData({ ...formData, category_id: parseInt(e.target.value) })
          }
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
            errors.category_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={saving || loadingCategories}
        >
          <option value="0">Seleccionar categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category_id}</p>
        )}
      </div>

      {/* Código */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Código <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
            errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="OSCURO"
          disabled={saving || mode === 'edit'}
        />
        {errors.code && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.code}</p>
        )}
        {mode === 'edit' && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            El código no puede ser modificado
          </p>
        )}
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
            errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Oscuro"
          disabled={saving}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Orden de visualización */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Orden de Visualización
        </label>
        <input
          type="number"
          value={formData.display_order}
          onChange={(e) =>
            setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
          }
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
            errors.display_order ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          min="0"
          disabled={saving}
        />
        {errors.display_order && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.display_order}</p>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
          disabled={saving || loadingCategories}
        >
          {saving
            ? 'Guardando...'
            : mode === 'create'
            ? 'Crear Subcategoría'
            : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
};
