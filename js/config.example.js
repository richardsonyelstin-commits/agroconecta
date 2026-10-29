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
  // OPCIÓN 1 (RECOMENDADA SI DESPLIEGAS EN VERCEL):
  // La clave se guarda directamente en Vercel Dashboard -> Settings -> Environment Variables
  // Nombre: MODEL_API_KEY
  // Valor: tu_clave_secreta_de_meta
  // La ruta serverless '/api/chat' se activa automáticamente en Vercel.
  AGROBOT_PROXY_URL: '/api/chat',

  // OPCIÓN 2 (SI PREFIERES USAR SUPABASE EDGE FUNCTIONS):
  // Si deseas centralizar la IA en Supabase en vez de Vercel:
  // supabase secrets set MODEL_API_KEY="tu_clave_secreta"
  // supabase functions deploy agrobot-chat --no-verify-jwt
  // AGROBOT_PROXY_URL: 'https://ldtblrixpwigcwawpluh.supabase.co/functions/v1/agrobot-chat',

  // OPCIÓN 3 (DIRECTA PARA DESARROLLO LOCAL AISLADO):
  // Si no usas proxy, puedes colocar tu API key en js/config.js (protegido por .gitignore).
  LLM_API_KEY: 'TU_MODEL_API_KEY_AQUI',
  LLM_ENDPOINT: 'https://api.meta.ai/v1/responses',
  LLM_MODEL: 'muse-spark-1.3-contributor'
};
