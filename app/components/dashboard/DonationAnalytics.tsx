"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

type DonationData = {
  month: string;
  amount: number;
  count: number;
  average: number;
};

type DonationsByType = {
  type: string;
  amount: number;
  percentage: number;
};

type DonationMetrics = {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  donationGrowth: number;
  monthlyData: DonationData[];
  donationsByType: DonationsByType[];
};

// Props para el componente
interface DonationAnalyticsProps {
  showOnlySummary?: boolean;
  showOnlyCharts?: boolean;
}

// Colores para los gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Datos simulados para desarrollo
const mockDonationMetrics: DonationMetrics = {
  totalDonations: 3245,
  totalAmount: 78650.25,
  averageDonation: 24.24,
  donationGrowth: 8.7,
  monthlyData: [
    { month: "Ene", amount: 10250.50, count: 425, average: 24.12 },
    { month: "Feb", amount: 11320.75, count: 468, average: 24.19 },
    { month: "Mar", amount: 12450.30, count: 512, average: 24.32 },
    { month: "Abr", amount: 13580.45, count: 560, average: 24.25 },
    { month: "May", amount: 14780.25, count: 610, average: 24.23 },
    { month: "Jun", amount: 16268.00, count: 670, average: 24.28 }
  ],
  donationsByType: [
    { type: "Recurrente", amount: 45320.15, percentage: 57.6 },
    { type: "Puntual", amount: 22180.50, percentage: 28.2 },
    { type: "Campaña", amount: 11149.60, percentage: 14.2 }
  ]
};

const DonationAnalytics: React.FC<DonationAnalyticsProps> = ({ 
  showOnlySummary = false, 
  showOnlyCharts = false 
}) => {
  const [metrics, setMetrics] = useState<DonationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"1m" | "3m" | "6m" | "1y">("6m");

  useEffect(() => {
    // En desarrollo, usamos datos simulados
    const timer = setTimeout(() => {
      setMetrics(mockDonationMetrics);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);

    // En producción, descomentar esto:
    /*
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/analytics/donations?timeframe=${timeframe}`);
        if (!response.ok) {
          throw new Error('Error al cargar los datos de donaciones');
        }
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error fetching donation data:', err);
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
        <p className="text-yellow-700">{error || 'No se pudieron cargar los datos de donaciones'}</p>
      </div>
    );
  }

  // Formateador para valores monetarios
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Renderizar solo las tarjetas KPI
  const renderKPICards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Donaciones</p>
            <p className="mt-1 text-2xl font-bold">{metrics.totalDonations.toLocaleString()}</p>
          </div>
          <div className="kpi-icon bg-purple-50">💰</div>
        </div>
      </div>
      
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Importe Total</p>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(metrics.totalAmount)}</p>
            <p className={`text-xs text-green-600 font-medium`}>
              ▲ {metrics.donationGrowth.toFixed(1)}%
            </p>
          </div>
          <div className="kpi-icon bg-green-50">💸</div>
        </div>
      </div>
      
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Donación Promedio</p>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(metrics.averageDonation)}</p>
          </div>
          <div className="kpi-icon bg-blue-50">📊</div>
        </div>
      </div>
    </div>
  );

  // Renderizar solo los gráficos
  const renderCharts = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Tendencia de Donaciones</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics.monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="#8884d8"
                  label={{ value: 'Importe (€)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#82ca9d"
                  label={{ value: 'Número de Donaciones', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "amount") {
                      return [formatCurrency(value as number), "Importe"];
                    } else if (name === "count") {
                      return [(value as number).toLocaleString(), "Donaciones"];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="amount" 
                  name="Importe" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="count" 
                  name="Donaciones" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Distribución por Tipo</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.donationsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="type"
                  label={({name, percent}) => {
                    if (typeof percent === 'number') {
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }
                    return `${name}`;
                  }}
                >
                  {metrics.donationsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (props && props.payload) {
                      return [
                        formatCurrency(value as number),
                        props.payload.type
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

      <div>
        <h3 className="text-lg font-semibold mb-4">Evolución de Donación Promedio</h3>
        <div className="chart-container h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metrics.monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                domain={[
                  (dataMin: number) => Math.floor(dataMin * 0.95),
                  (dataMax: number) => Math.ceil(dataMax * 1.05)
                ]}
                label={{ value: 'Donación Promedio (€)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => {
                  if (typeof value === 'number') {
                    return [formatCurrency(value), "Donación Promedio"];
                  }
                  return [value, "Donación Promedio"];
                }}
              />
              <Legend />
              <Bar 
                dataKey="average" 
                name="Donación Promedio" 
                fill="#8884d8" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Renderizar el componente
  return (
    <div className="space-y-6">
      {/* Mostrar resumen si no es showOnlyCharts */}
      {!showOnlyCharts && renderKPICards()}
      
      {/* Mostrar gráficos si no es showOnlySummary */}
      {!showOnlySummary && (
        <>
          {/* Controles para los gráficos */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Análisis de Donaciones</h3>
            <div className="flex space-x-2">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as "1m" | "3m" | "6m" | "1y")}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="1m">Último mes</option>
                <option value="3m">Últimos 3 meses</option>
                <option value="6m">Últimos 6 meses</option>
                <option value="1y">Último año</option>
              </select>
            </div>
          </div>
          
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderCharts()}
          </div>
        </>
      )}
    </div>
  );
};

export default DonationAnalytics; 