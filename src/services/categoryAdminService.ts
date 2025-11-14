// Servicio de administración de categorías, subcategorías y presentaciones
// Permite CRUD completo con impacto en productos relacionados

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

import type {
  Category,
  Subcategory,
  Presentation,
} from './categorizationService';

// Interfaces adicionales para administración
export interface CreateCategoryData {
  code: string;
  name: string;
  description?: string;
  display_order?: number;
}

export interface UpdateCategoryData {
  code?: string;
  name?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface CreateSubcategoryData {
  code: string;
  name: string;
  category_id: number;
  display_order?: number;
}

export interface UpdateSubcategoryData {
  code?: string;
  name?: string;
  category_id?: number;
  display_order?: number;
  is_active?: boolean;
}

export interface CreatePresentationData {
  code: string;
  name: string;
  size_info?: string;
  is_default?: boolean;
}

export interface UpdatePresentationData {
  code?: string;
  name?: string;
  size_info?: string;
  is_default?: boolean;
  is_active?: boolean;
}

export interface ProductImpact {
  count: number;
  products?: Array<{
    product_id: string;
    name: string;
  }>;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  affectedProducts?: number;
}

class CategoryAdminService {
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }

  // ==================== CATEGORÍAS ====================

  /**
   * Crear nueva categoría
   */
  async createCategory(data: CreateCategoryData): Promise<{
    success: boolean;
    data: Category;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al crear categoría');
    }

    return response.json();
  }

  /**
   * Actualizar categoría existente
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async updateCategory(
    id: number,
    data: UpdateCategoryData
  ): Promise<{
    success: boolean;
    data: Category;
    affectedProducts?: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al actualizar categoría');
    }

    return response.json();
  }

  /**
   * Eliminar categoría
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async deleteCategory(id: number): Promise<DeleteResponse> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al eliminar categoría');
    }

    return response.json();
  }

  /**
   * Activar/Desactivar categoría
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async toggleCategoryStatus(id: number): Promise<{
    success: boolean;
    data: Category;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/${id}/toggle-status`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al cambiar estado de categoría');
    }

    return response.json();
  }

  /**
   * Obtener conteo de productos afectados por una categoría
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async getCategoryProductsCount(id: number): Promise<ProductImpact> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/${id}/products-count`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 'Error al obtener conteo de productos'
      );
    }

    return response.json();
  }

  // ==================== SUBCATEGORÍAS ====================

  /**
   * Crear nueva subcategoría
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async createSubcategory(data: CreateSubcategoryData): Promise<{
    success: boolean;
    data: Subcategory;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/${data.category_id}/subcategories`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al crear subcategoría');
    }

    return response.json();
  }

  /**
   * Actualizar subcategoría existente
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async updateSubcategory(
    id: number,
    data: UpdateSubcategoryData
  ): Promise<{
    success: boolean;
    data: Subcategory;
    affectedProducts?: number;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/subcategories/${id}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al actualizar subcategoría');
    }

    return response.json();
  }

  /**
   * Eliminar subcategoría
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async deleteSubcategory(id: number): Promise<DeleteResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/subcategories/${id}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al eliminar subcategoría');
    }

    return response.json();
  }

  /**
   * Activar/Desactivar subcategoría
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async toggleSubcategoryStatus(id: number): Promise<{
    success: boolean;
    data: Subcategory;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/subcategories/${id}/toggle-status`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 'Error al cambiar estado de subcategoría'
      );
    }

    return response.json();
  }

  /**
   * Obtener conteo de productos afectados por una subcategoría
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async getSubcategoryProductsCount(id: number): Promise<ProductImpact> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/subcategories/${id}/products-count`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 'Error al obtener conteo de productos'
      );
    }

    return response.json();
  }

  // ==================== PRESENTACIONES ====================

  /**
   * Crear nueva presentación
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async createPresentation(data: CreatePresentationData): Promise<{
    success: boolean;
    data: Presentation;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/categories/presentations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al crear presentación');
    }

    return response.json();
  }

  /**
   * Actualizar presentación existente
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async updatePresentation(
    id: number,
    data: UpdatePresentationData
  ): Promise<{
    success: boolean;
    data: Presentation;
    affectedProducts?: number;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/presentations/${id}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al actualizar presentación');
    }

    return response.json();
  }

  /**
   * Eliminar presentación
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async deletePresentation(id: number): Promise<DeleteResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/presentations/${id}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al eliminar presentación');
    }

    return response.json();
  }

  /**
   * Activar/Desactivar presentación
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async togglePresentationStatus(id: number): Promise<{
    success: boolean;
    data: Presentation;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/presentations/${id}/toggle-status`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 'Error al cambiar estado de presentación'
      );
    }

    return response.json();
  }

  /**
   * Marcar presentación como default
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async setPresentationAsDefault(id: number): Promise<{
    success: boolean;
    data: Presentation;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/presentations/${id}/set-default`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 'Error al marcar presentación como default'
      );
    }

    return response.json();
  }

  /**
   * Obtener conteo de productos afectados por una presentación
   * NOTA: Este endpoint debe ser implementado por el backend
   */
  async getPresentationProductsCount(id: number): Promise<ProductImpact> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/presentations/${id}/products-count`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 'Error al obtener conteo de productos'
      );
    }

    return response.json();
  }
}

// Exportar instancia única del servicio
export const categoryAdminService = new CategoryAdminService();
