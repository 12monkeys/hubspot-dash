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
  
  async apiRequest({ 
    method = 'GET', 
    path, 
    qs = {}, 
    body = null 
  }: { 
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    qs?: Record<string, string | number | boolean>;
    body?: any;
  }) {
    try {
      if (!this.apiKey) {
        throw new Error('HubSpot API key no configurada');
      }

      if (!path) {
        throw new Error('Path is required for HubSpot API request');
      }

      const baseUrl = 'https://api.hubapi.com';
      const fullPath = path.startsWith('/') ? path : `/${path}`;
      const urlString = `${baseUrl}${fullPath}`;
      const url = new URL(urlString);

      Object.entries(qs).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const response = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HubSpot API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error en la petición a HubSpot:', error.message);
      } else {
        console.error('Error desconocido en la petición a HubSpot:', error);
      }
      throw error;
    }
  }
}

export function createHubSpotClient() {
  const apiKey = process.env.HUBSPOT_ACCESS_TOKEN || '';
  if (!apiKey) {
    console.warn('ADVERTENCIA: HUBSPOT_ACCESS_TOKEN no está configurada en las variables de entorno');
  }
  
  return new HubSpotClient(apiKey);
} 