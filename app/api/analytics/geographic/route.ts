import { NextResponse } from "next/server";
import { HubSpotService } from "@/services/hubspotService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  try {
    const hubspotService = new HubSpotService();
    const dashboardData = await hubspotService.getDashboardData();
    
    // Transformar datos de distribución regional al formato adecuado para el gráfico
    const data = Object.entries(dashboardData.regionDistribution)
      .map(([region, count]) => ({
        region,
        value: count,
        percentage: count / dashboardData.totalContacts
      }))
      .sort((a, b) => b.value - a.value);
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error al obtener distribución geográfica:", error);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
} 