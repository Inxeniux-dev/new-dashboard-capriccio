"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { Building2, MapPin, User, CheckCircle, XCircle, Package, TrendingUp, Info, ExternalLink } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Order, Branch } from "@/types/api";

interface BranchStats {
  totalOrders: number;
  pendingOrders: number;
  completedToday: number;
  revenue: number;
}

export default function LogisticsBranchesPage() {
  const { loading } = useRequireAuth(["logistics", "logistica", "admin"]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [branchStats, setBranchStats] = useState<Record<string, BranchStats>>({});

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoadingData(true);

      // Cargar sucursales desde iPOS locations
      const response = await apiClient.ipos.getLocations();
      console.log("iPOS locations response:", response);

      if (response.data && Array.isArray(response.data)) {
        setBranches(response.data);

        // Cargar estadísticas para cada sucursal
        const stats: Record<string, BranchStats> = {};
        for (const branch of response.data) {
          try {
            // Intentar obtener órdenes de la sucursal
            const ordersResponse = await apiClient.orders.getByBranch(branch.id, {
              limit: 100
            });

            const orders = ordersResponse.data || [];
            const today = new Date().toDateString();

            stats[branch.id] = {
              totalOrders: orders.length,
              pendingOrders: orders.filter((o: Order) =>
                o.status === "pending" || o.status === "assigned" || o.status === "in_progress"
              ).length,
              completedToday: orders.filter((o: Order) => {
                if (o.status !== "completed") return false;
                const completedDate = o.completed_date ? new Date(o.completed_date).toDateString() : null;
                return completedDate === today;
              }).length,
              revenue: orders
                .filter((o: Order) => o.status === "completed")
                .reduce((sum: number, o: Order) => sum + (o.total_amount || 0), 0)
            };
          } catch (error) {
            console.error(`Error loading stats for branch ${branch.id}:`, error);
            stats[branch.id] = {
              totalOrders: 0,
              pendingOrders: 0,
              completedToday: 0,
              revenue: 0
            };
          }
        }

        setBranchStats(stats);
      }
    } catch (error) {
      console.error("Error loading branches:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando sucursales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Sucursales</h1>
          <p className="text-gray-600 dark:text-gray-300">Vista y estadísticas de sucursales</p>
        </div>
      </div>

      {/* Mensaje Informativo */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <Info className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
            Información de Sucursales desde iPOS
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Las sucursales mostradas aquí son sincronizadas automáticamente desde el sistema iPOS.
            Para gestionar sucursales (agregar, editar o eliminar), debe hacerlo desde el portal de iPOS.
          </p>
          <a
            href="https://ipos.capriccio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
          >
            Ir al portal de iPOS
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          title="Total Sucursales"
          value={branches.length}
          color="bg-blue-500"
        />
        <StatCard
          icon={CheckCircle}
          title="Activas"
          value={branches.filter(b => b.active).length}
          color="bg-green-500"
        />
        <StatCard
          icon={Package}
          title="Órdenes Pendientes"
          value={Object.values(branchStats).reduce((sum, s) => sum + s.pendingOrders, 0)}
          color="bg-orange-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Completadas Hoy"
          value={Object.values(branchStats).reduce((sum, s) => sum + s.completedToday, 0)}
          color="bg-purple-500"
        />
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch, index) => (
          <BranchCard
            key={`branch-${branch.id}-${index}`}
            branch={branch}
            stats={branchStats[branch.id]}
          />
        ))}
      </div>

      {branches.length === 0 && !loadingData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
          <Building2 className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No hay sucursales</h3>
          <p className="text-gray-500 dark:text-gray-400">Las sucursales aparecerán aquí cuando estén disponibles</p>
        </div>
      )}
    </div>
  );
}

interface BranchCardProps {
  branch: Branch;
  stats?: BranchStats;
}

function BranchCard({ branch, stats }: BranchCardProps) {
  const isActive = branch.active;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Header */}
      <div className={`p-4 ${isActive ? "bg-gradient-to-r from-primary to-primary-hover" : "bg-gray-400"}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Building2 className="text-white" size={24} />
            </div>
            <div className="text-white">
              <h3 className="font-bold text-lg">{branch.name}</h3>
              <p className="text-sm opacity-90">ID: {branch.id}</p>
            </div>
          </div>
          <StatusBadge status={isActive ? "ACTIVA" : "INACTIVA"} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Branch Details */}
        <div className="space-y-2">
          <DetailRow icon={MapPin} label="Dirección" value={branch.address} />
          {branch.city && <DetailRow icon={Building2} label="Ciudad" value={branch.city} />}
          {branch.manager_name && <DetailRow icon={User} label="Encargado" value={branch.manager_name} />}
        </div>

        {/* Stats */}
        {stats && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Estadísticas</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Total Órdenes</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{stats.totalOrders}</p>
              </div>
              <div className="bg-orange-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Pendientes</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{stats.pendingOrders}</p>
              </div>
              <div className="bg-green-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Hoy</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{stats.completedToday}</p>
              </div>
              <div className="bg-purple-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Ingresos</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">${stats.revenue.toFixed(0)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="text-gray-400 dark:text-gray-500" size={16} />
      <span className="text-gray-600 dark:text-gray-300">{label}:</span>
      <span className="font-medium text-gray-800 dark:text-gray-100">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE" || status === "ACTIVA";

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
        ${isActive ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}
      `}
    >
      {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, title, value, color }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
}
