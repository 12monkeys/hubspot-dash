"use client";

import { useState, useEffect } from "react";
import DraggableDashboard from "./components/dashboard/DraggableDashboard";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Simular carga de datos y autenticación
  useEffect(() => {
    // Simular tiempo de carga
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      // Simular email de usuario autenticado
      setUserEmail("usuario@ejemplo.com");
    }, 1500);

    return () => clearTimeout(loadingTimer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800">HubSpot Dashboard</h1>
            {process.env.NODE_ENV === "development" && (
              <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-md">
                Desarrollo
              </span>
            )}
          </div>
          {userEmail && (
            <div className="text-sm text-gray-600">
              {userEmail}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <DraggableDashboard isLoading={isLoading} error={error} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} HubSpot Dashboard. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
} 