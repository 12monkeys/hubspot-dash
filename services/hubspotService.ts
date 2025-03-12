import { Client } from '@hubspot/api-client';
import { Filter, FilterGroup, PublicObjectSearchRequest, FilterOperatorEnum, SimplePublicObjectWithAssociations } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { Contact, Donation, Campaign } from '../types/hubspot';

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
      const searchRequest: PublicObjectSearchRequest = {
        properties: ['relacion_con_vox', 'provincia', 'createdate'],
        limit: 100,
        filterGroups: [],
        sorts: ['createdate']
      };

      const response = await this.client.crm.contacts.searchApi.doSearch(searchRequest);
      
      const summary: ContactSummary = {
        total: response.total,
        afiliados: 0,
        simpatizantes: 0,
        regiones: {},
        recientes: 0
      };

      const unMesAtras = new Date();
      unMesAtras.setMonth(unMesAtras.getMonth() - 1);

      response.results.forEach(contact => {
        const tipoContacto = contact.properties.relacion_con_vox || '';
        const region = contact.properties.provincia || 'No especificada';
        const createdate = contact.properties.createdate || '';

        if (tipoContacto === 'Afiliado') {
          summary.afiliados++;
        } else if (tipoContacto === 'Simpatizante') {
          summary.simpatizantes++;
        }

        summary.regiones[region] = (summary.regiones[region] || 0) + 1;

        if (createdate && new Date(createdate) >= unMesAtras) {
          summary.recientes++;
        }
      });

      this.contactSummaryCache = summary;
      this.contactSummaryCacheTime = Date.now();

      console.log('Resumen de contactos actualizado');
      return summary;
    } catch (error) {
      console.error('Error al obtener resumen de contactos:', error);
      throw error;
    }
  }

  async getDonations(): Promise<Donation[]> {
    try {
      console.log('Obteniendo resumen de donaciones...');
      
      const searchRequest: PublicObjectSearchRequest = {
        properties: ['importe', 'createdate'],
        limit: 100,
        filterGroups: [],
        sorts: ['createdate']
      };

      const response = await this.client.crm.objects.searchApi.doSearch('2-134403413', searchRequest);
      
      if (!response.results) {
        console.log('No se encontraron donaciones');
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
      if (error.code === 403) {
        console.error('Error de permisos al obtener donaciones');
        return [];
      }
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
}

export default HubSpotService; 