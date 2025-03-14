import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Bypass temporal para pruebas - ELIMINAR EN PRODUCCIÓN
export async function GET(request: Request) {
  try {
    // Extraer email de los parámetros de la URL
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    console.log('=== BYPASS DE VERIFICACIÓN ACTIVADO ===');
    console.log(`Acceso otorgado para: ${email}`);
    
    // Establecer cookie de acceso
    const cookieStore = cookies();
    
    // Generar JWT más completo para la cookie
    const token = jwt.sign(
      { 
        email, 
        authorized: true,
        name: email?.split('@')[0] || 'Usuario',
        role: 'user'
      },
      process.env.NEXTAUTH_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );
    
    // Establecer cookie
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
      sameSite: 'lax'
    });
    
    console.log('Cookie establecida correctamente');
    
    // Redirigir directamente al dashboard
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.url.split('/api')[0];
    const dashboardUrl = `${baseUrl}/dashboard`;
    
    console.log(`Redirigiendo a: ${dashboardUrl}`);
    
    return NextResponse.redirect(new URL(dashboardUrl));
  } catch (error) {
    console.error('Error en confirm-access bypass:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 
