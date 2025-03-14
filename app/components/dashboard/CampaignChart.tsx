"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Campaign } from "../../types/campaign";

type CampaignChartData = Pick<Campaign, 'name' | 'conversionRate' | 'affiliatesCount' | 'sympathizersCount'>;

interface CampaignChartProps {
  data: CampaignChartData[];
  onSelectCampaign: (data: any) => void;
}

const CampaignChart = ({ data, onSelectCampaign }: CampaignChartProps) => {
  return (
    <Card className="lg:col-span-2 shadow-lg">
      <CardHeader className="">
        <CardTitle className="">Efectividad de Campañas</CardTitle>
      </CardHeader>
      <CardContent className="">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  const numericValue = typeof value === 'number' ? value : parseFloat(value as string);
                  let formattedValue = name === 'conversionRate' ? `${(numericValue * 100).toFixed(1)}%` : numericValue.toLocaleString();

                  const label = name === 'conversionRate' ? 'Tasa de conversión' : 
                                name === 'affiliatesCount' ? 'Afiliados' : 
                                name === 'sympathizersCount' ? 'Simpatizantes' : name;

                  return [formattedValue, label];
                }}
              />
              <Legend 
                formatter={(value) => 
                  value === 'conversionRate' ? 'Tasa de conversión' : 
                  value === 'affiliatesCount' ? 'Afiliados' : 
                  value === 'sympathizersCount' ? 'Simpatizantes' : value
                }
              />
              <Bar 
                dataKey="affiliatesCount" 
                fill="#8884d8" 
                onClick={(data) => onSelectCampaign(data)}
              />
              <Bar 
                dataKey="sympathizersCount" 
                fill="#82ca9d"
                onClick={(data) => onSelectCampaign(data)}
              />
              <Bar 
                dataKey="conversionRate" 
                fill="#ffc658"
                onClick={(data) => onSelectCampaign(data)}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-72 flex items-center justify-center">
            <span className="text-gray-500">No hay datos de campañas disponibles</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignChart; 