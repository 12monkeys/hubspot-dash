"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis
} from "recharts";

type CampaignData = {
  name: string;
  id: string;
  status: string;
  completionPercentage: number;
  conversionRate: number;
  engagementScore: number;
  participantCount: number;
  startDate: string;
  endDate: string;
  budget: number;
  spend: number;
  revenue: number;
  influencedRevenue: number;
  roi: number;
  goal: string;
  type: string;
  metrics: {
    emailCount: number;
    formCount: number;
    landingPageCount: number;
    socialPostCount: number;
    adCampaignCount: number;
    workflowCount: number;
  };
};

type CampaignMetrics = {
  activeCampaigns: number;
  completedCampaigns: number;
  averageConversionRate: number;
  averageEngagement: number;
  totalParticipants: number;
  totalBudget: number;
  totalSpend: number;
  totalRevenue: number;
  totalInfluencedRevenue: number;
  averageROI: number;
  campaigns: CampaignData[];
  campaignsByStatus: {
    status: string;
    count: number;
  }[];
  campaignsByType: {
    type: string;
    count: number;
  }[];
};

// Props para el componente
interface CampaignEffectivenessProps {
  showOnlySummary?: boolean;
  showOnlyCharts?: boolean;
}

// Colores para los gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#ffc658', '#d0ed57'];
const STATUS_COLORS = {
  'active': '#00C49F',
  'completed': '#0088FE',
  'planned': '#FFBB28',
  'paused': '#FF8042',
  'cancelled': '#8884D8'
};

// Datos simulados para desarrollo - Ahora con más propiedades de HubSpot
const mockCampaignMetrics: CampaignMetrics = {
  activeCampaigns: 3,
  completedCampaigns: 2,
  averageConversionRate: 42.5,
  averageEngagement: 68.3,
  totalParticipants: 12450,
  totalBudget: 85000,
  totalSpend: 62500,
  totalRevenue: 125000,
  totalInfluencedRevenue: 245000,
  averageROI: 2.1,
  campaignsByStatus: [
    { status: "active", count: 3 },
    { status: "completed", count: 2 },
    { status: "planned", count: 1 },
    { status: "paused", count: 1 }
  ],
  campaignsByType: [
    { type: "Email", count: 2 },
    { type: "Social", count: 1 },
    { type: "Event", count: 1 },
    { type: "Advertising", count: 2 }
  ],
  campaigns: [
    {
      name: "Campaña Primavera",
      id: "12345",
      status: "completed",
      completionPercentage: 100,
      conversionRate: 45.2,
      engagementScore: 72.5,
      participantCount: 3250,
      startDate: "2023-03-01",
      endDate: "2023-04-15",
      budget: 20000,
      spend: 18500,
      revenue: 35000,
      influencedRevenue: 65000,
      roi: 1.89,
      goal: "Awareness",
      type: "Email",
      metrics: {
        emailCount: 5,
        formCount: 2,
        landingPageCount: 1,
        socialPostCount: 0,
        adCampaignCount: 0,
        workflowCount: 2
      }
    },
    {
      name: "Campaña Verano",
      id: "12346",
      status: "completed",
      completionPercentage: 100,
      conversionRate: 38.7,
      engagementScore: 65.8,
      participantCount: 2850,
      startDate: "2023-06-01",
      endDate: "2023-07-15",
      budget: 15000,
      spend: 14000,
      revenue: 28000,
      influencedRevenue: 52000,
      roi: 2.0,
      goal: "Conversion",
      type: "Social",
      metrics: {
        emailCount: 3,
        formCount: 1,
        landingPageCount: 1,
        socialPostCount: 12,
        adCampaignCount: 0,
        workflowCount: 1
      }
    },
    {
      name: "Campaña Otoño",
      id: "12347",
      status: "active",
      completionPercentage: 68,
      conversionRate: 41.2,
      engagementScore: 70.1,
      participantCount: 2750,
      startDate: "2023-09-01",
      endDate: "2023-10-15",
      budget: 18000,
      spend: 12000,
      revenue: 22000,
      influencedRevenue: 48000,
      roi: 1.83,
      goal: "Engagement",
      type: "Event",
      metrics: {
        emailCount: 4,
        formCount: 2,
        landingPageCount: 1,
        socialPostCount: 8,
        adCampaignCount: 0,
        workflowCount: 2
      }
    },
    {
      name: "Campaña Navidad",
      id: "12348",
      status: "active",
      completionPercentage: 35,
      conversionRate: 44.8,
      engagementScore: 64.7,
      participantCount: 3600,
      startDate: "2023-11-15",
      endDate: "2023-12-31",
      budget: 25000,
      spend: 12000,
      revenue: 30000,
      influencedRevenue: 60000,
      roi: 2.5,
      goal: "Revenue",
      type: "Advertising",
      metrics: {
        emailCount: 6,
        formCount: 3,
        landingPageCount: 2,
        socialPostCount: 10,
        adCampaignCount: 4,
        workflowCount: 3
      }
    },
    {
      name: "Campaña Año Nuevo",
      id: "12349",
      status: "planned",
      completionPercentage: 0,
      conversionRate: 0,
      engagementScore: 0,
      participantCount: 0,
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      budget: 15000,
      spend: 0,
      revenue: 0,
      influencedRevenue: 0,
      roi: 0,
      goal: "Awareness",
      type: "Advertising",
      metrics: {
        emailCount: 4,
        formCount: 2,
        landingPageCount: 1,
        socialPostCount: 6,
        adCampaignCount: 2,
        workflowCount: 2
      }
    },
    {
      name: "Campaña Especial",
      id: "12350",
      status: "paused",
      completionPercentage: 45,
      conversionRate: 32.5,
      engagementScore: 58.2,
      participantCount: 1850,
      startDate: "2023-08-01",
      endDate: "2023-08-31",
      budget: 12000,
      spend: 6000,
      revenue: 10000,
      influencedRevenue: 20000,
      roi: 1.67,
      goal: "Engagement",
      type: "Email",
      metrics: {
        emailCount: 3,
        formCount: 1,
        landingPageCount: 1,
        socialPostCount: 0,
        adCampaignCount: 0,
        workflowCount: 1
      }
    }
  ]
};

