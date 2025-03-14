"use client";

import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DashboardMetrics } from "../types/hubspot";

interface MetricasCuotasProps {
  metrics: DashboardMetrics;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const MetricasCuotas = ({ metrics }: MetricasCuotasProps) => {
  // Transform data for pie chart
  const pieData = metrics.distribucionCuotas.map(item => ({
    name: item.rango,
    value: item.count
  }));

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Métricas de Cuotas de Afiliados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Cuota Promedio</h3>
              <p className="mt-1 text-2xl font-semibold">
                {metrics.cuotaPromedio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </p>
              <p className="text-xs text-gray-500">Por afiliado</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Ingreso Mensual Estimado</h3>
              <p className="mt-1 text-2xl font-semibold">
                {metrics.ingresoCuotasMensual.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </p>
              <p className="text-xs text-gray-500">Por cuotas de afiliados</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Proyección Anual</h3>
              <p className="mt-1 text-2xl font-semibold">
                {(metrics.ingresoCuotasMensual * 12).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </p>
              <p className="text-xs text-gray-500">Ingresos anuales por cuotas</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Distribución de Cuotas</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.distribucionCuotas}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rango" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Afiliados']} />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Número de afiliados" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Proporción de Cuotas</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Afiliados']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricasCuotas;
