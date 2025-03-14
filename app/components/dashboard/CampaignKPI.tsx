"use client";

import { Card, CardContent } from "../ui/Card";
import { KPIItem } from "../../types/campaign";

interface CampaignKPIProps {
  items: KPIItem[];
}

const CampaignKPI = ({ items }: CampaignKPIProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{item.title}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                {item.change !== null && (
                  <p className={`text-xs ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(1)}%
                  </p>
                )}
              </div>
              <div className="text-2xl">{item.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CampaignKPI; 