# Configurar los servicios

El formulario y el chat funcionan sin servicios remotos. Esta configuración solo hace falta para guardar postulaciones o conectar el chat a un proveedor.

## Base de datos y archivos

Ejecutar `supabase/schema.sql` en un entorno de prueba. El archivo crea las tablas, las políticas de acceso, el bucket privado y las cuotas de uso. Puede ejecutarse de nuevo sin borrar las solicitudes existentes.

Las restricciones `NOT VALID` comprueban las nuevas escrituras. Antes de validarlas sobre registros antiguos, revisar esos datos. Si el proyecto remoto tiene políticas adicionales, también hay que revisarlas; el esquema solo reemplaza las políticas que nombra.

Desplegar las funciones de `supabase/functions/` con Supabase CLI. `supabase/config.toml` permite solicitudes públicas a esas funciones; cada endpoint aplica su validación, control de origen y cuota.

Configurar estas variables en el servidor:

| Variable                               | Uso                                                 |
| -------------------------------------- | --------------------------------------------------- |
| `SUPABASE_URL`                         | Dirección del proyecto                              |
| `SUPABASE_SERVICE_ROLE_KEY`            | Escritura y acceso administrativo desde el servidor |
| `RATE_LIMIT_SALT`                      | Secreto aleatorio para las cuotas por dirección IP  |
| `ALLOWED_ORIGINS`                      | Orígenes adicionales exactos, separados por comas   |
| `MODEL_API_KEY` o `META_MODEL_API_KEY` | Credencial del proveedor de chat, si se utiliza     |

Supabase proporciona sus variables reservadas dentro de las Edge Functions. En Vercel hay que configurar las variables necesarias por separado. Para pruebas locales se puede añadir `http://127.0.0.1:5500` a `ALLOWED_ORIGINS`.

## Activar el formulario

En `js/config.public.js`, cambiar `DEMO_MODE` a `false` y completar `BACKEND_API_URL` con la dirección del endpoint `postulaciones` ya desplegado. Si falta esa dirección, el formulario informa del error y conserva los datos.

El servidor valida los campos y los adjuntos. Admite PDF, PNG y JPEG de hasta 10 MB; comprueba extensión, MIME y firma del archivo. Una subida fallida detiene el registro. Si falla la escritura de la solicitud, intenta retirar el adjunto recién subido.

La base de datos genera la referencia UUID. Los documentos guardan una ruta privada, no una URL pública. Una cuenta administradora necesita `app_metadata.role = admin`, asignado desde administración o servidor. Un usuario autenticado común no puede listar solicitudes ni documentos.

Para descargar un documento se usa una sesión administrativa autorizada o una URL firmada temporal. El bucket debe seguir siendo privado. El proyecto no implementa envío de correos.

## Activar el chat remoto

Completar `AGROBOT_PROXY_URL` en la configuración pública. Se puede usar `api/chat.js` en Vercel o la función `agrobot-chat` de Supabase. Las instrucciones y credenciales del proveedor quedan en el servidor. Con la dirección vacía, el chat mantiene sus respuestas locales.

Las cuotas se guardan en Postgres para que no dependan de la memoria de una instancia. Si falla ese servicio, el proxy no consulta al proveedor. Las cabeceras de IP deben venir del gateway de confianza.

## Estado de la entrega

Las pruebas locales usan servicios simulados. Falta aplicar y comprobar el esquema y las funciones en el proyecto remoto antes de activar el registro persistente. El proveedor de chat tampoco se ha probado con credenciales reales.
