import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found in environment variables');
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    persistSession: true,
    storageKey: 'capriccio-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
});

// Tipos para las tablas de Supabase
export interface Message {
  id: string;
  conversation_id: string;
  sender_phone: string;
  receiver_phone: string;
  message_content: string;
  message_type: 'text' | 'image' | 'audio' | 'document';
  direction: 'incoming' | 'outgoing';
  platform: 'whatsapp' | 'instagram' | 'messenger';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: {
    is_ai_response?: boolean;
    order_id?: string;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at?: string;
}

export interface ConversationState {
  id: string;
  user_identifier: string;
  platform: 'whatsapp' | 'instagram' | 'messenger';
  current_status:
    | 'menu_principal'
    | 'generar_orden_ia'
    | 'asesor_humano'
    | 'confirmando_direccion'
    | 'esperando_pago'
    | 'orden_completada'
    | 'informacion_general';
  status_data?: Record<string, unknown>;
  last_interaction: string;
  created_at: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  type:
    | 'agent_assigned'
    | 'new_conversation'
    | 'human_assistance_required'
    | 'order_status'
    | 'system';
  title: string;
  message: string;
  recipient_phone?: string;
  recipient_role?: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  read_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}