import { Client } from '@hubspot/api-client';
import { Filter, FilterGroup, PublicObjectSearchRequest, FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/contacts';
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

class HubSpotService {
  private client: Client;
  private readonly PAGE_SIZE = 100;

  constructor(accessToken: string) {
    this.client = new Client({ accessToken });
  }

  private async getTotalRecords(objectType: string): Promise<number> {
    try {
      const searchRequest: PublicObjectSearchRequest = {
        filterGroups: [],
        limit: 1,
        properties: ['hs_object_id']
      };

      const response = await this.client.crm.objects.searchApi.doSearch(objectType, searchRequest);
      return response.total;
    } catch (error) {
      console.error(`Error getting total records for ${objectType}:`, error);
      return 0;
    }
  }

  async getContacts(tipo?: 'Afiliado' | 'Simpatizante'): Promise<Contact[]> {
    try {
      console.log(`Iniciando búsqueda de contactos${tipo ? ` tipo: ${tipo}` : ''}...`);
      let allContacts: Contact[] = [];
      let after: string | undefined;
      
      const properties = [
        'firstname', 
        'lastname', 
        'email', 
        'relacion_con_vox',
        'apl_cuota_afiliado',
        'provincia',
        'municipio',
        'pais',
        'createdate'
      ];

      const searchRequest: PublicObjectSearchRequest = {
        properties,
        filterGroups: tipo ? [{
          filters: [{
            propertyName: 'relacion_con_vox',
            operator: FilterOperatorEnum.Eq,
            value: tipo
          }]
        }] : [],
        limit: this.PAGE_SIZE
      };

      const totalContacts = await this.getTotalRecords('contacts');
      console.log(`Total de contactos encontrados: ${totalContacts}`);
      
      do {
        if (after) {
          searchRequest.after = after;
        }

        const apiResponse = await this.client.crm.contacts.searchApi.doSearch(searchRequest);
        
        const contacts = apiResponse.results.map(contact => ({
          id: contact.id,
          properties: {
            email: contact.properties.email || '',
            firstname: contact.properties.firstname,
            lastname: contact.properties.lastname,
            tipo_contacto: contact.properties.relacion_con_vox as 'Afiliado' | 'Simpatizante' | undefined,
            fecha_afiliacion: contact.properties.createdate,
            region: contact.properties.provincia,
            municipio: contact.properties.municipio,
            pais: contact.properties.pais,
            cuota_afiliado: contact.properties.apl_cuota_afiliado ? Number(contact.properties.apl_cuota_afiliado) : 0
          }
        })) as Contact[];

        allContacts = allContacts.concat(contacts);
        after = apiResponse.paging?.next?.after;

        console.log(`Procesados ${allContacts.length} de ${totalContacts} contactos...`);

      } while (after && allContacts.length < totalContacts);

      console.log(`Búsqueda completada. Total de contactos procesados: ${allContacts.length}`);
      return allContacts;
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      return [];
    }
  }

  async getEmailMetrics(startDate: string, endDate: string): Promise<any> {
    console.log('Email metrics functionality temporarily disabled');
    return {
      total: 0,
      results: []
    };
  }

  async getDonations(): Promise<Donation[]> {
    try {
      console.log('Iniciando búsqueda de donaciones...');
      let allDonations: Donation[] = [];
      let after: string | undefined;

      const searchRequest: SearchRequest = {
        properties: ['importe', 'createdate', 'hs_object_id'],
        limit: this.PAGE_SIZE
      };

      const totalDonations = await this.getTotalRecords('2-134403413');
      console.log(`Total de donaciones encontradas: ${totalDonations}`);

      do {
        if (after) {
          searchRequest.after = after;
        }

        try {
          const apiResponse = await this.client.crm.objects.searchApi.doSearch('2-134403413', searchRequest);
          
          const donations = apiResponse.results.map(donation => ({
            id: donation.id,
            properties: {
              amount: donation.properties.importe ? Number(donation.properties.importe) : 0,
              date: donation.properties.createdate,
              contact_id: donation.properties.hs_object_id
            }
          })) as Donation[];

          allDonations = allDonations.concat(donations);
          after = apiResponse.paging?.next?.after;

          console.log(`Procesadas ${allDonations.length} de ${totalDonations} donaciones...`);
        } catch (error: any) {
          if (error.code === 403) {
            console.error('Error de permisos al obtener donaciones. Se requieren los scopes: crm.objects.custom.read, crm.schemas.custom.read');
            return [];
          }
          throw error;
        }

      } while (after && allDonations.length < totalDonations);

      console.log(`Búsqueda completada. Total de donaciones procesadas: ${allDonations.length}`);
      return allDonations;
    } catch (error) {
      console.error('Error al obtener donaciones:', error);
      return [];
    }
  }

  async getCampaigns(): Promise<Campaign[]> {
    try {
      const response = await this.client.apiRequest({
        method: 'GET',
        path: '/marketing/v3/marketing-emails'
      });

      const data = await response.json();

      if (!data || !Array.isArray(data.results)) {
        console.error('No campaign data received from HubSpot API');
        return [];
      }

      return data.results.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status,
        stats: campaign.stats
      }));
    } catch (error) {
      console.error('Error al obtener campañas:', error);
      return [];
    }
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [contacts, donations] = await Promise.all([
      this.getContacts(),
      this.getDonations()
    ]);

    const afiliados = contacts.filter(c => c.properties.tipo_contacto === 'Afiliado');
    const simpatizantes = contacts.filter(c => c.properties.tipo_contacto === 'Simpatizante');

    const distribucionRegional = this.calcularDistribucionRegional(contacts);
    const fuentesAdquisicion = this.calcularFuentesAdquisicion(contacts);

    return {
      totalAfiliados: afiliados.length,
      totalSimpatizantes: simpatizantes.length,
      totalDonaciones: donations.length,
      donacionesPromedio: donations.reduce((acc, d) => acc + d.properties.amount, 0) / donations.length || 0,
      crecimientoMensual: this.calcularCrecimientoMensual(contacts),
      distribucionRegional,
      campañasActivas: 0,
      tasaConversion: (afiliados.length / (afiliados.length + simpatizantes.length)) * 100 || 0,
      fuentesAdquisicion
    };
  }

  private calcularDistribucionRegional(contacts: Contact[]): { region: string; count: number }[] {
    const distribucion = contacts.reduce((acc, contact) => {
      const region = contact.properties.region || 'No especificada';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribucion)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calcularCrecimientoMensual(contacts: Contact[]): number {
    const mesActual = new Date();
    const mesAnterior = new Date(mesActual.getFullYear(), mesActual.getMonth() - 1);
    
    const contactosMesActual = contacts.filter(c => {
      const fechaAfiliacion = c.properties.fecha_afiliacion 
        ? new Date(c.properties.fecha_afiliacion) 
        : null;
      return fechaAfiliacion && fechaAfiliacion >= mesAnterior;
    }).length;

    const contactosTotales = contacts.length;
    return contactosTotales ? (contactosMesActual / contactosTotales) * 100 : 0;
  }

  private calcularFuentesAdquisicion(contacts: Contact[]): Array<{ source: string; count: number }> {
    const sources = contacts.reduce((acc, contact) => {
      const source = 'Desconocido';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sources)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export default HubSpotService; 