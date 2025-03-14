import { NextResponse } from "next/server";
import HubSpotService from "../../../services/hubspotService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get dashboard metrics from HubSpot
    const hubspotService = new HubSpotService(process.env.HUBSPOT_ACCESS_TOKEN || "");
    const dashboardData = await hubspotService.getDashboardMetrics();

    // Create campaign metrics from available data
    // Note: We're using mock data structure since the actual properties don't exist yet
    const campaignMetrics = {
      campaigns: [
        { name: 'Campaña Afiliación Q1', completionRate: 85, conversionRate: 4.2, engagement: 68 },
        { name: 'Newsletter Mensual', completionRate: 92, conversionRate: 2.8, engagement: 72 },
        { name: 'Evento Regional', completionRate: 78, conversionRate: 5.6, engagement: 81 },
        { name: 'Captación Donantes', completionRate: 65, conversionRate: 3.9, engagement: 59 },
        { name: 'Campaña Redes Sociales', completionRate: 88, conversionRate: 3.2, engagement: 75 }
      ],
      overallStats: {
        activeCampaigns: dashboardData.campañasActivas || 0,
        averageConversion: dashboardData.tasaConversion || 0,
        averageEngagement: 65.4
      }
    };

    return NextResponse.json({
      metrics: campaignMetrics
    });
  } catch (error) {
    console.error('Error fetching campaign metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign metrics' },
      { status: 500 }
    );
  }
} 