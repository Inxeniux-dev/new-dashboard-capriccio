'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { RealtimeConversationsDashboard } from '@/components/RealtimeConversationsDashboard';
import { RealtimeConversationView } from '@/components/RealtimeConversationView';
import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';
import { Bell, MessageSquare, X } from 'lucide-react';

export default function RealtimeConversationsPage() {
  const { loading, user } = useRequireAuth(['logistics', 'logistica', 'admin']);
  const searchParams = useSearchParams();
  // const platform = searchParams.get('platform') || 'whatsapp'; // For future use
  const conversationId = searchParams.get('id');
  const userPhone = searchParams.get('phone');

  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    phone: string;
  } | null>(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useGlobalNotifications(
    user?.role || 'agent'
  );

  const [showGlobalNotifications, setShowGlobalNotifications] = useState(false);

  useEffect(() => {
    // Si hay parámetros en la URL, seleccionar esa conversación
    if (conversationId && userPhone) {
      setSelectedConversation({ id: conversationId, phone: userPhone });
    }
  }, [conversationId, userPhone]);

  // Solicitar permisos de notificación al cargar la página
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (message: string) => {
    // Aquí deberías implementar el envío de mensaje a tu API
    console.log('Enviando mensaje:', message);
    // Por ahora solo lo logueamos, el backend debe manejar el envío real
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Conversaciones en Tiempo Real
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Gestiona las conversaciones con actualizaciones en vivo
            </p>
          </div>

          {/* Global Notifications Button */}
          <button
            onClick={() => setShowGlobalNotifications(!showGlobalNotifications)}
            className="relative p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Global Notifications Panel */}
      {showGlobalNotifications && (
        <div className="absolute right-4 top-20 z-50 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden">
          <div className="p-3 border-b flex items-center justify-between bg-gray-50 dark:bg-gray-700">
            <h3 className="font-semibold">Notificaciones Globales</h3>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary hover:underline"
                >
                  Marcar todas como leídas
                </button>
              )}
              <button
                onClick={() => setShowGlobalNotifications(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay notificaciones nuevas
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className="p-3 border-b hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notif.message}
                      </p>
                    </div>
                    {notif.priority === 'high' && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Urgente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notif.created_at).toLocaleString('es-MX')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <RealtimeConversationsDashboard
            onSelectConversation={(conv) => {
              // Generar un ID único para la conversación basado en el teléfono
              const conversationId = `conv-${conv.user_identifier.replace(/\+/g, '')}`;
              setSelectedConversation({
                id: conversationId,
                phone: conv.user_identifier
              });
            }}
            selectedPhone={selectedConversation?.phone}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <RealtimeConversationView
              conversationId={selectedConversation.id}
              userPhone={selectedConversation.phone}
              onSendMessage={handleSendMessage}
              onClose={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Selecciona una conversación para comenzar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}