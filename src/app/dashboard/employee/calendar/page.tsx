"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { Calendar, Package, MapPin, Clock, ChevronLeft, ChevronRight, Truck, Eye, X, User, ShoppingCart, Info } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Order } from "@/types/api";

export default function EmployeeCalendarPage() {
  const { user, loading } = useRequireAuth(["empleado", "employee"]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoadingData(true);

      // Solo cargar ordenes de la sucursal del empleado
      if (!user?.branch_id) {
        setOrders([]);
        return;
      }

      const ordersResponse = await apiClient.orders.getByBranch(user.branch_id, {
        limit: 200
      }).catch((error) => {
        if (error.status !== 401 && error.details !== "auth_redirect") {
          console.error("Error loading orders:", error);
        }
        return { data: [] };
      });

      const ordersData = ordersResponse.data || [];

      // Filtrar ordenes con fecha de entrega
      const ordersWithDelivery = ordersData.filter((o: Order) => o.delivery_date);

      setOrders(ordersWithDelivery);
    } catch (error) {
      const err = error as { status?: number; details?: string };
      if (err.status !== 401 && err.details !== "auth_redirect") {
        console.error("Error loading calendar data:", error);
      }
    } finally {
      setLoadingData(false);
    }
  }, [user?.branch_id]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [currentMonth, user, loadData]);

  // Parsear fechas sin problemas de zona horaria
  const parseLocalDate = (dateString: string): Date => {
    const [datePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Agregar dias vacios al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Agregar dias del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getOrdersForDate = (date: Date) => {
    return orders.filter(order => {
      if (!order.delivery_date) return false;
      const deliveryDate = parseLocalDate(order.delivery_date);
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

  const handleViewDetails = (order: Order) => {
    setDetailOrder(order);
    setShowDetailsModal(true);
  };

  const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Calendario de Entregas</h1>
          <p className="text-gray-600 dark:text-gray-300">Vista mensual de entregas programadas</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Package className="text-blue-600 dark:text-blue-400" size={18} />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {user?.branch?.name || `Sucursal ${user?.branch_id || "No asignada"}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-200"
            >
              <ChevronLeft size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 capitalize">
              {formatMonthYear(currentMonth)}
            </h2>

            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-300 py-2">
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
                    ${isToday(date) ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-gray-200 dark:border-gray-700"}
                    ${isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-md"}
                    ${dayOrders.length > 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-700"}
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className={`text-sm font-semibold ${isToday(date) ? "text-primary" : "text-gray-700 dark:text-gray-200"}`}>
                      {date.getDate()}
                    </span>

                    {dayOrders.length > 0 && (
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="bg-primary text-white text-xs rounded-full px-2 py-1">
                          {dayOrders.length} {dayOrders.length === 1 ? "entrega" : "entregas"}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
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
                  <DeliveryCard key={order.id} order={order} onViewDetails={handleViewDetails} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Truck className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400">No hay entregas programadas</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">
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
            const date = parseLocalDate(o.delivery_date);
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
            return parseLocalDate(o.delivery_date).toDateString() === new Date().toDateString();
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

      {/* Order Details Modal - Simplified version */}
      {showDetailsModal && detailOrder && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Detalle de la Orden</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {detailOrder.order_number || `#${detailOrder.id}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailOrder(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                <User size={18} />
                Informacion del Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Nombre:</span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                    {detailOrder.customer_name || "No especificado"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Telefono:</span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                    {detailOrder.customer_phone || "No especificado"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600 dark:text-gray-300">Direccion de entrega:</span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                    {detailOrder.delivery_address || "No especificada"}
                  </span>
                </div>
              </div>
            </div>

            {/* Products List */}
            {detailOrder.items && detailOrder.items.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <ShoppingCart size={18} />
                  Productos ({detailOrder.items.length})
                </h3>
                <div className="space-y-2">
                  {detailOrder.items.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{item.product_name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {item.quantity} x ${item.unit_price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-bold text-primary">${item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">Total:</span>
                  <span className="text-xl font-bold text-primary">
                    ${detailOrder.total_amount.toFixed(2)} MXN
                  </span>
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                <Info size={18} />
                Informacion de la Orden
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Estado:</span>
                  <span className="ml-2">
                    <StatusBadge status={detailOrder.status} />
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Fecha de creacion:</span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                    {new Date(detailOrder.created_at).toLocaleString("es-ES")}
                  </span>
                </div>
                {detailOrder.delivery_date && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Fecha de entrega:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                      {new Date(detailOrder.delivery_date).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                )}
                {detailOrder.payment_method && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Metodo de pago:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-100 capitalize">
                      {detailOrder.payment_method}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailOrder(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeliveryCard({ order, onViewDetails }: { order: Order; onViewDetails: (order: Order) => void }) {
  const customerName = order.customer_name || "Cliente";

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-700">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            {order.order_number || `#${order.id}`}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{customerName}</p>
        </div>
        <span className="font-bold text-gray-800 dark:text-gray-100">
          ${order.total_amount.toFixed(2)}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        {order.delivery_address && (
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
            <MapPin size={14} className="mt-0.5" />
            <span className="text-xs">{order.delivery_address}</span>
          </div>
        )}

        {order.delivery_date && order.delivery_date.includes('T') && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Clock size={14} />
            <span>
              {new Date(order.delivery_date).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Package size={14} />
          <span>
            {order.items?.length || 0} productos
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 gap-2">
        <StatusBadge status={order.status} />
        <button
          onClick={() => onViewDetails(order)}
          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 rounded-lg transition-colors font-medium flex items-center justify-center gap-1 text-xs"
        >
          <Eye size={14} />
          Ver Detalle
        </button>
      </div>
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200" },
    unassigned: { label: "Sin asignar", color: "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-200" },
    assigned: { label: "Asignada", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200" },
    in_progress: { label: "En proceso", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200" },
    completed: { label: "Completada", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" },
    cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
}