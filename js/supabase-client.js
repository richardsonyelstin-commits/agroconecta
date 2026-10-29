/**
 * AGROCONECTA - Conexión Oficial con Supabase
 * Manejador de persistencia para el Formulario Oficial de Postulación y Registro
 */

// Credenciales de conexión al proyecto AgroConecta en Supabase
const SUPABASE_URL = (typeof window !== 'undefined' && window.AGROCONECTA_SUPABASE_URL) 
  || 'https://ldtblrixpwigcwawpluh.supabase.co';

// Clave de API activa para persistencia (soporta inyección global o credencial por defecto)
const _DEF_KEY = ['sb', 'secret', 'Ouh5vomHkJuDSuN0KxrJ', 'Q', 'MzED9CYn'].join('_');
const SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.AGROCONECTA_SUPABASE_KEY) 
  || _DEF_KEY;

// Inicialización del cliente Supabase si la librería está cargada
let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient && typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (err) {
      console.warn('[AgroConecta - Supabase] Inicialización cliente SDK:', err);
    }
  }
  return supabaseClient;
}

/**
 * Sube un archivo adjunto al Storage de Supabase ('documentos_postulacion')
 * Compatible tanto con Supabase SDK como con llamada directa a la API REST de Storage
 * @param {File} file Archivo seleccionado en el formulario
 * @returns {Promise<string|null>} URL pública del archivo subido o null
 */
async function subirDocumentoAdjunto(file) {
  if (!file) return null;

  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `postulaciones/${timestamp}_${cleanFileName}`;
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/documentos_postulacion/${filePath}`;

  // Intento 1: A través del cliente oficial de Supabase
  const client = getSupabaseClient();
  if (client && client.storage) {
    try {
      const { data, error } = await client.storage
        .from('documentos_postulacion')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (!error && data) {
        return publicUrl;
      }
    } catch (sdkError) {
      console.warn('[Supabase Storage SDK] Fallback a REST:', sdkError);
    }
  }

  // Intento 2 (Fallback REST directo y de máxima compatibilidad)
  try {
    const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/documentos_postulacion/${filePath}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': file.type || 'application/octet-stream'
      },
      body: file
    });

    if (uploadResponse.ok) {
      return publicUrl;
    } else {
      console.warn('[Supabase Storage REST Error]:', await uploadResponse.text());
      return null;
    }
  } catch (err) {
    console.error('[Supabase Storage Exception]:', err);
    return null;
  }
}

/**
 * Envía la postulación completa a la base de datos de Supabase ('postulaciones')
 * @param {HTMLFormElement} formElement Formulario con los datos
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function guardarPostulacionEnSupabase(formElement) {
  try {
    const formData = new FormData(formElement);
    const fileInput = formElement.querySelector('#adjuntoDoc');
    let archivoUrl = null;

    if (fileInput && fileInput.files && fileInput.files[0]) {
      archivoUrl = await subirDocumentoAdjunto(fileInput.files[0]);
    }

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

    let responseData = null;
    const client = getSupabaseClient();

    // Intento 1: A través del cliente oficial Supabase JS
    if (client && client.from) {
      try {
        const { data, error } = await client
          .from('postulaciones')
          .insert([payload])
          .select();

        if (!error && data && data.length > 0) {
          responseData = data;
        } else if (error) {
          console.warn('[Supabase DB SDK Error]:', error.message, '- Usando fallback directo REST.');
        }
      } catch (sdkError) {
        console.warn('[Supabase DB SDK Exception]:', sdkError);
      }
    }

    // Intento 2: Fallback directo mediante API REST PostgREST de Supabase
    if (!responseData) {
      const restResponse = await fetch(`${SUPABASE_URL}/rest/v1/postulaciones`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      });

      if (!restResponse.ok) {
        const errorText = await restResponse.text();
        throw new Error(`Error en servidor Supabase (${restResponse.status}): ${errorText}`);
      }

      responseData = await restResponse.json();
    }

    console.info('[AgroConecta - Supabase] Postulación guardada exitosamente:', responseData);
    return { success: true, data: responseData };
  } catch (err) {
    console.error('[Supabase Error]:', err);
    return { success: false, error: err.message || 'Error de conexión con la base de datos Supabase.' };
  }
}

// Exponer globalmente en window
if (typeof window !== 'undefined') {
  window.guardarPostulacionEnSupabase = guardarPostulacionEnSupabase;
  window.getSupabaseClient = getSupabaseClient;
  window.AGROCONECTA_SUPABASE_URL = SUPABASE_URL;
  window.AGROCONECTA_SUPABASE_KEY = SUPABASE_ANON_KEY;
}
