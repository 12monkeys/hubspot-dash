# Dashboard Político HubSpot

Este dashboard proporciona una visualización interactiva de los datos almacenados en HubSpot relacionados con afiliados, simpatizantes, donaciones y campañas de un partido político.

## Características

- Visualización de métricas clave (KPIs)
  - Total de afiliados y simpatizantes
  - Donaciones totales y promedio
  - Campañas activas
  - Tasa de conversión
- Distribución regional de afiliados y simpatizantes
- Integración con HubSpot API
- Interfaz moderna y responsive

## Requisitos Previos

- Node.js 18.x o superior
- Cuenta de HubSpot con acceso API
- Cuenta de AWS (para manejo seguro de secretos)

## Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd hubspot-dash
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
- Copiar el archivo `.env.example` a `.env.local`
- Rellenar las variables con los valores correspondientes:
  - `HUBSPOT_ACCESS_TOKEN`: Token de acceso de HubSpot
  - `AWS_REGION`: Región de AWS
  - `AWS_ACCESS_KEY_ID`: ID de clave de acceso de AWS
  - `AWS_SECRET_ACCESS_KEY`: Clave secreta de AWS
  - `AWS_SECRET_NAME`: Nombre del secreto en AWS Secrets Manager

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Uso

El dashboard se actualizará automáticamente cada vez que se cargue la página, mostrando los datos más recientes de HubSpot. Los datos visualizados incluyen:

- Métricas generales en la parte superior
- Gráfico de distribución regional
- Indicadores de crecimiento y conversión

## Configuración de HubSpot

Para que el dashboard funcione correctamente, asegúrese de tener configurados en HubSpot:

1. Propiedades personalizadas para contactos:
   - `tipo_contacto`: Tipo enumerado (Afiliado/Simpatizante)
   - `fecha_afiliacion`: Fecha
   - `region`: Texto
   - `total_donaciones`: Número

2. Objeto personalizado para donaciones con las propiedades:
   - `amount`: Número
   - `date`: Fecha
   - `contact_id`: Referencia a contacto
   - `campaign`: Texto
   - `payment_method`: Texto

3. Objeto personalizado para campañas con las propiedades:
   - `name`: Texto
   - `start_date`: Fecha
   - `end_date`: Fecha
   - `status`: Tipo enumerado (active/completed/planned)
   - `type`: Texto
   - `budget`: Número
   - `results`: Texto

## Seguridad

- Las credenciales de API se manejan de forma segura a través de AWS Secrets Manager
- Los tokens de acceso nunca se exponen en el frontend
- Se implementan mejores prácticas de seguridad para el manejo de datos sensibles

## Contribuir

1. Fork del repositorio
2. Crear una rama para la nueva funcionalidad
3. Commit de los cambios
4. Push a la rama
5. Crear un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

# HubSpot Dashboard

Dashboard de inteligencia de negocio para visualizar y analizar datos de HubSpot.

## Configuración del Entorno

### Variables de Entorno

El proyecto utiliza variables de entorno para la configuración. Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_clave_secreta_larga_y_aleatoria

# Email
EMAIL_SERVER=smtp://usuario:contraseña@smtp.ejemplo.com:587
EMAIL_FROM=tu@email.com
EMAIL_USER=usuario
EMAIL_PASSWORD=contraseña
EMAIL_HOST=smtp.ejemplo.com
EMAIL_PORT=587

# Prisma
DATABASE_URL="file:./dev.db"

# HubSpot
HUBSPOT_ACCESS_TOKEN=tu_token_de_hubspot
```

### Configuración de Correo Electrónico

Para que el sistema de autenticación funcione correctamente, necesitas configurar un servidor SMTP para el envío de correos electrónicos. Tienes varias opciones:

#### 1. Gmail

Para usar Gmail, necesitas una "contraseña de aplicación" si tienes verificación en dos pasos habilitada:

1. Ve a [Contraseñas de aplicación](https://myaccount.google.com/apppasswords)
2. Selecciona "Otra" como aplicación y dale un nombre (por ejemplo, "HubSpot Dashboard")
3. Usa la contraseña generada en tu configuración:

```
EMAIL_SERVER=smtp://tu_correo@gmail.com:tu_contraseña_de_aplicacion@smtp.gmail.com:587
EMAIL_FROM=tu_correo@gmail.com
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

#### 2. Servicios de Correo Transaccional

Para entornos de producción, se recomienda usar servicios como:

- **SendGrid**:
  ```
  EMAIL_SERVER=smtp://apikey:TU_API_KEY@smtp.sendgrid.net:587
  EMAIL_FROM=tu_correo_verificado@dominio.com
  EMAIL_USER=apikey
  EMAIL_PASSWORD=TU_API_KEY
  EMAIL_HOST=smtp.sendgrid.net
  EMAIL_PORT=587
  ```

- **Mailgun**:
  ```
  EMAIL_SERVER=smtp://postmaster@tu_dominio.mailgun.org:TU_PASSWORD@smtp.mailgun.org:587
  EMAIL_FROM=tu_correo@dominio.com
  EMAIL_USER=postmaster@tu_dominio.mailgun.org
  EMAIL_PASSWORD=TU_PASSWORD
  EMAIL_HOST=smtp.mailgun.org
  EMAIL_PORT=587
  ```

- **Resend** (recomendado para Vercel):
  ```
  EMAIL_SERVER=smtp://resend:re_123456789@smtp.resend.com:587
  EMAIL_FROM=tu_correo@dominio.com
  EMAIL_USER=resend
  EMAIL_PASSWORD=re_123456789
  EMAIL_HOST=smtp.resend.com
  EMAIL_PORT=587
  ```

#### 3. Para Desarrollo Local

Para desarrollo local, puedes usar [Ethereal](https://ethereal.email) o [MailHog](https://github.com/mailhog/MailHog):

```
EMAIL_SERVER=smtp://user:pass@localhost:1025
EMAIL_FROM=test@example.com
EMAIL_USER=user
EMAIL_PASSWORD=pass
EMAIL_HOST=localhost
EMAIL_PORT=1025
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Generar el cliente de Prisma
npx prisma generate

# Iniciar el servidor de desarrollo
npm run dev
```

## Producción

```bash
# Construir la aplicación
npm run build

# Iniciar el servidor de producción
npm start
```

## Despliegue en Vercel

Este proyecto está configurado para desplegarse en Vercel. Asegúrate de configurar las variables de entorno en el panel de control de Vercel.
