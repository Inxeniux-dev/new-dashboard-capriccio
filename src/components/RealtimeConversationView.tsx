'use client';

import { useEffect, useState } from 'react';
import { useRealtimeConversation } from '@/hooks/useRealtimeConversation';
import { STATUS_INDICATORS } from '@/utils/conversation-status';
import { Bell, Send, Loader2, AlertCircle, X } from 'lucide-react';
import type { Message } from '@/utils/supabase-client';

interface ConversationViewProps {
  conversationId: string;
  userPhone: string;
  onSendMessage?: (message: string) => Promise<void>;
}

function MessageItem({ message, isAIResponse }: { message: Message; isAIResponse?: boolean }) {
  const isIncoming = message.direction === 'incoming';

  return (
    <div className={`flex ${isIncoming ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          isIncoming
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
            : 'bg-primary text-white'
        }`}
      >
        {isAIResponse && (
          <div className="text-xs opacity-75 mb-1">🤖 Respuesta automática</div>
        )}
        <p className="whitespace-pre-wrap">{message.message_content}</p>
        <div className={`text-xs mt-1 ${isIncoming ? 'text-gray-500' : 'text-white/80'}`}>
          {new Date(message.created_at).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
}

export function RealtimeConversationView({
  conversationId,
  userPhone,
  onSendMessage
}: ConversationViewProps) {
  const {
    messages,
    conversationState,
    notifications,
    lastUpdate,
    markNotificationAsRead,
    isLoading,
    error
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

  if (error) {
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

      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            No hay mensajes en esta conversación
          </div>
        ) : (
          messages.map(message => (
            <MessageItem
              key={message.id}
              message={message}
              isAIResponse={message.metadata?.is_ai_response}
            />
          ))
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