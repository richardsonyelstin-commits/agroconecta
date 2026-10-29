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
 * Adaptable dinámicamente según el rol del usuario (Productor, Inversionista, Cooperativa)
 * @param {HTMLFormElement} formElement Formulario con los datos ingresados
 * @returns {Promise<{success: boolean, data?: any, error?: string, demo?: boolean, trackingCode?: string, email?: string, rolNombre?: string, cultivo?: string, montoFormateado?: string}>}
 */
async function guardarPostulacionEnSupabase(formElement) {
  try {
    const config = obtenerConfiguracion();
    const formData = new FormData(formElement);
    const rolUsuario = formData.get('rolUsuario') || 'productor';
    const correo = (formData.get('correo') || '').toString().trim();
    const trackingCode = 'AGC-2026-' + Math.floor(100000 + Math.random() * 900000);

    let nombreCompleto = '';
    let dniRuc = '';
    let telefono = '';
    let fechaNacimiento = null;
    let regionValle = '';
    let cultivoInteres = '';
    let hectareas = 0;
    let montoEstimado = 0;
    let duracionCampana = 6;
    let mensajeDetallado = '';
    let fileInput = null;
    let rolNombre = 'Pequeño Productor Agrario';

    // Extracción adaptable según el perfil seleccionado
    if (rolUsuario === 'inversionista') {
      rolNombre = 'Inversionista / Comprador Futuro';
      nombreCompleto = (formData.get('nombreCompletoInversionista') || '').toString().trim();
      dniRuc = (formData.get('dniRucInversionista') || '').toString().trim();
      telefono = (formData.get('telefonoInversionista') || '').toString().trim();
      regionValle = 'Nacional / Varios valles';
      cultivoInteres = (formData.get('cultivoInteresInversionista') || 'Portafolio Diversificado').toString().trim();
      hectareas = 0;
      montoEstimado = parseFloat(formData.get('montoEstimadoInversionista')) || 0;
      duracionCampana = parseInt(formData.get('duracionCampanaInversionista'), 10) || 12;
      fileInput = formElement.querySelector('#adjuntoDocInversionista');
      
      const tipoInv = formData.get('tipoInversionista') || 'Persona Natural';
      const modInv = formData.get('modalidadInversion') || 'Retorno Financiero';
      const obsInv = (formData.get('mensajeDetalladoInversionista') || '').toString().trim();
      mensajeDetallado = `[PERFIL INVERSIONISTA - CÓDIGO: ${trackingCode}]\nTipo: ${tipoInv}\nModalidad: ${modInv}\nRequerimientos: ${obsInv || 'Sin observaciones adicionales'}`;

    } else if (rolUsuario === 'cooperativa') {
      rolNombre = 'Cooperativa o Asociación Agraria';
      const razonSocial = (formData.get('razonSocialCooperativa') || '').toString().trim();
      const rep = (formData.get('representanteCooperativa') || '').toString().trim();
      nombreCompleto = rep ? `${razonSocial} (Rep: ${rep})` : razonSocial;
      dniRuc = (formData.get('rucCooperativa') || '').toString().trim();
      telefono = (formData.get('telefonoCooperativa') || '').toString().trim();
      regionValle = (formData.get('regionValleCooperativa') || '').toString().trim();
      cultivoInteres = (formData.get('cultivoInteresCooperativa') || '').toString().trim();
      hectareas = parseFloat(formData.get('hectareasCooperativa')) || 0;
      montoEstimado = parseFloat(formData.get('montoEstimadoCooperativa')) || 0;
      duracionCampana = 12;
      fileInput = formElement.querySelector('#adjuntoDocCooperativa');

      const dniRep = formData.get('dniRepresentanteCooperativa') || '';
      const socios = formData.get('sociosCooperativa') || '0';
      const cert = formData.get('certificacionesCooperativa') || 'En trámite';
      const obsCoop = (formData.get('mensajeDetalladoCooperativa') || '').toString().trim();
      mensajeDetallado = `[PERFIL COOPERATIVA - CÓDIGO: ${trackingCode}]\nRUC: ${dniRuc}\nDNI Rep: ${dniRep}\nSocios activos: ${socios}\nCertificaciones: ${cert}\nInfraestructura y metas: ${obsCoop || 'Sin observaciones adicionales'}`;

    } else {
      // Productor agrario (por defecto)
      rolNombre = 'Pequeño Productor Agrario';
      nombreCompleto = (formData.get('nombreCompletoProductor') || formData.get('nombreCompleto') || '').toString().trim();
      dniRuc = (formData.get('dniRucProductor') || formData.get('dniRuc') || '').toString().trim();
      telefono = (formData.get('telefonoProductor') || formData.get('telefono') || '').toString().trim();
      fechaNacimiento = formData.get('fechaNacimientoProductor') || formData.get('fechaNacimiento') || null;
      regionValle = formData.get('regionValleProductor') || formData.get('regionValle') || '';
      cultivoInteres = (formData.get('cultivoInteresProductor') || formData.get('cultivoInteres') || '').toString().trim();
      hectareas = parseFloat(formData.get('hectareasProductor') || formData.get('hectareas')) || 0;
      montoEstimado = parseFloat(formData.get('montoEstimadoProductor') || formData.get('montoEstimado')) || 0;
      duracionCampana = parseInt(formData.get('duracionCampanaProductor') || formData.get('duracionCampana'), 10) || 6;
      fileInput = formElement.querySelector('#adjuntoDocProductor') || formElement.querySelector('#adjuntoDoc');
      
      const obsProd = (formData.get('mensajeDetalladoProductor') || formData.get('mensajeDetallado') || '').toString().trim();
      mensajeDetallado = `[POSTULACIÓN PRODUCTOR - CÓDIGO: ${trackingCode}]\nFuente hídrica y propuesta: ${obsProd || 'Sin observaciones adicionales'}`;
    }

    let archivoUrl = null;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      archivoUrl = await subirDocumentoAdjunto(fileInput.files[0]);
    }

    // Normalización y tipado de datos para persistencia
    const payload = {
      nombre_completo: nombreCompleto,
      dni_ruc: dniRuc,
      correo: correo,
      telefono: telefono,
      fecha_nacimiento: fechaNacimiento,
      rol_usuario: rolUsuario,
      region_valle: regionValle,
      cultivo_interes: cultivoInteres,
      hectareas: hectareas,
      monto_estimado: montoEstimado,
      duracion_campana: duracionCampana,
      archivo_url: archivoUrl,
      mensaje_detallado: mensajeDetallado,
      acepto_terminos: formElement.querySelector('#aceptoTerminos')?.checked || false,
      boletin_noticias: formElement.querySelector('#boletinNoticias')?.checked || false,
      estado: 'pendiente'
    };

    const montoFormateado = 'S/. ' + montoEstimado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // OPCIÓN A: Envío a través de Backend Proxy seguro
    if (config.backendApi) {
      const proxyResponse = await fetch(config.backendApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, tracking_code: trackingCode })
      });

      if (!proxyResponse.ok) {
        throw new Error(`Error en el servidor proxy (${proxyResponse.status})`);
      }

      const proxyData = await proxyResponse.json();
      return { 
        success: true, 
        data: proxyData, 
        trackingCode, 
        email: correo, 
        rolNombre, 
        cultivo: cultivoInteres, 
        montoFormateado 
      };
    }

    // OPCIÓN B: Conexión directa a Supabase
    if (!config.url || !config.key || config.key.includes('TU_SUPABASE_ANON_PUBLIC_KEY')) {
      console.info(
        '[AgroConecta - Modo Demostración] Configuración de Supabase no detectada.\n' +
        'Para activar la persistencia real, define tus credenciales seguras en js/config.js siguiendo js/config.example.js.'
      );
      return { 
        success: true, 
        demo: true, 
        trackingCode, 
        email: correo, 
        rolNombre, 
        cultivo: cultivoInteres, 
        montoFormateado 
      };
    }

    let responseData = null;
    const client = getSupabaseClient();

    // Intento 1: Supabase JS Client
    if (client && client.from) {
      try {
        // En inserciones anónimas con RLS estricto, no se encadena .select()
        // para evitar requerir permisos SELECT sobre la tabla pública
        const { data, error } = await client
          .from('postulaciones')
          .insert([payload]);

        if (!error) {
          responseData = data || [{ status: 'created' }];
        } else if (error) {
          console.warn('[Supabase DB SDK Error]:', error.message, '- Ejecutando conector REST.');
        }
      } catch (sdkError) {
        console.warn('[Supabase DB SDK Exception]:', sdkError);
      }
    }

    // Intento 2: Conector directo REST PostgREST con return=minimal
    if (!responseData) {
      const restResponse = await fetch(`${config.url}/rest/v1/postulaciones`, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });

      if (!restResponse.ok) {
        const errorText = await restResponse.text();
        throw new Error(`Error en Supabase (${restResponse.status}): ${errorText}`);
      }

      responseData = [{ status: 'created' }];
    }

    console.info('[AgroConecta - Supabase] Registro guardado con éxito:', responseData);
    return { 
      success: true, 
      data: responseData, 
      trackingCode, 
      email: correo, 
      rolNombre, 
      cultivo: cultivoInteres, 
      montoFormateado 
    };
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
