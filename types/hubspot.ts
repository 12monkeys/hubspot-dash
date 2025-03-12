export interface Contact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email: string;
    tipo_contacto?: 'Afiliado' | 'Simpatizante';
    fecha_afiliacion?: string;
    region?: string;
    municipio?: string;
    pais?: string;
    cuota_afiliado?: number;
  };
}

export interface Donation {
  id: string;
  properties: {
    amount: number;
    date: string;
    contact_id: string;
  };
}

export interface Campaign {
  id: string;
  properties: {
    name: string;
    start_date: string;
    end_date?: string;
    status: 'active' | 'completed' | 'planned';
    type: string;
    budget?: number;
    results?: string;
  };
}

export interface DashboardMetrics {
  totalAfiliados: number;
  totalSimpatizantes: number;
  totalDonaciones: number;
  donacionesPromedio: number;
  crecimientoMensual: number;
  distribucionRegional: {
    region: string;
    count: number;
  }[];
  campañasActivas: number;
  tasaConversion: number;
} 