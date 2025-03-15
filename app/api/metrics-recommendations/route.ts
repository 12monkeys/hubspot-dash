import { NextResponse } from 'next/server';
import { hubspotService } from '../../services/hubspotService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Obtener datos del dashboard
    const dashboardData = await hubspotService.getDashboardData();
    
    // Analizar las métricas disponibles y generar recomendaciones
    const recommendations = generateRecommendations(dashboardData);
    
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

// Función para generar recomendaciones basadas en los datos
function generateRecommendations(data: any) {
  const recommendations = [];
  
  // Ejemplo de recomendaciones basadas en métricas
  if (data.generalMetrics.conversionRate < 5) {
    recommendations.push({
      type: 'warning',
      metric: 'conversionRate',
      message: 'La tasa de conversión está por debajo del objetivo. Considera implementar campañas de activación.'
    });
  }
  
  if (data.generalMetrics.growthRate < 2) {
    recommendations.push({
      type: 'warning',
      metric: 'growthRate',
      message: 'El crecimiento mensual está por debajo del objetivo. Revisa las estrategias de captación.'
    });
  }
  
  if (data.affiliateMetrics.inactive > data.affiliateMetrics.active * 0.3) {
    recommendations.push({
      type: 'alert',
      metric: 'inactiveAffiliates',
      message: 'Alto porcentaje de afiliados inactivos. Implementa una campaña de reactivación.'
    });
  }
  
  // Añadir recomendaciones positivas si hay buenos resultados
  if (data.generalMetrics.conversionRate > 10) {
    recommendations.push({
      type: 'success',
      metric: 'conversionRate',
      message: '¡Excelente tasa de conversión! Continúa con la estrategia actual.'
    });
  }
  
  return {
    count: recommendations.length,
    items: recommendations
  };
} 