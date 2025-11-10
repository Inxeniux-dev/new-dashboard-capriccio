// Select con autocompletado para metadatos
import React, { useState } from 'react';

interface MetadataSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  allowCreate?: boolean;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const MetadataSelect: React.FC<MetadataSelectProps> = ({
  label,
  value,
  options,
  onChange,
  allowCreate = false,
  required = false,
  placeholder = 'Seleccionar...',
  disabled = false,
  error,
}) => {
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newValue, setNewValue] = useState('');

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (selectedValue === '__CREATE_NEW__' && allowCreate) {
      setShowCreateInput(true);
    } else {
      onChange(selectedValue);
      setShowCreateInput(false);
    }
  };

  const handleCreateNew = () => {
    if (newValue.trim()) {
      onChange(newValue.trim());
      setNewValue('');
      setShowCreateInput(false);
    }
  };

  const handleCancelCreate = () => {
    setNewValue('');
    setShowCreateInput(false);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        {allowCreate && (
          <span className="text-xs text-blue-600 dark:text-blue-400 font-normal ml-2">
            (puedes crear nuevas opciones)
          </span>
        )}
      </label>

      {!showCreateInput ? (
        <>
          <select
            value={value}
            onChange={handleSelectChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
              error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
            } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'bg-white dark:bg-gray-900'} text-gray-900 dark:text-gray-100`}
            required={required}
            disabled={disabled}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            {allowCreate && (
              <option value="__CREATE_NEW__" className="font-bold">
                ➕ Crear nueva opción...
              </option>
            )}
          </select>
          {allowCreate && !disabled && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              💡 Si no encuentras la opción, selecciona &quot;Crear nueva opción...&quot; al final de la lista
            </p>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={`Escribe el nombre de la nueva ${label.toLowerCase()}...`}
              className="flex-1 border border-blue-500 dark:border-blue-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateNew();
                } else if (e.key === 'Escape') {
                  handleCancelCreate();
                }
              }}
            />
            <button
              type="button"
              onClick={handleCreateNew}
              className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newValue.trim()}
              title="Confirmar (Enter)"
            >
              ✓ Crear
            </button>
            <button
              type="button"
              onClick={handleCancelCreate}
              className="px-3 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              title="Cancelar (Esc)"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            ℹ️ Presiona <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Enter</kbd> para confirmar o <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Esc</kbd> para cancelar
          </p>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
