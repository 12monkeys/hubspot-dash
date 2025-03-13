import HubSpotService from "@/services/hubspotService";

export interface CampaignAnalysis {
  campaignId: string;
  name: string;
  metrics: {
    emailsSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
  performance: {
    status: 'excellent' | 'good' | 'needs-improvement';
    recommendations: string[];
  };
}

export interface Campaign {
  id: string;
  name: string;
  statistics?: {
    sent?: number;
    opens?: number;
    clicks?: number;
    conversions?: number;
  };
}

export async function analyzeCampaignEffectiveness(hubspotService: HubSpotService): Promise<CampaignAnalysis[]> {
  try {
    // Obtener datos de campañas de HubSpot
    const campaigns = await hubspotService.getCampaigns();
    
    // Analizar cada campaña
    const analysisResults = campaigns.map(campaign => {
      // Calcular métricas
      const metrics = {
        emailsSent: campaign.properties?.hs_audience || 0,
        openRate: calculateRate(campaign.properties?.hs_goal, campaign.properties?.hs_audience),
        clickRate: calculateRate(campaign.properties?.hs_goal, campaign.properties?.hs_audience),
        conversionRate: calculateRate(campaign.properties?.hs_goal, campaign.properties?.hs_audience)
      };

      // Evaluar rendimiento
      const performance = evaluatePerformance(metrics);

      return {
        campaignId: campaign.id,
        name: campaign.properties?.hs_name || 'Sin nombre',
        metrics,
        performance
      };
    });

    return analysisResults;
  } catch (error) {
    console.error("Error analyzing campaigns:", error);
    throw error;
  }
}

function calculateRate(numerator?: number, denominator?: number): number {
  if (!numerator || !denominator || denominator === 0) return 0;
  return (numerator / denominator) * 100;
}

function evaluatePerformance(metrics: CampaignAnalysis['metrics']): CampaignAnalysis['performance'] {
  const recommendations: string[] = [];
  let status: CampaignAnalysis['performance']['status'] = 'good';

  if (metrics.openRate < 20) {
    recommendations.push("Mejorar líneas de asunto para aumentar tasa de apertura");
    status = 'needs-improvement';
  }

  if (metrics.clickRate < 2) {
    recommendations.push("Optimizar CTAs y contenido para aumentar clics");
    status = 'needs-improvement';
  }

  if (metrics.conversionRate < 1) {
    recommendations.push("Revisar páginas de destino y ofertas para mejorar conversiones");
    status = 'needs-improvement';
  }

  if (metrics.openRate > 30 && metrics.clickRate > 5 && metrics.conversionRate > 2) {
    status = 'excellent';
    recommendations.push("Mantener la estrategia actual y considerar expandir alcance");
  }

  return { status, recommendations };
} 