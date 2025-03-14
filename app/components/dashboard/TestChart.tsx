"use client";

import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function TestChart() {
  // Sample static data
  const data = [
    { name: 'Enero', afiliados: 400, simpatizantes: 240 },
    { name: 'Febrero', afiliados: 300, simpatizantes: 139 },
    { name: 'Marzo', afiliados: 200, simpatizantes: 980 },
    { name: 'Abril', afiliados: 278, simpatizantes: 390 },
    { name: 'Mayo', afiliados: 189, simpatizantes: 480 },
    { name: 'Junio', afiliados: 239, simpatizantes: 380 },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Test Chart - Afiliados vs Simpatizantes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
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
  );
}
