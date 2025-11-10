import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase-client';
import apiClient from '@/lib/api-client';
import type { ConversationStats, Order } from '@/types/api';

export interface RealtimeStats {
  totalUsers: number;
  pendingOrders: number;
  totalConversations: number;
  unreadConversations: number;
  conversationsByPlatform: {
    whatsapp: number;
    instagram: number;
    messenger: number;
  };
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export function useRealtimeStats(userRole?: string) {
  const [stats, setStats] = useState<RealtimeStats>({
    totalUsers: 0,
    pendingOrders: 0,
    totalConversations: 0,
    unreadConversations: 0,
    conversationsByPlatform: {
      whatsapp: 0,
      instagram: 0,
      messenger: 0,
    },
    loading: true,
    error: null,
    lastUpdate: null,
  });

  // Función para cargar estadísticas iniciales
  const fetchInitialStats = useCallback(async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));

      // Fetch all stats in parallel
      const [conversationStatsResponse, ordersResponse, usersResponse] = await Promise.allSettled([
        apiClient.conversations.getStats(),
        apiClient.orders.getAll({ status: 'pending', limit: 100 }),
        userRole === 'admin' ? apiClient.users.getAll({ limit: 1000 }) : Promise.resolve({ data: [] }),
      ]);

      // Process conversation stats
      let conversationStats: ConversationStats | null = null;
      if (conversationStatsResponse.status === 'fulfilled' && conversationStatsResponse.value.data) {
        conversationStats = conversationStatsResponse.value.data;
      }

      // Process orders
      let pendingOrdersCount = 0;
      if (ordersResponse.status === 'fulfilled' && ordersResponse.value.data) {
        const orders = ordersResponse.value.data as Order[];
        pendingOrdersCount = orders.length;
      }

      // Process users
      let usersCount = 0;
      if (usersResponse.status === 'fulfilled' && usersResponse.value.data) {
        const users = Array.isArray(usersResponse.value.data) ? usersResponse.value.data : [];
        usersCount = users.length;
      }

      setStats({
        totalUsers: usersCount,
        pendingOrders: pendingOrdersCount,
        totalConversations: conversationStats?.active_conversations || 0,
        unreadConversations: conversationStats?.unread_count || 0,
        conversationsByPlatform: {
          whatsapp: conversationStats?.by_platform?.whatsapp || 0,
          instagram: conversationStats?.by_platform?.instagram || 0,
          messenger: conversationStats?.by_platform?.messenger || 0,
        },
        loading: false,
        error: null,
        lastUpdate: new Date(),
      });
    } catch (error) {
      console.error('Error fetching initial stats:', error);
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error loading stats',
      }));
    }
  }, [userRole]);

  // Función para actualizar contadores de conversaciones
  const updateConversationStats = useCallback(async () => {
    try {
      // Obtener conteo de conversaciones activas
      const { count: activeCount, error: activeError } = await supabase
        .from('conversation_states')
        .select('*', { count: 'exact', head: true })
        .not('current_status', 'eq', 'orden_completada');

      if (activeError) throw activeError;

      // Obtener conteo por plataforma
      const { data: platformData, error: platformError } = await supabase
        .from('conversation_states')
        .select('platform')
        .not('current_status', 'eq', 'orden_completada');

      if (platformError) throw platformError;

      const platformCounts = {
        whatsapp: 0,
        instagram: 0,
        messenger: 0,
      };

      platformData?.forEach((conv) => {
        if (conv.platform in platformCounts) {
          platformCounts[conv.platform as keyof typeof platformCounts]++;
        }
      });

      // Obtener mensajes no leídos (mensajes entrantes con estado != 'read')
      const { count: unreadCount, error: unreadError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('direction', 'incoming')
        .neq('status', 'read');

      if (unreadError) throw unreadError;

      setStats((prev) => ({
        ...prev,
        totalConversations: activeCount || 0,
        unreadConversations: unreadCount || 0,
        conversationsByPlatform: platformCounts,
        lastUpdate: new Date(),
      }));
    } catch (error) {
      console.error('Error updating conversation stats:', error);
    }
  }, []);

  // Función para actualizar conteo de órdenes pendientes
  const updateOrderStats = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;

      setStats((prev) => ({
        ...prev,
        pendingOrders: count || 0,
        lastUpdate: new Date(),
      }));
    } catch (error) {
      console.error('Error updating order stats:', error);
    }
  }, []);

  // Función para actualizar conteo de usuarios
  const updateUserStats = useCallback(async () => {
    if (userRole !== 'admin') return;

    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      setStats((prev) => ({
        ...prev,
        totalUsers: count || 0,
        lastUpdate: new Date(),
      }));
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }, [userRole]);

  useEffect(() => {
    // Cargar estadísticas iniciales
    fetchInitialStats();

    // Canal para suscripciones en tiempo real
    const channel = supabase
      .channel('stats-realtime')
      // Suscripción a cambios en conversation_states
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_states',
        },
        (payload) => {
          console.log('📊 Cambio en conversation_states:', payload.eventType);
          updateConversationStats();
        }
      )
      // Suscripción a nuevos mensajes (para actualizar conteo de no leídos)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const message = payload.new;
          if (message && message.direction === 'incoming') {
            console.log('📨 Nuevo mensaje entrante, actualizando no leídos');
            // Incrementar contador de no leídos
            setStats((prev) => ({
              ...prev,
              unreadConversations: prev.unreadConversations + 1,
              lastUpdate: new Date(),
            }));
          }
        }
      )
      // Suscripción a actualizaciones de mensajes (para cuando se marcan como leídos)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const oldMessage = payload.old;
          const newMessage = payload.new;

          // Si un mensaje cambió de no leído a leído
          if (
            oldMessage &&
            newMessage &&
            oldMessage.direction === 'incoming' &&
            oldMessage.status !== 'read' &&
            newMessage.status === 'read'
          ) {
            console.log('✅ Mensaje marcado como leído');
            // Decrementar contador de no leídos
            setStats((prev) => ({
              ...prev,
              unreadConversations: Math.max(0, prev.unreadConversations - 1),
              lastUpdate: new Date(),
            }));
          }
        }
      )
      // Suscripción a cambios en órdenes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('📦 Cambio en órdenes:', payload.eventType);
          updateOrderStats();
        }
      );

    // Si es admin, suscribirse también a cambios en usuarios
    if (userRole === 'admin') {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          console.log('👤 Cambio en usuarios:', payload.eventType);
          updateUserStats();
        }
      );
    }

    // Suscribirse al canal
    channel.subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    userRole,
    fetchInitialStats,
    updateConversationStats,
    updateOrderStats,
    updateUserStats,
  ]);

  // Función manual para refrescar estadísticas
  const refreshStats = useCallback(() => {
    fetchInitialStats();
  }, [fetchInitialStats]);

  return { stats, refreshStats };
}