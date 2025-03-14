"use client";

import { 
  Cell, PieChart, Pie, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Campaign } from "../../types/campaign";

interface DistribucionRegionalProps {
  distribucion: Campaign['regionDistribution'];
}

const DistribucionRegional = ({ distribucion }: DistribucionRegionalProps) => {
  // Transform data for the pie chart
  const chartData = distribucion.map(({ region, count }: { region: string; count: number }) => ({
    name: region,
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Card className="shadow-lg">
      <CardHeader className="">
        <CardTitle className="">Distribución Regional</CardTitle>
      </CardHeader>
      <CardContent className="">
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
                label={({name, percent}: {name: string; percent: number}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry: any, index: number) => (
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