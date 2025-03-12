import { Card, Grid, Text, Metric, BarChart, Title } from "@tremor/react";
import { DashboardMetrics } from "../types/hubspot";

interface MetricasCuotasProps {
  metrics: DashboardMetrics;
}

const MetricasCuotas = ({ metrics }: MetricasCuotasProps) => {
  return (
    <div className="space-y-4">
      <Title>Métricas de Cuotas de Afiliados</Title>
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
        <Card className="max-w-lg">
          <Text>Cuota Promedio</Text>
          <Metric>{metrics.cuotaPromedio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</Metric>
          <Text className="mt-2">Por afiliado</Text>
        </Card>
        
        <Card className="max-w-lg">
          <Text>Ingreso Mensual Estimado</Text>
          <Metric>{metrics.ingresoCuotasMensual.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</Metric>
          <Text className="mt-2">Por cuotas de afiliados</Text>
        </Card>
        
        <Card className="max-w-lg">
          <Text>Proyección Anual</Text>
          <Metric>{(metrics.ingresoCuotasMensual * 12).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</Metric>
          <Text className="mt-2">Ingresos anuales por cuotas</Text>
        </Card>
      </Grid>
      
      <Card>
        <Title>Distribución de Cuotas</Title>
        <Text>Número de afiliados por rango de cuota</Text>
        <BarChart
          className="mt-6"
          data={metrics.distribucionCuotas}
          index="rango"
          categories={["count"]}
          colors={["blue"]}
          valueFormatter={(number) => number.toString()}
          yAxisWidth={40}
        />
      </Card>
    </div>
  );
};

export default MetricasCuotas; 