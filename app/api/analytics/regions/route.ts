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

    // Create regional data from available distribution data
    // Transform the distribucionRegional data into the format we need
    const regions = dashboardData.distribucionRegional?.map(item => ({
      name: item.region,
      affiliates: item.count,
      supporters: Math.round(item.count * 0.7), // Mock data: assuming supporters are ~70% of affiliates
      percentage: 0 // Will be calculated on the client
    })) || [];

    // If no data, provide mock data
    if (regions.length === 0) {
      return NextResponse.json({
        regions: [
          { name: 'Madrid', affiliates: 1200, supporters: 3500, percentage: 0 },
          { name: 'Cataluña', affiliates: 950, supporters: 2800, percentage: 0 },
          { name: 'Andalucía', affiliates: 850, supporters: 2400, percentage: 0 },
          { name: 'Valencia', affiliates: 720, supporters: 1900, percentage: 0 },
          { name: 'Galicia', affiliates: 480, supporters: 1300, percentage: 0 },
          { name: 'País Vasco', affiliates: 420, supporters: 1100, percentage: 0 },
          { name: 'Castilla y León', affiliates: 380, supporters: 950, percentage: 0 },
          { name: 'Canarias', affiliates: 320, supporters: 850, percentage: 0 },
          { name: 'Aragón', affiliates: 280, supporters: 720, percentage: 0 },
          { name: 'Asturias', affiliates: 240, supporters: 650, percentage: 0 },
          { name: 'Baleares', affiliates: 210, supporters: 580, percentage: 0 },
          { name: 'Murcia', affiliates: 190, supporters: 520, percentage: 0 }
        ]
      });
    }

    return NextResponse.json({ regions });
  } catch (error) {
    console.error('Error fetching regional data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regional data' },
      { status: 500 }
    );
  }
} 