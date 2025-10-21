"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import {
  Bot, Brain, Settings, MessageSquare, Sparkles, Shield,
  Save, AlertCircle, CheckCircle, Copy, Eye, EyeOff,
  RefreshCw, Zap, Globe, Clock, ToggleLeft, ToggleRight
} from "lucide-react";
import apiClient from "@/lib/api-client";

interface AIConfig {
  id: string;
  name: string;
  enabled: boolean;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  welcome_message: string;
  fallback_message: string;
  response_delay: number;
  language: string;
  platforms: string[];
  business_hours: {
    enabled: boolean;
    schedule: Record<string, { start: string; end: string; enabled: boolean }>;
    offline_message: string;
  };
  features: {
    auto_reply: boolean;
    order_tracking: boolean;
    product_info: boolean;
    price_quotes: boolean;
    appointment_booking: boolean;
    faq_responses: boolean;
  };
  knowledge_base: {
    products: boolean;
    services: boolean;
    policies: boolean;
    custom_docs: string[];
  };
}

const defaultConfig: AIConfig = {
  id: "1",
  name: "Asistente Capriccio",
  enabled: true,
  model: "gpt-4",
  temperature: 0.7,
  max_tokens: 500,
  system_prompt: `Eres un asistente virtual de Capriccio, una empresa de productos caseros de alta calidad.
Tu objetivo es ayudar a los clientes con sus consultas sobre productos, pedidos y servicios.
Mantén un tono amigable, profesional y servicial.
Siempre proporciona información precisa y actualizada.`,
  welcome_message: "¡Hola! 👋 Soy el asistente virtual de Capriccio. ¿En qué puedo ayudarte hoy?",
  fallback_message: "Lo siento, no entendí tu mensaje. ¿Podrías reformularlo o ser más específico?",
  response_delay: 1000,
  language: "es",
  platforms: ["whatsapp", "messenger", "instagram"],
  business_hours: {
    enabled: true,
    schedule: {
      monday: { start: "09:00", end: "18:00", enabled: true },
      tuesday: { start: "09:00", end: "18:00", enabled: true },
      wednesday: { start: "09:00", end: "18:00", enabled: true },
      thursday: { start: "09:00", end: "18:00", enabled: true },
      friday: { start: "09:00", end: "18:00", enabled: true },
      saturday: { start: "09:00", end: "14:00", enabled: true },
      sunday: { start: "00:00", end: "00:00", enabled: false },
    },
    offline_message: "Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00 y sábados de 9:00 a 14:00. Te responderemos a la brevedad.",
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
};

export default function AIConfigPage() {
  const { loading } = useRequireAuth(["admin"]);
  const [config, setConfig] = useState<AIConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("sk-............................");
  const [activeTab, setActiveTab] = useState<"general" | "prompt" | "features" | "schedule" | "test">("general");

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      // En producción, cargaría desde la API
      // const response = await apiClient.ai.getConfig();
      // setConfig(response.data);

      // Por ahora usamos config por defecto
      setConfig(defaultConfig);
    } catch (error) {
      console.error("Error loading AI config:", error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // await apiClient.ai.updateConfig(config);

      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert("Configuración guardada exitosamente");
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleTestMessage = async () => {
    if (!testMessage.trim()) return;

    setTestResponse("Procesando...");

    // Simulación de respuesta
    setTimeout(() => {
      const responses = [
        "¡Hola! Gracias por contactar a Capriccio. Tenemos una amplia variedad de productos caseros disponibles. ¿Qué te gustaría saber?",
        "Por supuesto, puedo ayudarte con el seguimiento de tu pedido. Por favor, proporcióname tu número de orden.",
        "Nuestros productos más populares incluyen mermeladas artesanales, panes caseros y conservas gourmet. ¿Te gustaría ver nuestro catálogo?",
        "El tiempo de entrega estándar es de 2-3 días hábiles dentro de la ciudad. ¿Necesitas información sobre envío express?",
      ];
      setTestResponse(responses[Math.floor(Math.random() * responses.length)]);
    }, 1500);
  };

  const models = [
    { value: "gpt-4", label: "GPT-4 (Más preciso)" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Más rápido)" },
    { value: "claude-3", label: "Claude 3 (Balanceado)" },
  ];

  const languages = [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
    { value: "pt", label: "Português" },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Bot className="text-primary" size={32} />
            Configuración de IA
          </h1>
          <p className="text-gray-600">Gestiona el asistente virtual y respuestas automáticas</p>
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
            <Save size={18} />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex gap-1 p-1">
            {[
              { id: "general", label: "General", icon: Settings },
              { id: "prompt", label: "Prompts", icon: MessageSquare },
              { id: "features", label: "Funciones", icon: Sparkles },
              { id: "schedule", label: "Horarios", icon: Clock },
              { id: "test", label: "Probar", icon: Zap },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "general" | "prompt" | "features" | "schedule" | "test")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Asistente
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo de IA
                  </label>
                  <select
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                  >
                    {models.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <span className="text-sm font-medium text-gray-700 w-10">{config.temperature}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Menor = más conservador, Mayor = más creativo
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma Principal
                  </label>
                  <select
                    value={config.language}
                    onChange={(e) => setConfig({ ...config, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tokens Máximos
                  </label>
                  <input
                    type="number"
                    value={config.max_tokens}
                    onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
                    min="50"
                    max="2000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retraso de Respuesta (ms)
                  </label>
                  <input
                    type="number"
                    value={config.response_delay}
                    onChange={(e) => setConfig({ ...config, response_delay: parseInt(e.target.value) })}
                    min="0"
                    max="5000"
                    step="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Simula tiempo de escritura humana
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key de OpenAI
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plataformas Habilitadas
                </label>
                <div className="flex flex-wrap gap-3">
                  {["whatsapp", "messenger", "instagram", "facebook"].map((platform) => (
                    <label key={platform} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.platforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig({ ...config, platforms: [...config.platforms, platform] });
                          } else {
                            setConfig({ ...config, platforms: config.platforms.filter(p => p !== platform) });
                          }
                        }}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700 capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Prompts Tab */}
          {activeTab === "prompt" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Prompt (Instrucciones para la IA)
                </label>
                <textarea
                  value={config.system_prompt}
                  onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder="Define el comportamiento y personalidad del asistente..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje de Bienvenida
                </label>
                <textarea
                  value={config.welcome_message}
                  onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder="Mensaje que se envía al iniciar una conversación..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje de Error/Fallback
                </label>
                <textarea
                  value={config.fallback_message}
                  onChange={(e) => setConfig({ ...config, fallback_message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder="Mensaje cuando no se entiende la consulta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje Fuera de Horario
                </label>
                <textarea
                  value={config.business_hours.offline_message}
                  onChange={(e) => setConfig({
                    ...config,
                    business_hours: { ...config.business_hours, offline_message: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder="Mensaje cuando se contacta fuera del horario de atención..."
                />
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === "features" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Funciones Automáticas</h3>
                <div className="space-y-3">
                  {Object.entries(config.features).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
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
                          <p className="font-medium text-gray-800">
                            {key === "auto_reply" && "Respuestas Automáticas"}
                            {key === "order_tracking" && "Seguimiento de Pedidos"}
                            {key === "product_info" && "Información de Productos"}
                            {key === "price_quotes" && "Cotizaciones de Precios"}
                            {key === "appointment_booking" && "Reserva de Citas"}
                            {key === "faq_responses" && "Respuestas a Preguntas Frecuentes"}
                          </p>
                          <p className="text-sm text-gray-500">
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
                        value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {value ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Base de Conocimiento</h3>
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
                      <span className="text-gray-700">
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
                <h3 className="text-lg font-semibold text-gray-800">Horario de Atención</h3>
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
                  <span className="text-gray-700">Habilitar horario de atención</span>
                </label>
              </div>

              <div className="space-y-3">
                {daysOfWeek.map((day) => {
                  const schedule = config.business_hours.schedule[day.key];
                  return (
                    <div key={day.key} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
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
                      <span className="w-24 font-medium text-gray-700">{day.label}</span>
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-100"
                      />
                      <span className="text-gray-500">a</span>
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-100"
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Modo de Prueba</p>
                    <p>Aquí puedes probar las respuestas del asistente con la configuración actual. Los cambios no se guardan automáticamente.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje de Prueba
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    placeholder="Escribe un mensaje para probar..."
                  />
                  <button
                    onClick={handleTestMessage}
                    disabled={!testMessage.trim()}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    <Zap size={18} />
                    Enviar Mensaje
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Respuesta del Asistente
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[120px]">
                    {testResponse ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Bot className="text-primary flex-shrink-0" size={20} />
                          <p className="text-gray-800">{testResponse}</p>
                        </div>
                        {testResponse !== "Procesando..." && (
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                            <span>Modelo: {config.model}</span>
                            <span>Temperatura: {config.temperature}</span>
                            <span>Tokens: ~{testResponse.split(" ").length * 2}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center">La respuesta aparecerá aquí...</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <RefreshCw size={18} />
                  Reiniciar Conversación
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Brain size={18} />
                  Entrenar Modelo
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Shield size={18} />
                  Validar Configuración
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}