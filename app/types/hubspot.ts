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
  cuotaPromedio: number;
  distribucionCuotas: Array<{
    rango: string;
    count: number;
  }>;
  ingresoCuotasMensual: number;
  fuentesAdquisicion: Array<{
    source: string;
    count: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    affiliates: number;
    sympathizers: number;
    conversionRate: number;
    averageQuota: number;
  }>;
  comunidadesDistribution: Array<{
    name: string;
    value: number;
    growth: number;
  }>;
  tipoAfiliadoDistribution: Array<{
    name: string;
    value: number;
  }>;
  donationMetrics: {
    monthlyDonations: Array<{
      month: string;
      amount: number;
    }>;
    donationDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    totalDonors: number;
  };
  campaignMetrics: {
    activeCampaignsCount: number;
    completedCampaignsCount: number;
    campaignEffectiveness: Array<{
      name: string;
      goal: number;
      current: number;
      conversionRate: number;
    }>;
  };
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
