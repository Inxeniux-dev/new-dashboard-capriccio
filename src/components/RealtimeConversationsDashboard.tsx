'use client';

import { useEffect, useState } from 'react';
import { supabase, type ConversationState, type Message } from '@/utils/supabase-client';
import { STATUS_INDICATORS, type ConversationStatus } from '@/utils/conversation-status';
import { MessageSquare, Clock, User, Loader2 } from 'lucide-react';

interface ConversationWithLastMessage extends ConversationState {
  last_message?: string;
  unread_count?: number;
}

interface ConversationCardProps {
  conversation: ConversationWithLastMessage;
  statusIndicator: typeof STATUS_INDICATORS[ConversationStatus];
  onClick?: () => void;
  isSelected?: boolean;
}

function ConversationCard({ conversation, statusIndicator, onClick, isSelected = false }: ConversationCardProps) {
  // Asegurar que siempre tengamos un indicador válido
  const safeIndicator = statusIndicator || STATUS_INDICATORS['menu_principal'];

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border ${
        isSelected
          ? 'bg-primary/10 border-primary shadow-md'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-gray-500" />
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {conversation.user_identifier}
          </span>
        </div>
        {safeIndicator && (
          <div className={`px-2 py-1 rounded-full text-xs ${safeIndicator.bgColor} ${safeIndicator.textColor}`}>
            <span className="mr-1">{safeIndicator.icon}</span>
            {safeIndicator.text}
          </div>
        )}
      </div>

      {conversation.last_message && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {conversation.last_message}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>
            {new Date(conversation.last_interaction).toLocaleString('es-MX', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        {conversation.unread_count && conversation.unread_count > 0 && (
          <span className="bg-red-500 text-white px-2 py-0.5 rounded-full">
            {conversation.unread_count}
          </span>
        )}
      </div>
    </div>
  );
}

interface RealtimeConversationsDashboardProps {
  onSelectConversation?: (conversation: ConversationWithLastMessage) => void;
  selectedPhone?: string;
}

export function RealtimeConversationsDashboard({
  onSelectConversation,
  selectedPhone
}: RealtimeConversationsDashboardProps = {}) {
  const [conversations, setConversations] = useState<ConversationWithLastMessage[]>([]);
  const [filter, setFilter] = useState<'all' | ConversationStatus>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar conversaciones iniciales
    fetchConversations();

    // Suscribirse a cambios en estados de conversación
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_states'
        },
        (payload) => {
          console.log('Dashboard: Estado actualizado', payload);
          updateConversationInList({
            eventType: payload.eventType,
            new: payload.new as ConversationState | undefined,
            old: payload.old as ConversationState | undefined
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          // Actualizar el último mensaje de la conversación
          updateLastMessage(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function fetchConversations() {
    try {
      setIsLoading(true);

      let query = supabase
        .from('conversation_states')
        .select('*')
        .eq('platform', 'whatsapp')
        .order('last_interaction', { ascending: false });

      // Aplicar filtro si no es 'all'
      if (filter !== 'all') {
        query = query.eq('current_status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        // Cargar último mensaje para cada conversación
        const conversationsWithMessages = await Promise.all(
          data.map(async (conv) => {
            // Asegurar que el número tenga el formato correcto
            const cleanPhone = conv.user_identifier?.startsWith('+')
              ? conv.user_identifier
              : `+${conv.user_identifier}`;

            const { data: messages, error: msgError } = await supabase
              .from('messages')
              .select('message_content, timestamp')
              .or(`from_number.eq.${cleanPhone},to_number.eq.${cleanPhone}`)
              .eq('platform', 'whatsapp')
              .order('timestamp', { ascending: false })
              .limit(1);

            // No usar .single() porque puede no haber mensajes
            const lastMessage = messages && messages.length > 0 ? messages[0] : null;

            return {
              ...conv,
              last_message: lastMessage?.message_content || null,
              // Actualizar last_interaction si hay un mensaje más reciente
              last_interaction: lastMessage?.timestamp &&
                new Date(lastMessage.timestamp) > new Date(conv.last_interaction)
                ? lastMessage.timestamp
                : conv.last_interaction
            };
          })
        );

        setConversations(conversationsWithMessages);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function updateConversationInList(payload: { eventType: string; new?: ConversationState; old?: ConversationState }) {
    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
      setConversations(prev => {
        let updated = prev;
        if (payload.new) {
          const existing = prev.find(c => c.id === payload.new!.id);
          if (existing) {
            updated = prev.map(conv =>
              conv.id === payload.new!.id
                ? { ...conv, ...payload.new }
                : conv
            );
          } else {
            // Nueva conversación - agregar al principio
            updated = [payload.new as ConversationWithLastMessage, ...prev];
          }
        }

        // Re-ordenar por última interacción (más reciente primero)
        return updated.sort((a, b) => {
          const dateA = new Date(a.last_interaction).getTime();
          const dateB = new Date(b.last_interaction).getTime();
          return dateB - dateA;
        });
      });
    } else if (payload.eventType === 'DELETE') {
      if (payload.old) {
        setConversations(prev => prev.filter(c => c.id !== payload.old!.id));
      }
    }
  }

  function updateLastMessage(newMessage: Message) {
    setConversations(prev => {
      // Actualizar la conversación con el nuevo mensaje
      const updated = prev.map(conv => {
        // Los mensajes usan sender_phone y receiver_phone
        const from = newMessage.sender_phone;
        const to = newMessage.receiver_phone;

        if (conv.user_identifier === from || conv.user_identifier === to) {
          return {
            ...conv,
            last_message: newMessage.message_content,
            last_interaction: newMessage.created_at,
            unread_count: newMessage.direction === 'incoming'
              ? (conv.unread_count || 0) + 1
              : conv.unread_count
          };
        }
        return conv;
      });

      // Re-ordenar las conversaciones por última interacción (más reciente primero)
      return updated.sort((a, b) => {
        const dateA = new Date(a.last_interaction).getTime();
        const dateB = new Date(b.last_interaction).getTime();
        return dateB - dateA; // Orden descendente
      });
    });
  }

  // Contar conversaciones por estado
  const statusCounts = conversations.reduce((acc, conv) => {
    const status = conv.current_status as ConversationStatus;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<ConversationStatus, number>);

  // Filtrar conversaciones según el filtro seleccionado
  const filteredConversations = filter === 'all'
    ? conversations
    : conversations.filter(c => c.current_status === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Filtros por estado con contadores en tiempo real */}
      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Todas</span>
          <span className="ml-1 font-bold">({conversations.length})</span>
        </button>

        {(Object.entries(STATUS_INDICATORS) as [ConversationStatus, typeof STATUS_INDICATORS[ConversationStatus]][]).map(
          ([status, indicator]) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <span>{indicator.icon}</span>
              <span>{indicator.text}</span>
              <span className="ml-1 font-bold">({statusCounts[status] || 0})</span>
            </button>
          )
        )}
      </div>

      {/* Lista de conversaciones */}
      <div className="space-y-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay conversaciones {filter !== 'all' && `en estado "${STATUS_INDICATORS[filter].text}"`}
          </div>
        ) : (
          filteredConversations.map(conv => {
            // Usar el indicador del estado actual o uno por defecto
            const indicator = STATUS_INDICATORS[conv.current_status as ConversationStatus] ||
              STATUS_INDICATORS['menu_principal'];

            return (
              <ConversationCard
                key={conv.id}
                conversation={conv}
                statusIndicator={indicator}
                onClick={() => {
                  // Si hay un handler definido, usarlo, si no navegar
                  if (onSelectConversation) {
                    onSelectConversation(conv);
                  } else {
                    window.location.href = `/dashboard/logistics/conversations/whatsapp/${conv.user_identifier}`;
                  }
                }}
                isSelected={selectedPhone === conv.user_identifier}
              />
            );
          })
        )}
      </div>
    </div>
  );
}