// Formulario para crear/editar presentaciones
import React, { useState } from 'react';
import type { Presentation } from '@/services/categorizationService';
import type {
  CreatePresentationData,
  UpdatePresentationData,
} from '@/services/categoryAdminService';

interface PresentationFormProps {
  presentation?: Presentation;
  onSubmit: (data: CreatePresentationData | UpdatePresentationData) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export const PresentationForm: React.FC<PresentationFormProps> = ({
  presentation,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState({
    code: presentation?.code || '',
    name: presentation?.name || '',
    size_info: presentation?.size_info || '',
    is_default: presentation?.is_default || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código es obligatorio';
    } else if (!/^[A-Z_0-9]+$/.test(formData.code)) {
      newErrors.code =
        'El código debe contener solo letras mayúsculas, números y guiones bajos';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
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
      console.error('Error submitting presentation:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="BARRA_INDIVIDUAL"
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
          placeholder="Barra individual"
          disabled={saving}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Información de tamaño */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Información de Tamaño
        </label>
        <input
          type="text"
          value={formData.size_info}
          onChange={(e) => setFormData({ ...formData, size_info: e.target.value })}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          placeholder="50g"
          disabled={saving}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Por ejemplo: 50g, 250g, 12 pzas, etc.
        </p>
      </div>

      {/* Es default */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_default}
            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
            className="w-4 h-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
            disabled={saving}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Marcar como presentación por defecto
          </span>
        </label>
        <p className="mt-1 ml-6 text-xs text-gray-500 dark:text-gray-400">
          Las presentaciones por defecto se preseleccionan automáticamente
        </p>
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
          disabled={saving}
        >
          {saving
            ? 'Guardando...'
            : mode === 'create'
            ? 'Crear Presentación'
            : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
};
