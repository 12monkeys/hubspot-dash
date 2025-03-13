import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export default withAuth(
  function middleware(req) {
    // Verificar dominio de email
    const token = req.nextauth.token;
    if (token?.email && !token.email.endsWith("@sneakerlost.com")) {
      return NextResponse.redirect(new URL("/auth/error", req.url));
    }

    // Verificar cookie de acceso
    const cookieStore = cookies();
    const accessVerified = cookieStore.get("accessVerified");
    if (!accessVerified || accessVerified.value !== "true") {
      // Si no tiene la cookie pero sí tiene token, permitir acceso
      if (token) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Permitir acceso si tiene token o cookie
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/analytics/:path*",
    "/api/metrics-recommendations/:path*",
    "/api/schemas/:path*",
  ],
}; 