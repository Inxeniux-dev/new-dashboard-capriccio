// Tarjeta de producto con metadatos
import React from 'react';
import { MetadataBadge } from './MetadataBadge';
import type { EnrichedProduct } from '@/services/productMetadataService';

interface ProductCardProps {
  product: EnrichedProduct;
  onEdit?: (productId: string) => void;
  onDelete?: (productId: string) => void;
  showActions?: boolean;
  role: 'admin' | 'logistics' | 'employee';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  showActions = true,
  role,
}) => {
  const hasMetadata = !!product.custom_metadata;
  const canEdit = role === 'admin' || role === 'logistics';
  const canDelete = role === 'admin';

  const handleDelete = () => {
    if (onDelete && window.confirm('¿Estás seguro de eliminar los metadatos de este producto?')) {
      onDelete(product.product_id);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
      <div className="flex justify-between items-start gap-3">
        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate" title={product.name}>
            {product.name}
          </h3>

          {product.brand && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{product.brand}</p>
          )}

          {product.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2" title={product.description}>
              {product.description}
            </p>
          )}

          {/* Badges de metadatos */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {hasMetadata && product.custom_metadata ? (
              <>
                {product.custom_metadata.custom_category && (
                  <MetadataBadge
                    type="category"
                    value={product.custom_metadata.custom_category}
                  />
                )}
                {product.custom_metadata.custom_subcategory && (
                  <MetadataBadge
                    type="subcategory"
                    value={product.custom_metadata.custom_subcategory}
                  />
                )}
                {product.custom_metadata.custom_presentation && (
                  <MetadataBadge
                    type="presentation"
                    value={product.custom_metadata.custom_presentation}
                  />
                )}
              </>
            ) : (
              <span className="inline-flex items-center px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full border border-amber-200 dark:border-amber-800">
                ⚠️ Sin metadatos
              </span>
            )}

            {/* Estado del producto */}
            <MetadataBadge
              type="status"
              value={product.status || 'ACTIVE'}
              size="sm"
            />
          </div>
        </div>

        {/* Acciones */}
        {showActions && canEdit && onEdit && (
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => onEdit(product.product_id)}
              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              title={hasMetadata ? 'Editar metadatos' : 'Agregar metadatos'}
            >
              <span className="text-lg">
                {hasMetadata ? '✏️' : '➕'}
              </span>
            </button>

            {canDelete && onDelete && hasMetadata && (
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                title="Eliminar metadatos"
              >
                <span className="text-lg">🗑️</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Información adicional de metadatos (solo admin) */}
      {role === 'admin' && hasMetadata && product.custom_metadata && product.custom_metadata.ai_description && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">Descripción IA:</span>{' '}
            <span className="line-clamp-2">{product.custom_metadata.ai_description}</span>
          </p>
        </div>
      )}
    </div>
  );
};
