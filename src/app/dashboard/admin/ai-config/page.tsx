"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api-client";
import type { AIConfig, AIAuditEntry, AIBusinessHoursStatus } from "@/types/api";
import { toast } from "sonner";
import {
  Bot, Settings, MessageSquare, Sparkles,
  Save, AlertCircle, RefreshCw, Zap, Clock, ToggleLeft, ToggleRight,
  Loader2, History, ChevronLeft, ChevronRight
} from "lucide-react";

const defaultConfig: AIConfig = {
  id: 0,
  name: "Asistente Capriccio",
  enabled: true,
  model: "gpt-4o-mini",
  temperature: 0.7,
  max_tokens: 500,
  system_prompt: "",
  welcome_message: "",
  fallback_message: "",
  response_delay: 1000,
  language: "es",
  platforms: ["whatsapp"],
  business_hours: {
    enabled: false,
    schedule: {
      monday: { start: "09:00", end: "18:00", enabled: true },
      tuesday: { start: "09:00", end: "18:00", enabled: true },
      wednesday: { start: "09:00", end: "18:00", enabled: true },
      thursday: { start: "09:00", end: "18:00", enabled: true },
      friday: { start: "09:00", end: "18:00", enabled: true },
      saturday: { start: "09:00", end: "14:00", enabled: true },
      sunday: { start: "00:00", end: "00:00", enabled: false },
    },
    offline_message: "",
  },
  features: {
    auto_reply: true,
    order_tracking: true,
    product_info: true,
    price_quotes: true,
    appointment_booking: false,
    faq_responses: true,
  },
  knowledge_base: {
    products: true,
    services: true,
    policies: true,
    custom_docs: [],
  },
  created_at: "",
  updated_at: "",
};

const PLATFORMS = ["whatsapp", "messenger", "instagram", "facebook"] as const;

const ACTION_LABELS: Record<string, string> = {
  dashboard_updated: "Configuración actualizada",
  enabled: "IA activada",
  disabled: "IA desactivada",
  updated: "Actualización",
  test_run: "Prueba ejecutada",
  api_key_updated: "API Key actualizada",
};

const FIELD_LABELS: Record<string, string> = {
  temperature: "Temperatura",
  max_tokens: "Tokens máximos",
  system_prompt: "System Prompt",
  welcome_message: "Mensaje de bienvenida",
  fallback_message: "Mensaje de fallback",
  response_delay: "Retraso de respuesta",
  language: "Idioma",
  model: "Modelo",
  name: "Nombre",
  enabled: "Estado",
  platforms: "Plataformas",
  business_hours: "Horario de atención",
  features: "Funciones",
  knowledge_base: "Base de conocimiento",
};

