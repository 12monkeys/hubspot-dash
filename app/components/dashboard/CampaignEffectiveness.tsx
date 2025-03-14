"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

type CampaignData = {
  name: string;
  completionPercentage: number;
  conversionRate: number;
  engagementScore: number;
  participantCount: number;
  startDate: string;
  endDate: string;
};

type CampaignMetrics = {
  activeCampaigns: number;
  completedCampaigns: number;
  averageConversionRate: number;
  averageEngagement: number;
  totalParticipants: number;
  campaigns: CampaignData[];
};

// Colores para los gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Datos simulados para desarrollo
const mockCampaignMetrics: CampaignMetrics = {
  activeCampaigns: 3,
  completedCampaigns: 2,
  averageConversionRate: 42.5,
  averageEngagement: 68.3,
  totalParticipants: 12450,
  campaigns: [
    {
      name: "Campaña Primavera",
      completionPercentage: 100,
      conversionRate: 45.2,
      engagementScore: 72.5,
      participantCount: 3250,
      startDate: "2023-03-01",
      endDate: "2023-04-15"
    },
    {
      name: "Campaña Verano",
      completionPercentage: 100,
      conversionRate: 38.7,
      engagementScore: 65.8,
      participantCount: 2850,
      startDate: "2023-06-01",
      endDate: "2023-07-15"
    },
    {
      name: "Campaña Otoño",
      completionPercentage: 68,
      conversionRate: 41.2,
      engagementScore: 70.1,
      participantCount: 2750,
      startDate: "2023-09-01",
      endDate: "2023-10-15"
    },
    {
      name: "Campaña Navidad",
      completionPercentage: 35,
      conversionRate: 44.8,
      engagementScore: 64.7,
      participantCount: 3600,
      startDate: "2023-11-15",
      endDate: "2023-12-31"
    }
  ]
};

export default function CampaignEffectiveness() {
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("12m");

  useEffect(() => {
    // En desarrollo, usamos datos simulados
    const timer = setTimeout(() => {
      setMetrics(mockCampaignMetrics);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);

    // En producción, descomentar esto:
    /*
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/analytics/campaigns?timeframe=${timeframe}`);
        if (!response.ok) {
          throw new Error('Error al cargar los datos de campañas');
        }
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error fetching campaign data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    */
  }, [timeframe]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 flex items-center justify-center">
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-yellow-700">{error || 'No se pudieron cargar los datos de campañas'}</p>
      </div>
    );
  }

  // Formateador para porcentajes
  const formatPercentage = (value: number | string) => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)}%`;
    }
    return `${value}%`;
  };

  // Formateador para números
  const formatNumber = (value: number | string) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Campañas Activas</p>
              <p className="mt-1 text-2xl font-bold">{metrics.activeCampaigns}</p>
            </div>
            <div className="text-3xl bg-blue-50 p-3 rounded-full">📊</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Campañas Completadas</p>
              <p className="mt-1 text-2xl font-bold">{metrics.completedCampaigns}</p>
            </div>
            <div className="text-3xl bg-green-50 p-3 rounded-full">✅</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Tasa de Conversión</p>
              <p className="mt-1 text-2xl font-bold">{formatPercentage(metrics.averageConversionRate)}</p>
            </div>
            <div className="text-3xl bg-purple-50 p-3 rounded-full">📈</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Participantes</p>
              <p className="mt-1 text-2xl font-bold">{formatNumber(metrics.totalParticipants)}</p>
            </div>
            <div className="text-3xl bg-yellow-50 p-3 rounded-full">👥</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Porcentaje de Completado</h3>
          <div className="h-80 bg-white p-4 rounded-lg shadow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.campaigns}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  formatter={(value) => {
                    if (typeof value === 'number') {
                      return [`${value.toFixed(1)}%`, "Completado"];
                    }
                    return [value, "Completado"];
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="completionPercentage" 
                  name="Porcentaje Completado" 
                  fill="#8884d8" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Tasa de Conversión por Campaña</h3>
          <div className="h-80 bg-white p-4 rounded-lg shadow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.campaigns}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  domain={[0, 100]} 
                  label={{ value: 'Tasa de Conversión (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => {
                    if (typeof value === 'number') {
                      return [`${value.toFixed(1)}%`, "Tasa de Conversión"];
                    }
                    return [value, "Tasa de Conversión"];
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="conversionRate" 
                  name="Tasa de Conversión" 
                  fill="#82ca9d" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Participantes por Campaña</h3>
          <div className="h-80 bg-white p-4 rounded-lg shadow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.campaigns}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="participantCount"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {metrics.campaigns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (props && props.payload && typeof value === 'number') {
                      return [formatNumber(value), props.payload.name];
                    }
                    return [value, name];
                  }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Análisis de Efectividad</h3>
          <div className="h-80 bg-white p-4 rounded-lg shadow">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius={100} data={metrics.campaigns}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar 
                  name="Tasa de Conversión" 
                  dataKey="conversionRate" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6} 
                />
                <Radar 
                  name="Engagement" 
                  dataKey="engagementScore" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  fillOpacity={0.6} 
                />
                <Legend />
                <Tooltip 
                  formatter={(value) => {
                    if (typeof value === 'number') {
                      return [`${value.toFixed(1)}%`, ""];
                    }
                    return [`${value}`, ""];
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 