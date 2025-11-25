// Componente de selección múltiple de componentes para productos
import React, { useState, useEffect, useRef } from 'react';
import { componentService, type ProductComponent } from '@/services/componentService';

interface ComponentSelectorProps {
  selectedComponents: ProductComponent[];
  onChange: (components: ProductComponent[]) => void;
  disabled?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ComponentSelector: React.FC<ComponentSelectorProps> = ({
  selectedComponents,
  onChange,
  disabled = false,
  showLabel = true,
  size = 'md',
}) => {
  const [availableComponents, setAvailableComponents] = useState<ProductComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar componentes disponibles
  useEffect(() => {
    const loadComponents = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await componentService.getAllComponents(true);
        setAvailableComponents(result.data);
      } catch (err) {
        console.error('Error loading components:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar componentes');
      } finally {
        setLoading(false);
      }
    };

    loadComponents();
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar componentes disponibles que no están seleccionados
  const filteredComponents = availableComponents.filter(
    (comp) =>
      !selectedComponents.some((selected) => selected.id === comp.id) &&
      comp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddComponent = (component: ProductComponent) => {
    onChange([...selectedComponents, component]);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleRemoveComponent = (componentId: number) => {
    onChange(selectedComponents.filter((c) => c.id !== componentId));
  };

  // Clases dinámicas según el tamaño
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const chipSizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-300">
        <p className="text-sm">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${sizeClasses[size]}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Componentes
          <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">(Opcional)</span>
        </label>
      )}

      {/* Componentes seleccionados */}
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
        {selectedComponents.length === 0 ? (
          <span className="text-gray-400 dark:text-gray-500 text-sm">
            Sin componentes seleccionados
          </span>
        ) : (
          selectedComponents.map((component) => (
            <span
              key={component.id}
              className={`inline-flex items-center gap-1 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 rounded-full ${chipSizeClasses[size]}`}
            >
              <span className="truncate max-w-[150px]" title={component.name}>
                {component.name}
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveComponent(component.id)}
                  className="flex-shrink-0 hover:text-teal-900 dark:hover:text-teal-100 transition-colors"
                  aria-label={`Quitar ${component.name}`}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {/* Selector de componentes */}
      {!disabled && (
        <div className="relative" ref={dropdownRef}>
          <div
            className={`flex items-center border rounded-lg overflow-hidden transition-colors ${
              isOpen
                ? 'border-teal-500 dark:border-teal-400 ring-2 ring-teal-500/20 dark:ring-teal-400/20'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-900`}
          >
            <span className="px-3 text-gray-400 dark:text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Buscar y agregar componente..."
              className="flex-1 px-2 py-2 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
              disabled={loading}
            />
            {loading && (
              <span className="px-3">
                <svg
                  className="w-4 h-4 animate-spin text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
            )}
          </div>

          {/* Dropdown */}
          {isOpen && !loading && (
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredComponents.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                  {searchTerm
                    ? 'No se encontraron componentes'
                    : 'Todos los componentes ya están seleccionados'}
                </div>
              ) : (
                filteredComponents.map((component) => (
                  <button
                    key={component.id}
                    type="button"
                    onClick={() => handleAddComponent(component)}
                    className="w-full px-4 py-2 text-left hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {component.name}
                    </div>
                    {component.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {component.description}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Info adicional */}
      {selectedComponents.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {selectedComponents.length} componente{selectedComponents.length !== 1 ? 's' : ''}{' '}
          seleccionado{selectedComponents.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};
