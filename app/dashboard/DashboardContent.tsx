"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import KPIOverview from "@/components/dashboard/KPIOverview";
import TrendAnalysis from "@/components/dashboard/TrendAnalysis";
import CampaignAnalysis from "@/components/dashboard/CampaignAnalysis";
import GeographicDistribution from "@/components/dashboard/GeographicDistribution";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export default function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);
  
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (status === "unauthenticated") {
    return null; // Redirigirá a través del useEffect
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Actualizar datos
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Gráfico de análisis de emails
                </div>
              </TabsContent>
              <TabsContent value="social">
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Gráfico de análisis de redes sociales
                </div>
              </TabsContent>
              <TabsContent value="events">
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Gráfico de análisis de eventos
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
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Gráfico de embudo de conversión
                </div>
              </TabsContent>
              <TabsContent value="journey">
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Gráfico de customer journey
                </div>
              </TabsContent>
              <TabsContent value="touchpoints">
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Gráfico de puntos de contacto
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 