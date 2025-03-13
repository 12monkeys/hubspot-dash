"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import KPIOverview from "@/components/dashboard/KPIOverview";
import TrendAnalysis from "@/components/dashboard/TrendAnalysis";
import CampaignAnalysis from "@/components/dashboard/CampaignAnalysis";
import GeographicDistribution from "@/components/dashboard/GeographicDistribution";
import ConversionRecommendations from "@/components/dashboard/ConversionRecommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export default function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Verificar autenticación
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      setIsLoading(false);
    }
  }, [status, router]);
  
  // Mostrar estado de carga
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Cargando dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Redirigir si no está autenticado
  if (status === "unauthenticated") {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Inteligencia de Negocio</h1>
          <p className="text-gray-600">Bienvenido, {session?.user?.name || session?.user?.email}</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Actualizar datos
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Exportar reporte
          </button>
        </div>
      </header>
      
      <div className="mb-8">
        <KPIOverview />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TrendAnalysis />
        <GeographicDistribution />
      </div>

      <div className="mb-8">
        <CampaignAnalysis />
      </div>

      <div className="mb-8">
        <ConversionRecommendations />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Análisis de Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email">
              <TabsList>
                <TabsTrigger value="email">Emails</TabsTrigger>
                <TabsTrigger value="social">Redes Sociales</TabsTrigger>
                <TabsTrigger value="events">Eventos</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">Análisis de campañas de email</p>
                    <p className="text-sm text-gray-400">Tasa de apertura: 24.5%</p>
                    <p className="text-sm text-gray-400">Tasa de clics: 3.8%</p>
                    <p className="text-sm text-gray-400">Conversiones: 1.2%</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="social">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">Análisis de redes sociales</p>
                    <p className="text-sm text-gray-400">Engagement: 5.7%</p>
                    <p className="text-sm text-gray-400">Alcance: 45,230 personas</p>
                    <p className="text-sm text-gray-400">Conversiones: 0.8%</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="events">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">Análisis de eventos</p>
                    <p className="text-sm text-gray-400">Asistencia: 78.3%</p>
                    <p className="text-sm text-gray-400">Satisfacción: 4.6/5</p>
                    <p className="text-sm text-gray-400">Conversiones: 5.2%</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Análisis de Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="funnel">
              <TabsList>
                <TabsTrigger value="funnel">Embudo de Conversión</TabsTrigger>
                <TabsTrigger value="journey">Customer Journey</TabsTrigger>
                <TabsTrigger value="touchpoints">Puntos de Contacto</TabsTrigger>
              </TabsList>
              <TabsContent value="funnel">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">Embudo de conversión</p>
                    <p className="text-sm text-gray-400">Visitantes: 100%</p>
                    <p className="text-sm text-gray-400">Interesados: 35.2%</p>
                    <p className="text-sm text-gray-400">Simpatizantes: 12.8%</p>
                    <p className="text-sm text-gray-400">Afiliados: 4.3%</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="journey">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">Customer journey</p>
                    <p className="text-sm text-gray-400">Tiempo promedio: 45 días</p>
                    <p className="text-sm text-gray-400">Puntos de contacto: 3.7</p>
                    <p className="text-sm text-gray-400">Tasa de abandono: 65.4%</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="touchpoints">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">Puntos de contacto</p>
                    <p className="text-sm text-gray-400">Email: 42.3%</p>
                    <p className="text-sm text-gray-400">Redes sociales: 28.7%</p>
                    <p className="text-sm text-gray-400">Eventos: 18.5%</p>
                    <p className="text-sm text-gray-400">Otros: 10.5%</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 