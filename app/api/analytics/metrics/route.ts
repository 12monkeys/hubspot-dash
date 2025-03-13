import { NextResponse } from "next/server";
import HubSpotService from "../../../services/hubspotService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  try {
    const hubspotService = new HubSpotService(process.env.HUBSPOT_ACCESS_TOKEN || "");
    
    // Obtener datos del dashboard actual
    const dashboardData = await hubspotService.getDashboardMetrics();
    
    // Obtener datos de campañas
    const campaigns = await hubspotService.getCampaigns();
    const activeCampaigns = campaigns.filter(c => 
      c.properties.hs_campaign_status === 'ACTIVE'
    ).length;
    
    // Calcular cambios (simulados por ahora)  
    // En una implementación real, estos datos vendrían de comparar con períodos anteriores
    const data = {
      totalAffiliates: dashboardData.totalAfiliados,
      totalSympathizers: dashboardData.totalSimpatizantes,
      conversionRate: dashboardData.tasaConversion,
      monthlyGrowth: dashboardData.crecimientoMensual,
      averageQuota: dashboardData.cuotaPromedio,
      estimatedMonthlyIncome: dashboardData.ingresoCuotasMensual,
      activeCampaigns: activeCampaigns,
      annualProjection: dashboardData.ingresoCuotasMensual * 12,
      
      // Cambios simulados (en porcentaje)
      affiliatesChange: 5.2,
      sympathizersChange: 8.7,
      conversionRateChange: -0.8,
      monthlyGrowthChange: 2.3,
      averageQuotaChange: 0.5,
      estimatedIncomeChange: 3.9,
      activeCampaignsChange: 0
    };
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error al obtener métricas:", error);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
} 