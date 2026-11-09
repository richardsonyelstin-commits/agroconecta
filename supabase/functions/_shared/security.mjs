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

let chatMinute = -1;
let chatRequests = 0;
const chatRequestsByIp = new Map();

export async function consumeChatQuota(env, ip) {
  if (env.SUPABASE_URL || env.SUPABASE_SERVICE_ROLE_KEY || env.RATE_LIMIT_SALT) {
    return (
      (await consumeQuota(env, ip, 'chat', 15)) &&
      (await consumeQuota(env, 'global', 'chat-global', 300))
    );
  }

  // Sin Postgres, los límites se aplican por instancia y se reinician cada minuto.
  const minute = Math.floor(Date.now() / 60000);
  if (minute !== chatMinute) {
    chatMinute = minute;
    chatRequests = 0;
    chatRequestsByIp.clear();
  }
  const count = chatRequestsByIp.get(ip) || 0;
  if (count >= 15 || chatRequests >= 300) return false;
  chatRequests++;
  chatRequestsByIp.set(ip, count + 1);
  return true;
}
