/* SIH complete audit schema upgrade.
   Safe against the current repo schema: work_orders has ward_name (not ward_id),
   and bangalore_wards is not part of the repository migrations. */

-- pgvector is used only as an optional storage column for future semantic duplicate detection.
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

ALTER TABLE public.work_orders
  ADD COLUMN IF NOT EXISTS mp_name text,
  ADD COLUMN IF NOT EXISTS constituency text,
  ADD COLUMN IF NOT EXISTS total_expenditure numeric(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_payments_released numeric(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS physical_progress_percentage numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expected_progress_percentage numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS target_date date,
  ADD COLUMN IF NOT EXISTS is_demo_data boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS work_title_vector extensions.vector(1536);

-- Keep existing UI column names while exposing the governance terminology expected by the SIH workflow.
COMMENT ON COLUMN public.work_orders.budget IS 'Sanctioned amount / approved work budget in INR';
COMMENT ON COLUMN public.work_orders.total_expenditure IS 'Cumulative expenditure in INR';
COMMENT ON COLUMN public.work_orders.total_payments_released IS 'Cumulative payments released in INR';
COMMENT ON COLUMN public.work_orders.physical_progress_percentage IS 'Reported physical progress, 0-100';
COMMENT ON COLUMN public.work_orders.expected_progress_percentage IS 'Expected physical progress at audit date, 0-100';

-- Normalize incoming financial state and make the freeze amount deterministic.
CREATE OR REPLACE FUNCTION public.sync_work_order_financial_state()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.total_expenditure := GREATEST(COALESCE(NEW.total_expenditure, 0), 0);
  NEW.total_payments_released := GREATEST(COALESCE(NEW.total_payments_released, 0), 0);
  NEW.physical_progress_percentage := LEAST(GREATEST(COALESCE(NEW.physical_progress_percentage, 0), 0), 100);
  NEW.expected_progress_percentage := LEAST(GREATEST(COALESCE(NEW.expected_progress_percentage, 0), 0), 100);

  IF NEW.status = 'frozen' OR NEW.status = 'FUNDS_FROZEN' THEN
    NEW.funds_frozen := COALESCE(NEW.budget, 0);
    NEW.status := 'frozen';
  ELSIF NEW.status IS DISTINCT FROM 'frozen' THEN
    NEW.funds_frozen := COALESCE(NEW.funds_frozen, 0);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_work_order_financial_state ON public.work_orders;
CREATE TRIGGER trigger_sync_work_order_financial_state
BEFORE INSERT OR UPDATE OF status, budget, total_expenditure, total_payments_released,
  physical_progress_percentage, expected_progress_percentage ON public.work_orders
FOR EACH ROW EXECUTE FUNCTION public.sync_work_order_financial_state();

-- Immutable system/auditor action log.
CREATE TABLE IF NOT EXISTS public.kavach_audit_trail (
  audit_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id text REFERENCES public.work_orders(work_id) ON DELETE CASCADE,
  actor text NOT NULL DEFAULT 'AI_FORENSIC_AGENT',
  action_executed text NOT NULL,
  justification_log text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.kavach_audit_trail ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_trail_insert" ON public.kavach_audit_trail;
CREATE POLICY "audit_trail_insert" ON public.kavach_audit_trail
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "audit_trail_select" ON public.kavach_audit_trail;
CREATE POLICY "audit_trail_select" ON public.kavach_audit_trail
  FOR SELECT TO anon, authenticated USING (true);

-- Explicitly reject mutations so the audit history is append-only even for privileged clients.
CREATE OR REPLACE FUNCTION public.prevent_audit_trail_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'kavach_audit_trail is immutable; append a new audit event instead';
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_audit_trail_update ON public.kavach_audit_trail;
CREATE TRIGGER trigger_prevent_audit_trail_update
BEFORE UPDATE OR DELETE ON public.kavach_audit_trail
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_trail_mutation();

-- Useful live aggregation surface for the dashboard.
CREATE OR REPLACE VIEW public.kavach_work_order_metrics AS
SELECT
  COUNT(*)::bigint AS work_count,
  COALESCE(SUM(budget), 0)::numeric AS sanctioned_total,
  COALESCE(SUM(total_expenditure), 0)::numeric AS expenditure_total,
  COALESCE(SUM(total_payments_released), 0)::numeric AS payments_total,
  COALESCE(SUM(funds_frozen), 0)::numeric AS frozen_total,
  COUNT(*) FILTER (WHERE risk_level = 'high' OR status = 'frozen')::bigint AS high_risk_count,
  COUNT(*) FILTER (WHERE expected_progress_percentage - physical_progress_percentage >= 15)::bigint AS delayed_count
FROM public.work_orders;

GRANT SELECT ON public.kavach_work_order_metrics TO anon, authenticated;
