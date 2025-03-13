"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

type Recommendation = {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  category: "email" | "social" | "events" | "content" | "other";
};

export default function ConversionRecommendations() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const recommendations: Recommendation[] = [
    {
      id: "1",
      title: "Segmentar campañas de email por región",
      description: "Personalizar las campañas de email según la región del contacto para aumentar la relevancia y mejorar las tasas de conversión.",
      impact: "high",
      effort: "medium",
      category: "email",
    },
    {
      id: "2",
      title: "Implementar recordatorios de cuotas pendientes",
      description: "Enviar recordatorios automáticos a afiliados con cuotas pendientes para reducir la tasa de abandono.",
      impact: "medium",
      effort: "low",
      category: "email",
    },
    {
      id: "3",
      title: "Optimizar formularios de captación",
      description: "Simplificar los formularios de captación para reducir la fricción y aumentar las conversiones iniciales.",
      impact: "high",
      effort: "low",
      category: "content",
    },
    {
      id: "4",
      title: "Crear campañas específicas para regiones con baja conversión",
      description: "Desarrollar campañas específicas para las regiones con tasas de conversión por debajo del promedio.",
      impact: "high",
      effort: "high",
      category: "content",
    },
    {
      id: "5",
      title: "Implementar programa de referidos",
      description: "Crear un programa de incentivos para que afiliados actuales refieran a nuevos simpatizantes.",
      impact: "medium",
      effort: "medium",
      category: "other",
    },
    {
      id: "6",
      title: "Aumentar frecuencia de eventos presenciales",
      description: "Organizar más eventos presenciales en regiones con alto potencial de crecimiento.",
      impact: "high",
      effort: "high",
      category: "events",
    },
  ];
  
  const filteredRecommendations = selectedCategory === "all" 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory);
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "email": return "Email";
      case "social": return "Redes Sociales";
      case "events": return "Eventos";
      case "content": return "Contenido";
      case "other": return "Otros";
      default: return category;
    }
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Recomendaciones para Mejorar Conversión</CardTitle>
        <div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las categorías</option>
            <option value="email">Email</option>
            <option value="social">Redes Sociales</option>
            <option value="events">Eventos</option>
            <option value="content">Contenido</option>
            <option value="other">Otros</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((rec) => (
              <div key={rec.id} className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{rec.title}</h3>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getImpactColor(rec.impact)}`}>
                      Impacto: {rec.impact === "high" ? "Alto" : rec.impact === "medium" ? "Medio" : "Bajo"}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getEffortColor(rec.effort)}`}>
                      Esfuerzo: {rec.effort === "high" ? "Alto" : rec.effort === "medium" ? "Medio" : "Bajo"}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{rec.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Categoría: {getCategoryLabel(rec.category)}</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Ver detalles
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay recomendaciones disponibles para la categoría seleccionada.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 