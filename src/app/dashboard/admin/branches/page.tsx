"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { MapPin, Phone, User, Info, ExternalLink } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Branch } from "@/types/api";

export default function BranchesManagementPage() {
  const { loading } = useRequireAuth(["admin"]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando sucursales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Sucursales</h1>
          <p className="text-gray-600 dark:text-gray-300">Vista de sucursales sincronizadas desde iPOS</p>
        </div>
      </div>

      {/* Mensaje Informativo */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <Info className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
            Gestión de Sucursales desde iPOS
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Las sucursales mostradas aquí son sincronizadas automáticamente desde el sistema iPOS.
            Para agregar, editar o eliminar sucursales, debe hacerlo directamente desde el portal de iPOS.
          </p>
          <a
            href="https://ipos.capriccio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
          >
            Ir al portal de iPOS
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.length > 0 ? (
          branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <MapPin className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={64} />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No hay sucursales disponibles</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Las sucursales se sincronizan desde iPOS</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BranchCard({
  branch,
}: {
  branch: Branch;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{branch.name}</h3>
          <StatusBadge active={branch.active} />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2 text-gray-700 dark:text-gray-200">
          <MapPin size={16} className="text-gray-500 dark:text-gray-400 mt-0.5" />
          <span>{branch.address}</span>
        </div>

        {(branch.city || branch.state) && (
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 ml-6">
            <span>
              {branch.city}
              {branch.city && branch.state && ", "}
              {branch.state}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Phone size={16} className="text-gray-500 dark:text-gray-400" />
          <span>{branch.phone}</span>
        </div>

        {branch.manager_name && (
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <User size={16} className="text-gray-500 dark:text-gray-400" />
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