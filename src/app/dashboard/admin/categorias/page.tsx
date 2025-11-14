'use client';

// Página de administración de categorías, subcategorías y presentaciones
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { categorizationService } from '@/services/categorizationService';
import { categoryAdminService } from '@/services/categoryAdminService';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { SubcategoryForm } from '@/components/categories/SubcategoryForm';
import { PresentationForm } from '@/components/categories/PresentationForm';
import { Modal } from '@/components/metadata/Modal';
import type { Category, Subcategory, Presentation } from '@/services/categorizationService';
import type {
  CreateCategoryData,
  UpdateCategoryData,
  CreateSubcategoryData,
  UpdateSubcategoryData,
  CreatePresentationData,
  UpdatePresentationData,
} from '@/services/categoryAdminService';

type TabType = 'categories' | 'subcategories' | 'presentations';
type ModalMode = 'create' | 'edit' | null;

export default function CategoryAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [loading, setLoading] = useState(true);

  // Estados para categorías
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryModalMode, setCategoryModalMode] = useState<ModalMode>(null);

  // Estados para subcategorías
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [subcategoryModalMode, setSubcategoryModalMode] = useState<ModalMode>(null);

  // Estados para presentaciones
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [editingPresentation, setEditingPresentation] = useState<Presentation | null>(null);
  const [presentationModalMode, setPresentationModalMode] = useState<ModalMode>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar categorías y jerarquía primero (estos endpoints ya funcionan)
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

      // Intentar cargar presentaciones (endpoint nuevo que puede fallar)
      try {
        const presentationsRes = await categorizationService.getAllPresentations();
        setPresentations(presentationsRes.data);
      } catch (presError) {
        console.error('Error loading presentations:', presError);
        toast.error(
          'No se pudieron cargar las presentaciones. El endpoint GET /api/categories/presentations puede no estar implementado aún.',
          { duration: 5000 }
        );
        // Continuar sin presentaciones
        setPresentations([]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al cargar datos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLERS CATEGORÍAS ====================

  const handleCreateCategory = async (data: CreateCategoryData) => {
    try {
      await categoryAdminService.createCategory(data);
      toast.success('Categoría creada exitosamente');
      setCategoryModalMode(null);
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Error al crear categoría');
      throw err;
    }
  };

  const handleUpdateCategory = async (data: UpdateCategoryData) => {
    if (!editingCategory) return;

    try {
      const result = await categoryAdminService.updateCategory(editingCategory.id, data);
      toast.success(
        `Categoría actualizada. ${result.affectedProducts || 0} productos afectados`
      );
      setCategoryModalMode(null);
      setEditingCategory(null);
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Error al actualizar categoría');
      throw err;
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (
      !confirm(
        `¿Está seguro de eliminar la categoría "${category.name}"?\n\nEsto puede afectar a los productos relacionados.`
      )
    ) {
      return;
    }

    try {
      const result = await categoryAdminService.deleteCategory(category.id);
      toast.success(result.message);
      if (result.affectedProducts) {
        toast.info(`${result.affectedProducts} productos fueron actualizados`);
      }
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Error al eliminar categoría');
    }
  };

  const handleToggleCategoryStatus = async (category: Category) => {
    try {
      await categoryAdminService.toggleCategoryStatus(category.id);
      toast.success(
        `Categoría ${category.is_active ? 'desactivada' : 'activada'} exitosamente`
      );
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Error al cambiar estado');
    }
  };

  // ==================== HANDLERS SUBCATEGORÍAS ====================

  const handleCreateSubcategory = async (data: CreateSubcategoryData) => {
    try {
      await categoryAdminService.createSubcategory(data);
      toast.success('Subcategoría creada exitosamente');
      setSubcategoryModalMode(null);
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Error al crear subcategoría');
      throw err;
    }
  };

  const handleUpdateSubcategory = async (data: UpdateSubcategoryData) => {
    if (!editingSubcategory) return;

    try {
      const result = await categoryAdminService.updateSubcategory(editingSubcategory.id, data);
      toast.success(
        `Subcategoría actualizada. ${result.affectedProducts || 0} productos afectados`
      );
      setSubcategoryModalMode(null);
      setEditingSubcategory(null);
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Error al actualizar subcategoría');
      throw err;
    }
  };

  const handleDeleteSubcategory = async (subcategory: Subcategory) => {
    if (
      !confirm(
        `¿Está seguro de eliminar la subcategoría "${subcategory.name}"?\n\nEsto puede afectar a los productos relacionados.`
      )
    ) {
      return;
    }

    try {
      const result = await categoryAdminService.deleteSubcategory(subcategory.id);
      toast.success(result.message);
      if (result.affectedProducts) {
        toast.info(`${result.affectedProducts} productos fueron actualizados`);
      }
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Error al eliminar subcategoría');
    }
  };

  // ==================== HANDLERS PRESENTACIONES ====================

  const handleCreatePresentation = async (data: CreatePresentationData) => {
    try {
      await categoryAdminService.createPresentation(data);
      toast.success('Presentación creada exitosamente');
      setPresentationModalMode(null);
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Error al crear presentación');
      throw err;
    }
  };

  const handleUpdatePresentation = async (data: UpdatePresentationData) => {
    if (!editingPresentation) return;

    try {
      const result = await categoryAdminService.updatePresentation(editingPresentation.id, data);
      toast.success(
        `Presentación actualizada. ${result.affectedProducts || 0} productos afectados`
      );
      setPresentationModalMode(null);
      setEditingPresentation(null);
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Error al actualizar presentación');
      throw err;
    }
  };

  const handleDeletePresentation = async (presentation: Presentation) => {
    if (
      !confirm(
        `¿Está seguro de eliminar la presentación "${presentation.name}"?\n\nEsto puede afectar a los productos relacionados.`
      )
    ) {
      return;
    }

    try {
      const result = await categoryAdminService.deletePresentation(presentation.id);
      toast.success(result.message);
      if (result.affectedProducts) {
        toast.info(`${result.affectedProducts} productos fueron actualizados`);
      }
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Error al eliminar presentación');
    }
  };

  const handleSetPresentationDefault = async (presentation: Presentation) => {
    try {
      await categoryAdminService.setPresentationAsDefault(presentation.id);
      toast.success(`"${presentation.name}" marcada como presentación por defecto`);
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Error al marcar como default');
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Administración de Categorías
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona categorías, subcategorías y presentaciones de productos
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'categories'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Categorías ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('subcategories')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'subcategories'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Subcategorías ({subcategories.length})
          </button>
          <button
            onClick={() => setActiveTab('presentations')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'presentations'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Presentaciones ({presentations.length})
          </button>
        </nav>
      </div>

      {/* Botón crear */}
      <div className="mb-6">
        {activeTab === 'categories' && (
          <button
            onClick={() => setCategoryModalMode('create')}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            + Nueva Categoría
          </button>
        )}
        {activeTab === 'subcategories' && (
          <button
            onClick={() => setSubcategoryModalMode('create')}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            + Nueva Subcategoría
          </button>
        )}
        {activeTab === 'presentations' && (
          <button
            onClick={() => setPresentationModalMode('create')}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            + Nueva Presentación
          </button>
        )}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Tabla de Categorías */}
          {activeTab === 'categories' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Orden
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
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                          {category.code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {category.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {category.display_order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            category.is_active
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {category.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setCategoryModalMode('edit');
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleCategoryStatus(category)}
                            className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
                          >
                            {category.is_active ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
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
          )}

          {/* Tabla de Subcategorías */}
          {activeTab === 'subcategories' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Orden
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {subcategories.map((subcategory) => {
                    const parentCategory = categories.find(
                      (c) => c.id === subcategory.category_id
                    );
                    return (
                      <tr key={subcategory.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {parentCategory?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                            {subcategory.code}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {subcategory.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {subcategory.display_order || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingSubcategory(subcategory);
                                setSubcategoryModalMode('edit');
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteSubcategory(subcategory)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabla de Presentaciones */}
          {activeTab === 'presentations' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tamaño
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Default
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
                  {presentations.map((presentation) => (
                    <tr key={presentation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                          {presentation.code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {presentation.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {presentation.size_info || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {presentation.is_default && <span className="text-lg">⭐</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            presentation.is_active
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {presentation.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingPresentation(presentation);
                              setPresentationModalMode('edit');
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          >
                            Editar
                          </button>
                          {!presentation.is_default && (
                            <button
                              onClick={() => handleSetPresentationDefault(presentation)}
                              className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
                            >
                              Marcar Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePresentation(presentation)}
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
          )}
        </div>
      )}

      {/* Modals */}
      {/* Modal Categoría */}
      {categoryModalMode && (
        <Modal
          isOpen={!!categoryModalMode}
          onClose={() => {
            setCategoryModalMode(null);
            setEditingCategory(null);
          }}
          title={categoryModalMode === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}
          size="md"
        >
          <CategoryForm
            category={editingCategory || undefined}
            onSubmit={(data) =>
              categoryModalMode === 'create'
                ? handleCreateCategory(data as CreateCategoryData)
                : handleUpdateCategory(data as UpdateCategoryData)
            }
            onCancel={() => {
              setCategoryModalMode(null);
              setEditingCategory(null);
            }}
            mode={categoryModalMode}
          />
        </Modal>
      )}

      {/* Modal Subcategoría */}
      {subcategoryModalMode && (
        <Modal
          isOpen={!!subcategoryModalMode}
          onClose={() => {
            setSubcategoryModalMode(null);
            setEditingSubcategory(null);
          }}
          title={
            subcategoryModalMode === 'create' ? 'Nueva Subcategoría' : 'Editar Subcategoría'
          }
          size="md"
        >
          <SubcategoryForm
            subcategory={editingSubcategory || undefined}
            onSubmit={(data) =>
              subcategoryModalMode === 'create'
                ? handleCreateSubcategory(data as CreateSubcategoryData)
                : handleUpdateSubcategory(data as UpdateSubcategoryData)
            }
            onCancel={() => {
              setSubcategoryModalMode(null);
              setEditingSubcategory(null);
            }}
            mode={subcategoryModalMode}
          />
        </Modal>
      )}

      {/* Modal Presentación */}
      {presentationModalMode && (
        <Modal
          isOpen={!!presentationModalMode}
          onClose={() => {
            setPresentationModalMode(null);
            setEditingPresentation(null);
          }}
          title={
            presentationModalMode === 'create' ? 'Nueva Presentación' : 'Editar Presentación'
          }
          size="md"
        >
          <PresentationForm
            presentation={editingPresentation || undefined}
            onSubmit={(data) =>
              presentationModalMode === 'create'
                ? handleCreatePresentation(data as CreatePresentationData)
                : handleUpdatePresentation(data as UpdatePresentationData)
            }
            onCancel={() => {
              setPresentationModalMode(null);
              setEditingPresentation(null);
            }}
            mode={presentationModalMode}
          />
        </Modal>
      )}
    </div>
  );
}
