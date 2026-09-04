# Kavach — Bangalore MPLADS AI Audit Dashboard

A React + Supabase dashboard for MPLADS anomaly detection, fund controls, vision-forensics workflow and collusion-network review.

## Run locally / in Replit

```bash
npm install
npm run dev
```

Configure these environment variables before connecting live Supabase data:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

A template is provided in `.env.example`.

## Government workbook ingestion

The repository now includes `cleaner.py` and `requirements.txt`.

```bash
pip install -r requirements.txt
python cleaner.py --input raw_govt_data.xlsx --output cleaned_government_upload.csv
```

Imported project rows are initialized as `PENDING_AUDIT`, risk `0.0`, and frozen funds `0`. They must contain a real work/project identifier; the cleaner intentionally never invents project IDs.

The batch runner calls the live Supabase Edge Function for every pending work order:

```bash
node scripts/batch_audit.mjs
```

## Audit pipeline

`supabase/functions/audit-pipeline/index.ts` is deterministic and threshold-aware. The current inflation threshold is **20%**. High-risk records are moved to `frozen` and their budget is recorded as frozen; other audited records move to `under_review`.

The vision endpoint evaluates stored forensic fields deterministically. An external VLM provider is intentionally not hard-coded because no provider credential/model is present in the repository.

## Important data note

The supplied `Allocated Limit for Honble MPs.xlsx` is an MP allocation-limit workbook, not a project/work-order register. It contains constituency allocation records but does not provide the project-level fields required by `work_orders` (such as a project/work ID, project title, contractor and sanctioned work cost). It therefore must not be converted into fake work orders. Use a project/work register export for `cleaner.py` ingestion.
