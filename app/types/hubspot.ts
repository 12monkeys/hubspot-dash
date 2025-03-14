export interface DashboardMetrics {
  totalAfiliados: number;
  totalSimpatizantes: number;
  tasaConversion: number;
  crecimientoMensual: number;
  totalDonaciones: number;
  donacionPromedio: number;
  campañasActivas: number;
  distribucionRegional: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
  metricasCuotas: {
    cuotaPromedio: number;
    totalIngresos: number;
    distribucionCuotas: Array<{
      cuota: number;
      count: number;
      percentage: number;
    }>;
  };
  contactosRecientes: Array<{
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    region: string;
    tipo: string;
    fechaCreacion: string;
  }>;
}

export interface Contact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    relacion_con_vox?: string;
    region?: string;
    createdate?: string;
    [key: string]: any;
  };
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  metrics?: {
    totalContacts: number;
    affiliatesCount: number;
    sympathizersCount: number;
    conversionRate: number;
  };
}
