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
