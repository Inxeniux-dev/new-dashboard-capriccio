import { useRealtimeStats } from "./useRealtimeStats";

// Re-exportar el tipo SidebarStats para mantener compatibilidad
export interface SidebarStats {
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
}

// Wrapper que mantiene la misma interfaz pero usa el nuevo hook con realtime
export function useSidebarStats(userRole?: string) {
  const { stats: realtimeStats, refreshStats } = useRealtimeStats(userRole);

  // Mapear los stats del hook de realtime al formato esperado
  const stats: SidebarStats = {
    totalUsers: realtimeStats.totalUsers,
    pendingOrders: realtimeStats.pendingOrders,
    totalConversations: realtimeStats.totalConversations,
    unreadConversations: realtimeStats.unreadConversations,
    conversationsByPlatform: realtimeStats.conversationsByPlatform,
    loading: realtimeStats.loading,
    error: realtimeStats.error,
  };

  return { stats, refreshStats };
}
