"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  gridArea?: string;
  width?: number;
  height?: number;
}

// Interfaz para las props del componente
interface DraggableDashboardProps {
  isLoading?: boolean;
  error?: string | null;
}

// Componente para un widget individual
const SortableWidget = ({ 
  widget, 
  onSizeChange,
  onResize,
  onMinimize,
  onMaximize,
  onClose
}: { 
  widget: Widget, 
  onSizeChange: (id: string) => void,
  onResize: (id: string, width: number, height: number) => void,
  onMinimize: (id: string) => void,
  onMaximize: (id: string) => void,
  onClose: (id: string) => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const resizeStartPos = useRef<{ x: number, y: number } | null>(null);
  const originalSize = useRef<{ width: number, height: number } | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    gridArea: widget.gridArea,
    width: isMaximized ? '100%' : (widget.width ? `${widget.width}px` : '100%'),
    height: isMaximized ? '100%' : (isMinimized ? '50px' : (widget.height ? `${widget.height}px` : '100%')),
    position: 'relative' as const,
  };

  // Determinar el tamaño del widget
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 row-span-2',
    large: 'col-span-2 row-span-2',
  };

  // Manejar el inicio del redimensionamiento
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMaximized || isMinimized) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (widgetRef.current) {
      resizeStartPos.current = { x: e.clientX, y: e.clientY };
      originalSize.current = { 
        width: widgetRef.current.offsetWidth, 
        height: widgetRef.current.offsetHeight 
      };
      
      // Agregar listeners para el movimiento y fin del redimensionamiento
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      
      // Cambiar el cursor durante el redimensionamiento
      document.body.style.cursor = 'nwse-resize';
      document.body.style.userSelect = 'none';
    }
  };

  // Manejar el movimiento durante el redimensionamiento
  const handleResizeMove = (e: MouseEvent) => {
    if (resizeStartPos.current && originalSize.current && widgetRef.current) {
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;
      
      const newWidth = Math.max(200, originalSize.current.width + deltaX);
      const newHeight = Math.max(150, originalSize.current.height + deltaY);
      
      widgetRef.current.style.width = `${newWidth}px`;
      widgetRef.current.style.height = `${newHeight}px`;
    }
  };

  // Manejar el fin del redimensionamiento
  const handleResizeEnd = () => {
    if (resizeStartPos.current && originalSize.current && widgetRef.current) {
      onResize(
        widget.id, 
        widgetRef.current.offsetWidth, 
        widgetRef.current.offsetHeight
      );
      
      // Limpiar
      resizeStartPos.current = null;
      originalSize.current = null;
      
      // Restaurar el cursor
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Eliminar listeners
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    }
  };

  // Manejar minimizar
  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
    setIsMaximized(false);
    onMinimize(widget.id);
  };

  // Manejar maximizar
  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMaximized(!isMaximized);
    setIsMinimized(false);
    onMaximize(widget.id);
  };

  // Manejar cerrar
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(widget.id);
  };

  // Renderizar el contenido del widget según su tipo
  const renderWidgetContent = () => {
    if (isMinimized) return null;
    
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
      ref={(node) => {
        setNodeRef(node);
        if (node) widgetRef.current = node;
      }}
      style={style}
      className={`dashboard-widget ${sizeClasses[widget.size]} transition-all duration-200 border border-gray-200 rounded-lg overflow-hidden shadow-lg`}
    >
      <div className="widget-container h-full">
        <div 
          className="widget-header flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <h3 className="text-lg font-semibold truncate">{widget.title}</h3>
          <div className="widget-controls flex space-x-2">
            <button 
              className="p-1 text-white hover:bg-blue-400 rounded-full transition-colors"
              title="Minimizar"
              onClick={handleMinimize}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button 
              className="p-1 text-white hover:bg-blue-400 rounded-full transition-colors"
              title={isMaximized ? "Restaurar" : "Maximizar"}
              onClick={handleMaximize}
            >
              {isMaximized ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="5" width="14" height="14" rx="2" ry="2"></rect>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
              )}
            </button>
            <button 
              className="p-1 text-white hover:bg-red-500 rounded-full transition-colors"
              title="Cerrar"
              onClick={handleClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        {!isMinimized && (
          <div className="widget-content p-4 bg-white overflow-auto flex-grow">
            {renderWidgetContent()}
          </div>
        )}
        {!isMinimized && !isMaximized && (
          <div 
            className="resize-handle"
            onMouseDown={handleResizeStart}
          />
        )}
      </div>
    </div>
  );
};

