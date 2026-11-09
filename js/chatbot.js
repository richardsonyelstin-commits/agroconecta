(function () {
  'use strict';

  const isSubdir =
    window.location.pathname.includes('/page/') ||
    (window.location.pathname.endsWith('.html') &&
      !window.location.pathname.endsWith('index.html') &&
      !window.location.pathname.endsWith('/'));
  const BASE_PAGE_URL = isSubdir ? '' : 'page/';
  const BASE_IMG_URL = isSubdir ? '../assets/imagenes/' : 'assets/imagenes/';

  function obtenerConfiguracionChat() {
    const cfg = window.AGROCONECTA_CONFIG || {};
    return {
      proxyUrl: typeof cfg.AGROBOT_PROXY_URL === 'string' ? cfg.AGROBOT_PROXY_URL.trim() : ''
    };
  }

  const MAX_HISTORIAL = 20;
  const historialConversacion = [];

  function agregarAlHistorial(rol, contenido) {
    historialConversacion.push({ role: rol, content: contenido });
    if (historialConversacion.length > MAX_HISTORIAL) {
      historialConversacion.splice(0, historialConversacion.length - MAX_HISTORIAL);
    }
  }

  const QUICK_QUESTIONS = [
    { label: 'Cómo postular', query: 'Cómo postular' },
    { label: 'Simular un retorno', query: 'Simular inversión' },
    { label: 'Cultivos', query: 'Cultivos disponibles' },
    { label: 'Alcance y privacidad', query: 'Seguridad y privacidad' }
  ];
  const KNOWLEDGE_BASE = [
    {
      keywords: ['postul', 'requisit', 'productor'],
      response: `Para completar la postulación elige tu perfil, completa los campos visibles y revisa el resumen. <a href="${BASE_PAGE_URL}contacto.html">Abrir formulario</a>.`
    },
    {
      keywords: ['inver', 'ganan', 'retorno', 'capital', 'monto', 'soles'],
      response: `El simulador calcula interés simple con montos de S/. 500 a S/. 50,000. Puedes ajustar el capital, el cultivo y el plazo, y trasladarlos al formulario.`
    },
    {
      keywords: ['cultiv', 'cafe', 'café', 'cacao', 'palta', 'mango', 'quinua', 'maíz', 'maiz'],
      response: `El catálogo contiene seis cultivos: café, cacao, palta, maíz morado, quinua y mango. Consulta sus fichas para conocer las características de cada campaña.`
    },
    {
      keywords: ['segur', 'riesgo', 'sbs', 'garant', 'legal', 'poliza', 'póliza'],
      response: `Consulta las condiciones de la campaña y los documentos del acuerdo para conocer sus riesgos, obligaciones y posibles coberturas.`
    },
    {
      keywords: ['cooper', 'asocia'],
      response: `El perfil Cooperativa incluye los datos de la asociación y su representante. Revisa los campos obligatorios antes de continuar.`
    },
    {
      keywords: ['correo', 'seguim', 'código', 'codigo', 'adjunto', 'archivo', 'privacidad'],
      response: `La demostración no envía correos ni sube adjuntos. Su referencia comienza por DEMO. El registro real solo puede activarse con un backend configurado y validado; el formulario debe confirmar explícitamente el guardado.`
    }
  ];

  async function obtenerRespuesta(mensajeUsuario) {
    const configuracionChat = obtenerConfiguracionChat();

    const mensajeSanitizado = (mensajeUsuario || '').toString().slice(0, 1000).trim();
    if (!mensajeSanitizado) return '';

    agregarAlHistorial('user', mensajeSanitizado);

    if (configuracionChat.proxyUrl) {
      try {
        const proxyRes = await fetch(configuracionChat.proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mensaje: mensajeSanitizado,
            historial: historialConversacion
          }),
          signal: AbortSignal.timeout(18000)
        });

        const proxyData = await proxyRes.json().catch(() => null);

        if (proxyRes.ok && proxyData && (proxyData.reply || proxyData.text)) {
          const respuestaTexto = (proxyData.reply || proxyData.text).trim();
          agregarAlHistorial('assistant', respuestaTexto);
          return convertirTextoAHTML(respuestaTexto);
        } else {
          console.warn(
            '[AgroBot Proxy] No se pudo obtener respuesta del modelo:',
            proxyData?.error || `HTTP ${proxyRes.status}. Usando motor local.`
          );
        }
      } catch (proxyErr) {
        console.warn('[AgroBot Proxy] Excepción en llamada a Proxy:', proxyErr.message);
      }
    }

    const respuestaLocal = buscarRespuestaLocal(mensajeSanitizado);
    agregarAlHistorial('assistant', respuestaLocal);
    return respuestaLocal;
  }

  function convertirTextoAHTML(texto) {
    return escaparHTML(String(texto)).replace(/\n/g, '<br>');
  }

  function sanitizarHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const permitidos = new Set(['A', 'P', 'BR', 'STRONG', 'EM', 'UL', 'OL', 'LI']);
    const limpiar = (parent) => {
      [...parent.children].forEach((el) => {
        if (!permitidos.has(el.tagName)) {
          el.replaceWith(document.createTextNode(el.textContent));
          return;
        }
        const href = el.getAttribute('href');
        [...el.attributes].forEach((a) => el.removeAttribute(a.name));
        if (el.tagName === 'A' && href) {
          try {
            const url = new URL(href, location.href);
            if (['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
              el.setAttribute('href', url.href);
              el.setAttribute('rel', 'noopener noreferrer');
            }
          } catch (_) {
            /* Enlace inválido: conservar solo texto. */
          }
        }
        limpiar(el);
      });
    };
    limpiar(template.content);
    return template.innerHTML;
  }

  function buscarRespuestaLocal(mensaje) {
    const texto = mensaje.toLowerCase().trim();
    const palabras = texto.split(/\s+/).filter(Boolean);

    const esPuroSaludo =
      (/^(hola|buenos dias|buenas tardes|buenas noches|que tal|buenas|saludos|ola|holaa)[\s\.,!¡¿?]*$/i.test(
        texto
      ) ||
        palabras.length <= 2) &&
      !/(postul|invert|invers|ganan|requisit|cultiv|segur|campa|soles|dinero|cuanto|como)/i.test(
        texto
      );

    if (
      esPuroSaludo &&
      /^(hola|buenos dias|buenas tardes|buenas noches|que tal|buenas|saludos)/i.test(texto)
    ) {
      return `¡Hola! 👋 Soy <strong>AgroBot</strong>, el asistente virtual de <em>AgroConecta</em>.<br><br>
        Estoy aquí para ayudarte a postular tu predio, conocer las ganancias de compra futura, requisitos o cultivos disponibles.<br><br>
        ¿Sobre qué tema te gustaría consultar hoy? Puedes elegir una de las opciones de abajo o escribirme tu consulta.`;
    }

    if (
      /^(gracias|muchas gracias|excelente|perfecto|genial|ok|adios|chao|hasta luego)/i.test(texto)
    ) {
      return `¡Con mucho gusto! 🌾 Recuerda que en <strong>AgroConecta</strong> estamos comprometidos con el crecimiento del agro nacional. Si estás listo para empezar, ¡<a href="${BASE_PAGE_URL}contacto.html" class="text-success fw-bold">postula tu campaña aquí</a>!`;
    }

    let mejorCoincidencia = null;
    let maxPuntaje = 0;

    for (const item of KNOWLEDGE_BASE) {
      let puntaje = 0;
      for (const kw of item.keywords) {
        if (texto.includes(kw)) {
          puntaje += kw.length;
        }
      }
      if (puntaje > maxPuntaje) {
        maxPuntaje = puntaje;
        mejorCoincidencia = item;
      }
    }

    if (mejorCoincidencia && maxPuntaje > 0) {
      return mejorCoincidencia.response;
    }

    return `Gracias por tu consulta. Para brindarte la información más exacta sobre <em>"${escaparHTML(mensaje)}"</em>, te sugiero explorar estos temas clave:<br><br>
      • <a href="${BASE_PAGE_URL}contacto.html" class="text-success fw-semibold">Formulario de Postulación de Campañas</a><br>
      • <a href="${BASE_PAGE_URL}nosotros.html" class="text-success fw-semibold">Conoce nuestro Modelo de Compra Futura</a><br><br>
      O también puedes contactar directamente a nuestra mesa de asesoría agronómica al <a href="tel:+51930736214" class="text-success fw-bold">+51 930 736 214</a> o <a href="mailto:contacto@agroconecta.pe" class="text-success">contacto@agroconecta.pe</a>.`;
  }

  function escaparHTML(str) {
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function inicializarWidgetChatbot() {
    if (document.getElementById('agrobot-widget-container')) return;

    const container = document.createElement('div');
    container.id = 'agrobot-widget-container';
    container.innerHTML = `
      <div id="agrobot-tooltip" class="agrobot-tooltip-pill shadow-sm" aria-hidden="true">
        <span>💬 ¿Dudas? Asistente Virtual</span>
      </div>
      <button id="agrobot-toggle-btn" class="agrobot-floating-btn shadow-lg" type="button" aria-label="Abrir asistente virtual AgroBot" aria-expanded="false" title="Chatear con AgroBot">
        <span class="agrobot-badge-pulse"></span>
        <span class="agrobot-icon-open">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </span>
        <span class="agrobot-icon-close">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </span>
      </button>
      <div id="agrobot-window" class="agrobot-chat-window shadow-lg" role="dialog" aria-labelledby="agrobot-title" aria-hidden="true" inert>
        <div class="agrobot-header d-flex align-items-center justify-content-between p-3 text-white">
          <div class="d-flex align-items-center gap-2">
            <div class="position-relative">
              <img src="${BASE_IMG_URL}logo.webp" width="38" height="38" alt="AgroBot" class="rounded-circle bg-white p-1">
              <span class="agrobot-online-dot"></span>
            </div>
            <div>
              <h6 class="mb-0 fw-bold fs-6 text-white" id="agrobot-title">
                AgroBot &bull; AgroConecta
              </h6>
              <div class="d-flex align-items-center gap-1 mt-1">
                <span class="agrobot-ai-badge">Asistente</span>
                <small class="agrobot-subtitulo">Asistente de AgroConecta</small>
              </div>
            </div>
          </div>
          <button id="agrobot-close-btn" class="btn btn-sm btn-link text-white text-decoration-none p-1" type="button" aria-label="Cerrar chat">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div id="agrobot-messages" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversación con AgroBot" class="agrobot-body p-3 overflow-auto flex-grow-1">
          <div class="agrobot-msg agrobot-msg-bot mb-3">
            <div class="agrobot-bubble p-3 rounded-4 shadow-sm">
              <p class="mb-2">¡Hola! 🌱 Te doy la bienvenida a <strong>AgroConecta</strong>.</p>
              <p class="mb-2">Soy <strong>AgroBot</strong>, el asistente de AgroConecta. Puedo orientarte sobre el formulario, el catálogo de cultivos y el simulador.</p>
              <span class="agrobot-time text-muted small d-block text-end">Justo ahora</span>
            </div>
          </div>
          <div class="agrobot-chips-container mb-3" id="agrobot-quick-chips">
            <p class="small text-muted fw-bold mb-2">Preguntas frecuentes:</p>
            <div class="d-flex flex-wrap gap-1">
              ${QUICK_QUESTIONS.map(
                (q) => `
                <button type="button" class="btn btn-sm btn-outline-success rounded-pill agrobot-chip-btn" data-query="${q.query}">
                  ${q.label}
                </button>
              `
              ).join('')}
            </div>
          </div>
        </div>
        <div id="agrobot-typing" class="agrobot-typing-indicator px-3 py-1">
          <small class="text-muted d-flex align-items-center gap-1">
            <span>AgroBot está escribiendo</span>
            <span class="agrobot-dots"><span>.</span><span>.</span><span>.</span></span>
          </small>
        </div>
        <form id="agrobot-form" class="agrobot-footer p-2 border-top bg-white d-flex align-items-center gap-2">
          <input type="text" id="agrobot-input" class="form-control form-control-sm rounded-pill px-3 py-2 border-success-subtle" placeholder="Pregúntale a AgroBot..." autocomplete="off" aria-label="Escribe tu mensaje">
          <button type="submit" class="btn btn-success rounded-circle agrobot-send-btn d-flex align-items-center justify-content-center p-2" aria-label="Enviar mensaje">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(container);
    vincularEventosChatbot();
  }

  function vincularEventosChatbot() {
    const toggleBtn = document.getElementById('agrobot-toggle-btn');
    const closeBtn = document.getElementById('agrobot-close-btn');
    const chatWindow = document.getElementById('agrobot-window');
    const tooltip = document.getElementById('agrobot-tooltip');
    const form = document.getElementById('agrobot-form');
    const input = document.getElementById('agrobot-input');
    const messagesContainer = document.getElementById('agrobot-messages');
    const typingIndicator = document.getElementById('agrobot-typing');

    if (!toggleBtn || !chatWindow || !form) return;

    const iconOpen = toggleBtn.querySelector('.agrobot-icon-open');
    const iconClose = toggleBtn.querySelector('.agrobot-icon-close');
    const badgePulse = toggleBtn.querySelector('.agrobot-badge-pulse');

    let estaAbierto = false;
    let respondiendo = false;

    function abrirChat() {
      estaAbierto = true;
      chatWindow.classList.add('agrobot-window-active');
      chatWindow.inert = false;
      chatWindow.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      if (iconOpen) iconOpen.style.display = 'none';
      if (iconClose) iconClose.style.display = 'block';
      if (badgePulse) badgePulse.style.display = 'none';
      if (tooltip) tooltip.style.display = 'none';
      if (input)
        setTimeout(() => {
          if (estaAbierto) input.focus();
        }, 300);
      scrollAlFondo();
    }

    function cerrarChat() {
      estaAbierto = false;
      chatWindow.classList.remove('agrobot-window-active');
      toggleBtn.focus();
      chatWindow.inert = true;
      chatWindow.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      if (iconOpen) iconOpen.style.display = 'block';
      if (iconClose) iconClose.style.display = 'none';
    }

    toggleBtn.addEventListener('click', () => {
      if (estaAbierto) cerrarChat();
      else abrirChat();
    });

    if (closeBtn) closeBtn.addEventListener('click', cerrarChat);
    chatWindow.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cerrarChat();
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const texto = input.value.trim();
      if (!texto) return;

      agregarMensajeUsuario(texto);
      input.value = '';
      await procesarRespuestaBot(texto);
    });

    document.addEventListener('click', async (e) => {
      const chipBtn = e.target.closest('.agrobot-chip-btn');
      if (chipBtn) {
        const query = chipBtn.getAttribute('data-query');
        agregarMensajeUsuario(chipBtn.textContent.trim());
        await procesarRespuestaBot(query);
      }
    });

    function agregarMensajeUsuario(texto) {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'agrobot-msg agrobot-msg-user mb-3 text-end';
      const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      msgDiv.innerHTML = `
        <div class="agrobot-bubble p-3 rounded-4 shadow-sm text-white d-inline-block text-start">
          <p class="mb-1 text-white">${escaparHTML(texto)}</p>
          <span class="agrobot-time text-white-50 small d-block text-end">${hora}</span>
        </div>
      `;
      messagesContainer.appendChild(msgDiv);
      scrollAlFondo();
    }

    async function procesarRespuestaBot(consulta) {
      if (respondiendo) return;
      respondiendo = true;
      form.querySelector('button[type=submit]').disabled = true;
      if (typingIndicator) typingIndicator.style.display = 'block';
      scrollAlFondo();

      try {
        const respuestaHTML = await obtenerRespuesta(consulta);
        const respuestaSegura = sanitizarHTML(respuestaHTML);

        if (typingIndicator) typingIndicator.style.display = 'none';
        const msgDiv = document.createElement('div');
        msgDiv.className = 'agrobot-msg agrobot-msg-bot agrobot-respuesta mb-3';
        const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        msgDiv.innerHTML = `
          <div class="agrobot-bubble p-3 rounded-4 shadow-sm text-dark">
            <div class="agrobot-bot-content mb-1">
              ${respuestaSegura}
            </div>
            <span class="agrobot-time text-muted small d-block text-end">${hora}</span>
          </div>
        `;
        messagesContainer.appendChild(msgDiv);
        scrollAlFondo();
      } catch (err) {
        if (typingIndicator) typingIndicator.style.display = 'none';
        console.error('[AgroBot Error]:', err);
      } finally {
        respondiendo = false;
        form.querySelector('button[type=submit]').disabled = false;
      }
    }

    function scrollAlFondo() {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 50);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarWidgetChatbot);
  } else {
    inicializarWidgetChatbot();
  }

  window.AgroBot = {
    init: inicializarWidgetChatbot,
    preguntar: obtenerRespuesta,
    preguntarLocal: buscarRespuestaLocal
  };
})();
