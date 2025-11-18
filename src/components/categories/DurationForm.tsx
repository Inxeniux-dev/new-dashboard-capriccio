// Formulario para crear/editar duraciones
import React, { useState } from 'react';
import type { Duration } from '@/services/categorizationService';
import type { CreateDurationData, UpdateDurationData } from '@/services/categoryAdminService';

interface DurationFormProps {
  duration?: Duration;
  onSubmit: (data: CreateDurationData | UpdateDurationData) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export const DurationForm: React.FC<DurationFormProps> = ({
  duration,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState({
    code: duration?.code || '',
    name: duration?.name || '',
    description: duration?.description || '',
    display_order: duration?.display_order || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código es obligatorio';
    } else if (!/^[a-z_]+$/.test(formData.code)) {
      newErrors.code = 'El código debe contener solo letras minúsculas y guiones bajos';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
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
      console.error('Error submitting duration:', err);
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
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
            errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="poca"
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
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Usar snake_case (ej: poca, media, alta, refrigerado, muy_alta)
        </p>
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
          placeholder="Poca"
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
          placeholder="Productos de corta duración (1-3 días)"
          disabled={saving}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Descripción de la duración o tipo de almacenamiento requerido
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
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Orden en que se muestra en los listados (0 = primero)
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
          {saving ? 'Guardando...' : mode === 'create' ? 'Crear Duración' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
};
