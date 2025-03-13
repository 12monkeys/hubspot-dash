"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
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

export default function KPIOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  
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
  }, [selectedTimeframe]);
  
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
    <div className="space-y-6">
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
              <div className="mt-4 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={item.trend}>
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribución Regional</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.regionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
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
                    formatter={(value, name, props) => [
                      `${value.toLocaleString()} (${(props.payload.percentage * 100).toFixed(1)}%)`,
                      props.payload.region
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribución de Cuotas</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.quotaDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quota" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} afiliados (${(props.payload.percentage * 100).toFixed(1)}%)`,
                      "Afiliados"
                    ]}
                  />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}