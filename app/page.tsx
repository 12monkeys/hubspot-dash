'use client';

import { useEffect, useState } from 'react';
import MetricasGenerales from '../components/MetricasGenerales';
import DistribucionRegional from '../components/DistribucionRegional';
import MetricasCuotas from '../components/MetricasCuotas';
import { DashboardMetrics } from '../types/hubspot';

export default function Home() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{message: string; details?: string} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
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

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

  if (!metrics) {
    return null;
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Dashboard Político</h1>
      
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