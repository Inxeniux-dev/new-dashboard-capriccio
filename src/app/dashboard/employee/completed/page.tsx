"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { CheckCircle, Eye, Calendar, User, X, ShoppingCart } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Order } from "@/types/api";

export default function EmployeeCompletedPage() {
  const { user, loading } = useRequireAuth(["empleado", "employee"]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (user?.branch_id) {
      loadCompletedOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCompletedOrders = async () => {
    try {
      setLoadingData(true);

      if (!user?.branch_id) return;

      const response = await apiClient.orders.getByBranch(user.branch_id, {
        limit: 100
      });

      // Filtrar solo las completadas
      const completedOrders = (response.data || []).filter(o => o.status === "completed");
      setOrders(completedOrders);
    } catch (error) {
      console.error("Error loading completed orders:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando órdenes completadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <CheckCircle className="text-green-500" size={32} />
          Órdenes Completadas
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Historial de órdenes completadas en {user?.branch?.name || "tu sucursal"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">Total Completadas</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">{orders.length}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">Completadas Hoy</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {orders.filter(o => {
              if (!o.completed_date) return false;
              const today = new Date().toDateString();
              return new Date(o.completed_date).toDateString() === today;
            }).length}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">Total Facturado</p>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
            ${orders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha Completada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="font-medium text-gray-800 dark:text-gray-100">
                          {order.order_number || `#${order.id}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {order.customer_name || "Cliente"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer_phone}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar size={14} />
                        {order.completed_date
                          ? new Date(order.completed_date).toLocaleDateString("es-ES")
                          : "N/A"
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-gray-800 dark:text-gray-100">
                        ${order.total_amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
                      >
                        <Eye size={14} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={64} />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No hay órdenes completadas</p>
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
                Productos
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

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Total:</span>
                  <span className="text-2xl font-bold text-green-600">${selectedOrder.total_amount.toFixed(2)}</span>
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
