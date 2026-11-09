export function validatePostulacion(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) throw new Error('Formulario inválido.');
  const text = (key, min, max) => {
    if (typeof p[key] !== 'string') throw new Error('Revisa el campo ' + key + '.');
    const v = p[key].trim();
    if (v.length < min || v.length > max) throw new Error('Revisa el campo ' + key + '.');
    return v;
  };
  const num = (key, min, max, step = 0) => {
    const v = p[key];
    if (
      typeof v !== 'number' ||
      !Number.isFinite(v) ||
      v < min ||
      v > max ||
      (step && Math.abs(v / step - Math.round(v / step)) > 1e-8)
    )
      throw new Error('Revisa el campo ' + key + '.');
    return v;
  };
  const rol = text('rol_usuario', 1, 20);
  if (!['productor', 'inversionista', 'cooperativa'].includes(rol))
    throw new Error('Perfil inválido.');
  const dni = text('dni_ruc', 8, 11);
  if (!(rol === 'cooperativa' ? /^20\d{9}$/ : /^(?:\d{8}|\d{11})$/).test(dni))
    throw new Error('DNI/RUC inválido.');
  const correo = text('correo', 3, 120);
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correo))
    throw new Error('Correo inválido.');
  const tel = text('telefono', 7, 20);
  if (!/^\+?[0-9 ()-]{7,20}$/.test(tel)) throw new Error('Teléfono inválido.');
  if (p.acepto_terminos !== true || typeof p.boletin_noticias !== 'boolean')
    throw new Error('Debes confirmar el alcance del formulario.');
  const limits = {
    productor: [2000, 250000, 500],
    inversionista: [500, 50000, 500],
    cooperativa: [10000, 5000000, 1000]
  }[rol];
  const hectareas =
    rol === 'cooperativa'
      ? num('hectareas', 5, 10000, 1)
      : num(
          'hectareas',
          rol === 'inversionista' ? 0 : 0.5,
          rol === 'inversionista' ? 0 : 500,
          rol === 'inversionista' ? 0 : 0.5
        );
  const cultivo = text('cultivo_interes', 1, 100);
  const cultivos = [
    'Café Orgánico de Altura (Chanchamayo)',
    'Cacao Criollo de Aroma (Quillabamba)',
    'Palta Hass de Exportación (Huaral)',
    'Maíz Morado Canteño (Canta)',
    'Quinua Real del Altiplano (Puno)',
    'Mango Kent Orgánico (Piura)'
  ];
  if (
    !(rol === 'inversionista' && cultivo === 'portafolio_diversificado') &&
    !cultivos.includes(cultivo)
  )
    throw new Error('Selecciona un cultivo del catálogo.');
  let fecha = null;
  if (p.fecha_nacimiento) {
    if (typeof p.fecha_nacimiento !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(p.fecha_nacimiento))
      throw new Error('Fecha inválida.');
    const d = new Date(p.fecha_nacimiento + 'T00:00:00Z');
    if (
      Number.isNaN(d.getTime()) ||
      d.toISOString().slice(0, 10) !== p.fecha_nacimiento ||
      d > new Date()
    )
      throw new Error('Fecha inválida.');
    fecha = p.fecha_nacimiento;
  }
  const extra = {};
  for (const key of [
    'mensaje_detallado',
    'certificaciones',
    'tipo_inversionista',
    'modalidad_inversion'
  ]) {
    if (p[key] != null && (typeof p[key] !== 'string' || p[key].length > 1500))
      throw new Error('Texto demasiado largo.');
    if (p[key]) extra[key] = p[key].trim();
  }
  if (rol === 'cooperativa') {
    extra.representante = text('representante', 2, 150);
    extra.dni_representante = text('dni_representante', 8, 8);
    if (!/^\d{8}$/.test(extra.dni_representante)) throw new Error('DNI de representante inválido.');
    extra.socios = num('socios', 5, 5000, 1);
  }
  return {
    nombre_completo: text('nombre_completo', 2, 150),
    dni_ruc: dni,
    correo,
    telefono: tel,
    fecha_nacimiento: fecha,
    rol_usuario: rol,
    region_valle: text('region_valle', 1, 100),
    cultivo_interes: cultivo,
    hectareas,
    monto_estimado: num('monto_estimado', ...limits),
    duracion_campana: num('duracion_campana', 3, 24, 1),
    mensaje_detallado: JSON.stringify(extra),
    acepto_terminos: true,
    boletin_noticias: p.boletin_noticias,
    estado: 'pendiente'
  };
}

export function validateChat(body) {
  if (
    !body ||
    typeof body.mensaje !== 'string' ||
    !body.mensaje.trim() ||
    body.mensaje.length > 1000
  )
    throw new Error('Escribe un mensaje de hasta 1000 caracteres.');
  const history = body.historial ?? [];
  if (!Array.isArray(history) || history.length > 21) throw new Error('Historial inválido.');
  const messages = [];
  for (const m of history) {
    if (
      !m ||
      typeof m !== 'object' ||
      typeof m.content !== 'string' ||
      m.content.length > 1000 ||
      !['system', 'user', 'assistant'].includes(m.role)
    )
      throw new Error('Historial inválido.');
    if (m.role !== 'system')
      messages.push({ role: m.role, content: [{ type: 'input_text', text: m.content }] });
  }
  const text = body.mensaje.trim();
  if (messages.at(-1)?.role !== 'user' || messages.at(-1)?.content[0].text !== text)
    messages.push({ role: 'user', content: [{ type: 'input_text', text }] });
  return messages.slice(-20);
}

export function validateFile(bytes, mime, name) {
  if (!bytes.length || bytes.length > 10 * 1024 * 1024)
    throw new Error('El adjunto debe pesar entre 1 byte y 10 MB.');
  const prefix = (values) => values.every((v, i) => bytes[i] === v);
  const valid =
    (mime === 'application/pdf' && /\.pdf$/i.test(name) && prefix([37, 80, 68, 70, 45])) ||
    (mime === 'image/png' && /\.png$/i.test(name) && prefix([137, 80, 78, 71, 13, 10, 26, 10])) ||
    (mime === 'image/jpeg' && /\.jpe?g$/i.test(name) && prefix([255, 216, 255]));
  if (!valid) throw new Error('Formato o contenido de adjunto no permitido.');
  return mime === 'application/pdf' ? 'pdf' : mime === 'image/png' ? 'png' : 'jpg';
}
