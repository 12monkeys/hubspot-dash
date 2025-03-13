import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const accessCookie = cookieStore.get("dashboard-access");

    if (!accessCookie || !accessCookie.value) {
      return NextResponse.json({ authorized: false }, { status: 403 });
    }

    // Si la cookie existe, el usuario está autorizado
    return NextResponse.json({ 
      authorized: true,
      email: accessCookie.value
    });
  } catch (error) {
    console.error("Error al verificar el acceso:", error);
    return NextResponse.json(
      { error: "Error al verificar el acceso. Por favor, inténtalo de nuevo más tarde." },
      { status: 500 }
    );
  }
} 