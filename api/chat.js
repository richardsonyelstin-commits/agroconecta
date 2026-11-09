/** Proxy: instrucciones del servidor, cuota persistente y errores públicos breves. */
module.exports = async function handler(req, res) {
  const { allowedOrigin } = await import('../supabase/functions/_shared/security.mjs');
  const origin = req.headers.origin;
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-store');
  if (!allowedOrigin(origin, process.env.ALLOWED_ORIGINS))
    return res.status(403).json({ error: 'Origen no permitido.' });
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  if (!req.headers['content-type']?.includes('application/json'))
    return res.status(415).json({ error: 'Se requiere JSON.' });
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
    if (Buffer.byteLength(raw) > 32000)
      return res.status(413).json({ error: 'Solicitud demasiado grande.' });
    let body;
    try {
      body = JSON.parse(raw);
    } catch (_) {
      return res.status(400).json({ error: 'JSON inválido.' });
    }
    const { answerChat } = await import('../supabase/functions/_shared/chat.mjs');
    // Vercel sobrescribe x-forwarded-for en su proxy. No usar este handler sin un proxy de confianza.
    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
      .split(',')[0]
      .trim();
    const result = await answerChat(body, process.env, ip);
    if (result.status === 429) res.setHeader('Retry-After', '60');
    return res.status(result.status).json(result.data);
  } catch (_) {
    return res
      .status(500)
      .json({ error: 'No se pudo procesar la solicitud.', fallback_required: true });
  }
};
