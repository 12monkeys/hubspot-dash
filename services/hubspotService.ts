import { Client } from '@hubspot/api-client';
import { Filter, FilterGroup, PublicObjectSearchRequest, FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { Contact, Donation, Campaign, DashboardMetrics } from '../types/hubspot';

class HubSpotService {
  private client: Client;

  constructor(accessToken: string) {
    this.client = new Client({ accessToken });
  }

  async getContacts(tipo?: 'Afiliado' | 'Simpatizante'): Promise<Contact[]> {
    const filter: Filter | undefined = tipo ? {
      propertyName: 'tipo_contacto',
      operator: FilterOperatorEnum.Eq,
      value: tipo
    } : undefined;

    const searchRequest: PublicObjectSearchRequest = {
      filterGroups: filter ? [{ filters: [filter] }] : undefined,
      properties: ['firstname', 'lastname', 'email', 'tipo_contacto', 'fecha_afiliacion', 'region', 'ultima_donacion', 'total_donaciones'],
      limit: 100
    };

    const apiResponse = await this.client.crm.contacts.searchApi.doSearch(searchRequest);
    return apiResponse.results as unknown as Contact[];
  }

  async getDonations(startDate?: Date, endDate?: Date): Promise<Donation[]> {
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
  }

  async getCampaigns(status?: 'active' | 'completed' | 'planned'): Promise<Campaign[]> {
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
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [afiliados, simpatizantes, donaciones, campañasActivas] = await Promise.all([
      this.getContacts('Afiliado'),
      this.getContacts('Simpatizante'),
      this.getDonations(),
      this.getCampaigns('active')
    ]);

    const distribucionRegional = this.calcularDistribucionRegional(afiliados.concat(simpatizantes));
    const donacionesTotal = donaciones.reduce((sum, d) => sum + d.properties.amount, 0);

    return {
      totalAfiliados: afiliados.length,
      totalSimpatizantes: simpatizantes.length,
      totalDonaciones: donacionesTotal,
      donacionesPromedio: donacionesTotal / donaciones.length || 0,
      crecimientoMensual: this.calcularCrecimientoMensual(afiliados.concat(simpatizantes)),
      distribucionRegional,
      campañasActivas: campañasActivas.length,
      tasaConversion: (afiliados.length / (afiliados.length + simpatizantes.length)) * 100
    };
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
    
    const contactosMesActual = contacts.filter(c => 
      new Date(c.properties.fecha_afiliacion || '') >= mesAnterior
    ).length;

    const contactosTotales = contacts.length;
    return contactosTotales ? (contactosMesActual / contactosTotales) * 100 : 0;
  }
}

export default HubSpotService; 