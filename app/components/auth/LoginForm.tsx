"use client";

import React, { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Error en la solicitud");
      } else {
        setMensaje(data.message);
      }
    } catch (err) {
      setError("Error al realizar la solicitud. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
        Acceso al Dashboard de Inteligencia de Negocio
      </h2>

      <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">
          <span role="img" aria-label="info">ℹ️</span> Instrucciones de acceso
        </h3>
        <ol className="list-decimal pl-5 text-sm">
          <li className="mb-2">Introduce tu correo electrónico corporativo (@sneakerlost.com)</li>
          <li className="mb-2">Recibirás un enlace de confirmación en tu email</li>
          <li className="mb-2">Haz clic en el enlace para verificar tu acceso</li>
          <li>Regresa a esta página y recárgala para acceder al dashboard</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu.correo@sneakerlost.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Solo se permiten correos del dominio @sneakerlost.com
          </p>
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Enviando..." : "Solicitar acceso"}
        </button>
      </form>

      {mensaje && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-md">
          <p className="font-medium">✅ {mensaje}</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">
          <p className="font-medium">❌ {error}</p>
        </div>
      )}
    </div>
  );
} 