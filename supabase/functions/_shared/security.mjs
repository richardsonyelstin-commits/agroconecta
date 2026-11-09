export function allowedOrigin(origin, extra = '') {
  if (!origin) return true; // Solicitudes de servidor también quedan sujetas a cuota.
  return [
    'https://agroconecta-two-drab.vercel.app',
    'https://agroconecta.pe',
    ...extra
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
  ].includes(origin);
}
export async function consumeQuota(env, ip, scope, limit) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.RATE_LIMIT_SALT)
    throw new Error('Quota service not configured');
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(env.RATE_LIMIT_SALT + ':' + ip)
  );
  const hash = [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, '0')).join('');
  const response = await fetch(
    env.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/rpc/consume_rate_limit',
    {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_key: scope + ':' + hash, p_limit: limit, p_window_seconds: 60 }),
      signal: AbortSignal.timeout(5000)
    }
  );
  if (!response.ok) throw new Error('Quota service unavailable');
  return (await response.json()) === true;
}
