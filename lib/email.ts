import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    let transporter;
    
    // Si estamos usando una cadena de conexión completa, usamos esa
    if (process.env.EMAIL_SERVER && process.env.EMAIL_SERVER.includes('://')) {
      console.log('Usando configuración de servidor de correo desde EMAIL_SERVER');
      transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);
    } else {
      // Configuración manual para el servidor SMTP
      console.log('Usando configuración manual de servidor SMTP');
      
      // Determinar el host y puerto basado en el servicio
      let host = 'smtp.sendgrid.net';
      let port = 587;
      
      if (process.env.EMAIL_HOST) {
        host = process.env.EMAIL_HOST;
      }
      
      if (process.env.EMAIL_PORT) {
        port = parseInt(process.env.EMAIL_PORT, 10);
      }
      
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      });
    }
    
    // Verificar la conexión antes de enviar
    try {
      await transporter.verify();
      console.log('Conexión al servidor SMTP verificada correctamente');
    } catch (verifyError) {
      console.error('Error al verificar la conexión SMTP:', verifyError);
      // Continuamos de todos modos, ya que algunos proveedores no soportan verify
    }
    
    // Enviar el correo
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    
    console.log('Correo enviado correctamente:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw new Error(`Error al enviar el correo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
} 