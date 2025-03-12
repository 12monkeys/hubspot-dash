import { Card, Metric, Text, Flex, Grid } from '@tremor/react';
import { DashboardMetrics } from '../types/hubspot';

interface MetricasGeneralesProps {
  metrics: DashboardMetrics;
}

const MetricasGenerales = ({ metrics }: MetricasGeneralesProps) => {
  return (
    <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
      <Card className="max-w-lg">
        <Text>Total Afiliados</Text>
        <Metric>{metrics.totalAfiliados}</Metric>
        <Text className="mt-2">Tasa de conversión: {metrics.tasaConversion.toFixed(1)}%</Text>
      </Card>
      
      <Card className="max-w-lg">
        <Text>Total Simpatizantes</Text>
        <Metric>{metrics.totalSimpatizantes}</Metric>
        <Text className="mt-2">Crecimiento mensual: {metrics.crecimientoMensual.toFixed(1)}%</Text>
      </Card>

      <Card className="max-w-lg">
        <Text>Total Donaciones</Text>
        <Metric>{metrics.totalDonaciones.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</Metric>
        <Text className="mt-2">Promedio: {metrics.donacionesPromedio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</Text>
      </Card>

      <Card className="max-w-lg">
        <Text>Campañas Activas</Text>
        <Metric>{metrics.campañasActivas}</Metric>
        <Text className="mt-2">En curso</Text>
      </Card>
    </Grid>
  );
};

export default MetricasGenerales; 