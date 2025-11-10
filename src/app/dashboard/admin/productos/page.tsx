'use client';

// Página principal de gestión de metadatos de productos - Administrador
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useEnrichedProducts } from '@/hooks/useEnrichedProducts';
import { productMetadataService } from '@/services/productMetadataService';
import { ProductCard } from '@/components/metadata/ProductCard';
import { ProductMetadataForm } from '@/components/metadata/ProductMetadataForm';
import { MetadataStatsCard } from '@/components/metadata/MetadataStatsCard';
import { Modal } from '@/components/metadata/Modal';
import { useMetadataOptions } from '@/hooks/useMetadataOptions';
import type { EnrichedProduct, CustomMetadata } from '@/services/productMetadataService';

export default function ProductMetadataAdminPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPresentation, setSelectedPresentation] = useState('');
  const [showOnlyWithoutMetadata, setShowOnlyWithoutMetadata] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const [editingProduct, setEditingProduct] = useState<EnrichedProduct | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    data?: {
      newProducts?: number;
      updatedProducts?: number;
      preservedMetadata?: number;
    };
  } | null>(null);

  const { options } = useMetadataOptions();
  const { products, loading, error, refetch } = useEnrichedProducts({
    search,
    category: selectedCategory,
    presentation: selectedPresentation,
    includeInactive,
  });

  // Filtrar productos sin metadatos si está activado
  const filteredProducts = showOnlyWithoutMetadata
    ? products.filter((p) => !p.custom_metadata)
    : products;

  const handleEditProduct = (productId: string) => {
    const product = products.find((p) => p.product_id === productId);
    if (product) {
      setEditingProduct(product);
    }
  };

  const handleSaveMetadata = async (metadata: Partial<CustomMetadata>) => {
    if (!editingProduct) return;

    try {
      await productMetadataService.saveProductMetadata(
        editingProduct.product_id,
        metadata
      );

      // Mostrar notificación de éxito
      toast.success('Metadatos guardados exitosamente');

      // Cerrar modal y recargar datos
      setEditingProduct(null);
      refetch();
    } catch (err) {
      throw err; // El formulario manejará el error
    }
  };

  const handleDeleteMetadata = async (productId: string) => {
    try {
      await productMetadataService.deleteProductMetadata(productId);
      toast.success('Metadatos eliminados exitosamente');
      refetch();
    } catch (err) {
      toast.error('Error al eliminar metadatos');
      console.error(err);
    }
  };

  const handleSyncIpos = async () => {
    if (
      !confirm(
        '¿Deseas sincronizar productos desde iPOS?\n\nLos metadatos personalizados se preservarán durante la sincronización.'
      )
    ) {
      return;
    }

    setSyncInProgress(true);
    setSyncResult(null);

    try {
      const result = await productMetadataService.syncProductsFromIpos();
      setSyncResult(result);

      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (err) {
      toast.error('Error al sincronizar productos desde iPOS');
      console.error(err);
    } finally {
      setSyncInProgress(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedPresentation('');
    setShowOnlyWithoutMetadata(false);
    setIncludeInactive(false);
  };

  const hasActiveFilters =
    search || selectedCategory || selectedPresentation || showOnlyWithoutMetadata || includeInactive;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestión de Metadatos de Productos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra la información personalizada de productos para mejorar las recomendaciones de IA
        </p>
      </div>

      {/* Acciones principales */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleSyncIpos}
          disabled={syncInProgress}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {syncInProgress ? '⏳ Sincronizando...' : '🔄 Sincronizar iPOS'}
        </button>

        <button
          onClick={() => setShowStats(!showStats)}
          className="px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-medium"
        >
          {showStats ? '📋 Ver Productos' : '📊 Ver Estadísticas'}
        </button>

        <button
          onClick={refetch}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Mostrar estadísticas o productos */}
      {showStats ? (
        <MetadataStatsCard
          onEditProduct={(product) => setEditingProduct(product)}
          onDeleteMetadata={handleDeleteMetadata}
          role="admin"
        />
      ) : (
        <>
          {/* Filtros */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Buscar
                </label>
                <input
                  type="text"
                  placeholder="Buscar por nombre, marca..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todas las categorías</option>
                  {options.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Presentación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Presentación
                </label>
                <select
                  value={selectedPresentation}
                  onChange={(e) => setSelectedPresentation(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todas las presentaciones</option>
                  {options.presentations.map((pres) => (
                    <option key={pres} value={pres}>
                      {pres}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyWithoutMetadata}
                  onChange={(e) => setShowOnlyWithoutMetadata(e.target.checked)}
                  className="w-4 h-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mostrar solo sin metadatos
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Incluir productos inactivos
                </span>
              </label>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  ✕ Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Lista de productos */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Productos ({filteredProducts.length})
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando productos...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
                Error al cargar productos: {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🍫</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {showOnlyWithoutMetadata
                    ? '¡Todos los productos tienen metadatos!'
                    : 'No se encontraron productos'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {showOnlyWithoutMetadata
                    ? 'Excelente trabajo, todos los productos están categorizados.'
                    : 'Intenta ajustar los filtros de búsqueda.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteMetadata}
                    role="admin"
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de edición */}
      {editingProduct && (
        <Modal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          title={`Editar Metadatos: ${editingProduct.name}`}
          size="lg"
        >
          <ProductMetadataForm
            product={editingProduct}
            productId={editingProduct.product_id}
            initialData={editingProduct.custom_metadata || undefined}
            onSave={handleSaveMetadata}
            onCancel={() => setEditingProduct(null)}
            mode="full"
          />
        </Modal>
      )}

      {/* Modal de resultado de sincronización */}
      {syncResult && (
        <Modal
          isOpen={!!syncResult}
          onClose={() => setSyncResult(null)}
          title="Sincronización Completada"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-300 font-medium mb-2">
                ✅ Sincronización exitosa
              </p>
              <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                <p>• Productos nuevos: {syncResult.data?.newProducts || 0}</p>
                <p>• Productos actualizados: {syncResult.data?.updatedProducts || 0}</p>
                <p>• Metadatos preservados: {syncResult.data?.preservedMetadata || 0}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Los metadatos personalizados se han preservado correctamente durante la sincronización.
            </p>

            <button
              onClick={() => setSyncResult(null)}
              className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
