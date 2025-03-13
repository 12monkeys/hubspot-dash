import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { User } from "next-auth";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM || "carlosguerrerodiaz@sneakerlost.com",
      maxAge: 24 * 60 * 60, // 24 horas
      async sendVerificationRequest({ identifier: email, url }) {
        // Verificar dominio
        if (!email.endsWith("@sneakerlost.com")) {
          throw new Error("Solo se permiten correos con dominio sneakerlost.com");
        }
        
        // Enviar email personalizado
        await sendEmail({
          to: email,
          subject: "Iniciar sesión en HubSpot Dashboard",
          text: `Haz clic en el siguiente enlace para iniciar sesión: ${url}`,
        });
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user }: { user: User }) {
      if (!user.email?.endsWith("@sneakerlost.com")) {
        return false;
      }
      return true;
    },
  },
};