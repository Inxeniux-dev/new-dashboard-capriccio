// Servicio para gestionar metadatos personalizados de productos
// Integración con el sistema de metadatos de iPOS

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

interface CustomMetadata {
  id?: number;
  product_id: string;
  custom_category?: string | null;
  custom_subcategory?: string | null;
  custom_presentation?: string | null;
  ai_description?: string | null;
  search_keywords?: string[] | null;
  allergen_info?: string[] | null;
  // Nuevos campos para categorización jerárquica
  category_id?: number | null;
  subcategory_id?: number | null;
  subsubcategory_id?: number | null;
  presentation_id?: number | null;
  // Campo de duración (independiente de categorías)
  duration_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

interface EnrichedProduct {
  product_id: string;
  name: string;
  brand: string;
  description: string;
  status: string;
  price?: number;
  category?: string;
  subcategory?: string;
  image_url?: string;
  custom_metadata: CustomMetadata | null;
}

interface GetProductsParams {
  search?: string;
  category?: string;
  subcategory?: string;
  presentation?: string;
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
  onlyWithMetadata?: boolean; // Filtrar solo productos con custom_metadata
}

interface MetadataOptions {
  categories: string[];
  subcategories: string[];
  presentations: string[];
}

interface BatchUpdateItem {
  productId: string;
  metadata: Partial<CustomMetadata>;
}

interface BatchUpdateResponse {
  success: boolean;
  message: string;
  data: {
    success: number;
    errors: number;
    details: Array<{
      productId: string;
      status: 'success' | 'error';
      error?: string;
    }>;
  };
}

class ProductMetadataService {
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Obtiene productos enriquecidos con metadatos personalizados
   */
  async getEnrichedProducts(params: GetProductsParams = {}): Promise<{
    success: boolean;
    count: number;
    data: EnrichedProduct[];
    pagination: { limit: number; offset: number };
  }> {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.subcategory) queryParams.append('subcategory', params.subcategory);
    if (params.presentation) queryParams.append('presentation', params.presentation);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.includeInactive) queryParams.append('includeInactive', 'true');
    if (params.onlyWithMetadata) queryParams.append('onlyWithMetadata', 'true');

    const response = await fetch(
      `${API_BASE_URL}/api/products/enriched?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene las opciones disponibles para dropdowns (categorías, subcategorías, presentaciones)
   */
  async getMetadataOptions(): Promise<MetadataOptions> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/metadata/options`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata options: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Obtiene los metadatos de un producto específico
   */
  async getProductMetadata(productId: string): Promise<CustomMetadata | null> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/${productId}/metadata`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Producto sin metadatos
      }
      throw new Error(`Failed to fetch product metadata: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Crea o actualiza los metadatos de un producto
   */
  async saveProductMetadata(
    productId: string,
    metadata: Partial<CustomMetadata>
  ): Promise<CustomMetadata> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/${productId}/metadata`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(metadata),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error || errorData?.message || `Failed to save metadata: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Actualiza los metadatos de un producto existente (PUT)
   */
  async updateProductMetadata(
    productId: string,
    metadata: Partial<CustomMetadata>
  ): Promise<CustomMetadata> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/${productId}/metadata`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(metadata),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error || `Failed to update metadata: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Elimina los metadatos personalizados de un producto
   */
  async deleteProductMetadata(productId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/${productId}/metadata`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete metadata: ${response.statusText}`);
    }
  }

  /**
   * Actualización masiva de metadatos (solo administradores)
   */
  async batchUpdateMetadata(
    updates: BatchUpdateItem[]
  ): Promise<BatchUpdateResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/metadata/batch`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ updates }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to batch update metadata: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Sincroniza productos desde iPOS (solo administradores)
   */
  async syncProductsFromIpos(): Promise<{
    success: boolean;
    message: string;
    data: {
      newProducts: number;
      updatedProducts: number;
      preservedMetadata: number;
    };
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/sync`,
      {
        method: 'POST',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to sync products: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene estadísticas de metadatos
   */
  async getMetadataStats(): Promise<{
    total: number;
    withMetadata: number;
    withoutMetadata: number;
    percentage: number;
    topCategories: Array<{ category: string; count: number }>;
  }> {
    const result = await this.getEnrichedProducts({ limit: 1000 });
    const products = result.data;

    const withMetadata = products.filter((p) => p.custom_metadata !== null);
    const withoutMetadata = products.filter((p) => p.custom_metadata === null);

    // Calcular top categorías
    const categoryCount: Record<string, number> = {};
    withMetadata.forEach((p) => {
      const category = p.custom_metadata?.custom_category;
      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: products.length,
      withMetadata: withMetadata.length,
      withoutMetadata: withoutMetadata.length,
      percentage: products.length > 0
        ? Math.round((withMetadata.length / products.length) * 100)
        : 0,
      topCategories,
    };
  }
}

// Exportar instancia única del servicio
export const productMetadataService = new ProductMetadataService();

// Exportar tipos
export type {
  CustomMetadata,
  EnrichedProduct,
  GetProductsParams,
  MetadataOptions,
  BatchUpdateItem,
  BatchUpdateResponse,
};
