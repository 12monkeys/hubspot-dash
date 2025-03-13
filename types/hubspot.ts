export interface Contact {
  id: string;
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    tipo_contacto?: 'Afiliado' | 'Simpatizante';
    fecha_afiliacion?: string;
    region?: string;
    municipio?: string;
    pais?: string;
    cuota_afiliado?: number;
    last_email_name?: string;
    last_open_date?: string;
    last_click_date?: string;
    email_bounce?: boolean;
    email_optout?: boolean;
    email_optout_date?: string;
    last_send_date?: string;
    last_reply_date?: string;
    last_social_engagement?: string;
    source?: string;
    source_data_1?: string;
    source_data_2?: string;
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
  name: string;
  type: string;
  startDate?: string;
  endDate?: string;
  status: string;
  stats?: {
    counters?: Record<string, number>;
    ratios?: Record<string, number>;
  };
}

export interface EmailMetrics {
  total: number;
  results: Array<{
    aggregateStatistic: {
      counters: {
        sent: number;
        open: number;
        delivered: number;
        bounce: number;
        unsubscribed: number;
        click: number;
        dropped: number;
        selected: number;
        spamreport: number;
        suppressed: number;
        hardbounced: number;
        softbounced: number;
        pending: number;
        contactslost: number;
        notsent: number;
      };
      deviceBreakdown: {
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
      ratios: {
        clickratio: number;
        clickthroughratio: number;
        deliveredratio: number;
        openratio: number;
        unsubscribedratio: number;
        spamreportratio: number;
        bounceratio: number;
        hardbounceratio: number;
        softbounceratio: number;
        contactslostratio: number;
        pendingratio: number;
        notsentratio: number;
      };
    };
    interval: {
      start: string;
      end: string;
    };
  }>;
}

export interface DashboardMetrics {
  totalAfiliados: number;
  totalSimpatizantes: number;
  totalDonaciones: number;
  donacionesPromedio: number;
  crecimientoMensual: number;
  distribucionRegional: Array<{
    region: string;
    count: number;
  }>;
  campañasActivas: number;
  tasaConversion: number;
  tasaEngagement: number;
  emailMetrics: EmailMetrics;
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
}

export interface Workflow {
  id: string;
  properties: {
    hs_name: string;
    hs_campaign_status: string;
    hs_start_date: string | null;
    hs_end_date: string | null;
    hs_audience: number;
    hs_goal: number;
    hs_budget_items_sum_amount: number;
  }
} 