"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Select } from "../ui/Select";

// Define the interface for a region distribution
type RegionDistribution = {
  region: string;
  count: number;
  percentage: number;
  growth: number;
  conversionRate: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function GeographicDistribution() {
  const [distribution, setDistribution] = useState<RegionDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<"count" | "growth" | "conversion">("count");
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch('/api/analytics/geographic');
        const result = await response.json();
        setDistribution(result.data);
      } catch (error) {
        console.error("Error fetching geographic data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  const metricOptions = [
    { value: "count", label: "Total" },
    { value: "growth", label: "Crecimiento" },
    { value: "conversion", label: "Conversión" },
  ];
  
  const getData = () => {
    return distribution.map(item => ({
      ...item,
      value: metric === "count" ? item.count :
             metric === "growth" ? item.growth :
             item.conversionRate
    }));
  };
  
  const getValueFormatter = (value: number) => {
    if (metric === "count") return value.toLocaleString();
    if (metric === "growth") return `${value.toFixed(1)}%`;
    return `${(value * 100).toFixed(1)}%`;
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Distribución Regional</CardTitle>
        <Select
          value={metric}
          onChange={(e) => setMetric(e.target.value as "count" | "growth" | "conversion")}
          options={metricOptions}
          className="w-32"
        />
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <span className="text-gray-500">Cargando datos...</span>
          </div>
        ) : distribution.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="region"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    getValueFormatter(value as number),
                    props.payload.region
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Región con mayor crecimiento</p>
                <p className="text-lg font-semibold">
                  {distribution.reduce((max, item) => 
                    item.growth > max.growth ? item : max
                  ).region}
                </p>
                <p className="text-sm text-green-600">
                  {distribution.reduce((max, item) => 
                    item.growth > max.growth ? item : max
                  ).growth.toFixed(1)}%
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Mejor tasa de conversión</p>
                <p className="text-lg font-semibold">
                  {distribution.reduce((max, item) => 
                    item.conversionRate > max.conversionRate ? item : max
                  ).region}
                </p>
                <p className="text-sm text-green-600">
                  {(distribution.reduce((max, item) => 
                    item.conversionRate > max.conversionRate ? item : max
                  ).conversionRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <span className="text-gray-500">No hay datos disponibles</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 