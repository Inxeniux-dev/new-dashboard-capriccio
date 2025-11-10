import { useEffect, useState, useCallback } from 'react';
import { supabase, type Message, type ConversationState, type Notification } from '@/utils/supabase-client';
import { toast } from 'sonner';
import { getMessages, getConversationInfo } from '@/services/backend-api';
import type { MessageResponse } from '@/services/backend-api';

interface UseRealtimeConversationReturn {
  messages: Message[];
  conversationState: ConversationState | null;
  notifications: Notification[];
  isTyping: boolean;
  lastUpdate: Date | null;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  hasMoreMessages: boolean;
  loadingMore: boolean;
  loadMoreMessages: () => Promise<void>;
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
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);

  useEffect(() => {
    if (!conversationId || !userPhone) {
      setIsLoading(false);
      return;
    }

    // Cargar datos iniciales
    fetchInitialData();

    // Asegurar formato correcto del teléfono para las suscripciones
    const cleanPhone = userPhone?.startsWith('+') ? userPhone : `+${userPhone}`;

    // Canal único para todas las suscripciones de esta conversación
    const channel = supabase
      .channel(`conversation-room-${cleanPhone}`)
      // 1. SUSCRIPCIÓN A MENSAJES - INSERT (usando campos correctos)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const msg = payload.new as Record<string, unknown>;
          // Solo procesar si el mensaje involucra a este usuario y es de WhatsApp
          if (msg && msg.platform === 'whatsapp' &&
              (msg.from_number === cleanPhone || msg.to_number === cleanPhone)) {
            console.log('📨 Nuevo mensaje recibido:', msg);

            // Mapear al formato esperado
            const mappedMessage: Message = {
              id: String(msg.id),
              conversation_id: String(msg.conversation_id || conversationId || ''),
              sender_phone: String(msg.from_number || ''),
              receiver_phone: String(msg.to_number || ''),
              message_content: String(msg.message_content || ''),
              direction: (msg.direction as 'incoming' | 'outgoing') || 'incoming',
              message_type: (msg.message_type as 'text' | 'image' | 'audio' | 'document') || 'text',
              status: (msg.status as 'pending' | 'sent' | 'delivered' | 'read' | 'failed') || 'delivered',
              platform: 'whatsapp',
              metadata: {
                ...(typeof msg.metadata === 'object' && msg.metadata !== null ? msg.metadata as Record<string, unknown> : {}),
                is_ai_response: Boolean(msg.ai_response_generated || msg.response_mode === 'ia')
              },
              created_at: String(msg.timestamp || msg.created_at || new Date().toISOString())
            };

            handleNewMessage(mappedMessage);
          }
        }
      )
      // 2. SUSCRIPCIÓN A MENSAJES - UPDATE
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const msg = payload.new as Record<string, unknown>;
          // Solo procesar si el mensaje involucra a este usuario y es de WhatsApp
          if (msg && msg.platform === 'whatsapp' &&
              (msg.from_number === cleanPhone || msg.to_number === cleanPhone)) {
            console.log('✏️ Mensaje actualizado:', msg);

            // Mapear al formato esperado
            const mappedMessage: Message = {
              id: String(msg.id),
              conversation_id: String(msg.conversation_id || conversationId || ''),
              sender_phone: String(msg.from_number || ''),
              receiver_phone: String(msg.to_number || ''),
              message_content: String(msg.message_content || ''),
              direction: (msg.direction as 'incoming' | 'outgoing') || 'incoming',
              message_type: (msg.message_type as 'text' | 'image' | 'audio' | 'document') || 'text',
              status: (msg.status as 'pending' | 'sent' | 'delivered' | 'read' | 'failed') || 'delivered',
              platform: 'whatsapp',
              metadata: {
                ...(typeof msg.metadata === 'object' && msg.metadata !== null ? msg.metadata as Record<string, unknown> : {}),
                is_ai_response: Boolean(msg.ai_response_generated || msg.response_mode === 'ia')
              },
              created_at: String(msg.timestamp || msg.created_at || new Date().toISOString())
            };

            setMessages(prev => {
              // Actualizar el mensaje y mantener el orden cronológico
              const updated = prev.map(m =>
                m.id === mappedMessage.id ? mappedMessage : m
              );

              // Re-ordenar por timestamp
              return updated.sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return dateA - dateB;
              });
            });
          }
        }
      )
      // 3. SUSCRIPCIÓN A ESTADOS DE CONVERSACIÓN
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'conversation_states',
          filter: `user_identifier=eq.${cleanPhone}`
        },
        (payload) => {
          console.log('🔄 Estado de conversación cambió:', payload);
          const newState = payload.new || payload.old;
          if (newState) {
            handleStateChange(newState as ConversationState);
          }
        }
      )
      // 4. SUSCRIPCIÓN A NOTIFICACIONES - INSERT (sin filtro, filtraremos en memoria)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          if (payload?.new) {
            const notif = payload.new as Record<string, unknown>;
            // Filtrar en memoria para evitar errores de columnas
            if (notif.recipient_phone === userPhone ||
                notif.phone === userPhone ||
                notif.user_phone === userPhone ||
                notif.user_identifier === userPhone ||
                !notif.recipient_phone) {
              console.log('🔔 Nueva notificación:', notif);
              // Mapear a tipo Notification
              const mappedNotif: Notification = {
                id: String(notif.id || ''),
                type: (notif.type as Notification['type']) || 'system',
                title: String(notif.title || ''),
                message: String(notif.message || ''),
                recipient_phone: notif.recipient_phone as string | undefined,
                recipient_role: notif.recipient_role as string | undefined,
                priority: (notif.priority as 'low' | 'medium' | 'high') || 'medium',
                is_read: Boolean(notif.is_read),
                read_at: notif.read_at as string | undefined,
                metadata: (typeof notif.metadata === 'object' && notif.metadata !== null ? notif.metadata as Record<string, unknown> : undefined),
                created_at: String(notif.created_at || new Date().toISOString())
              };
              handleNewNotification(mappedNotif);
            }
          }
        }
      )
      // 5. SUSCRIPCIÓN A NOTIFICACIONES - UPDATE (sin filtro, filtraremos en memoria)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          if (payload?.new) {
            const notif = payload.new as Record<string, unknown>;
            // Filtrar en memoria
            if (notif.recipient_phone === userPhone ||
                notif.phone === userPhone ||
                notif.user_phone === userPhone ||
                notif.user_identifier === userPhone ||
                !notif.recipient_phone) {
              console.log('🔔 Notificación actualizada:', notif);
              // Mapear a tipo Notification
              const mappedNotif: Notification = {
                id: String(notif.id || ''),
                type: (notif.type as Notification['type']) || 'system',
                title: String(notif.title || ''),
                message: String(notif.message || ''),
                recipient_phone: notif.recipient_phone as string | undefined,
                recipient_role: notif.recipient_role as string | undefined,
                priority: (notif.priority as 'low' | 'medium' | 'high') || 'medium',
                is_read: Boolean(notif.is_read),
                read_at: notif.read_at as string | undefined,
                metadata: (typeof notif.metadata === 'object' && notif.metadata !== null ? notif.metadata as Record<string, unknown> : undefined),
                created_at: String(notif.created_at || new Date().toISOString())
              };
              setNotifications(prev =>
                prev.map(n =>
                  n.id === mappedNotif.id ? mappedNotif : n
                )
              );
            }
          }
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
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Asegurar que el número tenga el formato correcto
      const cleanPhone = userPhone?.startsWith('+') ? userPhone : `+${userPhone}`;

      // Cargar mensajes y conversación usando el backend API
      try {
        console.log('🔍 Obteniendo conversación desde el backend para:', cleanPhone);

        // Obtener información de la conversación
        const conversationInfo = await getConversationInfo(cleanPhone);
        console.log('📊 Info de conversación:', conversationInfo);

        // Si tenemos información de la conversación, cargar los mensajes
        if (conversationInfo.success && conversationInfo.data) {
          const conversation = conversationInfo.data;

          // Actualizar el estado de la conversación
          setConversationState({
            id: conversation.id || 0,
            platform: conversation.platform,
            user_identifier: '+' + conversation.contact_id, // Agregar + al número
            current_status: conversation.conversation_status || 'menu_principal',
            previous_status: '',
            status_data: {},
            last_interaction: conversation.last_message_time,
            created_at: conversation.created_at,
            updated_at: conversation.last_message_time
          } as ConversationState);
        }

        // Obtener los mensajes con paginación invertida (últimos 20)
        const messagesResponse = await getMessages(cleanPhone, 20, 0);
        console.log('📨 Respuesta de mensajes:', messagesResponse);

        if (messagesResponse.success && messagesResponse.data) {
          const backendMessages = messagesResponse.data;
          console.log(`📊 Mensajes encontrados: ${backendMessages.length}`);
          console.log('📄 Paginación:', messagesResponse.pagination);

          // Mapear los mensajes al formato esperado por el componente
          const mappedMessages: Message[] = backendMessages.map((msg: MessageResponse) => ({
            id: msg.id.toString(),
            conversation_id: msg.conversation_id,
            sender_phone: msg.is_from_contact ? ('+' + msg.contact_id) : 'system',
            receiver_phone: msg.is_from_contact ? 'system' : ('+' + msg.contact_id),
            message_content: msg.content,
            direction: (msg.is_from_contact ? 'incoming' : 'outgoing') as 'incoming' | 'outgoing',
            message_type: (msg.message_type || 'text') as 'text' | 'image' | 'audio' | 'document',
            status: (msg.is_read ? 'read' : 'delivered') as 'pending' | 'sent' | 'delivered' | 'read' | 'failed',
            platform: msg.platform as 'whatsapp' | 'instagram' | 'messenger',
            metadata: {
              ...(msg.metadata || {}),
              is_ai_response: msg.ai_response_generated
            },
            created_at: msg.created_at
          }));

          // Los mensajes ya vienen ordenados cronológicamente del backend
          console.log('✅ Mensajes procesados:', mappedMessages.length);

          // Actualizar estado con información de paginación
          if (messagesResponse.pagination) {
            setHasMoreMessages(messagesResponse.pagination.has_more);
            setTotalMessages(messagesResponse.pagination.total);
            setCurrentOffset(0);
          }

          setMessages(mappedMessages);
        } else {
          console.log('⚠️ No se encontraron mensajes para este usuario');
          setMessages([]);
          setHasMoreMessages(false);
        }
      } catch (err) {
        console.warn('Error al cargar mensajes:', err);
        setMessages([]);
        setHasMoreMessages(false);
      }

      // Cargar estado de conversación
      const { data: stateData, error: stateError } = await supabase
        .from('conversation_states')
        .select('*')
        .eq('user_identifier', cleanPhone)
        .eq('platform', 'whatsapp')
        .limit(1);

      if (stateError) {
        console.error('Error loading conversation state:', stateError);
      }

      if (stateData && stateData.length > 0) {
        setConversationState(stateData[0]);
      }

      // Las notificaciones usan user_id (UUID), no teléfono
      // Por ahora las notificaciones estarán deshabilitadas hasta que tengamos el user_id
      const notifsData: Notification[] = [];

      // TODO: Para habilitar notificaciones, necesitamos mapear userPhone -> user_id
      // Por ahora solo mostrar un mensaje informativo
      console.log('Notificaciones deshabilitadas: tabla usa user_id, no phone');

      // Inicializar vacío por ahora
      setNotifications(notifsData);
    } catch (err) {
      console.warn('Error parcial al cargar datos:', err);
      // No establecer error si al menos los mensajes se cargaron
      if (messages.length === 0) {
        setError('Error al cargar los datos de la conversación');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userPhone]);

  // Manejar nuevo mensaje
  const handleNewMessage = useCallback((newMessage: Message) => {
    setMessages(prev => {
      // Verificar si el mensaje ya existe
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) return prev;

      // Crear una copia del array con el nuevo mensaje
      const updatedMessages = [...prev, newMessage];

      // Ordenar por fecha de creación (más antiguo primero)
      return updatedMessages.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateA - dateB;
      });
    });

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

  // Cargar mensajes más antiguos con paginación invertida
  async function loadMoreMessages() {
    if (!hasMoreMessages || loadingMore || !userPhone) return;

    setLoadingMore(true);

    // Guardar posición del scroll ANTES de cargar más mensajes
    const scrollContainer = document.getElementById('messages-list');
    const oldScrollHeight = scrollContainer?.scrollHeight || 0;

    try {
      // Asegurar que el número tenga el formato correcto
      const cleanPhone = userPhone?.startsWith('+') ? userPhone : `+${userPhone}`;

      // Calcular el nuevo offset (incrementar en 20)
      const newOffset = currentOffset + 20;

      console.log(`📄 Cargando más mensajes: offset=${newOffset}, total=${totalMessages}`);

      // Cargar siguiente página de mensajes
      const messagesResponse = await getMessages(cleanPhone, 20, newOffset);

      if (messagesResponse.success && messagesResponse.data) {
        const backendMessages = messagesResponse.data;
        console.log(`📨 Mensajes antiguos obtenidos: ${backendMessages.length}`);

        // Mapear los mensajes al formato esperado
        const mappedMessages: Message[] = backendMessages.map((msg: MessageResponse) => ({
          id: msg.id.toString(),
          conversation_id: msg.conversation_id,
          sender_phone: msg.is_from_contact ? ('+' + msg.contact_id) : 'system',
          receiver_phone: msg.is_from_contact ? 'system' : ('+' + msg.contact_id),
          message_content: msg.content,
          direction: (msg.is_from_contact ? 'incoming' : 'outgoing') as 'incoming' | 'outgoing',
          message_type: (msg.message_type || 'text') as 'text' | 'image' | 'audio' | 'document',
          status: (msg.is_read ? 'read' : 'delivered') as 'pending' | 'sent' | 'delivered' | 'read' | 'failed',
          platform: msg.platform as 'whatsapp' | 'instagram' | 'messenger',
          metadata: {
            ...(msg.metadata || {}),
            is_ai_response: msg.ai_response_generated
          },
          created_at: msg.created_at
        }));

        if (mappedMessages.length > 0) {
          // IMPORTANTE: Agregar mensajes antiguos AL PRINCIPIO del array
          setMessages(prev => [...mappedMessages, ...prev]);

          // Actualizar offset y estado de paginación
          setCurrentOffset(newOffset);

          if (messagesResponse.pagination) {
            setHasMoreMessages(messagesResponse.pagination.has_more);
          }

          // Restaurar posición de scroll para que no salte
          setTimeout(() => {
            if (scrollContainer) {
              const newScrollHeight = scrollContainer.scrollHeight;
              scrollContainer.scrollTop = newScrollHeight - oldScrollHeight;
            }
          }, 100);

          console.log(`✅ Mensajes agregados. Total ahora: ${messages.length + mappedMessages.length}`);
        } else {
          setHasMoreMessages(false);
        }
      }
    } catch (err) {
      console.error('Error loading more messages:', err);
      toast.error('Error al cargar mensajes anteriores');
    } finally {
      setLoadingMore(false);
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
    error,
    hasMoreMessages,
    loadingMore,
    loadMoreMessages
  };
}