// Componente principal del dashboard
const DraggableDashboard: React.FC<DraggableDashboardProps> = ({ isLoading = false, error = null }) => {
  // Definir los widgets disponibles
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'kpi-overview', type: 'kpi-overview', title: 'Resumen General', size: 'large', gridArea: '1 / 1 / 2 / 3' },
    { id: 'regional-distribution', type: 'regional-distribution', title: 'Distribución Regional', size: 'medium', gridArea: '1 / 3 / 2 / 4' },
    { id: 'donation-analytics', type: 'donation-analytics', title: 'Análisis de Donaciones', size: 'medium', gridArea: '2 / 1 / 3 / 2' },
    { id: 'campaign-effectiveness', type: 'campaign-effectiveness', title: 'Efectividad de Campañas', size: 'large', gridArea: '2 / 2 / 3 / 4' },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [gridLayout, setGridLayout] = useState({
    columns: 3,
    rows: 2
  });

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
        
        // Intercambiar también las áreas de grid
        const newItems = arrayMove(items, oldIndex, newIndex);
        const oldItem = items[oldIndex];
        const swapItem = items[newIndex];
        
        if (oldItem.gridArea && swapItem.gridArea) {
          const tempArea = oldItem.gridArea;
          newItems[newIndex].gridArea = swapItem.gridArea;
          newItems[oldIndex].gridArea = tempArea;
        }
        
        return newItems;
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

  // Función para redimensionar un widget
  const handleResize = (id: string, width: number, height: number) => {
    setWidgets((items) =>
      items.map((item) => {
        if (item.id === id) {
          return { ...item, width, height };
        }
        return item;
      })
    );
  };

  // Función para restablecer el diseño predeterminado
  const resetLayout = () => {
    setWidgets([
      { id: 'kpi-overview', type: 'kpi-overview', title: 'Resumen General', size: 'large', gridArea: '1 / 1 / 2 / 3' },
      { id: 'regional-distribution', type: 'regional-distribution', title: 'Distribución Regional', size: 'medium', gridArea: '1 / 3 / 2 / 4' },
      { id: 'donation-analytics', type: 'donation-analytics', title: 'Análisis de Donaciones', size: 'medium', gridArea: '2 / 1 / 3 / 2' },
      { id: 'campaign-effectiveness', type: 'campaign-effectiveness', title: 'Efectividad de Campañas', size: 'large', gridArea: '2 / 2 / 3 / 4' },
    ]);
    localStorage.removeItem('dashboardLayout');
  };

  // Función para minimizar un widget
  const minimizeWidget = (id: string) => {
    console.log(`Widget ${id} minimizado`);
    // Aquí puedes implementar la lógica para minimizar
  };

  // Función para maximizar un widget
  const maximizeWidget = (id: string) => {
    console.log(`Widget ${id} maximizado`);
    // Aquí puedes implementar la lógica para maximizar
  };

  // Función para cerrar un widget
  const closeWidget = (id: string) => {
    setWidgets((items) => items.filter(item => item.id !== id));
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 info-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Arrastra los widgets por su barra de título para reorganizarlos. Haz clic en el icono de redimensionar para cambiar su tamaño o arrastra la esquina inferior derecha.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div 
          className="grid gap-4"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridLayout.columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridLayout.rows}, auto)`,
            gridAutoFlow: 'dense'
          }}
        >
          <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
            {widgets.map((widget) => (
              <SortableWidget 
                key={widget.id} 
                widget={widget} 
                onSizeChange={changeWidgetSize}
                onResize={handleResize}
                onMinimize={minimizeWidget}
                onMaximize={maximizeWidget}
                onClose={closeWidget}
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
    </div>
  );
};

export default DraggableDashboard; 