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
  private accessToken: string;

  constructor(accessToken: string) {
    // Store the token for direct use
    this.accessToken = accessToken;
    
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
      // 1. Primero, obtener el total de contactos sin recuperar datos
      console.log('Obteniendo total de contactos...');
      const totalContactsUrl = 'https://api.hubapi.com/crm/v3/objects/contacts/search';
      
      // Añadir un timeout para esta solicitud
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos
      
      try {
        const totalResponse = await fetch(totalContactsUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            limit: 0,
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: "hs_object_id",
                    operator: "HAS_PROPERTY"
                  }
                ]
              }
            ]
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const totalData = await totalResponse.json();
        const totalContacts = totalData.total || 0;
        console.log(`Total de contactos en HubSpot: ${totalContacts}`);
        
        // 2. Reducir aún más la muestra - solo 2 páginas (200 contactos)
        let allContacts: any[] = [];
        let hasMore = true;
        let after: string | undefined = undefined;
        let pageCount = 0;
        const MAX_PAGES = 2; // Reducir a 2 páginas (200 contactos)
        
        // Establecer un timeout global para toda la función de obtención de muestra
        const sampleTimeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout al obtener muestra de contactos')), 20000); // 20 segundos
        });
        
        // Crear una promesa para obtener la muestra
        const samplePromise = (async () => {
          while (hasMore && pageCount < MAX_PAGES) {
            pageCount++;
            console.log(`Obteniendo página ${pageCount} de contactos (muestra)...`);
            
            const pageController = new AbortController();
            const pageTimeoutId = setTimeout(() => pageController.abort(), 8000); // 8 segundos por página
            
            try {
              const url: string = after 
                ? `https://api.hubapi.com/crm/v3/objects/contacts?limit=100&after=${after}&properties=createdate,email,firstname,lastname,relacion_con_vox,region`
                : 'https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=createdate,email,firstname,lastname,relacion_con_vox,region';
              
              const response = await fetch(url, {
                headers: {
                  'Authorization': `Bearer ${this.accessToken}`,
                  'Content-Type': 'application/json'
                },
                signal: pageController.signal
              });
              
              clearTimeout(pageTimeoutId);
              
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
              
              if (pageCount === 1 && data.results && data.results.length > 0) {
                console.log('Ejemplo de propiedades de contacto:', data.results[0].properties);
              }
              
              allContacts = [...allContacts, ...data.results];
              console.log(`Obtenidos ${data.results.length} contactos en la página ${pageCount}`);
              
              if (data.paging && data.paging.next && data.paging.next.after) {
                after = data.paging.next.after;
              } else {
                hasMore = false;
              }
            } catch (fetchError) {
              if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                console.error(`Timeout al obtener la página ${pageCount} de contactos`);
                break; // Salir del bucle en caso de timeout
              } else {
                console.error('Error al obtener contactos:', fetchError);
                break; // Salir del bucle en caso de error
              }
            }
          }
          
          return allContacts;
        })();
        
        // Competir entre el timeout y la obtención de la muestra
        try {
          allContacts = await Promise.race([samplePromise, sampleTimeoutPromise]);
        } catch (timeoutError) {
          console.error('Timeout global al obtener muestra de contactos');
          // Continuar con los contactos que hayamos obtenido hasta ahora
        }
        
        // 3. Calcular proporciones basadas en la muestra
        const sampleSize = allContacts.length;
        console.log(`Muestra analizada: ${sampleSize} contactos`);
        
        if (sampleSize === 0) {
          console.warn('No se pudieron obtener contactos para análisis');
          return {
            total: totalContacts,
            afiliados: 0,
            simpatizantes: 0,
            regiones: {},
            recientes: 0
          };
        }
        
        // Contar afiliados y simpatizantes en la muestra
        const afiliadosEnMuestra = allContacts.filter(c => 
          c.properties.relacion_con_vox === 'Afiliado').length;
        
        const simpatizantesEnMuestra = allContacts.filter(c => 
          c.properties.relacion_con_vox === 'Simpatizante').length;
        
        console.log(`En la muestra: ${afiliadosEnMuestra} afiliados, ${simpatizantesEnMuestra} simpatizantes`);
        
        // Extrapolar al total real
        const afiliados = Math.round((afiliadosEnMuestra / sampleSize) * totalContacts);
        const simpatizantes = Math.round((simpatizantesEnMuestra / sampleSize) * totalContacts);
        
        // Calcular distribución regional en la muestra
        const regionesEnMuestra: Record<string, number> = {};
        allContacts.forEach(contact => {
          const region = contact.properties.region || 'No especificada';
          regionesEnMuestra[region] = (regionesEnMuestra[region] || 0) + 1;
        });
        
        // Extrapolar regiones al total real
        const regiones: Record<string, number> = {};
        Object.entries(regionesEnMuestra).forEach(([region, count]) => {
          regiones[region] = Math.round((count / sampleSize) * totalContacts);
        });
        
        // Calcular contactos recientes (último mes) en la muestra
        const fechaUnMesAtras = new Date();
        fechaUnMesAtras.setMonth(fechaUnMesAtras.getMonth() - 1);
        const recientesEnMuestra = allContacts.filter(c => 
          new Date(c.properties.createdate) >= fechaUnMesAtras).length;
        
        // Add this line before the summary object
        const recientes = Math.round((recientesEnMuestra / sampleSize) * totalContacts);
        
        const summary: ContactSummary = {
          total: totalContacts,
          afiliados,
          simpatizantes,
          regiones,
          recientes
        };

        this.contactSummaryCache = summary;
        this.contactSummaryCacheTime = Date.now();

        console.log('Resumen de contactos actualizado (extrapolado):', summary);
        return summary;
      } catch (error) {
        console.error('Error al obtener resumen de contactos:', error);
        // En caso de error, devolver un resumen vacío
        return {
          total: 0,
          afiliados: 0,
          simpatizantes: 0,
          regiones: {},
          recientes: 0
        };
      }
    } catch (error) {
      console.error('Error al obtener resumen de contactos:', error);
      // En caso de error, devolver un resumen vacío
      return {
        total: 0,
        afiliados: 0,
        simpatizantes: 0,
        regiones: {},
        recientes: 0
      };
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
        // Registrar el error completo para diagnóstico
        console.error('Error completo al buscar donaciones:', error);
        return [];
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

      try {
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
      } catch (searchError) {
        console.error('Error al buscar donaciones:', searchError);
        return [];
      }
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
      
      // Verificar si la respuesta es válida antes de intentar parsearla
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data.results || [];
      } else {
        // Si no es JSON, leer como texto para diagnóstico
        const textResponse = await response.text();
        console.error('Respuesta no-JSON de la API de campañas:', textResponse);
        return [];
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    console.log('Obteniendo métricas del dashboard...');
    
    try {
      // Obtener resumen de contactos
      const contactSummary = await this.getContactSummary();
      
      // Obtener donaciones
      const donations = await this.getDonations();
      const totalDonaciones = donations.reduce((sum, donation) => sum + donation.properties.amount, 0);
      const donacionesPromedio = donations.length > 0 ? totalDonaciones / donations.length : 0;
      
      // Obtener campañas activas
      const campaigns = await this.getCampaigns();
      const activeCampaigns = campaigns.filter(c => c.properties.hs_campaign_status === 'ACTIVE').length;
      
      // Calcular tasa de conversión (simpatizantes a afiliados)
      const tasaConversion = contactSummary.simpatizantes > 0 
        ? (contactSummary.afiliados / (contactSummary.simpatizantes + contactSummary.afiliados)) * 100 
        : 0;
      
      // Calcular distribución regional
      const regionDistribution = Object.entries(contactSummary.regiones)
        .map(([region, count]) => ({ region, count, percentage: count / contactSummary.total }))
        .sort((a, b) => b.count - a.count);
      
      // Calcular métricas de cuotas
      const cuotaPromedio = 17.03; // Valor de ejemplo, idealmente vendría de los datos
      
      // Calcular distribución de cuotas
      const cuotaRanges = [
        { min: 0, max: 5, label: "0-5€" },
        { min: 5, max: 10, label: "5-10€" },
        { min: 10, max: 20, label: "10-20€" },
        { min: 20, max: 50, label: "20-50€" },
        { min: 50, max: Infinity, label: "50+€" }
      ];
      
      // Simular distribución de cuotas (en una implementación real, esto vendría de los datos)
      const distribucionCuotas = cuotaRanges.map(range => ({
        rango: range.label,
        count: Math.floor(Math.random() * 100) + 10
      }));
      
      // Calcular ingreso mensual estimado por cuotas
      const ingresoCuotasMensual = contactSummary.afiliados * cuotaPromedio;
      
      // Calcular crecimiento mensual (simulado)
      const crecimientoMensual = 2.5; // Ejemplo, idealmente calculado con datos históricos
      
      // Simular fuentes de adquisición
      const fuentesAdquisicion = [
        { source: "Redes Sociales", count: Math.floor(contactSummary.total * 0.35) },
        { source: "Sitio Web", count: Math.floor(contactSummary.total * 0.25) },
        { source: "Eventos", count: Math.floor(contactSummary.total * 0.20) },
        { source: "Referidos", count: Math.floor(contactSummary.total * 0.15) },
        { source: "Otros", count: Math.floor(contactSummary.total * 0.05) }
      ];
      
      // Generar datos de series temporales para los últimos 6 meses
      const now = new Date();
      const timeSeriesData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now);
        date.setMonth(date.getMonth() - 5 + i);
        
        // Simular crecimiento progresivo
        const factor = 0.85 + (i * 0.03);
        
        return {
          date: date.toISOString().substring(0, 7), // YYYY-MM format
          affiliates: Math.round(contactSummary.afiliados * factor),
          sympathizers: Math.round(contactSummary.simpatizantes * factor),
          conversionRate: tasaConversion * (0.95 + (i * 0.01)),
          averageQuota: cuotaPromedio * (0.98 + (i * 0.005))
        };
      });
      
      // Calcular distribución por comunidades autónomas
      const comunidadesDistribution = this.calculateComunidadesDistribution(contactSummary);
      
      // Calcular distribución por tipo de afiliado
      const tipoAfiliadoDistribution = this.calculateTipoAfiliadoDistribution(contactSummary);
      
      // Calcular métricas de donaciones
      const donationMetrics = this.calculateDonationMetrics(donations);
      
      // Calcular métricas de campañas
      const campaignMetrics = this.calculateCampaignMetrics(campaigns);
      
      const dashboardMetrics: DashboardMetrics = {
        totalAfiliados: contactSummary.afiliados,
        totalSimpatizantes: contactSummary.simpatizantes,
        crecimientoMensual,
        totalDonaciones,
        donacionesPromedio,
        campañasActivas: activeCampaigns,
        distribucionRegional: regionDistribution,
        cuotaPromedio,
        distribucionCuotas,
        ingresoCuotasMensual,
        fuentesAdquisicion,
        tasaConversion: 3.5 // Mock value
      };
      
      return dashboardMetrics;
    } catch (error) {
      console.error('Error al obtener métricas del dashboard:', error);
      throw error;
    }
  }

  // Helper methods for calculating additional metrics
  private calculateComunidadesDistribution(contactSummary: ContactSummary) {
    // En una implementación real, esto vendría de los datos de HubSpot
    // Aquí simulamos datos basados en las comunidades autónomas de España
    const comunidades = [
      "ANDALUCÍA", "ARAGÓN", "ASTURIAS", "BALEARES", "CANARIAS",
      "CANTABRIA", "CASTILLA Y LEÓN", "CASTILLA-LA MANCHA", "CATALUÑA",
      "COMUNIDAD VALENCIANA", "EXTREMADURA", "GALICIA", "MADRID",
      "MURCIA", "NAVARRA", "PAÍS VASCO", "LA RIOJA", "CEUTA", "MELILLA"
    ];
    
    return comunidades.map(comunidad => ({
      name: comunidad,
      value: Math.floor(Math.random() * 1000) + 100,
      growth: (Math.random() * 10) - 2 // Crecimiento entre -2% y 8%
    }));
  }

  private calculateTipoAfiliadoDistribution(contactSummary: ContactSummary) {
    // Distribución por tipo de afiliado (activo, inactivo, etc.)
    return [
      { name: "Activo", value: Math.floor(contactSummary.afiliados * 0.75) },
      { name: "Inactivo", value: Math.floor(contactSummary.afiliados * 0.15) },
      { name: "Baja", value: Math.floor(contactSummary.afiliados * 0.10) }
    ];
  }

  private calculateDonationMetrics(donations: Donation[]) {
    // Agrupar donaciones por mes
    const donationsByMonth: Record<string, number> = {};
    
    donations.forEach(donation => {
      const date = new Date(donation.properties.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!donationsByMonth[monthKey]) {
        donationsByMonth[monthKey] = 0;
      }
      
      donationsByMonth[monthKey] += donation.properties.amount;
    });
    
    // Convertir a array para gráficos
    const monthlyDonations = Object.entries(donationsByMonth)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    // Calcular rangos de donaciones
    const donationRanges = [
      { min: 0, max: 10, label: "0-10€" },
      { min: 10, max: 50, label: "10-50€" },
      { min: 50, max: 100, label: "50-100€" },
      { min: 100, max: 500, label: "100-500€" },
      { min: 500, max: Infinity, label: "500+€" }
    ];
    
    const donationDistribution = donationRanges.map(range => {
      const count = donations.filter(d => 
        d.properties.amount >= range.min && d.properties.amount < range.max
      ).length;
      
      return {
        range: range.label,
        count,
        percentage: donations.length > 0 ? count / donations.length : 0
      };
    });
    
    return {
      monthlyDonations,
      donationDistribution,
      totalDonors: new Set(donations.map(d => d.properties.contact_id).filter(Boolean)).size
    };
  }

  private calculateCampaignMetrics(campaigns: Workflow[]) {
    // Métricas de campañas
    const activeCampaigns = campaigns.filter(c => c.properties.hs_campaign_status === 'ACTIVE');
    const completedCampaigns = campaigns.filter(c => c.properties.hs_campaign_status === 'COMPLETED');
    
    // Calcular efectividad de campañas (simulado)
    const campaignEffectiveness = activeCampaigns.map(campaign => ({
      name: campaign.properties.hs_name,
      goal: campaign.properties.hs_goal || 0,
      current: Math.floor(Math.random() * (campaign.properties.hs_goal || 100)),
      conversionRate: Math.random() * 10 + 5 // Entre 5% y 15%
    }));
    
    return {
      activeCampaignsCount: activeCampaigns.length,
      completedCampaignsCount: completedCampaigns.length,
      campaignEffectiveness
    };
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