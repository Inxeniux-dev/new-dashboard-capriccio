import type {
  ApiResponse,
  ErrorResponse,
  User,
  LoginRequest,
  AuthResponse,
  Conversation,
  ConversationStats,
  Message,
  SendMessageRequest,
  MarkReadRequest,
  MessageStats,
  Contact,
  ContactStats,
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  AssignOrderToBranchRequest,
  Branch,
  LogisticsDashboard,
  AdminDashboard,
  EmployeeDashboard,
  GlobalStats,
  AIConfig,
  AILog,
  Notification,
} from "@/types/api";

// ============================================
// CONFIGURACIÓN
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-meta-service.vercel.app";
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || "";

// ============================================
// UTILIDADES
// ============================================

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : API_TOKEN;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Merge existing headers
  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as ErrorResponse;

      // Manejar errores de autenticación (401)
      if (response.status === 401 && typeof window !== "undefined") {
        // Token inválido o expirado - cerrar sesión automáticamente
        console.warn("Token inválido o expirado. Cerrando sesión...");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");

        // Redirigir al login solo si no estamos ya en la página de login
        if (!window.location.pathname.includes("/login") && window.location.pathname !== "/") {
          window.location.href = "/";
        }

        // No lanzar el error después de manejar la redirección
        // Retornar una promesa rechazada silenciosa que se puede ignorar
        return Promise.reject(new ApiError(401, "Sesión expirada - redirigiendo", "auth_redirect")) as Promise<T>;
      }

      throw new ApiError(
        response.status,
        error.message || "Error en la petición",
        error.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Error de conexión con el servidor");
  }
}

