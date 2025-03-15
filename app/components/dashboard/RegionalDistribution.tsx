"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Line, Area
} from "recharts";
import { hubspotService } from '../../services/hubspotService';

type RegionData = {
  region: string;
  affiliates: number;
  sympathizers: number;
  percentage: number;
  growth: number;
};

// Definir un tipo para los datos de región que vienen de la API
type ApiRegionData = {
  name: string;
  affiliates: number;
  sympathizers: number;
  percentage: number;
  growth: number;
  total: number;
};

type RegionalMetrics = {
  totalRegions: number;
  topRegion: string;
  topRegionPercentage: number;
  totalAffiliates: number;
  totalSympathizers: number;
  regions: RegionData[];
};

// Props para el componente
interface RegionalDistributionProps {
  showSummaryOnly?: boolean;
}

// Colores para los gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFCCCB', '#A569BD', '#5DADE2', '#58D68D'];

const RegionalDistribution: React.FC<RegionalDistributionProps> = ({ showSummaryOnly = false }) => {
  const [metrics, setMetrics] = useState<RegionalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"affiliates" | "percentage" | "growth">("affiliates");
  const [showCount, setShowCount] = useState(10);
  const [viewMode, setViewMode] = useState<"chart" | "map" | "table">("chart");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener datos del dashboard desde el servicio de HubSpot
        const dashboardData = await hubspotService.getDashboardData();
        
        // Extraer datos regionales
        const regions = dashboardData.regionalDistribution.regions || [];
        
        // Encontrar la región con mayor porcentaje
        const topRegion = [...regions].sort((a, b) => b.percentage - a.percentage)[0] || { name: 'No disponible', percentage: 0 };
        
        // Calcular totales
        const totalAffiliates = regions.reduce((sum: number, region: ApiRegionData) => sum + region.affiliates, 0);
        const totalSympathizers = regions.reduce((sum: number, region: ApiRegionData) => sum + region.sympathizers, 0);
        
        // Construir el objeto de métricas regionales
        const regionalMetrics: RegionalMetrics = {
          totalRegions: regions.length,
          topRegion: topRegion.name,
          topRegionPercentage: topRegion.percentage,
          totalAffiliates,
          totalSympathizers,
          regions: regions.map((region: ApiRegionData) => ({
            region: region.name,
            affiliates: region.affiliates,
            sympathizers: region.sympathizers,
            percentage: region.percentage,
            growth: region.growth
          }))
        };
        
        setMetrics(regionalMetrics);
        setError(null);
      } catch (err) {
        console.error('Error al obtener datos regionales:', err);
        setError('Error al cargar los datos regionales. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        <p className="text-yellow-700">{error || 'No se pudieron cargar los datos regionales'}</p>
      </div>
    );
  }

  // Ordenar y limitar los datos según las preferencias
  const sortedData = [...metrics.regions]
    .sort((a, b) => b[sortBy] - a[sortBy])
    .slice(0, showCount);

  // Formateador para números
  const formatNumber = (value: number | string) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  // Formateador para porcentajes
  const formatPercentage = (value: number | string) => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)}%`;
    }
    return `${value}%`;
  };

  // Renderizar el resumen de totales en una sola fila con tres columnas
  const renderSummary = () => {
    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Regiones</h3>
          <p className="text-3xl font-bold text-blue-600">{metrics.totalRegions}</p>
        </Card>
        
        <Card className="p-4 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Afiliados</h3>
          <p className="text-3xl font-bold text-green-600">{formatNumber(metrics.totalAffiliates)}</p>
        </Card>
        
        <Card className="p-4 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Simpatizantes</h3>
          <p className="text-3xl font-bold text-amber-600">{formatNumber(metrics.totalSympathizers)}</p>
        </Card>
      </div>
    );
  };

  // Renderizar los gráficos de distribución
  const renderCharts = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Distribución por Región</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="affiliates"
                  nameKey="region"
                  label={({name, percent}) => {
                    if (typeof percent === 'number' && percent > 0.05) {
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }
                    return '';
                  }}
                >
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (props && props.payload) {
                      return [
                        `${formatNumber(value as number)} (${formatPercentage(props.payload.percentage)})`,
                        props.payload.region
                      ];
                    }
                    return [value, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Afiliados por Región</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="affiliates"
                  nameKey="region"
                  label={({name, percent}) => {
                    if (typeof percent === 'number' && percent > 0.05) {
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }
                    return '';
                  }}
                >
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (props && props.payload) {
                      return [
                        `${formatNumber(value as number)} (${formatPercentage(props.payload.percentage)})`,
                        props.payload.region
                      ];
                    }
                    return [value, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Simpatizantes por Región</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sympathizers"
                  nameKey="region"
                  label={({name, percent}) => {
                    if (typeof percent === 'number' && percent > 0.05) {
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }
                    return '';
                  }}
                >
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (props && props.payload) {
                      return [
                        `${formatNumber(value as number)} (${formatPercentage(props.payload.percentage)})`,
                        props.payload.region
                      ];
                    }
                    return [value, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderSummary()}
      {!showSummaryOnly && renderCharts()}
    </div>
  );
};

export default RegionalDistribution; 