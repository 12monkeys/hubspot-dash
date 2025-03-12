import { Client } from '@hubspot/api-client';
import { Filter, FilterGroup, PublicObjectSearchRequest, FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { Contact, Donation, Campaign, DashboardMetrics, EmailMetrics } from '../types/hubspot';

interface EmailStatisticsResponse {
  total: number;
  results: Array<{
    sent?: number;
    opened?: number;
    delivered?: number;
    bounced?: number;
    unsubscribed?: number;
    clicked?: number;
    dropped?: number;
    selected?: number;
    spamReports?: number;
    suppressed?: number;
    hardBounces?: number;
    softBounces?: number;
    pending?: number;
    contactsLost?: number;
    notSent?: number;
    deviceBreakdown?: {
      open_device_type: {
        computer: number;
        mobile: number;
        unknown: number;
      };
      click_device_type: {
        computer: number;
        mobile: number;
        unknown: number;
      };
    };
    timestamp?: string;
  }>;
}

class HubSpotService {
  private client: Client;
  private readonly PAGE_SIZE = 100;

  constructor(accessToken: string) {
    this.client = new Client({ accessToken });
  }

  private async getTotalRecords(objectType: string): Promise<number> {
    const countRequest: PublicObjectSearchRequest = {
      filterGroups: [{
        filters: [{
          propertyName: 'hs_object_id',
          operator: FilterOperatorEnum.HasProperty,
          value: ''
        }]
      }],
      limit: 1,
      after: '0',
      properties: ['hs_object_id']
    };

    try {
      const response = await this.client.crm.objects.searchApi.doSearch(objectType, countRequest);
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
        'createdate',
        'hs_email_last_email_name',
        'hs_email_last_open_date',
        'hs_email_last_click_date',
        'hs_email_bounce',
        'hs_email_optout',
        'hs_email_optout_timestamp',
        'hs_email_last_send_date',
        'hs_email_last_reply_date',
        'hs_social_last_engagement',
        'hs_analytics_source',
        'hs_analytics_source_data_1',
        'hs_analytics_source_data_2'
      ];

      const filterGroups: FilterGroup[] = [];
      if (tipo) {
        filterGroups.push({
          filters: [{
            propertyName: 'relacion_con_vox',
            operator: FilterOperatorEnum.Eq,
            value: tipo
          }]
        });
      }

      const totalContacts = await this.getTotalRecords('contacts');
      console.log(`Total de contactos encontrados: ${totalContacts}`);
      
      do {
        const searchRequest: PublicObjectSearchRequest = {
          properties,
          filterGroups,
          limit: this.PAGE_SIZE,
          after
        };

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
            cuota_afiliado: contact.properties.apl_cuota_afiliado ? Number(contact.properties.apl_cuota_afiliado) : 0,
            last_email_name: contact.properties.hs_email_last_email_name,
            last_open_date: contact.properties.hs_email_last_open_date,
            last_click_date: contact.properties.hs_email_last_click_date,
            email_bounce: contact.properties.hs_email_bounce === 'true',
            email_optout: contact.properties.hs_email_optout === 'true',
            email_optout_date: contact.properties.hs_email_optout_timestamp,
            last_send_date: contact.properties.hs_email_last_send_date,
            last_reply_date: contact.properties.hs_email_last_reply_date,
            last_social_engagement: contact.properties.hs_social_last_engagement,
            source: contact.properties.hs_analytics_source,
            source_data_1: contact.properties.hs_analytics_source_data_1,
            source_data_2: contact.properties.hs_analytics_source_data_2
          }
        })) as Contact[];

        allContacts = allContacts.concat(contacts);
        after = apiResponse.paging?.next?.after;

        console.log(`Procesados ${allContacts.length} de ${totalContacts} contactos...`);

      } while (after);

      console.log(`Búsqueda completada. Total de contactos procesados: ${allContacts.length}`);
      return allContacts;
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      return [];
    }
  }

  async getEmailMetrics(startDate: string, endDate: string): Promise<EmailMetrics> {
    try {
      const response = await this.client.apiRequest({
        method: 'GET',
        path: '/email/public/v1/campaigns/by-id/statistics',
        qs: {
          limit: 100,
          offset: 0
        }
      });

      const data = await response.json();

      if (!data || !Array.isArray(data.campaigns)) {
        console.error('No email metrics data received from HubSpot API');
        return {
          total: 0,
          results: []
        };
      }

      const metrics: EmailMetrics = {
        total: data.campaigns.length,
        results: data.campaigns.map((campaign: any) => ({
          aggregateStatistic: {
            counters: {
              sent: campaign.counters?.sent || 0,
              open: campaign.counters?.open || 0,
              delivered: campaign.counters?.delivered || 0,
              bounce: campaign.counters?.bounce || 0,
              unsubscribed: campaign.counters?.unsubscribed || 0,
              click: campaign.counters?.click || 0,
              dropped: campaign.counters?.dropped || 0,
              selected: campaign.counters?.selected || 0,
              spamreport: campaign.counters?.spamreport || 0,
              suppressed: campaign.counters?.suppressed || 0,
              hardbounced: campaign.counters?.hardbounced || 0,
              softbounced: campaign.counters?.softbounced || 0,
              pending: campaign.counters?.pending || 0,
              contactslost: campaign.counters?.contactslost || 0,
              notsent: campaign.counters?.notsent || 0
            },
            deviceBreakdown: campaign.deviceBreakdown || {
              open_device_type: {
                computer: 0,
                mobile: 0,
                unknown: 0
              },
              click_device_type: {
                computer: 0,
                mobile: 0,
                unknown: 0
              }
            },
            ratios: {
              clickratio: campaign.ratios?.clickratio || 0,
              clickthroughratio: campaign.ratios?.clickthroughratio || 0,
              deliveredratio: campaign.ratios?.deliveredratio || 0,
              openratio: campaign.ratios?.openratio || 0,
              unsubscribedratio: campaign.ratios?.unsubscribedratio || 0,
              spamreportratio: campaign.ratios?.spamreportratio || 0,
              bounceratio: campaign.ratios?.bounceratio || 0,
              hardbounceratio: campaign.ratios?.hardbounceratio || 0,
              softbounceratio: campaign.ratios?.softbounceratio || 0,
              contactslostratio: campaign.ratios?.contactslostratio || 0,
              pendingratio: campaign.ratios?.pendingratio || 0,
              notsentratio: campaign.ratios?.notsentratio || 0
            }
          },
          interval: {
            start: campaign.startDate || startDate,
            end: campaign.endDate || endDate
          }
        }))
      };

      return metrics;
    } catch (error) {
      console.error('Error getting email metrics:', error);
      return {
        total: 0,
        results: []
      };
    }
  }

  async getDonations(): Promise<Donation[]> {
    try {
      console.log('Iniciando búsqueda de donaciones...');
      let allDonations: Donation[] = [];
      let after: string | undefined;

      const totalDonations = await this.getTotalRecords('2-134403413');
      console.log(`Total de donaciones encontradas: ${totalDonations}`);

      do {
        const searchRequest = {
          properties: ['importe', 'createdate', 'hs_object_id'],
          limit: this.PAGE_SIZE,
          after
        };

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

      } while (after);

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
        path: '/marketing/v3/campaigns'
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
    const [contacts, donations, campaigns, emailMetrics] = await Promise.all([
      this.getContacts(),
      this.getDonations(),
      this.getCampaigns(),
      this.getEmailMetrics(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString()
      )
    ]);

    const afiliados = contacts.filter(c => c.properties.tipo_contacto === 'Afiliado');
    const simpatizantes = contacts.filter(c => c.properties.tipo_contacto === 'Simpatizante');

    const distribucionRegional = this.calcularDistribucionRegional(contacts);
    const fuentesAdquisicion = this.calcularFuentesAdquisicion(contacts);
    const tasaEngagement = this.calcularTasaEngagement(emailMetrics);

    return {
      totalAfiliados: afiliados.length,
      totalSimpatizantes: simpatizantes.length,
      totalDonaciones: donations.length,
      donacionesPromedio: donations.reduce((acc, d) => acc + d.properties.amount, 0) / donations.length || 0,
      crecimientoMensual: this.calcularCrecimientoMensual(contacts),
      distribucionRegional,
      campañasActivas: campaigns.filter(c => c.status === 'active').length,
      tasaConversion: (afiliados.length / (afiliados.length + simpatizantes.length)) * 100 || 0,
      tasaEngagement,
      emailMetrics,
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
      const source = contact.properties.source || 'Desconocido';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sources)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calcularTasaEngagement(metrics: EmailMetrics): number {
    if (!metrics.results.length) return 0;

    const lastMetrics = metrics.results[0].aggregateStatistic;
    const { sent, open, click } = lastMetrics.counters;

    if (!sent) return 0;

    // Engagement rate = (opens + clicks) / sent * 100
    return ((open + click) / sent) * 100;
  }
}

export default HubSpotService; 