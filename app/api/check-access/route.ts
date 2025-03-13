import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = cookies();
    const accessVerified = cookieStore.get("accessVerified");
    
    console.log("Cookie de acceso verificado:", accessVerified ? accessVerified.value : "No encontrada");

    if (accessVerified && accessVerified.value === "true") {
      return NextResponse.json({ verified: true });
    }

    // Proporcionar más información sobre por qué no está verificado
    return NextResponse.json({ 
      verified: false, 
      reason: "Cookie de acceso no encontrada o no válida",
      cookieExists: !!accessVerified,
      cookieValue: accessVerified ? accessVerified.value : null
    }, { status: 403 });
  } catch (error) {
    console.error("Error al verificar el acceso:", error);
    return NextResponse.json({ 
      verified: false, 
      error: "Error al verificar el acceso",
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 