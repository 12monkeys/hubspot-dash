import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Indicar que esta ruta es dinámica
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token');
    
    console.log('Verificando cookie de autenticación:', authCookie?.value ? 'Presente' : 'Ausente');
    
    // Si no hay cookie, devolver no autorizado
    if (!authCookie?.value) {
      return NextResponse.json({ authorized: false }, { status: 401 });
    }
    
    try {
      // Verificar el token JWT
      const decoded = jwt.verify(
        authCookie.value, 
        process.env.NEXTAUTH_SECRET || 'default-secret'
      );
      
      console.log('Token verificado con éxito:', decoded);
      
      // Devolver autorizado
      return NextResponse.json({ 
        authorized: true,
        user: decoded
      });
    } catch (jwtError) {
      console.error('Error al verificar JWT:', jwtError);
      return NextResponse.json({ authorized: false, error: 'Token inválido' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error en check-access:', error);
    return NextResponse.json({ authorized: false, error: 'Error interno' }, { status: 500 });
  }
} 