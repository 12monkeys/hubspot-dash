"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

type CampaignMetrics = {
  campaigns: Array<{
    name: string;
    completionRate: number;
    conversionRate: number;
    engagement: number;
  }>;
  overallStats: {
    activeCampaigns: number;
    averageConversion: number;
    averageEngagement: number;
  };
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Datos simulados para usar directamente
const mockCampaignMetrics: CampaignMetrics = {
  campaigns: [
    { name: 'Campaña Afiliación Q1', completionRate: 85, conversionRate: 4.2, engagement: 68 },
    { name: 'Newsletter Mensual', completionRate: 92, conversionRate: 2.8, engagement: 72 },
    { name: 'Evento Regional', completionRate: 78, conversionRate: 5.6, engagement: 81 },
    { name: 'Captación Donantes', completionRate: 65, conversionRate: 3.9, engagement: 59 },
    { name: 'Campaña Redes Sociales', completionRate: 88, conversionRate: 3.2, engagement: 75 }
  ],
  overallStats: {
    activeCampaigns: 5,
    averageConversion: 3.5,
    averageEngagement: 65.4
  }
};

export default function CampaignEffectiveness() {
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simular una carga de datos
    const timer = setTimeout(() => {
      setMetrics(mockCampaignMetrics);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
    
    // Código original comentado
    /*
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/campaigns');
        const data = await response.json();
        
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error("Error fetching campaign metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    */
  }, []);
  
  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Efectividad de Campañas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!metrics) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Efectividad de Campañas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded">
            No se pudieron cargar los datos de campañas.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate completion percentage for each campaign
  const campaignsWithPercentage = metrics.campaigns.map(campaign => ({
    ...campaign,
    goal: 100, // Valor simulado para el objetivo
    current: Math.round(campaign.completionRate), // Valor simulado para el progreso actual
    completionPercentage: campaign.completionRate
  }));
  
  // Sort campaigns by conversion rate
  const sortedByConversion = [...campaignsWithPercentage]
    .sort((a, b) => b.conversionRate - a.conversionRate);
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Efectividad de Campañas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Campañas Activas</h3>
            <p className="mt-1 text-2xl font-semibold">{metrics.overallStats.activeCampaigns}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Tasa de Conversión Media</h3>
            <p className="mt-1 text-2xl font-semibold">{metrics.overallStats.averageConversion.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Progreso de Campañas</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={campaignsWithPercentage}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip 
                    formatter={(value: any) => {
                      if (typeof value === 'number') {
                        return [`${value.toFixed(1)}%`, "Completado"];
                      }
                      return [value, "Completado"];
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="completionPercentage" 
                    name="% Completado" 
                    fill="#8884d8" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Tasa de Conversión por Campaña</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedByConversion}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => {
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
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Detalle de Campañas</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Campaña</th>
                  <th className="py-3 px-6 text-center">Objetivo</th>
                  <th className="py-3 px-6 text-center">Actual</th>
                  <th className="py-3 px-6 text-center">% Completado</th>
                  <th className="py-3 px-6 text-center">Tasa Conversión</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {campaignsWithPercentage.map((campaign, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {campaign.name}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {campaign.goal}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {campaign.current}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${campaign.completionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="ml-2">{campaign.completionPercentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-center">
                      {campaign.conversionRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 