export default function CampaignEffectiveness({ showOnlySummary = false, showOnlyCharts = false }: CampaignEffectivenessProps) {
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("12m");
  const [selectedMetric, setSelectedMetric] = useState<string>("conversionRate");

  useEffect(() => {
    // En desarrollo, usamos datos simulados
    const timer = setTimeout(() => {
      setMetrics(mockCampaignMetrics);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);

    // En producción, descomentar esto:
    /*
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/analytics/campaigns?timeframe=${timeframe}`);
        if (!response.ok) {
          throw new Error('Error al cargar los datos de campañas');
        }
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error fetching campaign data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    */
  }, [timeframe]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 flex items-center justify-center">
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-yellow-700">{error || 'No se pudieron cargar los datos de campañas'}</p>
      </div>
    );
  }

  // Formateador para porcentajes
  const formatPercentage = (value: number | string) => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)}%`;
    }
    return `${value}%`;
  };

  // Formateador para números
  const formatNumber = (value: number | string) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  // Formateador para moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Renderizar solo las tarjetas KPI
  const renderKPICards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Campañas Activas</p>
            <p className="mt-1 text-2xl font-bold">{metrics.activeCampaigns}</p>
          </div>
          <div className="kpi-icon bg-blue-50">📊</div>
        </div>
      </div>
      
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Presupuesto Total</p>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(metrics.totalBudget)}</p>
          </div>
          <div className="kpi-icon bg-green-50">💰</div>
        </div>
      </div>
      
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Ingresos Generados</p>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
          </div>
          <div className="kpi-icon bg-purple-50">💸</div>
        </div>
      </div>
      
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">ROI Promedio</p>
            <p className="mt-1 text-2xl font-bold">{metrics.averageROI.toFixed(1)}x</p>
          </div>
          <div className="kpi-icon bg-yellow-50">📈</div>
        </div>
      </div>
    </div>
  );

  // Renderizar solo los gráficos
  const renderCharts = () => {
    // Preparar datos para el gráfico de estado de campañas
    const statusData = metrics.campaignsByStatus.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
      color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || '#8884d8'
    }));

    // Preparar datos para el gráfico de ROI vs Presupuesto
    const roiVsBudgetData = metrics.campaigns.map(campaign => ({
      name: campaign.name,
      budget: campaign.budget,
      roi: campaign.roi,
      revenue: campaign.revenue,
      status: campaign.status
    }));

    // Preparar datos para el gráfico de métricas de campaña
    const campaignMetricsData = metrics.campaigns
      .filter(campaign => campaign.status !== 'planned')
      .map(campaign => ({
        name: campaign.name,
        conversionRate: campaign.conversionRate,
        engagementScore: campaign.engagementScore,
        completionPercentage: campaign.completionPercentage,
        roi: campaign.roi * 20, // Escalado para visualización
        status: campaign.status
      }));

    // Preparar datos para el gráfico de línea temporal
    const timelineData = metrics.campaigns
      .filter(campaign => campaign.status !== 'planned')
      .map(campaign => ({
        name: campaign.name,
        startDate: new Date(campaign.startDate).getTime(),
        endDate: new Date(campaign.endDate).getTime(),
        budget: campaign.budget,
        spend: campaign.spend,
        revenue: campaign.revenue,
        status: campaign.status
      }))
      .sort((a, b) => a.startDate - b.startDate);

    // Preparar datos para el gráfico de composición de campañas
    const campaignCompositionData = [];
    for (const campaign of metrics.campaigns) {
      if (campaign.status === 'planned') continue;
      
      campaignCompositionData.push(
        { name: campaign.name, type: 'Emails', value: campaign.metrics.emailCount },
        { name: campaign.name, type: 'Forms', value: campaign.metrics.formCount },
        { name: campaign.name, type: 'Landing Pages', value: campaign.metrics.landingPageCount },
        { name: campaign.name, type: 'Social Posts', value: campaign.metrics.socialPostCount },
        { name: campaign.name, type: 'Ad Campaigns', value: campaign.metrics.adCampaignCount },
        { name: campaign.name, type: 'Workflows', value: campaign.metrics.workflowCount }
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Estado de Campañas</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({name, percent}) => {
                      if (typeof percent === 'number') {
                        return `${name}: ${(percent * 100).toFixed(0)}%`;
                      }
                      return `${name}`;
                    }}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => {
                      if (typeof value === 'number') {
                        return [formatNumber(value), "Campañas"];
                      }
                      return [value, "Campañas"];
                    }}
                  />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">ROI vs Presupuesto</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="budget" 
                    name="Presupuesto" 
                    unit="€"
                    domain={['dataMin - 5000', 'dataMax + 5000']}
                    label={{ value: 'Presupuesto (€)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="roi" 
                    name="ROI" 
                    unit="x"
                    domain={[0, 'dataMax + 0.5']}
                    label={{ value: 'ROI', angle: -90, position: 'insideLeft' }}
                  />
                  <ZAxis 
                    type="number" 
                    dataKey="revenue" 
                    range={[50, 400]} 
                    name="Ingresos" 
                    unit="€"
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => {
                      if (name === 'Presupuesto') {
                        return [formatCurrency(value as number), name];
                      } else if (name === 'ROI') {
                        return [`${value}x`, name];
                      } else if (name === 'Ingresos') {
                        return [formatCurrency(value as number), name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Scatter 
                    name="Campañas" 
                    data={roiVsBudgetData} 
                    fill="#8884d8"
                    shape={(props) => {
                      const { cx, cy, payload } = props;
                      const status = payload.status;
                      const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#8884d8';
                      
                      return (
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={8} 
                          fill={color} 
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      );
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Métricas por Campaña</h3>
          <div className="chart-container">
            <div className="flex justify-end mb-2">
              <select 
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <option value="conversionRate">Tasa de Conversión</option>
                <option value="engagementScore">Engagement</option>
                <option value="completionPercentage">Porcentaje Completado</option>
                <option value="roi">ROI</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={campaignMetricsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  domain={selectedMetric === 'roi' ? [0, 'dataMax + 10'] : [0, 100]} 
                />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Tasa de Conversión' || name === 'Engagement' || name === 'Porcentaje Completado') {
                      return [`${(value as number).toFixed(1)}%`, name];
                    } else if (name === 'ROI') {
                      return [`${((value as number) / 20).toFixed(1)}x`, name];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Campaña: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey={selectedMetric} 
                  name={
                    selectedMetric === 'conversionRate' ? 'Tasa de Conversión' :
                    selectedMetric === 'engagementScore' ? 'Engagement' :
                    selectedMetric === 'completionPercentage' ? 'Porcentaje Completado' : 'ROI'
                  }
                  fill="#8884d8" 
                  radius={[0, 4, 4, 0]}
                  barSize={30}
                >
                  {campaignMetricsData.map((entry, index) => {
                    const status = entry.status;
                    return <Cell key={`cell-${index}`} fill={STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#8884d8'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Composición de Campañas</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={campaignCompositionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => [value, "Cantidad"]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return `${label} - ${payload[0].payload.type}`;
                    }
                    return label;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="value" 
                  fill="#8884d8" 
                  name="Cantidad"
                  barSize={20}
                >
                  {campaignCompositionData.map((entry, index) => {
                    const typeIndex = ['Emails', 'Forms', 'Landing Pages', 'Social Posts', 'Ad Campaigns', 'Workflows'].indexOf(entry.type);
                    return <Cell key={`cell-${index}`} fill={COLORS[typeIndex % COLORS.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar el componente según las props
  if (showOnlySummary) {
    return renderKPICards();
  }

  if (showOnlyCharts) {
    return renderCharts();
  }

  // Renderizar todo el contenido si no se especifica ninguna prop
  return (
    <div className="space-y-6">
      {renderKPICards()}
      {renderCharts()}
    </div>
  );
} 