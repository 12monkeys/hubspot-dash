"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import KPIOverview from "@/components/dashboard/KPIOverview";
import TrendAnalysis from "@/components/dashboard/TrendAnalysis";
import Tabs from "@/components/Tabs";

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
          <h1 className="text-2xl font-bold">Dashboard HubSpot</h1>
          <p className="text-gray-600">Bienvenido, {session?.user?.name || session?.user?.email}</p>
        </div>
        <div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Actualizar datos
          </button>
        </div>
      </header>
      
      <div className="mb-8">
        <KPIOverview />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TrendAnalysis />
        
        <div className="bg-white p-4 rounded-lg shadow">
          <Tabs
            tabs={[
              {
                label: "Desglose por edad",
                content: (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Gráfico de distribución por edades
                  </div>
                )
              },
              {
                label: "Desglose por región",
                content: (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Gráfico de distribución por regiones
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Campañas Activas</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alcance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversiones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Campaña de Verano</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Activa</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10/06/2023</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1,245</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">86 (6.9%)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Newsletter Mensual</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Activa</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">01/03/2023</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3,560</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">198 (5.6%)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 