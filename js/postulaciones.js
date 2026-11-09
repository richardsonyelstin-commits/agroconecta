/** Formulario: demostración local o envío a un backend que valida y persiste. */
function obtenerConfiguracion() {
  return window.AGROCONECTA_CONFIG || {};
}

function validarClavePublica(key) {
  if (!key) return;
  let privada = key.startsWith('sb_secret_');
  try {
    privada ||=
      JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role ===
      'service_role';
  } catch (_) {
    /* Clave publishable. */
  }
  if (privada)
    throw new Error('Retira la clave privada del navegador. Solo se admite configuración pública.');
}

async function validarAdjunto(file) {
  if (!file || !file.size) return;
  if (file.size > 10 * 1024 * 1024) throw new Error('El adjunto debe pesar como máximo 10 MB.');
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const pdf = [37, 80, 68, 70, 45].every((v, i) => bytes[i] === v);
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (
    !(
      (pdf && file.type === 'application/pdf' && /\.pdf$/i.test(file.name)) ||
      (png && file.type === 'image/png' && /\.png$/i.test(file.name)) ||
      (jpg && file.type === 'image/jpeg' && /\.jpe?g$/i.test(file.name))
    )
  )
    throw new Error(
      'Selecciona un PDF, PNG o JPEG válido, con extensión y contenido coincidentes.'
    );
}

async function enviarPostulacion(form) {
  try {
    const cfg = obtenerConfiguracion();
    validarClavePublica(cfg.SUPABASE_ANON_KEY || '');
    const data = new FormData(form);
    const rol = String(data.get('rolUsuario'));
    if (!['productor', 'inversionista', 'cooperativa'].includes(rol))
      throw new Error('Selecciona un perfil válido.');
    const sufijo = {
      productor: 'Productor',
      inversionista: 'Inversionista',
      cooperativa: 'Cooperativa'
    }[rol];
    const valor = (nombre) => String(data.get(nombre + sufijo) || '').trim();
    const file = data.get('adjuntoDoc' + sufijo);
    await validarAdjunto(file);
    const payload = {
      nombre_completo: rol === 'cooperativa' ? valor('razonSocial') : valor('nombreCompleto'),
      dni_ruc: rol === 'cooperativa' ? valor('ruc') : valor('dniRuc'),
      correo: String(data.get('correo') || '').trim(),
      telefono: valor('telefono'),
      fecha_nacimiento: valor('fechaNacimiento') || null,
      rol_usuario: rol,
      region_valle: rol === 'inversionista' ? 'Nacional / Varios valles' : valor('regionValle'),
      cultivo_interes: valor('cultivoInteres'),
      hectareas: rol === 'inversionista' ? 0 : Number(valor('hectareas')),
      monto_estimado: Number(valor('montoEstimado')),
      duracion_campana: rol === 'cooperativa' ? 12 : Number(valor('duracionCampana') || 6),
      mensaje_detallado: valor('mensajeDetallado'),
      representante: valor('representante'),
      dni_representante: valor('dniRepresentante'),
      socios: rol === 'cooperativa' ? Number(valor('socios')) : null,
      certificaciones: valor('certificaciones'),
      tipo_inversionista: String(data.get('tipoInversionista') || ''),
      modalidad_inversion: String(data.get('modalidadInversion') || ''),
      acepto_terminos: data.get('aceptoTerminos') === 'on',
      boletin_noticias: data.get('boletinNoticias') === 'on'
    };
    const resumen = {
      email: payload.correo,
      rolNombre: {
        productor: 'Productor',
        inversionista: 'Inversionista / Comprador',
        cooperativa: 'Cooperativa / Asociación'
      }[rol],
      cultivo:
        payload.cultivo_interes === 'portafolio_diversificado'
          ? 'Portafolio diversificado'
          : payload.cultivo_interes,
      montoFormateado:
        'S/. ' +
        payload.monto_estimado.toLocaleString('es-PE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
    };
    if (cfg.DEMO_MODE !== false)
      return { success: true, demo: true, trackingCode: 'DEMO-' + crypto.randomUUID(), ...resumen };
    if (!cfg.BACKEND_API_URL)
      throw new Error('El registro está deshabilitado temporalmente. No se guardaron tus datos.');
    const endpoint = new URL(cfg.BACKEND_API_URL, location.href);
    if (endpoint.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(endpoint.hostname))
      throw new Error('El servicio de registro requiere una conexión segura.');
    const body = new FormData();
    body.set('payload', JSON.stringify(payload));
    if (file && file.size) body.set('documento', file);
    const response = await fetch(endpoint, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(20000)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success !== true || typeof result.trackingCode !== 'string')
      throw new Error(
        result.error || 'No se pudo confirmar el registro. Conserva tus datos e inténtalo otra vez.'
      );
    return { success: true, demo: false, ...resumen, trackingCode: result.trackingCode };
  } catch (error) {
    return {
      success: false,
      error:
        error.name === 'TimeoutError'
          ? 'El servicio demoró demasiado. No se pudo confirmar el registro.'
          : error.message
    };
  }
}
window.enviarPostulacion = enviarPostulacion;
window.obtenerConfiguracionAgroConecta = obtenerConfiguracion;
