'use client';

import { useEffect, useState } from 'react';
import HubSpotService from '../services/hubspotService';
import MetricasGenerales from '../components/MetricasGenerales';
import DistribucionRegional from '../components/DistribucionRegional';
import { DashboardMetrics } from '../types/hubspot';

export default function Home() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hubspotService = new HubSpotService(process.env.NEXT_PUBLIC_HUBSPOT_ACCESS_TOKEN || '');
        const dashboardMetrics = await hubspotService.getDashboardMetrics();
        setMetrics(dashboardMetrics);
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        console.error(err);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
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
    </main>
  );
} 