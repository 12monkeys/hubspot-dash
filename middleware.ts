import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Verificar dominio de email
    const token = req.nextauth.token;
    if (token?.email && !token.email.endsWith("@sneakerlost.com")) {
      return NextResponse.redirect(new URL("/auth/error", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
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