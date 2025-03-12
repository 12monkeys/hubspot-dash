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
        properties: [
          'firstname', 
          'lastname', 
          'email', 
          'relacion_con_vox',
          'apl_cuota_afiliado',
          'provincia',
          'municipio',
          'pais',
          'createdate'
        ],
        limit: 100
      };

      if (tipo) {
        searchRequest.filterGroups = [{
          filters: [{
            propertyName: 'relacion_con_vox',
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
          tipo_contacto: contact.properties.relacion_con_vox as 'Afiliado' | 'Simpatizante' | undefined,
          fecha_afiliacion: contact.properties.createdate,
          region: contact.properties.provincia,
          municipio: contact.properties.municipio,
          pais: contact.properties.pais,
          cuota_afiliado: contact.properties.apl_cuota_afiliado ? Number(contact.properties.apl_cuota_afiliado) : 0
        }
      })) as Contact[];
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      return [];
    }
  }

  async getDonations(): Promise<Donation[]> {
    try {
      const searchRequest = {
        properties: ['importe', 'createdate', 'hs_object_id'],
        limit: 100
      };

      const apiResponse = await this.client.crm.objects.searchApi.doSearch('2-134403413', searchRequest);
      return apiResponse.results.map(donation => ({
        id: donation.id,
        properties: {
          amount: donation.properties.importe ? Number(donation.properties.importe) : 0,
          date: donation.properties.createdate,
          contact_id: donation.properties.hs_object_id
        }
      })) as Donation[];
    } catch (error) {
      console.error('Error al obtener donaciones:', error);
      return [];
    }
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
      const [afiliados, simpatizantes, donaciones] = await Promise.all([
        this.getContacts('Afiliado'),
        this.getContacts('Simpatizante'),
        this.getDonations()
      ]);

      const distribucionRegional = this.calcularDistribucionRegional(afiliados.concat(simpatizantes));
      const totalDonaciones = donaciones.reduce((sum, d) => sum + d.properties.amount, 0);

      return {
        totalAfiliados: afiliados.length,
        totalSimpatizantes: simpatizantes.length,
        totalDonaciones: totalDonaciones,
        donacionesPromedio: donaciones.length > 0 ? totalDonaciones / donaciones.length : 0,
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

    return Object.entries(distribucion)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count); // Ordenar por cantidad descendente
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