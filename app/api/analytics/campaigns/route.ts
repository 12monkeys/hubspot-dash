import { NextResponse } from "next/server";
import HubSpotService from "../../../services/hubspotService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { analyzeCampaignEffectiveness } from "../../../lib/analytics";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  try {
    const hubspotService = new HubSpotService(process.env.HUBSPOT_ACCESS_TOKEN || "");
    const campaignAnalysis = await analyzeCampaignEffectiveness(hubspotService);
    
    return NextResponse.json({ data: campaignAnalysis });
  } catch (error) {
    console.error("Error al obtener análisis de campañas:", error);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
} 