"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { MapPin, Phone, Edit2, Trash2, Plus, User } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Branch } from "@/types/api";

export default function BranchesManagementPage() {
  const { loading } = useRequireAuth(["admin"]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    city: "",
    state: "",
    manager_id: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoadingData(true);
      const response = await apiClient.branches.getAll();
      setBranches(response.data || []);
    } catch (error) {
      console.error("Error loading branches:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleOpenModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        city: branch.city || "",
        state: branch.state || "",
        manager_id: branch.manager_id || "",
      });
    } else {
      setEditingBranch(null);
      setFormData({
        name: "",
        address: "",
        phone: "",
        city: "",
        state: "",
        manager_id: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBranch(null);
    setFormData({
      name: "",
      address: "",
      phone: "",
      city: "",
      state: "",
      manager_id: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.phone) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setSaving(true);

      if (editingBranch) {
        // Actualizar sucursal existente
        await apiClient.branches.update(editingBranch.id, formData);
        alert("Sucursal actualizada exitosamente");
      } else {
        // Crear nueva sucursal
        await apiClient.branches.create(formData);
        alert("Sucursal creada exitosamente");
      }

      handleCloseModal();
      loadBranches();
    } catch (error) {
      console.error("Error saving branch:", error);
      alert("Error al guardar la sucursal");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (branchId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta sucursal?")) {
      return;
    }

    try {
      await apiClient.branches.delete(branchId);
      alert("Sucursal eliminada exitosamente");
      loadBranches();
    } catch (error) {
      console.error("Error deleting branch:", error);
      alert("Error al eliminar la sucursal");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando sucursales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Sucursales</h1>
          <p className="text-gray-600">Administra las sucursales del sistema</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus size={20} />
          Nueva Sucursal
        </button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.length > 0 ? (
          branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onEdit={() => handleOpenModal(branch)}
              onDelete={() => handleDelete(branch.id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-md">
            <MapPin className="text-gray-300 mx-auto mb-4" size={64} />
            <p className="text-gray-500 text-lg font-medium">No hay sucursales registradas</p>
            <p className="text-gray-400 text-sm mt-1">Crea la primera sucursal para comenzar</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : editingBranch ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BranchCard({
  branch,
  onEdit,
  onDelete,
}: {
  branch: Branch;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{branch.name}</h3>
          <StatusBadge active={branch.active} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 size={18} className="text-gray-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2 text-gray-700">
          <MapPin size={16} className="text-gray-500 mt-0.5" />
          <span>{branch.address}</span>
        </div>

        {(branch.city || branch.state) && (
          <div className="flex items-center gap-2 text-gray-700 ml-6">
            <span>
              {branch.city}
              {branch.city && branch.state && ", "}
              {branch.state}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-700">
          <Phone size={16} className="text-gray-500" />
          <span>{branch.phone}</span>
        </div>

        {branch.manager_name && (
          <div className="flex items-center gap-2 text-gray-700">
            <User size={16} className="text-gray-500" />
            <span>Manager: {branch.manager_name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
        active
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {active ? "Activa" : "Inactiva"}
    </span>
  );
}