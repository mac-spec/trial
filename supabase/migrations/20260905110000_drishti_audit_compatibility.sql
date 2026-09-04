-- Compatibility layer: the original migration used the internal table name kavach_audit_trail.
-- DRISHTI uses the public product name while preserving existing data/schema.
CREATE OR REPLACE VIEW public.drishti_audit_trail AS
SELECT audit_id, work_id, actor, action_executed, justification_log, created_at
FROM public.kavach_audit_trail;

GRANT SELECT, INSERT ON public.drishti_audit_trail TO anon, authenticated;
