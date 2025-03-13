import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const token = url.searchParams.get("token");
    
    if (!email || !token) {
      return new Response(
        `
        <html>
        <head>
          <title>Error de Confirmación</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
            .error { color: #d32f2f; }
            .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">Error de Confirmación</h2>
            <p>No se han proporcionado todos los parámetros necesarios para confirmar el acceso.</p>
            <p>Por favor, inténtalo de nuevo o contacta con soporte.</p>
            <a href="/" class="button">Volver a Inicio</a>
          </div>
        </body>
        </html>
        `,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }

    // Buscar el token en la base de datos
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email.toLowerCase(),
        token,
        expires: {
          gt: new Date(),
        },
      },
    });
    
    if (!verificationToken) {
      return new Response(
        `
        <html>
        <head>
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
        </html>
        `,
        {
          status: 403,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }

    // Eliminar el token para que no se pueda reutilizar
    await prisma.verificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    });
    
    // Crear una respuesta con la cookie
    const response = new Response(
      `
      <html>
      <head>
        <title>Acceso Confirmado</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
          .success { color: #2e7d32; }
          .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
          .steps { margin: 20px 0; text-align: left; display: inline-block; }
          .step { margin-bottom: 10px; }
        </style>
        <script>
          // Script para establecer la cookie en el cliente
          document.cookie = "accessVerified=true; max-age=31536000; path=/; SameSite=Strict; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}";
          
          // Redirigir a la página principal después de 3 segundos
          setTimeout(function() {
            window.location.href = "/";
          }, 3000);
        </script>
      </head>
      <body>
        <div class="container">
          <h2 class="success">✅ Acceso Confirmado</h2>
          <p>Tu acceso al Dashboard de Inteligencia de Negocio ha sido verificado correctamente.</p>
          
          <div class="steps">
            <div class="step">1. Serás redirigido automáticamente a la página principal en 3 segundos</div>
            <div class="step">2. Si no eres redirigido, haz clic en el botón de abajo</div>
          </div>
          
          <a href="/" class="button">Ir a la Página Principal</a>
        </div>
      </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          "Set-Cookie": `accessVerified=true; Max-Age=31536000; Path=/; SameSite=Strict; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error confirmando acceso:", error);
    return new Response(
      `
      <html>
      <head>
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
      </html>
      `,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }
} 