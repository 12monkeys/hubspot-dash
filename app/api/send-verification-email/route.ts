import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  const { email, url } = await request.json();
  
  // Configurar transportador de email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: '"Dashboard HubSpot BI" <noreply@sneakerlost.com>',
      to: email,
      subject: "Acceso al Dashboard de Inteligencia de Negocio",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Acceso al Dashboard de Inteligencia de Negocio</h2>
          <p>Has solicitado acceso al Dashboard de Business Intelligence para HubSpot.</p>
          <p>Haz clic en el siguiente enlace para confirmar tu email y acceder:</p>
          <p style="margin: 20px 0;">
            <a href="${url}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Verificar email y acceder
            </a>
          </p>
          <p>Este enlace expirará en 24 horas.</p>
          <p>Si no solicitaste este acceso, puedes ignorar este mensaje.</p>
        </div>
      `,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al enviar email:", error);
    return NextResponse.json({ error: "Error al enviar email de verificación" }, { status: 500 });
  }
} 