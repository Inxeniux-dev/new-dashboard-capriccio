"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { Truck, Package, Building2, Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Order, Branch, OrderStatus } from "@/types/api";

interface Assignment {
  branch: Branch;
  orders: Order[];
  totalAmount: number;
  totalItems: number;
}

export default function LogisticsAssignmentsPage() {
  const { loading } = useRequireAuth(["logistics", "logistica", "admin"]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [draggedOrder, setDraggedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);

      // Cargar órdenes
      const ordersResponse = await apiClient.logistics.getPendingOrders({ limit: 200 }) as { orders?: Order[]; data?: Order[] };
      const ordersData = ordersResponse.orders || ordersResponse.data || [];

      // Cargar sucursales disponibles desde iPOS locations
      let branchesData: Branch[] = [];
      try {
        const locationsResponse = await apiClient.ipos.getLocations();
        console.log("iPOS locations response (assignments):", locationsResponse); // Debug log

        // Filtrar sucursales únicas por ID y asegurarse de que tengan ID
        branchesData = (locationsResponse.data || [])
          .filter((branch, index, self) =>
            branch.id && self.findIndex(b => b.id === branch.id) === index
          );
        console.log("Filtered branches (assignments):", branchesData); // Debug log
      } catch (error) {
        console.error("Error loading iPOS locations:", error);
        // Si falla el endpoint de iPOS, intentar con el endpoint de branches como fallback
        try {
          const branchesResponse = await apiClient.branches.getAll();
          console.log("Branches fallback response (assignments):", branchesResponse); // Debug log

          // Filtrar sucursales únicas por ID y asegurarse de que tengan ID
          branchesData = (branchesResponse.data || [])
            .filter((branch, index, self) =>
              branch.id && self.findIndex(b => b.id === branch.id) === index
            );
        } catch (fallbackError) {
          console.error("Error loading branches (fallback):", fallbackError);
          branchesData = [];
        }
      }

      // Separar órdenes asignadas y no asignadas
      const unassigned = ordersData.filter((o: Order) => !o.store_id && !o.branch_id);
      const assigned = ordersData.filter((o: Order) => o.store_id || o.branch_id);

      setUnassignedOrders(unassigned);

      // Agrupar órdenes por sucursal
      const assignmentMap: Record<string, Assignment> = {};

      branchesData.forEach((branch: Branch) => {
        const branchOrders = assigned.filter(
          (o: Order) => o.store_id === branch.id || o.branch_id === branch.id
        );

        if (branchOrders.length > 0 || branch.active) {
          assignmentMap[branch.id] = {
            branch,
            orders: branchOrders,
            totalAmount: branchOrders.reduce((sum: number, o: Order) => sum + o.total_amount, 0),
            totalItems: branchOrders.reduce((sum: number, o: Order) => {
              const items = o.items?.length || o.order_items?.length || o.products?.length || 0;
              return sum + items;
            }, 0)
          };
        }
      });

      setAssignments(Object.values(assignmentMap));
    } catch (error) {
      console.error("Error loading assignments:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, order: Order) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, branchId: string) => {
    e.preventDefault();

    if (!draggedOrder) return;

    // Mostrar modal para confirmar fecha de entrega
    setSelectedOrder(draggedOrder);
    setSelectedBranch(branchId);
    setDeliveryDate(draggedOrder.delivery_date || new Date().toISOString().split('T')[0]);
    setShowAssignModal(true);
    setDraggedOrder(null);
  };

  const handleConfirmAssign = async () => {
    if (!selectedOrder || !selectedBranch || !deliveryDate) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      setAssigning(true);

      // Intentar asignar usando el endpoint de órdenes
      await apiClient.orders.assignToBranch(String(selectedOrder.id), {
        branch_id: selectedBranch,
        delivery_date: deliveryDate,
      });

      alert("Orden asignada exitosamente");
      setShowAssignModal(false);
      setSelectedOrder(null);
      setSelectedBranch("");
      setDeliveryDate("");
      loadData();
    } catch (error) {
      console.error("Error assigning order:", error);
      alert("Error al asignar la orden");
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async (orderId: string | number, newStatus: string) => {
    try {
      await apiClient.orders.updateStatus(String(orderId), {
        status: newStatus as OrderStatus,
      });
      alert(`Estado actualizado a: ${newStatus}`);
      loadData();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error al actualizar el estado");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando asignaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Asignaciones</h1>
          <p className="text-gray-600">Arrastra y suelta órdenes para asignarlas a sucursales</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          title="Sin Asignar"
          value={unassignedOrders.length}
          color="bg-red-500"
        />
        <StatCard
          icon={Truck}
          title="En Proceso"
          value={assignments.reduce((sum, a) => sum + a.orders.filter(o => o.status === "in_progress").length, 0)}
          color="bg-blue-500"
        />
        <StatCard
          icon={CheckCircle}
          title="Completadas Hoy"
          value={assignments.reduce((sum, a) => sum + a.orders.filter(o => {
            if (o.status !== "completed") return false;
            const completedDate = o.completed_date ? new Date(o.completed_date) : null;
            return completedDate?.toDateString() === new Date().toDateString();
          }).length, 0)}
          color="bg-green-500"
        />
        <StatCard
          icon={Building2}
          title="Sucursales Activas"
          value={assignments.filter(a => a.orders.length > 0).length}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Unassigned Orders */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            Órdenes Sin Asignar
            <span className="bg-red-100 text-red-800 text-xs font-bold rounded-full px-2 py-1">
              {unassignedOrders.length}
            </span>
          </h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {unassignedOrders.length > 0 ? (
              unassignedOrders.map((order) => (
                <div
                  key={order.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, order)}
                  className="border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-all hover:scale-105 bg-red-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-sm text-gray-800">
                      {order.order_number || order.message_id || `#${order.id}`}
                    </p>
                    <span className="text-sm font-bold text-gray-800">
                      ${order.total_amount.toFixed(0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    {order.customer_name || (typeof order.metadata?.customer_name === 'string' ? order.metadata.customer_name : '') || "Cliente"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.items?.length || order.order_items?.length || order.products?.length || 0} productos
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Clock size={12} />
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Package className="text-gray-300 mx-auto mb-4" size={48} />
                <p className="text-gray-500 text-sm">No hay órdenes sin asignar</p>
              </div>
            )}
          </div>
        </div>

        {/* Branch Assignments */}
        <div className="lg:col-span-3">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Asignaciones por Sucursal</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.branch.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, assignment.branch.id)}
                className={`
                  bg-white rounded-xl shadow-md p-4 border-2 transition-all
                  ${draggedOrder ? "border-dashed border-primary" : "border-transparent"}
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="text-primary" size={20} />
                    <h3 className="font-bold text-gray-800">{assignment.branch.name}</h3>
                  </div>
                  <span className="bg-primary/10 text-primary text-xs font-bold rounded-full px-2 py-1">
                    {assignment.orders.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Total</p>
                    <p className="font-bold text-gray-800">${assignment.totalAmount.toFixed(0)}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Productos</p>
                    <p className="font-bold text-gray-800">{assignment.totalItems}</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {assignment.orders.length > 0 ? (
                    assignment.orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-2 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-xs text-gray-800">
                            {order.order_number || `#${order.id}`}
                          </p>
                          <StatusBadge status={order.status} size="xs" />
                        </div>
                        <p className="text-xs text-gray-600">
                          {order.customer_name || (typeof order.metadata?.customer_name === 'string' ? order.metadata.customer_name : '') || "Cliente"}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            ${order.total_amount.toFixed(0)}
                          </span>
                          <div className="flex gap-1">
                            {order.status === "assigned" && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, "in_progress")}
                                className="p-1 hover:bg-blue-50 rounded text-blue-600"
                                title="En proceso"
                              >
                                <ArrowRight size={14} />
                              </button>
                            )}
                            {order.status === "in_progress" && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, "completed")}
                                className="p-1 hover:bg-green-50 rounded text-green-600"
                                title="Completar"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateStatus(order.id, "cancelled")}
                              className="p-1 hover:bg-red-50 rounded text-red-600"
                              title="Cancelar"
                            >
                              <XCircle size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                      <Package className="text-gray-300 mx-auto mb-2" size={32} />
                      <p className="text-xs text-gray-500">
                        Arrastra órdenes aquí para asignarlas
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirmar Asignación</h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Orden</p>
                <p className="font-bold text-gray-800">
                  {selectedOrder.order_number || selectedOrder.message_id || `#${selectedOrder.id}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Sucursal</p>
                <p className="font-semibold text-gray-800">
                  {assignments.find(a => a.branch.id === selectedBranch)?.branch.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Entrega
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedOrder(null);
                  setSelectedBranch("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={assigning}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAssign}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
                disabled={assigning}
              >
                {assigning ? "Asignando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, size = "sm" }: { status: string; size?: "xs" | "sm" }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    pending_logistics: { label: "Por Asignar", color: "bg-orange-100 text-orange-800" },
    assigned: { label: "Asignada", color: "bg-blue-100 text-blue-800" },
    in_progress: { label: "En Proceso", color: "bg-indigo-100 text-indigo-800" },
    completed: { label: "Completada", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const sizeClass = size === "xs" ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span className={`inline-block font-medium rounded-full ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  );
}