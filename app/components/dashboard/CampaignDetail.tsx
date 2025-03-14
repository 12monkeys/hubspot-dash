"use client";

import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Campaign } from "../../types/campaign";

interface CampaignDetailProps {
  campaign: Campaign;
}

const CampaignDetail = ({ campaign }: CampaignDetailProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="shadow-lg">
        <CardHeader className="">
          <CardTitle className="">Detalle de Campaña: {campaign.name}</CardTitle>
        </CardHeader>
        <CardContent className="">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                <p className="mt-1 text-lg font-semibold">
                  {campaign.status === 'ACTIVE' ? 
                    <span className="text-green-600">Activa</span> : 
                    <span className="text-gray-600">Inactiva</span>
                  }
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Tasa de Conversión</h3>
                <p className="mt-1 text-lg font-semibold">
                  {(campaign.conversionRate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Fecha Inicio</h3>
                <p className="mt-1 text-lg font-semibold">
                  {campaign.startDate ? 
                    new Date(campaign.startDate).toLocaleDateString('es-ES') : 
                    'No disponible'
                  }
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Fecha Fin</h3>
                <p className="mt-1 text-lg font-semibold">
                  {campaign.endDate ? 
                    new Date(campaign.endDate).toLocaleDateString('es-ES') : 
                    'No disponible'
                  }
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Conversión por Impacto</h3>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-500">Total Contactos</p>
                  <p className="text-lg font-bold">{campaign.totalContacts}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Afiliados</p>
                  <p className="text-lg font-bold">{campaign.affiliatesCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Simpatizantes</p>
                  <p className="text-lg font-bold">{campaign.sympathizersCount}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader className="">
          <CardTitle className="">Análisis de Cuotas</CardTitle>
        </CardHeader>
        <CardContent className="">
          {campaign.quotaAnalysis ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Cuota Promedio</h3>
                  <p className="mt-1 text-lg font-semibold">
                    {campaign.quotaAnalysis.averageQuota.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Ingresos Potenciales</h3>
                  <p className="mt-1 text-lg font-semibold">
                    {campaign.quotaAnalysis.totalRevenue.toFixed(2)} €
                  </p>
                </div>
              </div>
              
              {campaign.quotaAnalysis.quotaDistribution.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Distribución de Cuotas</h3>
                  <div className="overflow-hidden">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Cuota</th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Afiliados</th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Porcentaje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaign.quotaAnalysis.quotaDistribution.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-2 py-1 text-sm">{item.quota.toFixed(2)} €</td>
                            <td className="px-2 py-1 text-sm">{item.count}</td>
                            <td className="px-2 py-1 text-sm">{item.percentage.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <span className="text-gray-500">No hay datos de cuotas disponibles para esta campaña</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignDetail; 