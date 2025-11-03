"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { LayoutGrid, Columns3, Store, Package, Phone, Clock, MapPin, Eye } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Order } from "@/types/api";
import KanbanBoard from "@/components/KanbanBoard";
import OrderDetailsModal from "@/components/OrderDetailsModal";

export default function EmployeeOrdersPage() {
  const { user, loading } = useRequireAuth(["empleado", "employee"]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "grid">("kanban");

  useEffect(() => {
    if (user?.branch_id) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoadingData(true);

      // Cargar órdenes de la sucursal del empleado
      if (!user?.branch_id) return;

      const response = await apiClient.orders.getByBranch(user.branch_id, {
        limit: 100
      });

      const ordersData = response.data || [];
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Mis Órdenes</h1>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg w-fit">
                <Store size={18} />
                <div>
                  <p className="text-xs text-white/70">Tu Sucursal</p>
                  <p className="font-bold">
                    {user?.branch?.name || `Sucursal ${user?.branch_id || "No asignada"}`}
                  </p>
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-white/20 backdrop-blur rounded-lg p-1">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
                  viewMode === "kanban"
                    ? "bg-white text-primary shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Columns3 size={18} />
                <span className="font-medium">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
                  viewMode === "grid"
                    ? "bg-white text-primary shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <LayoutGrid size={18} />
                <span className="font-medium">Cuadrícula</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <p className="text-xs text-white/80 mb-1">Pendientes</p>
              <p className="text-2xl font-bold">
                {orders.filter(o => o.status === "pending" || o.status === "assigned").length}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <p className="text-xs text-white/80 mb-1">En Proceso</p>
              <p className="text-2xl font-bold">
                {orders.filter(o => o.status === "in_progress").length}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <p className="text-xs text-white/80 mb-1">Completadas</p>
              <p className="text-2xl font-bold">
                {orders.filter(o => o.status === "completed").length}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <p className="text-xs text-white/80 mb-1">Total</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 p-6 min-h-0">
        {viewMode === "kanban" ? (
          <KanbanBoard
            orders={orders}
            onViewDetails={handleViewDetails}
            loading={loadingData}
          />
        ) : (
          <GridView orders={orders} onViewDetails={handleViewDetails} />
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

// Grid View Component
function GridView({ orders, onViewDetails }: { orders: Order[]; onViewDetails: (order: Order) => void }) {
  const parseDeliveryDate = (dateString: string): string => {
    if (!dateString) return "";
    const [datePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      assigned: { label: "Asignada", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      in_progress: { label: "En Proceso", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
      completed: { label: "Completada", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl px-8">
          <Package className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={64} />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No hay órdenes disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all border-2 border-transparent hover:border-primary"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                {order.order_number || `#${order.id}`}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {order.customer_name || "Cliente"}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4" />
              <span>{order.customer_phone}</span>
            </div>
            {order.delivery_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{parseDeliveryDate(order.delivery_date)}</span>
              </div>
            )}
            {order.delivery_address && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{order.delivery_address}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-lg font-bold text-primary">
              ${order.total_amount.toFixed(2)}
            </span>
            <button
              onClick={() => onViewDetails(order)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Eye className="w-4 h-4" />
              Ver Detalle
            </button>
          </div>
        </div>
        ))}
      </div>
    </div>
  );
}
