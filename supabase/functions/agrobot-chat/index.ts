// ==============================================================================
// AGROCONECTA - Supabase Edge Function: agrobot-chat
// Protocolo Estricto de Seguridad para Meta Muse Spark 1.3 Contributor
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Extractor robusto de texto compatible con Meta Responses API y OpenAI
function extraerTextoRespuestaMeta(data: any): string {
  if (!data) return "";

  if (Array.isArray(data.output)) {
    for (const item of data.output) {
      if (item.type === "output_text" && typeof item.text === "string" && item.text.trim()) {
        return item.text.trim();
      }
      if (Array.isArray(item.content)) {
        for (const block of item.content) {
          if ((block.type === "output_text" || !block.type) && typeof block.text === "string" && block.text.trim()) {
            return block.text.trim();
          }
        }
      }
      if (typeof item.text === "string" && item.text.trim()) {
        return item.text.trim();
      }
    }
  }

  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content.trim();
  }

  if (typeof data.reply === "string" && data.reply.trim()) return data.reply.trim();
  if (typeof data.response === "string" && data.response.trim()) return data.response.trim();
  if (typeof data.text === "string" && data.text.trim()) return data.text.trim();

  return "";
}

serve(async (req: Request) => {
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

    // Extraer system instructions si existe
    const systemItem = historial.find((i: any) => i.role === "system");
    const systemInstructions = systemItem ? systemItem.content : "";

    const conversationMessages = historial.filter((i: any) => i.role === "user" || i.role === "assistant");
    const metaInput = conversationMessages.map((item: any) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: [
        {
          type: "input_text",
          text: item.content,
        },
      ],
    }));

    if (!metaInput.some((i: any) => i.role === "user" && i.content[0]?.text === mensaje)) {
      metaInput.push({
        role: "user",
        content: [{ type: "input_text", text: mensaje }],
      });
    }

    const requestPayload: any = {
      model: "muse-spark-1.3-contributor",
      input: metaInput,
      stream: false,
    };

    if (systemInstructions) {
      requestPayload.instructions = systemInstructions;
    }

    let metaResponse = await fetch("https://api.meta.ai/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${modelApiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (metaResponse.status === 400 && requestPayload.instructions) {
      delete requestPayload.instructions;
      metaResponse = await fetch("https://api.meta.ai/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${modelApiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });
    }

    if (!metaResponse.ok) {
      const errText = await metaResponse.text();
      console.error("[Meta AI API Error]:", metaResponse.status, errText);
      return new Response(
        JSON.stringify({
          error: `Error de Meta AI API (${metaResponse.status}): ${errText}`,
          fallback_required: true,
        }),
        { status: metaResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await metaResponse.json();
    const replyText = extraerTextoRespuestaMeta(data);

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
