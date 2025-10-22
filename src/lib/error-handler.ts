import { toast } from "sonner";

/**
 * Maneja errores de API y muestra mensajes apropiados al usuario
 */
export function handleApiError(error: unknown, customMessage?: string) {
  console.error("API Error:", error);

  const err = error as { status?: number; message?: string; details?: string };

  // Error 401 - No autenticado (ya manejado en api-client, pero podemos mostrar toast)
  if (err.status === 401) {
    toast.error("Sesión expirada", {
      description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
    });
    return;
  }

  // Error 403 - Sin permisos
  if (err.status === 403) {
    toast.error("Acceso denegado", {
      description: "No tienes permisos para realizar esta acción.",
    });
    return;
  }

  // Error 404 - No encontrado
  if (err.status === 404) {
    toast.error("No encontrado", {
      description: customMessage || "El recurso solicitado no existe.",
    });
    return;
  }

  // Error 422 - Validación
  if (err.status === 422) {
    toast.error("Datos inválidos", {
      description: err.message || customMessage || "Por favor, verifica los datos ingresados.",
    });
    return;
  }

  // Error 500 - Error del servidor
  if (err.status === 500) {
    toast.error("Error del servidor", {
      description: customMessage || "Hubo un problema con el servidor. Intenta de nuevo más tarde.",
    });
    return;
  }

  // Error de conexión
  if (err.message === "Error de conexión con el servidor") {
    toast.error("Sin conexión", {
      description: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
    });
    return;
  }

  // Error genérico
  toast.error("Error", {
    description: customMessage || err.message || "Ocurrió un error inesperado. Intenta de nuevo.",
  });
}

/**
 * Ejecuta una función async y maneja errores automáticamente
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  customMessage?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleApiError(error, customMessage);
    return null;
  }
}

/**
 * Hook para manejar estados de carga y error
 */
export function useApiState() {
  return {
    handleError: handleApiError,
    withErrorHandling,
  };
}
