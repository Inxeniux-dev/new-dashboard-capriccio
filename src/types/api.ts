// ============================================
// TIPOS BASE
// ============================================

export type Platform = "whatsapp" | "messenger" | "instagram" | "facebook";
export type MessageDirection = "incoming" | "outgoing";
export type MessageType = "text" | "image" | "audio" | "video" | "document" | "sticker" | "location" | "template" | "interactive";
export type MessageStatus = "sent" | "delivered" | "read" | "failed" | "pending";
export type UserRole = "admin" | "logistics" | "logistica" | "empleado" | "employee" | "manager";
export type OrderStatus = "pending" | "pending_logistics" | "in_progress" | "completed" | "cancelled" | "assigned" | "unassigned" | "confirmed" | "in_transit" | "delivered";

// ============================================
// RESPUESTAS API
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
  code?: string;
  timestamp?: string;
}

export interface PaginationResponse {
  limit: number;
  offset: number;
  total: number;
  has_more: boolean;
}

// ============================================
// USUARIOS Y AUTENTICACIÓN
// ============================================

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  branch_id?: string | null;
  permissions?: string[];
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    refresh_token: string;
    expires_at: string;
    user: User;
  };
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ============================================
// CONTACTOS
// ============================================

export interface Contact {
  id: number;
  contact_id: string;
  name: string;
  phone?: string;
  email?: string;
  platform: Platform;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactStats {
  total_contacts: number;
  by_platform: {
    whatsapp: number;
    messenger: number;
    instagram: number;
    facebook: number;
  };
  new_today: number;
  active_conversations: number;
}

// ============================================
// CONVERSACIONES
// ============================================

export interface Conversation {
  id: string;
  contact_id: string;
  platform: Platform;
  contact_name: string;
  contact_phone?: string;
  contact_email?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_active?: boolean;
  conversation_status?: "active" | "archived" | "pending";
  assigned_to?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
  contact?: Contact;
  ai_enabled?: boolean;
}

export interface ConversationStats {
  total_conversations: number;
  active_conversations: number;
  unread_count: number;
  by_platform: {
    whatsapp: number;
    messenger: number;
    instagram: number;
    facebook: number;
  };
}

// ============================================
// MENSAJES
// ============================================

export interface Message {
  id: number;
  message_id: string;
  conversation_id?: string;
  contact_id?: string;
  platform: Platform;
  from_number: string;
  to_number: string;
  direction: MessageDirection;
  message_content: string;
  message_type: MessageType;
  timestamp: string;
  created_at: string;
  read: boolean;
  is_read?: boolean;
  status: MessageStatus;
  metadata?: Record<string, unknown>;
  ai_enabled?: boolean;
  ai_response_generated?: boolean;
  sender_type?: "client" | "ai" | "agent";
  // Campos clave del backend para identificar participantes
  is_from_contact?: boolean;  // true = mensaje del cliente, false = del sistema
  sent_by_user?: string | null;  // "Asistente IA" si es del sistema, null si es del cliente
}

export interface SendMessageRequest {
  platform: Platform;
  to: string;
  message: string;
  type?: MessageType;
  reply_to?: string;
}

export interface MarkReadRequest {
  platform: Platform;
  contactId: string;
  action?: "mark_read" | "archive";
  messageIds?: string[];
}

export interface MessageStats {
  total_messages: number;
  sent_today: number;
  received_today: number;
  pending: number;
  failed: number;
  by_platform: {
    whatsapp: number;
    messenger: number;
    instagram: number;
    facebook: number;
  };
}

// ============================================
// ÓRDENES
// ============================================

export interface Order {
  id: string | number;
  order_number?: string;
  message_id?: string;
  customer_name?: string;
  customer_phone: string;
  customer_email?: string;
  items?: OrderItem[];
  order_items?: Record<string, unknown>[];
  products?: Record<string, unknown>[];
  total_amount: number;
  status: OrderStatus;
  branch_id?: string;
  store_id?: string | null;
  branch_name?: string;
  delivery_date?: string;
  delivery_address?: string;
  created_date?: string;
  confirmed_date?: string;
  completed_date?: string;
  platform: Platform;
  conversation_id?: string;
  notes?: string;
  logistics_notes?: string | null;
  payment_status?: string;
  payment_method?: string | null;
  logistics_confirmed?: boolean;
  ipos_order_id?: string | null;
  ipos_status?: string | null;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
}

export interface CreateOrderRequest {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items: Omit<OrderItem, "id" | "subtotal">[];
  platform: Platform;
  conversation_id?: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

export interface AssignOrderToBranchRequest {
  branch_id: string;
  delivery_date: string;
  notes?: string;
}

// ============================================
// SUCURSALES/TIENDAS
// ============================================

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  city?: string;
  state?: string;
  manager_id?: string;
  manager_name?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BranchStats {
  id: string;
  name: string;
  pending_orders: number;
  completed_today: number;
  total_orders: number;
  active_employees: number;
}

// ============================================
// LOGÍSTICA
// ============================================

export interface LogisticsDashboard {
  pending_assignments: number;
  today_deliveries: number;
  unassigned_orders: Order[];
  orders_by_branch: {
    branch_id: string;
    branch_name: string;
    pending: number;
    in_progress: number;
    completed: number;
  }[];
  recent_conversations: Conversation[];
}

// ============================================
// DASHBOARDS
// ============================================

export interface AdminDashboard {
  total_orders: number;
  pending_orders: number;
  total_users: number;
  active_conversations: number;
  orders_by_branch: BranchStats[];
  revenue_stats: {
    today: number;
    week: number;
    month: number;
  };
  recent_activity: Activity[];
}

export interface EmployeeDashboard {
  my_pending_orders: number;
  today_orders: number;
  completed_today: number;
  branch_stats: {
    total_orders: number;
    completion_rate: number;
  };
  my_orders: Order[];
}

export interface Activity {
  id: string;
  type: "order_created" | "order_completed" | "user_created" | "message_received";
  description: string;
  timestamp: string;
  user?: string;
}

// ============================================
// ESTADÍSTICAS GLOBALES
// ============================================

export interface GlobalStats {
  orders: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  conversations: ConversationStats;
  messages: MessageStats;
  contacts: ContactStats;
  revenue: {
    today: number;
    week: number;
    month: number;
    year: number;
  };
}

// ============================================
// CONFIGURACIÓN IA
// ============================================

export interface AIConfig {
  id: string;
  platform: Platform;
  ai_enabled: boolean;
  auto_response_enabled: boolean;
  response_delay_seconds: number;
  max_tokens: number;
  temperature: number;
  system_prompt: string;
  fallback_message: string;
  created_at: string;
  updated_at: string;
}

export interface AILog {
  id: string;
  platform: Platform;
  input_text: string;
  generated_response: string;
  response_time_ms: number;
  tokens_used: number;
  confidence_score: number;
  success: boolean;
  created_at: string;
}

// ============================================
// NOTIFICACIONES
// ============================================

export interface Notification {
  id: string;
  user_id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
}
