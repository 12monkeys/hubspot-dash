import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hubspotApiKey = process.env.HUBSPOT_ACCESS_TOKEN;
    
    if (!hubspotApiKey) {
      return NextResponse.json({ error: 'API Key no configurada' }, { status: 500 });
    }

    // Intentar una llamada simple a la API
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${hubspotApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      data: data,
      headers: Object.fromEntries(response.headers.entries())
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Error al probar la conexión',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 