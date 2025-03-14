"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

type RegionDistribution = {
  region: string;
  count: number;
  percentage: number;
};

type Metrics = {
  totalAffiliates: number;
  affiliatesChange: number;
  conversionRate: number;
  conversionRateChange: number;
  totalSympathizers: number;
  sympathizersChange: number;
  monthlyGrowth: number;
  monthlyGrowthChange: number;
  averageQuota: number;
  averageQuotaChange: number;
  estimatedMonthlyIncome: number;
  estimatedIncomeChange: number;
  activeCampaigns: number;
  activeCampaignsChange: number;
  annualProjection: number;
  regionDistribution: RegionDistribution[];
  quotaDistribution: {
    quota: number;
    count: number;
    percentage: number;
  }[];
  timeSeriesData: {
    date: string;
    affiliates: number;
    sympathizers: number;
    conversionRate: number;
    averageQuota: number;
  }[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Datos simulados para usar directamente
const mockMetrics: Metrics = {
  totalAffiliates: 207966,
  affiliatesChange: 5.2,
  conversionRate: 68.5,
  conversionRateChange: -0.8,
  totalSympathizers: 95634,
  sympathizersChange: 8.7,
  monthlyGrowth: 0.0,
  monthlyGrowthChange: 2.3,
  averageQuota: 17.03,
  averageQuotaChange: 0.5,
  estimatedMonthlyIncome: 1702.71,
  estimatedIncomeChange: 3.9,
  activeCampaigns: 0,
  activeCampaignsChange: 0,
  annualProjection: 20432.52,
  regionDistribution: [
    { region: 'Madrid', count: 45000, percentage: 21.6 },
    { region: 'Andalucía', count: 38000, percentage: 18.3 },
    { region: 'Cataluña', count: 30000, percentage: 14.4 },
    { region: 'Valencia', count: 25000, percentage: 12.0 },
    { region: 'Galicia', count: 18000, percentage: 8.7 }
  ],
  quotaDistribution: [
    { quota: 10, count: 80000, percentage: 38.5 },
    { quota: 20, count: 65000, percentage: 31.3 },
    { quota: 30, count: 40000, percentage: 19.2 },
    { quota: 50, count: 15000, percentage: 7.2 },
    { quota: 100, count: 8000, percentage: 3.8 }
  ],
  timeSeriesData: [
    { date: 'Ene', affiliates: 190000, sympathizers: 85000, conversionRate: 65.2, averageQuota: 16.5 },
    { date: 'Feb', affiliates: 195000, sympathizers: 88000, conversionRate: 66.8, averageQuota: 16.7 },
    { date: 'Mar', affiliates: 200000, sympathizers: 90000, conversionRate: 67.5, averageQuota: 16.9 },
    { date: 'Abr', affiliates: 203000, sympathizers: 92000, conversionRate: 68.0, averageQuota: 17.0 },
    { date: 'May', affiliates: 205000, sympathizers: 94000, conversionRate: 68.3, averageQuota: 17.1 },
    { date: 'Jun', affiliates: 207966, sympathizers: 95634, conversionRate: 68.5, averageQuota: 17.03 }
  ]
};

export default function KPIOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  
  useEffect(() => {
    // Simular una carga de datos
    const timer = setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
    
    // Código original comentado
    /*
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
    */
  }, [selectedTimeframe]);
  
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <div className="h-16 flex items-center justify-center">
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
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
      icon: "👥",
      trend: metrics.timeSeriesData.map(d => ({ date: d.date, value: d.affiliates }))
    },
    {
      title: "Tasa de Conversión",
      value: `${metrics.conversionRate.toFixed(1)}%`,
      change: metrics.conversionRateChange,
      icon: "📈",
      trend: metrics.timeSeriesData.map(d => ({ date: d.date, value: d.conversionRate }))
    },
    {
      title: "Total Simpatizantes",
      value: metrics.totalSympathizers.toLocaleString(),
      change: metrics.sympathizersChange,
      icon: "🤝",
      trend: metrics.timeSeriesData.map(d => ({ date: d.date, value: d.sympathizers }))
    },
    {
      title: "Crecimiento Mensual",
      value: `${metrics.monthlyGrowth.toFixed(1)}%`,
      change: metrics.monthlyGrowthChange,
      icon: "📆",
      trend: metrics.timeSeriesData.map(d => ({ date: d.date, value: d.averageQuota }))
    }
  ];
  
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiItems.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">{item.title}</p>
                <p className="mt-1 text-2xl font-bold">{item.value}</p>
                {item.change !== null && (
                  <p className={`text-xs ${item.change >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(1)}%
                  </p>
                )}
              </div>
              <div className="text-3xl bg-blue-50 p-3 rounded-full">{item.icon}</div>
            </div>
            <div className="h-20 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={item.trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value) => [
                      typeof value === 'number' ? value.toLocaleString() : value,
                      item.title
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Distribución Regional</h3>
          <div className="h-80 bg-white p-4 rounded-lg shadow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.regionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="region"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {metrics.regionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (props && props.payload && typeof value === 'number') {
                      return [
                        `${value.toLocaleString()} (${(props.payload.percentage * 100).toFixed(1)}%)`,
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

        <div>
          <h3 className="text-lg font-semibold mb-4">Distribución de Cuotas</h3>
          <div className="h-80 bg-white p-4 rounded-lg shadow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.quotaDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quota" label={{ value: 'Cuota (€)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Número de Afiliados', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (props && props.payload && typeof value === 'number') {
                      return [
                        `${value.toLocaleString()} afiliados (${(props.payload.percentage * 100).toFixed(1)}%)`,
                        "Afiliados"
                      ];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="count" name="Afiliados" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}