export default function AIConfigPage() {
  const { loading } = useRequireAuth(["admin"]);
  const [config, setConfig] = useState<AIConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [testMeta, setTestMeta] = useState<{ model: string; tokens_used: number; response_time_ms: number } | null>(null);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "prompt" | "features" | "schedule" | "test" | "audit">("general");

  // Business hours status
  const [hoursStatus, setHoursStatus] = useState<AIBusinessHoursStatus | null>(null);

  // Audit
  const [auditLog, setAuditLog] = useState<AIAuditEntry[]>([]);
  const [auditCount, setAuditCount] = useState(0);
  const [auditOffset, setAuditOffset] = useState(0);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const auditLimit = 10;

  // Platform toggle loading
  const [togglingPlatform, setTogglingPlatform] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
    loadBusinessHoursStatus();
  }, []);

  useEffect(() => {
    if (activeTab === "audit") {
      loadAuditLog();
    }
  }, [activeTab, auditOffset]);

  const loadConfig = async () => {
    try {
      setLoadingConfig(true);
      const response = await apiClient.ai.getConfig();
      if (response.success && response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error("Error loading AI config:", error);
      toast.error("Error al cargar la configuración de IA");
    } finally {
      setLoadingConfig(false);
    }
  };

  const loadBusinessHoursStatus = async () => {
    try {
      const response = await apiClient.ai.getBusinessHoursStatus();
      if (response.success && response.data) {
        setHoursStatus(response.data);
      }
    } catch (error) {
      console.error("Error loading business hours status:", error);
    }
  };

  const loadAuditLog = useCallback(async () => {
    try {
      setLoadingAudit(true);
      const response = await apiClient.ai.getAuditLog({ limit: auditLimit, offset: auditOffset });
      if (response.success && response.data) {
        setAuditLog(response.data);
        if (response.count !== undefined) {
          setAuditCount(response.count);
        }
      }
    } catch (error) {
      console.error("Error loading audit log:", error);
      toast.error("Error al cargar el historial");
    } finally {
      setLoadingAudit(false);
    }
  }, [auditOffset]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const { id, created_at, updated_at, ...configToSave } = config;
      const response = await apiClient.ai.updateConfig(configToSave);
      if (response.success && response.data) {
        setConfig(response.data);
        toast.success("Configuración guardada exitosamente");
        loadBusinessHoursStatus();
      } else {
        toast.error(response.message || "No se pudo guardar la configuración");
      }
    } catch (error: unknown) {
      console.error("Error saving config:", error);
      const message = error instanceof Error ? error.message : "Error al guardar la configuración";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePlatform = async (platform: string) => {
    const isEnabled = config.platforms.includes(platform);
    setTogglingPlatform(platform);

    try {
      const response = await apiClient.ai.togglePlatform(platform, !isEnabled);
      if (response.success) {
        // Update local state
        if (isEnabled) {
          setConfig({ ...config, platforms: config.platforms.filter(p => p !== platform) });
        } else {
          setConfig({ ...config, platforms: [...config.platforms, platform] });
        }
        toast.success(response.message || `IA ${!isEnabled ? "activada" : "desactivada"} para ${platform}`);
      }
    } catch (error) {
      console.error("Error toggling platform:", error);
      toast.error(`Error al cambiar estado de ${platform}`);
    } finally {
      setTogglingPlatform(null);
    }
  };

  const handleTestMessage = async () => {
    if (!testMessage.trim()) return;

    setTesting(true);
    setTestResponse("Procesando...");
    setTestMeta(null);

    try {
      const response = await apiClient.ai.testMessage(testMessage);
      if (response.success && response.data) {
        setTestResponse(response.data.response);
        setTestMeta({
          model: response.data.model,
          tokens_used: response.data.tokens_used,
          response_time_ms: response.data.response_time_ms,
        });
      }
    } catch (error) {
      console.error("Error testing message:", error);
      setTestResponse("Error al procesar el mensaje de prueba.");
      toast.error("Error al probar el mensaje");
    } finally {
      setTesting(false);
    }
  };

  const models = [
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Recomendado)" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ];

  const languages = [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
    { value: "pt", label: "Português" },
    { value: "fr", label: "Français" },
  ];

  const daysOfWeek = [
    { key: "monday", label: "Lunes" },
    { key: "tuesday", label: "Martes" },
    { key: "wednesday", label: "Miércoles" },
    { key: "thursday", label: "Jueves" },
    { key: "friday", label: "Viernes" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ];

  const formatChangeValue = (value: unknown): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Activo" : "Inactivo";
    if (typeof value === "object") return JSON.stringify(value);
    const str = String(value);
    return str.length > 80 ? str.substring(0, 80) + "..." : str;
  };

  if (loading || loadingConfig) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
              <Bot className="text-primary" size={32} />
              Configuración de IA
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Gestiona el asistente virtual y respuestas automáticas</p>
          </div>
          {/* Business hours status badge */}
          {hoursStatus && hoursStatus.businessHoursEnabled && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              hoursStatus.withinHours
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}>
              {hoursStatus.withinHours ? "En horario" : "Fuera de horario"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              config.enabled
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
          >
            {config.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            {config.enabled ? "Activo" : "Inactivo"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-1 p-1 overflow-x-auto">
            {[
              { id: "general" as const, label: "General", icon: Settings },
              { id: "prompt" as const, label: "Prompts", icon: MessageSquare },
              { id: "features" as const, label: "Funciones", icon: Sparkles },
              { id: "schedule" as const, label: "Horarios", icon: Clock },
              { id: "test" as const, label: "Probar", icon: Zap },
              { id: "audit" as const, label: "Historial", icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Nombre del Asistente
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Modelo de IA
                  </label>
                  <select
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  >
                    {models.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Temperatura (Creatividad)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-10">{config.temperature}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Menor = más conservador, Mayor = más creativo
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Idioma Principal
                  </label>
                  <select
                    value={config.language}
                    onChange={(e) => setConfig({ ...config, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Tokens Máximos
                  </label>
                  <input
                    type="number"
                    value={config.max_tokens}
                    onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
                    min="50"
                    max="2000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Retraso de Respuesta (ms)
                  </label>
                  <input
                    type="number"
                    value={config.response_delay}
                    onChange={(e) => setConfig({ ...config, response_delay: parseInt(e.target.value) })}
                    min="0"
                    max="5000"
                    step="100"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Simula tiempo de escritura humana
                  </p>
                </div>
              </div>

              {/* Platform toggles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Plataformas Habilitadas
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PLATFORMS.map((platform) => {
                    const isEnabled = config.platforms.includes(platform);
                    const isToggling = togglingPlatform === platform;
                    return (
                      <button
                        key={platform}
                        onClick={() => handleTogglePlatform(platform)}
                        disabled={isToggling}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isEnabled
                            ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                            : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20"
                        } ${isToggling ? "opacity-50" : "hover:shadow-sm"}`}
                      >
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 capitalize">{platform}</span>
                        {isToggling ? (
                          <Loader2 size={16} className="animate-spin text-gray-400" />
                        ) : isEnabled ? (
                          <ToggleRight size={20} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={20} className="text-gray-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Los cambios en plataformas toman efecto inmediato
                </p>
              </div>
            </div>
          )}

          {/* Prompts Tab */}
          {activeTab === "prompt" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  System Prompt (Instrucciones para la IA)
                </label>
                <textarea
                  value={config.system_prompt}
                  onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  placeholder="Define el comportamiento y personalidad del asistente..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Mensaje de Bienvenida
                </label>
                <textarea
                  value={config.welcome_message}
                  onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  placeholder="Mensaje que se envía al iniciar una conversación..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Mensaje de Error/Fallback
                </label>
                <textarea
                  value={config.fallback_message}
                  onChange={(e) => setConfig({ ...config, fallback_message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  placeholder="Mensaje cuando no se entiende la consulta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Mensaje Fuera de Horario
                </label>
                <textarea
                  value={config.business_hours.offline_message}
                  onChange={(e) => setConfig({
                    ...config,
                    business_hours: { ...config.business_hours, offline_message: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  placeholder="Mensaje cuando se contacta fuera del horario de atención..."
                />
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === "features" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Funciones Automáticas</h3>
                <div className="space-y-3">
                  {Object.entries(config.features).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setConfig({
                            ...config,
                            features: { ...config.features, [key]: e.target.checked }
                          })}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">
                            {key === "auto_reply" && "Respuestas Automáticas"}
                            {key === "order_tracking" && "Seguimiento de Pedidos"}
                            {key === "product_info" && "Información de Productos"}
                            {key === "price_quotes" && "Cotizaciones de Precios"}
                            {key === "appointment_booking" && "Reserva de Citas"}
                            {key === "faq_responses" && "Respuestas a Preguntas Frecuentes"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {key === "auto_reply" && "Responde automáticamente a mensajes entrantes"}
                            {key === "order_tracking" && "Permite consultar el estado de los pedidos"}
                            {key === "product_info" && "Proporciona información sobre productos"}
                            {key === "price_quotes" && "Genera cotizaciones automáticas"}
                            {key === "appointment_booking" && "Permite agendar citas y reuniones"}
                            {key === "faq_responses" && "Responde preguntas comunes automáticamente"}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        value ? "bg-green-100 text-green-800" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      }`}>
                        {value ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Base de Conocimiento</h3>
                <div className="space-y-3">
                  {Object.entries(config.knowledge_base).filter(([key]) => key !== "custom_docs").map(([key, value]) => (
                    <label key={key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(e) => setConfig({
                          ...config,
                          knowledge_base: { ...config.knowledge_base, [key]: e.target.checked }
                        })}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="text-gray-700 dark:text-gray-200">
                        {key === "products" && "Catálogo de Productos"}
                        {key === "services" && "Servicios Disponibles"}
                        {key === "policies" && "Políticas y Términos"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === "schedule" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Horario de Atención</h3>
                  {hoursStatus && hoursStatus.businessHoursEnabled && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hoursStatus.withinHours
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {hoursStatus.withinHours ? "En horario" : "Fuera de horario"}
                      {hoursStatus.currentTime && ` (${hoursStatus.currentTime})`}
                    </span>
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.business_hours.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      business_hours: { ...config.business_hours, enabled: e.target.checked }
                    })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-gray-700 dark:text-gray-200">Habilitar horario de atención</span>
                </label>
              </div>

              {!config.business_hours.enabled && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Con el horario deshabilitado, la IA responde las 24 horas del día, los 7 días de la semana.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {daysOfWeek.map((day) => {
                  const schedule = config.business_hours.schedule[day.key];
                  return (
                    <div key={day.key} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={schedule.enabled}
                        onChange={(e) => setConfig({
                          ...config,
                          business_hours: {
                            ...config.business_hours,
                            schedule: {
                              ...config.business_hours.schedule,
                              [day.key]: { ...schedule, enabled: e.target.checked }
                            }
                          }
                        })}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="w-24 font-medium text-gray-700 dark:text-gray-200">{day.label}</span>
                      <input
                        type="time"
                        value={schedule.start}
                        onChange={(e) => setConfig({
                          ...config,
                          business_hours: {
                            ...config.business_hours,
                            schedule: {
                              ...config.business_hours.schedule,
                              [day.key]: { ...schedule, start: e.target.value }
                            }
                          }
                        })}
                        disabled={!schedule.enabled}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      />
                      <span className="text-gray-500 dark:text-gray-400">a</span>
                      <input
                        type="time"
                        value={schedule.end}
                        onChange={(e) => setConfig({
                          ...config,
                          business_hours: {
                            ...config.business_hours,
                            schedule: {
                              ...config.business_hours.schedule,
                              [day.key]: { ...schedule, end: e.target.value }
                            }
                          }
                        })}
                        disabled={!schedule.enabled}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Test Tab */}
          {activeTab === "test" && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">Modo de Prueba</p>
                    <p>Envía un mensaje de prueba al modelo de IA usando la configuración guardada. No se envía nada a WhatsApp.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Mensaje de Prueba
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    placeholder="Escribe un mensaje para probar..."
                  />
                  <button
                    onClick={handleTestMessage}
                    disabled={!testMessage.trim() || testing}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    {testing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                    {testing ? "Procesando..." : "Enviar Mensaje"}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Respuesta del Asistente
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-[120px]">
                    {testResponse ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Bot className="text-primary flex-shrink-0" size={20} />
                          <p className="text-gray-800 dark:text-gray-100">{testResponse}</p>
                        </div>
                        {testMeta && (
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3">
                            <span>Modelo: {testMeta.model}</span>
                            <span>Tokens: {testMeta.tokens_used}</span>
                            <span>Tiempo: {testMeta.response_time_ms}ms</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center">La respuesta aparecerá aquí...</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setTestMessage("");
                    setTestResponse("");
                    setTestMeta(null);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                >
                  <RefreshCw size={18} />
                  Limpiar Prueba
                </button>
                <button
                  onClick={loadConfig}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                >
                  <RefreshCw size={18} />
                  Recargar Configuración
                </button>
              </div>
            </div>
          )}

          {/* Audit Tab */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Historial de Cambios</h3>
                <button
                  onClick={loadAuditLog}
                  disabled={loadingAudit}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                >
                  <RefreshCw size={14} className={loadingAudit ? "animate-spin" : ""} />
                  Actualizar
                </button>
              </div>

              {loadingAudit && auditLog.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
              ) : auditLog.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <History size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No hay registros de cambios aún</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {auditLog.map((entry) => (
                      <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              entry.action === "enabled" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                              entry.action === "disabled" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                              entry.action === "test_run" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                              "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}>
                              {ACTION_LABELS[entry.action] || entry.action}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {entry.user_id.substring(0, 8)}...
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(entry.created_at).toLocaleString("es-MX", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>

                        {entry.changes && Object.keys(entry.changes).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {Object.entries(entry.changes).map(([field, change]) => (
                              <div key={field} className="text-sm flex items-start gap-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
                                  {FIELD_LABELS[field] || field}:
                                </span>
                                <span className="text-red-600 dark:text-red-400 line-through">
                                  {formatChangeValue(change.old)}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="text-green-600 dark:text-green-400">
                                  {formatChangeValue(change.new)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {auditCount > auditLimit && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {auditOffset + 1}-{Math.min(auditOffset + auditLimit, auditCount)} de {auditCount}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAuditOffset(Math.max(0, auditOffset - auditLimit))}
                          disabled={auditOffset === 0}
                          className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() => setAuditOffset(auditOffset + auditLimit)}
                          disabled={auditOffset + auditLimit >= auditCount}
                          className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
