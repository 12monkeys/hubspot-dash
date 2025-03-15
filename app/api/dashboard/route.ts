import { NextResponse } from 'next/server';
import { hubspotService } from '../../services/hubspotService';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    console.error('HUBSPOT_ACCESS_TOKEN is not defined');
    return NextResponse.json(
      { error: 'Configuration error: Missing HubSpot access token' },
      { status: 500 }
    );
  }

  try {
    console.log('Token length:', process.env.HUBSPOT_ACCESS_TOKEN.length);
    console.log('Token prefix:', process.env.HUBSPOT_ACCESS_TOKEN.substring(0, 6) + '...');
    
    const dashboardData = await hubspotService.getDashboardData();
    
    if (!dashboardData) {
      throw new Error('No se pudieron obtener los datos del dashboard');
    }
    
    return NextResponse.json(dashboardData);
  } catch (error: any) {
    console.error('Error detallado al obtener datos del dashboard:', {
      name: error?.name || 'Unknown Error',
      message: error?.message || 'No error message available',
      stack: error?.stack || 'No stack trace available',
    });
    
    return NextResponse.json(
      { 
        error: 'Error al cargar los datos del dashboard',
        details: error?.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 