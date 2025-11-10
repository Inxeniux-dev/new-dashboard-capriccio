"use client";

import { useState } from "react";
import { X, CreditCard, Banknote, Link as LinkIcon, Wallet } from "lucide-react";
import type { Order } from "@/types/api";
import { toast } from 'sonner';

interface PaymentStatusModalProps {
  order: Order;
  onClose: () => void;
  onConfirm: (paymentMethod: string) => Promise<void>;
}

const PAYMENT_METHODS = [
  { value: "transferencia", label: "Transferencia Bancaria", icon: Banknote },
  { value: "link-temp", label: "Link de Pago", icon: LinkIcon },
  { value: "efectivo", label: "Efectivo", icon: Wallet },
  { value: "tarjeta", label: "Tarjeta de Crédito/Débito", icon: CreditCard },
];

export default function PaymentStatusModal({
  order,
  onClose,
  onConfirm,
}: PaymentStatusModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!selectedMethod) {
      toast.error("Por favor selecciona un método de pago");
      return;
    }

    try {
      setConfirming(true);
      await onConfirm(selectedMethod);
      onClose();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Error al actualizar el estatus de pago");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Confirmar Pago
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Orden: {order.order_number || order.message_id || `#${order.id}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={confirming}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Esta orden aún no ha sido pagada. Selecciona el método de pago utilizado para marcarla como pagada.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Selecciona el método de pago
            </label>

            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.value}
                  onClick={() => setSelectedMethod(method.value)}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                    selectedMethod === method.value
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  disabled={confirming}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      selectedMethod === method.value
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    className={`font-medium ${
                      selectedMethod === method.value
                        ? "text-primary dark:text-primary"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {method.label}
                  </span>
                  {selectedMethod === method.value && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={confirming}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            disabled={confirming || !selectedMethod}
          >
            {confirming ? "Confirmando..." : "Confirmar Pago"}
          </button>
        </div>
      </div>
    </div>
  );
}
