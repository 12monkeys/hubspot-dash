"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function GeographicDistribution() {
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchDistribution() {
      setLoading(true);
      try {
        const response = await fetch('/api/analytics/geographic');
        const result = await response.json();
        setDistribution(result.data);
      } catch (error) {
        console.error("Error fetching geographic distribution:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDistribution();
  }, []);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Distribución Geográfica</CardTitle>
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
                  data={distribution}
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
                    `${value.toLocaleString()} (${(props.payload.percentage * 100).toFixed(1)}%)`,
                    props.payload.region
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {distribution.slice(0, 6).map((region, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 mr-2 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-gray-700 truncate">{region.region}</span>
                  <span className="ml-1 text-gray-500">({region.percentage * 100}%)</span>
                </div>
              ))}
              {distribution.length > 6 && (
                <div className="text-gray-500 text-xs col-span-2 text-center mt-2">
                  +{distribution.length - 6} regiones más
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <span className="text-gray-500">No hay datos de distribución geográfica disponibles</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 