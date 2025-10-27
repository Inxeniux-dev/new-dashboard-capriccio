"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { Calendar, Package, MapPin, Clock, ChevronLeft, ChevronRight, Filter, Truck, Eye, X, User, Phone, ShoppingCart, Info } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Order, Branch } from "@/types/api";

export default function LogisticsCalendarPage() {
  const { loading } = useRequireAuth(["logistics", "logistica", "admin"]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoadingData(true);

      // Cargar órdenes y sucursales en paralelo con manejo de errores individual
      const [ordersResponse, branchesResponse] = await Promise.all([
        apiClient.orders.getAll({ limit: 200 }).catch((error) => {
          // Si es error 401, ya se manejó en api-client (redirección a login) - no logear
          if (error.status !== 401 && error.details !== "auth_redirect") {
            console.error("Error loading orders:", error);
          }
          return { data: [], orders: [] };
        }),
        apiClient.branches.getAll().catch((error) => {
          // Si es error 401, ya se manejó en api-client (redirección a login) - no logear
          if (error.status !== 401 && error.details !== "auth_redirect") {
            console.error("Error loading branches:", error);
          }
          return { data: [] };
        }),
      ]);

      const ordersData = (ordersResponse as { data?: Order[]; orders?: Order[] }).orders ||
                        (ordersResponse as { data?: Order[]; orders?: Order[] }).data || [];

      // Filtrar órdenes con fecha de entrega
      const ordersWithDelivery = ordersData.filter((o: Order) => o.delivery_date);

      // Filtrar por sucursal si es necesario
      const filteredOrders = selectedBranch === "all"
        ? ordersWithDelivery
        : ordersWithDelivery.filter((o: Order) => o.store_id === selectedBranch || o.branch_id === selectedBranch);

      setOrders(filteredOrders);
      setBranches(branchesResponse.data || []);
    } catch (error) {
      // Solo logear errores que no sean de autenticación
      const err = error as { status?: number; details?: string };
      if (err.status !== 401 && err.details !== "auth_redirect") {
        console.error("Error loading calendar data:", error);
      }
      // Los errores de autenticación (401) se manejan automáticamente en api-client
    } finally {
      setLoadingData(false);
    }
  }, [selectedBranch]);

  useEffect(() => {
    loadData();
  }, [currentMonth, selectedBranch, loadData]);

  // Función para parsear fechas sin problemas de zona horaria
  const parseLocalDate = (dateString: string): Date => {
    // Parsear "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss" como fecha local
    const [datePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    // Mes - 1 porque en JavaScript los meses van de 0-11
    return new Date(year, month - 1, day);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Agregar días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Agregar días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getOrdersForDate = (date: Date) => {
    return orders.filter(order => {
      if (!order.delivery_date) return false;
      const deliveryDate = parseLocalDate(order.delivery_date);
      return (
        deliveryDate.getDate() === date.getDate() &&
        deliveryDate.getMonth() === date.getMonth() &&
        deliveryDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleViewDetails = (order: Order) => {
    setDetailOrder(order);
    setShowDetailsModal(true);
  };

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Calendario de Entregas</h1>
          <p className="text-gray-600 dark:text-gray-300">Vista mensual de entregas programadas</p>
        </div>

        <div className="flex items-center gap-3">
          <Filter size={18} className="text-gray-500 dark:text-gray-400" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Todas las sucursales</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-200"
            >
              <ChevronLeft size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 capitalize">
              {formatMonthYear(currentMonth)}
            </h2>

            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-300 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-24" />;
              }

              const dayOrders = getOrdersForDate(date);
              const isSelected = selectedDate?.toDateString() === date.toDateString();

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    h-24 p-2 border rounded-lg transition-all
                    ${isToday(date) ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-gray-200 dark:border-gray-700"}
                    ${isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-md"}
                    ${dayOrders.length > 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-700"}
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className={`text-sm font-semibold ${isToday(date) ? "text-primary" : "text-gray-700 dark:text-gray-200"}`}>
                      {date.getDate()}
                    </span>

                    {dayOrders.length > 0 && (
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="bg-primary text-white text-xs rounded-full px-2 py-1">
                          {dayOrders.length} {dayOrders.length === 1 ? "entrega" : "entregas"}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          ${dayOrders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(0)}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Calendar className="text-primary" size={20} />
            {selectedDate
              ? selectedDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long"
                })
              : "Selecciona una fecha"
            }
          </h3>

          {selectedDate ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {getOrdersForDate(selectedDate).length > 0 ? (
                getOrdersForDate(selectedDate).map((order) => (
                  <DeliveryCard key={order.id} order={order} branches={branches} onViewDetails={handleViewDetails} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Truck className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400">No hay entregas programadas</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">
                Selecciona una fecha del calendario para ver las entregas
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total del Mes"
          value={orders.length}
          subtitle="entregas programadas"
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Esta Semana"
          value={orders.filter(o => {
            if (!o.delivery_date) return false;
            const date = parseLocalDate(o.delivery_date);
            const now = new Date();
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            return date >= weekStart && date <= weekEnd;
          }).length}
          subtitle="entregas"
          icon={Calendar}
          color="bg-green-500"
        />
        <StatCard
          title="Hoy"
          value={orders.filter(o => {
            if (!o.delivery_date) return false;
            return parseLocalDate(o.delivery_date).toDateString() === new Date().toDateString();
          }).length}
          subtitle="entregas pendientes"
          icon={Clock}
          color="bg-orange-500"
        />
        <StatCard
          title="Valor Total"
          value={`$${orders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(0)}`}
          subtitle="en entregas"
          icon={Truck}
          color="bg-purple-500"
        />
      </div>

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
                    <StatusBadge status={detailOrder.status} className="" />
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeliveryCard({ order, branches, onViewDetails }: { order: Order; branches: Branch[]; onViewDetails: (order: Order) => void }) {
  const branch = branches.find(b => b.id === (order.store_id || order.branch_id));
  const customerName = order.customer_name || (typeof order.metadata?.customer_name === 'string' ? order.metadata.customer_name : '') || "Cliente";

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-700">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            {order.order_number || order.message_id || `#${order.id}`}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{customerName}</p>
        </div>
        <span className="font-bold text-gray-800 dark:text-gray-100">
          ${order.total_amount.toFixed(2)}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        {branch && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <MapPin size={14} />
            <span>{branch.name}</span>
          </div>
        )}

        {order.delivery_address && (
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
            <MapPin size={14} className="mt-0.5" />
            <span className="text-xs">{order.delivery_address}</span>
          </div>
        )}

        {order.delivery_date && order.delivery_date.includes('T') && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Clock size={14} />
            <span>
              {new Date(order.delivery_date).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Package size={14} />
          <span>
            {order.items?.length || order.order_items?.length || order.products?.length || 0} productos
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 gap-2">
        <StatusBadge status={order.status} className="" />
        <button
          onClick={() => onViewDetails(order)}
          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 rounded-lg transition-colors font-medium flex items-center justify-center gap-1 text-xs"
        >
          <Eye size={14} />
          Ver Detalle
        </button>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200" },
    pending_logistics: { label: "Por Asignar", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200" },
    assigned: { label: "Asignada", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200" },
    in_progress: { label: "En proceso", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200" },
    completed: { label: "Completada", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" },
    cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${config.color} ${className}`}>
      {config.label}
    </span>
  );
}