/**
 * AGROCONECTA - Conexión Segura con Supabase / Backend API
 * Manejador de persistencia para el Formulario Oficial de Postulación y Registro
 * 
 * MEJORES PRÁCTICAS DE SEGURIDAD IMPLEMENTADAS:
 * 1. Cero credenciales hardcodeadas en el código fuente versionado.
 * 2. Carga dinámica desde window.AGROCONECTA_CONFIG (js/config.js protegido por .gitignore).
 * 3. Detección y advertencia activa si se intenta usar una Secret Key administrativa en el frontend.
 * 4. Soporte nativo para backend proxy o funciones serverless (arquitectura de máxima seguridad).
 * 5. Sanitización de nombres de archivo y validación de tipos para almacenamiento seguro.
 */

// Obtener configuración desde el entorno o archivo local
function obtenerConfiguracion() {
  const cfg = (typeof window !== 'undefined' && window.AGROCONECTA_CONFIG) || {};
  return {
    url: (window.AGROCONECTA_SUPABASE_URL || cfg.SUPABASE_URL || '').trim().replace(/\/+$/, ''),
    key: (window.AGROCONECTA_SUPABASE_KEY || cfg.SUPABASE_ANON_KEY || '').trim(),
    backendApi: (window.AGROCONECTA_BACKEND_API || cfg.BACKEND_API_URL || '').trim()
  };
}

// Inicialización del cliente Supabase SDK si la librería está disponible
let supabaseClient = null;

function getSupabaseClient() {
  const { url, key } = obtenerConfiguracion();

  if (!supabaseClient && typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    if (!url || !key || key.includes('TU_SUPABASE_ANON_PUBLIC_KEY')) {
      return null;
    }

    // Auditoría de seguridad preventiva en tiempo de ejecución
    if (key.toLowerCase().includes('secret') || key.toLowerCase().includes('service_role')) {
      console.warn(
        '%c[AgroConecta - Alerta de Seguridad]%c Se ha detectado una clave privada administrativa en el cliente.\n' +
        'Recomendación: En producción reemplázala por la "Anon Public Key" para respetar las políticas de RLS y proteger tus datos.',
        'color: #ff9800; font-weight: bold;',
        'color: inherit;'
      );
    }

    try {
      supabaseClient = window.supabase.createClient(url, key);
    } catch (err) {
      console.warn('[AgroConecta] Error inicializando Supabase SDK, se usará el conector REST directo:', err.message);
    }
  }
  return supabaseClient;
}

/**
 * Sube un archivo adjunto al Storage ('documentos_postulacion')
 * @param {File} file Archivo seleccionado en el formulario
 * @returns {Promise<string|null>} URL pública del documento o null
 */
async function subirDocumentoAdjunto(file) {
  if (!file) return null;

  // Validación de seguridad de tamaño (máximo 10 MB)
  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('El archivo adjunto excede el límite permitido de 10 MB.');
  }

  const { url, key } = obtenerConfiguracion();
  if (!url || !key) return null;

  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `postulaciones/${timestamp}_${cleanFileName}`;
  const publicUrl = `${url}/storage/v1/object/public/documentos_postulacion/${filePath}`;

  // Método 1: Supabase JS Client
  const client = getSupabaseClient();
  if (client && client.storage) {
    try {
      const { data, error } = await client.storage
        .from('documentos_postulacion')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (!error && data) return publicUrl;
    } catch (sdkError) {
      console.warn('[Storage SDK Fallback]:', sdkError.message);
    }
  }

  // Método 2: Petición REST directa a Storage API
  try {
    const uploadResponse = await fetch(`${url}/storage/v1/object/documentos_postulacion/${filePath}`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': file.type || 'application/octet-stream'
      },
      body: file
    });

    if (uploadResponse.ok) {
      return publicUrl;
    }
  } catch (err) {
    console.error('[Storage Error]:', err);
  }

  return null;
}

/**
 * Envía la postulación completa a la base de datos o backend configurado
 * @param {HTMLFormElement} formElement Formulario con los datos ingresados
 * @returns {Promise<{success: boolean, data?: any, error?: string, demo?: boolean}>}
 */
