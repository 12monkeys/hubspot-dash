import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

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
    
    // Guardar el token en la base de datos
    await prisma.verificationToken.create({
      data: {
        identifier: emailLower,
        token,
        expires: new Date(Date.now() + 3600000), // 1 hora
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const confirmationLink = `${baseUrl}/api/confirm-access?email=${encodeURIComponent(emailLower)}&token=${token}`;

    // Configurar el transporte de correo
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Enviar el correo
    await transporter.sendMail({
      from: `"Dashboard de Inteligencia de Negocio" <${process.env.EMAIL_USER}>`,
      to: emailLower,
      subject: "Confirma tu acceso al Dashboard de Inteligencia de Negocio",
      text: `
Hola,

Has solicitado acceso al Dashboard de Inteligencia de Negocio. Para confirmar tu acceso, haz clic en el siguiente enlace:

${confirmationLink}

Este enlace es válido por 1 hora. Después de hacer clic en el enlace, regresa a la página original y recárgala para ver el dashboard.

Saludos,
Equipo de Análisis
      `,
      html: `
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
      `,
    });

    return NextResponse.json({ 
      message: "✉️ Se ha enviado un enlace de confirmación a tu correo. Por favor, revisa tu bandeja de entrada (incluyendo la carpeta de spam) y sigue las instrucciones para acceder al dashboard." 
    });
  } catch (error) {
    console.error("Error enviando email:", error);
    return NextResponse.json({ 
      error: "No se pudo enviar el correo de confirmación. Por favor, inténtalo de nuevo más tarde o contacta con soporte."
    }, { status: 500 });
  }
} 