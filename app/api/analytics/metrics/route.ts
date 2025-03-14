import { NextResponse } from "next/server";
import HubSpotService from "../../../services/hubspotService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  try {
    const hubspotService = new HubSpotService(process.env.HUBSPOT_ACCESS_TOKEN || "");
    
    // Obtener datos del dashboard mejorado
    const dashboardData = await hubspotService.getDashboardMetrics();
    
    // Transformar los datos para el formato esperado por el componente KPIOverview
    const data = {
      totalAffiliates: dashboardData.totalAfiliados,
      affiliatesChange: 5.2, // Podríamos calcular esto comparando con datos históricos
      conversionRate: dashboardData.tasaConversion,
      conversionRateChange: -0.8,
      totalSympathizers: dashboardData.totalSimpatizantes,
      sympathizersChange: 8.7,
      monthlyGrowth: dashboardData.crecimientoMensual,
      monthlyGrowthChange: 2.3,
      averageQuota: dashboardData.cuotaPromedio,
      averageQuotaChange: 0.5,
      estimatedMonthlyIncome: dashboardData.ingresoCuotasMensual,
      estimatedIncomeChange: 3.9,
      activeCampaigns: dashboardData.campañasActivas,
      activeCampaignsChange: 0,
      annualProjection: dashboardData.ingresoCuotasMensual * 12,
      
      // Usar los datos mejorados
      regionDistribution: dashboardData.distribucionRegional,
      quotaDistribution: dashboardData.distribucionCuotas.map(item => ({
        quota: parseInt(item.rango.split('-')[0]),
        count: item.count,
        percentage: item.count / dashboardData.totalAfiliados
      })),
      
      // Mock time series data since it doesn't exist in the interface
      timeSeriesData: [
        { month: 'Ene', affiliates: 1200, sympathizers: 3500 },
        { month: 'Feb', affiliates: 1250, sympathizers: 3650 },
        { month: 'Mar', affiliates: 1320, sympathizers: 3800 },
        { month: 'Abr', affiliates: 1380, sympathizers: 3950 },
        { month: 'May', affiliates: 1450, sympathizers: 4100 },
        { month: 'Jun', affiliates: 1520, sympathizers: 4300 }
      ],
      
      // Mock data for distributions that don't exist in the interface
      comunidadesDistribution: dashboardData.distribucionRegional.map(item => ({
        name: item.region,
        affiliates: item.count,
        supporters: Math.round(item.count * 0.7) // Mock data
      })),
      
      tipoAfiliadoDistribution: [
        { tipo: 'Estándar', count: Math.round(dashboardData.totalAfiliados * 0.65) },
        { tipo: 'Premium', count: Math.round(dashboardData.totalAfiliados * 0.25) },
        { tipo: 'Especial', count: Math.round(dashboardData.totalAfiliados * 0.1) }
      ],
      
      // Datos de donaciones
      totalDonations: dashboardData.totalDonaciones,
      averageDonation: dashboardData.donacionesPromedio,
      
      // Datos de fuentes de adquisición
      acquisitionSources: dashboardData.fuentesAdquisicion
    };
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al obtener métricas:", error);
    return NextResponse.json({ error: "Error al obtener métricas" }, { status: 500 });
  }
} 