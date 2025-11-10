'use client';

import { useEffect, useState } from 'react';
import { useRealtimeConversation } from '@/hooks/useRealtimeConversation';
import { STATUS_INDICATORS } from '@/utils/conversation-status';
import { Bell, Send, Loader2, AlertCircle, X, MessageSquare, Clock } from 'lucide-react';
import type { Message } from '@/utils/supabase-client';

interface ConversationViewProps {
  conversationId: string;
  userPhone: string;
  onSendMessage?: (message: string) => Promise<void>;
  onClose?: () => void;
}

function MessageItem({ message, isAIResponse }: { message: Message; isAIResponse?: boolean }) {
  const isIncoming = message.direction === 'incoming';

  // Determinar el tipo de mensaje
  const getMessageStyle = () => {
    if (isIncoming) {
      // Mensajes del cliente - siempre a la izquierda en azul
      return {
        align: 'justify-start',
        bg: 'bg-blue-100 dark:bg-blue-900/50',
        text: 'text-gray-900 dark:text-gray-100',
        badge: { icon: '👤', text: 'Cliente', color: 'bg-blue-500 text-white' }
      };
    } else if (isAIResponse) {
      // Respuestas de IA - a la derecha en morado
      return {
        align: 'justify-end',
        bg: 'bg-purple-500 dark:bg-purple-600',
        text: 'text-white',
        badge: { icon: '🤖', text: 'IA', color: 'bg-purple-700 text-white' }
      };
    } else {
      // Respuestas de agente humano - a la derecha en verde
      return {
        align: 'justify-end',
        bg: 'bg-green-500 dark:bg-green-600',
        text: 'text-white',
        badge: { icon: '👨‍💼', text: 'Agente', color: 'bg-green-700 text-white' }
      };
    }
  };

  const style = getMessageStyle();

  return (
    <div className={`flex ${style.align} mb-3`}>
      <div className={`max-w-[75%] ${style.bg} rounded-2xl shadow-sm`}>
        {/* Badge del remitente */}
        <div className="px-3 pt-2 pb-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.badge.color}`}>
            <span>{style.badge.icon}</span>
            <span>{style.badge.text}</span>
          </span>
        </div>

        {/* Contenido del mensaje */}
        <div className="px-4 pb-2">
          <p className={`whitespace-pre-wrap break-words ${style.text}`}>
            {message.message_content}
          </p>
        </div>

        {/* Timestamp */}
        <div className="px-4 pb-2">
          <div className={`text-xs ${isIncoming ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'}`}>
            {new Date(message.created_at).toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RealtimeConversationView({
  conversationId,
  userPhone,
  onSendMessage,
  onClose
}: ConversationViewProps) {
  const {
    messages,
    conversationState,
    notifications,
    lastUpdate,
    markNotificationAsRead,
    isLoading,
    error,
    hasMoreMessages,
    loadingMore,
    loadMoreMessages
  } = useRealtimeConversation(conversationId, userPhone);

  const [showNotifications, setShowNotifications] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Auto-scroll cuando lleguen mensajes nuevos
  useEffect(() => {
    if (lastUpdate) {
      const element = document.getElementById('messages-end');
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lastUpdate]);

  // Solicitar permisos de notificación
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const currentStatus = conversationState?.current_status || 'menu_principal';
  const statusIndicator = STATUS_INDICATORS[currentStatus] || STATUS_INDICATORS.menu_principal;

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending || !onSendMessage) return;

    setIsSending(true);
    try {
      await onSendMessage(messageInput);
      setMessageInput('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !conversationState) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* BARRA DE ESTADO - Siempre visible */}
      <div
        className={`p-3 ${statusIndicator.bgColor} border-b transition-all duration-300`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{statusIndicator.icon}</span>
            <div>
              <span className={`font-semibold ${statusIndicator.textColor}`}>
                {statusIndicator.text}
              </span>
              {'animated' in statusIndicator && statusIndicator.animated && (
                <span className="ml-2 inline-block">
                  <span className="animate-pulse">●</span>
                </span>
              )}
            </div>
          </div>

          {/* Contador de notificaciones */}
          {notifications.length > 0 && (
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.filter(n => !n.is_read).length}
              </span>
            </button>
          )}
        </div>

        {/* Información adicional del estado */}
        {conversationState?.status_data && Object.keys(conversationState.status_data).length > 0 && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {Object.entries(conversationState.status_data).map(([key, value]) => (
              <span key={key} className="mr-3">
                {key}: <strong>{String(value)}</strong>
              </span>
            ))}
          </div>
        )}

        {/* Alerta especial para asesor humano */}
        {currentStatus === 'asesor_humano' && (
          <div className="mt-2 p-2 bg-red-200 dark:bg-red-900 rounded text-red-800 dark:text-red-200 text-sm">
            ⚠️ Modo manual activado - Las respuestas automáticas están deshabilitadas
          </div>
        )}
      </div>

      {/* Panel de notificaciones (desplegable) */}
      {showNotifications && (
        <div className="bg-white dark:bg-gray-800 border-b max-h-48 overflow-y-auto">
          <div className="p-2 font-semibold border-b flex items-center justify-between">
            <span>Notificaciones</span>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No hay notificaciones</div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3 border-b hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                  !notif.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => markNotificationAsRead(notif.id)}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{notif.title}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(notif.created_at).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{notif.message}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Leyenda de colores */}
      {messages.length > 0 && (
        <div className="px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-gray-600 dark:text-gray-400">👤 Cliente</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-purple-500"></span>
              <span className="text-gray-600 dark:text-gray-400">🤖 IA</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600 dark:text-gray-400">👨‍💼 Agente</span>
            </div>
          </div>
        </div>
      )}

      {/* Lista de mensajes */}
      <div id="messages-list" className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="mb-4">
                <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conversación sin mensajes
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Aún no hay mensajes en esta conversación. Los nuevos mensajes aparecerán automáticamente cuando lleguen.
              </p>

              {conversationState && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-left">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    Información de la conversación
                  </h4>
                  <div className="text-sm space-y-1 text-blue-600 dark:text-blue-400">
                    <p>📱 <span className="font-medium">Cliente:</span> {userPhone}</p>
                    <p>📊 <span className="font-medium">Estado actual:</span> {statusIndicator.text}</p>
                    <p>🕐 <span className="font-medium">Última interacción:</span> {new Date(conversationState.last_interaction).toLocaleString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                    {conversationState.status_data && Object.keys(conversationState.status_data).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                        <p className="font-medium mb-1">Datos adicionales:</p>
                        {Object.entries(conversationState.status_data).map(([key, value]) => (
                          <p key={key} className="pl-4">
                            • {key}: <strong>{String(value)}</strong>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✨ <strong>Tip:</strong> Los mensajes se actualizan en tiempo real. No necesitas refrescar la página.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Botón para cargar mensajes anteriores */}
            {hasMoreMessages && (
              <div className="flex flex-col items-center mb-4 space-y-2">
                <button
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                  className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Cargando...</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>↑ Cargar mensajes más antiguos</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Indicador de inicio de conversación */}
            {!hasMoreMessages && messages.length > 0 && (
              <div className="flex justify-center mb-4">
                <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                  ⬆️ Inicio de la conversación
                </div>
              </div>
            )}

            {/* Lista de mensajes con separadores de fecha */}
            {messages.map((message, index) => {
              const currentDate = new Date(message.created_at).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });

              const previousDate = index > 0
                ? new Date(messages[index - 1].created_at).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : null;

              const showDateSeparator = previousDate !== currentDate;

              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                        {currentDate}
                      </div>
                    </div>
                  )}
                  <MessageItem
                    message={message}
                    isAIResponse={message.metadata?.is_ai_response}
                  />
                </div>
              );
            })}
          </>
        )}
        <div id="messages-end" />
      </div>

      {/* Input de mensaje con indicador de estado */}
      <div className="border-t p-3 bg-white dark:bg-gray-800">
        {currentStatus === 'asesor_humano' ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            👤 Un asesor humano está atendiendo esta conversación
          </div>
        ) : currentStatus === 'orden_completada' ? (
          <div className="text-center text-green-600 dark:text-green-400">
            ✅ Orden completada - Conversación finalizada
          </div>
        ) : (
          <div className="flex space-x-2">
            <input
              type="text"
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              disabled={isSending}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}