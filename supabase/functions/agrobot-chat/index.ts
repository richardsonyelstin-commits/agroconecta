// ==============================================================================
// AGROCONECTA - Supabase Edge Function: agrobot-chat
// Protocolo Estricto de Seguridad para Meta Muse Spark 1.3 Contributor
//
// Esta función actúa como proxy seguro del lado del servidor:
// 1. La clave privada MODEL_API_KEY se almacena como variable de entorno secreta en el servidor.
// 2. Ningún usuario o atacante puede ver ni interceptar la clave desde el navegador (F12).
// 3. Resuelve problemas de CORS que ocurrirían si el navegador llama directamente a Meta AI.
//
// Despliegue con CLI de Supabase:
// supabase secrets set MODEL_API_KEY=tu_clave_secreta
// supabase functions deploy agrobot-chat --no-verify-jwt
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Manejo de preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método no permitido" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mensaje, historial = [] } = await req.json();

    if (!mensaje || typeof mensaje !== "string") {
      return new Response(JSON.stringify({ error: "El mensaje es requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Obtener la clave secreta desde las variables de entorno del servidor
    const modelApiKey = Deno.env.get("MODEL_API_KEY") || Deno.env.get("META_MODEL_API_KEY");
    if (!modelApiKey) {
      return new Response(
        JSON.stringify({
          error: "MODEL_API_KEY no configurada en las variables de entorno de Supabase.",
          fallback_required: true,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transformar el historial al formato oficial de Meta Responses API (input con input_text)
    const metaInput = historial.map((item: { role: string; content: string }) => ({
      role: item.role === "assistant" ? "assistant" : item.role === "system" ? "system" : "user",
      content: [
        {
          type: "input_text",
          text: item.content,
        },
      ],
    }));

    // Agregar el mensaje actual del usuario si no está en el historial
    if (!metaInput.some((i: { role: string; content: Array<{ text: string }> }) => i.role === "user" && i.content[0]?.text === mensaje)) {
      metaInput.push({
        role: "user",
        content: [{ type: "input_text", text: mensaje }],
      });
    }

    // Petición oficial a Meta Responses API
    const metaResponse = await fetch("https://api.meta.ai/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${modelApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "muse-spark-1.3-contributor",
        input: metaInput,
        stream: false,
      }),
    });

    if (!metaResponse.ok) {
      const errText = await metaResponse.text();
      console.error("[Meta AI API Error]:", metaResponse.status, errText);
      return new Response(
        JSON.stringify({
          error: `Error de Meta AI API (${metaResponse.status}): ${errText}`,
          fallback_required: true,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await metaResponse.json();

    // Extraer texto generado del bloque 'output_text'
    const outputBlock = data.output?.find(
      (b: { type: string; text?: string }) => b.type === "output_text"
    );
    const replyText = outputBlock?.text || data.output?.[0]?.text || "";

    return new Response(
      JSON.stringify({
        success: true,
        reply: replyText,
        model: data.model || "muse-spark-1.3-contributor",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[Edge Function Exception]:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message, fallback_required: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
