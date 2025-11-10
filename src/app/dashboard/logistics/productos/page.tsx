'use client';

// Página simplificada de actualización de productos - Logística
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useEnrichedProducts } from '@/hooks/useEnrichedProducts';
import { productMetadataService } from '@/services/productMetadataService';
import { ProductCard } from '@/components/metadata/ProductCard';
import { ProductMetadataForm } from '@/components/metadata/ProductMetadataForm';
import { Modal } from '@/components/metadata/Modal';
import { useMetadataOptions } from '@/hooks/useMetadataOptions';
import type { EnrichedProduct, CustomMetadata } from '@/services/productMetadataService';

export default function ProductMetadataLogisticsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPresentation, setSelectedPresentation] = useState('');
  const [showOnlyPending, setShowOnlyPending] = useState(true); // Por defecto mostrar pendientes

  const [editingProduct, setEditingProduct] = useState<EnrichedProduct | null>(null);

  const { options } = useMetadataOptions();
  const { products, loading, error, refetch } = useEnrichedProducts({
    search,
    category: selectedCategory,
    presentation: selectedPresentation,
    includeInactive: false, // Logística solo ve productos activos
  });

  // Filtrar productos pendientes (sin metadatos) si está activado
  const filteredProducts = showOnlyPending
    ? products.filter((p) => !p.custom_metadata)
    : products;

  const pendingCount = products.filter((p) => !p.custom_metadata).length;

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
      toast.success('Producto actualizado exitosamente');

      // Cerrar modal y recargar datos
      setEditingProduct(null);
      refetch();
    } catch (err) {
      throw err; // El formulario manejará el error
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedPresentation('');
    setShowOnlyPending(true);
  };

  const hasActiveFilters = search || selectedCategory || selectedPresentation;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Actualización de Productos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Actualiza la información de categoría y presentación de los productos
        </p>
      </div>

      {/* Contador de pendientes */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                {pendingCount} producto{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {pendingCount === 1
                  ? 'Hay un producto sin categorizar'
                  : `Hay ${pendingCount} productos sin categorizar`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Acciones principales */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={refetch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
        >
          🔄 Actualizar
        </button>
      </div>

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

        {/* Checkbox */}
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyPending}
              onChange={(e) => setShowOnlyPending(e.target.checked)}
              className="w-4 h-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mostrar solo pendientes
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
            Productos Activos ({filteredProducts.length})
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
            <span className="text-6xl mb-4 block">🎉</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {showOnlyPending
                ? '¡Excelente trabajo!'
                : 'No se encontraron productos'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {showOnlyPending
                ? 'No hay productos pendientes por categorizar.'
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
                role="logistics"
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {editingProduct && (
        <Modal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          title={`Actualizar Producto: ${editingProduct.name}`}
          size="md"
        >
          <ProductMetadataForm
            product={editingProduct}
            productId={editingProduct.product_id}
            initialData={editingProduct.custom_metadata || undefined}
            onSave={handleSaveMetadata}
            onCancel={() => setEditingProduct(null)}
            mode="simple" // Modo simplificado para logística
          />
        </Modal>
      )}
    </div>
  );
}
