"use client";

import { useRequireAuth } from "@/contexts/AuthContext";
import { Users, Package, MessageSquare, TrendingUp, Building2, AlertCircle, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import type { Order, BranchStats } from "@/types/api";

export default function AdminDashboardPage() {
  const { user, loading } = useRequireAuth(["admin"]);
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 12,
    activeConversations: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<BranchStats[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);

      // Cargar órdenes
      const ordersResponse = await apiClient.orders.getAll({ limit: 10 });
      const orders = ordersResponse.data || [];
      setRecentOrders(orders);

      // Cargar conversaciones
      const conversationsResponse = await apiClient.conversations.getStats();
      const conversationStats = conversationsResponse.data;

      // Cargar sucursales
      const branchesResponse = await apiClient.logistics.getStores();
      const branchesData = branchesResponse.data || [];

      // Mock de estadísticas por sucursal
      const branchStats: BranchStats[] = branchesData.map((branch) => ({
        id: branch.id,
        name: branch.name,
        pending_orders: Math.floor(Math.random() * 20),
        completed_today: Math.floor(Math.random() * 15),
        total_orders: Math.floor(Math.random() * 100),
        active_employees: Math.floor(Math.random() * 10) + 3,
      }));

      setBranches(branchStats);

      // Actualizar estadísticas
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === "pending" || o.status === "unassigned").length,
        totalUsers: 12,
        activeConversations: conversationStats?.active_conversations || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Administrador</h1>
          <p className="text-gray-600">Bienvenido, {user?.full_name}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          title="Total Órdenes"
          value={stats.totalOrders}
          color="bg-blue-500"
          onClick={() => router.push("/dashboard/logistics/orders")}
        />
        <StatCard
          icon={AlertCircle}
          title="Órdenes Pendientes"
          value={stats.pendingOrders}
          color="bg-orange-500"
          onClick={() => router.push("/dashboard/logistics/orders")}
        />
        <StatCard
          icon={Users}
          title="Total Usuarios"
          value={stats.totalUsers}
          color="bg-green-500"
          onClick={() => router.push("/dashboard/admin/users")}
        />
        <StatCard
          icon={MessageSquare}
          title="Conversaciones Activas"
          value={stats.activeConversations}
          color="bg-purple-500"
          onClick={() => router.push("/dashboard/logistics/conversations")}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push("/dashboard/admin/users")}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3">
            <Users className="text-primary" size={24} />
            <span className="font-semibold text-gray-800">Gestionar Usuarios</span>
          </div>
          <ArrowRight className="text-gray-400" size={20} />
        </button>

        <button
          onClick={() => router.push("/dashboard/admin/branches")}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3">
            <Building2 className="text-primary" size={24} />
            <span className="font-semibold text-gray-800">Gestionar Sucursales</span>
          </div>
          <ArrowRight className="text-gray-400" size={20} />
        </button>

        <button
          onClick={() => router.push("/dashboard/logistics/conversations")}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="text-primary" size={24} />
            <span className="font-semibold text-gray-800">Ver Conversaciones</span>
          </div>
          <ArrowRight className="text-gray-400" size={20} />
        </button>
      </div>

      {/* Sucursales */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="text-primary" size={24} />
            Sucursales
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <div key={branch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-800 mb-2">{branch.name}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pendientes:</span>
                  <span className="font-semibold text-orange-600">{branch.pending_orders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completadas hoy:</span>
                  <span className="font-semibold text-green-600">{branch.completed_today}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total órdenes:</span>
                  <span className="font-semibold">{branch.total_orders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Empleados:</span>
                  <span className="font-semibold">{branch.active_employees}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Órdenes Recientes */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-primary" size={24} />
          Órdenes Recientes
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sucursal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{order.order_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.branch_name || "Sin asignar"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">${order.total_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No hay órdenes disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    unassigned: { label: "Sin asignar", color: "bg-gray-100 text-gray-800" },
    assigned: { label: "Asignada", color: "bg-blue-100 text-blue-800" },
    in_progress: { label: "En proceso", color: "bg-indigo-100 text-indigo-800" },
    completed: { label: "Completada", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
}
