// Hook para obtener opciones de metadatos (categorías, presentaciones, componentes)
import { useState, useEffect } from 'react';
import {
  productMetadataService,
  type MetadataOptions,
} from '@/services/productMetadataService';

interface UseMetadataOptionsReturn {
  options: MetadataOptions;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMetadataOptions = (): UseMetadataOptionsReturn => {
  const [options, setOptions] = useState<MetadataOptions>({
    categories: [],
    presentations: [],
    categoryOptions: [],
    presentationOptions: [],
    durationOptions: [],
    componentOptions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await productMetadataService.getMetadataOptions();
      setOptions(data);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Error al cargar opciones de metadatos';
      setError(errorMessage);
      console.error('Error fetching metadata options:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return {
    options,
    loading,
    error,
    refetch: fetchOptions,
  };
};
