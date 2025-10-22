"use client";

import {
  Package,
  DollarSign,
  Users,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Bell,
  User,
  LucideIcon
} from "lucide-react";

const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  isPositive = true
}: {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  isPositive?: boolean;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <div className="flex items-center mt-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        </div>
      </div>
      <div className="p-3 bg-primary/10 rounded-lg">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
  </div>
);

const RecentOrder = ({
  id,
  customer,
  amount,
  status,
  platform
}: {
  id: string;
  customer: string;
  amount: string;
  status: 'Pendiente' | 'En Proceso' | 'Completado' | 'Entregado';
  platform: 'Instagram' | 'WhatsApp' | 'Messenger';
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'En Proceso': return 'bg-blue-100 text-blue-800';
      case 'Completado': return 'bg-green-100 text-green-800';
      case 'Entregado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'bg-pink-100 text-pink-800';
      case 'WhatsApp': return 'bg-green-100 text-green-800';
      case 'Messenger': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
        {id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
        {customer}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
        {amount}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlatformColor(platform)}`}>
          {platform}
        </span>
      </td>
    </tr>
  );
};

export default function DashboardPage() {
  const recentOrders = [
    { id: "PED-001", customer: "María García", amount: "$2,450", status: "Pendiente" as const, platform: "Instagram" as const },
    { id: "PED-002", customer: "Carlos López", amount: "$1,890", status: "En Proceso" as const, platform: "WhatsApp" as const },
    { id: "PED-003", customer: "Ana Martínez", amount: "$3,200", status: "Completado" as const, platform: "Messenger" as const },
    { id: "PED-004", customer: "Roberto Silva", amount: "$950", status: "Entregado" as const, platform: "Instagram" as const },
    { id: "PED-005", customer: "Laura Fernández", amount: "$1,650", status: "Pendiente" as const, platform: "WhatsApp" as const },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Bienvenido, Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Resumen de tu negocio hoy, {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">Admin</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Pedidos Hoy"
          value="15"
          change="+12%"
          icon={Package}
          isPositive={true}
        />
        <MetricCard
          title="Ingresos Mes"
          value="$45,320"
          change="+8.5%"
          icon={DollarSign}
          isPositive={true}
        />
        <MetricCard
          title="Clientes Nuevos"
          value="8"
          change="+4.2%"
          icon={Users}
          isPositive={true}
        />
        <MetricCard
          title="Mensajes Pendientes"
          value="23"
          change="Sin cambio"
          icon={MessageSquare}
          isPositive={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Pedidos Recientes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Plataforma
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentOrders.map((order) => (
                    <RecentOrder key={order.id} {...order} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Social Media Activity */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Actividad Redes Sociales</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                    <span className="text-pink-600 dark:text-pink-300 font-bold text-sm">IG</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-200">Instagram</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">12 mensajes</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-300 font-bold text-sm">WA</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-200">WhatsApp</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">8 mensajes</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-300 font-bold text-sm">FB</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-200">Messenger</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">3 mensajes</span>
              </div>
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Mensajes Recientes</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-pink-400 pl-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">@maria_chocolove</p>
                <p className="text-gray-900 dark:text-gray-100">¿Tienen chocolates sin azúcar?</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Instagram • hace 2 min</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Carlos López</p>
                <p className="text-gray-900 dark:text-gray-100">Quiero hacer un pedido para el sábado</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">WhatsApp • hace 5 min</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Ana Martínez</p>
                <p className="text-gray-900 dark:text-gray-100">¡Los truffles estuvieron increíbles!</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Messenger • hace 10 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}