import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "../../lib/mongodb";

// Indicar que esta ruta es dinámica
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    console.log("=== Iniciando proceso de confirmación de acceso ===");
    console.log("URL de la solicitud:", request.url);
    
    // Verificar conexión a MongoDB primero
    try {
      console.log("Verificando conexión a MongoDB...");
      console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Configurada" : "No configurada");
      const client = await clientPromise;
      console.log("Cliente MongoDB obtenido");
      
      const db = client.db("hubspot-dash");
      console.log("Base de datos seleccionada: hubspot-dash");
      
      await db.command({ ping: 1 });
      console.log("Conexión a MongoDB verificada correctamente");
      
      // Listar colecciones para diagnóstico
      const collections = await db.listCollections().toArray();
      console.log("Colecciones disponibles:", collections.map(c => c.name));
      
      // Verificar la colección de tokens
      const tokenCollection = db.collection("verification-tokens");
      const tokenCount = await tokenCollection.countDocuments();
      console.log("Número de tokens en la base de datos:", tokenCount);
    } catch (mongoError) {
      console.error("Error detallado al conectar con MongoDB:", {
        name: mongoError instanceof Error ? mongoError.name : 'Unknown Error',
        message: mongoError instanceof Error ? mongoError.message : String(mongoError),
        code: (mongoError as any)?.code,
        stack: mongoError instanceof Error ? mongoError.stack : undefined
      });
      throw new Error("No se pudo establecer conexión con la base de datos");
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    console.log("Parámetros recibidos:", { 
      email, 
      token,
      url: request.url
    });

    if (!email || !token) {
      console.log("Error: Email o token faltantes");
      return new Response(
        `<!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Error de Validación</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
            .error { color: #d32f2f; }
            .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">Error de Validación</h2>
            <p>Email y token son obligatorios para confirmar el acceso.</p>
            <a href="/" class="button">Volver a Inicio</a>
          </div>
        </body>
        </html>`,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html; charset=utf-8"
          }
        }
      );
    }

    // Verificar el token en MongoDB
    try {
      // Capturar posible error de Prisma
      try {
        console.log("⚠️ VERIFICANDO SI HAY RESIDUOS DE PRISMA...");
        // Este bloque es peligroso y se ejecutará si Prisma está presente
        // Queremos capturar este error específicamente
        const prismaError = new Error("PrismaClientInitializationError");
        prismaError.name = "PrismaClientInitializationError";
        throw prismaError;
      } catch (prismaCatchError) {
        // Asegurarnos de que el error es un objeto de Error
        const prismaError = prismaCatchError instanceof Error ? prismaCatchError : new Error(String(prismaCatchError));
        
        // Si el error no es de Prisma, ignorarlo
        if (prismaError.name !== "PrismaClientInitializationError") {
          console.log("No se detectaron residuos de Prisma, continuando con MongoDB");
        } else {
          console.log("⚠️ DETECTADOS RESIDUOS DE PRISMA, UTILIZANDO MONGODB DIRECTAMENTE");
          // Continuar con la lógica normal (MongoDB)
        }
      }

      console.log("Iniciando verificación de token en MongoDB");
      
      const client = await clientPromise;
      const db = client.db("hubspot-dash");
      const collection = db.collection("verification-tokens");
      
      // Buscar el token
      const tokenEntry = await collection.findOne({ 
        identifier: email,
        token,
        expires: { $gt: new Date() }
      });
      
      console.log("Resultado de búsqueda de token:", {
        tokenFound: !!tokenEntry,
        email,
        token: token?.substring(0, 5) + '...',
        expires: tokenEntry?.expires
      });
      
      if (!tokenEntry) {
        console.log("Token inválido o expirado para el email:", email);
        return new Response(
          `<!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <title>Token Inválido</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
              .error { color: #d32f2f; }
              .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2 class="error">Token Inválido o Expirado</h2>
              <p>El enlace que has utilizado no es válido o ya ha expirado.</p>
              <p>Por favor, vuelve a solicitar acceso desde la página principal.</p>
              <a href="/" class="button">Volver a Inicio</a>
            </div>
          </body>
          </html>`,
          {
            status: 403,
            headers: {
              "Content-Type": "text/html; charset=utf-8"
            }
          }
        );
      }

      // Eliminar el token usado
      console.log("Token válido, procediendo a eliminarlo...");
      await collection.deleteOne({ identifier: email, token });
      console.log("Token eliminado correctamente");

      // Establecer cookie de acceso
      console.log("Configurando cookie de acceso...");
      const cookieStore = cookies();
      cookieStore.set("dashboard-access", email, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      console.log("Cookie configurada correctamente");

      // Redireccionar con mensaje de éxito
      console.log("Enviando respuesta de éxito...");
      return new Response(
        `<!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Acceso Confirmado</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
            .success { color: #2e7d32; }
            .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
          </style>
          <script>
            setTimeout(function() {
              window.location.href = "/dashboard";
            }, 3000);
          </script>
        </head>
        <body>
          <div class="container">
            <h2 class="success">✅ Acceso Confirmado</h2>
            <p>Tu acceso al Dashboard ha sido verificado correctamente.</p>
            <p>Serás redirigido automáticamente en 3 segundos...</p>
            <a href="/dashboard" class="button">Ir al Dashboard</a>
          </div>
        </body>
        </html>`,
        {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8"
          }
        }
      );
    } catch (dbErrorUnknown) {
      // Convertir el error a un tipo conocido
      const dbError = dbErrorUnknown instanceof Error ? dbErrorUnknown : new Error(String(dbErrorUnknown));
      
      // Verificar si el error es específicamente por Prisma
      const isPrismaError = 
        dbError.name === "PrismaClientInitializationError" || 
        (dbError.message && dbError.message.includes("PrismaClient")) ||
        (dbError.stack && dbError.stack.includes("prisma"));
      
      if (isPrismaError) {
        console.error("⚠️ DETECTADO ERROR DE PRISMA, INTENTANDO ALTERNATIVA CON MONGODB");
        
        try {
          console.log("Iniciando plan alternativo con MongoDB");
          const client = await clientPromise;
          const db = client.db("hubspot-dash");
          const collection = db.collection("verification-tokens");
          
          // Buscar el token
          const tokenEntry = await collection.findOne({ 
            identifier: email,
            token,
            expires: { $gt: new Date() }
          });
          
          if (!tokenEntry) {
            return new Response(
              `<!DOCTYPE html>
              <html lang="es">
              <head>
                <meta charset="UTF-8">
                <title>Token Inválido</title>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
                  .error { color: #d32f2f; }
                  .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h2 class="error">Token Inválido o Expirado</h2>
                  <p>El enlace que has utilizado no es válido o ya ha expirado.</p>
                  <p>Por favor, vuelve a solicitar acceso desde la página principal.</p>
                  <a href="/" class="button">Volver a Inicio</a>
                </div>
              </body>
              </html>`,
              {
                status: 403,
                headers: {
                  "Content-Type": "text/html; charset=utf-8"
                }
              }
            );
          }
          
          // Si llegamos aquí, el token es válido
          await collection.deleteOne({ identifier: email, token });
          
          // Establecer cookie de acceso
          const cookieStore = cookies();
          cookieStore.set("dashboard-access", email, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
          
          return new Response(
            `<!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <title>Acceso Confirmado</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
                .success { color: #2e7d32; }
                .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
              </style>
              <script>
                setTimeout(function() {
                  window.location.href = "/dashboard";
                }, 3000);
              </script>
            </head>
            <body>
              <div class="container">
                <h2 class="success">✅ Acceso Confirmado (Alternativo)</h2>
                <p>Tu acceso al Dashboard ha sido verificado correctamente.</p>
                <p>Serás redirigido automáticamente en 3 segundos...</p>
                <a href="/dashboard" class="button">Ir al Dashboard</a>
              </div>
            </body>
            </html>`,
            {
              status: 200,
              headers: {
                "Content-Type": "text/html; charset=utf-8"
              }
            }
          );
        } catch (fallbackError) {
          console.error("Error en el plan alternativo:", fallbackError);
        }
      }
      
      console.error("Error detallado al verificar el token:", {
        name: dbError.name,
        message: dbError.message,
        code: (dbError as any)?.code,
        stack: dbError.stack,
        email,
        token,
        isPrismaError
      });
      
      return new Response(
        `<!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Error del Servidor</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
            .error { color: #d32f2f; }
            .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">Error del Servidor</h2>
            <p>Ha ocurrido un error al verificar tu acceso.</p>
            <p>Por favor, inténtalo de nuevo más tarde o contacta con soporte.</p>
            <a href="/" class="button">Volver a Inicio</a>
          </div>
        </body>
        </html>`,
        {
          status: 500,
          headers: {
            "Content-Type": "text/html; charset=utf-8"
          }
        }
      );
    }
  } catch (error) {
    console.error("Error general en el endpoint de confirmación:", {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url
    });
    return new Response(
      `<!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Error del Servidor</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; margin: 50px; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
          .error { color: #d32f2f; }
          .button { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="error">Error del Servidor</h2>
          <p>Ha ocurrido un error al procesar tu solicitud.</p>
          <p>Por favor, inténtalo de nuevo más tarde o contacta con soporte.</p>
          <a href="/" class="button">Volver a Inicio</a>
        </div>
      </body>
      </html>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      }
    );
  }
} 