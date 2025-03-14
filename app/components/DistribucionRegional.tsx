"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { DashboardMetrics } from '../types/hubspot';

interface DistribucionRegionalProps {
  distribucion: DashboardMetrics['distribucionRegional'];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DistribucionRegional = ({ distribucion }: DistribucionRegionalProps) => {
  // Transform data for the pie chart
  const chartData = distribucion.map(({ region, count }) => ({
    name: region,
    value: count
  }));

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Distribución Regional</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Contactos']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DistribucionRegional;
