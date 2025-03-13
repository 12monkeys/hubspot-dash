import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({ to, subject, text }: EmailOptions) {
  // Si estamos usando una cadena de conexión completa, usamos esa
  if (process.env.EMAIL_SERVER && process.env.EMAIL_SERVER.includes('://')) {
    const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'carlosguerrerodiaz@sneakerlost.com',
      to,
      subject,
      text,
    });
  } else {
    // Configuración manual para Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER || 'carlosguerrerodiaz@sneakerlost.com',
        pass: process.env.EMAIL_PASSWORD || 'Sp13lb3rg',
      },
      tls: {
        rejectUnauthorized: false // Permite conexiones a servidores con certificados autofirmados
      }
    });
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'carlosguerrerodiaz@sneakerlost.com',
      to,
      subject,
      text,
    });
  }
} 