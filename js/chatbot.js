/**
 * AGROCONECTA - AgroBot (Asistente Virtual Inteligente)
 * Chatbot flotante interactivo para resolver dudas sobre postulación, ganancias, requisitos y cultivos.
 */

(function () {
  'use strict';

  // Detección de ruta relativa según si nos encontramos en la raíz o dentro de /page/
  const isSubdir = window.location.pathname.includes('/page/') || 
                   window.location.pathname.endsWith('.html') && !window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/');
  const BASE_PAGE_URL = isSubdir ? '' : 'page/';
  const BASE_IMG_URL = isSubdir ? '../dist/imagenes/' : 'dist/imagenes/';

  // Base de Conocimiento Inteligente de AgroConecta
  const KNOWLEDGE_BASE = [
    {
      keywords: ['como postular', 'cómo postular', 'postulacion', 'postulación', 'postular', 'inscribirme', 'inscribir', 'registro', 'solicitar', 'pasos'],
      title: '¿Cómo postular mi campaña en AgroConecta?',
      response: `Postular es muy rápido y 100% gratuito. Sigue estos 4 pasos:<br><br>
        1️⃣ Ingresa a nuestro <a href="${BASE_PAGE_URL}contacto.html" class="fw-bold text-success text-decoration-underline">Formulario Oficial de Postulación</a>.<br>
        2️⃣ Completa tus datos personales (DNI/RUC, teléfono de contacto y valle agrario).<br>
        3️⃣ Selecciona tu línea de cultivo, hectáreas disponibles y monto de financiamiento estimado.<br>
        4️⃣ Adjunta tu documento de posesión o regante (opcional en el primer contacto).<br><br>
        ⏱️ Nuestro equipo técnico agronómico evaluará tu solicitud en un plazo máximo de <strong>48 horas hábiles</strong>.`
    },
    {
      keywords: ['cuanto se gana', 'cuánto se gana', 'ganancia', 'rentabilidad', 'ganar', 'ganancias', 'retorno', 'precio', 'utilidad', 'margen', 'precio justo'],
      title: '¿Cuánto se gana y cuál es la rentabilidad?',
      response: `Los beneficios económicos dependen de tu rol en AgroConecta:<br><br>
        🌾 <strong>Para Pequeños Productores:</strong><br>
        • Aseguras la compra de tu cosecha a <em>Precio Justo</em> pactado antes de la siembra.<br>
        • Eliminas a intermediarios abusivos, obteniendo entre un <strong>25% y 40% más de margen neto</strong> frente a la venta tradicional en chacra.<br>
        • Recibes financiamiento oportuno sin intereses bancarios asfixiantes.<br><br>
        💼 <strong>Para Inversionistas / Compradores Futuros:</strong><br>
        • Rentabilidades anuales estimadas entre el <strong>12% y 18%</strong>, respaldadas por cosechas físicas reales de alta demanda exportable.`
    },
    {
      keywords: ['requisito', 'requisitos', 'que necesito', 'qué necesito', 'documento', 'documentos', 'papeles', 'condiciones', 'hectareas', 'hectáreas'],
      title: '¿Cuáles son los requisitos para participar?',
      response: `Los requisitos básicos son muy accesibles:<br><br>
        ✅ <strong>Productores Agrarios:</strong><br>
        • DNI o RUC vigente (persona natural o cooperativa).<br>
        • Predio agrícola demostrable (título de propiedad, constancia de posesión comunal o carnet de regante).<br>
        • Mínimo <strong>0.5 hectáreas</strong> disponibles para cultivo.<br>
        • Experiencia demostrada en la línea agrícola a cultivar.<br><br>
        ✅ <strong>Inversionistas:</strong><br>
        • Ser mayor de 18 años con DNI o RUC.<br>
        • Participación accesible desde <strong>S/. 500</strong> en campañas activas.`
    },
    {
      keywords: ['cultivo', 'cultivos', 'que cultivos', 'qué cultivos', 'productos', 'cafe', 'café', 'cacao', 'palta', 'maiz', 'maíz', 'quinua', 'mango', 'esparrago', 'espárrago'],
      title: '¿Qué cultivos financia actualmente AgroConecta?',
      response: `Financiamos 7 cadenas productivas estratégicas de alto valor exportable y consumo nacional:<br><br>
        • ☕ <a href="${BASE_PAGE_URL}cafe.html" class="text-success fw-semibold">Café Orgánico de Altura</a> (Chanchamayo, Junín)<br>
        • 🍫 <a href="${BASE_PAGE_URL}cacao.html" class="text-success fw-semibold">Cacao Criollo de Aroma</a> (Quillabamba, Cusco)<br>
        • 🥑 <a href="${BASE_PAGE_URL}palta.html" class="text-success fw-semibold">Palta Hass de Exportación</a> (Huaral, Lima)<br>
        • 🌽 <a href="${BASE_PAGE_URL}maiz.html" class="text-success fw-semibold">Maíz Morado Canteño</a> (Canta, Lima)<br>
        • 🌾 <a href="${BASE_PAGE_URL}quinua.html" class="text-success fw-semibold">Quinua Real del Altiplano</a> (Puno)<br>
        • 🥭 <a href="${BASE_PAGE_URL}mango.html" class="text-success fw-semibold">Mango Kent Orgánico</a> (Valle del Chira, Piura)<br>
        • 🌿 <strong>Espárrago Verde</strong> (Ica)`
    },
    {
      keywords: ['seguro', 'garantia', 'garantía', 'garantias', 'garantías', 'seguridad', 'riesgo', 'helada', 'plaga', 'sbs'],
      title: '¿Tienen seguro agrario y garantías?',
      response: `🛡️ <strong>¡Totalmente respaldado!</strong><br><br>
        1. <strong>Seguro Agrícola Catastrófico:</strong> Todas nuestras campañas cuentan obligatoriamente con una póliza contratada con aseguradoras reguladas por la <em>SBS</em>, que protege la inversión ante sequías, plagas o heladas.<br>
        2. <strong>Contratos Notariados:</strong> Los convenios de financiamiento y compra futura se firman formalmente con validez jurídica.<br>
        3. <strong>Supervisión en Campo:</strong> Ingenieros agrónomos de AgroConecta auditan periódicamente el predio durante todo el ciclo vegetativo.`
    },
    {
      keywords: ['compra futura', 'como funciona', 'cómo funciona', 'modelo', 'ecosistema', 'explicame', 'explícame'],
      title: '¿Cómo funciona el modelo de Compra Futura?',
      response: `Es un modelo colaborativo ganar-ganar en 3 etapas:<br><br>
        🌱 <strong>1. Financiamiento Anticipado:</strong> Inversionistas y compradores adquieren por adelantado un porcentaje de la cosecha proyectada, entregando al productor el capital necesario para semillas, abonos y jornales.<br>
        🚜 <strong>2. Acompañamiento Agronómico:</strong> AgroConecta supervisa la floración, riego y sanidad vegetal en el valle.<br>
        📦 <strong>3. Cosecha y Liquidación:</strong> Al recolectar el producto, se vende a precio de mercado internacional o se entrega al comprador pactado, liquidando las utilidades con total transparencia.`
    },
    {
      keywords: ['contacto', 'telefono', 'teléfono', 'whatsapp', 'correo', 'email', 'oficina', 'direccion', 'dirección', 'asesor', 'humano', 'hablar con alguien'],
      title: 'Canales de Atención Directa y Asesoría',
      response: `Si deseas comunicarte directamente con uno de nuestros asesores técnicos:<br><br>
        📞 <strong>Teléfono / WhatsApp:</strong> <a href="https://wa.me/51930736214" target="_blank" class="text-success fw-bold">+51 930 736 214</a><br>
        ✉️ <strong>Correo Oficial:</strong> <a href="mailto:contacto@agroconecta.pe" class="text-success">contacto@agroconecta.pe</a><br>
        💼 <strong>Mesa de Financiamiento:</strong> <a href="mailto:financiamiento@agroconecta.pe" class="text-success">financiamiento@agroconecta.pe</a><br>
        🏢 <strong>Sede Central:</strong> Av. Javier Prado Este 2465, San Borja, Lima<br>
        🕒 <strong>Horario:</strong> Lunes a Viernes de 8:30 am a 6:00 pm`
    }
  ];

  // Preguntas sugeridas en botones rápidos
  const QUICK_QUESTIONS = [
    { label: '🚀 ¿Cómo postular mi campaña?', query: 'como postular' },
    { label: '💰 ¿Cuánto se gana / rentabilidad?', query: 'cuanto se gana' },
    { label: '📋 ¿Cuáles son los requisitos?', query: 'requisitos' },
    { label: '🌱 ¿Qué cultivos financian?', query: 'cultivos' },
    { label: '🛡️ ¿Tienen seguro agrario?', query: 'seguro' },
    { label: '📞 Contactar a un asesor', query: 'contacto' }
  ];

  // Motor de Búsqueda de Respuestas Inteligente
  function buscarRespuesta(mensaje) {
    const texto = mensaje.toLowerCase().trim();

    // Saludo inicial
    if (/^(hola|buenos dias|buenas tardes|buenas noches|que tal|buenas|saludos)/i.test(texto)) {
      return `¡Hola! 👋 Soy <strong>AgroBot</strong>, el asistente virtual de <em>AgroConecta</em>.<br><br>
        Estoy aquí para ayudarte a postular tu predio, conocer las ganancias de compra futura, requisitos o cultivos disponibles.<br><br>
        ¿Sobre qué tema te gustaría consultar hoy? Puedes elegir una de las opciones de abajo o escribirme tu consulta.`;
    }

    // Agradecimiento o despedida
    if (/^(gracias|muchas gracias|excelente|perfecto|genial|ok|adios|chao|hasta luego)/i.test(texto)) {
      return `¡Con mucho gusto! 🌾 Recuerda que en <strong>AgroConecta</strong> estamos comprometidos con el crecimiento del agro nacional. Si estás listo para empezar, ¡<a href="${BASE_PAGE_URL}contacto.html" class="text-success fw-bold">postula tu campaña aquí</a>!`;
    }

    // Coincidencia por palabras clave
    let mejorCoincidencia = null;
    let maxPuntaje = 0;

    for (const item of KNOWLEDGE_BASE) {
      let puntaje = 0;
      for (const kw of item.keywords) {
        if (texto.includes(kw)) {
          puntaje += kw.length; // Ponderar coincidencia de palabras más específicas
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

    // Respuesta de respaldo con sugerencias útiles
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

  // Creación e Inyección del Widget en el DOM
  function inicializarWidgetChatbot() {
    if (document.getElementById('agrobot-widget-container')) return;

    const container = document.createElement('div');
    container.id = 'agrobot-widget-container';
    container.innerHTML = `
      <!-- Tooltip Descriptivo Flotante -->
      <div id="agrobot-tooltip" class="agrobot-tooltip-pill shadow-sm" aria-hidden="true">
        <span>💬 ¿Dudas? Asistente Virtual</span>
      </div>

      <!-- Botón Flotante en la Esquina Inferior Derecha -->
      <button id="agrobot-toggle-btn" class="agrobot-floating-btn shadow-lg" type="button" aria-label="Abrir asistente virtual AgroBot" aria-expanded="false" title="Chatear con AgroBot">
        <span class="agrobot-badge-pulse"></span>
        <!-- Icono de Chat (visible cuando está cerrado) -->
        <span class="agrobot-icon-open">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </span>
        <!-- Icono de Cerrar (visible cuando está abierto) -->
        <span class="agrobot-icon-close" style="display: none;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </span>
      </button>

      <!-- Ventana de Chat Flotante -->
      <div id="agrobot-window" class="agrobot-chat-window shadow-lg" role="dialog" aria-labelledby="agrobot-title" aria-hidden="true">
        <!-- Encabezado del Chatbot -->
        <div class="agrobot-header d-flex align-items-center justify-content-between p-3 text-white">
          <div class="d-flex align-items-center gap-2">
            <div class="position-relative">
              <img src="${BASE_IMG_URL}logo.png" width="36" height="36" alt="AgroBot" class="rounded-circle bg-white p-1">
              <span class="agrobot-online-dot"></span>
            </div>
            <div>
              <h6 class="mb-0 fw-bold fs-6" id="agrobot-title">AgroBot &bull; AgroConecta</h6>
              <small class="text-white-50" style="font-size: 0.72rem;">Asistente en línea 🟢</small>
            </div>
          </div>
          <button id="agrobot-close-btn" class="btn btn-sm btn-link text-white text-decoration-none p-1" type="button" aria-label="Cerrar chat">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Área de Historial de Mensajes -->
        <div id="agrobot-messages" class="agrobot-body p-3 overflow-auto flex-grow-1">
          <!-- Mensaje de Bienvenida Inicial -->
          <div class="agrobot-msg agrobot-msg-bot mb-3">
            <div class="agrobot-bubble p-3 rounded-4 shadow-sm">
              <p class="mb-2">¡Hola! 🌱 Te doy la bienvenida a <strong>AgroConecta</strong>.</p>
              <p class="mb-2">Soy <strong>AgroBot</strong>, tu asistente virtual agronómico. Puedo responder tus dudas sobre cómo postular, requisitos, rentabilidad o líneas de cultivo.</p>
              <span class="agrobot-time text-muted small d-block text-end">Justo ahora</span>
            </div>
          </div>

          <!-- Sugerencias de Preguntas Frecuentes (Chips) -->
          <div class="agrobot-chips-container mb-3" id="agrobot-quick-chips">
            <p class="small text-muted fw-bold mb-2">Preguntas frecuentes:</p>
            <div class="d-flex flex-wrap gap-1">
              ${QUICK_QUESTIONS.map(q => `
                <button type="button" class="btn btn-sm btn-outline-success rounded-pill agrobot-chip-btn" data-query="${q.query}">
                  ${q.label}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Indicador de Escritura "Escribiendo..." -->
        <div id="agrobot-typing" class="agrobot-typing-indicator px-3 py-1" style="display: none;">
          <small class="text-muted d-flex align-items-center gap-1">
            <span>AgroBot está escribiendo</span>
            <span class="agrobot-dots"><span>.</span><span>.</span><span>.</span></span>
          </small>
        </div>

        <!-- Pie de Entrada de Texto -->
        <form id="agrobot-form" class="agrobot-footer p-2 border-top bg-white d-flex align-items-center gap-2">
          <input type="text" id="agrobot-input" class="form-control form-control-sm rounded-pill px-3 py-2 border-success-subtle" placeholder="Escribe tu duda aquí..." autocomplete="off" aria-label="Escribe tu mensaje">
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

  // Vincular eventos interactivos del Chatbot
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

    function abrirChat() {
      estaAbierto = true;
      chatWindow.classList.add('agrobot-window-active');
      chatWindow.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      if (iconOpen) iconOpen.style.display = 'none';
      if (iconClose) iconClose.style.display = 'block';
      if (badgePulse) badgePulse.style.display = 'none';
      if (tooltip) tooltip.style.display = 'none';
      if (input) setTimeout(() => input.focus(), 300);
      scrollAlFondo();
    }

    function cerrarChat() {
      estaAbierto = false;
      chatWindow.classList.remove('agrobot-window-active');
      chatWindow.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      if (iconOpen) iconOpen.style.display = 'block';
      if (iconClose) iconClose.style.display = 'none';
    }

    toggleBtn.addEventListener('click', () => {
      if (estaAbierto) cerrarChat();
      else abrirChat();
    });

    closeBtn.addEventListener('click', cerrarChat);

    // Enviar mensaje del usuario
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const texto = input.value.trim();
      if (!texto) return;

      agregarMensajeUsuario(texto);
      input.value = '';
      procesarRespuestaBot(texto);
    });

    // Delegación de clics en píldoras de preguntas rápidas
    document.addEventListener('click', (e) => {
      const chipBtn = e.target.closest('.agrobot-chip-btn');
      if (chipBtn) {
        const query = chipBtn.getAttribute('data-query');
        agregarMensajeUsuario(chipBtn.textContent.trim());
        procesarRespuestaBot(query);
      }
    });

    function agregarMensajeUsuario(texto) {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'agrobot-msg agrobot-msg-user mb-3 text-end';
      const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      msgDiv.innerHTML = `
        <div class="agrobot-bubble p-3 rounded-4 shadow-sm bg-success text-white d-inline-block text-start" style="max-width: 82%;">
          <p class="mb-1">${escaparHTML(texto)}</p>
          <span class="agrobot-time text-white-50 small d-block text-end" style="font-size: 0.68rem;">${hora}</span>
        </div>
      `;
      messagesContainer.appendChild(msgDiv);
      scrollAlFondo();
    }

    function procesarRespuestaBot(consulta) {
      typingIndicator.style.display = 'block';
      scrollAlFondo();

      // Simulación de escritura interactiva (400 a 700 ms)
      setTimeout(() => {
        typingIndicator.style.display = 'none';
        const respuestaHTML = buscarRespuesta(consulta);
        const msgDiv = document.createElement('div');
        msgDiv.className = 'agrobot-msg agrobot-msg-bot mb-3';
        const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        msgDiv.innerHTML = `
          <div class="agrobot-bubble p-3 rounded-4 shadow-sm bg-light border border-success-subtle text-dark" style="max-width: 88%;">
            <div class="agrobot-bot-content mb-1" style="font-size: 0.88rem; line-height: 1.45;">
              ${respuestaHTML}
            </div>
            <span class="agrobot-time text-muted small d-block text-end" style="font-size: 0.68rem;">${hora}</span>
          </div>
        `;
        messagesContainer.appendChild(msgDiv);
        scrollAlFondo();
      }, 500);
    }

    function scrollAlFondo() {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 50);
    }
  }

  // Inicializar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarWidgetChatbot);
  } else {
    inicializarWidgetChatbot();
  }

  // Exponer API global opcional
  window.AgroBot = {
    init: inicializarWidgetChatbot,
    preguntar: buscarRespuesta
  };
})();
