import { Card, Title, BarChart } from '@tremor/react';
import { DashboardMetrics } from '../types/hubspot';

interface DistribucionRegionalProps {
  distribucion: DashboardMetrics['distribucionRegional'];
}

const DistribucionRegional = ({ distribucion }: DistribucionRegionalProps) => {
  const chartData = distribucion.map(({ region, count }) => ({
    region,
    'Número de personas': count,
  }));

  return (
    <Card className="mt-4">
      <Title>Distribución Regional</Title>
      <BarChart
        className="mt-6"
        data={chartData}
        index="region"
        categories={['Número de personas']}
        colors={['blue']}
        yAxisWidth={48}
      />
    </Card>
  );
};

export default DistribucionRegional; 