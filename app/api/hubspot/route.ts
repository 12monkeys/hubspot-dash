import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, method = 'POST', data } = body;
    
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint no especificado' }, { status: 400 });
    }

    // Obtener el token de acceso desde las variables de entorno
    const apiKey = process.env.HUBSPOT_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 });
    }

    // Construir la URL completa
    const url = `https://api.hubapi.com${endpoint}`;
    
    // Configurar los headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    // Realizar la solicitud a HubSpot
    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error en la respuesta de HubSpot:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      
      return NextResponse.json(
        { error: 'Error al comunicarse con HubSpot', details: errorData },
        { status: response.status }
      );
    }
    
    // Devolver la respuesta exitosa
    const responseData = await response.json();
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error en el proxy de HubSpot:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
} 