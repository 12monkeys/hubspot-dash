import { NextResponse } from 'next/server';
import HubSpotService from '../../../services/hubspotService';

export async function GET() {
  try {
    const hubspotService = new HubSpotService(process.env.HUBSPOT_ACCESS_TOKEN || '');
    const dashboardMetrics = await hubspotService.getDashboardMetrics();
    
    return NextResponse.json(dashboardMetrics);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Error al cargar los datos del dashboard' },
      { status: 500 }
    );
  }
} 