import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import HubSpotService from '@/app/services/hubspotService';

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

    // Create donation metrics from available data
    // Note: We're using mock data structure since the actual properties don't exist yet
    const donationMetrics = {
      monthlyDonations: [
        { month: '2023-01', amount: 5000 },
        { month: '2023-02', amount: 5500 },
        { month: '2023-03', amount: 6200 },
        { month: '2023-04', amount: 7000 },
        { month: '2023-05', amount: 7500 },
        { month: '2023-06', amount: 8000 }
      ],
      donationDistribution: [
        { range: '0-50€', count: 120, percentage: 40 },
        { range: '51-100€', count: 80, percentage: 26.7 },
        { range: '101-200€', count: 60, percentage: 20 },
        { range: '201-500€', count: 30, percentage: 10 },
        { range: '500+€', count: 10, percentage: 3.3 }
      ],
      totalDonors: 300
    };

    return NextResponse.json({
      metrics: donationMetrics,
      totalDonations: dashboardData.totalDonaciones || 0,
      averageDonation: dashboardData.donacionesPromedio || 0
    });
  } catch (error) {
    console.error('Error fetching donation metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donation metrics' },
      { status: 500 }
    );
  }
} 