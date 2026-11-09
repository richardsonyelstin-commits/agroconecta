import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { validatePostulacion, validateFile } from '../_shared/validation.mjs';
import { allowedOrigin, consumeQuota } from '../_shared/security.mjs';

export async function handlePostulacion(req: Request) {
  const env = Deno.env.toObject();
  const origin = req.headers.get('origin');
  const headers: Record<string, string> = {
    Vary: 'Origin',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info'
  };
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers });
  if (!allowedOrigin(origin, env.ALLOWED_ORIGINS))
    return json({ error: 'Origen no permitido.' }, 403);
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.RATE_LIMIT_SALT)
    return json({ error: 'El registro no está disponible.' }, 503);
  if (!req.headers.get('content-type')?.includes('multipart/form-data'))
    return json({ error: 'Formato de solicitud no admitido.' }, 415);
  let path: string | null = null;
  const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (
      !(await consumeQuota(env, ip, 'postulaciones', 5)) ||
      !(await consumeQuota(env, 'global', 'postulaciones-global', 100))
    ) {
      headers['Retry-After'] = '60';
      return json({ error: 'Límite temporal alcanzado. Inténtalo más tarde.' }, 429);
    }
    // Limitar también cuerpos sin Content-Length antes de analizarlos.
    const reader = req.body?.getReader();
    if (!reader) return json({ error: 'Formulario vacío.' }, 400);
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > 11 * 1024 * 1024) {
        await reader.cancel();
        return json({ error: 'Solicitud demasiado grande.' }, 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      bytes.set(c, offset);
      offset += c.length;
    }
    const form = await new Response(bytes, {
      headers: { 'Content-Type': req.headers.get('content-type')! }
    }).formData();
    const raw = form.get('payload');
    if (typeof raw !== 'string' || raw.length > 12000)
      return json({ error: 'Formulario inválido.' }, 400);
    let payload;
    try {
      payload = validatePostulacion(JSON.parse(raw));
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : 'Formulario inválido.' }, 400);
    }
    const file = form.get('documento');
    if (file instanceof File && file.size) {
      let ext: string;
      const content = new Uint8Array(await file.arrayBuffer());
      try {
        ext = validateFile(content, file.type, file.name);
      } catch (e) {
        return json({ error: e instanceof Error ? e.message : 'Adjunto inválido.' }, 400);
      }
      path = 'postulaciones/' + crypto.randomUUID() + '.' + ext;
      const { error } = await db.storage
        .from('documentos_postulacion')
        .upload(path, content, { contentType: file.type, upsert: false });
      if (error)
        return json({ error: 'No se pudo guardar el adjunto. No se registró la solicitud.' }, 503);
    }
    // El identificador se genera en Postgres. Se almacena la ruta privada, nunca una URL pública.
    const { data, error } = await db
      .from('postulaciones')
      .insert({ ...payload, archivo_url: path })
      .select('tracking_code')
      .single();
    if (error || !data) {
      if (path) await db.storage.from('documentos_postulacion').remove([path]);
      return json({ error: 'No se pudo guardar la solicitud. Inténtalo nuevamente.' }, 503);
    }
    return json({ success: true, trackingCode: data.tracking_code }, 201);
  } catch (_) {
    if (path) await db.storage.from('documentos_postulacion').remove([path]);
    return json(
      { error: 'El servicio no está disponible. No se pudo confirmar el registro.' },
      503
    );
  }
}
if (import.meta.main) Deno.serve(handlePostulacion);
