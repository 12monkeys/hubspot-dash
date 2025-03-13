import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({ to, subject, text }: EmailOptions) {
  const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER || '');

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@sneakerlost.com',
    to,
    subject,
    text,
  });
} 