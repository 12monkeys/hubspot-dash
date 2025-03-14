import { Client } from '@hubspot/api-client';
import { Filter, FilterGroup, PublicObjectSearchRequest, FilterOperatorEnum, SimplePublicObjectWithAssociations } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { Contact, Campaign } from '../types/hubspot';

interface Donation {
  id: string;
  properties: {
    amount: number;
    date: string;
    contact_id?: string;
  }
}

interface ObjectSchema {
  name: string;
  label: string;
  properties: Array<{
    name: string;
    label: string;
    type: string;
    fieldType: string;
    description?: string;
    options?: Array<{ label: string; value: string }>;
  }>;
}

interface DashboardMetrics {
  totalAfiliados: number;
  totalSimpatizantes: number;
  totalDonaciones: number;
  donacionesPromedio: number;
  crecimientoMensual: number;
  distribucionRegional: Array<{ region: string; count: number }>;
  campañasActivas: number;
  tasaConversion: number;
  // Métricas de cuotas
  cuotaPromedio: number;
  distribucionCuotas: Array<{ rango: string; count: number }>;
  ingresoCuotasMensual: number;
  fuentesAdquisicion: Array<{ source: string; count: number }>;
}

interface SearchRequest {
  properties: string[];
  limit: number;
  after?: string;
}

interface ContactSummary {
  total: number;
  afiliados: number;
  simpatizantes: number;
  regiones: Record<string, number>;
  recientes: number;
}

interface LocalFilter {
  filterGroups: {
    filters: {
      propertyName: string;
      operator: string;
      value: string;
    }[];
  }[];
}

interface ApiResponse<T> {
  results: T[];
  // Add other properties if needed
}

interface Workflow {
  id: string;
  properties: {
    hs_name: string;
    hs_campaign_status: string;
    hs_start_date: string | null;
    hs_end_date: string | null;
    hs_audience: number;
    hs_goal: number;
    hs_budget_items_sum_amount: number;
  }
}

interface WorkflowGoal {
  id: string;
  type: string;
  timestamp: string;
  properties: Record<string, any>;
}

interface WorkflowConversion {
  id: string;
  timestamp: string;
  properties: Record<string, any>;
}

interface WorkflowGoalsResponse {
  goals: WorkflowGoal[];
}

interface WorkflowConversionsResponse {
  conversions: WorkflowConversion[];
}

interface MetricRecommendation {
  metric: string;
  currentValue: number;
  targetValue: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

interface TimeSeriesData {
  date: string;
  value: number;
}

// Helper function to create a valid PublicObjectSearchRequest
function createSearchRequest(params: {
  filterGroups?: FilterGroup[];
  limit?: number;
  properties?: string[];
  sorts?: string[];
}): PublicObjectSearchRequest {
  return {
    filterGroups: params.filterGroups || [],
    limit: params.limit || 100,
    properties: params.properties || [],
    after: '0',
    sorts: params.sorts || []
  };
}

class HubSpotService {
  private client: Client;
  private contactSummaryCache: ContactSummary | null = null;
  private contactSummaryCacheTime: number = 0;
  private readonly CACHE_TTL = 3600000; // 1 hora en milisegundos
  private schemaCache: Map<string, ObjectSchema> = new Map();

  constructor(accessToken: string) {
    // Asegurarse de que el token comienza con 'pat-' para tokens de acceso privado
    if (!accessToken.startsWith('pat-')) {
      console.warn('El token de acceso no tiene el formato esperado (pat-...)');
    }
    this.client = new Client({ accessToken });
  }

  private isCacheValid(): boolean {
    return (
      this.contactSummaryCache !== null &&
      Date.now() - this.contactSummaryCacheTime < this.CACHE_TTL
    );
  }

