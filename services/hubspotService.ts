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

class HubSpotService {
  private client: Client;
  private contactSummaryCache: ContactSummary | null = null;
  private contactSummaryCacheTime: number = 0;
  private readonly CACHE_TTL = 3600000; // 1 hora en milisegundos
  private schemaCache: Map<string, ObjectSchema> = new Map();

  constructor(accessToken: string) {
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
      // Obtenemos el total de contactos
      const totalContactsRequest: PublicObjectSearchRequest = {
        filterGroups: [],
        limit: 1,
        properties: []
      };
      
      const totalResponse = await this.client.crm.contacts.searchApi.doSearch(totalContactsRequest);
      const totalContacts = totalResponse.total;
      
      // Obtenemos el total de afiliados
      const afiliadosRequest: PublicObjectSearchRequest = {
        filterGroups: [{
          filters: [{
            propertyName: 'relacion_con_vox',
            operator: FilterOperatorEnum.Eq,
            value: 'Afiliado'
          }]
        }],
        limit: 1,
        properties: []
      };
      
      const afiliadosResponse = await this.client.crm.contacts.searchApi.doSearch(afiliadosRequest);
      const totalAfiliados = afiliadosResponse.total;
      
      // Obtenemos el total de simpatizantes
      const simpatizantesRequest: PublicObjectSearchRequest = {
        filterGroups: [{
          filters: [{
            propertyName: 'relacion_con_vox',
            operator: FilterOperatorEnum.Eq,
            value: 'Simpatizante'
          }]
        }],
        limit: 1,
        properties: []
      };
      
      const simpatizantesResponse = await this.client.crm.contacts.searchApi.doSearch(simpatizantesRequest);
      const totalSimpatizantes = simpatizantesResponse.total;
      
      // Obtenemos el total de contactos recientes (último mes)
      const fechaUnMesAtras = new Date();
      fechaUnMesAtras.setMonth(fechaUnMesAtras.getMonth() - 1);
      const fechaUnMesAtrasStr = fechaUnMesAtras.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const contactosRecientesRequest: PublicObjectSearchRequest = {
        filterGroups: [{
          filters: [{
            propertyName: 'createdate',
            operator: FilterOperatorEnum.Gte,
            value: fechaUnMesAtrasStr
          }]
        }],
        limit: 1,
        properties: []
      };
      
      const contactosRecientesResponse = await this.client.crm.contacts.searchApi.doSearch(contactosRecientesRequest);
      const totalContactosRecientes = contactosRecientesResponse.total;
      
      // Para la distribución regional, necesitamos hacer una consulta separada para cada región
      // Para simplificar, obtendremos una muestra de contactos para calcular la distribución aproximada
      const regionesRequest: PublicObjectSearchRequest = {
        filterGroups: [],
        limit: 100,
        properties: ['provincia'],
        sorts: ['createdate']
      };
      
      const regionesResponse = await this.client.crm.contacts.searchApi.doSearch(regionesRequest);
      const regiones: Record<string, number> = {};
      
      // Calculamos la distribución con la muestra, luego la extrapolamos al total
      regionesResponse.results.forEach(contact => {
        const region = contact.properties.provincia || 'No especificada';
        regiones[region] = (regiones[region] || 0) + 1;
      });
      
      const summary: ContactSummary = {
        total: totalContacts,
        afiliados: totalAfiliados,
        simpatizantes: totalSimpatizantes,
        regiones,
        recientes: totalContactosRecientes
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
      const totalDonationsRequest: PublicObjectSearchRequest = {
        filterGroups: [],
        limit: 1,
        properties: []
      };
      
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
      
      const searchRequest: PublicObjectSearchRequest = {
        properties: ['importe', 'createdate'],
        limit: 100,
        filterGroups: [],
        sorts: ['createdate']
      };

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
      
      // Get donations
      const donations = await this.getDonations();
      
      // Calculate donation metrics
      const totalDonaciones = donations.length;
      const donacionesPromedio = totalDonaciones > 0 
        ? donations.reduce((sum, d) => sum + d.properties.amount, 0) / totalDonaciones 
        : 0;

      // Calculate monthly growth
      const fechaUnMesAtras = new Date();
      fechaUnMesAtras.setMonth(fechaUnMesAtras.getMonth() - 1);
      const fechaUnMesAtrasStr = fechaUnMesAtras.toISOString().split('T')[0];
      
      const contactosRecientes = contactSummary.recientes;
      const crecimientoMensual = contactSummary.total > 0 
        ? (contactosRecientes / contactSummary.total) * 100 
        : 0;

      // Transform regional distribution
      const distribucionRegional = Object.entries(contactSummary.regiones)
        .map(([region, count]) => ({
          region,
          count
        }));

      // Get active campaigns
      const campaigns = await this.getCampaigns();
      const campañasActivas = campaigns.filter(c => 
        c.properties.hs_campaign_status === 'ACTIVE'
      ).length;

      // Calculate conversion rate (simplified)
      const tasaConversion = contactSummary.total > 0 
        ? (contactSummary.afiliados / contactSummary.total) * 100 
        : 0;

      // Calculate quota metrics
      const cuotaPromedio = donacionesPromedio;
      const distribucionCuotas = [
        { rango: '0-100', count: donations.filter(d => d.properties.amount <= 100).length },
        { rango: '101-500', count: donations.filter(d => d.properties.amount > 100 && d.properties.amount <= 500).length },
        { rango: '501-1000', count: donations.filter(d => d.properties.amount > 500 && d.properties.amount <= 1000).length },
        { rango: '1000+', count: donations.filter(d => d.properties.amount > 1000).length }
      ];

      // Calculate monthly quota income
      const ingresoCuotasMensual = donations
        .filter(d => new Date(d.properties.date) >= fechaUnMesAtras)
        .reduce((sum, d) => sum + d.properties.amount, 0);

      // Get acquisition sources
      const fuentesAdquisicion = [
        { source: 'Directo', count: contactSummary.afiliados },
        { source: 'Indirecto', count: contactSummary.simpatizantes }
      ];

      return {
        totalAfiliados: contactSummary.afiliados,
        totalSimpatizantes: contactSummary.simpatizantes,
        totalDonaciones,
        donacionesPromedio,
        crecimientoMensual,
        distribucionRegional,
        campañasActivas,
        tasaConversion,
        cuotaPromedio,
        distribucionCuotas,
        ingresoCuotasMensual,
        fuentesAdquisicion
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
}

export default HubSpotService; 