"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
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

export default function DonationAnalytics() {
  const [metrics, setMetrics] = useState<DonationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("6m");

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
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="h-64 flex items-center justify-center">
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
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

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Donaciones</p>
                <p className="mt-1 text-2xl font-bold">{metrics.totalDonations.toLocaleString()}</p>
              </div>
              <div className="text-3xl bg-purple-50 p-3 rounded-full">💰</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Importe Total</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(metrics.totalAmount)}</p>
                <p className={`text-xs text-green-600 font-medium`}>
                  ▲ {metrics.donationGrowth.toFixed(1)}%
                </p>
              </div>
              <div className="text-3xl bg-green-50 p-3 rounded-full">💸</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Donación Promedio</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(metrics.averageDonation)}</p>
              </div>
              <div className="text-3xl bg-blue-50 p-3 rounded-full">📊</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Tendencia de Donaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
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
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Distribución por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
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
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {metrics.donationsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      formatCurrency(value as number),
                      props.payload.type
                    ]}
                  />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Evolución de Donación Promedio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
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
                  formatter={(value) => [
                    formatCurrency(value as number),
                    "Donación Promedio"
                  ]}
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
        </CardContent>
      </Card>
    </div>
  );
} 