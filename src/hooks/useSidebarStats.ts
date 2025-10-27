import { useEffect, useState, useCallback } from "react";
import apiClient from "@/lib/api-client";
import type { ConversationStats, Order } from "@/types/api";

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

export function useSidebarStats(userRole?: string) {
  const [stats, setStats] = useState<SidebarStats>({
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
  });

  const fetchStats = useCallback(async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));

      // Fetch all stats in parallel
      const [conversationStatsResponse, ordersResponse, usersResponse] = await Promise.allSettled([
        apiClient.conversations.getStats(),
        apiClient.orders.getAll({ status: "pending", limit: 100 }),
        userRole === "admin" ? apiClient.users.getAll({ limit: 1000 }) : Promise.resolve({ data: [] }),
      ]);

      // Process conversation stats
      let conversationStats: ConversationStats | null = null;
      if (conversationStatsResponse.status === "fulfilled" && conversationStatsResponse.value.data) {
        conversationStats = conversationStatsResponse.value.data;
      }

      // Process orders
      let pendingOrdersCount = 0;
      if (ordersResponse.status === "fulfilled" && ordersResponse.value.data) {
        const orders = ordersResponse.value.data as Order[];
        pendingOrdersCount = orders.length;
      }

      // Process users
      let usersCount = 0;
      if (usersResponse.status === "fulfilled" && usersResponse.value.data) {
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
      });
    } catch (error) {
      console.error("Error fetching sidebar stats:", error);
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Error loading stats",
      }));
    }
  }, [userRole]);

  useEffect(() => {
    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, refreshStats: fetchStats };
}
