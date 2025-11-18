// Selector simple de duración para productos
import React, { useState, useEffect } from 'react';
import { categorizationService } from '@/services/categorizationService';
import type { Duration } from '@/services/categorizationService';

interface DurationSelectorProps {
  value?: number | null;
  onChange: (durationId: number | null) => void;
  disabled?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  showLabel = true,
  size = 'md',
}) => {
  const [durations, setDurations] = useState<Duration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDurations();
  }, []);

  const loadDurations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categorizationService.getAllDurations(true); // Solo activas
      setDurations(response.data);
    } catch (err) {
      console.error('Error loading durations:', err);
      setError('Error al cargar duraciones');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'text-sm py-1.5 px-2',
    md: 'text-base py-2 px-3',
    lg: 'text-lg py-2.5 px-4',
  };

  return (
    <div className="space-y-1">
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Duración <span className="text-red-500">*</span>
        </label>
      )}

      <select
        value={value || ''}
        onChange={(e) => {
          const selectedValue = e.target.value;
          onChange(selectedValue ? parseInt(selectedValue) : null);
        }}
        disabled={disabled || loading}
        className={`w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]}`}
      >
        <option value="">Ninguno</option>
        {loading && <option value="">Cargando...</option>}
        {error && <option value="">Error al cargar</option>}
        {!loading && !error && durations.map((duration) => (
          <option key={duration.id} value={duration.id}>
            {duration.name}{duration.description ? ` - ${duration.description}` : ''}
          </option>
        ))}
      </select>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Indica la vida útil o tipo de almacenamiento del producto
      </p>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};
