import { useEffect, useState } from 'react';
import { supabase, type Notification } from '@/utils/supabase-client';

interface UseGlobalNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  isLoading: boolean;
}

export function useGlobalNotifications(userRole: string = 'agent'): UseGlobalNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar notificaciones iniciales
    fetchNotifications();

    // Determinar filtro según el rol
    let filter: string | undefined;
    if (userRole === 'agent' || userRole === 'employee') {
      filter = `type=in.(agent_assigned,new_conversation,human_assistance_required)`;
    } else if (userRole === 'admin') {
      // Los admins ven todas las notificaciones
      filter = undefined;
    } else if (userRole === 'logistics') {
      filter = `type=in.(new_conversation,order_status,human_assistance_required)`;
    }

    // Suscribirse a nuevas notificaciones
    const channel = supabase
      .channel('global-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          ...(filter && { filter })
        },
        (payload) => {
          console.log('🔔 Nueva notificación global:', payload.new);
          handleNewNotification(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole]);

  async function fetchNotifications() {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        setNotifications(data);
        setUnreadCount(data.length);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleNewNotification(notification: Notification) {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Solicitar permisos si no los tenemos
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Mostrar notificación del navegador
    if (notification.priority === 'high' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        requireInteraction: true,
        tag: notification.id
      });
    }

    // Reproducir sonido según el tipo
    const soundMap: Record<string, string> = {
      'human_assistance_required': '/sounds/urgent.mp3',
      'agent_assigned': '/sounds/assigned.mp3',
      'new_conversation': '/sounds/new-chat.mp3',
      'order_status': '/sounds/notification.mp3'
    };

    if (soundMap[notification.type]) {
      const audio = new Audio(soundMap[notification.type]);
      audio.play().catch(e => console.log('No se pudo reproducir sonido:', e));
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }

  async function markAllAsRead() {
    try {
      const ids = notifications.map(n => n.id);

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .in('id', ids);

      if (error) throw error;

      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading
  };
}