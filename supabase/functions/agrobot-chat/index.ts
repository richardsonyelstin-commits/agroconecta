import { allowedOrigin } from '../_shared/security.mjs';
import { answerChat } from '../_shared/chat.mjs';

export async function handleChat(req: Request) {
  const env = Deno.env.toObject();
  const origin = req.headers.get('origin');
  const headers: Record<string, string> = {
    Vary: 'Origin',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
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
  if (!req.headers.get('content-type')?.includes('application/json'))
    return json({ error: 'Se requiere JSON.' }, 415);
  try {
    const bytes = await req.arrayBuffer();
    if (bytes.byteLength > 32000) return json({ error: 'Solicitud demasiado grande.' }, 413);
    let body;
    try {
      body = JSON.parse(new TextDecoder().decode(bytes));
    } catch (_) {
      return json({ error: 'JSON inválido.' }, 400);
    }
    const result = await answerChat(
      body,
      env,
      req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    );
    if (result.status === 429) headers['Retry-After'] = '60';
    return json(result.data, result.status);
  } catch (_) {
    return json({ error: 'No se pudo procesar la solicitud.', fallback_required: true }, 500);
  }
}
if (import.meta.main) Deno.serve(handleChat);
