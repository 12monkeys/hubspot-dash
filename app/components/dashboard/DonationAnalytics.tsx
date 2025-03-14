"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

type DonationMetrics = {
  monthlyDonations: Array<{
    month: string;
    amount: number;
  }>;
  donationDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  totalDonors: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DonationAnalytics() {
  const [metrics, setMetrics] = useState<DonationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalDonations, setTotalDonations] = useState(0);
  const [averageDonation, setAverageDonation] = useState(0);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/donations');
        const data = await response.json();
        
        if (data.metrics) {
          setMetrics(data.metrics);
          setTotalDonations(data.totalDonations || 0);
          setAverageDonation(data.averageDonation || 0);
        }
      } catch (error) {
        console.error("Error fetching donation metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Análisis de Donaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!metrics) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Análisis de Donaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded">
            No se pudieron cargar los datos de donaciones.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Format month labels for better display
  const formattedMonthlyData = metrics.monthlyDonations.map(item => {
    const [year, month] = item.month.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return {
      ...item,
      label: `${monthNames[parseInt(month) - 1]} ${year}`
    };
  });
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Análisis de Donaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Donaciones</h3>
            <p className="mt-1 text-2xl font-semibold">{totalDonations.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Donación Promedio</h3>
            <p className="mt-1 text-2xl font-semibold">{averageDonation.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Donantes</h3>
            <p className="mt-1 text-2xl font-semibold">{metrics.totalDonors}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Tendencia de Donaciones</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => {
                      if (typeof value === 'number') {
                        return [
                          value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }),
                          "Importe"
                        ];
                      }
                      return [value, "Importe"];
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    name="Donaciones" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Distribución por Importe</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.donationDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="range"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {metrics.donationDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: string, props: any) => {
                      if (props && props.payload && typeof props.payload.percentage === 'number') {
                        return [
                          `${typeof value === 'number' ? value : 0} donaciones (${props.payload.percentage.toFixed(1)}%)`,
                          props.payload.range
                        ];
                      }
                      return [value, name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 