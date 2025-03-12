import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: "noreply@sneakerlost.com",
      maxAge: 24 * 60 * 60, // 24 horas
      async sendVerificationRequest({ identifier: email, url }) {
        // Verificar dominio
        if (!email.endsWith("@sneakerlost.com")) {
          throw new Error("Solo se permiten correos con dominio sneakerlost.com");
        }
        
        // Enviar email personalizado
        await fetch("/api/send-verification-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, url }),
        });
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email;
      return email?.endsWith("@sneakerlost.com") || false;
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 