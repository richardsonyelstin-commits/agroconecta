/** Copiar solo valores públicos a config.public.js. Los secretos van al servidor. */
window.AGROCONECTA_CONFIG = {
  DEMO_MODE: true,
  BACKEND_API_URL: '', // URL HTTPS de la función postulaciones cuando se habilite.
  AGROBOT_PROXY_URL: '' // '/api/chat' para habilitar IA mediante Vercel.
};
