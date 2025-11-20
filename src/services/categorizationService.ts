// Servicio para gestionar la categorización jerárquica de productos
// Integración con el sistema de categorización del backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

// Interfaces
export interface Category {
  id: number;
  code: string;
  name: string;
  description?: string;
  display_order?: number;
  is_active: boolean;
}

export interface Subcategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  category_id: number;
  display_order?: number;
  is_active: boolean;
}

export interface Subsubcategory {
  id: number;
  code: string;
  name: string;
  subcategory_id: number;
  description?: string;
  display_order?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Presentation {
  id: number;
  code: string;
  name: string;
  size_info?: string;
  is_default: boolean;
  is_active: boolean;
}

export interface Duration {
  id: number;
  code: string;
  name: string;
  description?: string;
  display_order?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryOptions {
  categories: Category[];
  subcategories: Subcategory[];
  subsubcategories: Subsubcategory[];
  presentations: Presentation[];
  durations?: Duration[];
}

export interface CategoryHierarchy {
  id: number;
  name: string;
  code: string;
  subcategories: {
    id: number;
    name: string;
    code: string;
    description?: string;
    display_order?: number;
    is_active?: boolean;
    presentations: {
      id: number;
      name: string;
      code: string;
      size_info?: string;
    }[];
  }[];
}

export interface ProductCategorization {
  product_id: string;
  category_id: number;
  subcategory_id: number;
  subsubcategory_id?: number; // Nuevo campo opcional
  presentation_id: number;
  product_categories?: {
    name: string;
  };
  product_subcategories?: {
    name: string;
  };
  product_subsubcategories?: {
    name: string;
  };
  product_presentations?: {
    name: string;
    size_info?: string;
  };
}

export interface ValidationResult {
  success: boolean;
  valid: boolean;
  message: string;
}

class CategorizationService {
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Obtiene todas las categorías disponibles
   */
  async getAllCategories(): Promise<{
    success: boolean;
    count: number;
    data: Category[];
  }> {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene opciones dinámicas basadas en la selección actual
   * Este es el endpoint RECOMENDADO para implementar la selección en cascada
   */
  async getOptions(params?: {
    category_id?: number;
    subcategory_id?: number;
  }): Promise<{
    success: boolean;
    data: CategoryOptions;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.category_id) {
      queryParams.append('category_id', params.category_id.toString());
    }
    if (params?.subcategory_id) {
      queryParams.append('subcategory_id', params.subcategory_id.toString());
    }

    const response = await fetch(
      `${API_BASE_URL}/api/categories/options?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch category options: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene la jerarquía completa de categorías
   * Útil para mostrar un árbol completo o para caché inicial
   */
  async getHierarchy(): Promise<{
    success: boolean;
    data: CategoryHierarchy[];
  }> {
    const response = await fetch(`${API_BASE_URL}/api/categories/hierarchy`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch category hierarchy: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Valida una combinación de categoría, subcategoría y presentación
   */
  async validateCombination(data: {
    category_id: number | null;
    subcategory_id: number | null;
    subsubcategory_id?: number | null;
    presentation_id: number | null;
  }): Promise<ValidationResult> {
    const response = await fetch(`${API_BASE_URL}/api/categories/validate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        valid: false,
        message: errorData?.message || 'Invalid combination',
      };
    }

    return response.json();
  }

  /**
   * Asigna categorización a un producto
   */
  async categorizeProduct(
    productId: string,
    data: {
      category_id: number;
      subcategory_id: number;
      presentation_id: number;
    }
  ): Promise<{
    success: boolean;
    message: string;
    data: ProductCategorization;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/products/${productId}/categorize`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Failed to categorize product: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Obtiene sub-subcategorías de una subcategoría
   */
  async getSubsubcategories(
    subcategoryId: number,
    activeOnly: boolean = true
  ): Promise<{
    success: boolean;
    count: number;
    data: Subsubcategory[];
  }> {
    const queryParams = new URLSearchParams();
    if (activeOnly) {
      queryParams.append('activeOnly', 'true');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/categories/subcategories/${subcategoryId}/subsubcategories?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch sub-subcategories: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene una sub-subcategoría por ID
   */
  async getSubsubcategoryById(id: number): Promise<{
    success: boolean;
    data: Subsubcategory;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/subsubcategories/${id}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch sub-subcategory: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene todas las presentaciones disponibles
   */
  async getAllPresentations(): Promise<{
    success: boolean;
    data: Presentation[];
  }> {
    const response = await fetch(`${API_BASE_URL}/api/categories/presentations`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch presentations: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene todas las duraciones disponibles
   */
  async getAllDurations(activeOnly: boolean = true): Promise<{
    success: boolean;
    count: number;
    data: Duration[];
  }> {
    const queryParams = new URLSearchParams();
    if (activeOnly) {
      queryParams.append('activeOnly', 'true');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/durations?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch durations: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene una duración por ID
   */
  async getDurationById(id: number): Promise<{
    success: boolean;
    data: Duration;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/durations/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch duration: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene productos por categorización
   */
  async getProductsByCategory(params?: {
    category_id?: number;
    subcategory_id?: number;
    presentation_id?: number;
  }): Promise<{
    success: boolean;
    data: ProductCategorization[];
  }> {
    const queryParams = new URLSearchParams();
    if (params?.category_id) {
      queryParams.append('category_id', params.category_id.toString());
    }
    if (params?.subcategory_id) {
      queryParams.append('subcategory_id', params.subcategory_id.toString());
    }
    if (params?.presentation_id) {
      queryParams.append('presentation_id', params.presentation_id.toString());
    }

    const response = await fetch(
      `${API_BASE_URL}/api/categories/products?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products by category: ${response.statusText}`);
    }

    return response.json();
  }
}

// Exportar instancia única del servicio
export const categorizationService = new CategorizationService();
