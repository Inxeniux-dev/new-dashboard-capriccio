'use client';

// Página de administración de categorías, presentaciones y duraciones
// NOTA: El sistema de subcategorías ha sido reemplazado por componentes
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronRight, Home } from 'lucide-react';
import { categorizationService } from '@/services/categorizationService';
import type { Category, Presentation, Duration } from '@/services/categorizationService';
import { categoryAdminService } from '@/services/categoryAdminService';
import { Modal } from '@/components/metadata/Modal';

type ActiveTab = 'categories' | 'presentations' | 'durations';
type ModalMode = 'create' | 'edit' | null;

export default function CategoryAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('categories');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  // Datos
  const [categories, setCategories] = useState<Category[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [durations, setDurations] = useState<Duration[]>([]);

  // Estados de edición
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingPresentation, setEditingPresentation] = useState<Presentation | null>(null);
  const [editingDuration, setEditingDuration] = useState<Duration | null>(null);

  // Formularios
  const [categoryForm, setCategoryForm] = useState({
    code: '',
    name: '',
    description: '',
    display_order: 0,
  });

  const [presentationForm, setPresentationForm] = useState({
    code: '',
    name: '',
    description: '',
    size_info: '',
    is_default: false,
  });

  const [durationForm, setDurationForm] = useState({
    code: '',
    name: '',
    description: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, presentationsRes, durationsRes] = await Promise.all([
        categorizationService.getAllCategories(),
        categorizationService.getAllPresentations(false),
        categorizationService.getAllDurations(false),
      ]);

      setCategories(categoriesRes.data);
      setPresentations(presentationsRes.data);
      setDurations(durationsRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingCategory(null);
    setEditingPresentation(null);
    setEditingDuration(null);
  };

  // ==================== CATEGORÍAS ====================
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        code: category.code,
        name: category.name,
        description: category.description || '',
        display_order: category.display_order || 0,
      });
      setModalMode('edit');
    } else {
      setEditingCategory(null);
      setCategoryForm({
        code: '',
        name: '',
        description: '',
        display_order: categories.length + 1,
      });
      setModalMode('create');
    }
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.code || !categoryForm.name) {
      toast.error('El código y nombre son requeridos');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await categoryAdminService.updateCategory(editingCategory.id, categoryForm);
        toast.success('Categoría actualizada');
      } else {
        await categoryAdminService.createCategory(categoryForm);
        toast.success('Categoría creada');
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      toast.error((err as Error).message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategoryStatus = async (category: Category) => {
    try {
      await categoryAdminService.toggleCategoryStatus(category.id);
      toast.success(`Categoría ${category.is_active ? 'desactivada' : 'activada'}`);
      loadData();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const deleteCategory = async (category: Category) => {
    if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    try {
      await categoryAdminService.deleteCategory(category.id);
      toast.success('Categoría eliminada');
      loadData();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // ==================== PRESENTACIONES ====================
  const openPresentationModal = (presentation?: Presentation) => {
    if (presentation) {
      setEditingPresentation(presentation);
      setPresentationForm({
        code: presentation.code,
        name: presentation.name,
        description: presentation.description || '',
        size_info: presentation.size_info || '',
        is_default: presentation.is_default,
      });
      setModalMode('edit');
    } else {
      setEditingPresentation(null);
      setPresentationForm({
        code: '',
        name: '',
        description: '',
        size_info: '',
        is_default: false,
      });
      setModalMode('create');
    }
  };

  const savePresentation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presentationForm.code || !presentationForm.name) {
      toast.error('El código y nombre son requeridos');
      return;
    }

    setSaving(true);
    try {
      if (editingPresentation) {
        await categoryAdminService.updatePresentation(editingPresentation.id, presentationForm);
        toast.success('Presentación actualizada');
      } else {
        await categoryAdminService.createPresentation(presentationForm);
        toast.success('Presentación creada');
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      toast.error((err as Error).message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const togglePresentationStatus = async (presentation: Presentation) => {
    try {
      await categoryAdminService.togglePresentationStatus(presentation.id);
      toast.success(`Presentación ${presentation.is_active ? 'desactivada' : 'activada'}`);
      loadData();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const deletePresentation = async (presentation: Presentation) => {
    if (!confirm(`¿Eliminar la presentación "${presentation.name}"?`)) return;
    try {
      await categoryAdminService.deletePresentation(presentation.id);
      toast.success('Presentación eliminada');
      loadData();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // ==================== DURACIONES ====================
  const openDurationModal = (duration?: Duration) => {
    if (duration) {
      setEditingDuration(duration);
      setDurationForm({
        code: duration.code,
        name: duration.name,
        description: duration.description || '',
        display_order: duration.display_order || 0,
        is_active: duration.is_active,
      });
      setModalMode('edit');
    } else {
      setEditingDuration(null);
      setDurationForm({
        code: '',
        name: '',
        description: '',
        display_order: durations.length + 1,
        is_active: true,
      });
      setModalMode('create');
    }
  };

  const saveDuration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!durationForm.code || !durationForm.name) {
      toast.error('El código y nombre son requeridos');
      return;
    }

    setSaving(true);
    try {
      if (editingDuration) {
        await categoryAdminService.updateDuration(editingDuration.id, durationForm);
        toast.success('Duración actualizada');
      } else {
        await categoryAdminService.createDuration(durationForm);
        toast.success('Duración creada');
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      toast.error((err as Error).message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const toggleDurationStatus = async (duration: Duration) => {
    try {
      await categoryAdminService.toggleDurationStatus(duration.id);
      toast.success(`Duración ${duration.is_active ? 'desactivada' : 'activada'}`);
      loadData();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const deleteDuration = async (duration: Duration) => {
    if (!confirm(`¿Eliminar la duración "${duration.name}"?`)) return;
    try {
      await categoryAdminService.deleteDuration(duration.id);
      toast.success('Duración eliminada');
      loadData();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // ==================== RENDER ====================
  const inputClasses = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const renderTable = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando...</p>
        </div>
      );
    }

    const thClass = "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider";
    const tdClass = "px-6 py-4 whitespace-nowrap text-sm";

    switch (activeTab) {
      case 'categories':
        return (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className={thClass}>Código</th>
                <th className={thClass}>Nombre</th>
                <th className={thClass}>Descripción</th>
                <th className={thClass}>Estado</th>
                <th className={`${thClass} text-right`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map((cat) => (
                <tr key={cat.id} className={!cat.is_active ? 'opacity-60' : ''}>
                  <td className={`${tdClass} font-mono text-gray-600 dark:text-gray-400`}>{cat.code}</td>
                  <td className={`${tdClass} font-medium text-gray-900 dark:text-gray-100`}>{cat.name}</td>
                  <td className={`${tdClass} text-gray-600 dark:text-gray-400`}>{cat.description || '-'}</td>
                  <td className={tdClass}>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${cat.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                      {cat.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <button onClick={() => openCategoryModal(cat)} className="text-blue-600 dark:text-blue-400 hover:underline mr-3">Editar</button>
                    <button onClick={() => toggleCategoryStatus(cat)} className="text-amber-600 dark:text-amber-400 hover:underline mr-3">{cat.is_active ? 'Desactivar' : 'Activar'}</button>
                    <button onClick={() => deleteCategory(cat)} className="text-red-600 dark:text-red-400 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'presentations':
        return (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className={thClass}>Código</th>
                <th className={thClass}>Nombre</th>
                <th className={thClass}>Descripción</th>
                <th className={thClass}>Tamaño</th>
                <th className={thClass}>Estado</th>
                <th className={`${thClass} text-right`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {presentations.map((pres) => (
                <tr key={pres.id} className={!pres.is_active ? 'opacity-60' : ''}>
                  <td className={`${tdClass} font-mono text-gray-600 dark:text-gray-400`}>{pres.code}</td>
                  <td className={tdClass}>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{pres.name}</span>
                    {pres.is_default && <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">Default</span>}
                  </td>
                  <td className={`${tdClass} text-gray-600 dark:text-gray-400 max-w-xs truncate`}>{pres.description || '-'}</td>
                  <td className={`${tdClass} text-gray-600 dark:text-gray-400`}>{pres.size_info || '-'}</td>
                  <td className={tdClass}>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${pres.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                      {pres.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <button onClick={() => openPresentationModal(pres)} className="text-blue-600 dark:text-blue-400 hover:underline mr-3">Editar</button>
                    <button onClick={() => togglePresentationStatus(pres)} className="text-amber-600 dark:text-amber-400 hover:underline mr-3">{pres.is_active ? 'Desactivar' : 'Activar'}</button>
                    <button onClick={() => deletePresentation(pres)} className="text-red-600 dark:text-red-400 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'durations':
        return (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className={thClass}>Código</th>
                <th className={thClass}>Nombre</th>
                <th className={thClass}>Descripción</th>
                <th className={thClass}>Orden</th>
                <th className={thClass}>Estado</th>
                <th className={`${thClass} text-right`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {durations.map((dur) => (
                <tr key={dur.id} className={!dur.is_active ? 'opacity-60' : ''}>
                  <td className={`${tdClass} font-mono text-gray-600 dark:text-gray-400`}>{dur.code}</td>
                  <td className={`${tdClass} font-medium text-gray-900 dark:text-gray-100`}>{dur.name}</td>
                  <td className={`${tdClass} text-gray-600 dark:text-gray-400`}>{dur.description || '-'}</td>
                  <td className={`${tdClass} text-gray-600 dark:text-gray-400`}>{dur.display_order}</td>
                  <td className={tdClass}>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${dur.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                      {dur.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <button onClick={() => openDurationModal(dur)} className="text-blue-600 dark:text-blue-400 hover:underline mr-3">Editar</button>
                    <button onClick={() => toggleDurationStatus(dur)} className="text-amber-600 dark:text-amber-400 hover:underline mr-3">{dur.is_active ? 'Desactivar' : 'Activar'}</button>
                    <button onClick={() => deleteDuration(dur)} className="text-red-600 dark:text-red-400 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link
          href="/dashboard"
          className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <Home className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href="/dashboard/admin/productos"
          className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Productos
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-gray-100 font-medium">
          Configuración de Catálogos
        </span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Configuración de Catálogos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra categorías, presentaciones y duraciones del sistema
        </p>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => router.push('/dashboard/admin/productos')}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          ← Volver a Productos
        </button>
        <button
          onClick={() => router.push('/dashboard/admin/componentes')}
          className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors font-medium"
        >
          Gestionar Componentes
        </button>
        <button onClick={loadData} disabled={loading} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium">
          Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-4">
          {(['categories', 'presentations', 'durations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'categories' && `Categorías (${categories.length})`}
              {tab === 'presentations' && `Presentaciones (${presentations.length})`}
              {tab === 'durations' && `Duraciones (${durations.length})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Botón crear */}
      <div className="mb-4">
        <button
          onClick={() => {
            if (activeTab === 'categories') openCategoryModal();
            else if (activeTab === 'presentations') openPresentationModal();
            else openDurationModal();
          }}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
        >
          + Nueva {activeTab === 'categories' ? 'Categoría' : activeTab === 'presentations' ? 'Presentación' : 'Duración'}
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {renderTable()}
        </div>
      </div>

      {/* Modal Categoría */}
      {modalMode && activeTab === 'categories' && (
        <Modal isOpen={true} onClose={handleCloseModal} title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'} size="md">
          <form onSubmit={saveCategory} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código *</label>
                <input type="text" value={categoryForm.code} onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value.toUpperCase() })} className={inputClasses} placeholder="CHOC" disabled={saving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className={inputClasses} placeholder="Chocolates" disabled={saving} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className={inputClasses} rows={2} disabled={saving} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Orden</label>
              <input type="number" value={categoryForm.display_order} onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })} className={`${inputClasses} w-32`} min={0} disabled={saving} />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" disabled={saving}>Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Presentación */}
      {modalMode && activeTab === 'presentations' && (
        <Modal isOpen={true} onClose={handleCloseModal} title={editingPresentation ? 'Editar Presentación' : 'Nueva Presentación'} size="md">
          <form onSubmit={savePresentation} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código *</label>
                <input type="text" value={presentationForm.code} onChange={(e) => setPresentationForm({ ...presentationForm, code: e.target.value.toUpperCase() })} className={inputClasses} placeholder="BOTE" disabled={saving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                <input type="text" value={presentationForm.name} onChange={(e) => setPresentationForm({ ...presentationForm, name: e.target.value })} className={inputClasses} placeholder="Bote" disabled={saving} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <textarea value={presentationForm.description} onChange={(e) => setPresentationForm({ ...presentationForm, description: e.target.value })} className={inputClasses} rows={2} placeholder="Envase de vidrio reutilizable" disabled={saving} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tamaño</label>
              <input type="text" value={presentationForm.size_info} onChange={(e) => setPresentationForm({ ...presentationForm, size_info: e.target.value })} className={inputClasses} placeholder="250g" disabled={saving} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={presentationForm.is_default} onChange={(e) => setPresentationForm({ ...presentationForm, is_default: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded" disabled={saving} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Presentación por defecto</span>
            </label>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" disabled={saving}>Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Duración */}
      {modalMode && activeTab === 'durations' && (
        <Modal isOpen={true} onClose={handleCloseModal} title={editingDuration ? 'Editar Duración' : 'Nueva Duración'} size="md">
          <form onSubmit={saveDuration} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código *</label>
                <input type="text" value={durationForm.code} onChange={(e) => setDurationForm({ ...durationForm, code: e.target.value.toUpperCase() })} className={inputClasses} placeholder="CORTA" disabled={saving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                <input type="text" value={durationForm.name} onChange={(e) => setDurationForm({ ...durationForm, name: e.target.value })} className={inputClasses} placeholder="Corta" disabled={saving} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <textarea value={durationForm.description} onChange={(e) => setDurationForm({ ...durationForm, description: e.target.value })} className={inputClasses} rows={2} placeholder="1-2 semanas" disabled={saving} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Orden</label>
              <input type="number" value={durationForm.display_order} onChange={(e) => setDurationForm({ ...durationForm, display_order: parseInt(e.target.value) || 0 })} className={`${inputClasses} w-32`} min={0} disabled={saving} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={durationForm.is_active} onChange={(e) => setDurationForm({ ...durationForm, is_active: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded" disabled={saving} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Duración activa</span>
            </label>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" disabled={saving}>Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
