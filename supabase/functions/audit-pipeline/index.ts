import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  try {
    const { work_id, mode = "freeze" } = await req.json();
    if (!work_id) return json({ error: "work_id is required" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Supabase server configuration is missing" }, 500);
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: work, error: fetchError } = await supabase.from("work_orders").select("*").eq("work_id", work_id).maybeSingle();
    if (fetchError) return json({ error: fetchError.message }, 500);
    if (!work) return json({ error: "Work order not found" }, 404);

    if (mode === "vision") {
      // The repository currently has no external VLM provider configured. Keep this path
      // deterministic and transparent rather than generating random evidence.
      const score = Number(work.shadow_geometry_score ?? 100);
      const gpsVerified = work.gps_verified === true;
      const timestampVerified = work.timestamp_verified === true;
      const duplicateDetected = work.duplicate_detected === true;
      const visionRisk = Math.min(100, (score < 70 ? 45 : 0) + (!gpsVerified ? 25 : 0) + (!timestampVerified ? 15 : 0) + (duplicateDetected ? 30 : 0));

      const { error } = await supabase.from("vision_forensics").update({
        ai_status: "completed",
        updated_at: new Date().toISOString(),
      }).eq("work_id", work_id);
      if (error) return json({ error: error.message }, 500);

      return json({ success: true, work_id, mode, risk_score: visionRisk, risk_level: visionRisk >= 70 ? "high" : visionRisk >= 40 ? "medium" : "low", status: "COMPLETED", funds_frozen: false, message: "Vision record evaluated using available stored forensic evidence. Configure a VLM provider for image inference." });
    }

    // Heuristic audit that works with the existing work_orders schema. If the government
    // import contains optional inflation fields, they are used; otherwise the record stays
    // reviewable without inventing a reference price.
    const inflation = Number(work.inflation_percentage ?? work.price_inflation_percentage ?? 0);
    const hasInflationSignal = Number.isFinite(inflation) && inflation > 0;
    const inflationThreshold = 20;
    let risk = Number(work.risk_score ?? 0);
    if (hasInflationSignal) risk = Math.max(risk, Math.min(100, inflation * 3));
    if (!work.contractor && !work.contractor_name) risk += 10;
    if (!work.title) risk += 10;
    if (!Number(work.budget) || Number(work.budget) <= 0) risk += 15;
    risk = Math.min(100, Math.round(risk * 10) / 10);

    const highRisk = risk >= 70 || (hasInflationSignal && inflation > inflationThreshold);
    const mediumRisk = risk >= 40;
    const riskLevel = highRisk ? "high" : mediumRisk ? "medium" : "low";
    const nextStatus = highRisk ? "frozen" : "under_review";
    const frozen = highRisk ? Number(work.budget ?? 0) : 0;

    const { data, error } = await supabase.from("work_orders").update({
      risk_score: risk,
      risk_level: riskLevel,
      status: nextStatus,
      funds_frozen: frozen,
    }).eq("work_id", work_id).select().single();

    if (error) return json({ error: error.message }, 500);
    return json({
      success: true,
      work_id,
      status: highRisk ? "FUNDS_FROZEN" : "AUDIT_COMPLETE",
      funds_frozen: frozen,
      risk_score: risk,
      risk_level: riskLevel,
      inflation_percentage: hasInflationSignal ? inflation : null,
      inflation_threshold: inflationThreshold,
      message: highRisk ? `High-risk audit completed. Funds frozen for ${work_id}.` : `Audit completed for ${work_id}; record moved to review.`,
      work_order: data,
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unknown server error" }, 500);
  }
});
