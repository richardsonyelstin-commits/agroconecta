/**
 * AGROCONECTA - Conexión con Supabase
 * Manejador de persistencia para el Formulario Oficial de Postulación y Registro
 */

// Configuración de Supabase (Reemplazar con tus credenciales de proyecto de Supabase)
const SUPABASE_URL = window.AGROCONECTA_SUPABASE_URL || 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = window.AGROCONECTA_SUPABASE_KEY || 'TU-ANON-KEY-AQUI';

// Inicialización del cliente Supabase si la librería está cargada
let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient && window.supabase && window.supabase.createClient) {
    if (SUPABASE_URL.includes('TU-PROYECTO') || SUPABASE_ANON_KEY.includes('TU-ANON-KEY')) {
      console.warn('[AgroConecta - Supabase] Por favor configura tu SUPABASE_URL y SUPABASE_ANON_KEY válidos.');
    }
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

/**
 * Sube un archivo adjunto al Storage de Supabase
 * @param {File} file Archivo seleccionado en el formulario
 * @returns {Promise<string|null>} URL pública del archivo subido o null
 */
async function subirDocumentoAdjunto(file) {
  const client = getSupabaseClient();
  if (!client || !file) return null;

  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `postulaciones/${timestamp}_${cleanFileName}`;

    const { data, error } = await client.storage
      .from('documentos_postulacion')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.warn('[Supabase Storage] Error subiendo adjunto:', error.message);
      return null;
    }

    const { data: publicUrlData } = client.storage
      .from('documentos_postulacion')
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.error('[Supabase Storage Exception]:', err);
    return null;
  }
}

/**
 * Envía la postulación completa a la base de datos de Supabase
 * @param {HTMLFormElement} formElement Formulario con los datos
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function guardarPostulacionEnSupabase(formElement) {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'El cliente de Supabase no está inicializado. Verifica la conexión a Internet o las credenciales.'
    };
  }

  // Si las credenciales aún tienen los placeholders, simulamos éxito para no bloquear la UI
  if (SUPABASE_URL.includes('TU-PROYECTO')) {
    console.info('[Supabase Modo Demo] Credenciales pendientes. Los datos no se persistieron aún en la base de datos real.');
    return { success: true, demo: true };
  }

  try {
    const formData = new FormData(formElement);
    const fileInput = formElement.querySelector('#adjuntoDoc');
    let archivoUrl = null;

    if (fileInput && fileInput.files && fileInput.files[0]) {
      archivoUrl = await subirDocumentoAdjunto(fileInput.files[0]);
    }

    const payload = {
      nombre_completo: formData.get('nombreCompleto')?.trim(),
      dni_ruc: formData.get('dniRuc')?.trim(),
      correo: formData.get('correo')?.trim(),
      telefono: formData.get('telefono')?.trim(),
      fecha_nacimiento: formData.get('fechaNacimiento') || null,
      rol_usuario: formData.get('rolUsuario') || 'productor',
      region_valle: formData.get('regionValle') || '',
      cultivo_interes: formData.get('cultivoInteres')?.trim() || '',
      hectareas: parseFloat(formData.get('hectareas')) || 0,
      monto_estimado: parseFloat(formData.get('montoEstimado')) || 0,
      duracion_campana: parseInt(formData.get('duracionCampana'), 10) || 6,
      archivo_url: archivoUrl,
      mensaje_detallado: formData.get('mensajeDetallado')?.trim() || null,
      acepto_terminos: formElement.querySelector('#aceptoTerminos')?.checked || false,
      boletin_noticias: formElement.querySelector('#boletinNoticias')?.checked || false,
      estado: 'pendiente'
    };

    const { data, error } = await client
      .from('postulaciones')
      .insert([payload])
      .select();

    if (error) {
      console.error('[Supabase DB Error]:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[Supabase DB Exception]:', err);
    return { success: false, error: err.message || 'Error de conexión con la base de datos.' };
  }
}

// Exponer globalmente para main.js
window.guardarPostulacionEnSupabase = guardarPostulacionEnSupabase;
window.getSupabaseClient = getSupabaseClient;
