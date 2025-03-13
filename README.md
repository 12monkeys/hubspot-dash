# Dashboard de Inteligencia de Negocio

Este proyecto es un dashboard de inteligencia de negocio para visualizar métricas y análisis de datos de HubSpot.

## Características

- Autenticación basada en correo electrónico con dominio específico (@sneakerlost.com)
- Visualización de métricas generales
- Distribución regional de datos
- Análisis de cuotas y tendencias
- Interfaz moderna y responsiva

## Tecnologías

- Next.js 14 (App Router)
- MongoDB para almacenamiento de tokens
- Tailwind CSS para estilos
- Nodemailer para envío de correos
- Vercel para despliegue

## Configuración

### Variables de entorno

El proyecto requiere las siguientes variables de entorno:

```
# Base URL
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com

# MongoDB
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/hubspot-dash

# Email
EMAIL_SERVER=smtp://usuario:contraseña@smtp.proveedor.com:587
EMAIL_FROM=noreply@tudominio.com
EMAIL_USER=usuario
EMAIL_PASSWORD=contraseña
EMAIL_HOST=smtp.proveedor.com
EMAIL_PORT=587
```

### Desarrollo local

1. Clona el repositorio
2. Instala las dependencias:
   ```
   npm install
   ```
3. Configura las variables de entorno en un archivo `.env.local`
4. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```

### Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en la configuración del proyecto en Vercel
3. Despliega el proyecto

## Flujo de autenticación

1. El usuario ingresa su correo electrónico en la página principal
2. Si el dominio es válido (@sneakerlost.com), se envía un correo con un enlace de confirmación
3. Al hacer clic en el enlace, se establece una cookie de acceso
4. El usuario es redirigido al dashboard

## Estructura del proyecto

- `/app`: Componentes y rutas de la aplicación
- `/components`: Componentes reutilizables
- `/lib`: Utilidades y configuraciones
- `/public`: Archivos estáticos
- `/types`: Definiciones de tipos TypeScript

## Endpoints API

- `/api/request-access`: Solicitar acceso al dashboard
- `/api/confirm-access`: Confirmar acceso mediante token
- `/api/check-access`: Verificar si el usuario tiene acceso
- `/api/dashboard`: Obtener datos del dashboard

## Mantenimiento

### MongoDB

Para el mantenimiento de la base de datos MongoDB:

1. Los tokens de verificación se almacenan en la colección `verification-tokens`
2. Los tokens caducan automáticamente después de 1 hora
3. Se recomienda configurar un índice TTL en MongoDB para eliminar automáticamente los tokens caducados

### Correo electrónico

Para el servicio de correo electrónico en producción, se recomienda:

1. Usar un servicio como Resend, SendGrid o Amazon SES
2. Configurar correctamente los registros SPF y DKIM para mejorar la entregabilidad
3. Monitorear las tasas de entrega y rebote

## Licencia

Este proyecto es propiedad de Sneakerlost y su uso está restringido a personal autorizado. 