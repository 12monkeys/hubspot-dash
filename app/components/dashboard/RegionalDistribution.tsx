"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

type RegionData = {
  name: string;
  affiliates: number;
  supporters: number;
  percentage: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#4CAF50', '#FF5722', '#9C27B0', '#3F51B5', '#E91E63'];

// Datos simulados para usar directamente
const mockRegionData: RegionData[] = [
  { name: 'Madrid', affiliates: 45000, supporters: 20000, percentage: 21.6 },
  { name: 'Andalucía', affiliates: 38000, supporters: 17000, percentage: 18.3 },
  { name: 'Cataluña', affiliates: 30000, supporters: 12000, percentage: 14.4 },
  { name: 'Valencia', affiliates: 25000, supporters: 10000, percentage: 12.0 },
  { name: 'Galicia', affiliates: 18000, supporters: 8000, percentage: 8.7 },
  { name: 'País Vasco', affiliates: 15000, supporters: 7000, percentage: 7.2 },
  { name: 'Castilla y León', affiliates: 12000, supporters: 6000, percentage: 5.8 },
  { name: 'Canarias', affiliates: 10000, supporters: 5000, percentage: 4.8 },
  { name: 'Aragón', affiliates: 8000, supporters: 4000, percentage: 3.8 },
  { name: 'Asturias', affiliates: 7000, supporters: 3500, percentage: 3.4 }
];

export default function RegionalDistribution() {
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'affiliates' | 'supporters' | 'percentage'>('affiliates');
  const [totalAffiliates, setTotalAffiliates] = useState(0);
  const [totalSupporters, setTotalSupporters] = useState(0);
  
  useEffect(() => {
    // Simular una carga de datos
    const timer = setTimeout(() => {
      setRegionData(mockRegionData);
      
      // Calcular totales
      const affiliatesTotal = mockRegionData.reduce((sum, region) => sum + region.affiliates, 0);
      const supportersTotal = mockRegionData.reduce((sum, region) => sum + region.supporters, 0);
      
      setTotalAffiliates(affiliatesTotal);
      setTotalSupporters(supportersTotal);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
    
    // Código original comentado
    /*
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/regions');
        const data = await response.json();
        
        if (data.regions) {
          // Calculate totals
          const affiliatesTotal = data.regions.reduce((sum: number, region: RegionData) => sum + region.affiliates, 0);
          const supportersTotal = data.regions.reduce((sum: number, region: RegionData) => sum + region.supporters, 0);
          
          // Add percentage to each region
          const regionsWithPercentage = data.regions.map((region: RegionData) => ({
            ...region,
            percentage: (region.affiliates / (affiliatesTotal || 1)) * 100
          }));
          
          setRegionData(regionsWithPercentage);
          setTotalAffiliates(affiliatesTotal);
          setTotalSupporters(supportersTotal);
        }
      } catch (error) {
        console.error("Error fetching regional data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    */
  }, []);
  
  // Sort data based on selected criteria
  const sortedData = [...regionData].sort((a, b) => b[sortBy] - a[sortBy]);
  
  // Top 5 regions for pie chart
  const topRegions = [...regionData].sort((a, b) => b.affiliates - a.affiliates).slice(0, 5);
  
  // Calculate "Others" for pie chart if there are more than 5 regions
  const otherRegions = regionData.length > 5 
    ? {
        name: "Otros",
        affiliates: regionData
          .sort((a, b) => b.affiliates - a.affiliates)
          .slice(5)
          .reduce((sum, region) => sum + region.affiliates, 0),
        percentage: regionData
          .sort((a, b) => b.affiliates - a.affiliates)
          .slice(5)
          .reduce((sum, region) => sum + region.percentage, 0),
        supporters: regionData
          .sort((a, b) => b.affiliates - a.affiliates)
          .slice(5)
          .reduce((sum, region) => sum + region.supporters, 0)
      }
    : null;
  
  // Final data for pie chart
  const pieChartData = otherRegions 
    ? [...topRegions, otherRegions]
    : topRegions;
  
  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Distribución Regional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (regionData.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Distribución Regional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded">
            No se pudieron cargar los datos regionales.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Distribución Regional</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm">
            <span className="font-medium">Total Afiliados:</span> {totalAffiliates.toLocaleString()}
            <span className="mx-2">|</span>
            <span className="font-medium">Total Simpatizantes:</span> {totalSupporters.toLocaleString()}
          </div>
          <div>
            <label htmlFor="sortBy" className="mr-2 text-sm">Ordenar por:</label>
            <select 
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'affiliates' | 'supporters' | 'percentage')}
              className="border rounded p-1 text-sm"
            >
              <option value="affiliates">Afiliados</option>
              <option value="supporters">Simpatizantes</option>
              <option value="percentage">Porcentaje</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Distribución por Comunidad</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedData.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (typeof value !== 'number') {
                        return [value, name];
                      }
                      
                      if (name === 'percentage') {
                        return [`${value.toFixed(1)}%`, 'Porcentaje'];
                      } else if (name === 'affiliates') {
                        return [value.toLocaleString(), 'Afiliados'];
                      } else if (name === 'supporters') {
                        return [value.toLocaleString(), 'Simpatizantes'];
                      }
                      
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="affiliates" name="Afiliados" fill="#8884d8" />
                  <Bar dataKey="supporters" name="Simpatizantes" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Principales Comunidades</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="affiliates"
                    nameKey="name"
                    label={({name, percent}) => {
                      if (typeof percent === 'number') {
                        return `${name}: ${percent.toFixed(0)}%`;
                      }
                      return name;
                    }}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: string, props: any) => {
                      if (props && props.payload && typeof props.payload.percentage === 'number') {
                        return [
                          `${typeof value === 'number' ? value.toLocaleString() : value} (${props.payload.percentage.toFixed(1)}%)`,
                          props.payload.name
                        ];
                      }
                      return [value, name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 