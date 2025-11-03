'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-100 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          ¡Algo salió mal!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}