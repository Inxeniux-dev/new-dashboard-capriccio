// Formulario para crear/editar sub-subcategorías
import React, { useState, useEffect } from 'react';
import { categorizationService } from '@/services/categorizationService';
import type { Subsubcategory, Subcategory, Category } from '@/services/categorizationService';
import type {
  CreateSubsubcategoryData,
  UpdateSubsubcategoryData,
} from '@/services/categoryAdminService';

interface SubsubcategoryFormProps {
  subsubcategory?: Subsubcategory;
  preselectedSubcategoryId?: number;
  onSubmit: (data: CreateSubsubcategoryData | UpdateSubsubcategoryData) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export const SubsubcategoryForm: React.FC<SubsubcategoryFormProps> = ({
  subsubcategory,
  preselectedSubcategoryId,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  const [formData, setFormData] = useState({
    code: subsubcategory?.code || '',
    name: subsubcategory?.name || '',
    subcategory_id: subsubcategory?.subcategory_id || preselectedSubcategoryId || 0,
    description: subsubcategory?.description || '',
    display_order: subsubcategory?.display_order || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, hierarchyRes] = await Promise.all([
        categorizationService.getAllCategories(),
        categorizationService.getHierarchy(),
      ]);

      setCategories(categoriesRes.data);

      // Extraer subcategorías de la jerarquía
      const allSubcategories: Subcategory[] = [];
      hierarchyRes.data.forEach((cat) => {
        cat.subcategories.forEach((sub) => {
          allSubcategories.push({
            id: sub.id,
            code: sub.code,
            name: sub.name,
            category_id: cat.id,
            is_active: true,
          });
        });
      });
      setSubcategories(allSubcategories);

      // Si hay subcategoría preseleccionada, encontrar su categoría
      if (formData.subcategory_id) {
        const subcategory = allSubcategories.find((s) => s.id === formData.subcategory_id);
        if (subcategory) {
          setSelectedCategory(subcategory.category_id);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código es obligatorio';
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = 'El código debe contener solo letras mayúsculas, números y guiones bajos';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.subcategory_id || formData.subcategory_id === 0) {
      newErrors.subcategory_id = 'Debe seleccionar una subcategoría';
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
      console.error('Error submitting sub-subcategory:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategory(categoryId);
    // Reset subcategoría cuando cambie categoría
    setFormData({ ...formData, subcategory_id: 0 });
  };

  const filteredSubcategories = selectedCategory
    ? subcategories.filter((sub) => sub.category_id === selectedCategory)
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Categoría (solo para filtrar subcategorías) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Categoría Padre
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(parseInt(e.target.value))}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          disabled={saving || loadingData}
        >
          <option value="0">Seleccionar categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Selecciona una categoría para filtrar las subcategorías
        </p>
      </div>

      {/* Subcategoría Padre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Subcategoría Padre <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.subcategory_id}
          onChange={(e) =>
            setFormData({ ...formData, subcategory_id: parseInt(e.target.value) })
          }
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
            errors.subcategory_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={saving || loadingData || !selectedCategory}
        >
          <option value="0">
            {selectedCategory ? 'Seleccionar subcategoría' : 'Primero seleccione una categoría'}
          </option>
          {filteredSubcategories.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
        {errors.subcategory_id && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subcategory_id}</p>
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
          placeholder="OSCURO_70"
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
          placeholder="70% Cacao"
          disabled={saving}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          rows={3}
          placeholder="Chocolate oscuro con 70% de cacao"
          disabled={saving}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Descripción detallada de esta variante (opcional)
        </p>
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
          disabled={saving || loadingData}
        >
          {saving
            ? 'Guardando...'
            : mode === 'create'
            ? 'Crear Sub-subcategoría'
            : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
};
