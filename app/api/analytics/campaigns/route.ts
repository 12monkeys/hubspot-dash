import { NextResponse } from "next/server";
import HubSpotService from "@/services/hubspotService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  try {
    const hubspotService = new HubSpotService(process.env.HUBSPOT_ACCESS_TOKEN || "");
    const campaignAnalysis = await hubspotService.analyzeCampaignEffectiveness();
    
    return NextResponse.json({ data: campaignAnalysis });
  } catch (error) {
    console.error("Error al obtener análisis de campañas:", error);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
} 