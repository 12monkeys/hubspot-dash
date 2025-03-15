import { NextResponse } from 'next/server';
import { hubspotService } from '../../services/hubspotService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Obtener datos del dashboard que incluyen esquemas
    const dashboardData = await hubspotService.getDashboardData();
    
    // Extraer información de esquemas si está disponible
    const schemas = {
      contacts: dashboardData.schemas?.contacts || [],
      deals: dashboardData.schemas?.deals || [],
      companies: dashboardData.schemas?.companies || []
    };
    
    return NextResponse.json(schemas);
  } catch (error) {
    console.error('Error fetching schemas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schemas' },
      { status: 500 }
    );
  }
} 