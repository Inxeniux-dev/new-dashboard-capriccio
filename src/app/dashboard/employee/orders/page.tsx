"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { Package, Eye, Clock, MapPin, User, Phone, X, ShoppingCart, Info } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Order } from "@/types/api";

export default function EmployeeOrdersPage() {
  const { user, loading } = useRequireAuth(["empleado", "employee"]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (user?.branch_id) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filterStatus]);

  const loadOrders = async () => {
    try {
      setLoadingData(true);

      // Cargar órdenes de la sucursal del empleado
      if (!user?.branch_id) return;

      const response = await apiClient.orders.getByBranch(user.branch_id, {
        limit: 100
      });

      let ordersData = response.data || [];

      // Filtrar por estado si es necesario
      if (filterStatus !== "all") {
        ordersData = ordersData.filter(o => o.status === filterStatus);
      }

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
      assigned: { label: "Asignada", color: "bg-blue-100 text-blue-800" },
      in_progress: { label: "En Proceso", color: "bg-indigo-100 text-indigo-800" },
      completed: { label: "Completada", color: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Mis Órdenes</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Órdenes asignadas a {user?.branch?.name || "tu sucursal"}
          </p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700"
        >
          <option value="all">Todas</option>
          <option value="assigned">Asignadas</option>
          <option value="in_progress">En Proceso</option>
          <option value="completed">Completadas</option>
        </select>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
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
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone size={14} />
                  <span>{order.customer_phone}</span>
                </div>
                {order.delivery_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock size={14} />
                    <span>{new Date(order.delivery_date).toLocaleDateString("es-ES")}</span>
                  </div>
                )}
                {order.delivery_address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin size={14} />
                    <span className="truncate">{order.delivery_address}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-lg font-bold text-primary">
                  ${order.total_amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleViewDetails(order)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <Eye size={16} />
                  Ver Detalle
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Package className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={64} />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No hay órdenes {filterStatus !== "all" ? filterStatus : ""}</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Detalle de la Orden</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedOrder.order_number || `#${selectedOrder.id}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedOrder(null);
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
                Información del Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Nombre:</span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                    {selectedOrder.customer_name || "No especificado"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Teléfono:</span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                    {selectedOrder.customer_phone}
                  </span>
                </div>
                {selectedOrder.delivery_address && (
                  <div className="col-span-2">
                    <span className="text-gray-600 dark:text-gray-300">Dirección:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                      {selectedOrder.delivery_address}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                <ShoppingCart size={18} />
                Productos ({selectedOrder.items?.length || selectedOrder.products?.length || 0})
              </h3>
              <div className="space-y-2">
                {((selectedOrder.items || selectedOrder.products || []) as Array<{product_name?: string; name?: string; quantity?: number; unit_price?: number; price?: number}>).map((item, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {item.product_name || item.name || "Producto"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Cantidad: {item.quantity || 1}
                      </p>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-100">
                      ${((item.unit_price || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                <Info size={18} />
                Información de la Orden
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Estado:</span>
                  <span className="ml-2">{getStatusBadge(selectedOrder.status)}</span>
                </div>
                {selectedOrder.delivery_date && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Fecha de entrega:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                      {new Date(selectedOrder.delivery_date).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-gray-600 dark:text-gray-300">Total:</span>
                  <span className="ml-2 text-xl font-bold text-primary">
                    ${selectedOrder.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedOrder(null);
              }}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
