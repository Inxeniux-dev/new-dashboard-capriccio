"use client";

import { useState } from "react";
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
  X
} from "lucide-react";
import { clsx } from "clsx";

interface SidebarProps {
  currentPath?: string;
}

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Package, label: "Pedidos", href: "/pedidos" },
  { icon: Users, label: "Clientes", href: "/clientes" },
  {
    icon: MessageSquare,
    label: "Redes Sociales",
    href: "/redes-sociales",
    submenu: [
      { icon: Instagram, label: "Instagram", href: "/redes-sociales/instagram" },
      { icon: MessageCircle, label: "WhatsApp", href: "/redes-sociales/whatsapp" },
      { icon: MessageSquare, label: "Messenger", href: "/redes-sociales/messenger" },
    ]
  },
  { icon: BarChart3, label: "Reportes", href: "/reportes" },
  { icon: Settings, label: "Configuración", href: "/configuracion" },
];

export default function Sidebar({ currentPath = "/dashboard" }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (href: string) => {
    setExpandedSubmenu(expandedSubmenu === href ? null : href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center">
                <span className="font-bold">C</span>
              </div>
              <div>
                <h2 className="font-bold text-primary">Capriccio</h2>
                <p className="text-xs text-gray-500">CRM</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:block hidden p-2 hover:bg-primary/10 text-primary hover:text-primary-hover rounded-lg transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentPath === item.href;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isSubmenuExpanded = expandedSubmenu === item.href;

          return (
            <div key={item.href}>
              <button
                onClick={() => hasSubmenu ? toggleSubmenu(item.href) : null}
                className={clsx(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-white border-l-4 border-primary-hover"
                    : "text-gray-700 hover:bg-gray-100",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <item.icon
                  size={20}
                  className={clsx(
                    "flex-shrink-0",
                    isActive ? "text-white" : "text-gray-500 group-hover:text-primary"
                  )}
                />
                {!isCollapsed && (
                  <>
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    {hasSubmenu && (
                      <div className={clsx(
                        "transform transition-transform duration-200",
                        isSubmenuExpanded ? "rotate-90" : "rotate-0"
                      )}>
                        ▶
                      </div>
                    )}
                  </>
                )}
              </button>

              {/* Submenu */}
              {hasSubmenu && isSubmenuExpanded && !isCollapsed && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.submenu?.map((subitem) => {
                    const isSubActive = currentPath === subitem.href;
                    return (
                      <button
                        key={subitem.href}
                        className={clsx(
                          "w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm",
                          isSubActive
                            ? "bg-secondary text-white"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <subitem.icon size={16} />
                        <span>{subitem.label}</span>
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
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-medium">U</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Usuario</p>
              <p className="text-sm text-gray-500">admin@capriccio.com</p>
            </div>
          </div>
        )}

        <button
          className={clsx(
            "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-red-50 hover:text-red-600",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
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