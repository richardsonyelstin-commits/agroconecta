/**
 * AGROCONECTA - Vercel Serverless Function para AgroBot
 * Conexión Oficial con Meta Muse Spark 1.3 Contributor
 * Endpoint: /api/chat
 */

// Función auxiliar robusta para extraer texto de la respuesta de Meta AI
function extraerTextoRespuestaMeta(data) {
  if (!data) return '';

  // 1. Estructura oficial Meta Responses API (/v1/responses):
  // data.output es un array de { type: "message", role: "assistant", content: [ { type: "output_text", text: "..." } ] }
  if (Array.isArray(data.output)) {
    for (const item of data.output) {
      // Bloque directo output_text
      if (item.type === 'output_text' && typeof item.text === 'string' && item.text.trim()) {
        return item.text.trim();
      }
      // Bloque message con array content
      if (Array.isArray(item.content)) {
        for (const block of item.content) {
          if ((block.type === 'output_text' || !block.type) && typeof block.text === 'string' && block.text.trim()) {
            return block.text.trim();
          }
        }
      }
      // Si el item tiene propiedad text directamente
      if (typeof item.text === 'string' && item.text.trim()) {
        return item.text.trim();
      }
    }
  }

  // 2. Formato OpenAI compatible (choices[0].message.content)
  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content.trim();
  }

  // 3. Propiedades directas
  if (typeof data.reply === 'string' && data.reply.trim()) return data.reply.trim();
  if (typeof data.response === 'string' && data.response.trim()) return data.response.trim();
  if (typeof data.text === 'string' && data.text.trim()) return data.text.trim();

  return '';
}

module.exports = async function handler(req, res) {
  // Configuración de encabezados CORS y métodos permitidos
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Solo se acepta POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { mensaje, historial = [] } = body;

    if (!mensaje || typeof mensaje !== 'string') {
      return res.status(400).json({ error: 'El mensaje del usuario es requerido.' });
    }

    // Obtener la clave secreta desde las Variables de Entorno de Vercel
    const apiKey = process.env.MODEL_API_KEY || process.env.META_MODEL_API_KEY;

    if (!apiKey) {
      console.warn('[AgroBot Vercel] MODEL_API_KEY no encontrada en las variables de entorno de Vercel.');
      return res.status(500).json({
        error: 'MODEL_API_KEY no configurada en Vercel. Ve a Project Settings > Environment Variables y agrégala.',
        fallback_required: true
      });
    }

    // Extraer prompt de sistema (instructions)
    const systemItem = historial.find(item => item.role === 'system');
    const systemInstructions = systemItem ? systemItem.content : '';

    // Filtrar para que 'input' contenga solo 'user' y 'assistant'
    const conversationMessages = historial.filter(item => item.role === 'user' || item.role === 'assistant');

    const metaInput = conversationMessages.map(item => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: [
        {
          type: 'input_text',
          text: item.content
        }
      ]
    }));

    // Asegurar que el mensaje actual del usuario esté al final
    if (!metaInput.some(i => i.role === 'user' && i.content[0]?.text === mensaje)) {
      metaInput.push({
        role: 'user',
        content: [{ type: 'input_text', text: mensaje }]
      });
    }

    // Construir payload base
    const requestPayload = {
      model: 'muse-spark-1.3-contributor',
      input: metaInput,
      stream: false
    };

    if (systemInstructions) {
      requestPayload.instructions = systemInstructions;
    }

    console.info('[AgroBot Vercel] Enviando petición a Meta AI Responses API...');
    let metaResponse = await fetch('https://api.meta.ai/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    // Si Meta devuelve 400 y enviamos instructions, reintentamos con payload puro de cURL
    if (metaResponse.status === 400 && requestPayload.instructions) {
      console.warn('[AgroBot Vercel] Reintentando con payload estricto sin parámetro instructions...');
      delete requestPayload.instructions;
      metaResponse = await fetch('https://api.meta.ai/v1/responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });
    }

    if (!metaResponse.ok) {
      const errorText = await metaResponse.text();
      console.error('[Meta AI API Error on Vercel]:', metaResponse.status, errorText);
      return res.status(metaResponse.status).json({
        error: `Error de Meta AI (${metaResponse.status}): ${errorText}`,
        fallback_required: true,
        status: metaResponse.status
      });
    }

    const data = await metaResponse.json();
    const replyText = extraerTextoRespuestaMeta(data);

    if (!replyText) {
      console.warn('[AgroBot Vercel] Respuesta vacía de Meta AI:', JSON.stringify(data));
      return res.status(200).json({
        success: false,
        reply: '',
        raw: data,
        fallback_required: true
      });
    }

    console.info('[AgroBot Vercel] Respuesta generada exitosamente por Meta Muse Spark 1.3.');
    return res.status(200).json({
      success: true,
      reply: replyText,
      model: data.model || 'muse-spark-1.3-contributor'
    });
  } catch (error) {
    console.error('[Vercel Serverless Function Error]:', error);
    return res.status(500).json({
      error: error.message || 'Error interno en la función serverless de Vercel',
      fallback_required: true
    });
  }
};
