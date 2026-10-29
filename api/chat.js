/**
 * AGROCONECTA - Vercel Serverless Function para AgroBot
 * Protocolo de Seguridad con Meta Muse Spark 1.3 Contributor
 * Endpoint: /api/chat
 * 
 * Este endpoint se ejecuta del lado del servidor en Vercel:
 * 1. Lee la clave MODEL_API_KEY desde las Variables de Entorno de Vercel (Environment Variables).
 * 2. La clave NUNCA se expone en el navegador ni en las herramientas de desarrollo (F12).
 * 3. Se ejecuta en el mismo dominio de la web, eliminando problemas de CORS.
 */

module.exports = async function handler(req, res) {
  // Configuración de encabezados CORS y métodos permitidos
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Responder de inmediato a las solicitudes OPTIONS (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Solo se acepta POST.' });
  }

  try {
    // Manejar el cuerpo de la solicitud
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { mensaje, historial = [] } = body;

    if (!mensaje || typeof mensaje !== 'string') {
      return res.status(400).json({ error: 'El mensaje del usuario es requerido.' });
    }

    // Obtener la clave de Meta AI configurada en Vercel
    const apiKey = process.env.MODEL_API_KEY || process.env.META_MODEL_API_KEY;

    if (!apiKey) {
      console.warn('[AgroBot Vercel] Variable MODEL_API_KEY no encontrada en las variables de entorno de Vercel.');
      return res.status(500).json({
        error: 'MODEL_API_KEY no configurada en Vercel. Ve a Project Settings > Environment Variables y agrégala.',
        fallback_required: true
      });
    }

    // Transformar el historial al formato oficial de Meta Responses API (/v1/responses)
    const metaInput = historial.map(item => ({
      role: item.role === 'assistant' ? 'assistant' : (item.role === 'system' ? 'system' : 'user'),
      content: [
        {
          type: 'input_text',
          text: item.content
        }
      ]
    }));

    // Asegurar que el mensaje actual del usuario esté en la consulta
    if (!metaInput.some(i => i.role === 'user' && i.content[0]?.text === mensaje)) {
      metaInput.push({
        role: 'user',
        content: [{ type: 'input_text', text: mensaje }]
      });
    }

    // Llamada segura a la API oficial de Meta AI desde el servidor de Vercel
    const metaResponse = await fetch('https://api.meta.ai/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'muse-spark-1.3-contributor',
        input: metaInput,
        stream: false
      })
    });

    if (!metaResponse.ok) {
      const errorText = await metaResponse.text();
      console.error('[Meta AI API Error on Vercel]:', metaResponse.status, errorText);
      return res.status(metaResponse.status).json({
        error: `Error recibido de Meta AI API (${metaResponse.status}): ${errorText}`,
        fallback_required: true
      });
    }

    const data = await metaResponse.json();

    // Extraer la respuesta del bloque 'output_text'
    const outputBlock = data.output?.find(b => b.type === 'output_text');
    const replyText = outputBlock?.text || data.output?.[0]?.text || '';

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
