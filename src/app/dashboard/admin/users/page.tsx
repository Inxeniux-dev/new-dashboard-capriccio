"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { User as UserIcon, Mail, Shield, Edit2, Trash2, Plus, Building, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { User, Branch } from "@/types/api";

// Datos de ejemplo para cuando el backend no esté disponible
const getMockUsers = (): User[] => [
  {
    id: "mock-1",
    email: "admin@capriccio.com",
    full_name: "Administrador Principal",
    role: "admin",
    branch_id: null,
    active: true,
    created_at: new Date().toISOString(),
    permissions: ["all"],
  },
  {
    id: "mock-2",
    email: "logistics@capriccio.com",
    full_name: "Coordinador Logística",
    role: "logistics",
    branch_id: null,
    active: true,
    created_at: new Date().toISOString(),
    permissions: ["manage_orders"],
  },
  {
    id: "mock-3",
    email: "empleado1@capriccio.com",
    full_name: "María García",
    role: "empleado",
    branch_id: "branch-1",
    active: true,
    created_at: new Date().toISOString(),
    permissions: ["view_orders"],
  },
  {
    id: "mock-4",
    email: "manager1@capriccio.com",
    full_name: "Carlos López",
    role: "manager",
    branch_id: "branch-1",
    active: true,
    created_at: new Date().toISOString(),
    permissions: ["manage_branch"],
  },
];

const getMockBranches = (): Branch[] => [
  {
    id: "branch-1",
    name: "Tienda Central",
    address: "Av. Principal #123",
    city: "León",
    state: "Guanajuato",
    phone: "477-123-4567",
    active: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "branch-2",
    name: "Tienda Norte",
    address: "Blvd. Norte #456",
    city: "León",
    state: "Guanajuato",
    phone: "477-234-5678",
    active: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
];

export default function UsersManagementPage() {
  const { loading } = useRequireAuth(["admin"]);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "empleado",
    branch_id: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      setApiError(null);

      // Cargar usuarios
      try {
        const usersResponse = await apiClient.users.getAll();
        setUsers(usersResponse.data || []);
      } catch (error) {
        console.error("Error loading users:", error);
        // Usar datos de ejemplo si el API falla
        setUsers(getMockUsers());
        setApiError("No se pudieron cargar los usuarios del servidor. Mostrando datos de ejemplo.");
      }

      // Cargar sucursales
      try {
        const branchesResponse = await apiClient.branches.getAll();
        setBranches(branchesResponse.data || []);
      } catch (error) {
        console.error("Error loading branches:", error);
        // Usar sucursales de ejemplo si el API falla
        setBranches(getMockBranches());
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setApiError("Error al cargar los datos. Por favor, verifica tu conexión.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: "", // No enviamos la contraseña al editar
        full_name: user.full_name || "",
        role: user.role as string,
        branch_id: user.branch_id || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: "",
        password: "",
        full_name: "",
        role: "empleado",
        branch_id: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      email: "",
      password: "",
      full_name: "",
      role: "empleado",
      branch_id: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si hay error de API, no permitir guardar
    if (apiError) {
      alert("No se puede guardar mientras el backend no esté disponible");
      return;
    }

    if (!formData.email || !formData.role) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    if (!editingUser && !formData.password) {
      alert("La contraseña es obligatoria para nuevos usuarios");
      return;
    }

    try {
      setSaving(true);

      if (editingUser) {
        // Actualizar usuario existente
        const updateData: Record<string, string | undefined> = {
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
          branch_id: formData.branch_id || undefined,
        };

        await apiClient.users.update(editingUser.id, updateData);
        alert("Usuario actualizado exitosamente");
      } else {
        // Crear nuevo usuario
        await apiClient.users.create({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: formData.role,
          branch_id: formData.branch_id || undefined,
        });
        alert("Usuario creado exitosamente");
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error al guardar el usuario. El backend podría no estar disponible.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    // Si hay error de API, no permitir eliminar
    if (apiError) {
      alert("No se puede eliminar mientras el backend no esté disponible");
      return;
    }

    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      return;
    }

    try {
      await apiClient.users.delete(userId);
      alert("Usuario eliminado exitosamente");
      loadData();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error al eliminar el usuario. El backend podría no estar disponible.");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Usuarios</h1>
          <p className="text-gray-600 dark:text-gray-300">Administra los usuarios del sistema</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          disabled={apiError !== null}
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* Mensaje de error/advertencia */}
      {apiError && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
              Modo de demostración
            </h3>
            <p className="text-amber-700 dark:text-amber-300 text-sm">
              {apiError}
            </p>
            <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
              Las funciones de crear, editar y eliminar están deshabilitadas hasta que el backend esté disponible.
            </p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sucursal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.length > 0 ? (
                users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    branches={branches}
                    onEdit={() => handleOpenModal(user)}
                    onDelete={() => handleDelete(user.id)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <UserIcon className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-500 dark:text-gray-400">No hay usuarios registrados</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Rol *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  required
                >
                  <option value="empleado">Empleado</option>
                  <option value="manager">Manager</option>
                  <option value="logistics">Logística</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Sucursal
                </label>
                <select
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                >
                  <option value="">Sin sucursal</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : editingUser ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UserRow({
  user,
  branches,
  onEdit,
  onDelete,
}: {
  user: User;
  branches: Branch[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const branch = branches.find((b) => b.id === user.branch_id);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            {(user.full_name || user.email).charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {user.full_name || "Sin nombre"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
          <Mail size={14} />
          {user.email}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
          {branch ? (
            <>
              <Building size={14} />
              {branch.name}
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">Sin asignar</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge active={user.active} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex justify-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function RoleBadge({ role }: { role: string }) {
  const roleConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
    admin: { label: "Admin", color: "bg-purple-100 text-purple-800", icon: Shield },
    logistics: { label: "Logística", color: "bg-blue-100 text-blue-800", icon: UserIcon },
    logistica: { label: "Logística", color: "bg-blue-100 text-blue-800", icon: UserIcon },
    manager: { label: "Manager", color: "bg-indigo-100 text-indigo-800", icon: UserIcon },
    empleado: { label: "Empleado", color: "bg-gray-100 text-gray-800", icon: UserIcon },
    employee: { label: "Empleado", color: "bg-gray-100 text-gray-800", icon: UserIcon },
  };

  const config = roleConfig[role] || roleConfig.empleado;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
        active
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}