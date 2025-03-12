import { NextResponse } from 'next/server';
import HubSpotService from '../../../services/hubspotService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.HUBSPOT_API_KEY) {
      return NextResponse.json({ error: 'HubSpot API key not configured' }, { status: 500 });
    }

    const hubspotService = new HubSpotService(process.env.HUBSPOT_API_KEY);
    
    // Obtener los schemas de todos los objetos relevantes
    const schemas = await hubspotService.getAllSchemas();
    
    return NextResponse.json(schemas);
  } catch (error) {
    console.error('Error getting schemas:', error);
    return NextResponse.json({ error: 'Failed to fetch HubSpot schemas' }, { status: 500 });
  }
} 