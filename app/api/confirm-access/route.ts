import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Forzar que esta ruta siempre sea dinámica y no se cachee
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    console.log("=== Iniciando proceso de confirmación de acceso en modo DEBUG ===");
    console.log("URL de la solicitud:", request.url);
    console.log("Entorno:", process.env.NODE_ENV);
    console.log("Variables de entorno:", {
      MONGODB_URI: !!process.env.MONGODB_URI,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    });
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    console.log("Parámetros recibidos:", { 
      email, 
      token,
      url: request.url
    });

    // Versión super simplificada para depuración
    return new Response(
      `<!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Modo Depuración</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
          .debug { color: #2962ff; }
          pre { text-align: left; background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto; }
          .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="debug">Modo Depuración - Confirmación de Acceso</h2>
          <p>Parámetros recibidos:</p>
          <pre>
Email: ${email || 'No proporcionado'}
Token: ${token ? token.substring(0, 5) + '...' : 'No proporcionado'}
          </pre>
          <p>Esta es una versión simplificada para depurar el problema.</p>
          <a href="/" class="button">Volver a Inicio</a>
        </div>
      </body>
      </html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      }
    );
  } catch (error) {
    console.error("Error general en la ruta de depuración:", error);
    
    return new Response(
      `<!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Error en Depuración</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
          .error { color: #d32f2f; }
          pre { text-align: left; background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto; }
          .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="error">Error en Modo Depuración</h2>
          <p>Detalles del error:</p>
          <pre>
${error instanceof Error ? error.stack || error.message : String(error)}
          </pre>
          <a href="/" class="button">Volver a Inicio</a>
        </div>
      </body>
      </html>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      }
    );
  }
} 