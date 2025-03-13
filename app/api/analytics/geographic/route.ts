import { NextResponse } from "next/server";
import HubSpotService from "@/services/hubspotService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  try {
    const hubspotService = new HubSpotService(process.env.HUBSPOT_ACCESS_TOKEN || "");
    const dashboardData = await hubspotService.getDashboardMetrics();
    
    // Transformar datos de distribución regional al formato adecuado para el gráfico
    const data = dashboardData.distribucionRegional
      .map((item) => ({
        region: item.region,
        value: item.count,
        percentage: item.count / dashboardData.totalAfiliados
      }))
      .sort((a, b) => b.value - a.value);
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error al obtener distribución geográfica:", error);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
} 