import { NextResponse } from 'next/server';
import HubSpotService from '../../../services/hubspotService';

export async function GET() {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    console.error('HUBSPOT_ACCESS_TOKEN is not defined');
    return NextResponse.json(
      { error: 'Configuration error: Missing HubSpot access token' },
      { status: 500 }
    );
  }

  try {
    const hubspotService = new HubSpotService(process.env.HUBSPOT_ACCESS_TOKEN);
    const dashboardMetrics = await hubspotService.getDashboardMetrics();
    
    if (!dashboardMetrics) {
      throw new Error('No se pudieron obtener las métricas del dashboard');
    }
    
    return NextResponse.json(dashboardMetrics);
  } catch (error: any) {
    console.error('Error detallado al obtener métricas:', {
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