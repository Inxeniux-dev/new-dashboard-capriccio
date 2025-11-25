'use client';

// Página de administración de componentes de productos
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { componentService, type ProductComponent, type CreateComponentData, type UpdateComponentData } from '@/services/componentService';
import { Modal } from '@/components/metadata/Modal';

type ModalMode = 'create' | 'edit' | null;

export default function ComponentsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState<ProductComponent[]>([]);
  const [editingComponent, setEditingComponent] = useState<ProductComponent | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState<CreateComponentData>({
    name: '',
    description: '',
    display_order: 0,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadComponents();
  }, [showInactive]);

  const loadComponents = async () => {
    setLoading(true);
    try {
      const result = await componentService.getAllComponents(!showInactive);
      setComponents(result.data);
    } catch (err) {
      console.error('Error loading components:', err);
      toast.error('Error al cargar los componentes');
    } finally {
      setLoading(false);
    }
  };

  const filteredComponents = components.filter((comp) =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (comp.description && comp.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      display_order: components.length + 1,
      is_active: true,
    });
    setEditingComponent(null);
    setModalMode('create');
  };

  const handleOpenEdit = (component: ProductComponent) => {
    setFormData({
      name: component.name,
      description: component.description || '',
      display_order: component.display_order,
      is_active: component.is_active,
    });
    setEditingComponent(component);
    setModalMode('edit');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingComponent(null);
    setFormData({
      name: '',
      description: '',
      display_order: 0,
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    setSaving(true);

    try {
      if (modalMode === 'create') {
        await componentService.createComponent(formData);
        toast.success('Componente creado exitosamente');
      } else if (modalMode === 'edit' && editingComponent) {
        await componentService.updateComponent(editingComponent.id, formData as UpdateComponentData);
        toast.success('Componente actualizado exitosamente');
      }

      handleCloseModal();
      loadComponents();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Error al guardar el componente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (component: ProductComponent) => {
    if (!confirm(`¿Estás seguro de eliminar el componente "${component.name}"?\n\nEsto puede afectar a los productos que lo usan.`)) {
      return;
    }

    try {
      await componentService.deleteComponent(component.id);
      toast.success('Componente eliminado exitosamente');
      loadComponents();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Error al eliminar el componente');
    }
  };

  const handleToggleStatus = async (component: ProductComponent) => {
    try {
      await componentService.toggleComponentStatus(component.id);
      toast.success(`Componente ${component.is_active ? 'desactivado' : 'activado'} exitosamente`);
      loadComponents();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Error al cambiar estado');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestión de Componentes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra los ingredientes y componentes que pueden asignarse a los productos
        </p>
      </div>

      {/* Acciones y filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors font-medium"
        >
          + Nuevo Componente
        </button>

        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar componentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 text-teal-600 dark:text-teal-500 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:focus:ring-teal-400"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Mostrar inactivos
          </span>
        </label>

        <button
          onClick={loadComponents}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          Actualizar
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 dark:border-teal-400"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando componentes...</p>
        </div>
      ) : filteredComponents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <span className="text-6xl mb-4 block">C</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? 'No se encontraron componentes' : 'Sin componentes'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm
              ? 'Intenta con otro término de búsqueda'
              : 'Comienza agregando el primer componente'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
            >
              + Crear Componente
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredComponents.map((component) => (
                  <tr key={component.id} className={!component.is_active ? 'opacity-60' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {component.display_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {component.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {component.description || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          component.is_active
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {component.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(component)}
                          className="text-teal-600 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleStatus(component)}
                          className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
                        >
                          {component.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleDelete(component)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredComponents.length} componente{filteredComponents.length !== 1 ? 's' : ''}
              {searchTerm && ` encontrado${filteredComponents.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      )}

      {/* Modal de crear/editar */}
      {modalMode && (
        <Modal
          isOpen={!!modalMode}
          onClose={handleCloseModal}
          title={modalMode === 'create' ? 'Nuevo Componente' : 'Editar Componente'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Ej: Chocolate Oscuro"
                disabled={saving}
                autoFocus
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Descripción opcional del componente..."
                rows={3}
                disabled={saving}
              />
            </div>

            {/* Orden de visualización */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Orden de visualización
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                min={0}
                disabled={saving}
              />
            </div>

            {/* Estado */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-teal-600 dark:text-teal-500 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:focus:ring-teal-400"
                  disabled={saving}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Componente activo
                </span>
              </label>
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? 'Guardando...' : modalMode === 'create' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
