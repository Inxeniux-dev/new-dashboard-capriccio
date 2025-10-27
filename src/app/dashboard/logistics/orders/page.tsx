"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { Package, Filter, Calendar, MapPin, User, Phone, Eye, ShoppingCart, Info, X, CheckCircle, DollarSign, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Order, Branch } from "@/types/api";
import PaymentStatusModal from "@/components/PaymentStatusModal";

export default function LogisticsOrdersPage() {
  const { user, loading } = useRequireAuth(["logistics", "logistica", "admin"]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("unassigned");
  const [loadingData, setLoadingData] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filterStatus]);

  const loadData = async () => {
    try {
      setLoadingData(true);

      // Cargar órdenes - el backend devuelve un objeto con "orders"
      const ordersResponse = await apiClient.logistics.getPendingOrders({ limit: 100 }) as { orders?: Order[]; data?: Order[] };
      let ordersData = ordersResponse.orders || ordersResponse.data || [];

      // Filtrar según el estado seleccionado
      if (filterStatus === "unassigned") {
        ordersData = ordersData.filter((o: Order) => !o.store_id || o.status === "pending_logistics");
      } else if (filterStatus === "assigned") {
        ordersData = ordersData.filter((o: Order) => o.store_id && o.status !== "pending_logistics");
      }

      setOrders(ordersData);

      // Cargar sucursales disponibles desde iPOS locations
      try {
        const locationsResponse = await apiClient.ipos.getLocations();
        console.log("iPOS locations response:", locationsResponse); // Debug log

        // Filtrar sucursales únicas por ID y asegurarse de que tengan ID
        const uniqueBranches = (locationsResponse.data || [])
          .filter((branch, index, self) =>
            branch.id && self.findIndex(b => b.id === branch.id) === index
          );

        console.log("Filtered unique branches:", uniqueBranches); // Debug log
        setBranches(uniqueBranches);
      } catch (error) {
        console.error("Error loading iPOS locations:", error);
        // Si falla el endpoint de iPOS, intentar con el endpoint de branches como fallback
        try {
          const branchesResponse = await apiClient.branches.getAll();
          console.log("Branches fallback response:", branchesResponse); // Debug log

          // Filtrar sucursales únicas por ID y asegurarse de que tengan ID
          const uniqueBranches = (branchesResponse.data || [])
            .filter((branch, index, self) =>
              branch.id && self.findIndex(b => b.id === branch.id) === index
            );
          setBranches(uniqueBranches);
        } catch (fallbackError) {
          console.error("Error loading branches (fallback):", fallbackError);
          setBranches([]);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAssignOrder = (order: Order) => {
    // Verificar si la orden está pagada antes de permitir asignarla
    if (order.payment_status !== "paid") {
      setPaymentOrder(order);
      setShowPaymentModal(true);
      return;
    }

    setSelectedOrder(order);
    setShowAssignModal(true);
    setDeliveryDate(order.delivery_date || "");
  };

  const handleConfirmPayment = async (paymentMethod: string) => {
    if (!paymentOrder) return;

    try {
      // Actualizar el estatus de pago de la orden
      await apiClient.logistics.updateOrderPayment(String(paymentOrder.id), {
        payment_status: "paid",
        payment_method: paymentMethod,
        logistics_confirmed: false,
      });

      alert("Pago confirmado exitosamente");

      // Actualizar la orden localmente
      const updatedOrder = { ...paymentOrder, payment_status: "paid", payment_method: paymentMethod };

      // Mostrar modal de asignación
      setSelectedOrder(updatedOrder);
      setShowAssignModal(true);
      setDeliveryDate(updatedOrder.delivery_date || "");

      setShowPaymentModal(false);
      setPaymentOrder(null);
      loadData();
    } catch (error) {
      console.error("Error confirming payment:", error);
      throw error;
    }
  };

  const handleViewDetails = (order: Order) => {
    setDetailOrder(order);
    setShowDetailsModal(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedOrder || !selectedBranch || !deliveryDate) {
      alert("Por favor completa todos los campos");
      return;
    }

    // Verificar que la orden esté pagada antes de asignar
    if (selectedOrder.payment_status !== "paid") {
      alert("La orden debe estar pagada antes de asignarla a una sucursal");
      setShowAssignModal(false);
      setPaymentOrder(selectedOrder);
      setShowPaymentModal(true);
      return;
    }

    try {
      setAssigning(true);

      // Llamar al API para asignar la orden
      await apiClient.orders.assignToBranch(String(selectedOrder.id), {
        branch_id: selectedBranch,
        delivery_date: deliveryDate,
      });

      // Actualizar el estado local inmediatamente para reflejar el cambio
      setOrders(prevOrders => {
        // Si estamos en vista "unassigned", remover la orden de la lista
        if (filterStatus === "unassigned") {
          return prevOrders.filter(order => order.id !== selectedOrder.id);
        }
        // Si estamos en vista "all" o "assigned", actualizar la orden
        return prevOrders.map(order => {
          if (order.id === selectedOrder.id) {
            return {
              ...order,
              store_id: selectedBranch,
              branch_id: selectedBranch,
              delivery_date: deliveryDate,
              status: "assigned", // Cambiar estado a asignado
              logistics_confirmed: true,
            };
          }
          return order;
        });
      });

      alert("Orden asignada exitosamente");
      setShowAssignModal(false);
      setSelectedOrder(null);
      setSelectedBranch("");
      setDeliveryDate("");

      // Recargar datos del servidor en segundo plano para sincronizar
      setTimeout(() => loadData(), 500);
    } catch (error) {
      console.error("Error assigning order:", error);
      alert("Error al asignar la orden. Verifica que el endpoint esté implementado.");
    } finally {
      setAssigning(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Órdenes Pendientes</h1>
          <p className="text-gray-600 dark:text-gray-300">Asigna órdenes a las sucursales</p>
        </div>

        <div className="flex items-center gap-3">
          <Filter size={18} className="text-gray-500 dark:text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="unassigned">Sin asignar</option>
            <option value="assigned">Asignadas</option>
            <option value="all">Todas</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Sin Asignar</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {orders.filter((o) => !o.store_id || o.status === "pending_logistics").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Asignadas</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {orders.filter((o) => o.store_id && o.status !== "pending_logistics" && o.status !== "completed").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total Órdenes</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{orders.length}</p>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAssign={() => handleAssignOrder(order)}
                onViewDetails={() => handleViewDetails(order)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Package className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={64} />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No hay órdenes {filterStatus === "unassigned" ? "sin asignar" : ""}</p>
            </div>
          )}
        </div>
      </div>

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Asignar Orden</h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Orden</p>
                <p className="font-bold text-gray-800 dark:text-gray-100">
                  {selectedOrder.order_number || selectedOrder.message_id || `#${selectedOrder.id}`}
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

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Cliente</p>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {selectedOrder.customer_name || (typeof selectedOrder.metadata?.customer_name === 'string' ? selectedOrder.metadata.customer_name : '') || "Cliente"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedOrder.customer_phone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Sucursal Disponible
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Selecciona una sucursal</option>
                  {branches.length > 0 ? (
                    branches.map((branch, index) => (
                      <option key={branch.id || `branch-${index}`} value={branch.id || ""}>
                        {branch.name} {branch.address ? `- ${branch.address}` : ""}
                      </option>
                    ))
                  ) : (
                    <option key="no-branches" value="" disabled>No hay sucursales disponibles</option>
                  )}
                </select>
                {selectedBranch && branches.find(b => b.id === selectedBranch)?.address && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      <MapPin size={12} className="inline mr-1" />
                      {branches.find(b => b.id === selectedBranch)?.address}
                    </p>
                    {branches.find(b => b.id === selectedBranch)?.phone && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        <Phone size={12} className="inline mr-1" />
                        {branches.find(b => b.id === selectedBranch)?.phone}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Fecha de Entrega
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                  setDeliveryDate("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={assigning}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAssign}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                disabled={assigning}
              >
                {assigning ? "Asignando..." : "Asignar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && detailOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                      // Try to get address from different sources
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
                  // Handle different data structures
                  const productInfo = (item.product || item) as Record<string, unknown>;
                  const quantity = Number(item.quantity || item.qty || 1);
                  const price = Number(productInfo.price || productInfo.unit_price || productInfo.displayPrice || 0);
                  const name = String(productInfo.name || productInfo.product_name || "Producto");
                  const description = String(productInfo.description || "");
                  const sku = String(productInfo.sku || productInfo.SKU || "");
                  const brand = String(productInfo.brand || productInfo.Brand || "");
                  const category = String(productInfo.category || "");
                  const weight = Number(productInfo.weight || 0);

                  // Safely extract imageUrl from iposData
                  const iposData = productInfo.iposData as Record<string, unknown> | undefined;
                  const pictures = iposData?.Pictures as Array<Record<string, unknown>> | undefined;
                  const pictureUrl = typeof pictures?.[0]?.PictureUrl === 'string' ? pictures[0].PictureUrl : undefined;
                  const imageUrl = (typeof productInfo.image_url === 'string' ? productInfo.image_url : '') ||
                                   (typeof productInfo.imageUrl === 'string' ? productInfo.imageUrl : '') ||
                                   pictureUrl || "";

                  // Safely extract variation info
                  const productVariations = iposData?.ProductVariations as Array<Record<string, unknown>> | undefined;
                  const variationInfo = productVariations?.find(
                    (v: Record<string, unknown>) => v.ID === productInfo.variationId
                  ) as Record<string, unknown> | undefined || {};

                  return (
                    <div key={String(productInfo.id || index)} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        {/* Product Image */}
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

                        {/* Product Details */}
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

                          {/* Description */}
                          {description && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2"
                                 dangerouslySetInnerHTML={{
                                   __html: description.replace(/<br\s*\/?>/gi, ' ')
                                 }}
                              />
                            </div>
                          )}

                          {/* Additional Info */}
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
                    <StatusBadge status={detailOrder.status} />
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
                      {new Date(detailOrder.delivery_date).toLocaleDateString("es-ES")}
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
              {(!detailOrder.store_id || detailOrder.status === "pending_logistics") && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleAssignOrder(detailOrder);
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Asignar a Sucursal
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onAssign, onViewDetails }: { order: Order; onAssign: () => void; onViewDetails: () => void }) {
  const customerName = order.customer_name || (typeof order.metadata?.customer_name === 'string' ? order.metadata.customer_name : '') || "Cliente";
  const orderId = order.order_number || order.message_id || `#${order.id}`;
  const itemCount = order.items?.length || order.order_items?.length || order.products?.length || 0;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{orderId}</p>
          <StatusBadge status={order.status} />
        </div>
        <span className="text-lg font-bold text-gray-800 dark:text-gray-100">${order.total_amount.toFixed(2)}</span>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <User size={14} className="text-gray-500 dark:text-gray-400" />
          <span>{customerName}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Phone size={14} className="text-gray-500 dark:text-gray-400" />
          <span>{order.customer_phone}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Package size={14} className="text-gray-500 dark:text-gray-400" />
          <span>{itemCount} productos</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Calendar size={14} className="text-gray-500 dark:text-gray-400" />
          <span>{new Date(order.created_at).toLocaleDateString()}</span>
        </div>
        {order.delivery_address && (
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <MapPin size={14} className="text-gray-500 dark:text-gray-400" />
            <span className="text-xs">{order.delivery_address}</span>
          </div>
        )}
      </div>

      {order.payment_status !== "paid" && (
        <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
            <AlertCircle size={14} />
            <span className="font-medium">Pago pendiente</span>
          </div>
        </div>
      )}

      {order.payment_status === "paid" && order.payment_method && (
        <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
            <CheckCircle size={14} />
            <span className="font-medium">Pagado - {order.payment_method}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          Ver Detalle
        </button>
        {!order.store_id || order.status === "pending_logistics" ? (
          <button
            onClick={onAssign}
            className={`flex-1 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
              order.payment_status !== "paid"
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : "bg-primary hover:bg-primary-hover text-white"
            }`}
          >
            {order.payment_status !== "paid" ? (
              <>
                <DollarSign size={16} />
                Confirmar Pago
              </>
            ) : (
              "Asignar"
            )}
          </button>
        ) : (
          <div className="flex-1 text-center py-2 text-sm text-green-600 font-medium bg-green-50 rounded-lg">
            ✓ Asignada
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    pending_logistics: { label: "Por Asignar", color: "bg-orange-100 text-orange-800" },
    unassigned: { label: "Sin asignar", color: "bg-red-100 text-red-800" },
    assigned: { label: "Asignada", color: "bg-blue-100 text-blue-800" },
    in_progress: { label: "En proceso", color: "bg-indigo-100 text-indigo-800" },
    completed: { label: "Completada", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelada", color: "bg-gray-100 text-gray-800" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${config.color} mt-1`}>
      {config.label}
    </span>
  );
}
