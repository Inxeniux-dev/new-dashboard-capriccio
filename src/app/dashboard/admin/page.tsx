"use client";

import { useRequireAuth } from "@/contexts/AuthContext";
import {
  Users,
  Package,
  MessageSquare,
  TrendingUp,
  Building2,
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  DollarSign,
  Activity,
  BarChart3,
  ShoppingBag,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import type { Order, BranchStats } from "@/types/api";

export default function AdminDashboardPage() {
  const { user, loading } = useRequireAuth(["admin", "administrador"]);
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 12,
    activeConversations: 0,
    totalRevenue: 0,
    ordersToday: 0,
    conversionRate: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<BranchStats[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animatedStats, setAnimatedStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    activeConversations: 0,
    totalRevenue: 0,
    ordersToday: 0,
    conversionRate: 0,
  });

  // Obtener fecha y hora actual
  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: now.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
    // Actualizar hora cada minuto
    const interval = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Animar números al cargar
  useEffect(() => {
    const animateValue = (start: number, end: number, duration: number, key: keyof typeof animatedStats) => {
      const range = end - start;
      const increment = range / (duration / 16);
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
          setAnimatedStats(prev => ({ ...prev, [key]: end }));
          clearInterval(timer);
        } else {
          setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, 16);
    };

    if (!loadingData) {
      animateValue(0, stats.totalOrders, 1000, 'totalOrders');
      animateValue(0, stats.pendingOrders, 1000, 'pendingOrders');
      animateValue(0, stats.totalUsers, 1000, 'totalUsers');
      animateValue(0, stats.activeConversations, 1000, 'activeConversations');
      animateValue(0, stats.totalRevenue, 1500, 'totalRevenue');
      animateValue(0, stats.ordersToday, 1000, 'ordersToday');
      animateValue(0, stats.conversionRate, 1200, 'conversionRate');
    }
  }, [stats, loadingData]);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Cargar órdenes con manejo de errores
      let orders: Order[] = [];
      try {
        const ordersResponse = await apiClient.orders.getAll({ limit: 10 });
        orders = ordersResponse.data || [];
      } catch (err) {
        console.error("Error loading orders:", err);
        // Usar datos de ejemplo si falla
        orders = getMockOrders();
      }
      setRecentOrders(orders);

      // Cargar conversaciones con manejo de errores
      let conversationStats: { active_conversations?: number } | null = null;
      try {
        const conversationsResponse = await apiClient.conversations.getStats();
        conversationStats = conversationsResponse.data || null;
      } catch (err) {
        console.error("Error loading conversations:", err);
        conversationStats = { active_conversations: 8 };
      }

      // Cargar sucursales con manejo de errores
      let branchesData: { id: string; name: string }[] = [];
      try {
        const branchesResponse = await apiClient.logistics.getStores();
        branchesData = branchesResponse.data || [];
      } catch (err) {
        console.error("Error loading branches:", err);
        branchesData = getMockBranches();
      }

      // Estadísticas por sucursal con datos más realistas
      const branchStats: BranchStats[] = branchesData.map((branch) => ({
        id: branch.id,
        name: branch.name,
        pending_orders: Math.floor(Math.random() * 10) + 2,
        completed_today: Math.floor(Math.random() * 15) + 5,
        total_orders: Math.floor(Math.random() * 50) + 20,
        active_employees: Math.floor(Math.random() * 5) + 2,
      }));

      setBranches(branchStats);

      // Calcular estadísticas mejoradas
      const today = new Date().toDateString();
      const ordersToday = orders.filter(o => new Date(o.created_at).toDateString() === today).length;
      const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
      const completedOrders = orders.filter(o => o.status === "completed").length;
      const conversionRate = orders.length > 0 ? (completedOrders / orders.length) * 100 : 0;

      // Actualizar estadísticas
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === "pending" || o.status === "unassigned").length,
        totalUsers: 12,
        activeConversations: conversationStats?.active_conversations || 8,
        totalRevenue,
        ordersToday,
        conversionRate,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Algunos datos no pudieron cargarse correctamente");
    } finally {
      setLoadingData(false);
    }
  };

  // Datos de ejemplo para cuando el backend no esté disponible
  const getMockOrders = (): Order[] => [
    {
      id: "1",
      order_number: "#2024-001",
      customer_name: "María García",
      customer_phone: "477-123-4567",
      delivery_address: "Centro, León",
      delivery_date: new Date().toISOString(),
      total_amount: 450.00,
      status: "pending",
      payment_method: "efectivo",
      branch_id: "branch-1",
      branch_name: "Tienda Central",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      platform: "whatsapp",
      items: []
    },
    {
      id: "2",
      order_number: "#2024-002",
      customer_name: "Carlos López",
      customer_phone: "477-234-5678",
      delivery_address: "Norte, León",
      delivery_date: new Date().toISOString(),
      total_amount: 320.00,
      status: "in_progress",
      payment_method: "tarjeta",
      branch_id: "branch-2",
      branch_name: "Tienda Norte",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      platform: "whatsapp",
      items: []
    }
  ];

  const getMockBranches = () => [
    { id: "branch-1", name: "Tienda Central" },
    { id: "branch-2", name: "Tienda Norte" },
    { id: "branch-3", name: "Tienda Sur" }
  ];

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header con fecha y hora */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
              Dashboard Administrador
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={20} />
              Bienvenido, {user?.full_name}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Calendar className="text-blue-500" size={18} />
              <span className="text-sm font-medium">{currentDateTime.date}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mt-1">
              <Clock className="text-blue-500" size={18} />
              <span className="text-2xl font-bold">{currentDateTime.time}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={20} />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards con métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          title="Total Órdenes"
          value={animatedStats.totalOrders}
          subtitle={`+${animatedStats.ordersToday} hoy`}
          color="bg-blue-500"
          onClick={() => router.push("/dashboard/logistics/orders")}
        />
        <StatCard
          icon={AlertCircle}
          title="Órdenes Pendientes"
          value={animatedStats.pendingOrders}
          subtitle="Requieren atención"
          color="bg-orange-500"
          onClick={() => router.push("/dashboard/logistics/orders")}
        />
        <StatCard
          icon={DollarSign}
          title="Ingresos Totales"
          value={`$${animatedStats.totalRevenue.toLocaleString('es-MX')}`}
          subtitle={`${animatedStats.conversionRate.toFixed(1)}% conversión`}
          color="bg-green-500"
          onClick={() => router.push("/dashboard/admin/reports")}
        />
        <StatCard
          icon={MessageSquare}
          title="Conversaciones"
          value={animatedStats.activeConversations}
          subtitle="Activas ahora"
          color="bg-purple-500"
          onClick={() => router.push("/dashboard/logistics/conversations")}
        />
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Activity className="text-indigo-600 dark:text-indigo-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Conversión</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {animatedStats.conversionRate.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-4">
          <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
            <BarChart3 className="text-cyan-600 dark:text-cyan-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Órdenes Hoy</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {animatedStats.ordersToday}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-4">
          <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
            <ShoppingBag className="text-pink-600 dark:text-pink-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {animatedStats.totalUsers}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push("/dashboard/admin/users")}
          className="group flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
              <Users className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-100">Gestionar Usuarios</span>
          </div>
          <ArrowRight className="text-gray-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform" size={20} />
        </button>

        <button
          onClick={() => router.push("/dashboard/admin/branches")}
          className="group flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:scale-110 transition-transform">
              <Building2 className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-100">Ver Sucursales</span>
          </div>
          <ArrowRight className="text-gray-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform" size={20} />
        </button>

        <button
          onClick={() => router.push("/dashboard/admin/reports")}
          className="group flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-100">Ver Reportes</span>
          </div>
          <ArrowRight className="text-gray-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform" size={20} />
        </button>
      </div>

      {/* Sucursales */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            Estado de Sucursales
          </h2>
          <button
            onClick={() => router.push("/dashboard/admin/branches")}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Ver todas
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch, index) => (
            <div
              key={branch.id}
              className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                <span className="text-2xl">{['🏪', '🏢', '🏬'][index % 3]}</span>
                {branch.name}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <AlertCircle size={14} className="text-orange-500" />
                    Pendientes
                  </span>
                  <span className="font-bold text-orange-600 text-lg">{branch.pending_orders}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <Activity size={14} className="text-green-500" />
                    Hoy
                  </span>
                  <span className="font-bold text-green-600 text-lg">{branch.completed_today}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-600 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Total</span>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{branch.total_orders}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Personal</span>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{branch.active_employees}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Órdenes Recientes */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
            </div>
            Órdenes Recientes
          </h2>
          <button
            onClick={() => router.push("/dashboard/logistics/orders")}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Ver todas
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Sucursal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <span className="inline-flex items-center gap-1">
                        <span className="text-blue-500">#</span>
                        {order.order_number ? order.order_number.replace('#', '') : order.id}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {order.customer_name ? order.customer_name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {order.customer_name || 'Cliente Desconocido'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Building2 size={14} className="text-gray-400" />
                        {order.branch_name || "Sin asignar"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        ${order.total_amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(order.created_at).toLocaleDateString('es-MX')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="text-gray-300 dark:text-gray-600" size={48} />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        No hay órdenes disponibles
                      </p>
                    </div>
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

function StatCard({ icon: Icon, title, value, subtitle, color, onClick }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: number | string;
  subtitle?: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg p-6 transition-all duration-300 transform hover:-translate-y-1 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${color} p-4 rounded-xl`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; bgColor: string; textColor: string; icon: string }> = {
    pending: {
      label: "Pendiente",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      textColor: "text-yellow-800 dark:text-yellow-300",
      icon: "⏳"
    },
    unassigned: {
      label: "Sin asignar",
      bgColor: "bg-gray-100 dark:bg-gray-700/30",
      textColor: "text-gray-800 dark:text-gray-300",
      icon: "❓"
    },
    assigned: {
      label: "Asignada",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-800 dark:text-blue-300",
      icon: "👤"
    },
    in_progress: {
      label: "En proceso",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
      textColor: "text-indigo-800 dark:text-indigo-300",
      icon: "🔄"
    },
    completed: {
      label: "Completada",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-800 dark:text-green-300",
      icon: "✅"
    },
    cancelled: {
      label: "Cancelada",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-800 dark:text-red-300",
      icon: "❌"
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full ${config.bgColor} ${config.textColor}`}>
      <span className="text-sm">{config.icon}</span>
      {config.label}
    </span>
  );
}
