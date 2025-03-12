"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, Tab } from "@/components/Tabs";
import KPIOverview from "@/components/dashboard/KPIOverview";
import TrendAnalysis from "@/components/dashboard/TrendAnalysis";
import GeographicDistribution from "@/components/dashboard/GeographicDistribution";
import CampaignAnalysis from "@/components/dashboard/CampaignAnalysis";
import AffiliateInsights from "@/components/dashboard/AffiliateInsights";
import PredictiveAnalytics from "@/components/dashboard/PredictiveAnalytics";
import { redirect } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Redirigir a login si no hay sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);
  
  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Inteligencia de Negocio</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{session?.user?.email}</span>
            <button 
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <Tab id="overview" title="Visión Global">
            <div className="space-y-6">
              <KPIOverview />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendAnalysis />
                <GeographicDistribution />
              </div>
            </div>
          </Tab>
          
          <Tab id="campaigns" title="Análisis de Campañas">
            <CampaignAnalysis />
          </Tab>
          
          <Tab id="affiliates" title="Insights de Afiliación">
            <AffiliateInsights />
          </Tab>
          
          <Tab id="predictive" title="Análisis Predictivo">
            <PredictiveAnalytics />
          </Tab>
        </Tabs>
      </main>
    </div>
  );
} 