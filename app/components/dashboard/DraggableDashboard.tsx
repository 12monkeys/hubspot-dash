"use client";

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KPIOverview from './KPIOverview';
import RegionalDistribution from './RegionalDistribution';
import DonationAnalytics from './DonationAnalytics';
import CampaignEffectiveness from './CampaignEffectiveness';

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
  size: 'small' | 'medium' | 'large';
}

// Interfaz para las props del componente
interface DraggableDashboardProps {
  isLoading?: boolean;
  error?: string | null;
}

// Componente para un widget individual
const SortableWidget = ({ widget, onSizeChange }: { widget: Widget, onSizeChange: (id: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  // Determinar el tamaño del widget
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 row-span-2',
    large: 'col-span-2 row-span-2',
  };

  // Renderizar el contenido del widget según su tipo
  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'kpi-overview':
        return <KPIOverview showOnlyKPIs={widget.size === 'small'} />;
      case 'regional-distribution':
        return <RegionalDistribution showSummaryOnly={widget.size === 'small'} />;
      case 'donation-analytics':
        return <DonationAnalytics 
          showOnlySummary={widget.size === 'small'} 
          showOnlyCharts={widget.size === 'medium'} 
        />;
      case 'campaign-effectiveness':
        return <CampaignEffectiveness 
          showOnlySummary={widget.size === 'small'} 
          showOnlyCharts={widget.size === 'medium'} 
        />;
      default:
        return <div>Widget no disponible</div>;
    }
  };

  // Obtener el siguiente tamaño
  const getNextSize = (currentSize: 'small' | 'medium' | 'large'): string => {
    const sizes: Record<string, string> = {
      'small': 'medium',
      'medium': 'large',
      'large': 'small'
    };
    return sizes[currentSize];
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`dashboard-widget ${sizeClasses[widget.size]} transition-all duration-200`}
    >
      <div className="widget-container h-full">
        <div 
          className="widget-header flex items-center justify-between p-3 bg-white border-b cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <h3 className="text-lg font-semibold text-gray-800">{widget.title}</h3>
          <div className="widget-controls flex space-x-2">
            <button 
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors bg-gray-100 rounded-md"
              title={`Cambiar tamaño (actual: ${widget.size}, siguiente: ${getNextSize(widget.size)})`}
              onClick={(e) => {
                e.stopPropagation();
                onSizeChange(widget.id);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="widget-content p-4 bg-white overflow-auto flex-grow">
          {renderWidgetContent()}
        </div>
      </div>
    </div>
  );
};

// Componente principal del dashboard
const DraggableDashboard: React.FC<DraggableDashboardProps> = ({ isLoading = false, error = null }) => {
  // Definir los widgets disponibles
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'kpi-overview', type: 'kpi-overview', title: 'Resumen General', size: 'large' },
    { id: 'regional-distribution', type: 'regional-distribution', title: 'Distribución Regional', size: 'medium' },
    { id: 'donation-analytics', type: 'donation-analytics', title: 'Análisis de Donaciones', size: 'medium' },
    { id: 'campaign-effectiveness', type: 'campaign-effectiveness', title: 'Efectividad de Campañas', size: 'large' },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Configurar sensores para detectar eventos de arrastre
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Distancia mínima para activar el arrastre
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Efecto para manejar el montaje del componente (evitar problemas con SSR)
  useEffect(() => {
    setMounted(true);
    
    // Cargar la configuración guardada si existe
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        setWidgets(parsedLayout);
      } catch (e) {
        console.error('Error al cargar la configuración del dashboard:', e);
      }
    }
  }, []);

  // Guardar la configuración cuando cambia
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('dashboardLayout', JSON.stringify(widgets));
    }
  }, [widgets, mounted]);

  // Manejar el inicio del arrastre
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Manejar el fin del arrastre
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  // Función para cambiar el tamaño de un widget
  const changeWidgetSize = (id: string) => {
    setWidgets((items) =>
      items.map((item) => {
        if (item.id === id) {
          const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
          const currentIndex = sizes.indexOf(item.size);
          const nextIndex = (currentIndex + 1) % sizes.length;
          return { ...item, size: sizes[nextIndex] };
        }
        return item;
      })
    );
  };

  // Función para restablecer el diseño predeterminado
  const resetLayout = () => {
    setWidgets([
      { id: 'kpi-overview', type: 'kpi-overview', title: 'Resumen General', size: 'large' },
      { id: 'regional-distribution', type: 'regional-distribution', title: 'Distribución Regional', size: 'medium' },
      { id: 'donation-analytics', type: 'donation-analytics', title: 'Análisis de Donaciones', size: 'medium' },
      { id: 'campaign-effectiveness', type: 'campaign-effectiveness', title: 'Efectividad de Campañas', size: 'large' },
    ]);
    localStorage.removeItem('dashboardLayout');
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

  // Encontrar el widget activo
  const activeWidget = activeId ? widgets.find((widget) => widget.id === activeId) : null;

  return (
    <div className="draggable-dashboard p-4">
      <div className="dashboard-controls mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard Interactivo</h2>
        <div className="flex space-x-2">
          <button
            onClick={resetLayout}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Restablecer Diseño
          </button>
        </div>
      </div>

      <div className="dashboard-help mb-4 p-3 bg-blue-50 text-blue-800 rounded-md">
        <p className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Arrastra los widgets por su barra de título para reorganizarlos. Haz clic en el icono de redimensionar para cambiar su tamaño.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 gap-4 auto-rows-min">
          <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
            {widgets.map((widget) => (
              <SortableWidget 
                key={widget.id} 
                widget={widget} 
                onSizeChange={changeWidgetSize} 
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeWidget ? (
            <div className="dashboard-widget shadow-xl">
              <div className="widget-container">
                <div className="widget-header flex items-center justify-between p-3 bg-white border-b">
                  <h3 className="text-lg font-semibold text-gray-800">{activeWidget.title}</h3>
                </div>
                <div className="widget-content p-4 bg-white">
                  {/* Contenido simplificado para el overlay */}
                  <div className="h-32 flex items-center justify-center text-gray-400">
                    Arrastrando widget...
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <style jsx global>{`
        .dashboard-widget {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: box-shadow 0.3s ease, transform 0.2s ease;
          border: 1px solid #f0f0f0;
        }
        
        .dashboard-widget:hover {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .dashboard-widget.is-dragging {
          z-index: 10;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        
        .widget-header {
          position: relative;
          cursor: grab;
          background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='2' fill='%23D1D5DB'/%3E%3Ccircle cx='2' cy='7' r='2' fill='%23D1D5DB'/%3E%3Ccircle cx='2' cy='12' r='2' fill='%23D1D5DB'/%3E%3Ccircle cx='7' cy='2' r='2' fill='%23D1D5DB'/%3E%3Ccircle cx='7' cy='7' r='2' fill='%23D1D5DB'/%3E%3Ccircle cx='7' cy='12' r='2' fill='%23D1D5DB'/%3E%3Ccircle cx='12' cy='2' r='2' fill='%23D1D5DB'/%3E%3Ccircle cx='12' cy='7' r='2' fill='%23D1D5DB'/%3E%3Ccircle cx='12' cy='12' r='2' fill='%23D1D5DB'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: 8px center;
          background-size: 14px;
          padding-left: 28px;
        }
        
        .widget-header:active {
          cursor: grabbing;
        }
        
        .widget-controls button {
          background-color: #f3f4f6;
          border-radius: 4px;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .widget-controls button:hover {
          background-color: #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default DraggableDashboard; 