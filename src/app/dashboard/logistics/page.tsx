"use client";

import { useRequireAuth } from "@/contexts/AuthContext";
import { Package, Truck, MessageSquare, AlertCircle, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import type { Order, Conversation } from "@/types/api";

export default function LogisticsDashboardPage() {
  const { user, loading } = useRequireAuth(["logistics", "logistica"]);
  const router = useRouter();
  const [stats, setStats] = useState({
    pendingAssignments: 0,
    todayDeliveries: 0,
    activeConversations: 0,
    unassignedOrders: 0,
  });
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>([]);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);

      // Cargar órdenes pendientes
      const ordersResponse = await apiClient.logistics.getPendingOrders({ limit: 10 }) as any;
      const orders = ordersResponse.orders || ordersResponse.data || [];
      const unassigned = orders.filter((o: Order) => !o.store_id || o.status === "pending_logistics");
      setUnassignedOrders(unassigned);

      // Cargar conversaciones de WhatsApp (por defecto)
      // TODO: En el futuro, cargar de todas las plataformas
      const conversationsResponse = await apiClient.conversations.getAll({
        platform: "whatsapp",
        limit: 5
      });
      const conversations = conversationsResponse.data || [];
      setRecentConversations(conversations);

      // Cargar estadísticas de conversaciones
      const conversationStats = await apiClient.conversations.getStats();

      // Actualizar estadísticas
      setStats({
        pendingAssignments: unassigned.length,
        todayDeliveries: Math.floor(Math.random() * 10) + 5, // Mock temporal
        activeConversations: conversationStats.data?.totalConversations ||
                           conversationStats.data?.active_conversations || 0,
        unassignedOrders: unassigned.length,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleViewConversations = () => {
    router.push("/dashboard/logistics/conversations");
  };

  const handleViewOrders = () => {
    router.push("/dashboard/logistics/orders");
  };

  const handleAssignOrder = (orderId: string | number) => {
    router.push(`/dashboard/logistics/orders/${orderId}`);
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Logística</h1>
          <p className="text-gray-600">Bienvenido, {user?.full_name}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={AlertCircle}
          title="Órdenes Sin Asignar"
          value={stats.unassignedOrders}
          color="bg-red-500"
          onClick={handleViewOrders}
        />
        <StatCard
          icon={Truck}
          title="Entregas Hoy"
          value={stats.todayDeliveries}
          color="bg-blue-500"
        />
        <StatCard
          icon={Package}
          title="Asignaciones Pendientes"
          value={stats.pendingAssignments}
          color="bg-orange-500"
          onClick={handleViewOrders}
        />
        <StatCard
          icon={MessageSquare}
          title="Conversaciones Activas"
          value={stats.activeConversations}
          color="bg-purple-500"
          onClick={handleViewConversations}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Órdenes Sin Asignar */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <AlertCircle className="text-red-500" size={24} />
              Órdenes Sin Asignar
            </h2>
            <button
              onClick={handleViewOrders}
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {unassignedOrders.length > 0 ? (
              unassignedOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleAssignOrder(order.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {order.customer_name || order.metadata?.customer_name || "Cliente"}
                      </p>
                      <p className="text-sm text-gray-600">{order.customer_phone}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package size={14} />
                      {order.items?.length || order.order_items?.length || order.products?.length || 0} productos
                    </span>
                  </div>
                  <button className="mt-3 w-full bg-primary hover:bg-primary-hover text-white text-sm py-2 rounded-lg transition-colors">
                    Asignar a Sucursal
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No hay órdenes sin asignar</p>
            )}
          </div>
        </div>

        {/* Conversaciones Recientes */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="text-purple-500" size={24} />
              Conversaciones Recientes
            </h2>
            <button
              onClick={handleViewConversations}
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {recentConversations.length > 0 ? (
              recentConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/logistics/conversations/${conversation.platform}/${conversation.contact_id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <PlatformIcon platform={conversation.platform} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-gray-800 truncate">
                          {conversation.contact_name}
                        </p>
                        {conversation.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 ml-2">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conversation.last_message_time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No hay conversaciones recientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color, onClick }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: number;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 ${onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`${color} p-4 rounded-lg`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const iconClass = "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold";

  switch (platform) {
    case "whatsapp":
      return <div className={`${iconClass} bg-green-500`}>WA</div>;
    case "instagram":
      return <div className={`${iconClass} bg-pink-500`}>IG</div>;
    case "messenger":
      return <div className={`${iconClass} bg-blue-500`}>FB</div>;
    case "facebook":
      return <div className={`${iconClass} bg-blue-600`}>FB</div>;
    default:
      return <div className={`${iconClass} bg-gray-500`}>??</div>;
  }
}
