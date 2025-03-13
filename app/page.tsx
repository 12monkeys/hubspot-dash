'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LoginForm from './components/auth/LoginForm';
import MetricasGenerales from './components/MetricasGenerales';
import DistribucionRegional from './components/DistribucionRegional';
import MetricasCuotas from './components/MetricasCuotas';
import { DashboardMetrics } from './types/hubspot';

export default function Home() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{message: string; details?: string} | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
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

  // Si no hay métricas, no mostrar nada
  if (!metrics) {
    return null;
  }

  // Mostrar el dashboard
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Dashboard Político</h1>
      
      {userEmail && (
        <div className="mb-4 text-sm text-gray-600">
          Usuario: {userEmail}
        </div>
      )}
      
      <MetricasGenerales metrics={metrics} />
      
      <div className="mt-8">
        <DistribucionRegional distribucion={metrics.distribucionRegional} />
      </div>
      
      <div className="mt-8">
        <MetricasCuotas metrics={metrics} />
      </div>
    </main>
  );
} 