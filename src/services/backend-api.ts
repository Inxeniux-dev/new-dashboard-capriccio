// Backend API Service
// Servicio para comunicarse con el backend de Capriccio

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-meta-service.vercel.app';
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export interface MessageResponse {
  id: number;
  conversation_id: string;
  platform: string;
  contact_id: string;
  message_type: string;
  content: string;
  is_from_contact: boolean;
  is_read: boolean;
  sent_by_user: string | null;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
  ai_enabled: boolean;
  ai_response_generated: boolean;
}

interface ConversationResponse {
  id: string;
  contact_id: string;
  platform: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_active: boolean;
  conversation_status: string;
  ai_enabled: boolean;
  created_at: string;
  contact: {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    profile_picture: string | null;
    platform: string;
  };
}

// Obtener mensajes de una conversación con paginación invertida
export async function getMessages(phoneNumber: string, limit = 20, offset = 0): Promise<{
  success: boolean;
  data?: MessageResponse[];
  ai_enabled?: boolean;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
    returned: number;
  };
  error?: string;
}> {
  try {
    // Limpiar el número de teléfono - quitar el + si existe
    const contactId = phoneNumber.replace(/^\+/, '');

    // Usar el nuevo endpoint con paginación invertida
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/conversations/whatsapp/${contactId}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // El nuevo endpoint retorna los mensajes directamente en data
    return {
      success: true,
      data: result.data || [],
      ai_enabled: result.ai_enabled,
      pagination: result.pagination
    };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Obtener todas las conversaciones
export async function getConversations(platform = 'whatsapp'): Promise<{
  success: boolean;
  data?: ConversationResponse[];
  error?: string;
}> {
  try {
    const params = new URLSearchParams({
      platform: platform
    });

    const response = await fetch(`${API_BASE_URL}/api/conversations?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Enviar mensaje
export async function sendMessage(phoneNumber: string, message: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Limpiar el número - quitar el + si existe
    const contactId = phoneNumber.replace(/^\+/, '');

    const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        contact_id: contactId,
        message: message,
        platform: 'whatsapp'
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Obtener información de una conversación específica
export async function getConversationInfo(phoneNumber: string): Promise<{
  success: boolean;
  data?: ConversationResponse;
  error?: string;
}> {
  try {
    // Primero obtenemos todas las conversaciones y filtramos
    const conversationsResponse = await getConversations('whatsapp');

    if (!conversationsResponse.success || !conversationsResponse.data) {
      throw new Error('Failed to fetch conversations');
    }

    // Limpiar número para comparación
    const cleanPhone = phoneNumber.replace(/^\+/, '');

    // Buscar la conversación que coincida con el número
    const conversation = conversationsResponse.data.find(
      conv => conv.contact_id === cleanPhone || conv.contact_phone === cleanPhone
    );

    if (!conversation) {
      return {
        success: false,
        error: 'Conversation not found'
      };
    }

    return {
      success: true,
      data: conversation
    };
  } catch (error) {
    console.error('Error getting conversation info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}