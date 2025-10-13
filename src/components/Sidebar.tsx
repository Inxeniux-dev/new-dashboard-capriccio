"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Package,
  Users,
  MessageSquare,
  Instagram,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  Truck,
  ClipboardList,
  ShoppingCart,
  Calendar,
  Bell,
  FileText,
  Bot,
  Shield,
  Store,
  UserCheck,
  PackageCheck,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { clsx } from "clsx";

interface SidebarProps {
  currentPath?: string;
}

interface MenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href: string;
  badge?: number | string;
  badgeColor?: string;
  roles?: string[];
  submenu?: MenuItem[];
  divider?: boolean;
}

const getMenuItemsByRole = (role: string): MenuItem[] => {
  // Normalizar el rol para manejar variantes en español/inglés
  const normalizedRole = role.toLowerCase().replace('logistica', 'logistics').replace('empleado', 'employee');

  // Dashboard principal según el rol
  const dashboardPath = {
    admin: "/dashboard/admin",
    logistics: "/dashboard/logistics",
    employee: "/dashboard/employee",
    manager: "/dashboard/manager"
  }[normalizedRole] || "/dashboard";

  const baseItems: MenuItem[] = [
    {
      icon: Home,
      label: "Dashboard",
      href: dashboardPath
    },
  ];

  const roleSpecificItems: Record<string, MenuItem[]> = {
    admin: [
      { divider: true, label: "GESTIÓN", href: "#" },
      {
        icon: Users,
        label: "Usuarios",
        href: "/dashboard/admin/users",
        badge: "12"
      },
      {
        icon: Building2,
        label: "Sucursales",
        href: "/dashboard/admin/branches"
      },
      {
        icon: Shield,
        label: "Roles y Permisos",
        href: "/dashboard/admin/roles"
      },

      { divider: true, label: "OPERACIONES", href: "#" },
      {
        icon: Package,
        label: "Órdenes",
        href: "/dashboard/logistics/orders",
        badge: "5",
        badgeColor: "bg-orange-500"
      },
      {
        icon: MessageSquare,
        label: "Conversaciones",
        href: "/dashboard/logistics/conversations",
        submenu: [
          {
            icon: MessageCircle,
            label: "WhatsApp",
            href: "/dashboard/logistics/conversations?platform=whatsapp",
            badge: "3",
            badgeColor: "bg-green-500"
          },
          {
            icon: Instagram,
            label: "Instagram",
            href: "/dashboard/logistics/conversations?platform=instagram"
          },
          {
            icon: MessageSquare,
            label: "Messenger",
            href: "/dashboard/logistics/conversations?platform=messenger"
          },
        ]
      },

      { divider: true, label: "ANÁLISIS", href: "#" },
      {
        icon: BarChart3,
        label: "Reportes",
        href: "/dashboard/admin/reports",
        submenu: [
          { icon: TrendingUp, label: "Ventas", href: "/dashboard/admin/reports/sales" },
          { icon: Users, label: "Clientes", href: "/dashboard/admin/reports/customers" },
          { icon: Package, label: "Productos", href: "/dashboard/admin/reports/products" },
          { icon: Building2, label: "Por Sucursal", href: "/dashboard/admin/reports/branches" },
        ]
      },
      {
        icon: FileText,
        label: "Logs del Sistema",
        href: "/dashboard/admin/logs"
      },

      { divider: true, label: "CONFIGURACIÓN", href: "#" },
      {
        icon: Bot,
        label: "Configuración IA",
        href: "/dashboard/admin/ai-config"
      },
      {
        icon: Settings,
        label: "Configuración",
        href: "/dashboard/admin/settings"
      },
    ],

    logistics: [
      { divider: true, label: "COMUNICACIÓN", href: "#" },
      {
        icon: MessageSquare,
        label: "Conversaciones",
        href: "/dashboard/logistics/conversations",
        badge: "8",
        badgeColor: "bg-blue-500",
        submenu: [
          {
            icon: MessageCircle,
            label: "WhatsApp",
            href: "/dashboard/logistics/conversations?platform=whatsapp",
            badge: "5"
          },
          {
            icon: Instagram,
            label: "Instagram",
            href: "/dashboard/logistics/conversations?platform=instagram",
            badge: "2"
          },
          {
            icon: MessageSquare,
            label: "Messenger",
            href: "/dashboard/logistics/conversations?platform=messenger",
            badge: "1"
          },
        ]
      },

      { divider: true, label: "LOGÍSTICA", href: "#" },
      {
        icon: ClipboardList,
        label: "Órdenes Pendientes",
        href: "/dashboard/logistics/orders",
        badge: "12",
        badgeColor: "bg-red-500"
      },
      {
        icon: Truck,
        label: "Asignaciones",
        href: "/dashboard/logistics/assignments"
      },
      {
        icon: Calendar,
        label: "Calendario Entregas",
        href: "/dashboard/logistics/calendar"
      },
      {
        icon: Building2,
        label: "Sucursales",
        href: "/dashboard/logistics/branches"
      },

      { divider: true, label: "REPORTES", href: "#" },
      {
        icon: BarChart3,
        label: "Mis Estadísticas",
        href: "/dashboard/logistics/stats"
      },
    ],

    employee: [
      { divider: true, label: "MI TRABAJO", href: "#" },
      {
        icon: Package,
        label: "Mis Órdenes",
        href: "/dashboard/employee/orders",
        badge: "3",
        badgeColor: "bg-orange-500"
      },
      {
        icon: PackageCheck,
        label: "Completadas",
        href: "/dashboard/employee/completed"
      },
      {
        icon: Clock,
        label: "Pendientes",
        href: "/dashboard/employee/pending",
        badge: "5"
      },

      { divider: true, label: "COMUNICACIÓN", href: "#" },
      {
        icon: MessageSquare,
        label: "Chat con Clientes",
        href: "/dashboard/employee/chat"
      },
      {
        icon: Bell,
        label: "Notificaciones",
        href: "/dashboard/employee/notifications",
        badge: "2",
        badgeColor: "bg-red-500"
      },

      { divider: true, label: "INFORMACIÓN", href: "#" },
      {
        icon: Store,
        label: "Mi Sucursal",
        href: "/dashboard/employee/branch"
      },
      {
        icon: BarChart3,
        label: "Mis Métricas",
        href: "/dashboard/employee/metrics"
      },
    ],

    manager: [
      { divider: true, label: "GESTIÓN", href: "#" },
      {
        icon: Store,
        label: "Mi Sucursal",
        href: "/dashboard/manager/branch"
      },
      {
        icon: Users,
        label: "Mi Equipo",
        href: "/dashboard/manager/team"
      },
      {
        icon: Package,
        label: "Órdenes",
        href: "/dashboard/manager/orders"
      },

      { divider: true, label: "ANÁLISIS", href: "#" },
      {
        icon: TrendingUp,
        label: "Rendimiento",
        href: "/dashboard/manager/performance"
      },
      {
        icon: BarChart3,
        label: "Reportes",
        href: "/dashboard/manager/reports"
      },

      { divider: true, label: "COMUNICACIÓN", href: "#" },
      {
        icon: MessageSquare,
        label: "Mensajes",
        href: "/dashboard/manager/messages"
      },
      {
        icon: Bell,
        label: "Notificaciones",
        href: "/dashboard/manager/notifications"
      },
    ],
  };

  return [...baseItems, ...(roleSpecificItems[normalizedRole] || [])];
};

