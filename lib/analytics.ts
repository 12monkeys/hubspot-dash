import HubSpotService from '@/services/hubspotService';

interface TimeSeriesData {
  date: string;
  value: number;
}

interface TimeSeriesAnalysis {
  seasonality: number;
  anomalies: TimeSeriesData[];
  trend: 'up' | 'down' | 'stable';
  prediction: number;
}

export async function getTimeSeriesAnalysis(
  hubspotService: HubSpotService,
  objectType: string,
  metric: string,
  timeframe: string
): Promise<TimeSeriesAnalysis> {
  const data = await hubspotService.getTimeSeriesData(objectType, metric, timeframe);
  
  // Calculate seasonality
  const seasonality = calculateSeasonality(data);
  
  // Detect anomalies
  const anomalies = detectAnomalies(data);
  
  // Predict trend
  const { trend, prediction } = predictTrend(data);
  
  return {
    seasonality,
    anomalies,
    trend,
    prediction
  };
}

function calculateSeasonality(data: TimeSeriesData[]): number {
  // Simple seasonality calculation
  if (data.length < 7) return 0;
  
  const weeklyValues = data.slice(-7).map(d => d.value);
  const mean = weeklyValues.reduce((a, b) => a + b, 0) / 7;
  const variance = weeklyValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 7;
  
  return Math.sqrt(variance) / mean;
}

function detectAnomalies(data: TimeSeriesData[]): TimeSeriesData[] {
  if (data.length < 3) return [];
  
  const values = data.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
  );
  
  return data.filter(d => 
    Math.abs(d.value - mean) > 2 * stdDev
  );
}

function predictTrend(data: TimeSeriesData[]): { trend: 'up' | 'down' | 'stable'; prediction: number } {
  if (data.length < 2) {
    return { trend: 'stable', prediction: 0 };
  }
  
  const recentValues = data.slice(-5);
  const firstValue = recentValues[0].value;
  const lastValue = recentValues[recentValues.length - 1].value;
  const change = ((lastValue - firstValue) / firstValue) * 100;
  
  let trend: 'up' | 'down' | 'stable';
  if (change > 5) trend = 'up';
  else if (change < -5) trend = 'down';
  else trend = 'stable';
  
  // Simple linear prediction
  const prediction = lastValue + (lastValue - firstValue) / (recentValues.length - 1);
  
  return { trend, prediction };
} 