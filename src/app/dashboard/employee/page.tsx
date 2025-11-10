"use client";

import { useRequireAuth } from "@/contexts/AuthContext";
import {
  Package, CheckCircle, Clock, AlertCircle,
  Star, Award, Target, Coffee, Zap, ChevronRight, Filter,
  Calendar, User, Store
} from "lucide-react";
import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
  due_date: string;
  assigned_by: string;
  created_at: string;
  order_id?: string;
}

interface Performance {
  tasks_completed: number;
  tasks_pending: number;
  on_time_rate: number;
  rating: number;
  points: number;
  level: number;
  next_level_points: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_date: string;
  points: number;
}

export default function EmployeeDashboardPage() {
  const { user, loading } = useRequireAuth(["empleado", "employee"]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [performance, setPerformance] = useState<Performance>({
    tasks_completed: 0,
    tasks_pending: 0,
    on_time_rate: 85,
    rating: 4.5,
    points: 1250,
    level: 5,
    next_level_points: 1500,
    achievements: [],
  });
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "in_progress" | "completed">("pending");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filterStatus]);

  const loadData = async () => {
    try {
      setLoadingData(true);

      // Datos de tareas de ejemplo
      const mockTasks: Task[] = [
        {
          id: "1",
          title: "Preparar pedido #12345",
          description: "Preparar y empacar pedido de 15 productos para cliente VIP",
          priority: "high",
          status: "pending",
          due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          assigned_by: "Supervisor María",
          created_at: new Date().toISOString(),
          order_id: "12345",
        },
        {
          id: "2",
          title: "Inventario de almacén B",
          description: "Realizar conteo de inventario en sección de conservas",
          priority: "medium",
          status: "in_progress",
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          assigned_by: "Gerente Juan",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          title: "Capacitación en nuevo sistema",
          description: "Completar módulo 3 del curso de actualización",
          priority: "low",
          status: "pending",
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          assigned_by: "RRHH",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          title: "Entrega urgente - Cliente Premium",
          description: "Entregar pedido especial en dirección del cliente antes del mediodía",
          priority: "high",
          status: "pending",
          due_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          assigned_by: "Supervisor María",
          created_at: new Date().toISOString(),
          order_id: "12346",
        },
        {
          id: "5",
          title: "Organizar área de trabajo",
          description: "Limpiar y reorganizar estación de empaque",
          priority: "low",
          status: "completed",
          due_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          assigned_by: "Supervisor María",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const mockAchievements: Achievement[] = [
        {
          id: "1",
          title: "Estrella del Mes",
          description: "Mejor rendimiento del mes",
          icon: "⭐",
          earned_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          points: 100,
        },
        {
          id: "2",
          title: "Rapidez Extrema",
          description: "10 pedidos completados en un día",
          icon: "⚡",
          earned_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          points: 50,
        },
        {
          id: "3",
          title: "Cero Errores",
          description: "30 días sin devoluciones",
          icon: "✅",
          earned_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          points: 75,
        },
      ];

      // Filtrar tareas
      let filteredTasks = mockTasks;
      if (filterStatus !== "all") {
        filteredTasks = mockTasks.filter(t => t.status === filterStatus);
      }

      setTasks(filteredTasks);

      // Calcular performance
      const completed = mockTasks.filter(t => t.status === "completed").length;
      const pending = mockTasks.filter(t => t.status === "pending").length;

      setPerformance({
        tasks_completed: completed,
        tasks_pending: pending,
        on_time_rate: 85,
        rating: 4.5,
        points: 1250,
        level: 5,
        next_level_points: 1500,
        achievements: mockAchievements,
      });
    } catch (error) {
      console.error("Error loading employee data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
    try {
      // En producción, actualizaría en la API
      // await apiClient.tasks.updateStatus(taskId, newStatus);

      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      if (newStatus === "completed") {
        setPerformance(prev => ({
          ...prev,
          tasks_completed: prev.tasks_completed + 1,
          tasks_pending: Math.max(0, prev.tasks_pending - 1),
          points: prev.points + 10,
        }));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
    }
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();

    if (diff < 0) return "Vencida";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} día${days > 1 ? "s" : ""}`;
    return `${hours} hora${hours > 1 ? "s" : ""}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando tu espacio de trabajo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Welcome Header */}
      <div className="bg-primary text-white rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.full_name || "Empleado"}! 👋
            </h1>
            <p className="text-white/80">
              Tienes {performance.tasks_pending} tareas pendientes para hoy
            </p>
            {/* Branch Information - DESTACADO */}
            <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
              <Store size={18} />
              <div>
                <p className="text-xs text-white/70">Tu Sucursal</p>
                <p className="font-bold">
                  {(user as { branch?: { name: string } })?.branch?.name ||
                   `Sucursal ${user?.branch_id || "No asignada"}`}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-yellow-300" size={20} />
              <span className="text-2xl font-bold">{performance.rating}</span>
            </div>
            <p className="text-sm text-white/80">Calificación</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={18} />
              <span className="font-bold text-xl">{performance.tasks_completed}</span>
            </div>
            <p className="text-xs text-white/80">Completadas</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={18} />
              <span className="font-bold text-xl">{performance.on_time_rate}%</span>
            </div>
            <p className="text-xs text-white/80">A tiempo</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} />
              <span className="font-bold text-xl">{performance.points}</span>
            </div>
            <p className="text-xs text-white/80">Puntos</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Award size={18} />
              <span className="font-bold text-xl">Nivel {performance.level}</span>
            </div>
            <p className="text-xs text-white/80">
              {performance.next_level_points - performance.points} pts al siguiente
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Mis Tareas</h2>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-500 dark:text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as "all" | "pending" | "in_progress" | "completed")}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-800"
                >
                  <option value="all">Todas</option>
                  <option value="pending">Pendientes</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="completed">Completadas</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdateStatus={handleUpdateTaskStatus}
                    onSelect={() => setSelectedTask(task)}
                    getPriorityColor={getPriorityColor}
                    getTimeRemaining={getTimeRemaining}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <Coffee className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No hay tareas {filterStatus !== "all" ? filterStatus.replace("_", " ") : ""}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    ¡Excelente trabajo! Todas tus tareas están al día
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                <Package className="text-primary mx-auto mb-2" size={24} />
                <span className="text-xs text-gray-700 dark:text-gray-200">Ver Pedidos</span>
              </button>
              <button className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                <Calendar className="text-primary mx-auto mb-2" size={24} />
                <span className="text-xs text-gray-700 dark:text-gray-200">Mi Horario</span>
              </button>
              <button className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                <AlertCircle className="text-primary mx-auto mb-2" size={24} />
                <span className="text-xs text-gray-700 dark:text-gray-200">Reportar</span>
              </button>
              <button className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                <User className="text-primary mx-auto mb-2" size={24} />
                <span className="text-xs text-gray-700 dark:text-gray-200">Mi Perfil</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Award className="text-primary" size={20} />
              Logros Recientes
            </h3>
            <div className="space-y-3">
              {performance.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{achievement.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.description}</p>
                    <p className="text-xs text-primary font-medium mt-1">+{achievement.points} puntos</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-primary hover:text-primary-hover font-medium flex items-center justify-center gap-1">
              Ver todos los logros
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Target className="text-primary" size={20} />
              Mi Progreso
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Nivel {performance.level}</span>
                  <span className="text-gray-800 dark:text-gray-100 font-medium">
                    {performance.points} / {performance.next_level_points}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(performance.points / performance.next_level_points) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Tareas del Mes</span>
                  <span className="text-gray-800 dark:text-gray-100 font-medium">45 / 50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Puntualidad</span>
                  <span className="text-green-600 font-medium">95%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Precisión</span>
                  <span className="text-blue-600 font-medium">98%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">💡 Consejo del Día</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Organiza tus tareas por prioridad al inicio del día para maximizar tu productividad.
              ¡Las tareas urgentes primero!
            </p>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Detalles de Tarea</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Título</p>
                <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTask.title}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Descripción</p>
                <p className="text-gray-800 dark:text-gray-100">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Prioridad</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority === "high" ? "Alta" : selectedTask.priority === "medium" ? "Media" : "Baja"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Fecha Límite</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {new Date(selectedTask.due_date).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Asignado por</p>
                <p className="text-gray-800 dark:text-gray-100">{selectedTask.assigned_by}</p>
              </div>

              {selectedTask.order_id && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Pedido Relacionado</p>
                  <p className="font-medium text-primary">#{selectedTask.order_id}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedTask(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
              {selectedTask.status !== "completed" && (
                <button
                  onClick={() => {
                    handleUpdateTaskStatus(
                      selectedTask.id,
                      selectedTask.status === "pending" ? "in_progress" : "completed"
                    );
                    setSelectedTask(null);
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  {selectedTask.status === "pending" ? "Iniciar" : "Completar"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onUpdateStatus,
  onSelect,
  getPriorityColor,
  getTimeRemaining,
}: {
  task: Task;
  onUpdateStatus: (id: string, status: Task["status"]) => void;
  onSelect: () => void;
  getPriorityColor: (priority: Task["priority"]) => string;
  getTimeRemaining: (dueDate: string) => string;
}) {
  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-800 dark:text-gray-100">{task.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{getTimeRemaining(task.due_date)}</span>
          </div>
          {task.order_id && (
            <div className="flex items-center gap-1">
              <Package size={14} />
              <span>#{task.order_id}</span>
            </div>
          )}
        </div>

        {task.status !== "completed" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(
                task.id,
                task.status === "pending" ? "in_progress" : "completed"
              );
            }}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              task.status === "pending"
                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            {task.status === "pending" ? "Iniciar" : "Completar"}
          </button>
        )}

        {task.status === "completed" && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-lg">
            ✓ Completada
          </span>
        )}
      </div>
    </div>
  );
}
