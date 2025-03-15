"use client";

import { useState, useEffect } from "react";
import DraggableDashboard from "./components/dashboard/DraggableDashboard";
import { hubspotService } from "./services/hubspotService";

// Componente para las pestañas
const Tabs = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const tabs = [
    { id: 'general', label: 'Vista General' },
    { id: 'contacts', label: 'Contactos' },
    { id: 'campaigns', label: 'Campañas' },
    { id: 'donations', label: 'Donaciones' },
    { id: 'analytics', label: 'Análisis' },
  ];

  return (
    <div className="tabs-header mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : 'tab-button-inactive'}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Simular carga de datos y autenticación
  useEffect(() => {
    // Simular tiempo de carga
    const loadingTimer = setTimeout(() => {
      setLoading(false);
      // Simular email de usuario autenticado
      setUserEmail("usuario@ejemplo.com");
      
      // Intentar cargar datos reales
      fetchDashboardData();
    }, 1500);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Función para cargar datos del dashboard
  const fetchDashboardData = async () => {
    try {
      const data = await hubspotService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error al obtener datos para el dashboard:', error);
      setError('No se pudieron cargar los datos del dashboard. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  // Renderizar contenido según la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <DraggableDashboard isLoading={loading} error={error} />;
      case 'contacts':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Gestión de Contactos</h2>
            <p className="text-gray-600">Esta sección está en desarrollo. Próximamente podrás ver y gestionar todos tus contactos aquí.</p>
          </div>
        );
      case 'campaigns':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Gestión de Campañas</h2>
            <p className="text-gray-600">Esta sección está en desarrollo. Próximamente podrás ver y gestionar todas tus campañas aquí.</p>
          </div>
        );
      case 'donations':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Gestión de Donaciones</h2>
            <p className="text-gray-600">Esta sección está en desarrollo. Próximamente podrás ver y gestionar todas tus donaciones aquí.</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Análisis Avanzado</h2>
            <p className="text-gray-600">Esta sección está en desarrollo. Próximamente podrás acceder a análisis avanzados aquí.</p>
          </div>
        );
      default:
        return <DraggableDashboard isLoading={loading} error={error} />;
    }
  };

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
        {/* Sistema de pestañas */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Contenido de la pestaña activa */}
        <div className="tabs-content">
          {renderTabContent()}
        </div>
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