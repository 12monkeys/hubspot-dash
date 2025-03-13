"use client";

import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";

interface TrendData {
  date: string;
  value: number;
  target?: number;
  forecast?: number;
}

interface TrendAnalysis {
  metric: string;
  data: TrendData[];
  summary: {
    current: number;
    previous: number;
    change: number;
    target: number;
    forecast: number;
    confidence: number;
  };
}

export default function TrendAnalysis() {
  const [timeframe, setTimeframe] = useState("30d");
  const [metric, setMetric] = useState("new_contacts");
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"line" | "area" | "bar">("line");
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics/trends?metric=${metric}&timeframe=${timeframe}`);
        const result = await response.json();
        setAnalysis(result.data);
      } catch (error) {
        console.error("Error fetching trend data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [metric, timeframe]);
  
  const timeframeOptions = [
    { value: "7d", label: "Última semana" },
    { value: "30d", label: "Último mes" },
    { value: "90d", label: "Último trimestre" },
    { value: "1y", label: "Último año" },
  ];
  
  const metricOptions = [
    { value: "new_contacts", label: "Nuevos contactos" },
    { value: "new_affiliates", label: "Nuevos afiliados" },
    { value: "conversion_rate", label: "Tasa de conversión" },
    { value: "average_quota", label: "Cuota promedio" },
    { value: "revenue", label: "Ingresos" },
    { value: "engagement", label: "Engagement" },
  ];

  const viewModeOptions = [
    { value: "line", label: "Línea" },
    { value: "area", label: "Área" },
    { value: "bar", label: "Barras" },
  ];
  
  const renderChart = () => {
    if (!analysis) return null;

    const ChartComponent = viewMode === "line" ? LineChart : 
                          viewMode === "area" ? AreaChart : BarChart;
    
    const DataComponent = (viewMode === "line" ? Line : 
                         viewMode === "area" ? Area : Bar) as any;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent
          data={analysis.data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={date => new Date(date).toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: '2-digit',
              year: timeframe === "1y" ? 'numeric' : undefined
            })}
          />
          <YAxis />
          <Tooltip 
            formatter={(value) => {
              if (typeof value === 'number') {
                return [
                  metric === 'average_quota' ? `${value.toFixed(2)} €` : 
                  metric === 'conversion_rate' ? `${(value * 100).toFixed(1)}%` : 
                  metric === 'revenue' ? `${value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}` :
                  value.toString(),
                  metricOptions.find(o => o.value === metric)?.label
                ];
              }
              return [value.toString(), metricOptions.find(o => o.value === metric)?.label];
            }}
            labelFormatter={date => new Date(date).toLocaleDateString('es-ES')}
          />
          <Legend />
          <DataComponent 
            type="monotone" 
            dataKey="value" 
            name={metricOptions.find(o => o.value === metric)?.label}
            stroke="#8884d8" 
            fill={viewMode === "area" ? "#8884d8" : undefined}
            activeDot={{ r: 8 }} 
          />
          {analysis.data[0]?.target && (
            <DataComponent 
              type="monotone" 
              dataKey="target" 
              name="Objetivo"
              stroke="#82ca9d" 
              strokeDasharray="5 5"
              fill={viewMode === "area" ? "#82ca9d" : undefined}
            />
          )}
          {analysis.data[0]?.forecast && (
            <DataComponent 
              type="monotone" 
              dataKey="forecast" 
              name="Pronóstico"
              stroke="#ffc658" 
              strokeDasharray="5 5"
              fill={viewMode === "area" ? "#ffc658" : undefined}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Análisis de Tendencias</CardTitle>
        <div className="flex space-x-2">
          <Select
            value={metric}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMetric(e.target.value)}
            options={metricOptions}
            className="text-sm"
          />
          <Select
            value={timeframe}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeframe(e.target.value)}
            options={timeframeOptions}
            className="text-sm"
          />
          <Select
            value={viewMode}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setViewMode(e.target.value as "line" | "area" | "bar")}
            options={viewModeOptions}
            className="text-sm"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <span className="text-gray-500">Cargando datos...</span>
          </div>
        ) : analysis ? (
          <>
            {renderChart()}
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Valor Actual</p>
                <p className="text-2xl font-bold">
                  {metric === 'average_quota' 
                    ? `${analysis.summary.current.toFixed(2)} €`
                    : metric === 'conversion_rate'
                      ? `${(analysis.summary.current * 100).toFixed(1)}%`
                      : metric === 'revenue'
                        ? `${analysis.summary.current.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`
                        : analysis.summary.current.toLocaleString()
                  }
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Cambio</p>
                <p className={`text-2xl font-bold ${analysis.summary.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.summary.change >= 0 ? '▲' : '▼'} {Math.abs(analysis.summary.change).toFixed(1)}%
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Objetivo</p>
                <p className="text-2xl font-bold">
                  {metric === 'average_quota' 
                    ? `${analysis.summary.target.toFixed(2)} €`
                    : metric === 'conversion_rate'
                      ? `${(analysis.summary.target * 100).toFixed(1)}%`
                      : metric === 'revenue'
                        ? `${analysis.summary.target.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`
                        : analysis.summary.target.toLocaleString()
                  }
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Pronóstico</p>
                <p className="text-2xl font-bold">
                  {metric === 'average_quota' 
                    ? `${analysis.summary.forecast.toFixed(2)} €`
                    : metric === 'conversion_rate'
                      ? `${(analysis.summary.forecast * 100).toFixed(1)}%`
                      : metric === 'revenue'
                        ? `${analysis.summary.forecast.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`
                        : analysis.summary.forecast.toLocaleString()
                  }
                </p>
                <p className="text-xs text-gray-500">
                  Confianza: {analysis.summary.confidence.toFixed(1)}%
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-72 flex items-center justify-center">
            <span className="text-gray-500">No hay datos disponibles para el período seleccionado</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}