// Hook para obtener estadísticas de metadatos de productos
import { useState, useEffect, useCallback } from 'react';
import { productMetadataService } from '@/services/productMetadataService';

interface MetadataStats {
  total: number;
  withMetadata: number;
  withoutMetadata: number;
  percentage: number;
  topCategories: Array<{ category: string; count: number }>;
}

interface UseMetadataStatsReturn {
  stats: MetadataStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMetadataStats = (): UseMetadataStatsReturn => {
  const [stats, setStats] = useState<MetadataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await productMetadataService.getMetadataStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Error al cargar estadísticas';
      setError(errorMessage);
      console.error('Error fetching metadata stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
