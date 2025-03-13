import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Verificar cookie de acceso
  const dashboardAccess = request.cookies.get("dashboard-access");
  
  // Rutas protegidas que requieren autenticación
  const protectedPaths = [
    "/dashboard",
    "/api/analytics",
    "/api/metrics-recommendations",
    "/api/schemas",
  ];
  
  // Verificar si la ruta actual está protegida
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  // Si es una ruta protegida y no tiene la cookie de acceso, redirigir a la página principal
  if (isProtectedPath && !dashboardAccess) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/analytics/:path*",
    "/api/metrics-recommendations/:path*",
    "/api/schemas/:path*",
  ],
}; 