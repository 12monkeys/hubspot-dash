"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Line, Area
} from "recharts";

type RegionData = {
  region: string;
  affiliates: number;
  sympathizers: number;
  percentage: number;
  growth: number;
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

// Datos simulados para desarrollo
const mockRegionalMetrics: RegionalMetrics = {
  totalRegions: 17,
  topRegion: "Madrid",
  topRegionPercentage: 21.6,
  totalAffiliates: 208000,
  totalSympathizers: 83600,
  regions: [
    { region: "Madrid", affiliates: 45000, sympathizers: 18500, percentage: 21.6, growth: 5.2 },
    { region: "Andalucía", affiliates: 38000, sympathizers: 15200, percentage: 18.3, growth: 4.8 },
    { region: "Cataluña", affiliates: 30000, sympathizers: 12000, percentage: 14.4, growth: 3.5 },
    { region: "Valencia", affiliates: 25000, sympathizers: 10000, percentage: 12.0, growth: 4.2 },
    { region: "Galicia", affiliates: 18000, sympathizers: 7200, percentage: 8.7, growth: 3.8 },
    { region: "Castilla y León", affiliates: 12000, sympathizers: 4800, percentage: 5.8, growth: 2.9 },
    { region: "País Vasco", affiliates: 10000, sympathizers: 4000, percentage: 4.8, growth: 2.5 },
    { region: "Canarias", affiliates: 8000, sympathizers: 3200, percentage: 3.8, growth: 3.1 },
    { region: "Castilla-La Mancha", affiliates: 7500, sympathizers: 3000, percentage: 3.6, growth: 2.7 },
    { region: "Otras regiones", affiliates: 14500, sympathizers: 5700, percentage: 7.0, growth: 3.0 }
  ]
};

export default function RegionalDistribution({ showSummaryOnly = false }: RegionalDistributionProps) {
  const [metrics, setMetrics] = useState<RegionalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"affiliates" | "percentage" | "growth">("affiliates");
  const [showCount, setShowCount] = useState(10);
  const [viewMode, setViewMode] = useState<"chart" | "map" | "table">("chart");

  useEffect(() => {
    // En desarrollo, usamos datos simulados
    const timer = setTimeout(() => {
      setMetrics(mockRegionalMetrics);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);

    // En producción, descomentar esto:
    /*
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics/regions');
        if (!response.ok) {
          throw new Error('Error al cargar los datos regionales');
        }
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error fetching regional data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    */
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

  // Tarjetas de resumen
  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Regiones</p>
            <p className="mt-1 text-2xl font-bold">{metrics.totalRegions}</p>
          </div>
          <div className="kpi-icon bg-blue-50">🗺️</div>
        </div>
      </div>
      
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Afiliados</p>
            <p className="mt-1 text-2xl font-bold">{formatNumber(metrics.totalAffiliates)}</p>
          </div>
          <div className="kpi-icon bg-purple-50">👥</div>
        </div>
      </div>
      
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Simpatizantes</p>
            <p className="mt-1 text-2xl font-bold">{formatNumber(metrics.totalSympathizers)}</p>
          </div>
          <div className="kpi-icon bg-green-50">🤝</div>
        </div>
      </div>
    </div>
  );

  // Renderizar solo el resumen
  if (showSummaryOnly) {
    return (
      <div>
        {renderSummaryCards()}
        <div className="flex justify-center">
          <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedData.slice(0, 5)}
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
                  {sortedData.slice(0, 5).map((entry, index) => (
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tarjetas de resumen */}
      {renderSummaryCards()}
      
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">
            Región principal: <span className="font-medium">{metrics.topRegion}</span> ({formatPercentage(metrics.topRegionPercentage)})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select 
            className="px-2 py-1 border rounded-md text-sm bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "affiliates" | "percentage" | "growth")}
          >
            <option value="affiliates">Ordenar por afiliados</option>
            <option value="percentage">Ordenar por porcentaje</option>
            <option value="growth">Ordenar por crecimiento</option>
          </select>
          <select 
            className="px-2 py-1 border rounded-md text-sm bg-white"
            value={showCount}
            onChange={(e) => setShowCount(Number(e.target.value))}
          >
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
            <option value="15">Top 15</option>
          </select>
          <div className="flex border rounded-md overflow-hidden">
            <button 
              className={`px-2 py-1 text-sm ${viewMode === 'chart' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-700'}`}
              onClick={() => setViewMode('chart')}
            >
              Gráficos
            </button>
            <button 
              className={`px-2 py-1 text-sm ${viewMode === 'table' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-700'}`}
              onClick={() => setViewMode('table')}
            >
              Tabla
            </button>
          </div>
        </div>
      </div>

      {/* Contenido según el modo de visualización */}
      {viewMode === 'chart' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gráfico de barras - 7/12 del ancho */}
          <div className="lg:col-span-7">
            <div className="chart-container h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={sortedData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="region" 
                    type="category" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === "Afiliados" || name === "Simpatizantes") {
                        return [formatNumber(value as number), name];
                      } else if (name === "Crecimiento") {
                        return [formatPercentage(value as number), name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="affiliates" 
                    name="Afiliados" 
                    fill="#8884d8" 
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                  <Bar 
                    dataKey="sympathizers" 
                    name="Simpatizantes" 
                    fill="#82ca9d" 
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                  <Line
                    type="monotone"
                    dataKey="growth"
                    name="Crecimiento"
                    stroke="#ff7300"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de pastel - 5/12 del ancho */}
          <div className="lg:col-span-5">
            <div className="chart-container h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sortedData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={130}
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
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Región
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Afiliados
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Simpatizantes
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Porcentaje
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crecimiento
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((region, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {region.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatNumber(region.affiliates)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatNumber(region.sympathizers)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercentage(region.percentage)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${region.growth > 4 ? 'bg-green-100 text-green-800' : region.growth > 3 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {formatPercentage(region.growth)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 