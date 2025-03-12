import { NextResponse } from 'next/server';
import HubSpotService from '../../../services/hubspotService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verificar si la clave API existe
    const apiKey = process.env.HUBSPOT_API_KEY;
    
    if (!apiKey) {
      console.error('HubSpot API key is missing from environment variables');
      return NextResponse.json({ 
        error: 'HubSpot API key not configured',
        environment: process.env.NODE_ENV,
        keyExists: Boolean(apiKey)
      }, { status: 500 });
    }

    // Log para depuración
    console.log(`Attempting to use HubSpot API key (first 4 chars): ${apiKey.substring(0, 4)}...`);

    const hubspotService = new HubSpotService(apiKey);
    
    // Probar una llamada simple antes de obtener schemas
    try {
      // Intentar obtener solo el endpoint de contactos para probar
      const contactSchema = await hubspotService.getObjectSchema('contacts');
      console.log('Successfully fetched contact schema');
      
      return NextResponse.json({
        contactSchema,
        message: 'Successfully retrieved contact schema'
      });
    } catch (schemaError: any) {
      console.error('Error fetching schema:', schemaError);
      return NextResponse.json({ 
        error: 'Error fetching schema',
        message: schemaError.message,
        code: schemaError.code || 'UNKNOWN'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('General error in schema endpoint:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch HubSpot schemas',
      message: error.message
    }, { status: 500 });
  }
}

async function getCampaigns() {
  try {
    const response = await this.hubspotClient.apiRequest({
      method: 'GET',
      path: '/marketing/v3/campaigns',
      qs: {
        properties: ['hs_name', 'hs_campaign_status', 'hs_start_date', 'hs_end_date', 
                     'hs_audience', 'hs_goal', 'hs_budget_items_sum_amount']
      }
    });
    
    return response.results;
  } catch (error) {
    console.error('Error al obtener campañas:', error);
    return [];
  }
}

async function getCampaignMetrics(campaignId) {
  // Implementar para obtener métricas específicas de una campaña
  // Incluir número de contactos influenciados, conversiones, etc.
}

export async function getTimeSeriesAnalysis(objectType, metric, timeframe) {
  const data = await hubspotService.getTimeSeriesData(objectType, metric, timeframe);
  
  // Análisis de estacionalidad
  const seasonalPatterns = calculateSeasonality(data);
  
  // Detección de anomalías
  const anomalies = detectAnomalies(data);
  
  // Predicción de tendencias (próximos 3 meses)
  const forecast = predictTrend(data, 90);
  
  return {
    historical: data,
    seasonalPatterns,
    anomalies,
    forecast
  };
}

export async function analyzeCampaignEffectiveness() {
  // Obtener campañas y contactos asociados
  const campaigns = await hubspotService.getCampaigns();
  
  const campaignInsights = await Promise.all(campaigns.map(async (campaign) => {
    // Analizar contactos influenciados por cada campaña
    const contacts = await hubspotService.getContactsByCampaign(campaign.id);
    
    // Segmentar por tipo (afiliado vs simpatizante)
    const affiliates = contacts.filter(c => c.relacion_con_vox === 'Afiliado');
    const sympathizers = contacts.filter(c => c.relacion_con_vox === 'Simpatizante');
    
    // Calcular tasa de conversión para esta campaña
    const conversionRate = calculateConversionRate(campaign, contacts);
    
    // Analizar cuotas generadas por la campaña
    const quotaAnalysis = analyzeQuotas(affiliates);
    
    // Calcular ROI
    const roi = calculateROI(campaign, quotaAnalysis.totalRevenue);
    
    // Análisis geográfico
    const geoDistribution = analyzeGeographicDistribution(contacts);
    
    return {
      campaignId: campaign.id,
      campaignName: campaign.hs_name,
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

export async function analyzeWorkflowEffectiveness() {
  const workflows = await hubspotService.getWorkflows();
  
  const workflowInsights = await Promise.all(workflows.map(async (workflow) => {
    // Obtener historial de ejecución
    const executions = await hubspotService.getWorkflowExecutionHistory(workflow.id);
    
    // Analizar conversiones atribuidas a este workflow
    const conversions = await hubspotService.getConversionsByWorkflow(workflow.id);
    
    // Calcular tasa de éxito
    const successRate = conversions.length / executions.length;
    
    // Analizar etapas problemáticas
    const bottlenecks = identifyWorkflowBottlenecks(workflow, executions);
    
    return {
      workflowId: workflow.id,
      workflowName: workflow.name,
      executions: executions.length,
      conversions: conversions.length,
      successRate,
      bottlenecks,
      recommendations: generateWorkflowRecommendations(bottlenecks)
    };
  }));
  
  return workflowInsights;
} 