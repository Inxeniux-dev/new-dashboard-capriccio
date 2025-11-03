"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User, LoginRequest } from "@/types/api";
import apiClient from "@/lib/api-client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("auth_token");

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiClient.auth.login(credentials);

      if (response.success && response.data?.token && response.data?.user) {
        // Guardar token y usuario
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);

        // Mostrar mensaje de éxito
        toast.success("¡Bienvenido!", {
          description: `Iniciaste sesión como ${response.data.user.full_name || response.data.user.email}`,
        });

        // Redirigir según el rol
        const dashboard = getDashboardByRole(response.data.user.role);
        router.push(dashboard);
      } else {
        toast.error("Error al iniciar sesión", {
          description: "Credenciales inválidas. Verifica tu email y contraseña.",
        });
        throw new Error("Credenciales inválidas");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);

      // Mostrar mensaje de error apropiado
      const err = error as { status?: number; message?: string };

      if (err.status === 401) {
        toast.error("Credenciales incorrectas", {
          description: "El email o la contraseña no son válidos.",
        });
      } else if (err.status === 500) {
        toast.error("Error del servidor", {
          description: "Hubo un problema con el servidor. Intenta de nuevo más tarde.",
        });
      } else if (err.message === "Error de conexión con el servidor") {
        toast.error("Sin conexión", {
          description: "No se pudo conectar con el servidor. Verifica tu conexión.",
        });
      } else {
        toast.error("Error al iniciar sesión", {
          description: err.message || "Ocurrió un error inesperado. Intenta de nuevo.",
        });
      }

      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.auth.logout();
      toast.success("Sesión cerrada", {
        description: "Has cerrado sesión exitosamente.",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Limpiar estado local
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      setUser(null);
      router.push("/");
    }
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (!user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Utilidad para obtener el dashboard según el rol
function getDashboardByRole(role: string): string {
  switch (role) {
    case "admin":
    case "administrador":  // Agregar soporte para rol "administrador"
      return "/dashboard/admin";
    case "logistics":
    case "logistica":
      return "/dashboard/logistics";
    case "empleado":
    case "employee":
      return "/dashboard/employee";
    case "manager":
      return "/dashboard/manager";
    default:
      return "/dashboard";
  }
}

// Hook para proteger rutas
export function useRequireAuth(requiredRoles?: string[]) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/");
      } else if (requiredRoles && user) {
        // Normalizar el rol del usuario para comparación
        const normalizedUserRole = user.role.toLowerCase()
          .replace('administrador', 'admin')
          .replace('logistica', 'logistics')
          .replace('empleado', 'employee');

        // Verificar si el rol normalizado está en los roles requeridos
        const hasRequiredRole = requiredRoles.some(role =>
          role.toLowerCase() === normalizedUserRole || role === user.role
        );

        if (!hasRequiredRole) {
          // Redirigir al dashboard correcto según su rol
          const dashboard = getDashboardByRole(user.role);
          router.push(dashboard);
        }
      }
    }
  }, [user, loading, isAuthenticated, requiredRoles, router]);

  return { user, loading, isAuthenticated };
}