// ============================================
// AUTENTICACIÓN
// ============================================

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return fetchApi<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async getProfile(): Promise<ApiResponse<User>> {
    return fetchApi<ApiResponse<User>>("/api/auth/profile", {
      method: "GET",
    });
  },

  async logout(): Promise<void> {
    try {
      await fetchApi("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }
  },

  async refresh(): Promise<AuthResponse> {
    return fetchApi<AuthResponse>("/api/auth/refresh", {
      method: "POST",
    });
  },
};

// ============================================
// USUARIOS
// ============================================

export const usersApi = {
  async getAll(params?: {
    limit?: number;
    offset?: number;
    role?: string;
  }): Promise<ApiResponse<User[]>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());
    if (params?.role) searchParams.set("role", params.role);

    const query = searchParams.toString();
    return fetchApi<ApiResponse<User[]>>(
      `/api/users${query ? `?${query}` : ""}`
    );
  },

  async getById(userId: string): Promise<ApiResponse<User>> {
    return fetchApi<ApiResponse<User>>(`/api/users/${userId}`);
  },

  async create(userData: {
    email: string;
    password: string;
    role: string;
    full_name?: string;
    branch_id?: string;
  }): Promise<ApiResponse<User>> {
    return fetchApi<ApiResponse<User>>("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async update(
    userId: string,
    userData: {
      email?: string;
      role?: string;
      full_name?: string;
      branch_id?: string;
      active?: boolean;
    }
  ): Promise<ApiResponse<User>> {
    return fetchApi<ApiResponse<User>>(`/api/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  async delete(userId: string): Promise<ApiResponse> {
    return fetchApi<ApiResponse>(`/api/users/${userId}`, {
      method: "DELETE",
    });
  },
};

// ============================================
// SUCURSALES
// ============================================

export const branchesApi = {
  async getAll(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Branch[]>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return fetchApi<ApiResponse<Branch[]>>(
      `/api/branches${query ? `?${query}` : ""}`
    );
  },

  async getById(branchId: string): Promise<ApiResponse<Branch>> {
    return fetchApi<ApiResponse<Branch>>(`/api/branches/${branchId}`);
  },

  async create(branchData: {
    name: string;
    address: string;
    phone: string;
    city?: string;
    state?: string;
    manager_id?: string;
  }): Promise<ApiResponse<Branch>> {
    return fetchApi<ApiResponse<Branch>>("/api/branches", {
      method: "POST",
      body: JSON.stringify(branchData),
    });
  },

  async update(
    branchId: string,
    branchData: {
      name?: string;
      address?: string;
      phone?: string;
      city?: string;
      state?: string;
      manager_id?: string;
      active?: boolean;
    }
  ): Promise<ApiResponse<Branch>> {
    return fetchApi<ApiResponse<Branch>>(`/api/branches/${branchId}`, {
      method: "PUT",
      body: JSON.stringify(branchData),
    });
  },

  async delete(branchId: string): Promise<ApiResponse> {
    return fetchApi<ApiResponse>(`/api/branches/${branchId}`, {
      method: "DELETE",
    });
  },
};

// ============================================
// CONVERSACIONES
// ============================================

export const conversationsApi = {
  async getAll(params?: {
    platform?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Conversation[]>> {
    const searchParams = new URLSearchParams();
    if (params?.platform) searchParams.set("platform", params.platform);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return fetchApi<ApiResponse<Conversation[]>>(
      `/api/conversations${query ? `?${query}` : ""}`
    );
  },

  async getByPlatformAndContact(
    platform: string,
    contactId: string
  ): Promise<ApiResponse<{ conversation: Conversation; messages: Message[] }>> {
    return fetchApi<ApiResponse<{ conversation: Conversation; messages: Message[] }>>(
      `/api/conversations/${platform}/${contactId}`
    );
  },

  async getStats(): Promise<ApiResponse<ConversationStats>> {
    return fetchApi<ApiResponse<ConversationStats>>("/api/conversations/stats");
  },
};

// ============================================
// MENSAJES
// ============================================

export const messagesApi = {
  async getAll(params?: {
    platform?: string;
    contact_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Message[]>> {
    const searchParams = new URLSearchParams();
    if (params?.platform) searchParams.set("platform", params.platform);
    if (params?.contact_id) searchParams.set("contact_id", params.contact_id);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return fetchApi<ApiResponse<Message[]>>(
      `/api/messages/all${query ? `?${query}` : ""}`
    );
  },

  async send(data: SendMessageRequest): Promise<ApiResponse> {
    return fetchApi<ApiResponse>("/api/messages/send", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async markRead(data: MarkReadRequest): Promise<ApiResponse> {
    return fetchApi<ApiResponse>("/api/messages/mark-read", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getStats(): Promise<ApiResponse<MessageStats>> {
    return fetchApi<ApiResponse<MessageStats>>("/api/messages/stats");
  },
};

// ============================================
// CONTACTOS
// ============================================

export const contactsApi = {
  async getAll(params?: {
    platform?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Contact[]>> {
    const searchParams = new URLSearchParams();
    if (params?.platform) searchParams.set("platform", params.platform);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return fetchApi<ApiResponse<Contact[]>>(
      `/api/contacts${query ? `?${query}` : ""}`
    );
  },

  async getById(id: string): Promise<ApiResponse<Contact>> {
    return fetchApi<ApiResponse<Contact>>(`/api/contacts/${id}`);
  },

  async getByPlatform(platform: string): Promise<ApiResponse<Contact[]>> {
    return fetchApi<ApiResponse<Contact[]>>(`/api/contacts/platform/${platform}`);
  },

  async getStats(): Promise<ApiResponse<ContactStats>> {
    return fetchApi<ApiResponse<ContactStats>>("/api/contacts/stats");
  },
};

// ============================================
// ÓRDENES
// ============================================

export const ordersApi = {
  async getAll(params?: {
    status?: string;
    branch_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Order[]>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.branch_id) searchParams.set("branch_id", params.branch_id);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return fetchApi<ApiResponse<Order[]>>(
      `/api/orders${query ? `?${query}` : ""}`
    );
  },

  async getById(orderId: string): Promise<ApiResponse<Order>> {
    return fetchApi<ApiResponse<Order>>(`/api/orders/${orderId}`);
  },

  async create(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return fetchApi<ApiResponse<Order>>("/api/orders/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getByBranch(
    branchId: string,
    params?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<Order[]>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return fetchApi<ApiResponse<Order[]>>(
      `/api/orders/branch/${branchId}${query ? `?${query}` : ""}`
    );
  },

  async updateStatus(
    orderId: string,
    data: UpdateOrderStatusRequest
  ): Promise<ApiResponse<Order>> {
    return fetchApi<ApiResponse<Order>>(`/api/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async assignToBranch(
    orderId: string,
    data: AssignOrderToBranchRequest
  ): Promise<ApiResponse<Order>> {
    return fetchApi<ApiResponse<Order>>(`/api/orders/${orderId}/assign-branch`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async finalize(orderId: string): Promise<ApiResponse<Order>> {
    return fetchApi<ApiResponse<Order>>(`/api/orders/${orderId}/finalize`, {
      method: "POST",
    });
  },
};

// ============================================
// LOGÍSTICA
// ============================================

export const logisticsApi = {
  async getDashboard(): Promise<ApiResponse<LogisticsDashboard>> {
    return fetchApi<ApiResponse<LogisticsDashboard>>("/api/logistics/dashboard");
  },

  async getPendingOrders(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Order[]>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return fetchApi<ApiResponse<Order[]>>(
      `/api/logistics/orders/pending${query ? `?${query}` : ""}`
    );
  },

  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    return fetchApi<ApiResponse<Order>>(`/api/logistics/orders/${orderId}`);
  },

  async sendOrderToIpos(orderId: string): Promise<ApiResponse> {
    return fetchApi<ApiResponse>(
      `/api/logistics/orders/${orderId}/send-to-ipos`,
      {
        method: "POST",
      }
    );
  },

  async getStores(): Promise<ApiResponse<Branch[]>> {
    return fetchApi<ApiResponse<Branch[]>>("/api/logistics/stores");
  },

  async updateOrderPayment(
    orderId: string,
    data: {
      payment_status: string;
      payment_method: string;
      logistics_confirmed?: boolean;
    }
  ): Promise<ApiResponse<Order>> {
    return fetchApi<ApiResponse<Order>>(`/api/logistics/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// ESTADÍSTICAS
// ============================================

export const statsApi = {
  async getGlobal(): Promise<ApiResponse<GlobalStats>> {
    return fetchApi<ApiResponse<GlobalStats>>("/api/stats");
  },

  async getAdminDashboard(): Promise<ApiResponse<AdminDashboard>> {
    return fetchApi<ApiResponse<AdminDashboard>>("/api/dashboard/admin");
  },

  async getLogisticsDashboard(): Promise<ApiResponse<LogisticsDashboard>> {
    return fetchApi<ApiResponse<LogisticsDashboard>>("/api/dashboard/logistics");
  },

  async getEmployeeDashboard(branchId: string): Promise<ApiResponse<EmployeeDashboard>> {
    return fetchApi<ApiResponse<EmployeeDashboard>>(
      `/api/dashboard/employee?branch_id=${branchId}`
    );
  },
};

// ============================================
// IA
// ============================================

export const aiApi = {
  async getConfig(platform: string): Promise<ApiResponse<AIConfig>> {
    return fetchApi<ApiResponse<AIConfig>>(`/api/ai/config/${platform}`);
  },

  async updateConfig(
    platform: string,
    config: Partial<AIConfig>
  ): Promise<ApiResponse<AIConfig>> {
    return fetchApi<ApiResponse<AIConfig>>(`/api/ai/config/${platform}`, {
      method: "PUT",
      body: JSON.stringify(config),
    });
  },

  async toggleConversationMode(
    platform: string,
    contactId: string,
    mode: "ia" | "manual"
  ): Promise<ApiResponse> {
    return fetchApi<ApiResponse>(
      `/api/ai/conversation/${platform}/${contactId}/toggle`,
      {
        method: "PUT",
        body: JSON.stringify({ mode }),
      }
    );
  },

  async getConversationStatus(
    platform: string,
    contactId: string
  ): Promise<ApiResponse<{ ai_enabled: boolean; mode: string }>> {
    return fetchApi<ApiResponse<{ ai_enabled: boolean; mode: string }>>(
      `/api/ai/conversation/${platform}/${contactId}/status`
    );
  },

  // Nuevo endpoint según especificaciones del backend
  async setAIControl(
    platform: string,
    contactId: string,
    aiEnabled: boolean
  ): Promise<ApiResponse<{ ai_enabled: boolean; platform: string; contact_id: string }>> {
    return fetchApi<ApiResponse<{ ai_enabled: boolean; platform: string; contact_id: string }>>(
      "/api/conversations/ai-control",
      {
        method: "POST",
        body: JSON.stringify({
          platform,
          contactId,
          ai_enabled: aiEnabled,
        }),
      }
    );
  },

  // Nuevo endpoint para consultar estado de IA
  async getAIStatus(
    platform: string,
    contactId: string
  ): Promise<ApiResponse<{ ai_enabled: boolean; platform: string; contact_id: string }>> {
    return fetchApi<ApiResponse<{ ai_enabled: boolean; platform: string; contact_id: string }>>(
      `/api/conversations/ai-status?platform=${platform}&contactId=${contactId}`
    );
  },

  async getLogs(
    platform: string,
    params?: { limit?: number; offset?: number }
  ): Promise<ApiResponse<AILog[]>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return fetchApi<ApiResponse<AILog[]>>(
      `/api/ai/logs/${platform}${query ? `?${query}` : ""}`
    );
  },
};

// ============================================
// iPOS
// ============================================

export const iposApi = {
  async getLocations(): Promise<ApiResponse<Branch[]>> {
    const response = await fetchApi<{ success: boolean; data: Record<string, unknown>[] }>("/api/ipos/locations");

    // Transformar los datos del formato iPOS al formato Branch esperado
    if (response.success && response.data) {
      const transformedData: Branch[] = response.data.map((location: Record<string, unknown>) => ({
        id: String(location.ID || location.id || ""),
        name: String(location.Name || location.name || ""),
        address: String(location.Address || location.address || ""),
        phone: String(location.Phone || location.phone || ""),
        active: location.Status === "ACTIVE" || location.status === "active",
        city: String(location.City || location.city || ""),
        state: String(location.State || location.state || ""),
        manager_id: location.ManagerID || location.manager_id ? String(location.ManagerID || location.manager_id) : undefined,
        created_at: String(location.created_at || location.CreatedAt || new Date().toISOString()),
        updated_at: String(location.updated_at || location.UpdatedAt || new Date().toISOString()),
      }));

      return {
        success: true,
        data: transformedData,
      };
    }

    return { success: response.success, data: response.data as unknown as Branch[] };
  },

  async getLocationById(locationId: string): Promise<ApiResponse<Branch>> {
    const response = await fetchApi<{ success: boolean; data: Record<string, unknown> }>(`/api/ipos/locations/${locationId}`);

    // Transformar los datos del formato iPOS al formato Branch esperado
    if (response.success && response.data) {
      const location = response.data;
      const transformedData: Branch = {
        id: String(location.ID || location.id || ""),
        name: String(location.Name || location.name || ""),
        address: String(location.Address || location.address || ""),
        phone: String(location.Phone || location.phone || ""),
        active: location.Status === "ACTIVE" || location.status === "active",
        city: String(location.City || location.city || ""),
        state: String(location.State || location.state || ""),
        manager_id: location.ManagerID || location.manager_id ? String(location.ManagerID || location.manager_id) : undefined,
        created_at: String(location.created_at || location.CreatedAt || new Date().toISOString()),
        updated_at: String(location.updated_at || location.UpdatedAt || new Date().toISOString()),
      };

      return {
        success: true,
        data: transformedData,
      };
    }

    return { success: response.success, data: response.data as unknown as Branch };
  },
};

// ============================================
// NOTIFICACIONES (Mock temporal)
// ============================================

export const notificationsApi = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAll(_params?: {
    read?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Notification[]>> {
    // TODO: Implementar cuando el endpoint esté disponible
    return Promise.resolve({
      success: true,
      data: [],
    });
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async markAsRead(_notificationId: string): Promise<ApiResponse> {
    // TODO: Implementar cuando el endpoint esté disponible
    return Promise.resolve({ success: true });
  },
};

// ============================================
// EXPORT DEFAULT
// ============================================

const apiClient = {
  auth: authApi,
  users: usersApi,
  branches: branchesApi,
  conversations: conversationsApi,
  messages: messagesApi,
  contacts: contactsApi,
  orders: ordersApi,
  logistics: logisticsApi,
  stats: statsApi,
  ai: aiApi,
  ipos: iposApi,
  notifications: notificationsApi,
};

export default apiClient;