async function guardarPostulacionEnSupabase(formElement) {
  try {
    const config = obtenerConfiguracion();
    const formData = new FormData(formElement);
    const fileInput = formElement.querySelector('#adjuntoDoc');
    let archivoUrl = null;

    if (fileInput && fileInput.files && fileInput.files[0]) {
      archivoUrl = await subirDocumentoAdjunto(fileInput.files[0]);
    }

    // Normalización y tipado de datos antes del envío
    const payload = {
      nombre_completo: (formData.get('nombreCompleto') || '').toString().trim(),
      dni_ruc: (formData.get('dniRuc') || '').toString().trim(),
      correo: (formData.get('correo') || '').toString().trim(),
      telefono: (formData.get('telefono') || '').toString().trim(),
      fecha_nacimiento: formData.get('fechaNacimiento') || null,
      rol_usuario: formData.get('rolUsuario') || 'productor',
      region_valle: formData.get('regionValle') || '',
      cultivo_interes: (formData.get('cultivoInteres') || '').toString().trim(),
      hectareas: parseFloat(formData.get('hectareas')) || 0,
      monto_estimado: parseFloat(formData.get('montoEstimado')) || 0,
      duracion_campana: parseInt(formData.get('duracionCampana'), 10) || 6,
      archivo_url: archivoUrl,
      mensaje_detallado: (formData.get('mensajeDetallado') || '').toString().trim() || null,
      acepto_terminos: formElement.querySelector('#aceptoTerminos')?.checked || false,
      boletin_noticias: formElement.querySelector('#boletinNoticias')?.checked || false,
      estado: 'pendiente'
    };

    // OPCIÓN A: Envío a través de Backend Proxy seguro (Cero claves en frontend)
    if (config.backendApi) {
      const proxyResponse = await fetch(config.backendApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!proxyResponse.ok) {
        throw new Error(`Error en el servidor proxy (${proxyResponse.status})`);
      }

      const proxyData = await proxyResponse.json();
      return { success: true, data: proxyData };
    }

    // OPCIÓN B: Conexión directa a Supabase
    if (!config.url || !config.key || config.key.includes('TU_SUPABASE_ANON_PUBLIC_KEY')) {
      console.info(
        '[AgroConecta - Modo Demostración] Configuración de Supabase no detectada.\n' +
        'Para activar la persistencia real, define tus credenciales seguras en js/config.js siguiendo js/config.example.js.'
      );
      return { success: true, demo: true };
    }

    let responseData = null;
    const client = getSupabaseClient();

    // Intento 1: Supabase JS Client
    if (client && client.from) {
      try {
        const { data, error } = await client
          .from('postulaciones')
          .insert([payload])
          .select();

        if (!error && data && data.length > 0) {
          responseData = data;
        } else if (error) {
          console.warn('[Supabase DB SDK Error]:', error.message, '- Ejecutando conector REST.');
        }
      } catch (sdkError) {
        console.warn('[Supabase DB SDK Exception]:', sdkError);
      }
    }

    // Intento 2: Conector directo REST PostgREST
    if (!responseData) {
      const restResponse = await fetch(`${config.url}/rest/v1/postulaciones`, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      });

      if (!restResponse.ok) {
        const errorText = await restResponse.text();
        throw new Error(`Error en Supabase (${restResponse.status}): ${errorText}`);
      }

      responseData = await restResponse.json();
    }

    console.info('[AgroConecta - Supabase] Registro guardado con éxito:', responseData);
    return { success: true, data: responseData };
  } catch (err) {
    console.error('[AgroConecta Error]:', err);
    return { success: false, error: err.message || 'Error al procesar la solicitud con la base de datos.' };
  }
}

// Exponer funciones globales para main.js
if (typeof window !== 'undefined') {
  window.guardarPostulacionEnSupabase = guardarPostulacionEnSupabase;
  window.getSupabaseClient = getSupabaseClient;
  window.obtenerConfiguracionAgroConecta = obtenerConfiguracion;
}
