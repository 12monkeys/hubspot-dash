import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getToken, deleteToken } from "@/lib/tokens";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email y token son obligatorios para confirmar el acceso." },
        { status: 400 }
      );
    }

    // Verificar el token en MongoDB
    try {
      const isValid = await getToken(email, token);
      
      if (!isValid) {
        return NextResponse.json(
          { error: "El enlace ha expirado o no es válido. Por favor, solicita un nuevo enlace." },
          { status: 403 }
        );
      }

      // Eliminar el token usado
      await deleteToken(email);
      console.log("Token eliminado correctamente");
    } catch (dbError) {
      console.error("Error al verificar el token:", dbError);
      return NextResponse.json(
        { error: "Error al verificar el acceso. Por favor, inténtalo de nuevo más tarde." },
        { status: 500 }
      );
    }

    // Establecer cookie de acceso
    const cookieStore = cookies();
    cookieStore.set("dashboard-access", email, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Redireccionar a la página principal
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return new Response(null, {
      status: 302,
      headers: {
        Location: baseUrl,
      },
    });
  } catch (error) {
    console.error("Error general en el endpoint de confirmación:", error);
    return NextResponse.json(
      { error: "Error al procesar la confirmación. Por favor, inténtalo de nuevo más tarde." },
      { status: 500 }
    );
  }
} 