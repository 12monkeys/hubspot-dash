import { Client } from '@hubspot/api-client';
import { Filter, FilterGroup, PublicObjectSearchRequest, FilterOperatorEnum, SimplePublicObjectWithAssociations } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { Contact, Donation, Campaign } from '../types/hubspot';

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
        fuentesAdquisicion: []
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
      let properties;
      if (Array.isArray(data)) {
        // Para contacts y deals
        properties = data.map((prop: any) => ({
          name: prop.name,
          label: prop.label,
          type: prop.type,
          fieldType: prop.fieldType,
          description: prop.description,
          options: prop.options
        }));
      } else if (data.properties) {
        // Para objetos personalizados
        properties = data.properties.map((prop: any) => ({
          name: prop.name,
          label: prop.label,
          type: prop.type,
          fieldType: prop.fieldType,
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
}

export default HubSpotService; 