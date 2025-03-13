import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Forzar modo dinámico para evitar problemas con la caché
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };