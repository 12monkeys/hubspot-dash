"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, PieChart, Pie
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

type Campaign = {
  name: string;
  conversionRate: number;
  affiliatesCount: number;
  sympathizersCount: number;
  regionDistribution: { region: string; count: number; percentage: number; }[];
  status: string;
  startDate: string | null;
  endDate: string | null;
  totalContacts: number;
  quotaAnalysis?: {
    averageQuota: number;
    totalRevenue: number;
    quotaDistribution: { quota: number; count: number; percentage: number }[];
  } | null;
}

export default function CampaignAnalysis() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true);
      try {
        const response = await fetch('/api/analytics/campaigns');
        const result = await response.json();
        setCampaigns(result.data);
        
        // Seleccionar la primera campaña por defecto
        if (result.data.length > 0) {
          setSelectedCampaign(result.data[0]);
        }
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCampaigns();
  }, []);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  const data = campaigns.map(campaign => ({
    name: campaign.name,
    conversionRate: campaign.conversionRate,
    affiliatesCount: campaign.affiliatesCount,
    sympathizersCount: campaign.sympathizersCount,
    regionDistribution: campaign.regionDistribution,
    quotaAnalysis: campaign.quotaAnalysis
  }));
  
  const kpiItems = campaigns.map((campaign, index) => ({
    title: campaign.name,
    value: campaign.totalContacts,
    change: null,
    icon: <div className="text-2xl">{index + 1}</div>
  }));
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Efectividad de Campañas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-72 flex items-center justify-center">
                <span className="text-gray-500">Cargando datos...</span>
              </div>
            ) : campaigns.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      const numericValue = typeof value === 'number' ? value : parseFloat(value as string);
                      let formattedValue = name === 'conversionRate' ? `${(numericValue * 100).toFixed(1)}%` : numericValue.toLocaleString();

                      const label = name === 'conversionRate' ? 'Tasa de conversión' : 
                                    name === 'affiliatesCount' ? 'Afiliados' : 
                                    name === 'sympathizersCount' ? 'Simpatizantes' : name;

                      return [formattedValue, label];
                    }}
                  />
                  <Legend 
                    formatter={(value) => 
                      value === 'conversionRate' ? 'Tasa de conversión' : 
                      value === 'affiliatesCount' ? 'Afiliados' : 
                      value === 'sympathizersCount' ? 'Simpatizantes' : value
                    }
                  />
                  <Bar 
                    dataKey="affiliatesCount" 
                    fill="#8884d8" 
                    onClick={(data) => setSelectedCampaign(data)}
                  />
                  <Bar 
                    dataKey="sympathizersCount" 
                    fill="#82ca9d"
                    onClick={(data) => setSelectedCampaign(data)}
                  />
                  <Bar 
                    dataKey="conversionRate" 
                    fill="#ffc658"
                    onClick={(data) => setSelectedCampaign(data)}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center">
                <span className="text-gray-500">No hay datos de campañas disponibles</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Distribución Regional</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCampaign && selectedCampaign.regionDistribution ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={selectedCampaign.regionDistribution.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="region"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {selectedCampaign.regionDistribution.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [value, props.payload.region]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center">
                <span className="text-gray-500">Seleccione una campaña para ver su distribución regional</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {selectedCampaign && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Detalle de Campaña: {selectedCampaign.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                    <p className="mt-1 text-lg font-semibold">
                      {selectedCampaign.status === 'ACTIVE' ? 
                        <span className="text-green-600">Activa</span> : 
                        <span className="text-gray-600">Inactiva</span>
                      }
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Tasa de Conversión</h3>
                    <p className="mt-1 text-lg font-semibold">
                      {(selectedCampaign.conversionRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Fecha Inicio</h3>
                    <p className="mt-1 text-lg font-semibold">
                      {selectedCampaign.startDate ? 
                        new Date(selectedCampaign.startDate).toLocaleDateString('es-ES') : 
                        'No disponible'
                      }
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Fecha Fin</h3>
                    <p className="mt-1 text-lg font-semibold">
                      {selectedCampaign.endDate ? 
                        new Date(selectedCampaign.endDate).toLocaleDateString('es-ES') : 
                        'No disponible'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Conversión por Impacto</h3>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Total Contactos</p>
                      <p className="text-lg font-bold">{selectedCampaign.totalContacts}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Afiliados</p>
                      <p className="text-lg font-bold">{selectedCampaign.affiliatesCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Simpatizantes</p>
                      <p className="text-lg font-bold">{selectedCampaign.sympathizersCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Análisis de Cuotas</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCampaign.quotaAnalysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Cuota Promedio</h3>
                      <p className="mt-1 text-lg font-semibold">
                        {selectedCampaign.quotaAnalysis.averageQuota.toFixed(2)} €
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Ingresos Potenciales</h3>
                      <p className="mt-1 text-lg font-semibold">
                        {selectedCampaign.quotaAnalysis.totalRevenue.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                  
                  {selectedCampaign.quotaAnalysis.quotaDistribution.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Distribución de Cuotas</h3>
                      <div className="overflow-hidden">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Cuota</th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Afiliados</th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Porcentaje</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedCampaign.quotaAnalysis.quotaDistribution.map((item, index) => (
                              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-2 py-1 text-sm">{item.quota.toFixed(2)} €</td>
                                <td className="px-2 py-1 text-sm">{item.count}</td>
                                <td className="px-2 py-1 text-sm">{item.percentage.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <span className="text-gray-500">No hay datos de cuotas disponibles para esta campaña</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
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
    </div>
  );
} 