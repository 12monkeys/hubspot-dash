"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

type RegionData = {
  region: string;
  affiliates: number;
  sympathizers: number;
  percentage: number;
};

type RegionalMetrics = {
  totalRegions: number;
  topRegion: string;
  topRegionPercentage: number;
  regions: RegionData[];
};

// Colores para los gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFCCCB', '#A569BD', '#5DADE2', '#58D68D'];

// Datos simulados para desarrollo
const mockRegionalMetrics: RegionalMetrics = {
  totalRegions: 17,
  topRegion: "Madrid",
  topRegionPercentage: 21.6,
  regions: [
    { region: "Madrid", affiliates: 45000, sympathizers: 18500, percentage: 21.6 },
    { region: "Andalucía", affiliates: 38000, sympathizers: 15200, percentage: 18.3 },
    { region: "Cataluña", affiliates: 30000, sympathizers: 12000, percentage: 14.4 },
    { region: "Valencia", affiliates: 25000, sympathizers: 10000, percentage: 12.0 },
    { region: "Galicia", affiliates: 18000, sympathizers: 7200, percentage: 8.7 },
    { region: "Castilla y León", affiliates: 12000, sympathizers: 4800, percentage: 5.8 },
    { region: "País Vasco", affiliates: 10000, sympathizers: 4000, percentage: 4.8 },
    { region: "Canarias", affiliates: 8000, sympathizers: 3200, percentage: 3.8 },
    { region: "Castilla-La Mancha", affiliates: 7500, sympathizers: 3000, percentage: 3.6 },
    { region: "Otras regiones", affiliates: 14466, sympathizers: 5734, percentage: 7.0 }
  ]
};

export default function RegionalDistribution() {
  const [metrics, setMetrics] = useState<RegionalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"affiliates" | "percentage">("affiliates");
  const [showCount, setShowCount] = useState(10);

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

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">
            {metrics.totalRegions} regiones en total, {metrics.topRegion} es la región principal ({formatPercentage(metrics.topRegionPercentage)})
          </p>
        </div>
        <div className="flex gap-4">
          <select 
            className="px-3 py-2 border rounded-md text-sm bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "affiliates" | "percentage")}
          >
            <option value="affiliates">Ordenar por afiliados</option>
            <option value="percentage">Ordenar por porcentaje</option>
          </select>
          <select 
            className="px-3 py-2 border rounded-md text-sm bg-white"
            value={showCount}
            onChange={(e) => setShowCount(Number(e.target.value))}
          >
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
            <option value="15">Top 15</option>
          </select>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Distribución de Afiliados por Región</h3>
          <div className="h-80 bg-white p-4 rounded-lg shadow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
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
                  formatter={(value) => {
                    if (typeof value === 'number') {
                      return [formatNumber(value), "Afiliados"];
                    }
                    return [value, "Afiliados"];
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="affiliates" 
                  name="Afiliados" 
                  fill="#8884d8" 
                  radius={[0, 4, 4, 0]}
                />
                <Bar 
                  dataKey="sympathizers" 
                  name="Simpatizantes" 
                  fill="#82ca9d" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Porcentaje por Región</h3>
          <div className="h-80 bg-white p-4 rounded-lg shadow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="affiliates"
                  nameKey="region"
                  label={({name, percent}) => {
                    if (typeof percent === 'number') {
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }
                    return `${name}`;
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

      {/* Tabla de datos */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Detalle por Región</h3>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 