import { NextResponse } from "next/server";
import { hubspotService } from "../../../services/hubspotService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  // Verificar si el usuario está autenticado
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  try {
    // Obtener datos del dashboard mejorado
    const dashboardData = await hubspotService.getDashboardData();
    
    // Extraer métricas generales
    const generalMetrics = {
      totalContacts: dashboardData.generalMetrics.totalContacts,
      totalAffiliates: dashboardData.generalMetrics.totalAffiliates,
      totalSympathizers: dashboardData.generalMetrics.totalSympathizers,
      totalDonations: dashboardData.generalMetrics.totalDonations,
      totalAmount: dashboardData.generalMetrics.totalAmount,
      conversionRate: dashboardData.generalMetrics.conversionRate,
      growthRate: dashboardData.generalMetrics.growthRate,
      avgDonation: dashboardData.generalMetrics.avgDonation,
      recentCampaigns: dashboardData.generalMetrics.recentCampaigns,
      monthlyIncome: dashboardData.generalMetrics.monthlyIncome,
      topRegion: dashboardData.generalMetrics.topRegion
    };
    
    // Extraer métricas de afiliados
    const affiliateMetrics = {
      total: dashboardData.affiliateMetrics.total,
      active: dashboardData.affiliateMetrics.active,
      inactive: dashboardData.affiliateMetrics.inactive,
      newThisMonth: dashboardData.affiliateMetrics.newThisMonth,
      growthRate: dashboardData.affiliateMetrics.growthRate,
      byRegion: dashboardData.affiliateMetrics.byRegion.map((item: {region: string, count: number, percentage: number}) => ({
        region: item.region,
        count: item.count,
        percentage: item.percentage
      })),
      byMonth: dashboardData.affiliateMetrics.byMonth
    };
    
    // Extraer métricas de simpatizantes
    const sympathizerMetrics = {
      total: dashboardData.sympathizerMetrics.total,
      active: dashboardData.sympathizerMetrics.active,
      inactive: dashboardData.sympathizerMetrics.inactive,
      newThisMonth: dashboardData.sympathizerMetrics.newThisMonth,
      growthRate: dashboardData.sympathizerMetrics.growthRate,
      byRegion: dashboardData.sympathizerMetrics.byRegion.map((item: {region: string, count: number, percentage: number}) => ({
        region: item.region,
        count: item.count,
        percentage: item.percentage
      })),
      byMonth: dashboardData.sympathizerMetrics.byMonth
    };
    
    return NextResponse.json({
      generalMetrics,
      affiliateMetrics,
      sympathizerMetrics
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
} 