export default function Sidebar({ currentPath = "/dashboard" }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const actualPath = currentPath || pathname;

  const menuItems = user ? getMenuItemsByRole(user.role) : [];

  // Auto-expand submenu if current path is inside it
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.submenu) {
        const isInSubmenu = item.submenu.some(sub => actualPath?.startsWith(sub.href.split('?')[0]));
        if (isInSubmenu) {
          setExpandedSubmenu(item.href);
        }
      }
    });
  }, [actualPath, menuItems]);

  const toggleSubmenu = (href: string) => {
    setExpandedSubmenu(expandedSubmenu === href ? null : href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary to-secondary text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-lg">
                <span className="font-bold text-lg">C</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Capriccio</h2>
                <p className="text-xs text-gray-500 font-medium">Homemade Goods CRM</p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary to-secondary text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-lg mx-auto">
              <span className="font-bold text-lg">C</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:block hidden p-2 hover:bg-white/50 text-gray-600 hover:text-primary rounded-lg transition-all duration-200"
            title={isCollapsed ? "Expandir" : "Contraer"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          // Handle dividers
          if (item.divider) {
            return (
              <div key={`divider-${index}`} className="py-2">
                {!isCollapsed && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4">
                    {item.label}
                  </p>
                )}
                {isCollapsed && <hr className="border-gray-200" />}
              </div>
            );
          }

          const isActive = actualPath === item.href || actualPath?.startsWith(item.href.split('?')[0]);
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isSubmenuExpanded = expandedSubmenu === item.href;
          const Icon = item.icon;

          return (
            <div key={item.href}>
              <button
                onClick={() => {
                  if (hasSubmenu) {
                    toggleSubmenu(item.href);
                  } else {
                    router.push(item.href);
                    setIsMobileOpen(false);
                  }
                }}
                className={clsx(
                  "w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100",
                  isCollapsed && "justify-center px-2"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-lg" />
                )}

                <Icon
                  size={20}
                  className={clsx(
                    "flex-shrink-0",
                    isActive ? "text-white" : "text-gray-500 group-hover:text-primary"
                  )}
                />

                {!isCollapsed && (
                  <>
                    <span className="font-medium flex-1 text-left text-sm">{item.label}</span>

                    {/* Badge */}
                    {item.badge && (
                      <span className={clsx(
                        "px-2 py-0.5 text-xs font-bold rounded-full",
                        item.badgeColor || "bg-gray-200 text-gray-700",
                        isActive && "bg-white/20 text-white"
                      )}>
                        {item.badge}
                      </span>
                    )}

                    {/* Submenu indicator */}
                    {hasSubmenu && (
                      <ChevronDown
                        size={16}
                        className={clsx(
                          "transform transition-transform duration-200",
                          isSubmenuExpanded ? "rotate-180" : ""
                        )}
                      />
                    )}
                  </>
                )}

                {/* Collapsed badge */}
                {isCollapsed && item.badge && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </div>
                )}
              </button>

              {/* Submenu */}
              {hasSubmenu && isSubmenuExpanded && !isCollapsed && (
                <div className="ml-6 mt-1 space-y-0.5">
                  {item.submenu?.map((subitem) => {
                    const isSubActive = actualPath === subitem.href ||
                                       actualPath?.includes(subitem.href.split('?')[0]);
                    const SubIcon = subitem.icon;

                    return (
                      <button
                        key={subitem.href}
                        onClick={() => {
                          router.push(subitem.href);
                          setIsMobileOpen(false);
                        }}
                        className={clsx(
                          "w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm",
                          isSubActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <SubIcon size={16} />
                        <span className="flex-1 text-left">{subitem.label}</span>

                        {/* Submenu badge */}
                        {subitem.badge && (
                          <span className={clsx(
                            "px-1.5 py-0.5 text-xs font-bold rounded-full",
                            subitem.badgeColor || "bg-gray-200 text-gray-700"
                          )}>
                            {subitem.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold">
                  {user?.full_name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {user?.full_name || "Usuario"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary mt-1">
                  {user?.role === "logistica" ? "Logística" :
                   user?.role === "empleado" ? "Empleado" :
                   user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 shadow-sm"
            >
              <LogOut size={18} />
              <span className="font-medium text-sm">Cerrar Sesión</span>
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex justify-center p-3 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 shadow-sm"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg shadow-lg hover:bg-primary-hover transition-colors"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed left-0 top-0 h-full bg-white shadow-xl transition-all duration-300 z-50",
          // Desktop behavior
          "lg:relative lg:translate-x-0",
          isCollapsed ? "lg:w-16" : "lg:w-72",
          // Mobile behavior
          "lg:block w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}