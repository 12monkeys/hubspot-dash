'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from './components/auth/LoginForm';
import KPIOverview from './components/dashboard/KPIOverview';
import DonationAnalytics from './components/dashboard/DonationAnalytics';
import CampaignEffectiveness from './components/dashboard/CampaignEffectiveness';
import RegionalDistribution from './components/dashboard/RegionalDistribution';
import { DashboardMetrics } from './types/hubspot';

// Modo de desarrollo para ver el dashboard sin autenticación
const DEV_MODE = true; // Cambiar a false en producción

// Definición de las pestañas
const TABS = [
  { id: 'overview', label: 'Resumen General' },
  { id: 'regional', label: 'Distribución Regional' },
  { id: 'donations', label: 'Análisis de Donaciones' },
  { id: 'campaigns', label: 'Efectividad de Campañas' }
];

export default function Home() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{message: string; details?: string} | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(DEV_MODE);
  const [userEmail, setUserEmail] = useState<string | null>(DEV_MODE ? "dev@example.com" : null);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    // En modo desarrollo, no verificamos autenticación
    if (DEV_MODE) {
      setLoading(false);
      return;
    }

    // Verificar si el usuario tiene acceso
    const checkAccess = async () => {
      try {
        const response = await fetch('/api/check-access');
        const data = await response.json();
        
        if (response.ok && data.authorized) {
          setIsAuthorized(true);
          setUserEmail(data.email || null);
          fetchDashboardData();
        } else {
          setIsAuthorized(false);
          setLoading(false);
        }
      } catch (err) {
        setIsAuthorized(false);
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Error desconocido');
      }
      
      setMetrics(data);
    } catch (err: any) {
      setError({
        message: 'Error al cargar los datos del dashboard',
        details: err?.message || 'Error desconocido'
      });
      console.error('Error detallado:', err);
    } finally {
      setLoading(false);
    }
  };

  // Si no está autorizado, mostrar el formulario de login
  if (!isAuthorized) {
    return <LoginForm />;
  }

  // Si está cargando, mostrar el spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si hay un error, mostrarlo
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-xl mb-2">{error.message}</div>
        {error.details && (
          <div className="text-red-400 text-sm mt-2 max-w-md text-center">
            Detalles: {error.details}
          </div>
        )}
      </div>
    );
  }

  // Si no hay métricas y no estamos en modo desarrollo, no mostrar nada
  if (!metrics && !DEV_MODE) {
    return null;
  }

  // Renderizar el contenido según la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4">Indicadores Clave</h2>
              <KPIOverview showOnlyKPIs={true} />
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section>
                <h2 className="text-xl font-bold mb-4">Distribución Regional</h2>
                <RegionalDistribution showSummaryOnly={true} />
              </section>
              
              <section>
                <h2 className="text-xl font-bold mb-4">Análisis de Donaciones</h2>
                <DonationAnalytics showOnlySummary={true} />
              </section>
            </div>
            
            <section>
              <h2 className="text-xl font-bold mb-4">Efectividad de Campañas</h2>
              <CampaignEffectiveness showOnlySummary={true} />
            </section>
          </div>
        );
      
      case 'regional':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Distribución Regional</h2>
            <RegionalDistribution />
          </div>
        );
      
      case 'donations':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Análisis de Donaciones</h2>
            <DonationAnalytics />
          </div>
        );
      
      case 'campaigns':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Efectividad de Campañas</h2>
            <CampaignEffectiveness />
          </div>
        );
      
      default:
        return <div>Selecciona una pestaña</div>;
    }
  };

  // Mostrar el dashboard
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Político</h1>
            {userEmail && (
              <div className="text-sm text-gray-600 flex items-center">
                <span className="mr-2">Usuario: {userEmail}</span>
                {DEV_MODE && <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">MODO DESARROLLO</span>}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navegación por pestañas */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Dashboard Político - Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
} 