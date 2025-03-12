import axios from 'axios';

export class HubSpotClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.hubapi.com';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    
    if (!this.apiKey) {
      console.error('HubSpot API key no configurada');
    }
  }
  
  async apiRequest({ method = 'GET', path, qs = {}, body = null }) {
    try {
      if (!this.apiKey) {
        throw new Error('HubSpot API key no configurada');
      }
      
      const url = `${this.baseUrl}${path}`;
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      };
      
      const config = {
        method,
        url,
        headers,
        params: qs,
        data: body
      };
      
      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response) {
        // Error de respuesta de la API de HubSpot
        console.error(`Error de HubSpot API: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        throw new Error(`HubSpot API error: ${error.response.status} - ${error.response.data.message || 'Error desconocido'}`);
      } else if (error.request) {
        // No se recibió respuesta
        console.error('No se recibió respuesta de HubSpot API');
        throw new Error('No se recibió respuesta de HubSpot API');
      } else {
        // Error en la configuración de la petición
        console.error(`Error al configurar la petición: ${error.message}`);
        throw error;
      }
    }
  }
}

export function createHubSpotClient() {
  const apiKey = process.env.HUBSPOT_API_KEY;
  if (!apiKey) {
    console.warn('ADVERTENCIA: HUBSPOT_API_KEY no está configurada en las variables de entorno');
  }
  
  return new HubSpotClient(apiKey);
} 