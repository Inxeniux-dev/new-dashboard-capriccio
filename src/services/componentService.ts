// Servicio para gestionar componentes de productos
// Sistema de componentes con relación muchos-a-muchos

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

// Interfaces
export interface ProductComponent {
  id: number;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateComponentData {
  name: string;
  description?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateComponentData {
  name?: string;
  description?: string | null;
  display_order?: number;
  is_active?: boolean;
}

class ComponentService {
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }

  // ==================== CRUD de Componentes (catálogo) ====================

  /**
   * Obtiene todos los componentes
   */
  async getAllComponents(activeOnly: boolean = true): Promise<{
    success: boolean;
    count: number;
    data: ProductComponent[];
  }> {
    const queryParams = new URLSearchParams();
    if (activeOnly) {
      queryParams.append('activeOnly', 'true');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/components?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch components: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene un componente por ID
   */
  async getComponentById(id: number): Promise<{
    success: boolean;
    data: ProductComponent;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/components/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch component: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Crea un nuevo componente
   */
  async createComponent(data: CreateComponentData): Promise<{
    success: boolean;
    message: string;
    data: ProductComponent;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/components`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || errorData?.error || `Failed to create component: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Actualiza un componente existente
   */
  async updateComponent(id: number, data: UpdateComponentData): Promise<{
    success: boolean;
    message: string;
    data: ProductComponent;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/components/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || errorData?.error || `Failed to update component: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Elimina un componente
   */
  async deleteComponent(id: number): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/components/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || errorData?.error || `Failed to delete component: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Activa o desactiva un componente
   */
  async toggleComponentStatus(id: number): Promise<{
    success: boolean;
    message: string;
    data: ProductComponent;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/components/${id}/toggle-status`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || errorData?.error || `Failed to toggle component status: ${response.statusText}`
      );
    }

    return response.json();
  }

  // ==================== Componentes de un Producto ====================

  /**
   * Obtiene los componentes de un producto específico
   */
  async getProductComponents(productId: string): Promise<{
    success: boolean;
    data: ProductComponent[];
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/${productId}/components`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { success: true, data: [] };
      }
      throw new Error(`Failed to fetch product components: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Agrega un componente a un producto
   */
  async addComponentToProduct(productId: string, componentId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/${productId}/components`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ componentId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || errorData?.error || `Failed to add component to product: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Reemplaza todos los componentes de un producto
   */
  async setProductComponents(productId: string, componentIds: number[]): Promise<{
    success: boolean;
    message: string;
    data?: {
      added: number;
      removed: number;
    };
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/${productId}/components`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ componentIds }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || errorData?.error || `Failed to set product components: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Elimina un componente de un producto
   */
  async removeComponentFromProduct(productId: string, componentId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/${productId}/components/${componentId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || errorData?.error || `Failed to remove component from product: ${response.statusText}`
      );
    }

    return response.json();
  }
}

// Exportar instancia única del servicio
export const componentService = new ComponentService();
