import { Client } from '@hubspot/api-client';

class HubSpotService {
  private client: Client;

  constructor() {
    const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('HubSpot access token not configured');
    }
    this.client = new Client({ accessToken });
  }

  async getContactsSummary() {
    try {
      const response = await this.client.crm.contacts.basicApi.getPage(
        undefined, // after
        undefined, // before
        undefined, // limit
        undefined, // properties
        undefined, // propertiesWithHistory
        undefined  // associations
      );
      
      return {
        total: response.results.length,
        results: response.results
      };
    } catch (error) {
      console.error('Error getting contacts summary:', error);
      throw error;
    }
  }

  async getDashboardMetrics() {
    try {
      // Obtener resumen de contactos
      const contactsResponse = await this.client.crm.contacts.basicApi.getPage(
        undefined,
        undefined,
        100,
        ['firstname', 'lastname', 'email', 'phone', 'createdate']
      );

      // Obtener resumen de deals (oportunidades)
      const dealsResponse = await this.client.crm.deals.basicApi.getPage(
        undefined,
        undefined,
        100,
        ['amount', 'dealstage', 'closedate', 'pipeline']
      );

      // Obtener resumen de companies (empresas)
      const companiesResponse = await this.client.crm.companies.basicApi.getPage(
        undefined,
        undefined,
        100,
        ['name', 'industry', 'website']
      );

      // Calcular métricas
      const metrics = {
        totalContacts: contactsResponse.total,
        recentContacts: contactsResponse.results.slice(0, 5),
        totalDeals: dealsResponse.total,
        recentDeals: dealsResponse.results.slice(0, 5),
        totalCompanies: companiesResponse.total,
        recentCompanies: companiesResponse.results.slice(0, 5),
      };

      return metrics;
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  async getContactDetails(contactId: string) {
    try {
      const contact = await this.client.crm.contacts.basicApi.getById(
        contactId,
        ['firstname', 'lastname', 'email', 'phone', 'createdate']
      );
      return contact;
    } catch (error) {
      console.error(`Error getting contact details for ID ${contactId}:`, error);
      throw error;
    }
  }

  async getDealDetails(dealId: string) {
    try {
      const deal = await this.client.crm.deals.basicApi.getById(
        dealId,
        ['amount', 'dealstage', 'closedate', 'pipeline']
      );
      return deal;
    } catch (error) {
      console.error(`Error getting deal details for ID ${dealId}:`, error);
      throw error;
    }
  }

  async getCompanyDetails(companyId: string) {
    try {
      const company = await this.client.crm.companies.basicApi.getById(
        companyId,
        ['name', 'industry', 'website']
      );
      return company;
    } catch (error) {
      console.error(`Error getting company details for ID ${companyId}:`, error);
      throw error;
    }
  }

  // Método para obtener las propiedades personalizadas de los contactos
  async getContactProperties() {
    try {
      const properties = await this.client.crm.properties.coreApi.getAll('contacts');
      return properties.results;
    } catch (error) {
      console.error('Error getting contact properties:', error);
      throw error;
    }
  }
}

export default HubSpotService; 