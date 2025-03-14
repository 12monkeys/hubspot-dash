"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import CampaignChart from "./CampaignChart";
import DistribucionRegional from "./DistribucionRegional";
import CampaignDetail from "./CampaignDetail";
import CampaignKPI from "./CampaignKPI";
import { Campaign } from "../../types/campaign";

export default function CampaignAnalysis() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true);
      try {
        const response = await fetch('/api/analytics/campaigns');
        const result = await response.json();
        setCampaigns(result.data);
        
        // Seleccionar la primera campaña por defecto
        if (result.data.length > 0) {
          setSelectedCampaign(result.data[0]);
        }
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCampaigns();
  }, []);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  const chartData = campaigns.map(campaign => ({
    name: campaign.name,
    conversionRate: campaign.conversionRate,
    affiliatesCount: campaign.affiliatesCount,
    sympathizersCount: campaign.sympathizersCount
  }));
  
  const kpiItems = campaigns.map((campaign, index) => ({
    title: campaign.name,
    value: campaign.totalContacts,
    change: null,
    icon: <div className="text-2xl">{index + 1}</div>
  }));
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="lg:col-span-2 h-72 flex items-center justify-center">
            <span className="text-gray-500">Cargando datos...</span>
          </div>
        ) : (
          <CampaignChart 
            data={chartData} 
            onSelectCampaign={(data) => setSelectedCampaign(data)}
          />
        )}
        
        <Card className="shadow-lg">
          <CardHeader className="">
            <CardTitle className="">Distribución Regional</CardTitle>
          </CardHeader>
          <CardContent className="">
            {selectedCampaign && selectedCampaign.regionDistribution ? (
              <DistribucionRegional distribucion={selectedCampaign.regionDistribution} />
            ) : (
              <div className="h-72 flex items-center justify-center">
                <span className="text-gray-500">Seleccione una campaña para ver su distribución regional</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {selectedCampaign && (
        <CampaignDetail campaign={selectedCampaign} />
      )}
      
      <CampaignKPI items={kpiItems} />
    </div>
  );
} 