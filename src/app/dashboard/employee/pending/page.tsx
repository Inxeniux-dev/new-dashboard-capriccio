"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { Clock, Eye, MapPin, Phone, ArrowRight, X, ShoppingCart, User } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Order } from "@/types/api";

export default function EmployeePendingPage() {
  const { user, loading } = useRequireAuth(["empleado", "employee"]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (user?.branch_id) {
      loadPendingOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPendingOrders = async () => {
    try {
      setLoadingData(true);

      if (!user?.branch_id) return;

      const response = await apiClient.orders.getByBranch(user.branch_id, {
        limit: 100
      });

      // Filtrar solo las pendientes (assigned o in_progress)
      const pendingOrders = (response.data || []).filter(
        o => o.status === "assigned" || o.status === "in_progress"
      );
      setOrders(pendingOrders);
    } catch (error) {
      console.error("Error loading pending orders:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateStatus = async (orderId: string | number, newStatus: string) => {
    try {
      await apiClient.orders.updateStatus(String(orderId), {
        status: newStatus as "pending" | "assigned" | "in_progress" | "completed" | "cancelled",
      });
      alert(`Estado actualizado a: ${newStatus === "in_progress" ? "En Proceso" : "Completada"}`);
      loadPendingOrders();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error al actualizar el estado");
    }
  };

  // Función para parsear fecha de entrega sin problemas de zona horaria
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

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando órdenes pendientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <Clock className="text-orange-500" size={32} />
          Órdenes Pendientes
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Órdenes asignadas que requieren atención
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-2">Pendientes</p>
          <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
            {orders.filter(o => o.status === "assigned").length}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">En Proceso</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {orders.filter(o => o.status === "in_progress").length}
          </p>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  order.status === "assigned"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {order.status === "assigned" ? "Asignada" : "En Proceso"}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone size={14} />
                  <span>{order.customer_phone}</span>
                </div>
                {order.delivery_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock size={14} />
                    <span>Entrega: {parseDeliveryDate(order.delivery_date)}</span>
                  </div>
                )}
                {order.delivery_address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin size={14} />
                    <span className="line-clamp-1">{order.delivery_address}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 gap-2">
                <span className="text-lg font-bold text-primary">
                  ${order.total_amount.toFixed(2)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailsModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    <Eye size={14} />
                    Ver
                  </button>
                  {order.status === "assigned" && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, "in_progress")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <ArrowRight size={14} />
                      Iniciar
                    </button>
                  )}
                  {order.status === "in_progress" && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, "completed")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Completar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Clock className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={64} />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No hay órdenes pendientes</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
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

            {/* Customer Info */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                <User size={18} />
                Cliente
              </h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600 dark:text-gray-300">Nombre:</span> <span className="font-medium text-gray-800 dark:text-gray-100">{selectedOrder.customer_name}</span></p>
                <p><span className="text-gray-600 dark:text-gray-300">Teléfono:</span> <span className="font-medium text-gray-800 dark:text-gray-100">{selectedOrder.customer_phone}</span></p>
                {selectedOrder.delivery_address && (
                  <p><span className="text-gray-600 dark:text-gray-300">Dirección:</span> <span className="font-medium text-gray-800 dark:text-gray-100">{selectedOrder.delivery_address}</span></p>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                <ShoppingCart size={18} />
                Productos
              </h3>
              <div className="space-y-2">
                {((selectedOrder.items || selectedOrder.products || []) as Array<{product_name?: string; name?: string; quantity?: number; unit_price?: number; price?: number}>).map((item, index: number) => (
                  <div key={index} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{item.product_name || item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">x{item.quantity || 1}</p>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-100">
                      ${((item.unit_price || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="font-semibold text-gray-800 dark:text-gray-100">Total:</span>
                <span className="text-2xl font-bold text-primary">${selectedOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedOrder(null);
              }}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
