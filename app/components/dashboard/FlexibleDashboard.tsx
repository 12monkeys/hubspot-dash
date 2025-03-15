"use client";

import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import KPIOverview from './KPIOverview';
import RegionalDistribution from './RegionalDistribution';
import DonationAnalytics from './DonationAnalytics';
import CampaignEffectiveness from './CampaignEffectiveness';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './flexible-dashboard.css';

// Configurar el WidthProvider para manejar el ancho responsivo
const ResponsiveGridLayout = WidthProvider(Responsive);

// Tipos de widgets disponibles
export type WidgetType = 
  | 'kpi-overview'
  | 'regional-distribution'
  | 'donation-analytics'
  | 'campaign-effectiveness';

// Interfaz para un widget
interface Widget {
  id: string;
  type: WidgetType;
  title: string;
}

// Interfaz para las props del componente
interface FlexibleDashboardProps {
  isLoading?: boolean;
  error?: string | null;
}

const FlexibleDashboard: React.FC<FlexibleDashboardProps> = ({ isLoading = false, error = null }) => {
  // Definir los widgets disponibles
  const widgets: Widget[] = [
    { id: 'kpi-overview', type: 'kpi-overview', title: 'Resumen General' },
    { id: 'regional-distribution', type: 'regional-distribution', title: 'Distribución Regional' },
    { id: 'donation-analytics', type: 'donation-analytics', title: 'Análisis de Donaciones' },
    { id: 'campaign-effectiveness', type: 'campaign-effectiveness', title: 'Efectividad de Campañas' },
  ];

  // Layouts por defecto para diferentes tamaños de pantalla
  const defaultLayouts: Layouts = {
    lg: [
      { i: 'kpi-overview', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'regional-distribution', x: 0, y: 2, w: 6, h: 4, minW: 3, minH: 3 },
      { i: 'donation-analytics', x: 6, y: 2, w: 6, h: 4, minW: 3, minH: 3 },
      { i: 'campaign-effectiveness', x: 0, y: 6, w: 12, h: 4, minW: 6, minH: 3 },
    ],
    md: [
      { i: 'kpi-overview', x: 0, y: 0, w: 10, h: 2, minW: 6, minH: 2 },
      { i: 'regional-distribution', x: 0, y: 2, w: 5, h: 4, minW: 3, minH: 3 },
      { i: 'donation-analytics', x: 5, y: 2, w: 5, h: 4, minW: 3, minH: 3 },
      { i: 'campaign-effectiveness', x: 0, y: 6, w: 10, h: 4, minW: 5, minH: 3 },
    ],
    sm: [
      { i: 'kpi-overview', x: 0, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'regional-distribution', x: 0, y: 2, w: 6, h: 4, minW: 3, minH: 3 },
      { i: 'donation-analytics', x: 0, y: 6, w: 6, h: 4, minW: 3, minH: 3 },
      { i: 'campaign-effectiveness', x: 0, y: 10, w: 6, h: 4, minW: 4, minH: 3 },
    ],
  };

  // Estados para manejar los layouts y el breakpoint actual
  const [layouts, setLayouts] = useState<Layouts>(
    loadLayouts() || defaultLayouts
  );
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('lg');
  const [mounted, setMounted] = useState(false);

  // Efecto para manejar el montaje del componente (evitar problemas con SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para guardar layouts en localStorage
  const saveLayouts = (newLayouts: Layouts) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard-layouts', JSON.stringify(newLayouts));
    }
  };

  // Función para cargar layouts desde localStorage
  function loadLayouts(): Layouts | null {
    if (typeof window !== 'undefined') {
      const savedLayouts = localStorage.getItem('dashboard-layouts');
      return savedLayouts ? JSON.parse(savedLayouts) : null;
    }
    return null;
  }

  // Manejar cambios en el layout
  const handleLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    saveLayouts(allLayouts);
  };

  // Manejar cambios en el breakpoint
  const handleBreakpointChange = (newBreakpoint: string) => {
    setCurrentBreakpoint(newBreakpoint);
  };

  // Función para resetear los layouts a los valores por defecto
  const resetLayouts = () => {
    setLayouts(defaultLayouts);
    saveLayouts(defaultLayouts);
  };

  // Renderizar el contenido del widget según su tipo
  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'kpi-overview':
        return <KPIOverview showOnlyKPIs={false} />;
      case 'regional-distribution':
        return <RegionalDistribution />;
      case 'donation-analytics':
        return <DonationAnalytics showOnlySummary={false} showOnlyCharts={false} />;
      case 'campaign-effectiveness':
        return <CampaignEffectiveness showOnlySummary={false} showOnlyCharts={false} />;
      default:
        return <div>Widget no disponible</div>;
    }
  };

  // Si hay un error, mostrar mensaje de error
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        <h3 className="font-semibold">Error al cargar el dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // No renderizar hasta que el componente esté montado (evitar problemas con SSR)
  if (!mounted) return null;

  return (
    <div className="flexible-dashboard">
      <div className="dashboard-controls">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard Flexible</h2>
        <button
          onClick={resetLayouts}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Restablecer Diseño
        </button>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={handleLayoutChange}
        onBreakpointChange={handleBreakpointChange}
        isDraggable={true}
        isResizable={true}
        margin={[16, 16]}
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="dashboard-widget">
            <div className="widget-container">
              <h3 className="widget-title">{widget.title}</h3>
              <div className="widget-content">
                {renderWidgetContent(widget)}
              </div>
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default FlexibleDashboard; 