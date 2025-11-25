// Hook para obtener productos enriquecidos con metadatos personalizados
import { useState, useEffect, useCallback } from 'react';
import {
  productMetadataService,
  type EnrichedProduct,
  type GetProductsParams,
} from '@/services/productMetadataService';

interface UseEnrichedProductsOptions extends GetProductsParams {
  autoFetch?: boolean; // Si false, no hace fetch automático al montar
}

interface UseEnrichedProductsReturn {
  products: EnrichedProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalCount: number;
  pagination: {
    limit: number;
    offset: number;
  };
}

export const useEnrichedProducts = (
  options: UseEnrichedProductsOptions = {}
): UseEnrichedProductsReturn => {
  const { autoFetch = true, ...params } = options;

  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    limit: params.limit || 50,
    offset: params.offset || 0,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await productMetadataService.getEnrichedProducts(params);
      setProducts(response.data || []);
      setTotalCount(response.count || 0);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(errorMessage);
      console.error('Error fetching enriched products:', err);
    } finally {
      setLoading(false);
    }
  }, [
    params.search,
    params.category,
    params.presentation,
    params.limit,
    params.offset,
    params.includeInactive,
    params.onlyWithMetadata,
  ]);

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [autoFetch, fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    totalCount,
    pagination,
  };
};