  private async getContactSummary(): Promise<ContactSummary> {
    if (this.isCacheValid()) {
      console.log('Usando caché para resumen de contactos');
      return this.contactSummaryCache!;
    }

    console.log('Obteniendo resumen de contactos...');
    
    try {
      // Usar fetch directo en lugar del cliente para probar
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=100', {
        headers: {
          'Authorization': `Bearer ${this.client.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en respuesta de HubSpot:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Error al obtener contactos: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Simplificar para diagnóstico
      const summary: ContactSummary = {
        total: data.total || data.results.length,
        afiliados: 0, // Simplificado para diagnóstico
        simpatizantes: 0, // Simplificado para diagnóstico
        regiones: {},
        recientes: 0
      };

      this.contactSummaryCache = summary;
      this.contactSummaryCacheTime = Date.now();

      console.log('Resumen de contactos actualizado:', summary);
      return summary;
    } catch (error) {
      console.error('Error al obtener resumen de contactos:', error);
      throw error;
    }
  }

  async getDonations(): Promise<Donation[]> {
    try {
      console.log('Obteniendo resumen de donaciones...');
      
      // Obtener el total de donaciones primero
      const totalDonationsRequest = createSearchRequest({
        limit: 1
      });
      
      let totalDonations = 0;
      
      try {
        const totalResponse = await this.client.crm.objects.searchApi.doSearch('2-134403413', totalDonationsRequest);
        totalDonations = totalResponse.total;
        console.log(`Total de donaciones encontradas: ${totalDonations}`);
      } catch (error: any) {
        if (error.code === 403) {
          console.error('Error de permisos al obtener donaciones. Se requieren los scopes: crm.objects.custom.read, crm.schemas.custom.read');
          return [];
        }
        throw error;
      }
      
      // Si hay donaciones, obtenemos una muestra para análisis
      if (totalDonations === 0) {
        return [];
      }
      
      const searchRequest = createSearchRequest({
        properties: ['importe', 'createdate'],
        limit: 100,
        sorts: ['createdate']
      });

      const response = await this.client.crm.objects.searchApi.doSearch('2-134403413', searchRequest);
      
      if (!response.results || response.results.length === 0) {
        console.log('No se encontraron donaciones en la muestra');
        return [];
      }

      return response.results.map(donation => ({
        id: donation.id,
        properties: {
          amount: donation.properties.importe ? Number(donation.properties.importe) : 0,
          date: donation.properties.createdate || new Date().toISOString(),
        }
      }));
    } catch (error) {
      console.error('Error al obtener donaciones:', error);
      return [];
    }
  }

  async getWorkflowExecutionHistory(workflowId: string): Promise<WorkflowGoal[]> {
    try {
      const response = await this.client.apiRequest({
        method: 'GET',
        path: `/automation/v3/workflows/${workflowId}/goals`,
      });
      
      const data = await response.json() as WorkflowGoalsResponse;
      return data.goals || [];
    } catch (error) {
      console.error('Error fetching workflow execution history:', error);
      return [];
    }
  }

  async getConversionsByWorkflow(workflowId: string): Promise<WorkflowConversion[]> {
    try {
      const response = await this.client.apiRequest({
        method: 'GET',
        path: `/automation/v3/workflows/${workflowId}/conversions`,
      });
      
      const data = await response.json() as WorkflowConversionsResponse;
      return data.conversions || [];
    } catch (error) {
      console.error('Error fetching workflow conversions:', error);
      return [];
    }
  }

  async getCampaigns(): Promise<Workflow[]> {
    try {
      const response = await this.client.apiRequest({
        method: 'GET',
        path: '/crm/v3/objects/campaigns',
      });
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Get contact summary
      const contactSummary = await this.getContactSummary();
      
      // Versión simplificada para diagnóstico
      return {
        totalAfiliados: contactSummary.total,
        totalSimpatizantes: 0,
        totalDonaciones: 0,
        donacionesPromedio: 0,
        crecimientoMensual: 0,
        distribucionRegional: [],
        campañasActivas: 0,
        tasaConversion: 0,
        cuotaPromedio: 0,
        distribucionCuotas: [],
        ingresoCuotasMensual: 0,
        fuentesAdquisicion: []
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  async analyzeAvailableMetrics(): Promise<MetricRecommendation[]> {
    try {
      // Get current metrics
      const metrics = await this.getDashboardMetrics();
      
      const recommendations: MetricRecommendation[] = [];

      // Analyze conversion rate
      if (metrics.tasaConversion < 30) {
        recommendations.push({
          metric: 'Tasa de Conversión',
          currentValue: metrics.tasaConversion,
          targetValue: 30,
          recommendation: 'Implementar estrategias de engagement para aumentar la conversión de simpatizantes a afiliados',
          priority: 'high'
        });
      }

      // Analyze monthly growth
      if (metrics.crecimientoMensual < 5) {
        recommendations.push({
          metric: 'Crecimiento Mensual',
          currentValue: metrics.crecimientoMensual,
          targetValue: 5,
          recommendation: 'Fortalecer las campañas de adquisición y mejorar la estrategia de captación de nuevos contactos',
          priority: 'high'
        });
      }

      // Analyze active campaigns
      if (metrics.campañasActivas < 3) {
        recommendations.push({
          metric: 'Campañas Activas',
          currentValue: metrics.campañasActivas,
          targetValue: 3,
          recommendation: 'Aumentar el número de campañas activas para mejorar el engagement y la captación',
          priority: 'medium'
        });
      }

      // Analyze average donations
      if (metrics.donacionesPromedio < 500) {
        recommendations.push({
          metric: 'Donación Promedio',
          currentValue: metrics.donacionesPromedio,
          targetValue: 500,
          recommendation: 'Implementar estrategias de upselling y mejorar la comunicación del valor de la afiliación',
          priority: 'medium'
        });
      }

      // Analyze regional distribution
      const regionesDesbalanceadas = metrics.distribucionRegional
        .filter(r => r.count < metrics.totalAfiliados * 0.1)
        .map(r => r.region);

      if (regionesDesbalanceadas.length > 0) {
        recommendations.push({
          metric: 'Distribución Regional',
          currentValue: regionesDesbalanceadas.length,
          targetValue: 0,
          recommendation: `Fortalecer la presencia en las regiones: ${regionesDesbalanceadas.join(', ')}`,
          priority: 'low'
        });
      }

      // Sort recommendations by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      return recommendations;
    } catch (error) {
      console.error('Error analyzing metrics:', error);
      return [];
    }
  }

  async getAllSchemas(): Promise<ObjectSchema[]> {
    try {
      // Check cache first
      if (this.schemaCache.size > 0) {
        return Array.from(this.schemaCache.values());
      }

      // Get all schemas from HubSpot
      const response = await this.client.apiRequest({
        method: 'GET',
        path: '/crm/v3/schemas',
      });

      const data = await response.json();
      const schemas: ObjectSchema[] = data.results || [];

      // Cache the schemas
      schemas.forEach(schema => {
        this.schemaCache.set(schema.name, schema);
      });

      return schemas;
    } catch (error) {
      console.error('Error fetching schemas:', error);
      return [];
    }
  }

  async getTimeSeriesData(objectType: string, metric: string, timeframe: string): Promise<TimeSeriesData[]> {
    try {
      // Calculate date range based on timeframe
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30); // Default to 30 days
      }

      // Format dates for API
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Build the API request based on object type and metric
      let response;
      if (objectType === 'contacts') {
        const searchRequest = createSearchRequest({
          filterGroups: [{
            filters: [{
              propertyName: 'createdate',
              operator: FilterOperatorEnum.Between,
              value: `${startDateStr},${endDateStr}`
            }]
          }],
          properties: [metric],
          sorts: ['createdate'],
          limit: 100
        });

        response = await this.client.crm.contacts.searchApi.doSearch(searchRequest);
      } else if (objectType === 'donations') {
        const searchRequest = createSearchRequest({
          filterGroups: [{
            filters: [{
              propertyName: 'createdate',
              operator: FilterOperatorEnum.Between,
              value: `${startDateStr},${endDateStr}`
            }]
          }],
          properties: [metric],
          sorts: ['createdate'],
          limit: 100
        });

        response = await this.client.crm.objects.searchApi.doSearch('2-134403413', searchRequest);
      } else {
        throw new Error(`Unsupported object type: ${objectType}`);
      }

      // Transform the response into TimeSeriesData format
      const timeSeriesData: TimeSeriesData[] = response.results.map(result => ({
        date: result.properties.createdate || new Date().toISOString().split('T')[0],
        value: Number(result.properties[metric]) || 0
      }));

      // Group by date and aggregate values
      const groupedData = timeSeriesData.reduce((acc: Record<string, number>, curr) => {
        const date = curr.date.split('T')[0];
        acc[date] = (acc[date] || 0) + curr.value;
        return acc;
      }, {});

      // Convert back to array format
      return Object.entries(groupedData).map(([date, value]) => ({
        date,
        value
      }));
    } catch (error) {
      console.error('Error fetching time series data:', error);
      return [];
    }
  }

  async getContactsByCampaign(campaignId: string): Promise<Contact[]> {
    try {
      const response = await this.client.apiRequest({
        method: 'GET',
        path: `/crm/v3/objects/campaigns/${campaignId}/associations/contacts`,
      });

      const data = await response.json();
      const contactIds = data.results.map((result: any) => result.id);

      // Get contact details for each contact ID
      const contacts = await Promise.all(
        contactIds.map(async (contactId: string) => {
          const contactResponse = await this.client.crm.contacts.basicApi.getById(
            contactId,
            ['firstname', 'lastname', 'email', 'phone', 'createdate']
          );
          return contactResponse;
        })
      );

      return contacts;
    } catch (error) {
      console.error('Error fetching contacts by campaign:', error);
      return [];
    }
  }

  async getWorkflows(): Promise<Workflow[]> {
    try {
      const response = await this.client.apiRequest({
        method: 'GET',
        path: '/automation/v3/workflows',
      });
      
      const data = await response.json();
      return data.workflows || [];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  }
}

export default HubSpotService; 