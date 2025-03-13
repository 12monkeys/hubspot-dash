import HubSpotService from '@/services/hubspotService';
import { Workflow, Contact } from '@/types/hubspot';

interface TimeSeriesData {
  date: string;
  value: number;
}

interface TimeSeriesAnalysis {
  seasonality: number;
  anomalies: TimeSeriesData[];
  trend: 'up' | 'down' | 'stable';
  prediction: number;
}

interface CampaignInsight {
  campaignId: string;
  campaignName: string;
  contactsInfluenced: number;
  affiliatesGenerated: number;
  sympathizersGenerated: number;
  conversionRate: number;
  quotaAnalysis: {
    totalRevenue: number;
    averageQuota: number;
  };
  roi: number;
  geoDistribution: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
  bestPerformingRegions: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
}

interface WorkflowInsight {
  workflowId: string;
  workflowName: string;
  executions: number;
  conversions: number;
  successRate: number;
  bottlenecks: string[];
  recommendations: string[];
}

export async function getTimeSeriesAnalysis(
  hubspotService: HubSpotService,
  objectType: string,
  metric: string,
  timeframe: string
): Promise<TimeSeriesAnalysis> {
  const data = await hubspotService.getTimeSeriesData(objectType, metric, timeframe);
  
  // Calculate seasonality
  const seasonality = calculateSeasonality(data);
  
  // Detect anomalies
  const anomalies = detectAnomalies(data);
  
  // Predict trend
  const { trend, prediction } = predictTrend(data);
  
  return {
    seasonality,
    anomalies,
    trend,
    prediction
  };
}

export async function analyzeCampaignEffectiveness(
  hubspotService: HubSpotService
): Promise<CampaignInsight[]> {
  // Obtener campañas y contactos asociados
  const campaigns = await hubspotService.getCampaigns();
  
  const campaignInsights = await Promise.all(campaigns.map(async (campaign: Workflow) => {
    // Analizar contactos influenciados por cada campaña
    const contacts = await hubspotService.getContactsByCampaign(campaign.id);
    
    // Segmentar por tipo (afiliado vs simpatizante)
    const affiliates = contacts.filter((c: Contact) => c.properties.tipo_contacto === 'Afiliado');
    const sympathizers = contacts.filter((c: Contact) => c.properties.tipo_contacto === 'Simpatizante');
    
    // Calcular tasa de conversión para esta campaña
    const conversionRate = contacts.length > 0 ? affiliates.length / contacts.length : 0;
    
    // Analizar cuotas generadas por la campaña
    const quotaAnalysis = analyzeQuotas(affiliates);
    
    // Calcular ROI
    const roi = calculateROI(campaign, quotaAnalysis.totalRevenue);
    
    // Análisis geográfico
    const geoDistribution = analyzeGeographicDistribution(contacts);
    
    return {
      campaignId: campaign.id,
      campaignName: campaign.properties.hs_name,
      contactsInfluenced: contacts.length,
      affiliatesGenerated: affiliates.length,
      sympathizersGenerated: sympathizers.length,
      conversionRate,
      quotaAnalysis,
      roi,
      geoDistribution,
      bestPerformingRegions: geoDistribution.slice(0, 3)
    };
  }));
  
  return campaignInsights;
}

export async function analyzeWorkflowEffectiveness(
  hubspotService: HubSpotService
): Promise<WorkflowInsight[]> {
  const workflows = await hubspotService.getWorkflows();
  
  const workflowInsights = await Promise.all(workflows.map(async (workflow: Workflow) => {
    // Obtener historial de ejecución
    const executions = await hubspotService.getWorkflowExecutionHistory(workflow.id);
    
    // Analizar conversiones atribuidas a este workflow
    const conversions = await hubspotService.getConversionsByWorkflow(workflow.id);
    
    // Calcular tasa de éxito
    const successRate = executions.length > 0 ? conversions.length / executions.length : 0;
    
    // Analizar etapas problemáticas
    const bottlenecks = identifyWorkflowBottlenecks(workflow, executions);
    
    return {
      workflowId: workflow.id,
      workflowName: workflow.properties.hs_name,
      executions: executions.length,
      conversions: conversions.length,
      successRate,
      bottlenecks,
      recommendations: generateWorkflowRecommendations(bottlenecks)
    };
  }));
  
  return workflowInsights;
}

function calculateSeasonality(data: TimeSeriesData[]): number {
  // Simple seasonality calculation
  if (data.length < 7) return 0;
  
  const weeklyValues = data.slice(-7).map(d => d.value);
  const mean = weeklyValues.reduce((a, b) => a + b, 0) / 7;
  const variance = weeklyValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 7;
  
  return Math.sqrt(variance) / mean;
}

function detectAnomalies(data: TimeSeriesData[]): TimeSeriesData[] {
  if (data.length < 3) return [];
  
  const values = data.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
  );
  
  return data.filter(d => 
    Math.abs(d.value - mean) > 2 * stdDev
  );
}

function predictTrend(data: TimeSeriesData[]): { trend: 'up' | 'down' | 'stable'; prediction: number } {
  if (data.length < 2) {
    return { trend: 'stable', prediction: 0 };
  }
  
  const recentValues = data.slice(-5);
  const firstValue = recentValues[0].value;
  const lastValue = recentValues[recentValues.length - 1].value;
  const change = ((lastValue - firstValue) / firstValue) * 100;
  
  let trend: 'up' | 'down' | 'stable';
  if (change > 5) trend = 'up';
  else if (change < -5) trend = 'down';
  else trend = 'stable';
  
  // Simple linear prediction
  const prediction = lastValue + (lastValue - firstValue) / (recentValues.length - 1);
  
  return { trend, prediction };
}

function analyzeQuotas(affiliates: any[]) {
  if (!affiliates || affiliates.length === 0) {
    return {
      totalRevenue: 0,
      averageQuota: 0
    };
  }
  
  let totalQuota = 0;
  let validQuotaCount = 0;
  
  affiliates.forEach(affiliate => {
    const quota = parseFloat(affiliate.properties.apl_cuota_afiliado);
    if (!isNaN(quota)) {
      totalQuota += quota;
      validQuotaCount++;
    }
  });
  
  return {
    totalRevenue: totalQuota,
    averageQuota: validQuotaCount > 0 ? totalQuota / validQuotaCount : 0
  };
}

function calculateROI(campaign: any, revenue: number): number {
  const budget = campaign.properties.hs_budget_items_sum_amount || 0;
  if (budget === 0) return 0;
  return ((revenue - budget) / budget) * 100;
}

function analyzeGeographicDistribution(contacts: any[]) {
  const regionCounts = contacts.reduce((acc: Record<string, number>, contact) => {
    const region = contact.properties.comunidad_autonoma || 'Desconocida';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(regionCounts)
    .map(([region, count]) => ({
      region,
      count,
      percentage: (count / contacts.length) * 100
    }))
    .sort((a, b) => b.count - a.count);
}

function identifyWorkflowBottlenecks(workflow: any, executions: any[]): string[] {
  // Implement bottleneck identification logic
  return [];
}

function generateWorkflowRecommendations(bottlenecks: string[]): string[] {
  // Implement recommendation generation logic
  return [];
} 