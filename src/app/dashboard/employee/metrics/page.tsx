"use client";

import { useRequireAuth } from "@/contexts/AuthContext";
import { BarChart3, TrendingUp, Award, Target, Clock, Star, Zap, Trophy } from "lucide-react";

export default function EmployeeMetricsPage() {
  const { loading } = useRequireAuth(["empleado", "employee"]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Mis Métricas</h1>
            <p className="text-white/80">Seguimiento de tu rendimiento</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-yellow-300" size={32} />
              <span className="text-4xl font-bold">4.8</span>
            </div>
            <p className="text-sm text-white/80">Tu Calificación</p>
          </div>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="text-blue-600" size={32} />
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Tareas Completadas</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">145</p>
          <p className="text-xs text-green-600">+15% vs mes anterior</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="text-orange-600" size={32} />
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Puntualidad</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">92%</p>
          <p className="text-xs text-green-600">+5% vs mes anterior</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <Zap className="text-purple-600" size={32} />
            <Award className="text-yellow-500" size={20} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Puntos Acumulados</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">1,250</p>
          <p className="text-xs text-purple-600">Nivel 5 - Experto</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="text-yellow-600" size={32} />
            <Star className="text-yellow-500" size={20} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Logros Desbloqueados</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">12</p>
          <p className="text-xs text-yellow-600">de 25 totales</p>
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <BarChart3 className="text-primary" size={24} />
          Progreso Mensual
        </h2>
        <div className="space-y-4">
          {[
            { label: "Órdenes Completadas", value: 85, max: 100, color: "bg-blue-500" },
            { label: "Calidad del Servicio", value: 92, max: 100, color: "bg-green-500" },
            { label: "Velocidad de Respuesta", value: 78, max: 100, color: "bg-purple-500" },
            { label: "Satisfacción del Cliente", value: 88, max: 100, color: "bg-orange-500" },
          ].map((metric, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {metric.label}
                </span>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  {metric.value}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`${metric.color} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Award className="text-primary" size={24} />
          Logros Recientes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: "⭐",
              title: "Estrella del Mes",
              description: "Mejor rendimiento de Enero",
              date: "Hace 1 semana"
            },
            {
              icon: "🎯",
              title: "100 Órdenes",
              description: "Completaste 100 órdenes",
              date: "Hace 2 semanas"
            },
            {
              icon: "⚡",
              title: "Velocidad Relámpago",
              description: "Completaste 10 órdenes en un día",
              date: "Hace 3 semanas"
            },
          ].map((achievement, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20"
            >
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">
                {achievement.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {achievement.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
