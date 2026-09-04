import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { work_id, mode } = await req.json();

    if (!work_id) {
      return new Response(
        JSON.stringify({ error: "work_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch the work order to get its budget
    const { data: existing, error: fetchError } = await supabase
      .from("work_orders")
      .select("budget")
      .eq("work_id", work_id)
      .maybeSingle();

    if (fetchError || !existing) {
      return new Response(
        JSON.stringify({ error: "Work order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Vision analysis mode: analyze uploaded photo and update vision_forensics
    if (mode === "vision") {
      // Simulate AI vision processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate plausible vision analysis results
      const shadowScore = Math.round((40 + Math.random() * 40) * 10) / 10;
      const gpsVerified = Math.random() > 0.3;
      const timestampVerified = Math.random() > 0.2;
      const duplicateDetected = Math.random() > 0.7;

      // Update vision_forensics with results
      const { error: visionError } = await supabase
        .from("vision_forensics")
        .update({
          shadow_geometry_score: shadowScore,
          gps_verified: gpsVerified,
          timestamp_verified: timestampVerified,
          duplicate_detected: duplicateDetected,
          ai_status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("work_id", work_id);

      if (visionError) {
        return new Response(
          JSON.stringify({ error: visionError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If shadow score is below 70, freeze funds
      let fundsFrozen = false;
      if (shadowScore < 70) {
        const { error: freezeError } = await supabase
          .from("work_orders")
          .update({ status: "frozen", funds_frozen: existing.budget })
          .eq("work_id", work_id);

        if (!freezeError) {
          await supabase
            .from("vision_forensics")
            .update({ ai_status: "funds_frozen" })
            .eq("work_id", work_id);
          fundsFrozen = true;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          work_id,
          mode: "vision",
          shadow_geometry_score: shadowScore,
          gps_verified: gpsVerified,
          timestamp_verified: timestampVerified,
          duplicate_detected: duplicateDetected,
          funds_frozen: fundsFrozen,
          status: fundsFrozen ? "FUNDS_FROZEN" : "COMPLETED",
          message: fundsFrozen
            ? `Vision analysis complete. Shadow/geometry score ${shadowScore}% below threshold. Funds frozen.`
            : `Vision analysis complete. Shadow/geometry score ${shadowScore}%.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default mode: freeze funds (original behavior)
    // Simulate AI pipeline processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { data, error } = await supabase
      .from("work_orders")
      .update({
        status: "frozen",
        funds_frozen: existing.budget,
      })
      .eq("work_id", work_id)
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        work_id,
        status: "FUNDS_FROZEN",
        funds_frozen: data.funds_frozen,
        message: `AI pipeline completed. Work order ${work_id} funds have been frozen.`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
