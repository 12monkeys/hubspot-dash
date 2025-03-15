"use client";

import { HUBSPOT_API_CONFIG, CONTACT_PROPERTIES, CAMPAIGN_PROPERTIES, DONATION_PROPERTIES } from '../config/hubspot';

// Interfaz para las opciones de búsqueda
interface SearchOptions {
  properties?: string[];
  filterGroups?: any[];
  sorts?: any[];
  limit?: number;
  after?: string;
}

// Clase para interactuar con la API de HubSpot
export class HubspotService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = HUBSPOT_API_CONFIG.baseUrl;
  }

  // Método para obtener el token de acceso
  private async getAccessToken(): Promise<string> {
    // En un entorno real, aquí se obtendría el token de acceso
    // mediante OAuth o desde una variable de entorno
    return process.env.HUBSPOT_API_KEY || this.apiKey;
  }

  // Método para realizar peticiones a la API de HubSpot
  private async fetchFromHubspot(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error en la petición a HubSpot: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al comunicarse con HubSpot:', error);
      throw error;
    }
  }

  // Método para buscar contactos
  async searchContacts(options: SearchOptions = {}): Promise<any> {
    const endpoint = `${HUBSPOT_API_CONFIG.endpoints.contacts}/search`;
    const defaultProperties = CONTACT_PROPERTIES;
    
    const body = {
      properties: options.properties || defaultProperties,
      filterGroups: options.filterGroups || [],
      sorts: options.sorts || [],
      limit: options.limit || HUBSPOT_API_CONFIG.batchSize,
      after: options.after,
    };

    return this.fetchFromHubspot(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Método para buscar campañas
  async searchCampaigns(options: SearchOptions = {}): Promise<any> {
    const endpoint = `${HUBSPOT_API_CONFIG.endpoints.campaigns}/search`;
    const defaultProperties = CAMPAIGN_PROPERTIES;
    
    const body = {
      properties: options.properties || defaultProperties,
      filterGroups: options.filterGroups || [],
      sorts: options.sorts || [],
      limit: options.limit || HUBSPOT_API_CONFIG.batchSize,
      after: options.after,
    };

    return this.fetchFromHubspot(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Método para obtener datos de donaciones (deals)
  async searchDeals(options: SearchOptions = {}): Promise<any> {
    const endpoint = `${HUBSPOT_API_CONFIG.endpoints.deals}/search`;
    const defaultProperties = DONATION_PROPERTIES;
    
    const body = {
      properties: options.properties || defaultProperties,
      filterGroups: options.filterGroups || [],
      sorts: options.sorts || [],
      limit: options.limit || HUBSPOT_API_CONFIG.batchSize,
      after: options.after,
    };

    return this.fetchFromHubspot(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Método para obtener datos para el dashboard
  async getDashboardData(): Promise<any> {
    try {
      // Obtener datos de contactos
      const contactsResponse = await this.searchContacts({
        properties: ['firstname', 'lastname', 'email', 'region', 'contact_type', 'created_date'],
        limit: 100,
      });
      
      // Obtener datos de campañas
      const campaignsResponse = await this.searchCampaigns({
        properties: ['campaign_name', 'campaign_type', 'campaign_status', 'campaign_start_date', 'campaign_end_date', 'campaign_results', 'campaign_roi', 'campaign_region'],
        limit: 50,
      });
      
      // Obtener datos de donaciones
      const dealsResponse = await this.searchDeals({
        properties: ['donation_amount', 'donation_date', 'donation_type', 'donation_region'],
        limit: 100,
      });
      
      // Procesar los datos obtenidos
      return this.processApiData(contactsResponse, campaignsResponse, dealsResponse);
    } catch (error) {
      console.error('Error al obtener datos para el dashboard:', error);
      
      // Si hay un error, devolver datos simulados para desarrollo
      console.warn('Utilizando datos simulados debido a un error en la API');
      return this.getMockDashboardData();
    }
  }
  
  // Método para procesar los datos de la API
  private processApiData(contactsData: any, campaignsData: any, dealsData: any): any {
    try {
      // Extraer contactos
      const contacts = contactsData.results || [];
      
      // Contar afiliados y simpatizantes
      const affiliates = contacts.filter((contact: any) => 
        contact.properties.contact_type === 'Afiliado').length;
      const sympathizers = contacts.filter((contact: any) => 
        contact.properties.contact_type === 'Simpatizante').length;
      
      // Agrupar contactos por región
      const regionMap = new Map();
      contacts.forEach((contact: any) => {
        const region = contact.properties.region || 'No especificada';
        if (!regionMap.has(region)) {
          regionMap.set(region, { 
            name: region, 
            affiliates: 0, 
            sympathizers: 0, 
            total: 0,
            percentage: 0,
            growth: 0 // Se calculará después
          });
        }
        
        const regionData = regionMap.get(region);
        regionData.total++;
        
        if (contact.properties.contact_type === 'Afiliado') {
          regionData.affiliates++;
        } else if (contact.properties.contact_type === 'Simpatizante') {
          regionData.sympathizers++;
        }
      });
      
      // Calcular porcentajes para cada región
      const regions = Array.from(regionMap.values());
      const totalContacts = contacts.length;
      
      regions.forEach(region => {
        region.percentage = (region.total / totalContacts) * 100;
        // Asignar un valor de crecimiento simulado entre 2 y 15
        region.growth = 2 + Math.random() * 13;
      });
      
      // Extraer donaciones
      const donations = dealsData.results || [];
      const donationAmounts = donations.map((deal: any) => 
        parseFloat(deal.properties.donation_amount) || 0);
      
      const totalDonations = donations.length;
      const totalAmount = donationAmounts.reduce((sum: number, amount: number) => sum + amount, 0);
      
      // Agrupar donaciones por mes
      const monthlyDonations = new Map();
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      donations.forEach((deal: any) => {
        const donationDate = new Date(deal.properties.donation_date);
        const monthKey = donationDate.getMonth();
        const amount = parseFloat(deal.properties.donation_amount) || 0;
        
        if (!monthlyDonations.has(monthKey)) {
          monthlyDonations.set(monthKey, { month: months[monthKey], amount: 0, count: 0 });
        }
        
        const monthData = monthlyDonations.get(monthKey);
        monthData.amount += amount;
        monthData.count++;
      });
      
      // Convertir a array y ordenar por mes
      const monthlyData = Array.from(monthlyDonations.values())
        .sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
      
      // Completar meses faltantes
      const completeMonthlyData = months.map(month => {
        const existingData = monthlyData.find(data => data.month === month);
        return existingData || { month, amount: 0, count: 0 };
      });
      
      // Extraer campañas
      const campaigns = campaignsData.results || [];
      const activeCampaigns = campaigns.filter((campaign: any) => 
        campaign.properties.campaign_status === 'active');
      
      // Agrupar campañas por tipo
      const campaignTypeMap = new Map();
      campaigns.forEach((campaign: any) => {
        const type = campaign.properties.campaign_type || 'No especificado';
        
        if (!campaignTypeMap.has(type)) {
          campaignTypeMap.set(type, { 
            type, 
            count: 0, 
            totalConversion: 0,
            totalRoi: 0
          });
        }
        
        const typeData = campaignTypeMap.get(type);
        typeData.count++;
        
        const conversionRate = parseFloat(campaign.properties.campaign_conversion_rate) || 0;
        const roi = parseFloat(campaign.properties.campaign_roi) || 0;
        
        typeData.totalConversion += conversionRate;
        typeData.totalRoi += roi;
      });
      
      // Calcular promedios y convertir a array
      const campaignTypes = Array.from(campaignTypeMap.values()).map(type => ({
        type: type.type,
        count: type.count,
        avgConversion: type.count > 0 ? type.totalConversion / type.count : 0,
        avgRoi: type.count > 0 ? type.totalRoi / type.count : 0
      }));
      
      // Agrupar campañas por región
      const campaignRegionMap = new Map();
      campaigns.forEach((campaign: any) => {
        const region = campaign.properties.campaign_region || 'Nacional';
        
        if (!campaignRegionMap.has(region)) {
          campaignRegionMap.set(region, { 
            region, 
            count: 0, 
            totalConversion: 0,
            totalRoi: 0
          });
        }
        
        const regionData = campaignRegionMap.get(region);
        regionData.count++;
        
        const conversionRate = parseFloat(campaign.properties.campaign_conversion_rate) || 0;
        const roi = parseFloat(campaign.properties.campaign_roi) || 0;
        
        regionData.totalConversion += conversionRate;
        regionData.totalRoi += roi;
      });
      
      // Calcular promedios y convertir a array
      const campaignRegions = Array.from(campaignRegionMap.values()).map(region => ({
        region: region.region,
        count: region.count,
        avgConversion: region.count > 0 ? region.totalConversion / region.count : 0,
        avgRoi: region.count > 0 ? region.totalRoi / region.count : 0
      }));
      
      // Construir y devolver el objeto de datos del dashboard
      return {
        kpiOverview: {
          totalContacts,
          totalAffiliates: affiliates,
          totalSympathizers: sympathizers,
          totalDonations,
          totalAmount,
          conversionRate: totalContacts > 0 ? (affiliates / totalContacts) * 100 : 0,
          growthRate: 12.3, // Valor simulado, se calcularía con datos históricos
        },
        regionalDistribution: {
          regions,
        },
        donationAnalytics: {
          monthly: completeMonthlyData,
          byType: [
            { type: 'Única', amount: totalAmount * 0.6, count: totalDonations * 0.7, percentage: 60 },
            { type: 'Recurrente', amount: totalAmount * 0.4, count: totalDonations * 0.3, percentage: 40 },
          ],
          byRegion: regions.slice(0, 5).map(region => ({
            region: region.name,
            amount: totalAmount * (region.percentage / 100),
            count: Math.round(totalDonations * (region.percentage / 100)),
            percentage: region.percentage
          })),
        },
        campaignEffectiveness: {
          campaigns: campaigns.slice(0, 5).map((campaign: any) => ({
            name: campaign.properties.campaign_name,
            type: campaign.properties.campaign_type,
            startDate: campaign.properties.campaign_start_date,
            endDate: campaign.properties.campaign_end_date,
            goal: parseInt(campaign.properties.campaign_goal) || 0,
            results: parseInt(campaign.properties.campaign_results) || 0,
            conversionRate: parseFloat(campaign.properties.campaign_conversion_rate) || 0,
            roi: parseFloat(campaign.properties.campaign_roi) || 0,
            budget: parseInt(campaign.properties.campaign_budget) || 0,
            region: campaign.properties.campaign_region || 'Nacional',
          })),
          byType: campaignTypes,
          byRegion: campaignRegions,
        },
      };
    } catch (error) {
      console.error('Error al procesar datos de la API:', error);
      return this.getMockDashboardData();
    }
  }

  // Método para obtener datos simulados para el dashboard (como fallback)
  private getMockDashboardData(): any {
    return {
      kpiOverview: {
        totalContacts: 6500,
        totalAffiliates: 2400,
        totalSympathizers: 4100,
        totalDonations: 1850,
        totalAmount: 125000,
        conversionRate: 28.5,
        growthRate: 12.3,
      },
      regionalDistribution: {
        regions: [
          { name: 'Norte', affiliates: 450, sympathizers: 750, total: 1200, percentage: 18.5, growth: 8.2 },
          { name: 'Centro', affiliates: 680, sympathizers: 1120, total: 1800, percentage: 27.7, growth: 15.3 },
          { name: 'Sur', affiliates: 320, sympathizers: 480, total: 800, percentage: 12.3, growth: 5.7 },
          { name: 'Este', affiliates: 580, sympathizers: 920, total: 1500, percentage: 23.1, growth: 10.8 },
          { name: 'Oeste', affiliates: 420, sympathizers: 680, total: 1100, percentage: 16.9, growth: 9.5 },
          { name: 'Noreste', affiliates: 120, sympathizers: 230, total: 350, percentage: 5.4, growth: 7.2 },
          { name: 'Noroeste', affiliates: 150, sympathizers: 270, total: 420, percentage: 6.5, growth: 8.1 },
          { name: 'Sureste', affiliates: 110, sympathizers: 190, total: 300, percentage: 4.6, growth: 6.3 },
          { name: 'Suroeste', affiliates: 130, sympathizers: 210, total: 340, percentage: 5.2, growth: 7.8 },
          { name: 'Central', affiliates: 200, sympathizers: 350, total: 550, percentage: 8.5, growth: 11.2 },
        ],
      },
      donationAnalytics: {
        monthly: [
          { month: 'Ene', amount: 8500, count: 120 },
          { month: 'Feb', amount: 9200, count: 135 },
          { month: 'Mar', amount: 11000, count: 150 },
          { month: 'Abr', amount: 10500, count: 145 },
          { month: 'May', amount: 12500, count: 170 },
          { month: 'Jun', amount: 13800, count: 190 },
          { month: 'Jul', amount: 12000, count: 165 },
          { month: 'Ago', amount: 11500, count: 160 },
          { month: 'Sep', amount: 14500, count: 200 },
          { month: 'Oct', amount: 15800, count: 220 },
          { month: 'Nov', amount: 16200, count: 230 },
          { month: 'Dic', amount: 18500, count: 260 },
        ],
        byType: [
          { type: 'Única', amount: 75000, count: 1200, percentage: 60 },
          { type: 'Recurrente', amount: 50000, count: 650, percentage: 40 },
        ],
        byRegion: [
          { region: 'Norte', amount: 22500, count: 320, percentage: 18 },
          { region: 'Centro', amount: 35000, count: 480, percentage: 28 },
          { region: 'Sur', amount: 15000, count: 220, percentage: 12 },
          { region: 'Este', amount: 28750, count: 410, percentage: 23 },
          { region: 'Oeste', amount: 23750, count: 340, percentage: 19 },
        ],
      },
      campaignEffectiveness: {
        campaigns: [
          { 
            name: 'Campaña de Afiliación Q1', 
            type: 'Afiliación',
            startDate: '2023-01-15',
            endDate: '2023-03-31',
            goal: 500,
            results: 580,
            conversionRate: 8.2,
            roi: 145,
            budget: 15000,
            region: 'Nacional',
          },
          { 
            name: 'Recaudación Primavera', 
            type: 'Recaudación',
            startDate: '2023-04-01',
            endDate: '2023-05-31',
            goal: 25000,
            results: 28500,
            conversionRate: 12.5,
            roi: 190,
            budget: 8000,
            region: 'Nacional',
          },
          { 
            name: 'Evento Regional Norte', 
            type: 'Evento',
            startDate: '2023-06-15',
            endDate: '2023-06-17',
            goal: 150,
            results: 180,
            conversionRate: 15.0,
            roi: 120,
            budget: 12000,
            region: 'Norte',
          },
          { 
            name: 'Digital Sur Q2', 
            type: 'Digital',
            startDate: '2023-04-01',
            endDate: '2023-06-30',
            goal: 300,
            results: 320,
            conversionRate: 6.8,
            roi: 110,
            budget: 18000,
            region: 'Sur',
          },
          { 
            name: 'Territorial Centro', 
            type: 'Territorial',
            startDate: '2023-07-01',
            endDate: '2023-09-30',
            goal: 450,
            results: 520,
            conversionRate: 9.5,
            roi: 135,
            budget: 22000,
            region: 'Centro',
          },
        ],
        byType: [
          { type: 'Afiliación', count: 3, avgConversion: 7.8, avgRoi: 130 },
          { type: 'Recaudación', count: 4, avgConversion: 11.2, avgRoi: 175 },
          { type: 'Evento', count: 5, avgConversion: 14.5, avgRoi: 115 },
          { type: 'Digital', count: 6, avgConversion: 6.5, avgRoi: 125 },
          { type: 'Territorial', count: 4, avgConversion: 9.2, avgRoi: 140 },
        ],
        byRegion: [
          { region: 'Nacional', count: 5, avgConversion: 10.5, avgRoi: 160 },
          { region: 'Norte', count: 3, avgConversion: 12.8, avgRoi: 130 },
          { region: 'Centro', count: 4, avgConversion: 9.5, avgRoi: 145 },
          { region: 'Sur', count: 2, avgConversion: 7.2, avgRoi: 115 },
          { region: 'Este', count: 3, avgConversion: 8.5, avgRoi: 125 },
          { region: 'Oeste', count: 2, avgConversion: 9.8, avgRoi: 135 },
        ],
      },
    };
  }
}

// Exportar una instancia del servicio con la clave de API desde variables de entorno
export const hubspotService = new HubspotService(process.env.HUBSPOT_API_KEY || 'demo-api-key'); 