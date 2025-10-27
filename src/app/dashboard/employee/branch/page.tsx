"use client";

import { useRequireAuth } from "@/contexts/AuthContext";
import { Store, MapPin, Phone, Users, Package, Clock, TrendingUp } from "lucide-react";

export default function EmployeeBranchPage() {
  const { user, loading } = useRequireAuth(["empleado", "employee"]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando información...</p>
        </div>
      </div>
    );
  }

  const branch = user?.branch;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl p-8">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-xl">
            <Store size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {branch?.name || "Mi Sucursal"}
            </h1>
            <p className="text-white/80">Información de tu lugar de trabajo</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Información de Contacto
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-primary flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Dirección</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {branch?.address || "No especificada"}
                  </p>
                  {branch?.city && branch?.state && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {branch.city}, {branch.state}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="text-primary flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Teléfono</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {branch?.phone || "No especificado"}
                  </p>
                </div>
              </div>

              {branch?.manager_name && (
                <div className="flex items-center gap-3">
                  <Users className="text-primary flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Gerente</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {branch.manager_name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Branch Hours */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Horarios de Atención
            </h2>
            <div className="space-y-3">
              {[
                { day: "Lunes - Viernes", hours: "9:00 AM - 6:00 PM" },
                { day: "Sábado", hours: "9:00 AM - 2:00 PM" },
                { day: "Domingo", hours: "Cerrado" },
              ].map((schedule, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <span className="text-gray-700 dark:text-gray-200">{schedule.day}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">{schedule.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="text-blue-600" size={24} />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Órdenes del Mes</h3>
            </div>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">156</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">+12% vs mes anterior</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-green-600" size={24} />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Ventas Totales</h3>
            </div>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">$45,280</p>
            <p className="text-sm text-green-600 dark:text-green-400">+8% vs mes anterior</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-purple-600" size={24} />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Equipo</h3>
            </div>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-2">8</p>
            <p className="text-sm text-purple-600 dark:text-purple-400">Empleados activos</p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-orange-600" size={24} />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Tiempo Promedio</h3>
            </div>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 mb-2">2.5h</p>
            <p className="text-sm text-orange-600 dark:text-orange-400">Por orden completada</p>
          </div>
        </div>
      </div>
    </div>
  );
}
