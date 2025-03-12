"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!email.endsWith("@sneakerlost.com")) {
      setError("Solo se permiten correos con dominio sneakerlost.com");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signIn("email", {
        email,
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        window.location.href = "/auth/verify";
      }
    } catch (err) {
      setError("Error al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <Image src="/logo.png" alt="Logo" width={150} height={50} className="mx-auto" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Dashboard de Inteligencia de Negocio
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Acceso exclusivo para usuarios de sneakerlost.com
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="tu.nombre@sneakerlost.com"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? "Procesando..." : "Iniciar sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 