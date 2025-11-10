"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { Truck, Package, Building2, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, Eye, X, User, ShoppingCart, Info, DollarSign, Store } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Order, Branch, OrderStatus } from "@/types/api";
import PaymentStatusModal from "@/components/PaymentStatusModal";
import { toast } from 'sonner';

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [draggedOrder, setDraggedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);

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

    // Verificar si la orden está pagada
    if (draggedOrder.payment_status !== "paid") {
      // Mostrar modal de pago primero
      setPaymentOrder(draggedOrder);
      setShowPaymentModal(true);
      // Guardar el branch seleccionado para después de confirmar el pago
      setSelectedBranch(branchId);
      setDraggedOrder(null);
      return;
    }

    // SIEMPRE mostrar modal para confirmar/editar fecha de entrega
    // Si la orden ya tiene fecha, la usa como default, si no, usa la fecha de hoy
    setSelectedOrder(draggedOrder);
    setSelectedBranch(branchId);
    setDeliveryDate(draggedOrder.delivery_date || new Date().toISOString().split('T')[0]);
    setShowAssignModal(true);
    setDraggedOrder(null);
  };

  const handleConfirmPayment = async (paymentMethod: string) => {
    if (!paymentOrder) return;

    try {
      // Actualizar el estatus de pago de la orden usando el endpoint de logistics
      await apiClient.logistics.updateOrderPayment(String(paymentOrder.id), {
        payment_status: "paid",
        payment_method: paymentMethod,
        logistics_confirmed: false,
      });

      toast.success("Pago confirmado exitosamente");

      // Actualizar la orden localmente
      const updatedOrder = { ...paymentOrder, payment_status: "paid", payment_method: paymentMethod };

      // Si ya se había seleccionado una sucursal, mostrar el modal de asignación
      if (selectedBranch) {
        setSelectedOrder(updatedOrder);
        setDeliveryDate(updatedOrder.delivery_date || new Date().toISOString().split('T')[0]);
        setShowAssignModal(true);
      }

      setShowPaymentModal(false);
      setPaymentOrder(null);
      loadData();
    } catch (error) {
      console.error("Error confirming payment:", error);
      throw error;
    }
  };

  const handleConfirmAssign = async () => {
    if (!selectedOrder || !selectedBranch || !deliveryDate) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    // Verificar que la orden esté pagada antes de asignar
    if (selectedOrder.payment_status !== "paid") {
      toast.error("La orden debe estar pagada antes de asignarla a una sucursal");
      setShowAssignModal(false);
      setPaymentOrder(selectedOrder);
      setShowPaymentModal(true);
      return;
    }

    try {
      setAssigning(true);

      // Intentar asignar usando el endpoint de órdenes
      const response = await apiClient.orders.assignToBranch(String(selectedOrder.id), {
        branch_id: selectedBranch,
        delivery_date: deliveryDate,
      });

      console.log("🔍 DEBUG - Respuesta completa de asignación:", response);
      console.log("🔍 DEBUG - response.data:", response.data);
      console.log("🔍 DEBUG - response.ipos_sent:", (response as unknown as { ipos_sent?: boolean }).ipos_sent);
      console.log("🔍 DEBUG - response.data?.ipos_sent:", response.data ? (response.data as Order & { ipos_sent?: boolean; ipos_order_id?: string }).ipos_sent : "no data");

      // IMPORTANTE: El backend puede retornar en diferentes formatos:
      // Formato 1: { success: true, data: Order, ipos_sent: true, ipos_order_id: "123" }
      // Formato 2: { success: true, data: { ...Order, ipos_sent: true, ipos_order_id: "123" } }

      // Intentar extraer ipos_sent de ambos niveles
      let iposSent: boolean | undefined;
      let iposOrderId: string | undefined;

      // Primero verificar en el nivel raíz de response
      if ('ipos_sent' in (response as unknown as Record<string, unknown>)) {
        iposSent = (response as unknown as { ipos_sent?: boolean }).ipos_sent;
        iposOrderId = (response as unknown as { ipos_order_id?: string }).ipos_order_id;
        console.log("✅ ipos_sent encontrado en nivel raíz:", iposSent, "ID:", iposOrderId);
      }
      // Si no está en raíz, verificar en response.data
      else if (response.data && typeof response.data === 'object') {
        const dataObj = response.data as Order & { ipos_sent?: boolean; ipos_order_id?: string };
        iposSent = dataObj.ipos_sent;
        iposOrderId = dataObj.ipos_order_id;
        console.log("✅ ipos_sent encontrado en data:", iposSent, "ID:", iposOrderId);
      }

      console.log("🎯 FINAL - iposSent:", iposSent, "- iposOrderId:", iposOrderId);

      let message = "✅ Orden asignada exitosamente";

      if (iposSent === true && iposOrderId) {
        // ✅ ÉXITO - La orden fue enviada a iPOS
        message += `\n\n📦 Orden enviada a iPOS\nTicket iPOS #${iposOrderId}`;
      } else if (iposSent === false || iposSent === undefined) {
        // ⚠️ ADVERTENCIA - La orden se asignó pero NO se envió a iPOS
        message += "\n\n⚠️ La orden no fue enviada a iPOS automáticamente.";
        // Verificar razones por las que no se envió
        if (selectedOrder.payment_status !== "paid") {
          message += "\nRazón: Pago no confirmado";
        } else if (!deliveryDate) {
          message += "\nRazón: Fecha de entrega no establecida";
        } else {
          message += "\nVerifica que todos los requisitos estén completos.";
        }
      }

      toast.success(message);
      setShowAssignModal(false);
      setSelectedOrder(null);
      setSelectedBranch("");
      setDeliveryDate("");
      loadData();
    } catch (error) {
      console.error("Error assigning order:", error);
      toast.error("Error al asignar la orden");
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async (orderId: string | number, newStatus: string) => {
    try {
      await apiClient.orders.updateStatus(String(orderId), {
        status: newStatus as OrderStatus,
      });
      toast.success(`Estado actualizado a: ${newStatus}`);
      loadData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  const handleViewDetails = (order: Order) => {
    setDetailOrder(order);
    setShowDetailsModal(true);
  };

  // Función para parsear fecha de entrega sin problemas de zona horaria
  // Convierte "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss" en fecha local
  const parseDeliveryDate = (dateString: string): string => {
    if (!dateString) return "";

    // Extraer solo la parte de la fecha (YYYY-MM-DD)
    const [datePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);

    // Crear fecha local (sin conversión de zona horaria)
    const localDate = new Date(year, month - 1, day);

    return localDate.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando asignaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Asignaciones</h1>
          <p className="text-gray-600 dark:text-gray-300">Arrastra y suelta órdenes para asignarlas a sucursales</p>
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
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
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
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-all bg-red-50 dark:bg-red-900/20"
                >
                  <div>
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, order)}
                      className="cursor-move"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                          {order.order_number || order.message_id || `#${order.id}`}
                        </p>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                          ${order.total_amount.toFixed(0)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                        {order.customer_name || (typeof order.metadata?.customer_name === 'string' ? order.metadata.customer_name : '') || "Cliente"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.items?.length || order.order_items?.length || order.products?.length || 0} productos
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={12} />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {order.payment_status !== "paid" && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center gap-1 text-xs text-yellow-800 dark:text-yellow-200 mb-2">
                          <AlertCircle size={12} />
                          <span className="font-medium">Pago pendiente</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPaymentOrder(order);
                            setShowPaymentModal(true);
                          }}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-1.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-1 text-xs"
                        >
                          <DollarSign size={12} />
                          Marcar como Pagado
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(order);
                    }}
                    className="w-full mt-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 py-1.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-1 text-xs"
                  >
                    <Eye size={12} />
                    Ver Detalle
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Package className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={48} />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No hay órdenes sin asignar</p>
              </div>
            )}
          </div>
        </div>

        {/* Branch Assignments */}
        <div className="lg:col-span-3">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Asignaciones por Sucursal</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.branch.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, assignment.branch.id)}
                className={`
                  bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-2 transition-all
                  ${draggedOrder ? "border-dashed border-primary" : "border-transparent"}
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="text-primary" size={20} />
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{assignment.branch.name}</h3>
                  </div>
                  <span className="bg-primary/10 text-primary text-xs font-bold rounded-full px-2 py-1">
                    {assignment.orders.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Total</p>
                    <p className="font-bold text-gray-800 dark:text-gray-100">${assignment.totalAmount.toFixed(0)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Productos</p>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{assignment.totalItems}</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {assignment.orders.length > 0 ? (
                    assignment.orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-xs text-gray-800 dark:text-gray-100">
                            {order.order_number || `#${order.id}`}
                          </p>
                          <StatusBadge status={order.status} size="xs" />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {order.customer_name || (typeof order.metadata?.customer_name === 'string' ? order.metadata.customer_name : '') || "Cliente"}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ${order.total_amount.toFixed(0)}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200"
                              title="Ver detalle"
                            >
                              <Eye size={14} />
                            </button>
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
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                      <Package className="text-gray-300 dark:text-gray-600 mx-auto mb-2" size={32} />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
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

      {/* Order Details Modal */}
      {showDetailsModal && detailOrder && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Detalle de la Orden</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {detailOrder.order_number || detailOrder.message_id || `#${detailOrder.id}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailOrder(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                <User size={18} />
                Información del Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Nombre:</span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                    {detailOrder.customer_name ||
                     (typeof detailOrder.metadata?.customer_name === 'string' ? detailOrder.metadata.customer_name : '') ||
                     (typeof detailOrder.metadata?.conversation_context === 'object' && detailOrder.metadata.conversation_context && 'ipos_client' in detailOrder.metadata.conversation_context ? String((detailOrder.metadata.conversation_context as Record<string, unknown>).ipos_client) : '') ||
                     "No especificado"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Teléfono:</span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                    {detailOrder.customer_phone || "No especificado"}
                  </span>
                </div>
                {(() => {
                  const context = detailOrder.metadata?.conversation_context as Record<string, unknown> | undefined;
                  const client = context?.ipos_client as Record<string, unknown> | undefined;
                  const email = client?.email;
                  return email && typeof email === 'string' ? (
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Email:</span>
                      <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                        {email}
                      </span>
                    </div>
                  ) : null;
                })()}
                <div className="col-span-2">
                  <span className="text-gray-600 dark:text-gray-300">Dirección de entrega:</span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                    {(() => {
                      if (detailOrder.delivery_address) {
                        return detailOrder.delivery_address;
                      }

                      const context = detailOrder.metadata?.conversation_context as Record<string, unknown> | undefined;
                      const client = context?.ipos_client as Record<string, unknown> | undefined;
                      const iposAddress = client?.address as Record<string, unknown> | undefined;
                      if (iposAddress) {
                        return `${iposAddress.street || ''} ${iposAddress.number || ''}, ${iposAddress.suburb || ''}, ${iposAddress.city || ''}, ${iposAddress.state || ''} C.P. ${iposAddress.zipCode || ''}`;
                      }

                      return "No especificada";
                    })()}
                  </span>
                </div>
                {(() => {
                  const source = detailOrder.metadata?.source;
                  return source && typeof source === 'string' ? (
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Origen:</span>
                      <span className="ml-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {source.replace('_', ' ').toUpperCase()}
                        </span>
                      </span>
                    </div>
                  ) : null;
                })()}
                {detailOrder.platform && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Plataforma:</span>
                    <span className="ml-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        detailOrder.platform === 'whatsapp' ? 'bg-green-100 text-green-800' :
                        detailOrder.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {detailOrder.platform.toUpperCase()}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Products List */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                <ShoppingCart size={18} />
                Productos Solicitados ({detailOrder.products?.length || detailOrder.items?.length || detailOrder.order_items?.length || 0})
              </h3>
              <div className="space-y-3">
                {((detailOrder.products || detailOrder.items || detailOrder.order_items || []) as Record<string, unknown>[]).map((item: Record<string, unknown>, index: number) => {
                  const productInfo = (item.product || item) as Record<string, unknown>;
                  const quantity = Number(item.quantity || item.qty || 1);
                  const price = Number(productInfo.price || productInfo.unit_price || productInfo.displayPrice || 0);
                  const name = String(productInfo.name || productInfo.product_name || "Producto");
                  const description = String(productInfo.description || "");
                  const sku = String(productInfo.sku || productInfo.SKU || "");
                  const brand = String(productInfo.brand || productInfo.Brand || "");
                  const category = String(productInfo.category || "");
                  const weight = Number(productInfo.weight || 0);

                  const iposData = productInfo.iposData as Record<string, unknown> | undefined;
                  const pictures = iposData?.Pictures as Array<Record<string, unknown>> | undefined;
                  const pictureUrl = typeof pictures?.[0]?.PictureUrl === 'string' ? pictures[0].PictureUrl : undefined;
                  const imageUrl = (typeof productInfo.image_url === 'string' ? productInfo.image_url : '') ||
                                   (typeof productInfo.imageUrl === 'string' ? productInfo.imageUrl : '') ||
                                   pictureUrl || "";

                  const productVariations = iposData?.ProductVariations as Array<Record<string, unknown>> | undefined;
                  const variationInfo = productVariations?.find(
                    (v: Record<string, unknown>) => v.ID === productInfo.variationId
                  ) as Record<string, unknown> | undefined || {};

                  return (
                    <div key={String(productInfo.id || index)} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        {imageUrl && (
                          <div className="flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageUrl}
                              alt={name}
                              className="w-24 h-24 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/96x96?text=Sin+Imagen";
                              }}
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">{name}</h4>
                              {brand && <p className="text-sm text-gray-600 dark:text-gray-300">Marca: {brand}</p>}
                              {sku && <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {sku}</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">${(price * quantity).toFixed(2)}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{quantity} x ${price.toFixed(2)}</p>
                            </div>
                          </div>

                          {description && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2"
                                 dangerouslySetInnerHTML={{
                                   __html: description.replace(/<br\s*\/?>/gi, ' ')
                                 }}
                              />
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3 text-xs">
                            {category && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                {category}
                              </span>
                            )}
                            {weight > 0 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded">
                                Peso: {weight} kg
                              </span>
                            )}
                            {(() => {
                              const attr2 = variationInfo.Attribute2;
                              return attr2 && typeof attr2 === 'string' ? (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                                  {attr2}
                                </span>
                              ) : null;
                            })()}
                            {productInfo.requiresShipping === true && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                                Requiere envío
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    ${((detailOrder.total_amount || 0) / 1.16).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">IVA (16%):</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    ${((detailOrder.total_amount || 0) - ((detailOrder.total_amount || 0) / 1.16)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">Total:</span>
                  <span className="text-xl font-bold text-primary">
                    ${(detailOrder.total_amount || 0).toFixed(2)} {(typeof detailOrder.metadata?.currency === 'string' ? detailOrder.metadata.currency : '') || "MXN"}
                  </span>
                </div>
              </div>

              {(!detailOrder.products && !detailOrder.items && !detailOrder.order_items) ||
               ((detailOrder.products?.length || 0) + (detailOrder.items?.length || 0) + (detailOrder.order_items?.length || 0) === 0) ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay productos detallados en esta orden</p>
              ) : null}
            </div>

            {/* Order Details */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                <Info size={18} />
                Información de la Orden
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Estado:</span>
                  <span className="ml-2">
                    <StatusBadge status={detailOrder.status} size="sm" />
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Fecha de creación:</span>
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                    {new Date(detailOrder.created_at).toLocaleString("es-ES")}
                  </span>
                </div>
                {detailOrder.delivery_date && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Fecha de entrega:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                      {parseDeliveryDate(detailOrder.delivery_date)}
                    </span>
                  </div>
                )}
                {detailOrder.notes && (
                  <div className="col-span-2">
                    <span className="text-gray-600 dark:text-gray-300">Notas:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                      {detailOrder.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailOrder(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Modal */}
      {showPaymentModal && paymentOrder && (
        <PaymentStatusModal
          order={paymentOrder}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentOrder(null);
          }}
          onConfirm={handleConfirmPayment}
        />
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Package className="text-primary" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Confirmar Asignación</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Por favor confirma los detalles</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Orden</p>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                  {selectedOrder.order_number || selectedOrder.message_id || `#${selectedOrder.id}`}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {selectedOrder.customer_name || "Cliente"}
                </p>
              </div>

              {selectedOrder.payment_status === "paid" && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                    <CheckCircle size={16} />
                    <span className="font-medium">Pago confirmado</span>
                  </div>
                  {selectedOrder.payment_method && (
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1 ml-6">
                      Método: {selectedOrder.payment_method}
                    </p>
                  )}
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Asignar a</p>
                <div className="flex items-center gap-2">
                  <Store size={18} className="text-blue-600" />
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {assignments.find(a => a.branch.id === selectedBranch)?.branch.name}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Fecha de Entrega <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Selecciona la fecha en que se entregará la orden
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedOrder(null);
                  setSelectedBranch("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
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

function StatusBadge({ status, size = "sm" }: { status: string; size?: "xs" | "sm" }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200" },
    pending_logistics: { label: "Por Asignar", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200" },
    assigned: { label: "Asignada", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200" },
    in_progress: { label: "En Proceso", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200" },
    completed: { label: "Completada", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" },
    cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200" },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const sizeClass = size === "xs" ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span className={`inline-block font-medium rounded-full ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  );
}