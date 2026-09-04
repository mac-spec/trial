import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Play, ShieldAlert, Upload, Zap } from 'lucide-react';

export type AuditRow = {
  work_id: string;
  title: string;
  constituency: string;
  ward: string;
  contractor: string;
  sanctioned: number;
  expenditure: number;
  payment: number;
  progress: number;
  expected_progress: number;
  target_date: string;
  risk: number;
  compliance: number;
  findings: string[];
};

const sampleCsv = `work_id,title,constituency,ward,contractor,sanctioned,expenditure,payment,progress,expected_progress,target_date\nDEMO-001,Stormwater Drain Re-lining,Bangalore North,Varthur,Alpha Infra,4200000,3460000,3120000,68,78,2026-08-10\nDEMO-002,Road Re-asphalting,Bangalore Central,Indiranagar,Metro Works,3100000,2870000,2870000,91,96,2026-09-10\nDEMO-003,Community Hall,Bangalore North,Hebbal,Civic Build Co,5600000,1240000,1890000,23,54,2026-06-30\nDEMO-004,Park Landscaping,Bangalore South,Banashankari,GreenSpace Works,1850000,1510000,1480000,71,75,2026-09-20`;

function money(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function num(value: string | undefined) {
  const n = Number(String(value ?? '').replace(/[₹,\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const parseLine = (line: string) => {
    const cells: string[] = [];
    let current = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const c = line[i];
      if (c === '"') { if (quoted && line[i + 1] === '"') { current += '"'; i += 1; } else quoted = !quoted; }
      else if (c === ',' && !quoted) { cells.push(current.trim()); current = ''; }
      else current += c;
    }
    cells.push(current.trim());
    return cells;
  };
  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));
  return lines.slice(1).map(line => {
    const values = parseLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

function field(row: Record<string, string>, aliases: string[]) {
  for (const alias of aliases) if (row[alias] !== undefined && row[alias] !== '') return row[alias];
  return '';
}

function similarity(a: string, b: string) {
  const A = new Set(a.toLowerCase().split(/[^a-z0-9]+/).filter(x => x.length > 2));
  const B = new Set(b.toLowerCase().split(/[^a-z0-9]+/).filter(x => x.length > 2));
  if (!A.size || !B.size) return 0;
  let common = 0; A.forEach(x => { if (B.has(x)) common += 1; });
  return common / new Set([...A, ...B]).size;
}

function scoreRows(raw: Record<string, string>[]): AuditRow[] {
  return raw.map((r, index) => {
    const sanctioned = num(field(r, ['sanctioned', 'sanctioned_amount', 'sanctioned_cost', 'budget', 'cost']));
    const expenditure = num(field(r, ['expenditure', 'actual_expenditure', 'spent', 'expenditure_amount']));
    const payment = num(field(r, ['payment', 'payments', 'amount_paid', 'paid']));
    const progress = Math.min(100, Math.max(0, num(field(r, ['progress', 'physical_progress', 'physical_progress_percent']))));
    const expected = Math.min(100, Math.max(0, num(field(r, ['expected_progress', 'planned_progress', 'expected_physical_progress'])) || progress));
    const findings: string[] = [];
    let risk = 10;
    const costRatio = sanctioned ? expenditure / sanctioned : 0;
    if (costRatio > 1) { risk += 35; findings.push(`Expenditure exceeds sanction by ${((costRatio - 1) * 100).toFixed(1)}%`); }
    if (sanctioned && payment / sanctioned > Math.max(progress / 100 + 0.12, 0.55)) { risk += 20; findings.push('Payment is ahead of physical progress'); }
    if (expected - progress >= 15) { risk += 25; findings.push(`Progress gap of ${(expected - progress).toFixed(0)} percentage points`); }
    if (progress === 0 && payment > 0) { risk += 20; findings.push('Payment recorded with zero physical progress'); }
    if (!sanctioned) { risk += 15; findings.push('Missing sanctioned value'); }
    if (!field(r, ['contractor', 'contractor_name', 'vendor', 'vendor_name'])) { risk += 10; findings.push('Missing contractor identity'); }
    return {
      work_id: field(r, ['work_id', 'work_code', 'project_id', 'serial_no', 'sl_no']) || `UPLOADED-${index + 1}`,
      title: field(r, ['title', 'project_name', 'work_name', 'description']) || 'Untitled work',
      constituency: field(r, ['constituency', 'mp_constituency', 'parliamentary_constituency']) || 'Unspecified',
      ward: field(r, ['ward', 'ward_name', 'locality', 'location', 'nodal_district']) || 'Unspecified',
      contractor: field(r, ['contractor', 'contractor_name', 'vendor', 'vendor_name']) || 'Unspecified',
      sanctioned, expenditure, payment, progress, expected_progress: expected,
      target_date: field(r, ['target_date', 'completion_date', 'expected_completion_date']) || '',
      risk: Math.min(100, Math.round(risk)),
      compliance: Math.max(0, 100 - Math.round(risk * 0.65)),
      findings: findings.length ? findings : ['No major rule-based anomaly detected'],
    };
  });
}

export function LiveAuditLab() {
  const [rows, setRows] = useState<AuditRow[]>(() => scoreRows(parseCsv(sampleCsv)));
  const [fileName, setFileName] = useState('Built-in demonstration dataset');
  const [processing, setProcessing] = useState(false);
  const [selected, setSelected] = useState<AuditRow | null>(null);
  const [message, setMessage] = useState('');

  const stats = useMemo(() => ({
    total: rows.reduce((s, r) => s + r.sanctioned, 0),
    spend: rows.reduce((s, r) => s + r.expenditure, 0),
    high: rows.filter(r => r.risk >= 75).length,
    delayed: rows.filter(r => r.expected_progress - r.progress >= 15).length,
  }), [rows]);

  const runAudit = (nextRows: AuditRow[], name: string) => {
    setProcessing(true); setMessage('Running validation → anomaly rules → risk scoring…');
    window.setTimeout(() => { setRows(nextRows); setFileName(name); setProcessing(false); setMessage(`Audit complete: ${nextRows.length} work records analyzed.`); }, 700);
  };

  const upload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) { setMessage('For browser-only live demo mode, upload CSV. XLSX ingestion remains available through the Python backend.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCsv(String(reader.result ?? ''));
      if (!parsed.length) { setMessage('No usable CSV rows found.'); return; }
      runAudit(scoreRows(parsed), file.name);
    };
    reader.readAsText(file);
  };

  const downloadSample = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'kavach_demo_work_orders.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return <div className="space-y-5">
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div><div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest"><Zap className="w-4 h-4" /> Live Audit Lab</div><h2 className="text-xl font-bold text-white mt-2">Upload data. Run the audit. Inspect the risk.</h2><p className="text-xs text-slate-400 mt-1 max-w-2xl">Browser-side demo mode performs deterministic financial, progress and compliance checks on the dataset currently loaded. No OpenAI API is required.</p></div>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold"><Upload className="w-4 h-4" /> Upload CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.currentTarget.value = ''; }} /></label>
          <button onClick={downloadSample} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs"><Download className="w-4 h-4" /> Sample CSV</button>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500"><FileSpreadsheet className="w-3.5 h-3.5" /> Source: {fileName}</div>
    </div>

    {message && <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-300 flex items-center gap-2">{processing ? <Play className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}{message}</div>}

    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <Metric label="Sanctioned portfolio" value={money(stats.total)} />
      <Metric label="Expenditure" value={money(stats.spend)} />
      <Metric label="High-risk works" value={String(stats.high)} alert={stats.high > 0} />
      <Metric label="Progress-gap alerts" value={String(stats.delayed)} alert={stats.delayed > 0} />
    </div>

    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between"><div><h3 className="text-sm font-semibold text-white">Live Risk Register</h3><p className="text-[10px] text-slate-500">Every row below was scored from the loaded dataset.</p></div><span className="text-[10px] text-slate-500">{rows.length} records</span></div>
      <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="text-slate-600 border-b border-slate-800"><th className="text-left p-3">Work</th><th className="text-right p-3">Sanction</th><th className="text-right p-3">Spend</th><th className="text-right p-3">Progress</th><th className="text-right p-3">Risk</th><th className="text-right p-3">Action</th></tr></thead><tbody>{rows.map(r => <tr key={r.work_id} className="border-b border-slate-800/70 hover:bg-slate-800/30"><td className="p-3"><p className="font-medium text-slate-300">{r.title}</p><p className="text-[10px] text-slate-600">{r.work_id} · {r.ward} · {r.contractor}</p></td><td className="text-right text-slate-400">{money(r.sanctioned)}</td><td className="text-right text-slate-400">{money(r.expenditure)}</td><td className="text-right"><span className={r.expected_progress-r.progress>=15?'text-red-400':'text-emerald-400'}>{r.progress}% / {r.expected_progress}%</span></td><td className="text-right"><span className={`font-bold ${r.risk>=75?'text-red-400':r.risk>=50?'text-amber-400':'text-emerald-400'}`}>{r.risk}</span></td><td className="text-right"><button onClick={() => setSelected(r)} className="px-2.5 py-1.5 rounded border border-slate-700 text-slate-300 hover:text-white">Inspect</button></td></tr>)}</tbody></table></div>
    </div>

    {selected && <div className="rounded-xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-widest text-slate-500">Evidence-based rule trace</p><h3 className="text-base font-bold text-white mt-1">{selected.title}</h3><p className="text-xs text-slate-500 mt-1">{selected.work_id} · {selected.constituency} · {selected.ward}</p></div><button onClick={() => setSelected(null)} className="text-xs text-slate-500 hover:text-white">Close</button></div><div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4"><Trace label="Risk score" value={String(selected.risk)} /><Trace label="Compliance" value={`${selected.compliance}%`} /><Trace label="Payment" value={money(selected.payment)} /><Trace label="Physical progress" value={`${selected.progress}%`} /></div><div className="mt-4 space-y-2">{selected.findings.map((f, i) => <div key={i} className="flex gap-2 text-xs text-slate-300 bg-slate-950/60 border border-slate-800 rounded-lg p-3"><AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />{f}</div>)}</div><div className="mt-4 flex gap-2"><button onClick={() => setMessage(`Manual audit requested for ${selected.work_id}. Decision recorded in this demo session.`)} className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">Request physical audit</button><button onClick={() => setMessage(`Funds hold applied to ${selected.work_id} in this demo session.`)} className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">Freeze funds</button></div></div>}

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex items-start gap-3"><ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" /><div><p className="text-xs font-semibold text-white">Truthful demo boundary</p><p className="text-[10px] leading-4 text-slate-500 mt-1">The built-in records are illustrative audit scenarios, not government work orders. Authorized MoSPI/eSAKSHI connectors can feed verified operational data through the same ingestion layer.</p></div></div>
  </div>;
}

function Metric({ label, value, alert }: { label: string; value: string; alert?: boolean }) { return <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-[11px] text-slate-500">{label}</p><p className={`text-xl font-bold mt-1 ${alert?'text-red-400':'text-white'}`}>{value}</p></div>; }
function Trace({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-slate-950 border border-slate-800 p-3"><p className="text-[10px] text-slate-600">{label}</p><p className="text-sm font-bold text-slate-200 mt-1">{value}</p></div>; }
