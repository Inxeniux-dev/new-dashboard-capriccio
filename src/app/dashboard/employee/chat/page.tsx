"use client";

import { useRequireAuth } from "@/contexts/AuthContext";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmployeeChatPage() {
  const { loading } = useRequireAuth(["empleado", "employee"]);
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirigir a conversaciones de logística (los empleados pueden ver conversaciones)
  router.push("/dashboard/logistics/conversations");

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <MessageSquare className="text-primary mx-auto mb-4" size={64} />
        <p className="text-gray-600 dark:text-gray-300">Redirigiendo al chat...</p>
      </div>
    </div>
  );
}
