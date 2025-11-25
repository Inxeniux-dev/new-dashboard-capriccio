// Servicio de administración de categorías y presentaciones
// Permite CRUD completo con impacto en productos relacionados
// NOTA: El sistema de subcategorías ha sido eliminado, ahora se usa componentes

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

import type {
  Category,
  Presentation,
  Duration,
} from './categorizationService';

// Interfaces para administración
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

export interface CreatePresentationData {
  code: string;
  name: string;
  description?: string;
  size_info?: string;
  is_default?: boolean;
}

export interface UpdatePresentationData {
  code?: string;
  name?: string;
  description?: string;
  size_info?: string;
  is_default?: boolean;
  is_active?: boolean;
}

export interface CreateDurationData {
  code: string;
  name: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateDurationData {
  name?: string;
  description?: string;
  display_order?: number;
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

  // ==================== PRESENTACIONES ====================

  /**
   * Crear nueva presentación
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

  // ==================== DURACIONES ====================

  /**
   * Crear nueva duración
   */
  async createDuration(data: CreateDurationData): Promise<{
    success: boolean;
    message: string;
    data: Duration;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/durations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al crear duración');
    }

    return response.json();
  }

  /**
   * Actualizar duración existente
   */
  async updateDuration(
    id: number,
    data: UpdateDurationData
  ): Promise<{
    success: boolean;
    message: string;
    data: Duration;
    affectedProducts?: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/durations/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al actualizar duración');
    }

    return response.json();
  }

  /**
   * Eliminar duración
   */
  async deleteDuration(id: number, force: boolean = false): Promise<DeleteResponse> {
    const queryParams = force ? '?force=true' : '';
    const response = await fetch(`${API_BASE_URL}/api/durations/${id}${queryParams}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al eliminar duración');
    }

    return response.json();
  }

  /**
   * Activar/Desactivar duración
   */
  async toggleDurationStatus(id: number): Promise<{
    success: boolean;
    message: string;
    data: Duration;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/durations/${id}/toggle-status`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al cambiar estado de duración');
    }

    return response.json();
  }

  /**
   * Obtener conteo de productos afectados por una duración
   */
  async getDurationProductsCount(id: number): Promise<{
    success: boolean;
    duration_id: number;
    product_count: number;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/durations/${id}/products-count`,
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
