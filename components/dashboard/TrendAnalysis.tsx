"use client";

import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";

export default function TrendAnalysis() {
  const [timeframe, setTimeframe] = useState("30d");
  const [metric, setMetric] = useState("new_contacts");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics/trends?metric=${metric}&timeframe=${timeframe}`);
        const result = await response.json();
        setData(result.data);
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
  ];
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Análisis de Tendencias</CardTitle>
        <div className="flex space-x-2">
          <Select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            options={metricOptions}
            className="text-sm"
          />
          <Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            options={timeframeOptions}
            className="text-sm"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <span className="text-gray-500">Cargando datos...</span>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={date => new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [
                  metric === 'average_quota' ? `${value.toFixed(2)} €` : 
                  metric === 'conversion_rate' ? `${(value * 100).toFixed(1)}%` : 
                  value.toString(),
                  metricOptions.find(o => o.value === metric)?.label
                ]}
                labelFormatter={date => new Date(date).toLocaleDateString('es-ES')}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                name={metricOptions.find(o => o.value === metric)?.label}
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-72 flex items-center justify-center">
            <span className="text-gray-500">No hay datos disponibles para el período seleccionado</span>
          </div>
        )}
        
        {data.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Promedio</p>
              <p className="text-2xl font-bold">
                {metric === 'average_quota' 
                  ? (data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(2) + ' €'
                  : metric === 'conversion_rate'
                    ? ((data.reduce((sum, item) => sum + item.value, 0) / data.length) * 100).toFixed(1) + '%'
                    : (data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(0)
                }
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Máximo</p>
              <p className="text-2xl font-bold">
                {metric === 'average_quota' 
                  ? Math.max(...data.map(item => item.value)).toFixed(2) + ' €'
                  : metric === 'conversion_rate'
                    ? (Math.max(...data.map(item => item.value)) * 100).toFixed(1) + '%'
                    : Math.max(...data.map(item => item.value)).toString()
                }
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Tendencia</p>
              <p className="text-2xl font-bold flex justify-center items-center">
                {data[data.length - 1].value > data[0].value 
                  ? <span className="text-green-600">▲</span> 
                  : data[data.length - 1].value < data[0].value 
                    ? <span className="text-red-600">▼</span>
                    : <span className="text-gray-600">◆</span>
                }
                {metric === 'conversion_rate'
                  ? ((data[data.length - 1].value - data[0].value) * 100).toFixed(1) + '%'
                  : (((data[data.length - 1].value - data[0].value) / data[0].value) * 100).toFixed(1) + '%'
                }
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 