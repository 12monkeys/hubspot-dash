import { NextResponse } from 'next/server';
import HubSpotService from '../../../services/hubspotService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.HUBSPOT_API_KEY) {
      return NextResponse.json({ error: 'HubSpot API key not configured' }, { status: 500 });
    }

    const hubspotService = new HubSpotService(process.env.HUBSPOT_API_KEY);
    
    // Analizar las métricas disponibles y generar recomendaciones
    const recommendations = await hubspotService.analyzeAvailableMetrics();
    
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error getting metrics recommendations:', error);
    return NextResponse.json({ error: 'Failed to generate metrics recommendations' }, { status: 500 });
  }
} 