# DRISHTI — Evidence-Fusion Digital Twin for MPLADS Governance

SIH 2026 prototype for **SIH26102: AI-powered detection of anomalies, fraud and inefficiencies in MPLADS implementation**.

DRISHTI is an **AI-assisted audit and decision-support layer over MPLADS/eSAKSHI**, not a replacement for eSAKSHI and not an automatic fraud adjudication system.

## What is implemented

- Executive MPLADS overview and allocation snapshot
- Digital Twin: MP → constituency → monitored work → risk state
- AI Audit Command Centre with compliance, early-warning, agency, evidence and model-governance views
- Isolation Forest inference + deterministic audit rules with explainable risk signals
- Ward Risk Map with geographic map view
- Multi-modal fraud deep-dive workflow
- Field Intelligence Hub with Copernicus Data Space catalogue search, AOI context, scene inspection, timeline/timelapse UX and audit copilot
- Secure server-side Copernicus token/process/statistics endpoints
- Kannada interface toggle in Field Intelligence
- Explicit evidence/provenance boundaries and human-review safeguards

## Data boundaries — important for the SIH demo

The supplied MPLADS dashboard CSV is an **allocation/MP master extract**, not a project register. It must not be converted into invented work orders. Project-level anomaly scoring is demonstrated only with controlled synthetic testing scenarios unless an authorised work-level dataset is connected.

The UI distinguishes:

1. **Supplied/official-source extract** — allocation baseline supplied for this prototype.
2. **Synthetic demo records** — controlled records used to demonstrate project-level audit logic.
3. **Live public EO catalogue** — Copernicus Data Space catalogue discovery where available.
4. **Authorised production integrations** — eSAKSHI/BHOONIDHI and historical project data are integration boundaries requiring approved access and credentials.

**An AI flag is an audit signal, not a finding of fraud. Human review is required.**

## Local development

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

Supabase frontend variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

See `.env.example`.

## Copernicus Data Space configuration

The browser must never receive the Copernicus client secret. The repository includes server endpoints under `api/copernicus/` that exchange credentials server-side and proxy authenticated processing/statistics requests.

Configure these **only in the deployment platform's server-side environment settings**:

- `COPERNICUS_CLIENT_ID`
- `COPERNICUS_CLIENT_SECRET`

Do not commit these values and do not put them in `VITE_*` variables.

After adding deployment environment variables, redeploy the project so the server functions receive them.

The current Field Intelligence catalogue discovery remains intentionally usable without credentials where the public catalogue permits it. Authenticated Processing/Statistics features are designed to activate through the secure server boundary once approved credentials are configured.

## Government data ingestion

`cleaner.py` and `scripts/batch_audit.mjs` support controlled work-level ingestion/auditing. The cleaner intentionally requires a real work/project identifier and does not manufacture project IDs from allocation-only data.

## Architecture

```text
MPLADS / eSAKSHI       BHOONIDHI       Copernicus
 recommendations       EO evidence      Sentinel processing
 sanctions/payments        |                 |
          \               |                /
           \              |               /
             -------- DRISHTI DATA HUB --------
                         |
              validation / normalization
                         |
                   DIGITAL TWIN
                         |
                    AI AUDIT ENGINE
             ML + rules + evidence fusion
                         |
                    RISK FUSION
                         |
                  EARLY WARNING
                         |
                 DECISION CENTRE
          evidence → action → audit trail
```

## Production hardening still required

Operational deployment requires authorised government work-level data, approved eSAKSHI/BHOONIDHI access, historical records for model calibration, security/identity integration, role-based permissions and institutional approval. The prototype deliberately does not fabricate any of those dependencies.
