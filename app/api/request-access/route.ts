import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { setToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";

// Indicar que esta ruta es dinámica
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "El email es obligatorio para continuar." },
        { status: 400 }
      );
    }

    const allowedDomains = ["@sneakerlost.com"];
    const emailLower = email.toLowerCase();
    
    if (!allowedDomains.some((domain) => emailLower.endsWith(domain))) {
      return NextResponse.json(
        { error: "Solo se permiten correos corporativos de @sneakerlost.com." },
        { status: 403 }
      );
    }

    // Generar un token único
    const token = nanoid();
    
    // Guardar el token en MongoDB
    try {
      await setToken(emailLower, token);
      console.log("Token guardado en la base de datos correctamente");
    } catch (dbError) {
      console.error("Error al guardar el token en la base de datos:", dbError);
      return NextResponse.json({ 
        error: "Error al procesar la solicitud. Por favor, inténtalo de nuevo más tarde.",
        details: process.env.NODE_ENV === 'development' ? dbError : undefined
      }, { status: 500 });
    }

    // Asegurarnos de usar la URL correcta según el entorno
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_BASE_URL no está configurada");
      return NextResponse.json({ 
        error: "Error de configuración del servidor. Por favor, contacta con soporte.",
      }, { status: 500 });
    }
    
    console.log("URL base para el enlace de confirmación:", baseUrl);
    const confirmationLink = `${baseUrl}/api/confirm-access?email=${encodeURIComponent(emailLower)}&token=${token}`;

    // Contenido del correo
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4285F4; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f8f9fa; border: 1px solid #dee2e6; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4285F4; color: white; 
              text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
    .footer { margin-top: 20px; font-size: 12px; color: #6c757d; border-top: 1px solid #dee2e6; padding-top: 20px; }
    .steps { margin: 20px 0; }
    .step { margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Confirmación de Acceso</h2>
    </div>
    <div class="content">
      <p>Hola,</p>
      <p>Has solicitado acceso al <strong>Dashboard de Inteligencia de Negocio</strong>. Para confirmar tu acceso, sigue estos pasos:</p>
      
      <div class="steps">
        <div class="step">1. Haz clic en el botón "Confirmar Acceso" a continuación</div>
        <div class="step">2. Regresa a la página original del dashboard</div>
        <div class="step">3. Recarga la página para ver el dashboard</div>
      </div>
      
      <a href="${confirmationLink}" class="button">Confirmar Acceso</a>
      
      <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
      <p style="word-break: break-all; background-color: #f1f1f1; padding: 10px; font-size: 14px;">
        ${confirmationLink}
      </p>
      
      <p><strong>Nota:</strong> Este enlace es válido por 1 hora.</p>
    </div>
    <div class="footer">
      <p>Este correo fue enviado porque se solicitó acceso al Dashboard de Inteligencia de Negocio. Si no fuiste tú, puedes ignorar este mensaje.</p>
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `
Hola,

Has solicitado acceso al Dashboard de Inteligencia de Negocio. Para confirmar tu acceso, haz clic en el siguiente enlace:

${confirmationLink}

Este enlace es válido por 1 hora. Después de hacer clic en el enlace, regresa a la página original y recárgala para ver el dashboard.

Saludos,
Equipo de Análisis
    `;

    // Enviar el correo usando nuestra función mejorada
    try {
      console.log("Intentando enviar correo a:", emailLower);
      console.log("URL de confirmación:", confirmationLink);
      console.log("Configuración de correo:", {
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM,
        user: process.env.EMAIL_USER,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL
      });
      
      await sendEmail({
        to: emailLower,
        subject: "Confirma tu acceso al Dashboard de Inteligencia de Negocio",
        text: textContent,
        html: htmlContent,
      });
      console.log("Correo enviado correctamente");
    } catch (error: any) {
      console.error("Error detallado al enviar el correo:", error);
      
      // Intentar obtener información de configuración para depuración
      const emailConfig = {
        server: process.env.EMAIL_SERVER ? "Configurado" : "No configurado",
        from: process.env.EMAIL_FROM ? "Configurado" : "No configurado",
        user: process.env.EMAIL_USER ? "Configurado" : "No configurado",
        password: process.env.EMAIL_PASSWORD ? "Configurado (longitud: " + (process.env.EMAIL_PASSWORD?.length || 0) + ")" : "No configurado",
        host: process.env.EMAIL_HOST ? "Configurado" : "No configurado",
        port: process.env.EMAIL_PORT ? "Configurado" : "No configurado",
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "No configurado"
      };
      
      console.log("Configuración de correo:", emailConfig);
      
      return NextResponse.json({ 
        error: "No se pudo enviar el correo de confirmación. Por favor, inténtalo de nuevo más tarde o contacta con soporte.",
        details: process.env.NODE_ENV === 'development' ? { message: error.message, config: emailConfig } : undefined
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "✉️ Se ha enviado un enlace de confirmación a tu correo. Por favor, revisa tu bandeja de entrada (incluyendo la carpeta de spam) y sigue las instrucciones para acceder al dashboard." 
    });
  } catch (error) {
    console.error("Error general en el endpoint:", error);
    return NextResponse.json({ 
      error: "No se pudo procesar la solicitud. Por favor, inténtalo de nuevo más tarde o contacta con soporte.",
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 