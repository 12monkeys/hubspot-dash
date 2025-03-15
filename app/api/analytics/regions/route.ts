import { NextResponse } from "next/server";
import { hubspotService } from "../../../services/hubspotService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get dashboard metrics from HubSpot
    const dashboardData = await hubspotService.getDashboardData();

    // Extract regional distribution data
    const regions = dashboardData.regionalDistribution.regions.map((item: any) => ({
      name: item.name,
      affiliates: item.affiliates,
      sympathizers: item.sympathizers,
      percentage: item.percentage,
      growth: item.growth,
      total: item.total
    }));

    return NextResponse.json({
      regions
    });
  } catch (error) {
    console.error("Error fetching regional distribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch regional distribution" },
      { status: 500 }
    );
  }
} 