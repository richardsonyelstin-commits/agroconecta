/**
 * AGROCONECTA - AgroBot (Asistente Virtual Inteligente con Soporte LLM Meta Muse Spark 1.3)
 * Chatbot flotante con motor dual: Integración de LLM en la nube y motor semántico local de respaldo.
 */

(function () {
  'use strict';

  // Detección de ruta relativa según si nos encontramos en la raíz o dentro de /page/
  const isSubdir = window.location.pathname.includes('/page/') || 
                   window.location.pathname.endsWith('.html') && !window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/');
  const BASE_PAGE_URL = isSubdir ? '' : 'page/';
  const BASE_IMG_URL = isSubdir ? '../dist/imagenes/' : 'dist/imagenes/';

  // ==============================================================================
  // CONFIGURACIÓN DEL LLM (Meta Muse Spark 1.3 Contributor)
  // ==============================================================================
  function obtenerConfiguracionLLM() {
    const cfg = (typeof window !== 'undefined' && window.AGROCONECTA_CONFIG) || {};
    return {
      apiKey: (window.AGROCONECTA_LLM_KEY || cfg.LLM_API_KEY || '').trim(),
      endpoint: (window.AGROCONECTA_LLM_ENDPOINT || cfg.LLM_ENDPOINT || 'https://api.meta.ai/v1/responses').trim(),
      model: (window.AGROCONECTA_LLM_MODEL || cfg.LLM_MODEL || 'muse-spark-1.3-contributor').trim(),
      proxyUrl: (window.AGROCONECTA_LLM_PROXY || cfg.AGROBOT_PROXY_URL || (typeof window !== 'undefined' && window.location.protocol.startsWith('http') ? '/api/chat' : '')).trim()
    };
  }

  const SYSTEM_PROMPT = `Eres AgroBot, el Asistente de IA oficial de AGROCONECTA (agroconecta.pe), plataforma peruana de financiamiento colaborativo y contratos de compra futura agrícola.

Tu misión es asesorar con empatía, profesionalismo y precisión técnica a tres tipos de usuarios:
1. Pequeños Productores Agrarios: Explica cómo postular sus cosechas, requisitos (DNI/RUC, predio demostrable, mín 0.5 Ha), financiamiento oportuno sin usura bancaria, venta asegurada a Precio Justo pactado antes de la siembra (25%-40% más margen neto frente a intermediarios), y cobertura de seguro agrícola catastrófico (SBS).
2. Inversionistas / Compradores Futuros: Explica cómo invertir desde S/. 500, retornos anuales proyectados entre el 12% y 18% respaldados por cosechas físicas, y opciones de compra de lotes exportables.
3. Cooperativas / Asociaciones: Explica financiamiento consolidado para acopio, infraestructura y certificaciones (Orgánico, Fairtrade).

Portafolio de 7 cultivos en Perú:
• Café Orgánico de Altura (Chanchamayo, Junín)
• Cacao Criollo de Aroma (Quillabamba, Cusco)
• Palta Hass de Exportación (Huaral, Lima)
• Maíz Morado Canteño (Canta, Lima)
• Quinua Real del Altiplano (Puno)
• Mango Kent Orgánico (Valle del Chira, Piura)
• Espárrago Verde (Ica)

Canales oficiales:
• WhatsApp / Teléfono: +51 930 736 214
• Correo: contacto@agroconecta.pe / financiamiento@agroconecta.pe
• Formulario de Postulación: ${BASE_PAGE_URL}contacto.html

Directrices de respuesta:
• Responde siempre en español, con tono cercano, profesional y positivo.
• Utiliza formato legible con viñetas, negritas y emojis agrícolas.
• Mantén las respuestas concisas (máximo 2 a 3 párrafos breves) para que se lean cómodamente en el widget móvil.`;

  // Historial multi-turno de conversación
  const historialConversacion = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];

  // Base de Conocimiento Local de Respaldo (Funciona 100% offline o sin API key)
  const KNOWLEDGE_BASE = [
    {
      keywords: ['como postular', 'cómo postular', 'postulacion', 'postulación', 'postular', 'inscribirme', 'inscribir', 'registro', 'solicitar', 'pasos'],
      title: '¿Cómo postular mi campaña en AgroConecta?',
      response: `Postular es muy rápido y 100% gratuito. Sigue estos 4 pasos:<br><br>
        1️⃣ Ingresa a nuestro <a href="${BASE_PAGE_URL}contacto.html" class="fw-bold text-success text-decoration-underline">Formulario Oficial de Postulación</a>.<br>
        2️⃣ Selecciona tu perfil (Pequeño Productor, Inversionista o Cooperativa).<br>
        3️⃣ Completa tu correo y datos agronómicos o financieros requeridos.<br>
        4️⃣ Adjunta tu documento de posesión o regante (opcional en el primer contacto).<br><br>
        ⏱️ Nuestro equipo técnico evaluará tu solicitud en un plazo máximo de <strong>48 horas hábiles</strong>.`
    },
    {
      keywords: ['cuanto se gana', 'cuánto se gana', 'ganancia', 'rentabilidad', 'ganar', 'ganancias', 'retorno', 'precio', 'utilidad', 'margen', 'precio justo'],
      title: '¿Cuánto se gana y cuál es la rentabilidad?',
      response: `Los beneficios económicos dependen de tu rol en AgroConecta:<br><br>
        🌾 <strong>Para Pequeños Productores:</strong><br>
        • Aseguras la compra de tu cosecha a <em>Precio Justo</em> pactado antes de la siembra.<br>
        • Eliminas intermediarios, obteniendo entre un <strong>25% y 40% más de margen neto</strong> frente a la venta tradicional en chacra.<br>
        • Recibes financiamiento oportuno para semillas, abonos y jornales.<br><br>
        💼 <strong>Para Inversionistas / Compradores Futuros:</strong><br>
        • Rentabilidades anuales estimadas entre el <strong>12% y 18%</strong>, respaldadas por cosechas físicas reales de alta demanda exportable.`
    },
    {
      keywords: ['requisito', 'requisitos', 'que necesito', 'qué necesito', 'documento', 'documentos', 'papeles', 'condiciones', 'hectareas', 'hectáreas'],
      title: '¿Cuáles son los requisitos para participar?',
      response: `Los requisitos básicos son muy accesibles:<br><br>
        ✅ <strong>Productores Agrarios:</strong><br>
        • DNI o RUC vigente.<br>
        • Predio agrícola demostrable (título, constancia de posesión comunal o carnet de regante).<br>
        • Mínimo <strong>0.5 hectáreas</strong> disponibles para cultivo.<br>
        • Experiencia demostrada en el cultivo.<br><br>
        ✅ <strong>Inversionistas:</strong><br>
        • Ser mayor de 18 años con DNI o RUC.<br>
        • Participación accesible desde <strong>S/. 500</strong> en campañas activas.<br><br>
        ✅ <strong>Cooperativas:</strong><br>
        • RUC 20 institucional, mínimo 5 socios y vigencia de poder Sunarp.`
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
        1. <strong>Seguro Agrícola Catastrófico:</strong> Todas nuestras campañas cuentan obligatoriamente con una póliza contratada con aseguradoras reguladas por la <em>SBS</em>, protegiendo ante sequías, plagas o heladas.<br>
        2. <strong>Contratos Notariados:</strong> Convenios formales de compra futura con validez legal.<br>
        3. <strong>Supervisión en Campo:</strong> Ingenieros agrónomos de AgroConecta auditan periódicamente el predio durante todo el ciclo vegetativo.`
    },
    {
      keywords: ['compra futura', 'como funciona', 'cómo funciona', 'modelo', 'ecosistema', 'explicame', 'explícame'],
      title: '¿Cómo funciona el modelo de Compra Futura?',
      response: `Es un modelo colaborativo ganar-ganar en 3 etapas:<br><br>
        🌱 <strong>1. Financiamiento Anticipado:</strong> Inversionistas adquieren por adelantado un porcentaje de la cosecha proyectada, entregando al productor el capital necesario para insumos y jornales.<br>
        🚜 <strong>2. Acompañamiento Agronómico:</strong> AgroConecta supervisa la floración, riego y sanidad vegetal en el valle.<br>
        📦 <strong>3. Cosecha y Liquidación:</strong> Al cosechar, se vende a precio internacional o se entrega al comprador pactado, liquidando las utilidades con total transparencia.`
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

  /**
   * Consulta al modelo Meta Muse Spark 1.3 mediante protocolo seguro
   * Soporta tanto Proxy Serverless (Protocolo Estricto de Seguridad) como llamada directa oficial a https://api.meta.ai/v1/responses
   * @param {string} mensajeUsuario Texto enviado por el usuario
   * @returns {Promise<string>} Respuesta en HTML
   */
  async function consultarMetaMuseSpark(mensajeUsuario) {
    const llmCfg = obtenerConfiguracionLLM();

    // Sanitización básica y límite de tamaño para seguridad
    const mensajeSanitizado = (mensajeUsuario || '').toString().slice(0, 1000).trim();
    if (!mensajeSanitizado) return '';

    // Guardar en el historial multi-turno
    historialConversacion.push({ role: 'user', content: mensajeSanitizado });

    // OPCIÓN A: Conexión mediante Proxy Seguro (Recomendado bajo Protocolo Estricto)
    // El navegador NUNCA posee la clave MODEL_API_KEY, evitando su exposición en DevTools
    if (llmCfg.proxyUrl) {
      try {
        console.info(`[AgroBot Security Protocol] Conectando a través de Proxy Seguro...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const proxyRes = await fetch(llmCfg.proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mensaje: mensajeSanitizado,
            historial: historialConversacion
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          const respuestaTexto = proxyData.reply || proxyData.text;
          if (respuestaTexto) {
            historialConversacion.push({ role: 'assistant', content: respuestaTexto });
            return formatearMarkdownAHTML(respuestaTexto);
          }
        } else {
          console.warn('[AgroBot Proxy] Error en Proxy (' + proxyRes.status + '). Utilizando motor semántico local.');
        }
      } catch (proxyErr) {
        console.warn('[AgroBot Proxy] Excepción en Proxy:', proxyErr.message);
      }
    }

    // OPCIÓN B: Conexión Directa a la API de Meta AI (para pruebas locales protegidas por .gitignore)
    if (llmCfg.apiKey && !llmCfg.apiKey.includes('TU_MODEL_API_KEY') && !llmCfg.apiKey.includes('TU_API_KEY')) {
      try {
        console.info(`[AgroBot LLM] Consultando Meta AI Responses API (${llmCfg.model})...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        // Estructura oficial de Meta AI Responses API (/v1/responses)
        const isMetaResponsesApi = llmCfg.endpoint.includes('/responses') || llmCfg.endpoint.includes('meta.ai');
        
        const metaInput = historialConversacion.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : (msg.role === 'system' ? 'system' : 'user'),
          content: [
            {
              type: 'input_text',
              text: msg.content
            }
          ]
        }));

        const requestBody = isMetaResponsesApi
          ? {
              model: llmCfg.model || 'muse-spark-1.3-contributor',
              input: metaInput,
              stream: false
            }
          : {
              model: llmCfg.model,
              messages: historialConversacion,
              temperature: 0.6,
              max_tokens: 650
            };

        const response = await fetch(llmCfg.endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${llmCfg.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          // Extracción compatible con Meta Responses API (output_text) y OpenAI (choices)
          const outputBlock = data?.output?.find(b => b.type === 'output_text');
          const contenidoRespuesta = outputBlock?.text 
            || data?.output?.[0]?.text 
            || data?.reply 
            || data?.choices?.[0]?.message?.content;

          if (contenidoRespuesta) {
            historialConversacion.push({ role: 'assistant', content: contenidoRespuesta });
            return formatearMarkdownAHTML(contenidoRespuesta);
          }
        } else {
          console.warn('[AgroBot LLM] Error en API Meta AI (' + response.status + '). Utilizando motor semántico local.');
        }
      } catch (llmErr) {
        console.warn('[AgroBot LLM] Excepción en llamada Meta AI (posible restricción CORS o red):', llmErr.message);
      }
    }

    // OPCIÓN C: Motor Semántico Local de Respaldo (100% resiliente y privado)
    const respuestaLocal = buscarRespuestaLocal(mensajeSanitizado);
    historialConversacion.push({ role: 'assistant', content: respuestaLocal });
    return respuestaLocal;
  }

  /**
   * Convierte texto en formato Markdown a HTML limpio y estilizado
   * @param {string} markdown Texto plano con formato Markdown
   * @returns {string} HTML renderizable
   */
  function formatearMarkdownAHTML(markdown) {
    let html = markdown
      // Negrita
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Cursiva
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Enlaces Markdown [texto](url)
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-success fw-bold text-decoration-underline" target="_blank">$1</a>')
      // Viñetas con guión o asterisco
      .replace(/(?:^|\n)[-*]\s+(.*)/g, '<li class="mb-1">$1</li>')
      // Saltos de línea
      .replace(/\n\n+/g, '<br><br>')
      .replace(/\n/g, '<br>');

    // Envolver listas <li> si existen
    if (html.includes('<li')) {
      html = html.replace(/(<li.*<\/li>)/s, '<ul class="ps-3 mb-2">$1</ul>');
    }

    return html;
  }

  // Motor de Búsqueda de Respuestas Inteligente Local
  function buscarRespuestaLocal(mensaje) {
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
        <!-- Encabezado del Chatbot con Contraste Blanco Puro Blindado -->
        <div class="agrobot-header d-flex align-items-center justify-content-between p-3 text-white">
          <div class="d-flex align-items-center gap-2">
            <div class="position-relative">
              <img src="${BASE_IMG_URL}logo.png" width="38" height="38" alt="AgroBot" class="rounded-circle bg-white p-1">
              <span class="agrobot-online-dot"></span>
            </div>
            <div>
              <h6 class="mb-0 fw-bold fs-6 text-white" id="agrobot-title" style="color: #FFFFFF !important;">
                AgroBot &bull; AgroConecta
              </h6>
              <div class="d-flex align-items-center gap-1 mt-1">
                <span class="agrobot-ai-badge">⚡ Meta Muse Spark 1.3</span>
                <small style="color: rgba(255, 255, 255, 0.9) !important; font-size: 0.72rem;">En línea 🟢</small>
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

        <!-- Área de Historial de Mensajes -->
        <div id="agrobot-messages" class="agrobot-body p-3 overflow-auto flex-grow-1">
          <!-- Mensaje de Bienvenida Inicial -->
          <div class="agrobot-msg agrobot-msg-bot mb-3">
            <div class="agrobot-bubble p-3 rounded-4 shadow-sm">
              <p class="mb-2">¡Hola! 🌱 Te doy la bienvenida a <strong>AgroConecta</strong>.</p>
              <p class="mb-2">Soy <strong>AgroBot</strong>, impulsado por <em>Meta Muse Spark 1.3</em>. Estoy capacitado para responder todas tus dudas sobre cómo postular, requisitos, rentabilidad, compra futura o líneas de cultivo.</p>
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
            <span>AgroBot está pensando con Meta Muse Spark</span>
            <span class="agrobot-dots"><span>.</span><span>.</span><span>.</span></span>
          </small>
        </div>

        <!-- Pie de Entrada de Texto -->
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

    if (closeBtn) closeBtn.addEventListener('click', cerrarChat);

    // Enviar mensaje del usuario
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const texto = input.value.trim();
      if (!texto) return;

      agregarMensajeUsuario(texto);
      input.value = '';
      await procesarRespuestaBot(texto);
    });

    // Delegación de clics en píldoras de preguntas rápidas
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
        <div class="agrobot-bubble p-3 rounded-4 shadow-sm text-white d-inline-block text-start" style="max-width: 82%;">
          <p class="mb-1" style="color: #FFFFFF !important;">${escaparHTML(texto)}</p>
          <span class="agrobot-time text-white-50 small d-block text-end" style="font-size: 0.68rem;">${hora}</span>
        </div>
      `;
      messagesContainer.appendChild(msgDiv);
      scrollAlFondo();
    }

    async function procesarRespuestaBot(consulta) {
      if (typingIndicator) typingIndicator.style.display = 'block';
      scrollAlFondo();

      try {
        const respuestaHTML = await consultarMetaMuseSpark(consulta);

        if (typingIndicator) typingIndicator.style.display = 'none';
        const msgDiv = document.createElement('div');
        msgDiv.className = 'agrobot-msg agrobot-msg-bot mb-3';
        const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        msgDiv.innerHTML = `
          <div class="agrobot-bubble p-3 rounded-4 shadow-sm text-dark" style="max-width: 88%;">
            <div class="agrobot-bot-content mb-1" style="font-size: 0.88rem; line-height: 1.45;">
              ${respuestaHTML}
            </div>
            <span class="agrobot-time text-muted small d-block text-end" style="font-size: 0.68rem;">${hora}</span>
          </div>
        `;
        messagesContainer.appendChild(msgDiv);
        scrollAlFondo();
      } catch (err) {
        if (typingIndicator) typingIndicator.style.display = 'none';
        console.error('[AgroBot Error]:', err);
      }
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
    preguntar: consultarMetaMuseSpark,
    preguntarLocal: buscarRespuestaLocal
  };
})();
