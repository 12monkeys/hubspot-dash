import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getToken, deleteToken } from "@/lib/tokens";

// Indicar que esta ruta es dinámica
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    console.log("Iniciando proceso de confirmación de acceso");
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    console.log("Parámetros recibidos:", { email, token });

    if (!email || !token) {
      console.log("Error: Email o token faltantes");
      return new Response(
        `<!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Error de Validación</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
            .error { color: #d32f2f; }
            .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">Error de Validación</h2>
            <p>Email y token son obligatorios para confirmar el acceso.</p>
            <a href="/" class="button">Volver a Inicio</a>
          </div>
        </body>
        </html>`,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html; charset=utf-8"
          }
        }
      );
    }

    // Verificar el token en MongoDB
    try {
      console.log("Iniciando verificación de token en MongoDB");
      console.log("Intentando conectar a la base de datos...");
      
      const isValid = await getToken(email, token);
      console.log("Resultado de validación de token:", { isValid });
      
      if (!isValid) {
        console.log("Token inválido o expirado para el email:", email);
        return new Response(
          `<!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <title>Token Inválido</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
              .error { color: #d32f2f; }
              .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2 class="error">Token Inválido o Expirado</h2>
              <p>El enlace que has utilizado no es válido o ya ha expirado.</p>
              <p>Por favor, vuelve a solicitar acceso desde la página principal.</p>
              <a href="/" class="button">Volver a Inicio</a>
            </div>
          </body>
          </html>`,
          {
            status: 403,
            headers: {
              "Content-Type": "text/html; charset=utf-8"
            }
          }
        );
      }

      // Eliminar el token usado
      await deleteToken(email);
      console.log("Token eliminado correctamente");

      // Establecer cookie de acceso
      const cookieStore = cookies();
      cookieStore.set("dashboard-access", email, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // Redireccionar con mensaje de éxito
      return new Response(
        `<!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Acceso Confirmado</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
            .success { color: #2e7d32; }
            .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
          </style>
          <script>
            setTimeout(function() {
              window.location.href = "/";
            }, 3000);
          </script>
        </head>
        <body>
          <div class="container">
            <h2 class="success">✅ Acceso Confirmado</h2>
            <p>Tu acceso al Dashboard ha sido verificado correctamente.</p>
            <p>Serás redirigido automáticamente en 3 segundos...</p>
            <a href="/" class="button">Ir al Dashboard</a>
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
    } catch (dbError) {
      console.error("Error al verificar el token:", dbError);
      return new Response(
        `<!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Error del Servidor</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
            .error { color: #d32f2f; }
            .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">Error del Servidor</h2>
            <p>Ha ocurrido un error al verificar tu acceso.</p>
            <p>Por favor, inténtalo de nuevo más tarde o contacta con soporte.</p>
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
  } catch (error) {
    console.error("Error general en el endpoint de confirmación:", error);
    return new Response(
      `<!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Error del Servidor</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
          .error { color: #d32f2f; }
          .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="error">Error del Servidor</h2>
          <p>Ha ocurrido un error al procesar tu solicitud.</p>
          <p>Por favor, inténtalo de nuevo más tarde o contacta con soporte.</p>
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