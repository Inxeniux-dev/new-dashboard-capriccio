"use client";

import {
  X, User, Phone, Mail, MapPin, Calendar, Package,
  ShoppingCart, DollarSign, Info, Clock, Store,
  CheckCircle2, AlertCircle, XCircle, PlayCircle,
  Truck, FileText
} from "lucide-react";
import type { Order } from "@/types/api";
import { normalizeOrderItems, printOrderValidation } from "@/utils/testOrderData";
import { useEffect } from "react";

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  // Validar y normalizar items cuando se abre el modal
  useEffect(() => {
    if (order) {
      console.log('📦 Orden completa recibida:', order);
      console.log('📦 order.items:', order.items);
      console.log('📦 order.products:', order.products);
      console.log('📦 order.order_items:', order.order_items);
      printOrderValidation(order);
    }
  }, [order]);

  if (!order) return null;

  const parseDeliveryDate = (dateString: string): string => {
    if (!dateString) return "";
    const [datePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
      pending: {
        label: "Pendiente",
        color: "text-amber-700 dark:text-amber-400",
        bgColor: "bg-amber-100 dark:bg-amber-900/30",
        icon: <AlertCircle className="w-5 h-5" />
      },
      assigned: {
        label: "Asignada",
        color: "text-blue-700 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        icon: <Truck className="w-5 h-5" />
      },
      in_progress: {
        label: "En Proceso",
        color: "text-indigo-700 dark:text-indigo-400",
        bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
        icon: <PlayCircle className="w-5 h-5" />
      },
      completed: {
        label: "Completada",
        color: "text-green-700 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        icon: <CheckCircle2 className="w-5 h-5" />
      },
      cancelled: {
        label: "Cancelada",
        color: "text-red-700 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        icon: <XCircle className="w-5 h-5" />
      }
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(order.status);

  // Usar la función de normalización para obtener items en formato correcto
  const orderItems = normalizeOrderItems(order);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {order.order_number || `Orden #${order.id}`}
              </h2>
              <div className={`flex items-center gap-2 ${statusConfig.bgColor} ${statusConfig.color} px-3 py-1.5 rounded-lg w-fit`}>
                {statusConfig.icon}
                <span className="text-sm font-medium">{statusConfig.label}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-5 bg-gray-50 dark:bg-gray-900">
          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-base text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={<User className="w-4 h-4" />}
                label="Nombre"
                value={order.customer_name || "No especificado"}
              />
              <InfoItem
                icon={<Phone className="w-4 h-4" />}
                label="Teléfono"
                value={order.customer_phone}
              />
              {order.customer_email && (
                <InfoItem
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={order.customer_email}
                />
              )}
              {order.delivery_address && (
                <div className="md:col-span-2">
                  <InfoItem
                    icon={<MapPin className="w-4 h-4" />}
                    label="Dirección de Entrega"
                    value={order.delivery_address}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-base text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              Información de la Orden
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.delivery_date && (
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Fecha de Entrega"
                  value={parseDeliveryDate(order.delivery_date)}
                />
              )}
              {order.branch_name && (
                <InfoItem
                  icon={<Store className="w-4 h-4" />}
                  label="Sucursal"
                  value={order.branch_name}
                />
              )}
              {order.created_at && (
                <InfoItem
                  icon={<Clock className="w-4 h-4" />}
                  label="Fecha de Creación"
                  value={new Date(order.created_at).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}
                />
              )}
              {order.payment_method && (
                <InfoItem
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Método de Pago"
                  value={order.payment_method}
                />
              )}
            </div>
          </div>

          {/* Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-base text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              Productos Solicitados ({orderItems.length})
            </h3>
            <div className="space-y-3">
              {orderItems.length === 0 ? (
                <div className="text-center py-8 px-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-lg">
                  <Package className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <p className="text-amber-800 dark:text-amber-300 font-semibold mb-2">
                    ⚠️ No se encontraron productos
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
                    El backend no está enviando información de productos para esta orden.
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    Abre la consola del navegador (F12) para ver los detalles técnicos.
                  </p>
                </div>
              ) : (
                orderItems.map((item, index) => {
                const itemPrice = item.unit_price;
                const itemQuantity = item.quantity;
                const itemTotal = item.subtotal;
                const itemNotes = item.notes;

                return (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="bg-primary/10 rounded-lg p-2.5 mt-0.5">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                              {item.product_name}
                            </p>

                            {/* Product Details Grid */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad</p>
                                <p className="font-medium text-gray-700 dark:text-gray-200">
                                  {itemQuantity} {itemQuantity > 1 ? 'unidades' : 'unidad'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Precio Unitario</p>
                                <p className="font-medium text-gray-700 dark:text-gray-200">
                                  ${itemPrice.toFixed(2)}
                                </p>
                              </div>
                              {item.product_id && item.product_id !== `unknown-${index}` && (
                                <div className="col-span-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">ID del Producto</p>
                                  <p className="font-mono text-xs text-gray-600 dark:text-gray-300">
                                    {item.product_id}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Product Notes if any */}
                            {itemNotes && (
                              <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
                                <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">
                                  📝 Nota del producto:
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{itemNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subtotal</p>
                          <p className="text-xl font-bold text-primary">
                            ${itemTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })
              )}

              {/* Total Summary */}
              {orderItems.length > 0 && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total de Productos:
                    </span>
                    <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} unidades
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {(order.notes || order.logistics_notes) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-base text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Notas
              </h3>
              <div className="space-y-3">
                {order.notes && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notas del Cliente:</p>
                    <p className="text-sm text-gray-800 dark:text-gray-100">{order.notes}</p>
                  </div>
                )}
                {order.logistics_notes && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notas de Logística:</p>
                    <p className="text-sm text-gray-800 dark:text-gray-100">{order.logistics_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Total */}
        <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Total de la Orden</span>
            <span className="text-3xl font-bold text-primary">${order.total_amount.toFixed(2)}</span>
          </div>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-600 dark:text-gray-400 mt-1">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <p className="font-medium text-gray-800 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}
