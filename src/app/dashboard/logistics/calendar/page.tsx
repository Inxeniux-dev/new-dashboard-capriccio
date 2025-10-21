"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { Calendar, Package, MapPin, Clock, ChevronLeft, ChevronRight, Filter, Truck } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Order, Branch } from "@/types/api";

interface DayOrders {
  date: Date;
  orders: Order[];
}

export default function LogisticsCalendarPage() {
  const { loading } = useRequireAuth(["logistics", "logistica", "admin"]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentMonth, selectedBranch]);

  const loadData = async () => {
    try {
      setLoadingData(true);

      // Cargar órdenes
      const ordersResponse = await apiClient.orders.getAll({ limit: 200 }) as { data?: Order[]; orders?: Order[] };
      const ordersData = ordersResponse.orders || ordersResponse.data || [];

      // Filtrar órdenes con fecha de entrega
      const ordersWithDelivery = ordersData.filter((o: Order) => o.delivery_date);

      // Filtrar por sucursal si es necesario
      const filteredOrders = selectedBranch === "all"
        ? ordersWithDelivery
        : ordersWithDelivery.filter((o: Order) => o.store_id === selectedBranch || o.branch_id === selectedBranch);

      setOrders(filteredOrders);

      // Cargar sucursales
      const branchesResponse = await apiClient.branches.getAll();
      setBranches(branchesResponse.data || []);
    } catch (error) {
      console.error("Error loading calendar data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Agregar días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Agregar días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getOrdersForDate = (date: Date) => {
    return orders.filter(order => {
      if (!order.delivery_date) return false;
      const deliveryDate = new Date(order.delivery_date);
      return (
        deliveryDate.getDate() === date.getDate() &&
        deliveryDate.getMonth() === date.getMonth() &&
        deliveryDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Calendario de Entregas</h1>
          <p className="text-gray-600">Vista mensual de entregas programadas</p>
        </div>

        <div className="flex items-center gap-3">
          <Filter size={18} className="text-gray-500" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            <option value="all">Todas las sucursales</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-800 capitalize">
              {formatMonthYear(currentMonth)}
            </h2>

            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-24" />;
              }

              const dayOrders = getOrdersForDate(date);
              const isSelected = selectedDate?.toDateString() === date.toDateString();

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    h-24 p-2 border rounded-lg transition-all
                    ${isToday(date) ? "border-primary bg-primary/5" : "border-gray-200"}
                    ${isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-md"}
                    ${dayOrders.length > 0 ? "bg-blue-50" : "bg-white"}
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className={`text-sm font-semibold ${isToday(date) ? "text-primary" : "text-gray-700"}`}>
                      {date.getDate()}
                    </span>

                    {dayOrders.length > 0 && (
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="bg-primary text-white text-xs rounded-full px-2 py-1">
                          {dayOrders.length} {dayOrders.length === 1 ? "entrega" : "entregas"}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          ${dayOrders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(0)}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-primary" size={20} />
            {selectedDate
              ? selectedDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long"
                })
              : "Selecciona una fecha"
            }
          </h3>

          {selectedDate ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {getOrdersForDate(selectedDate).length > 0 ? (
                getOrdersForDate(selectedDate).map((order) => (
                  <DeliveryCard key={order.id} order={order} branches={branches} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Truck className="text-gray-300 mx-auto mb-4" size={48} />
                  <p className="text-gray-500">No hay entregas programadas</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="text-gray-300 mx-auto mb-4" size={48} />
              <p className="text-gray-500">
                Selecciona una fecha del calendario para ver las entregas
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total del Mes"
          value={orders.length}
          subtitle="entregas programadas"
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Esta Semana"
          value={orders.filter(o => {
            if (!o.delivery_date) return false;
            const date = new Date(o.delivery_date);
            const now = new Date();
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            return date >= weekStart && date <= weekEnd;
          }).length}
          subtitle="entregas"
          icon={Calendar}
          color="bg-green-500"
        />
        <StatCard
          title="Hoy"
          value={orders.filter(o => {
            if (!o.delivery_date) return false;
            return new Date(o.delivery_date).toDateString() === new Date().toDateString();
          }).length}
          subtitle="entregas pendientes"
          icon={Clock}
          color="bg-orange-500"
        />
        <StatCard
          title="Valor Total"
          value={`$${orders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(0)}`}
          subtitle="en entregas"
          icon={Truck}
          color="bg-purple-500"
        />
      </div>
    </div>
  );
}

function DeliveryCard({ order, branches }: { order: Order; branches: Branch[] }) {
  const branch = branches.find(b => b.id === (order.store_id || order.branch_id));
  const customerName = order.customer_name || (typeof order.metadata?.customer_name === 'string' ? order.metadata.customer_name : '') || "Cliente";

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-gray-800">
            {order.order_number || order.message_id || `#${order.id}`}
          </p>
          <p className="text-sm text-gray-600">{customerName}</p>
        </div>
        <span className="font-bold text-gray-800">
          ${order.total_amount.toFixed(2)}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        {branch && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={14} />
            <span>{branch.name}</span>
          </div>
        )}

        {order.delivery_address && (
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin size={14} className="mt-0.5" />
            <span className="text-xs">{order.delivery_address}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={14} />
          <span>
            {order.delivery_date &&
              new Date(order.delivery_date).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit"
              })
            }
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Package size={14} />
          <span>
            {order.items?.length || order.order_items?.length || order.products?.length || 0} productos
          </span>
        </div>
      </div>

      <StatusBadge status={order.status} className="mt-2" />
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    pending_logistics: { label: "Por Asignar", color: "bg-orange-100 text-orange-800" },
    assigned: { label: "Asignada", color: "bg-blue-100 text-blue-800" },
    in_progress: { label: "En proceso", color: "bg-indigo-100 text-indigo-800" },
    completed: { label: "Completada", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${config.color} ${className}`}>
      {config.label}
    </span>
  );
}