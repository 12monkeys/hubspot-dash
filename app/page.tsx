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

export default function Home() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{message: string; details?: string} | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(DEV_MODE);
  const [userEmail, setUserEmail] = useState<string | null>(DEV_MODE ? "dev@example.com" : null);
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

  // Mostrar el dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Overview */}
        <section className="mb-8">
          <KPIOverview />
        </section>

        {/* Regional Distribution and Donation Analytics */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <RegionalDistribution />
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <DonationAnalytics />
            </div>
          </div>
        </section>

        {/* Campaign Effectiveness */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <CampaignEffectiveness />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Dashboard Político - Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
} 