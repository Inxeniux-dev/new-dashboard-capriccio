"use client";

import { useState } from "react";
import {
  Clock, MapPin, Phone, Package, Eye,
  ChevronRight, AlertCircle, CheckCircle2,
  PlayCircle, XCircle, Sparkles
} from "lucide-react";
import type { Order } from "@/types/api";

interface KanbanColumn {
  id: string;
  title: string;
  status: string[];
  color: string;
  icon: React.ReactNode;
  emptyMessage: string;
}

interface KanbanBoardProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  loading?: boolean;
}

const columns: KanbanColumn[] = [
  {
    id: "pending",
    title: "Pendientes",
    status: ["pending", "assigned"],
    color: "from-amber-500 to-orange-500",
    icon: <AlertCircle className="w-5 h-5" />,
    emptyMessage: "No hay órdenes pendientes"
  },
  {
    id: "in_progress",
    title: "En Proceso",
    status: ["in_progress"],
    color: "from-blue-500 to-indigo-500",
    icon: <PlayCircle className="w-5 h-5" />,
    emptyMessage: "No hay órdenes en proceso"
  },
  {
    id: "completed",
    title: "Completadas",
    status: ["completed"],
    color: "from-green-500 to-emerald-500",
    icon: <CheckCircle2 className="w-5 h-5" />,
    emptyMessage: "No hay órdenes completadas"
  },
  {
    id: "cancelled",
    title: "Canceladas",
    status: ["cancelled"],
    color: "from-red-500 to-rose-500",
    icon: <XCircle className="w-5 h-5" />,
    emptyMessage: "No hay órdenes canceladas"
  }
];

export default function KanbanBoard({ orders, onViewDetails, loading = false }: KanbanBoardProps) {
  const getOrdersByColumn = (columnStatuses: string[]) => {
    return orders.filter(order => columnStatuses.includes(order.status));
  };

  const parseDeliveryDate = (dateString: string): string => {
    if (!dateString) return "";
    const [datePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  const isUrgent = (order: Order): boolean => {
    if (!order.delivery_date) return false;
    const [datePart] = order.delivery_date.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const deliveryDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1 && diffDays >= 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando tablero...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        {columns.map((column) => {
          const columnOrders = getOrdersByColumn(column.status);

          return (
            <div
              key={column.id}
              className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 min-h-0"
            >
              {/* Column Header - Fixed */}
              <div className={`bg-gradient-to-r ${column.color} text-white p-4 flex items-center justify-between flex-shrink-0`}>
                <div className="flex items-center gap-2">
                  {column.icon}
                  <h3 className="font-bold text-lg">{column.title}</h3>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="font-bold text-sm">{columnOrders.length}</span>
                </div>
              </div>

              {/* Column Content - Scrollable */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto overflow-x-hidden">
                {columnOrders.length > 0 ? (
                  columnOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onViewDetails={onViewDetails}
                      isUrgent={isUrgent(order)}
                      parseDeliveryDate={parseDeliveryDate}
                      columnColor={column.color}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-300 dark:text-gray-600 mb-2">
                      {column.icon}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {column.emptyMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  isUrgent: boolean;
  parseDeliveryDate: (date: string) => string;
  columnColor: string;
}

function OrderCard({ order, onViewDetails, isUrgent, parseDeliveryDate, columnColor }: OrderCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-transparent
        hover:border-primary hover:shadow-lg
        transition-all duration-200 cursor-pointer
        ${isUrgent ? 'ring-2 ring-red-400 ring-offset-2 dark:ring-offset-gray-900' : ''}
      `}
    >
      {/* Urgent Banner */}
      {isUrgent && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 text-xs font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          URGENTE - Entrega Próxima
        </div>
      )}

      <div className="p-4">
        {/* Order Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <p className="font-bold text-gray-800 dark:text-gray-100 mb-1">
              {order.order_number || `#${order.id}`}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {order.customer_name || "Cliente"}
            </p>
          </div>
          <div className={`bg-gradient-to-r ${columnColor} rounded-full p-2 text-white`}>
            <Package className="w-4 h-4" />
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{order.customer_phone}</span>
          </div>

          {order.delivery_date && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{parseDeliveryDate(order.delivery_date)}</span>
            </div>
          )}

          {order.delivery_address && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{order.delivery_address}</span>
            </div>
          )}
        </div>

        {/* Products Count */}
        {(order.items?.length || order.products?.length) && (
          <div className="mb-3 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
            {order.items?.length || order.products?.length} producto(s)
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
            ${order.total_amount.toFixed(2)}
          </span>
          <button
            onClick={() => onViewDetails(order)}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-sm
              bg-gradient-to-r ${columnColor} text-white
              hover:shadow-md transform hover:scale-105
              transition-all duration-200
            `}
          >
            <Eye className="w-4 h-4" />
            {isHovered && <span>Ver</span>}
            <ChevronRight className={`w-4 h-4 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
