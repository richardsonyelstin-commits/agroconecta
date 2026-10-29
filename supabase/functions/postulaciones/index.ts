// ==============================================================================
// AGROCONECTA - Supabase Edge Function: postulaciones
// Endpoint seguro para recibir solicitudes sin exponer ninguna clave en el cliente
// Despliegue: supabase functions deploy postulaciones --no-verify-jwt
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const payload = await req.json();

    // Validación básica de campos obligatorios
    if (!payload.nombre_completo || !payload.dni_ruc || !payload.correo || !payload.telefono) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios en el formulario" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Inicializar cliente con variables de entorno del servidor (cero exposición al cliente)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("postulaciones")
      .insert([{
        nombre_completo: payload.nombre_completo,
        dni_ruc: payload.dni_ruc,
        correo: payload.correo,
        telefono: payload.telefono,
        fecha_nacimiento: payload.fecha_nacimiento || null,
        rol_usuario: payload.rol_usuario || "productor",
        region_valle: payload.region_valle || "",
        cultivo_interes: payload.cultivo_interes || "",
        hectareas: Number(payload.hectareas) || 0,
        monto_estimado: Number(payload.monto_estimado) || 0,
        duracion_campana: Number(payload.duracion_campana) || 6,
        archivo_url: payload.archivo_url || null,
        mensaje_detallado: payload.mensaje_detallado || null,
        acepto_terminos: Boolean(payload.acepto_terminos),
        boletin_noticias: Boolean(payload.boletin_noticias),
        estado: "pendiente"
      }])
      .select();

    if (error) {
      console.error("[Edge Function Error]:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
