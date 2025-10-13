"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import {
  FileText, Download, Filter, Calendar, TrendingUp, TrendingDown,
  BarChart3, PieChart, Activity, DollarSign, Users, Package,
  Clock, AlertCircle, CheckCircle, Printer, Mail, Share2
} from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Order, Branch, User } from "@/types/api";

interface ReportData {
  revenue: {
    total: number;
    byMonth: Record<string, number>;
    byBranch: Record<string, number>;
    byProduct: Record<string, number>;
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    average_value: number;
    by_status: Record<string, number>;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    by_platform: Record<string, number>;
  };
  performance: {
    delivery_rate: number;
    on_time_rate: number;
    satisfaction_rate: number;
    response_time: number;
  };
  employees: {
    total: number;
    by_branch: Record<string, number>;
    top_performers: Array<{ id: string; name: string; score: number }>;
  };
}

type ReportType = "sales" | "inventory" | "customers" | "performance" | "custom";
type TimeRange = "today" | "week" | "month" | "quarter" | "year" | "custom";

export default function AdminReportsPage() {
  const { loading } = useRequireAuth(["admin"]);
  const [reportType, setReportType] = useState<ReportType>("sales");
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [loadingData, setLoadingData] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadData();
  }, [timeRange, selectedBranch]);

  const loadData = async () => {
    try {
      setLoadingData(true);

      // Cargar sucursales
      const branchesResponse = await apiClient.branches.getAll();
      setBranches(branchesResponse.data || []);

      // Generar datos de reporte simulados
      const mockData: ReportData = {
        revenue: {
          total: 125000,
          byMonth: {
            "Enero": 18000,
            "Febrero": 22000,
            "Marzo": 28000,
            "Abril": 25000,
            "Mayo": 32000,
          },
          byBranch: {
            "Sucursal Centro": 45000,
            "Sucursal Norte": 35000,
            "Sucursal Sur": 25000,
            "Sucursal Este": 20000,
          },
          byProduct: {
            "Mermeladas": 35000,
            "Panes": 30000,
            "Conservas": 25000,
            "Dulces": 20000,
            "Otros": 15000,
          },
        },
        orders: {
          total: 850,
          completed: 720,
          pending: 95,
          cancelled: 35,
          average_value: 147.06,
          by_status: {
            "completed": 720,
            "pending": 50,
            "processing": 45,
            "cancelled": 35,
          },
        },
        customers: {
          total: 450,
          new: 120,
          returning: 330,
          by_platform: {
            "WhatsApp": 280,
            "Instagram": 120,
            "Messenger": 50,
          },
        },
        performance: {
          delivery_rate: 94.5,
          on_time_rate: 88.3,
          satisfaction_rate: 4.6,
          response_time: 2.5,
        },
        employees: {
          total: 25,
          by_branch: {
            "Sucursal Centro": 8,
            "Sucursal Norte": 7,
            "Sucursal Sur": 6,
            "Sucursal Este": 4,
          },
          top_performers: [
            { id: "1", name: "María García", score: 98 },
            { id: "2", name: "Juan Pérez", score: 95 },
            { id: "3", name: "Ana López", score: 92 },
          ],
        },
      };

      setReportData(mockData);
    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    // Simulación de generación de reporte
    setTimeout(() => {
      setGeneratingReport(false);
      alert("Reporte generado exitosamente");
    }, 2000);
  };

  const handleExportReport = (format: "pdf" | "excel" | "csv") => {
    alert(`Exportando reporte en formato ${format.toUpperCase()}...`);
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "today": return "Hoy";
      case "week": return "Esta Semana";
      case "month": return "Este Mes";
      case "quarter": return "Este Trimestre";
      case "year": return "Este Año";
      case "custom": return "Personalizado";
      default: return "";
    }
  };

  const reportTypes = [
    { value: "sales", label: "Ventas", icon: DollarSign },
    { value: "inventory", label: "Inventario", icon: Package },
    { value: "customers", label: "Clientes", icon: Users },
    { value: "performance", label: "Rendimiento", icon: Activity },
    { value: "custom", label: "Personalizado", icon: FileText },
  ];

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Centro de Reportes</h1>
          <p className="text-gray-600">Análisis y reportes detallados del negocio</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExportReport("pdf")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            Exportar
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            <FileText size={18} />
            {generatingReport ? "Generando..." : "Generar Reporte"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <div className="grid grid-cols-2 gap-2">
              {reportTypes.slice(0, 4).map((type) => (
                <button
                  key={type.value}
                  onClick={() => setReportType(type.value as ReportType)}
                  className={`p-2 rounded-lg border transition-all ${
                    reportType === type.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <type.icon size={18} className="mx-auto mb-1" />
                  <p className="text-xs">{type.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Año</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sucursal
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
            >
              <option value="all">Todas las Sucursales</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range */}
          {timeRange === "custom" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acciones Rápidas
            </label>
            <div className="flex gap-2">
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Printer size={18} />
              </button>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Mail size={18} />
              </button>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Ingresos Totales"
              value={`$${reportData.revenue.total.toLocaleString()}`}
              change={12.5}
              trend="up"
              icon={DollarSign}
              subtitle={getTimeRangeLabel()}
            />
            <MetricCard
              title="Órdenes Totales"
              value={reportData.orders.total}
              change={8.3}
              trend="up"
              icon={Package}
              subtitle={`${reportData.orders.completed} completadas`}
            />
            <MetricCard
              title="Clientes Totales"
              value={reportData.customers.total}
              change={-2.1}
              trend="down"
              icon={Users}
              subtitle={`${reportData.customers.new} nuevos`}
            />
            <MetricCard
              title="Tasa de Entrega"
              value={`${reportData.performance.delivery_rate}%`}
              change={3.2}
              trend="up"
              icon={CheckCircle}
              subtitle="A tiempo"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="text-primary" size={20} />
                Ingresos por Mes
              </h3>
              <div className="space-y-3">
                {Object.entries(reportData.revenue.byMonth).map(([month, amount]) => (
                  <div key={month} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20">{month}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-primary rounded-full flex items-center justify-end pr-2"
                        style={{
                          width: `${(amount / Math.max(...Object.values(reportData.revenue.byMonth))) * 100}%`,
                        }}
                      >
                        <span className="text-white text-xs font-medium">
                          ${amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="text-primary" size={20} />
                Distribución de Órdenes
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(reportData.orders.by_status).map(([status, count]) => {
                  const percentage = ((count / reportData.orders.total) * 100).toFixed(1);
                  const colors: Record<string, string> = {
                    completed: "bg-green-500",
                    pending: "bg-yellow-500",
                    processing: "bg-blue-500",
                    cancelled: "bg-red-500",
                  };
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${colors[status]}`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 capitalize">{status}</p>
                        <p className="text-xs text-gray-500">{count} ({percentage}%)</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Valor Promedio</span>
                  <span className="font-bold text-gray-800">
                    ${reportData.orders.average_value.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tasa de Éxito</span>
                  <span className="font-bold text-green-600">
                    {((reportData.orders.completed / reportData.orders.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Platforms */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="text-primary" size={20} />
                Clientes por Plataforma
              </h3>
              <div className="space-y-4">
                {Object.entries(reportData.customers.by_platform).map(([platform, count]) => {
                  const percentage = ((count / reportData.customers.total) * 100).toFixed(1);
                  const colors: Record<string, string> = {
                    WhatsApp: "bg-green-500",
                    Instagram: "bg-pink-500",
                    Messenger: "bg-blue-500",
                  };
                  return (
                    <div key={platform}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{platform}</span>
                        <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${colors[platform]} h-2 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="text-primary" size={20} />
                Mejores Empleados
              </h3>
              <div className="space-y-3">
                {reportData.employees.top_performers.map((employee, index) => (
                  <div key={employee.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-600"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{employee.name}</p>
                      <p className="text-xs text-gray-500">Puntuación: {employee.score}</p>
                    </div>
                    {index === 0 && <span className="text-yellow-500">🏆</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Detalles del Reporte</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Métrica</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Actual</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período Anterior</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cambio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tendencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Ingresos</td>
                    <td className="px-4 py-3 text-sm text-gray-900">${reportData.revenue.total.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">$111,250</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-green-600 font-medium">+12.5%</span>
                    </td>
                    <td className="px-4 py-3">
                      <TrendingUp className="text-green-500" size={16} />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Órdenes</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{reportData.orders.total}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">785</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-green-600 font-medium">+8.3%</span>
                    </td>
                    <td className="px-4 py-3">
                      <TrendingUp className="text-green-500" size={16} />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Clientes Nuevos</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{reportData.customers.new}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">145</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-red-600 font-medium">-17.2%</span>
                    </td>
                    <td className="px-4 py-3">
                      <TrendingDown className="text-red-500" size={16} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down";
  icon: React.ComponentType<{ size?: number; className?: string }>;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {trend === "up" ? (
                <TrendingUp size={16} className="text-green-500 mr-1" />
              ) : (
                <TrendingDown size={16} className="text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
                {change > 0 ? "+" : ""}{change}%
              </span>
            </div>
          )}
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="text-primary" size={24} />
        </div>
      </div>
    </div>
  );
}