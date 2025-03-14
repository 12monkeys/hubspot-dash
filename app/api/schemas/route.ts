import { NextResponse } from 'next/server';
import HubSpotService from '../../services/hubspotService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verificar si la clave API existe
    const apiKey = process.env.HUBSPOT_ACCESS_TOKEN;
    
    if (!apiKey) {
      console.error('HubSpot API key is missing from environment variables');
      return NextResponse.json({ 
        error: 'HubSpot API key not configured',
        environment: process.env.NODE_ENV,
        keyExists: Boolean(apiKey)
      }, { status: 500 });
    }

    // Log para depuración
    console.log('Iniciando obtención de schemas...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('API Key exists:', Boolean(apiKey));

    const hubspotService = new HubSpotService(apiKey);
    const schemas = await hubspotService.getAllSchemas();

    return NextResponse.json({ schemas });
  } catch (error) {
    console.error('Error al obtener schemas:', error);
    return NextResponse.json({ 
      error: 'Error al obtener schemas',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 