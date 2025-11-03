import { useEffect, useState, useCallback } from 'react';
import { supabase, type Message, type ConversationState, type Notification } from '@/utils/supabase-client';
import { toast } from 'sonner';

interface UseRealtimeConversationReturn {
  messages: Message[];
  conversationState: ConversationState | null;
  notifications: Notification[];
  isTyping: boolean;
  lastUpdate: Date | null;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useRealtimeConversation(
  conversationId: string | null,
  userPhone: string | null
): UseRealtimeConversationReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isTyping] = useState(false); // Will be used for typing indicators
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId || !userPhone) {
      setIsLoading(false);
      return;
    }

    // Cargar datos iniciales
    fetchInitialData();

    // Canal único para todas las suscripciones de esta conversación
    const channel = supabase
      .channel(`conversation-room-${conversationId}`)
      // 1. SUSCRIPCIÓN A MENSAJES - INSERT
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('📨 Nuevo mensaje recibido:', payload.new);
          handleNewMessage(payload.new as Message);
        }
      )
      // 2. SUSCRIPCIÓN A MENSAJES - UPDATE
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('✏️ Mensaje actualizado:', payload.new);
          setMessages(prev =>
            prev.map(msg =>
              msg.id === (payload.new as Message).id ? (payload.new as Message) : msg
            )
          );
        }
      )
      // 3. SUSCRIPCIÓN A ESTADOS DE CONVERSACIÓN
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'conversation_states',
          filter: `user_identifier=eq.${userPhone}`
        },
        (payload) => {
          console.log('🔄 Estado de conversación cambió:', payload);
          const newState = payload.new || payload.old;
          if (newState) {
            handleStateChange(newState as ConversationState);
          }
        }
      )
      // 4. SUSCRIPCIÓN A NOTIFICACIONES - INSERT
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_phone=eq.${userPhone}`
        },
        (payload) => {
          console.log('🔔 Nueva notificación:', payload.new);
          handleNewNotification(payload.new as Notification);
        }
      )
      // 5. SUSCRIPCIÓN A NOTIFICACIONES - UPDATE
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_phone=eq.${userPhone}`
        },
        (payload) => {
          console.log('🔔 Notificación actualizada:', payload.new);
          setNotifications(prev =>
            prev.map(notif =>
              notif.id === (payload.new as Notification).id
                ? (payload.new as Notification)
                : notif
            )
          );
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, userPhone]);

  // Cargar datos iniciales
  async function fetchInitialData() {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar mensajes
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      if (messagesData) setMessages(messagesData);

      // Cargar estado de conversación
      const { data: stateData, error: stateError } = await supabase
        .from('conversation_states')
        .select('*')
        .eq('user_identifier', userPhone)
        .eq('platform', 'whatsapp')
        .single();

      if (stateError && stateError.code !== 'PGRST116') {
        console.error('Error loading conversation state:', stateError);
      }
      if (stateData) setConversationState(stateData);

      // Cargar notificaciones no leídas
      const { data: notifsData, error: notifsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_phone', userPhone)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (notifsError) throw notifsError;
      if (notifsData) setNotifications(notifsData);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos de la conversación');
    } finally {
      setIsLoading(false);
    }
  }

  // Manejar nuevo mensaje
  const handleNewMessage = useCallback((newMessage: Message) => {
    setMessages(prev => [...prev, newMessage]);
    setLastUpdate(new Date());

    // Reproducir sonido si el mensaje es entrante
    if (newMessage.direction === 'incoming') {
      playNotificationSound();
    }

    // Auto-scroll al último mensaje
    setTimeout(() => {
      const element = document.getElementById('messages-end');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Manejar cambio de estado
  const handleStateChange = useCallback((newState: ConversationState) => {
    const oldStatus = conversationState?.current_status;
    setConversationState(newState);

    // Mostrar notificación toast según el cambio de estado
    if (newState?.current_status !== oldStatus && oldStatus) {
      showStateChangeNotification(oldStatus, newState?.current_status);
    }
  }, [conversationState]);

  // Manejar nueva notificación
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);

    // Mostrar notificación del navegador si está permitido
    if (notification.priority === 'high') {
      showBrowserNotification(notification);
    }

    // Reproducir sonido para notificaciones importantes
    if (notification.type === 'agent_assigned' || notification.type === 'order_status') {
      playNotificationSound();
    }
  }, []);

  // Funciones auxiliares
  function playNotificationSound() {
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(e => console.log('No se pudo reproducir sonido:', e));
  }

  function showBrowserNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Capriccio - ' + notification.title, {
        body: notification.message,
        icon: '/logo.png',
        tag: notification.id
      });
    }
  }

  function showStateChangeNotification(oldStatus: string, newStatus: string) {
    const statusMessages: Record<string, string> = {
      'menu_principal': '📋 Volvió al menú principal',
      'generar_orden_ia': '🤖 Iniciando generación de orden con IA',
      'asesor_humano': '👤 Cambiado a modo asesor humano',
      'confirmando_direccion': '📍 Confirmando dirección de entrega',
      'orden_completada': '✅ Orden completada',
      'esperando_pago': '💳 Esperando confirmación de pago',
      'informacion_general': 'ℹ️ Consulta general'
    };

    const message = statusMessages[newStatus] || `Estado cambió a: ${newStatus}`;
    console.log(`🔄 ${message}`);

    // Mostrar toast con el cambio de estado
    toast.info(message);
  }

  // Marcar notificación como leída
  async function markNotificationAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }

  return {
    messages,
    conversationState,
    notifications,
    isTyping,
    lastUpdate,
    markNotificationAsRead,
    isLoading,
    error
  };
}