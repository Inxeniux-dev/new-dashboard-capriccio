"use client";

import type { TopProduct } from "@/types/api";
import { Package } from "lucide-react";

interface TopProductsTableProps {
  products: TopProduct[];
  isLoading?: boolean;
}

export function TopProductsTable({ products, isLoading }: TopProductsTableProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-300">
          No hay productos vendidos en este periodo
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Unidades
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ingresos
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {products.map((product, index) => (
            <tr
              key={product.productId}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <td className="px-4 py-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0
                      ? "bg-yellow-500"
                      : index === 1
                      ? "bg-gray-400"
                      : index === 2
                      ? "bg-orange-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {index === 0 && <span>🏆</span>}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {product.productName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {product.productId}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {product.unitsSold}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ${product.revenue.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
