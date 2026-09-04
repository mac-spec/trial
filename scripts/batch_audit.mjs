#!/usr/bin/env node
/** Batch-trigger the live audit-pipeline for every PENDING_AUDIT work order.
 * Required env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 * Optional: AUDIT_FUNCTION_URL
 */

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const endpoint = process.env.AUDIT_FUNCTION_URL || `${url}/functions/v1/audit-pipeline`;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
};

const response = await fetch(`${url}/rest/v1/work_orders?select=work_id&status=eq.PENDING_AUDIT`, { headers });
if (!response.ok) throw new Error(`Could not read pending work orders (${response.status})`);
const rows = await response.json();

console.log(`Found ${rows.length} pending work order(s).`);
let ok = 0;
for (const row of rows) {
  try {
    const audit = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ work_id: row.work_id, mode: 'freeze' }),
    });
    const body = await audit.json().catch(() => ({}));
    if (!audit.ok || !body.success) throw new Error(body.error || body.message || `HTTP ${audit.status}`);
    ok += 1;
    console.log(`✓ ${row.work_id}: ${body.status}`);
  } catch (error) {
    console.error(`✗ ${row.work_id}: ${error.message}`);
  }
}

console.log(`Completed ${ok}/${rows.length} audit request(s).`);
process.exit(ok === rows.length ? 0 : 2);
