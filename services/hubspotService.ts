import { Client } from '@hubspot/api-client';
import { Filter, FilterGroup, PublicObjectSearchRequest, FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { Contact, Donation, Campaign, DashboardMetrics } from '../types/hubspot';

class HubSpotService {
  private client: Client;

  constructor(accessToken: string) {
    this.client = new Client({ accessToken });
  }

  async getContacts(tipo?: 'Afiliado' | 'Simpatizante'): Promise<Contact[]> {
    try {
      const searchRequest: PublicObjectSearchRequest = {
        properties: ['firstname', 'lastname', 'email', 'tipo_contacto', 'fecha_afiliacion', 'region', 'ultima_donacion', 'total_donaciones'],
        limit: 100
      };

      if (tipo) {
        searchRequest.filterGroups = [{
          filters: [{
            propertyName: 'tipo_contacto',
            operator: FilterOperatorEnum.Eq,
            value: tipo
          }]
        }];
      }

      const apiResponse = await this.client.crm.contacts.searchApi.doSearch(searchRequest);
      return apiResponse.results.map(contact => ({
        id: contact.id,
        properties: {
          email: contact.properties.email || '',
          firstname: contact.properties.firstname,
          lastname: contact.properties.lastname,
          tipo_contacto: contact.properties.tipo_contacto as 'Afiliado' | 'Simpatizante' | undefined,
          fecha_afiliacion: contact.properties.fecha_afiliacion,
          region: contact.properties.region,
          ultima_donacion: contact.properties.ultima_donacion,
          total_donaciones: contact.properties.total_donaciones ? Number(contact.properties.total_donaciones) : undefined
        }
      })) as Contact[];
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      return [];
    }
  }

  async getDonations(startDate?: Date, endDate?: Date): Promise<Donation[]> {
    // Por ahora, simularemos que no hay donaciones hasta que configuremos el objeto personalizado
    console.log('Simulando datos de donaciones mientras se configura el objeto personalizado');
    return [];
    
    /* Código original comentado hasta que se configure el objeto personalizado
    const filters: Filter[] = [];
    if (startDate) {
      filters.push({
        propertyName: 'date',
        operator: FilterOperatorEnum.Gte,
        value: startDate.toISOString()
      });
    }
    if (endDate) {
      filters.push({
        propertyName: 'date',
        operator: FilterOperatorEnum.Lte,
        value: endDate.toISOString()
      });
    }

    const searchRequest: PublicObjectSearchRequest = {
      filterGroups: filters.length ? [{ filters }] : undefined,
      properties: ['amount', 'date', 'contact_id', 'campaign', 'payment_method'],
      limit: 100
    };

    const apiResponse = await this.client.crm.objects.searchApi.doSearch('donations', searchRequest);
    return apiResponse.results as unknown as Donation[];
    */
  }

  async getCampaigns(status?: 'active' | 'completed' | 'planned'): Promise<Campaign[]> {
    // Por ahora, simularemos que no hay campañas hasta que configuremos el objeto personalizado
    console.log('Simulando datos de campañas mientras se configura el objeto personalizado');
    return [];
    
    /* Código original comentado hasta que se configure el objeto personalizado
    const filter: Filter | undefined = status ? {
      propertyName: 'status',
      operator: FilterOperatorEnum.Eq,
      value: status
    } : undefined;

    const searchRequest: PublicObjectSearchRequest = {
      filterGroups: filter ? [{ filters: [filter] }] : undefined,
      properties: ['name', 'start_date', 'end_date', 'status', 'type', 'budget', 'results'],
      limit: 100
    };

    const apiResponse = await this.client.crm.objects.searchApi.doSearch('campaigns', searchRequest);
    return apiResponse.results as unknown as Campaign[];
    */
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const [afiliados, simpatizantes] = await Promise.all([
        this.getContacts('Afiliado'),
        this.getContacts('Simpatizante')
      ]);

      const distribucionRegional = this.calcularDistribucionRegional(afiliados.concat(simpatizantes));

      return {
        totalAfiliados: afiliados.length,
        totalSimpatizantes: simpatizantes.length,
        totalDonaciones: 0,
        donacionesPromedio: 0,
        crecimientoMensual: this.calcularCrecimientoMensual(afiliados.concat(simpatizantes)),
        distribucionRegional,
        campañasActivas: 0,
        tasaConversion: afiliados.length + simpatizantes.length > 0 
          ? (afiliados.length / (afiliados.length + simpatizantes.length)) * 100 
          : 0
      };
    } catch (error) {
      console.error('Error al obtener métricas del dashboard:', error);
      throw error;
    }
  }

  private calcularDistribucionRegional(contacts: Contact[]): { region: string; count: number }[] {
    const distribucion = contacts.reduce((acc, contact) => {
      const region = contact.properties.region || 'No especificada';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribucion).map(([region, count]) => ({ region, count }));
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
}

export default HubSpotService; 