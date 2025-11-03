import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-100 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}