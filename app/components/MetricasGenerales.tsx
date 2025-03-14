"use client";

import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DashboardMetrics } from '../types/hubspot';

interface MetricasGeneralesProps {
  metrics: DashboardMetrics;
}

const MetricasGenerales = ({ metrics }: MetricasGeneralesProps) => {
  // Sample trend data (replace with real data when available)
  const trendData = [
    { month: 'Ene', afiliados: metrics.totalAfiliados * 0.8, simpatizantes: metrics.totalSimpatizantes * 0.8 },
    { month: 'Feb', afiliados: metrics.totalAfiliados * 0.85, simpatizantes: metrics.totalSimpatizantes * 0.85 },
    { month: 'Mar', afiliados: metrics.totalAfiliados * 0.9, simpatizantes: metrics.totalSimpatizantes * 0.9 },
    { month: 'Abr', afiliados: metrics.totalAfiliados * 0.95, simpatizantes: metrics.totalSimpatizantes * 0.95 },
    { month: 'May', afiliados: metrics.totalAfiliados, simpatizantes: metrics.totalSimpatizantes }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-500">Total Afiliados</p>
              <p className="mt-1 text-2xl font-semibold">{metrics.totalAfiliados}</p>
              <p className="text-sm text-gray-500">Tasa de conversión: {metrics.tasaConversion.toFixed(1)}%</p>
              <div className="mt-4 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <Line type="monotone" dataKey="afiliados" stroke="#8884d8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-500">Total Simpatizantes</p>
              <p className="mt-1 text-2xl font-semibold">{metrics.totalSimpatizantes}</p>
              <p className="text-sm text-gray-500">Crecimiento mensual: {metrics.crecimientoMensual.toFixed(1)}%</p>
              <div className="mt-4 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <Line type="monotone" dataKey="simpatizantes" stroke="#82ca9d" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-500">Total Donaciones</p>
              <p className="mt-1 text-2xl font-semibold">{metrics.totalDonaciones.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
              <p className="text-sm text-gray-500">Promedio: {metrics.donacionesPromedio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
              <div className="mt-4 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Donaciones', value: metrics.totalDonaciones }
                  ]}>
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-500">Campañas Activas</p>
              <p className="mt-1 text-2xl font-semibold">{metrics.campañasActivas}</p>
              <p className="text-sm text-gray-500">En curso</p>
              <div className="mt-4 h-16 flex items-center justify-center">
                <div className="text-4xl">{metrics.campañasActivas > 0 ? '' : ''}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Evolución de Afiliados y Simpatizantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="afiliados" fill="#8884d8" name="Afiliados" />
                <Bar dataKey="simpatizantes" fill="#82ca9d" name="Simpatizantes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricasGenerales;
