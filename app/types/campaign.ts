export type Campaign = {
  name: string;
  conversionRate: number;
  affiliatesCount: number;
  sympathizersCount: number;
  regionDistribution: { region: string; count: number; percentage: number; }[];
  status: string;
  startDate: string | null;
  endDate: string | null;
  totalContacts: number;
  quotaAnalysis?: {
    averageQuota: number;
    totalRevenue: number;
    quotaDistribution: { quota: number; count: number; percentage: number }[];
  } | null;
}

export interface HistoricalMetrics {
  timeSeriesData: Array<{
    date: string;
    value: number;
    afiliados: number;
    simpatizantes: number;
    tasaConversion: number;
    ingresos: number;
  }>;
  summary: {
    growth: number;
    conversionChange: number;
    totalRevenue: number;
  };
}

export interface AffiliateLifecycle {
  conversionTime: Array<{
    range: string;
    count: number;
  }>;
  conversionFlow: any; // Sankey diagram data
  averageConversionTime: number;
  retentionRate: number;
  lifetimeValue: number;
}

export interface RegionalMetrics {
  region: string;
  affiliates: number;
  sympathizers: number;
  conversionRate: number;
  growth: number;
  potential: number;
}

export interface KPIItem {
  title: string;
  value: number;
  change: number | null;
  icon: React.ReactNode;
} 