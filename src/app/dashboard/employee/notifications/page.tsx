"use client";

import { useRequireAuth } from "@/contexts/AuthContext";
import { Bell, CheckCircle, AlertCircle, Info, Clock } from "lucide-react";
import { useState } from "react";

interface Notification {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function EmployeeNotificationsPage() {
  const { loading } = useRequireAuth(["empleado", "employee"]);
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Orden Completada",
      message: "Has completado la orden #ORD-2025-045 exitosamente",
      time: "Hace 5 minutos",
      read: false
    },
    {
      id: "2",
      type: "info",
      title: "Nueva Orden Asignada",
      message: "Se te ha asignado una nueva orden #ORD-2025-046",
      time: "Hace 1 hora",
      read: false
    },
    {
      id: "3",
      type: "warning",
      title: "Orden Urgente",
      message: "La orden #ORD-2025-044 requiere atención inmediata",
      time: "Hace 2 horas",
      read: true
    },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="text-green-500" size={24} />;
      case "warning": return <AlertCircle className="text-orange-500" size={24} />;
      case "info": return <Info className="text-blue-500" size={24} />;
      default: return <Bell className="text-gray-500" size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <Bell className="text-primary" size={32} />
            Notificaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Tienes {unreadCount} notificación{unreadCount !== 1 ? "es" : ""} sin leer
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg ${
              !notification.read ? "border-l-4 border-primary" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                      Nuevo
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock size={14} />
                  <span>{notification.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={64} />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No tienes notificaciones</p>
        </div>
      )}
    </div>
  );
}
