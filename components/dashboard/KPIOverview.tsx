"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";

export default function KPIOverview() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      try {
        const response = await fetch('/api/analytics/metrics');
        const result = await response.json();
        setMetrics(result.data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMetrics();
  }, []);
  
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-6">
              <div className="h-16 flex items-center justify-center">
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!metrics) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-yellow-700">No se pudieron cargar las métricas. Inténtalo de nuevo más tarde.</p>
      </div>
    );
  }
  
  const kpiItems = [
    {
      title: "Total Afiliados",
      value: metrics.totalAffiliates.toLocaleString(),
      change: metrics.affiliatesChange,
      icon: "👥"
    },
    {
      title: "Tasa de Conversión",
      value: `${metrics.conversionRate.toFixed(1)}%`,
      change: metrics.conversionRateChange,
      icon: "📈"
    },
    {
      title: "Total Simpatizantes",
      value: metrics.totalSympathizers.toLocaleString(),
      change: metrics.sympathizersChange,
      icon: "🤝"
    },
    {
      title: "Crecimiento Mensual",
      value: `${metrics.monthlyGrowth.toFixed(1)}%`,
      change: metrics.monthlyGrowthChange,
      icon: "📆"
    },
    {
      title: "Cuota Promedio",
      value: `${metrics.averageQuota.toFixed(2)} €`,
      change: metrics.averageQuotaChange,
      icon: "💰"
    },
    {
      title: "Ingreso Mensual Estimado",
      value: `${(metrics.estimatedMonthlyIncome / 1000).toFixed(0)}K €`,
      change: metrics.estimatedIncomeChange,
      icon: "💸"
    },
    {
      title: "Campañas Activas",
      value: metrics.activeCampaigns,
      change: metrics.activeCampaignsChange,
      icon: "🚀"
    },
    {
      title: "Proyección Anual",
      value: `${(metrics.annualProjection / 1000000).toFixed(1)}M €`,
      change: null,
      icon: "📊"
    }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpiItems.map((item, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{item.title}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                {item.change !== null && (
                  <p className={`text-xs ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(1)}%
                  </p>
                )}
              </div>
              <div className="text-2xl">{item.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 