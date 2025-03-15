/**
 * Configuración para la integración con HubSpot
 */

// Propiedades de contactos que se utilizarán para el dashboard
export const CONTACT_PROPERTIES = [
  'firstname',
  'lastname',
  'email',
  'phone',
  'region',
  'city',
  'contact_type', // Tipo de contacto (afiliado, simpatizante, etc.)
  'membership_status', // Estado de afiliación
  'membership_date', // Fecha de afiliación
  'last_donation_date', // Fecha de última donación
  'total_donations', // Total de donaciones
  'donation_frequency', // Frecuencia de donación
  'campaign_participation', // Campañas en las que ha participado
  'volunteer_status', // Estado como voluntario
  'lead_source', // Fuente del lead
  'created_date', // Fecha de creación del contacto
  'last_modified_date', // Fecha de última modificación
];

// Propiedades de campañas que se utilizarán para el dashboard
export const CAMPAIGN_PROPERTIES = [
  'campaign_name',
  'campaign_id',
  'campaign_type',
  'campaign_status',
  'campaign_start_date',
  'campaign_end_date',
  'campaign_budget',
  'campaign_goal',
  'campaign_region',
  'campaign_city',
  'campaign_results',
  'campaign_roi',
  'campaign_conversion_rate',
  'campaign_participants',
  'campaign_donations',
];

// Propiedades de donaciones que se utilizarán para el dashboard
export const DONATION_PROPERTIES = [
  'donation_id',
  'donation_amount',
  'donation_date',
  'donation_type',
  'donation_campaign',
  'donation_region',
  'donation_recurring',
  'donation_frequency',
  'donation_status',
];

// Regiones disponibles
export const REGIONS = [
  'Norte',
  'Sur',
  'Este',
  'Oeste',
  'Centro',
  'Noreste',
  'Noroeste',
  'Sureste',
  'Suroeste',
  'Central',
];

// Tipos de contactos
export const CONTACT_TYPES = [
  'Afiliado',
  'Simpatizante',
  'Voluntario',
  'Donante',
  'Líder',
  'Coordinador',
];

// Tipos de campañas
export const CAMPAIGN_TYPES = [
  'Afiliación',
  'Recaudación',
  'Concientización',
  'Evento',
  'Digital',
  'Territorial',
];

// Configuración de la API de HubSpot
export const HUBSPOT_API_CONFIG = {
  baseUrl: 'https://api.hubapi.com',
  version: 'v3',
  endpoints: {
    contacts: '/crm/v3/objects/contacts',
    campaigns: '/crm/v3/objects/campaigns',
    deals: '/crm/v3/objects/deals',
  },
  batchSize: 100, // Tamaño máximo de lotes para peticiones batch
  rateLimit: 10, // Límite de peticiones por segundo
};

// Función para formatear fechas para HubSpot
export const formatDateForHubSpot = (date: Date): string => {
  return date.toISOString();
};

// Función para formatear fechas desde HubSpot
export const formatDateFromHubSpot = (dateString: string): Date => {
  return new Date(dateString);
};

// Función para formatear números para mostrar en el dashboard
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-ES').format(num);
};

// Función para formatear moneda para mostrar en el dashboard
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

// Función para formatear porcentajes para mostrar en el dashboard
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}; 