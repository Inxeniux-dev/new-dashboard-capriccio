// Tarjetas de estadísticas para el dashboard de metadatos
import React, { useState } from 'react';
import { useMetadataStats } from '@/hooks/useMetadataStats';
import { useEnrichedProducts } from '@/hooks/useEnrichedProducts';
import { ProductCard } from './ProductCard';
import type { EnrichedProduct } from '@/services/productMetadataService';

interface MetadataStatsCardProps {
  onEditProduct?: (product: EnrichedProduct) => void;
  role?: 'admin' | 'logistics' | 'employee';
  onDeleteMetadata?: (productId: string) => void;
}

export const MetadataStatsCard: React.FC<MetadataStatsCardProps> = ({
  onEditProduct,
  role = 'admin',
  onDeleteMetadata
}) => {
  const { stats, loading, error } = useMetadataStats();
  const [showCategorizedProducts, setShowCategorizedProducts] = useState(false);

  // Obtener productos con metadatos (solo los primeros 20 para no sobrecargar)
  const { products: allProducts, loading: productsLoading } = useEnrichedProducts({
    limit: 100, // Traemos más para asegurar tener suficientes con metadatos
    onlyWithMetadata: true, // Solo productos con metadatos
    autoFetch: showCategorizedProducts,
  });

  // Filtrar solo productos con metadatos y limitar a 20
  const categorizedProducts = allProducts
    .filter((p) => p.custom_metadata !== null && p.custom_metadata !== undefined)
    .slice(0, 20);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
        Error al cargar estadísticas: {error || 'Desconocido'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total de productos */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total de Productos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        {/* Con metadatos */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Con Metadatos</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.withMetadata}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.percentage}% del total
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        {/* Sin metadatos */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Sin Metadatos</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.withoutMetadata}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {100 - stats.percentage}% del total
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Progreso de Categorización
        </h3>
        <div className="relative">
          <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              style={{ width: `${stats.percentage}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-500"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {stats.percentage}% completado ({stats.withMetadata} de {stats.total} productos)
          </p>
        </div>

        {/* Top categorías */}
        {stats.topCategories.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Top Categorías
            </h4>
            <div className="space-y-2">
              {stats.topCategories.map((category) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category.category}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {category.count} productos
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Productos Categorizados */}
      {stats.withMetadata > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Productos Categorizados
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stats.withMetadata} productos con metadatos completos
              </p>
            </div>
            <button
              onClick={() => setShowCategorizedProducts(!showCategorizedProducts)}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              {showCategorizedProducts ? '🔼 Ocultar' : '🔽 Ver Productos'}
            </button>
          </div>

          {showCategorizedProducts && (
            <div className="mt-4 space-y-4">
              {productsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                    Cargando productos categorizados...
                  </p>
                </div>
              ) : (
                <>
                  {categorizedProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-4xl mb-2 block">📦</span>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        No hay productos categorizados aún
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Los productos con metadatos completos aparecerán aquí
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {categorizedProducts.map((product) => (
                          <ProductCard
                            key={product.product_id}
                            product={product}
                            onEdit={onEditProduct ? ((id: string) => {
                              const prod = categorizedProducts.find(p => p.product_id === id);
                              if (prod) onEditProduct(prod);
                            }) : undefined}
                            onDelete={onDeleteMetadata}
                            role={role}
                          />
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          Mostrando hasta 20 productos categorizados. Para ver más, usa la vista de productos.
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
