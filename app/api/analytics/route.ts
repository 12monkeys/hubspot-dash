import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hubspotApiKey = process.env.HUBSPOT_API_KEY;
    
    if (!hubspotApiKey) {
      console.error('HUBSPOT_API_KEY no está configurada');
      throw new Error('HUBSPOT_API_KEY no está configurada');
    }

    // Log del token (solo los primeros 5 caracteres por seguridad)
    console.log('Token preview:', hubspotApiKey.substring(0, 5) + '...');

    const baseUrl = 'https://api.hubapi.com';
    const headers = {
      'Authorization': `Bearer ${hubspotApiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Primero, intentemos una llamada simple para verificar la autenticación
    const testResponse = await fetch(`${baseUrl}/crm/v3/objects/contacts?limit=1`, {
      method: 'GET',
      headers: headers
    });

    console.log('Test response status:', testResponse.status);
    console.log('Test response headers:', JSON.stringify(testResponse.headers, null, 2));

    if (!testResponse.ok) {
      const errorData = await testResponse.json();
      console.error('Error en la respuesta de prueba:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        errorData
      });
      throw new Error(`Error en la autenticación de HubSpot: ${JSON.stringify(errorData)}`);
    }

    // Si la prueba fue exitosa, obtener los datos reales
    const [contactsResponse, dealsResponse] = await Promise.all([
      fetch(`${baseUrl}/crm/v3/objects/contacts?limit=100`, {
        method: 'GET',
        headers: headers
      }),
      fetch(`${baseUrl}/crm/v3/objects/deals?limit=100`, {
        method: 'GET',
        headers: headers
      })
    ]);

    const [contactsData, dealsData] = await Promise.all([
      contactsResponse.json(),
      dealsResponse.json()
    ]);

    return NextResponse.json({
      contacts: contactsData,
      deals: dealsData
    });

  } catch (error) {
    console.error('Error detallado al obtener métricas:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener datos de HubSpot',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    );
  }
} 