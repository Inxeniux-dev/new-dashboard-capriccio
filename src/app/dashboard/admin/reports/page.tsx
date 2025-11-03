"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  MessageCircle,
  Download,
  Crown,
  Calendar,
  MessageSquare,
  Instagram,
  Facebook,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import type {
  ExecutiveReport,
  TopProduct,
  Platform,
  ReportPreset,
} from "@/types/api";
import { AIAnalysisPanel } from "@/components/reports/AIAnalysisPanel";
import { TopProductsTable } from "@/components/reports/TopProductsTable";

type PlatformFilter = Platform | "todas";
type ExtendedReportPreset = ReportPreset | "custom";

export default function AdminReportsPage() {
  const { loading: authLoading } = useRequireAuth(["admin"]);

  // Estados principales
  const [selectedPreset, setSelectedPreset] = useState<ExtendedReportPreset>("this-week");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformFilter>("todas");
  const [reportData, setReportData] = useState<ExecutiveReport | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para fechas personalizadas
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [showCustomDates, setShowCustomDates] = useState(false);

  // Inicializar fechas personalizadas con valores por defecto
  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    setCustomEndDate(today.toISOString().split('T')[0]);
    setCustomStartDate(lastWeek.toISOString().split('T')[0]);
  }, []);

  // Manejar cambio de preset
  useEffect(() => {
    if (selectedPreset === "custom") {
      setShowCustomDates(true);
    } else {
      setShowCustomDates(false);
    }
  }, [selectedPreset]);

  // Cargar datos cuando cambie el preset, plataforma o fechas personalizadas
  useEffect(() => {
    if (!authLoading) {
      if (selectedPreset === "custom" && (!customStartDate || !customEndDate)) {
        // No cargar si es custom y no hay fechas seleccionadas
        return;
      }
      loadReportData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPreset, selectedPlatform, customStartDate, customEndDate, authLoading]);

  const loadReportData = async () => {
    setIsLoadingReport(true);
    setError(null);

    try {
      const platform = selectedPlatform === "todas" ? null : selectedPlatform;
      let reportResponse;

      if (selectedPreset === "custom") {
        // Usar fechas personalizadas
        reportResponse = await apiClient.reports.getCustomReport(
          customStartDate,
          customEndDate,
          platform,
          false // No incluir IA por defecto
        );
      } else {
        // Usar preset predefinido
        reportResponse = await apiClient.reports.getPresetReport(
          selectedPreset as ReportPreset,
          platform,
          false // No incluir IA por defecto
        );
      }

      if (reportResponse.success && reportResponse.report) {
        setReportData(reportResponse.report);

        // Cargar productos top
        const { startDate, endDate } = reportResponse.report.period;
        const productsResponse = await apiClient.reports.getTopProducts(
          startDate,
          endDate,
          10
        );

        if (productsResponse.success && productsResponse.topProducts) {
          setTopProducts(productsResponse.topProducts);
        }
      }
    } catch (err) {
      console.error("Error loading report data:", err);
      setError("Error al cargar los reportes. Por favor, intenta de nuevo.");
    } finally {
      setIsLoadingReport(false);
    }
  };

  const generateAIAnalysis = async () => {
    if (!reportData) return;

    setIsLoadingAI(true);
    setError(null);

    try {
      const platform = selectedPlatform === "todas" ? null : selectedPlatform;
      let reportResponse;

      if (selectedPreset === "custom") {
        // Usar fechas personalizadas para análisis de IA
        reportResponse = await apiClient.reports.getCustomReport(
          customStartDate,
          customEndDate,
          platform,
          true // Incluir análisis de IA
        );
      } else {
        // Usar preset predefinido para análisis de IA
        reportResponse = await apiClient.reports.getPresetReport(
          selectedPreset as ReportPreset,
          platform,
          true // Incluir análisis de IA
        );
      }

      if (reportResponse.success && reportResponse.report?.aiAnalysis) {
        setReportData((prev) =>
          prev
            ? {
                ...prev,
                aiAnalysis: reportResponse.report.aiAnalysis,
              }
            : null
        );
      }
    } catch (err) {
      console.error("Error generating AI analysis:", err);
      setError("Error al generar el análisis de IA. Por favor, intenta de nuevo.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleExportReport = () => {
    // TODO: Implementar exportación de reportes
    alert("Exportación de reportes - En desarrollo");
  };

  // Función para determinar la plataforma principal basándose en los datos
  const getTopPlatform = (): string => {
    if (!reportData) return 'Sin datos';

    // Si el backend ya proporciona el topPlatform, usarlo
    if (reportData.metrics.topPlatform && reportData.metrics.topPlatform !== 'todas') {
      return reportData.metrics.topPlatform;
    }

    // Si no, calcularlo basándose en las conversaciones por plataforma
    if (reportData.conversations?.byPlatform) {
      const platforms = reportData.conversations.byPlatform;
      let maxPlatform = '';
      let maxCount = 0;

      for (const [platform, count] of Object.entries(platforms)) {
        if (count > maxCount) {
          maxCount = count;
          maxPlatform = platform;
        }
      }

      return maxPlatform || 'Sin datos';
    }

    return 'Sin datos';
  };

  const getPresetLabel = (preset: ExtendedReportPreset): string => {
    if (preset === "custom") {
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
        const end = new Date(customEndDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
        return `${start} - ${end}`;
      }
      return "Personalizado";
    }

    const labels: Record<ReportPreset, string> = {
      today: "Hoy",
      yesterday: "Ayer",
      "this-week": "Esta Semana",
      "last-week": "Semana Pasada",
      "this-month": "Este Mes",
      "last-month": "Mes Pasado",
      "this-quarter": "Este Trimestre",
      "this-year": "Este Año",
    };
    return labels[preset as ReportPreset] || preset;
  };

  if (authLoading || (isLoadingReport && !reportData)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Cargando reportes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Reportes Ejecutivos
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Análisis y reportes detallados del negocio
          </p>
        </div>

        <button
          onClick={handleExportReport}
          disabled={!reportData}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 disabled:opacity-50"
        >
          <Download size={18} />
          Exportar
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Periodo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Periodo
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value as ExtendedReportPreset)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              <option value="today">Hoy</option>
              <option value="yesterday">Ayer</option>
              <option value="this-week">Esta Semana</option>
              <option value="last-week">Semana Pasada</option>
              <option value="this-month">Este Mes</option>
              <option value="last-month">Mes Pasado</option>
              <option value="this-quarter">Este Trimestre</option>
              <option value="this-year">Este Año</option>
              <option value="custom">📅 Personalizado</option>
            </select>
          </div>

          {/* Plataforma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Plataforma
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) =>
                setSelectedPlatform(e.target.value as PlatformFilter)
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              <option value="todas">Todas las plataformas</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="messenger">Messenger</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
        </div>

        {/* Fechas personalizadas */}
        {showCustomDates && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="text-primary" size={18} />
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Selecciona el rango de fechas
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={customEndDate || undefined}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate || undefined}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm"
                />
              </div>
            </div>
            {customStartDate && customEndDate && (
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                📊 Mostrando datos desde el{' '}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {new Date(customStartDate).toLocaleDateString('es-MX', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>{' '}
                hasta el{' '}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {new Date(customEndDate).toLocaleDateString('es-MX', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Métricas Principales */}
      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Ingresos Totales"
              value={`$${reportData.metrics.totalRevenue.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}`}
              subtitle={getPresetLabel(selectedPreset)}
              icon={DollarSign}
              iconBgColor="bg-green-100 dark:bg-green-900/20"
              iconColor="text-green-600 dark:text-green-400"
            />

            <MetricCard
              title="Total de Órdenes"
              value={reportData.metrics.totalOrders}
              subtitle={`${reportData.metrics.completedOrders} completadas`}
              icon={Package}
              iconBgColor="bg-blue-100 dark:bg-blue-900/20"
              iconColor="text-blue-600 dark:text-blue-400"
            />

            <MetricCard
              title="Nuevos Clientes"
              value={reportData.metrics.newContacts}
              subtitle={`${reportData.metrics.messagesPerContact} mensajes/cliente`}
              icon={Users}
              iconBgColor="bg-purple-100 dark:bg-purple-900/20"
              iconColor="text-purple-600 dark:text-purple-400"
            />

            <MetricCard
              title="Tasa de Conversión"
              value={`${parseFloat(reportData.metrics.conversionRate).toFixed(1)}%`}
              subtitle={`${reportData.metrics.paymentRate}% pagados`}
              icon={TrendingUp}
              iconBgColor="bg-orange-100 dark:bg-orange-900/20"
              iconColor="text-orange-600 dark:text-orange-400"
            />
          </div>

          {/* Segunda fila de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Valor Promedio de Orden
              </h3>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                ${reportData.metrics.averageOrderValue.toFixed(2)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Plataforma Principal
              </h3>
              <div className="flex items-center gap-2">
                {(() => {
                  const platform = getTopPlatform();
                  const platformLower = platform.toLowerCase();
                  let icon = null;
                  let iconColor = '';

                  if (platformLower === 'whatsapp') {
                    icon = <MessageCircle size={24} />;
                    iconColor = 'text-green-500';
                  } else if (platformLower === 'instagram') {
                    icon = <Instagram size={24} />;
                    iconColor = 'text-pink-500';
                  } else if (platformLower === 'messenger') {
                    icon = <MessageSquare size={24} />;
                    iconColor = 'text-blue-500';
                  } else if (platformLower === 'facebook') {
                    icon = <Facebook size={24} />;
                    iconColor = 'text-blue-600';
                  }

                  return (
                    <>
                      {icon && <span className={iconColor}>{icon}</span>}
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 capitalize">
                        {platform}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Total de Mensajes
              </h3>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {reportData.metrics.totalMessages.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Gráficas y Distribuciones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución de Órdenes por Estado */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Package className="text-primary" size={20} />
                Distribución de Órdenes
              </h3>
              <div className="space-y-3">
                {Object.entries(reportData.orders.byStatus).map(
                  ([status, count]) => {
                    const percentage = (
                      (count / reportData.orders.total) *
                      100
                    ).toFixed(1);
                    const statusColors: Record<string, string> = {
                      sent_to_ipos: "bg-green-500",
                      pending_logistics: "bg-yellow-500",
                      ready_for_ipos: "bg-blue-500",
                      cancelled: "bg-red-500",
                      completed: "bg-green-600",
                      in_progress: "bg-blue-600",
                      pending: "bg-yellow-600",
                    };

                    return (
                      <div key={status}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">
                            {status.replace(/_/g, " ")}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className={`${
                              statusColors[status] || "bg-gray-400"
                            } h-2 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Distribución por Plataforma */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <MessageCircle className="text-primary" size={20} />
                Mensajes por Plataforma
              </h3>
              <div className="space-y-3">
                {Object.entries(reportData.conversations.byPlatform).map(
                  ([platform, count]) => {
                    const percentage = (
                      (count / reportData.conversations.totalMessages) *
                      100
                    ).toFixed(1);
                    const platformColors: Record<string, string> = {
                      whatsapp: "bg-green-500",
                      instagram: "bg-pink-500",
                      messenger: "bg-blue-500",
                      facebook: "bg-blue-600",
                    };

                    return (
                      <div key={platform}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">
                            {platform}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className={`${
                              platformColors[platform] || "bg-gray-400"
                            } h-2 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Productos Más Vendidos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Crown className="text-yellow-500" size={20} />
              Productos Más Vendidos
            </h3>
            <TopProductsTable
              products={topProducts}
              isLoading={isLoadingReport}
            />
          </div>

          {/* Panel de Análisis IA */}
          <AIAnalysisPanel
            analysis={reportData.aiAnalysis || null}
            isLoading={isLoadingAI}
            onGenerate={generateAIAnalysis}
            onRegenerate={generateAIAnalysis}
          />
        </>
      )}
    </div>
  );
}

// Componente auxiliar para tarjetas de métricas
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBgColor?: string;
  iconColor?: string;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
}: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className={`p-3 ${iconBgColor} rounded-lg`}>
          <Icon className={iconColor} size={24} />
        </div>
      </div>
    </div>
  );
}
