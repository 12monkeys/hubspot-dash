import { Client } from '@hubspot/api-client';
import { Filter, FilterGroup, PublicObjectSearchRequest, FilterOperatorEnum, SimplePublicObjectWithAssociations } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { Contact, Donation, Campaign } from '../types/hubspot';
import HubSpotService from "@/services/hubspotService";

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
          contact_id: donation.id
        }
      }));
    } catch (error: any) {
      console.error('Error al obtener donaciones:', error);
      return [];
    }
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      console.log('Calculando métricas del dashboard...');
      
      const contactSummary = await this.getContactSummary();
      const donations = await this.getDonations();
      // Obtener info de cuotas
      const cuotasInfo = await this.getCuotasInfo();

      const distribucionRegional = Object.entries(contactSummary.regiones)
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count);

      const tasaConversion = 
        ((contactSummary.afiliados) / 
        (contactSummary.afiliados + contactSummary.simpatizantes)) * 100 || 0;

      const crecimientoMensual = 
        (contactSummary.recientes / contactSummary.total) * 100 || 0;

      return {
        totalAfiliados: contactSummary.afiliados,
        totalSimpatizantes: contactSummary.simpatizantes,
        totalDonaciones: donations.length,
        donacionesPromedio: donations.reduce((acc, d) => acc + d.properties.amount, 0) / donations.length || 0,
        crecimientoMensual,
        distribucionRegional,
        campañasActivas: 0,
        tasaConversion,
        // Datos de cuotas
        cuotaPromedio: cuotasInfo.promedio,
        distribucionCuotas: cuotasInfo.distribucion,
        ingresoCuotasMensual: cuotasInfo.ingresoMensual,
        fuentesAdquisicion: [{ source: 'Desconocido', count: contactSummary.total }]
      };
    } catch (error) {
      console.error('Error al calcular métricas del dashboard:', error);
      return {
        totalAfiliados: 0,
        totalSimpatizantes: 0,
        totalDonaciones: 0,
        donacionesPromedio: 0,
        crecimientoMensual: 0,
        distribucionRegional: [],
        campañasActivas: 0,
        tasaConversion: 0,
        // Valores por defecto para cuotas
        cuotaPromedio: 0,
        distribucionCuotas: [],
        ingresoCuotasMensual: 0,
        fuentesAdquisicion: []
      };
    }
  }

  /**
   * Obtiene información sobre las cuotas de afiliados
   */
  private async getCuotasInfo(): Promise<{
    promedio: number;
    distribucion: Array<{ rango: string; count: number }>;
    ingresoMensual: number;
  }> {
    try {
      // Primero obtenemos el total de afiliados para el cálculo posterior
      const contactSummary = await this.getContactSummary();
      
      // Obtenemos afiliados con su información de cuotas
      const afiliadosRequest: PublicObjectSearchRequest = {
        filterGroups: [{
          filters: [{
            propertyName: 'relacion_con_vox',
            operator: FilterOperatorEnum.Eq,
            value: 'Afiliado'
          }]
        }],
        limit: 100, // Muestra para análisis
        properties: ['apl_cuota_afiliado', 'periodicidad', 'configuracion_de_pago'],
        sorts: ['createdate']
      };
      
      const response = await this.client.crm.contacts.searchApi.doSearch(afiliadosRequest);
      
      // Si no hay resultados o error, devolver valores por defecto
      if (!response.results || response.results.length === 0) {
        return {
          promedio: 0,
          distribucion: [],
          ingresoMensual: 0
        };
      }
      
      // Calculamos el promedio de cuota
      let totalCuota = 0;
      let countWithCuota = 0;
      const rangos: Record<string, number> = {
        'Menos de 5€': 0,
        'Entre 5€ y 9€': 0,
        'Entre 10€ y 14€': 0,
        'Entre 15€ y 29€': 0,
        '30€ o más': 0
      };
      
      // Factores de conversión según periodicidad para calcular mensual
      const factorPeriodicidad: Record<string, number> = {
        'MENSUAL': 1,
        'TRIMESTRAL': 1/3,
        'SEMESTRAL': 1/6,
        'ANUAL': 1/12
      };
      
      let ingresoMensualTotal = 0;
      
      response.results.forEach(afiliado => {
        const cuota = afiliado.properties.apl_cuota_afiliado 
          ? Number(afiliado.properties.apl_cuota_afiliado) 
          : 0;
          
        if (cuota > 0) {
          totalCuota += cuota;
          countWithCuota++;
          
          // Clasificar por rangos
          if (cuota < 5) rangos['Menos de 5€']++;
          else if (cuota < 10) rangos['Entre 5€ y 9€']++;
          else if (cuota < 15) rangos['Entre 10€ y 14€']++;
          else if (cuota < 30) rangos['Entre 15€ y 29€']++;
          else rangos['30€ o más']++;
          
          // Calcular ingreso mensual equivalente según periodicidad
          const periodicidad = afiliado.properties.periodicidad || 'MENSUAL';
          const factor = factorPeriodicidad[periodicidad] || 1;
          ingresoMensualTotal += cuota * factor;
        }
      });
      
      // Expandir a la población total de afiliados
      const factorExpansion = contactSummary.afiliados / response.results.length;
      ingresoMensualTotal *= factorExpansion;
      
      // Convertir rangos a formato de array
      const distribucion = Object.entries(rangos)
        .map(([rango, count]) => ({ rango, count }))
        .sort((a, b) => {
          // Ordenar por rangos de menor a mayor
          const orden: Record<string, number> = {
            'Menos de 5€': 1,
            'Entre 5€ y 9€': 2,
            'Entre 10€ y 14€': 3,
            'Entre 15€ y 29€': 4,
            '30€ o más': 5
          };
          return orden[a.rango] - orden[b.rango];
        });
      
      return {
        promedio: countWithCuota > 0 ? totalCuota / countWithCuota : 0,
        distribucion,
        ingresoMensual: ingresoMensualTotal
      };
    } catch (error) {
      console.error('Error al obtener información de cuotas:', error);
      return {
        promedio: 0,
        distribucion: [],
        ingresoMensual: 0
      };
    }
  }

  /**
   * Obtiene el schema completo de un objeto de HubSpot
   * @param objectType Tipo de objeto (contacts, deals, 2-134403413 para donaciones, etc)
   */
  async getObjectSchema(objectType: string): Promise<ObjectSchema> {
    try {
      console.log(`Obteniendo schema para ${objectType}...`);
      
      let endpoint = '';
      if (objectType === 'contacts') {
        endpoint = '/crm/v3/properties/contacts';
      } else if (objectType === 'deals') {
        endpoint = '/crm/v3/properties/deals';
      } else {
        // Para objetos personalizados
        endpoint = `/crm/v3/schemas/${objectType}`;
      }

      const response = await this.client.apiRequest({
        method: 'GET',
        path: endpoint
      });

      const data = await response.json();
      
      // Procesamos la respuesta según el tipo de objeto
      let properties: { name: string; label: string; type: string; fieldType: string; description?: string; options?: { label: string; value: string; }[] }[] = [];
      if (Array.isArray(data)) {
        // For contacts and deals
        properties = data.map((prop: any) => ({
          name: prop.name,
          label: prop.label || '',
          type: prop.type || '',
          fieldType: prop.fieldType || '',
          description: prop.description,
          options: prop.options
        }));
      } else if (data.properties) {
        // For custom objects
        properties = data.properties.map((prop: any) => ({
          name: prop.name,
          label: prop.label || '',
          type: prop.type || '',
          fieldType: prop.fieldType || '',
          description: prop.description,
          options: prop.options
        }));
      }

      const schema: ObjectSchema = {
        name: objectType,
        label: data.label || objectType,
        properties: properties || []
      };

      // Guardamos en caché
      this.schemaCache.set(objectType, schema);

      return schema;
    } catch (error) {
      console.error(`Error al obtener schema para ${objectType}:`, error);
      throw error;
    }
  }

  /**
   * Analiza las propiedades disponibles y sugiere métricas relevantes
   */
  async analyzeAvailableMetrics(): Promise<{
    availableMetrics: string[];
    suggestedCrossReferences: string[];
    recommendations: string[];
  }> {
    try {
      // Obtener schemas de los objetos principales
      const [contactSchema, donationSchema] = await Promise.all([
        this.getObjectSchema('contacts'),
        this.getObjectSchema('2-134403413')
      ]);

      const availableMetrics: string[] = [];
      const suggestedCrossReferences: string[] = [];
      const recommendations: string[] = [];

      // Analizar propiedades de contactos
      contactSchema.properties.forEach(prop => {
        if (prop.fieldType === 'number' || prop.fieldType === 'date' || 
            prop.fieldType === 'enumeration') {
          availableMetrics.push(`Contactos - ${prop.label}`);
        }
      });

      // Analizar propiedades de donaciones
      donationSchema.properties.forEach(prop => {
        if (prop.fieldType === 'number' || prop.fieldType === 'date') {
          availableMetrics.push(`Donaciones - ${prop.label}`);
        }
      });

      // Sugerir cruces de información relevantes
      suggestedCrossReferences.push(
        'Donaciones por región',
        'Frecuencia de donación por tipo de contacto',
        'Conversión de simpatizante a afiliado por región',
        'Efectividad de campañas por región'
      );

      // Generar recomendaciones basadas en los datos disponibles
      recommendations.push(
        'Analizar patrones de donación por región y temporada',
        'Identificar regiones con alta tasa de conversión',
        'Seguimiento de la efectividad de campañas de captación',
        'Análisis de tiempo promedio de conversión simpatizante a afiliado'
      );

      return {
        availableMetrics,
        suggestedCrossReferences,
        recommendations
      };
    } catch (error) {
      console.error('Error al analizar métricas disponibles:', error);
      throw error;
    }
  }

  /**
   * Obtiene las propiedades disponibles de todos los objetos relevantes
   */
  async getAllSchemas(): Promise<Record<string, ObjectSchema>> {
    try {
      const objectTypes = ['contacts', '2-134403413']; // Añadir más tipos según sea necesario
      const schemas: Record<string, ObjectSchema> = {};

      for (const type of objectTypes) {
        schemas[type] = await this.getObjectSchema(type);
      }

      return schemas;
    } catch (error) {
      console.error('Error al obtener todos los schemas:', error);
      throw error;
    }
  }

  // Análisis temporal de los datos
  async getTimeSeriesData(objectType: string, metric: string, timeframe: string) {
    try {
      let endpoint = '';
      let properties: string[] = [];
      
      switch (objectType) {
        case 'contacts':
          endpoint = '/crm/v3/objects/contacts';
          properties = ['createdate', 'relacion_con_vox', 'apl_cuota_afiliado'];
          break;
        case 'campaigns':
          endpoint = '/marketing/v3/campaigns';
          properties = ['hs_name', 'hs_created_at'];
          break;
        // Otros casos para diferentes objetos
      }
      
      // Calcular fecha de inicio según timeframe
      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      // Formato ISO para filtros
      const startDateISO = startDate.toISOString();
      
      // Construir filtros según métrica
      let filter: LocalFilter = { filterGroups: [] };
      switch (metric) {
        case 'new_contacts':
          filter = {
            filterGroups: [{
              filters: [{
                propertyName: 'createdate',
                operator: 'GTE',
                value: startDateISO
              }]
            }]
          };
          break;
        case 'new_affiliates':
          filter = {
            filterGroups: [{
              filters: [
                {
                  propertyName: 'relacion_con_vox',
                  operator: 'EQ',
                  value: 'Afiliado'
                },
                {
                  propertyName: 'createdate',
                  operator: 'GTE',
                  value: startDateISO
                }
              ]
            }]
          };
          break;
        // Otros casos para diferentes métricas
      }
      
      const response = await this.client.apiRequest({
        method: 'POST',
        path: `${endpoint}/search`,
        body: {
          filterGroups: filter.filterGroups,
          sorts: [{ propertyName: 'createdate', direction: 'ASCENDING' }],
          properties,
          limit: 100
        }
      });
      
      const data: ApiResponse<any> = await response.json(); // Ensure response is parsed as JSON
      
      // Process data.results
      const timeSeriesData = this.processTimeSeriesData(data.results, metric);
      
      return timeSeriesData;
    } catch (error) {
      console.error(`Error al obtener datos de series temporales: ${error}`);
      return [];
    }
  }

  // Procesar datos para análisis temporal
  private processTimeSeriesData(data: any[], metric: string) {
    if (!data || data.length === 0) return [];
    
    // Agrupar por día
    const groupedByDay = data.reduce((acc, item) => {
      const date = new Date(item.properties.createdate);
      const dayKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().split('T')[0];
      
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      
      acc[dayKey].push(item);
      return acc;
    }, {});
    
    // Convertir a formato de serie temporal
    const timeSeriesData = Object.keys(groupedByDay).map(day => {
      const count = groupedByDay[day].length;
      let value = count;
      
      // Cálculos específicos según la métrica
      switch (metric) {
        case 'average_quota':
          const totalQuota = groupedByDay[day].reduce((sum: number, item: { properties: { apl_cuota_afiliado: string } }) => {
            return sum + (parseFloat(item.properties.apl_cuota_afiliado) || 0);
          }, 0);
          value = totalQuota / count;
          break;
        // Otros cálculos específicos
      }
      
      return {
        date: day,
        value: value
      };
    });
    
    return timeSeriesData;
  }

  // Obtener contactos por campaña
  async getContactsByCampaign(campaignId: string) {
    try {
      // Primero obtenemos los contactos que han interactuado con la campaña
      const response = await this.client.apiRequest({
        method: 'GET',
        path: `/marketing/v3/campaigns/${campaignId}/contacts`,
        qs: {
          limit: 100
        }
      });
      
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        return [];
      }

      // Obtenemos los detalles de cada contacto
      const contactIds = data.results.map((result: any) => result.id);
      const contactDetails = await this.getContactsByIds(contactIds);
      
      return contactDetails;
    } catch (error) {
      console.error(`Error al obtener contactos por campaña: ${error}`);
      return [];
    }
  }

  // Obtener contactos por IDs
  async getContactsByIds(contactIds: string[]) {
    try {
      if (!contactIds || contactIds.length === 0) return [];
      
      // Dividir en chunks de 100 para respetar límites de API
      const chunks = this.chunkArray(contactIds, 100);
      let allContacts: any[] = [];
      
      for (const chunk of chunks) {
        const response = await this.client.apiRequest({
          method: 'POST',
          path: '/crm/v3/objects/contacts/batch/read',
          body: {
            inputs: chunk.map((id: string) => ({ id })),
            properties: [
              'firstname', 
              'lastname', 
              'email', 
              'relacion_con_vox', 
              'fecha_de_afiliacion',
              'comunidad_autonoma',
              'apl_cuota_afiliado',
              'intereses',
              'preocupaciones'
            ]
          }
        });
        
        const data = await response.json();
        
        if (data.results) {
          allContacts = [...allContacts, ...data.results];
        }
      }
      
      return allContacts;
    } catch (error) {
      console.error(`Error al obtener contactos por IDs: ${error}`);
      return [];
    }
  }

  // Dividir array en chunks
  private chunkArray(array: any[], chunkSize: number) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Obtener workflows y su efectividad
  async getWorkflows(): Promise<any[]> {
    try {
      const response = await this.client.apiRequest({
        method: 'GET',
        path: '/automation/v3/workflows',
        qs: {
          limit: 100
        }
      });

      const data: { workflows: any[] } = await response.json(); // Ensure response is parsed as JSON

      return data.workflows || [];
    } catch (error) {
      console.error(`Error al obtener workflows: ${error}`);
      return [];
    }
  }

  // Análisis de efectividad de campañas
  async analyzeCampaignEffectiveness() {
    try {
      // Obtenemos todas las campañas
      const campaigns = await this.getCampaigns();
      
      // Análisis de cada campaña
      const campaignAnalysis = await Promise.all(campaigns.map(async (campaign) => {
        // Obtenemos contactos influenciados por esta campaña
        const contacts = await this.getContactsByCampaign(campaign.id);
        
        // Segmentamos por tipo
        const affiliates = contacts.filter((c: any) => 
          c.properties.relacion_con_vox === 'Afiliado'
        );
        
        const sympathizers = contacts.filter((c: any) => 
          c.properties.relacion_con_vox === 'Simpatizante'
        );
        
        // Análisis regional
        const regionDistribution = this.analyzeRegionDistribution(contacts);
        
        // Análisis de cuotas
        const quotaAnalysis = this.analyzeQuotas(affiliates);
        
        return {
          id: campaign.id,
          name: campaign.properties.hs_name,
          totalContacts: contacts.length,
          affiliatesCount: affiliates.length,
          sympathizersCount: sympathizers.length,
          conversionRate: contacts.length > 0 ? affiliates.length / contacts.length : 0,
          regionDistribution,
          quotaAnalysis,
          startDate: campaign.properties.hs_start_date,
          endDate: campaign.properties.hs_end_date,
          status: campaign.properties.hs_campaign_status
        };
      }));
      
      return campaignAnalysis;
    } catch (error) {
      console.error(`Error al analizar efectividad de campañas: ${error}`);
      return [];
    }
  }

  // Analizar distribución regional
  private analyzeRegionDistribution(contacts: any[]) {
    const regionCounts = contacts.reduce((acc: Record<string, number>, contact: any) => {
      const region = contact.properties.comunidad_autonoma || 'Desconocida';
      
      if (!acc[region]) {
        acc[region] = 0;
      }
      
      acc[region]++;
      return acc;
    }, {});
    
    // Convertir a array para ordenar
    return Object.keys(regionCounts).map(region => ({
      region,
      count: regionCounts[region],
      percentage: contacts.length > 0 ? (regionCounts[region] / contacts.length) * 100 : 0
    })).sort((a, b) => b.count - a.count);
  }

  // Analizar cuotas
  private analyzeQuotas(affiliates: any[]) {
    if (!affiliates || affiliates.length === 0) {
      return {
        averageQuota: 0,
        totalRevenue: 0,
        quotaDistribution: []
      };
    }
    
    // Calcular cuota promedio
    let totalQuota = 0;
    let validQuotaCount = 0;
    const quotaValues: Record<string, number> = {};
    
    affiliates.forEach((affiliate: any) => {
      const quota = parseFloat(affiliate.properties.apl_cuota_afiliado);
      if (!isNaN(quota)) {
        totalQuota += quota;
        validQuotaCount++;
        
        // Agrupar por valor de cuota
        const quotaKey = quota.toString();
        if (!quotaValues[quotaKey]) {
          quotaValues[quotaKey] = 0;
        }
        quotaValues[quotaKey]++;
      }
    });
    
    const averageQuota = validQuotaCount > 0 ? totalQuota / validQuotaCount : 0;
    
    // Convertir distribución de cuotas a array
    const quotaDistribution = Object.keys(quotaValues).map(quota => ({
      quota: parseFloat(quota),
      count: quotaValues[quota],
      percentage: (quotaValues[quota] / validQuotaCount) * 100
    })).sort((a, b) => a.quota - b.quota);
    
    return {
      averageQuota,
      totalRevenue: totalQuota,
      quotaDistribution
    };
  }

  async getCampaigns(): Promise<any[]> {
    try {
      const response = await this.client.apiRequest({
        method: 'GET',
        path: '/marketing/v3/campaigns',
        qs: {
          properties: ['hs_name', 'hs_campaign_status', 'hs_start_date', 'hs_end_date', 
                       'hs_audience', 'hs_goal', 'hs_budget_items_sum_amount']
        }
      });
      
      const data: { results: Workflow[] } = await response.json(); // Ensure response is parsed as JSON

      return data.results;
    } catch (error) {
      console.error('Error al obtener campañas:', error);
      return [];
    }
  }
}

export default HubSpotService; 