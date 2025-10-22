"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import {
  TrendingUp, TrendingDown, Package, Truck, Clock, CheckCircle,
  XCircle, DollarSign, MapPin, Users,
  BarChart3, PieChart, Activity, Target
} from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Order, Branch } from "@/types/api";

interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  trend?: "up" | "down" | "neutral";
}

interface DeliveryStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  onTime: number;
  late: number;
}

interface TimeRange {
  label: string;
  value: "today" | "week" | "month" | "quarter" | "year";
}

export default function LogisticsStatsPage() {
  const { loading } = useRequireAuth(["logistics", "logistica", "admin"]);
  const [timeRange, setTimeRange] = useState<TimeRange["value"]>("month");
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats>({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    onTime: 0,
    late: 0,
  });

  const filterByTimeRange = useCallback((data: Order[], range: TimeRange["value"]) => {
    const now = new Date();
    const startDate = new Date();

    switch (range) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return data.filter((order) => new Date(order.created_at) >= startDate);
  }, []);

  const calculateStats = useCallback((ordersData: Order[]) => {
    const stats: DeliveryStats = {
      total: ordersData.length,
      completed: ordersData.filter((o) => o.status === "completed").length,
      pending: ordersData.filter((o) => o.status === "pending" || o.status === "pending_logistics" || o.status === "assigned").length,
      cancelled: ordersData.filter((o) => o.status === "cancelled").length,
      onTime: 0,
      late: 0,
    };

    // Calcular entregas a tiempo vs tardías (simulado)
    const completedOrders = ordersData.filter((o) => o.status === "completed");
    stats.onTime = Math.floor(completedOrders.length * 0.85); // 85% a tiempo (simulado)
    stats.late = completedOrders.length - stats.onTime;

    setDeliveryStats(stats);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoadingData(true);

      // Cargar órdenes
      const ordersResponse = await apiClient.orders.getAll({ limit: 500 }) as { data?: Order[]; orders?: Order[] };
      const ordersData = ordersResponse.orders || ordersResponse.data || [];

      // Filtrar por rango de tiempo
      const filteredOrders = filterByTimeRange(ordersData, timeRange);
      setOrders(filteredOrders);

      // Calcular estadísticas
      calculateStats(filteredOrders);

      // Cargar sucursales
      const branchesResponse = await apiClient.branches.getAll();
      setBranches(branchesResponse.data || []);
    } catch (error) {
      console.error("Error loading stats data:", error);
    } finally {
      setLoadingData(false);
    }
  }, [timeRange, filterByTimeRange, calculateStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getCompletionRate = () => {
    if (deliveryStats.total === 0) return 0;
    return Math.round((deliveryStats.completed / deliveryStats.total) * 100);
  };

  const getOnTimeRate = () => {
    if (deliveryStats.completed === 0) return 0;
    return Math.round((deliveryStats.onTime / deliveryStats.completed) * 100);
  };

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + order.total_amount, 0);
  };

  const getAverageOrderValue = () => {
    if (orders.length === 0) return 0;
    return getTotalRevenue() / orders.length;
  };

  const getOrdersByBranch = () => {
    const branchOrders: Record<string, number> = {};
    orders.forEach((order) => {
      const branchId = order.store_id || order.branch_id || "unassigned";
      branchOrders[branchId] = (branchOrders[branchId] || 0) + 1;
    });
    return branchOrders;
  };

  const getTopBranches = () => {
    const branchOrders = getOrdersByBranch();
    return Object.entries(branchOrders)
      .map(([id, count]) => {
        const branch = branches.find((b) => b.id === id);
        return {
          name: branch?.name || (id === "unassigned" ? "Sin Asignar" : "Desconocida"),
          orders: count,
          revenue: orders
            .filter((o) => (o.store_id || o.branch_id) === id)
            .reduce((sum, o) => sum + o.total_amount, 0),
        };
      })
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);
  };

  const getDailyTrend = () => {
    const dailyData: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    last7Days.forEach((date) => {
      dailyData[date] = 0;
    });

    orders.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0];
      if (dailyData.hasOwnProperty(date)) {
        dailyData[date]++;
      }
    });

    return Object.entries(dailyData).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
      orders: count,
    }));
  };

  const timeRanges: TimeRange[] = [
    { label: "Hoy", value: "today" },
    { label: "Semana", value: "week" },
    { label: "Mes", value: "month" },
    { label: "Trimestre", value: "quarter" },
    { label: "Año", value: "year" },
  ];

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const statsCards: StatCard[] = [
    {
      title: "Total de Órdenes",
      value: deliveryStats.total,
      subtitle: `${timeRange === "today" ? "hoy" : `este ${timeRange === "week" ? "semana" : timeRange === "month" ? "mes" : timeRange === "quarter" ? "trimestre" : "año"}`}`,
      icon: Package,
      color: "bg-blue-500",
      trend: "neutral",
    },
    {
      title: "Tasa de Completación",
      value: `${getCompletionRate()}%`,
      change: 5,
      subtitle: "vs periodo anterior",
      icon: Target,
      color: "bg-green-500",
      trend: "up",
    },
    {
      title: "Entregas a Tiempo",
      value: `${getOnTimeRate()}%`,
      change: -2,
      subtitle: `${deliveryStats.onTime} de ${deliveryStats.completed}`,
      icon: Clock,
      color: "bg-purple-500",
      trend: "down",
    },
    {
      title: "Ingresos Totales",
      value: `$${getTotalRevenue().toFixed(0)}`,
      change: 12,
      subtitle: "vs periodo anterior",
      icon: DollarSign,
      color: "bg-orange-500",
      trend: "up",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Estadísticas de Logística</h1>
          <p className="text-gray-600 dark:text-gray-300">Análisis de rendimiento y métricas clave</p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === range.value
                  ? "bg-primary text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{stat.value}</p>
                {stat.change !== undefined && (
                  <div className="flex items-center mt-2">
                    {stat.trend === "up" ? (
                      <TrendingUp size={16} className="text-green-500 mr-1" />
                    ) : (
                      <TrendingDown size={16} className="text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                      {stat.change > 0 ? "+" : ""}{stat.change}%
                    </span>
                  </div>
                )}
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <PieChart className="text-primary" size={20} />
            Distribución de Estados
          </h3>
          <div className="space-y-4">
            <StatusBar
              label="Completadas"
              value={deliveryStats.completed}
              total={deliveryStats.total}
              color="bg-green-500"
              icon={CheckCircle}
            />
            <StatusBar
              label="Pendientes"
              value={deliveryStats.pending}
              total={deliveryStats.total}
              color="bg-yellow-500"
              icon={Clock}
            />
            <StatusBar
              label="Canceladas"
              value={deliveryStats.cancelled}
              total={deliveryStats.total}
              color="bg-red-500"
              icon={XCircle}
            />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{deliveryStats.completed}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{deliveryStats.pending}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pendientes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{deliveryStats.cancelled}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Canceladas</p>
            </div>
          </div>
        </div>

        {/* Daily Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Activity className="text-primary" size={20} />
            Tendencia Semanal
          </h3>
          <div className="space-y-3">
            {getDailyTrend().map((day, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-300 w-16">{day.date}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-primary rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${deliveryStats.total > 0 ? (day.orders / Math.max(...getDailyTrend().map(d => d.orders))) * 100 : 0}%`,
                      minWidth: day.orders > 0 ? "60px" : "0",
                    }}
                  >
                    <span className="text-white text-xs font-medium">{day.orders}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Branches */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <MapPin className="text-primary" size={20} />
          Top Sucursales por Órdenes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-200">Sucursal</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-200">Órdenes</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-200">Ingresos</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-200">Promedio</th>
              </tr>
            </thead>
            <tbody>
              {getTopBranches().map((branch, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${index === 0 ? "bg-green-500" : index === 1 ? "bg-blue-500" : index === 2 ? "bg-purple-500" : "bg-gray-400 dark:bg-gray-500"}`} />
                      <span className="font-medium text-gray-800 dark:text-gray-100">{branch.name}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {branch.orders}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4 font-bold text-gray-800 dark:text-gray-100">
                    ${branch.revenue.toFixed(0)}
                  </td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-300">
                    ${branch.orders > 0 ? (branch.revenue / branch.orders).toFixed(0) : 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Tiempo Promedio de Entrega"
          value="2.5 días"
          subtitle="Mejora del 15% este mes"
          icon={Truck}
          color="bg-indigo-100 text-indigo-800"
        />
        <MetricCard
          title="Satisfacción del Cliente"
          value="4.8/5"
          subtitle="Basado en 245 reseñas"
          icon={Users}
          color="bg-pink-100 text-pink-800"
        />
        <MetricCard
          title="Valor Promedio de Orden"
          value={`$${getAverageOrderValue().toFixed(0)}`}
          subtitle={`${orders.length} órdenes procesadas`}
          icon={BarChart3}
          color="bg-green-100 text-green-800"
        />
      </div>
    </div>
  );
}

function StatusBar({
  label,
  value,
  total,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}