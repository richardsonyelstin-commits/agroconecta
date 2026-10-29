/**
 * AGROCONECTA - Plantilla de Configuración Segura de Entorno
 * 
 * GUÍA DE SEGURIDAD Y MEJORES PRÁCTICAS:
 * -----------------------------------------------------------------------------
 * 1. NUNCA expongas la 'Secret Key' (service_role / sb_secret_...) en el frontend.
 *    La clave de servicio tiene permisos administrativos totales y elude RLS.
 * 2. En el navegador (lado cliente), utiliza ÚNICAMENTE la 'Anon Public Key'
 *    (generalmente inicia con 'eyJ...' o 'sb_publishable_...').
 * 3. La 'Anon Key' combinada con las políticas de Row Level Security (RLS)
 *    de Supabase garantiza que los visitantes solo puedan INSERTAR sus postulaciones,
 *    impidiendo que lean, alteren o eliminen datos de otros usuarios.
 * 4. Para desarrollo local o despliegue personalizado:
 *    - Duplica este archivo y nómbralo 'config.js' dentro de la carpeta 'js/'.
 *    - El archivo 'js/config.js' está excluido por .gitignore y NUNCA se sube a GitHub.
 * -----------------------------------------------------------------------------
 */

window.AGROCONECTA_CONFIG = {
  // URL base de tu proyecto en Supabase (ejemplo: https://xyz.supabase.co)
  SUPABASE_URL: 'https://ldtblrixpwigcwawpluh.supabase.co',

  // Clave Pública 'anon' (Publishable Key) obtenida en Supabase Dashboard -> Settings -> API
  // NUNCA coloques una clave que comience con 'sb_secret_' o el 'service_role' aquí.
  SUPABASE_ANON_KEY: 'TU_SUPABASE_ANON_PUBLIC_KEY_AQUI',

  // (Opcional) Si decides utilizar una función Serverless o API backend intermedia para máxima seguridad:
  BACKEND_API_URL: '', // Ejemplo: 'https://tu-api.agroconecta.pe/api/postulacion'

  // ==============================================================================
  // PROTOCOLO ESTRICTO DE SEGURIDAD - CONFIGURACIÓN DE IA (AGROBOT)
  // Modelo: Meta Muse Spark 1.3 Contributor (https://api.meta.ai/v1/responses)
  // ==============================================================================
  //
  // OPCIÓN 1 (RECOMENDADA - PROTOCOLO ESTRICTO DE SEGURIDAD):
  // Usar la Edge Function de Supabase como proxy seguro.
  // Tu MODEL_API_KEY se almacena únicamente en Supabase Secrets (en la nube)
  // y NUNCA se expone en el navegador del usuario ni en las herramientas de desarrollador (F12).
  // Comando para guardar la clave en el servidor:
  // supabase secrets set MODEL_API_KEY="tu_clave_secreta"
  // supabase functions deploy agrobot-chat --no-verify-jwt
  AGROBOT_PROXY_URL: 'https://ldtblrixpwigcwawpluh.supabase.co/functions/v1/agrobot-chat',

  // OPCIÓN 2 (DIRECTA PARA DESARROLLO LOCAL AISLADO):
  // Si no usas proxy, puedes colocar tu API key aquí (en js/config.js, que está protegido por .gitignore).
  // Nota: Llamar a api.meta.ai directamente desde el navegador puede requerir habilitar CORS.
  LLM_API_KEY: 'TU_MODEL_API_KEY_AQUI',
  LLM_ENDPOINT: 'https://api.meta.ai/v1/responses',
  LLM_MODEL: 'muse-spark-1.3-contributor'
};
