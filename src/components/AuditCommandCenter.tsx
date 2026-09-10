import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowUpRight, BarChart3, CheckCircle2, ClipboardCheck, Database, FileSearch, Gauge, Network, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';
import type { WorkOrder } from '@/services/auditService';

type Tab = 'hub' | 'compliance' | 'early' | 'agency' | 'evidence' | 'model';

const n = (v: unknown) => Number(v || 0);
const pct = (v: number) => `${Math.round(Math.max(0, Math.min(100, v)))}%`;

export function AuditCommandCenter({ workOrders }: { workOrders: WorkOrder[] }) {
  const [tab, setTab] = useState<Tab>('hub');
  const [selectedId, setSelectedId] = useState(workOrders[0]?.work_id || '');
  const selected = useMemo(() => workOrders.find(w => w.work_id === selectedId) || workOrders[0], [selectedId, workOrders]);
  const high = workOrders.filter(w => w.risk_level === 'high');
  const medium = workOrders.filter(w => w.risk_level === 'medium');
  const compliance = workOrders.map(w => {
    const progress = n(w.physical_progress_percentage);
    const expected = n(w.expected_progress_percentage);
    const evidence = Boolean((w as any).is_demo_data) ? 60 : 80;
    const score = Math.round(Math.max(0, Math.min(100, 100 - Math.max(0, expected - progress) * .5 - (n(w.delay_days) > 0 ? 12 : 0) - (evidence < 70 ? 12 : 0))));
    return { w, score };
  });
  const avgCompliance = compliance.length ? Math.round(compliance.reduce((s, x) => s + x.score, 0) / compliance.length) : 0;
  const agencyMap = new Map<string, { count: number; risk: number; delay: number }>();
  workOrders.forEach(w => {
    const agency = String((w as any).implementing_agency || (w as any).contractor_name || 'Unspecified agency');
    const row = agencyMap.get(agency) || { count: 0, risk: 0, delay: 0 };
    row.count++; row.risk += n(w.risk_score); row.delay += n(w.delay_days); agencyMap.set(agency, row);
  });
  const agencies = Array.from(agencyMap.entries()).map(([name, x]) => ({ name, count: x.count, risk: Math.round(x.risk / x.count), delay: Math.round(x.delay / x.count) })).sort((a,b) => b.risk - a.risk).slice(0, 6);

  const tabs: { id: Tab; label: string; icon: typeof Database }[] = [
    { id: 'hub', label: 'Audit Hub', icon: Gauge },
    { id: 'compliance', label: 'Compliance', icon: ClipboardCheck },
    { id: 'early', label: 'Early Warning', icon: AlertTriangle },
    { id: 'agency', label: 'Agency Intelligence', icon: Network },
    { id: 'evidence', label: 'Evidence Locker', icon: FileSearch },
    { id: 'model', label: 'AI Governance', icon: ShieldCheck },
  ];

  return <div className="space-y-4 sm:space-y-6">
    <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/10 p-4 sm:p-6 shadow-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-400"/><h2 className="text-lg font-bold text-white">MPLADS AI Audit Command Centre</h2><span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] uppercase tracking-wider text-emerald-300">END-TO-END</span></div><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">One decision layer connecting data quality, compliance, anomaly signals, early warning, agency patterns, satellite/document evidence and auditable actions.</p></div>
        <div className="flex flex-wrap gap-2"><button className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300"><UploadCloud className="h-4 w-4"/>Import work dataset</button><button className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-3 py-2 text-xs font-semibold text-slate-950"><ArrowUpRight className="h-4 w-4"/>Open investigation queue</button></div>
      </div>
    </section>

    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {[
        ['Works monitored', workOrders.length, Database],
        ['High risk', high.length, AlertTriangle],
        ['Medium risk', medium.length, BarChart3],
        ['Compliance score', avgCompliance, ClipboardCheck],
      ].map(([label, value, Icon]) => <div key={String(label)} className="rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span><Icon className="h-4 w-4 text-slate-600"/></div><p className="mt-2 text-xl font-bold text-white">{label === 'Compliance score' ? pct(Number(value)) : value}</p></div>)}
    </div>

    <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 p-2">{tabs.map(t => { const Icon=t.icon; return <button key={t.id} onClick={()=>setTab(t.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs ${tab===t.id?'bg-amber-500/10 text-amber-300 border border-amber-500/20':'text-slate-400 hover:text-white'}`}><Icon className="h-4 w-4"/>{t.label}</button>; })}</div>

    {tab === 'hub' && <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="text-sm font-semibold text-white">Unified risk pipeline</h3><p className="mt-1 text-[10px] text-slate-500">Every alert should be explainable from source data to recommended action.</p><div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2">{['Ingest & validate','Rules + ML','Evidence fusion','Risk + action'].map((x,i)=><div key={x} className="rounded-xl border border-slate-800 bg-slate-950 p-3"><div className="text-[9px] text-amber-400">0{i+1}</div><p className="mt-2 text-xs font-semibold text-slate-200">{x}</p><div className="mt-3 h-1.5 rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-400" style={{width:'100%'}}/></div></div>)}</div><div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-3 text-[10px] leading-5 text-slate-400">Data sources: supplied MPLADS allocation extract + authorised work-level records when connected + controlled synthetic testing scenarios. <span className="text-amber-300">A flag is an audit signal, not a fraud finding.</span></div></div>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="text-sm font-semibold text-white">Data quality gate</h3><div className="mt-4 space-y-3">{[['Schema validation','READY'],['Missing critical fields','REVIEW'],['Duplicate record check','READY'],['Coordinate coverage','REVIEW'],['Evidence completeness','REVIEW']].map(([a,b])=><div key={a} className="flex items-center justify-between border-b border-slate-800 pb-2"><span className="text-xs text-slate-400">{a}</span><span className={`text-[10px] font-bold ${b==='READY'?'text-emerald-400':'text-amber-400'}`}>{b}</span></div>)}</div><p className="mt-4 text-[10px] text-slate-600">The import workflow is intentionally conservative: records with invalid identifiers or financial fields should not enter the scoring layer.</p></div>
    </div>}

    {tab === 'compliance' && <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-white">Automated compliance matrix</h3><p className="text-[10px] text-slate-500 mt-1">Execution checks become visible before a project reaches critical risk.</p></div><span className="text-sm font-bold text-emerald-400">{pct(avgCompliance)} portfolio</span></div><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-600"><th className="p-2">Work</th><th className="p-2">Progress</th><th className="p-2">Schedule</th><th className="p-2">Financial</th><th className="p-2">Evidence</th><th className="p-2">Score</th></tr></thead><tbody>{compliance.slice(0,10).map(({w,score})=><tr key={w.work_id} className="border-b border-slate-800/70"><td className="p-2 text-slate-300">{w.work_id}</td><td className="p-2">{n(w.physical_progress_percentage) >= n(w.expected_progress_percentage) ? '✓' : '⚠'}</td><td className="p-2">{n(w.delay_days)>0 ? '⚠' : '✓'}</td><td className="p-2">{n(w.total_expenditure)<=n(w.budget) ? '✓' : '⚠'}</td><td className="p-2">{(w as any).is_demo_data ? 'DEMO' : '✓'}</td><td className={`p-2 font-bold ${score>=80?'text-emerald-400':score>=60?'text-amber-400':'text-red-400'}`}>{score}/100</td></tr>)}</tbody></table></div></div>}

    {tab === 'early' && <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="text-sm font-semibold text-white">Risk trajectory & early warning</h3><div className="mt-5 flex items-end gap-2 h-44">{[35,42,48,57,64,72,81].map((v,i)=><div key={i} className="flex-1"><div className="rounded-t bg-amber-400/70" style={{height:`${v}%`}}/><p className="mt-1 text-center text-[9px] text-slate-600">W{i+1}</p></div>)}</div><div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200">Illustrative trajectory: production forecasting should be trained and calibrated on authorised historical MPLADS work histories before operational use.</div></div><div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="text-sm font-semibold text-white">Priority queue</h3><div className="mt-4 space-y-2">{[...high,...medium].slice(0,7).map(w=><button key={w.work_id} onClick={()=>setSelectedId(w.work_id)} className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-left hover:border-amber-500/30"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-200">{w.work_id}</span><span className="text-xs font-bold text-amber-300">{Math.round(n(w.risk_score))}/100</span></div><p className="mt-1 text-[10px] text-slate-500">{(w as any).work_title || 'Monitored work'} · {n(w.delay_days)} delay days</p></button>)}</div></div></div>}

    {tab === 'agency' && <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="text-sm font-semibold text-white">Implementing agency intelligence</h3><p className="mt-1 text-[10px] text-slate-500">Aggregates delay and risk signals without declaring misconduct.</p><div className="mt-4 grid gap-2">{agencies.map(a=><div key={a.name} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center rounded-xl border border-slate-800 bg-slate-950 p-3"><div><p className="text-xs font-semibold text-slate-200">{a.name}</p><p className="text-[10px] text-slate-600">{a.count} monitored work(s)</p></div><span className="text-[10px] text-slate-500">Avg risk <b className="text-slate-300">{a.risk}</b></span><span className="text-[10px] text-slate-500">Avg delay <b className="text-slate-300">{a.delay}d</b></span><span className={`text-[10px] font-bold ${a.risk>=75?'text-red-400':a.risk>=50?'text-amber-400':'text-emerald-400'}`}>{a.risk>=75?'REVIEW':a.risk>=50?'WATCH':'NORMAL'}</span></div>)}</div></div>}

    {tab === 'evidence' && <div className="grid grid-cols-1 xl:grid-cols-3 gap-4"><div className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="text-sm font-semibold text-white">Evidence locker</h3><p className="mt-1 text-[10px] text-slate-500">Select a work to trace the evidence supporting its risk signal.</p><select value={selected?.work_id || ''} onChange={e=>setSelectedId(e.target.value)} className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-300">{workOrders.map(w=><option key={w.work_id} value={w.work_id}>{w.work_id} · {(w as any).work_title || 'Monitored work'}</option>)}</select>{selected && <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">{[['Financial',n(selected.total_expenditure)<=n(selected.budget)?'Consistent':'Review'],['Progress',`${n(selected.physical_progress_percentage)}%`],['Payments',String(n(selected.total_payments_released))],['Satellite','Field Hub']].map(([a,b])=><div key={a} className="rounded-xl border border-slate-800 bg-slate-950 p-3"><p className="text-[10px] text-slate-600">{a}</p><p className="mt-2 text-xs font-bold text-slate-200">{b}</p></div>)}</div>}</div><div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="text-sm font-semibold text-white">Investigation action</h3><p className="mt-2 text-[10px] leading-5 text-slate-500">Actions are recorded as review intents in demo mode. Authorised production workflows can connect the same action contract to government systems.</p><div className="mt-4 space-y-2">{['Request evidence','Assign investigator','Mark under review','Generate audit case'].map(x=><button key={x} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-left text-xs text-slate-300 hover:border-amber-500/30 hover:text-white">{x}</button>)}</div></div></div>}

    {tab === 'model' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="text-sm font-semibold text-white">AI model card</h3><div className="mt-4 space-y-2 text-xs">{[['Model','Isolation Forest + deterministic rules'],['Training corpus','Synthetic administrative-pattern corpus'],['Production retraining','Required with authorised historical data'],['Explainability','Feature signals + rule explanations'],['Decision policy','Human review required'],['Fraud determination','Never automatic']].map(([a,b])=><div key={a} className="flex justify-between gap-4 border-b border-slate-800 pb-2"><span className="text-slate-500">{a}</span><span className="text-right text-slate-300">{b}</span></div>)}</div></div><div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="text-sm font-semibold text-white">Governance controls</h3><div className="mt-4 space-y-3">{['Source dataset recorded','Model version recorded','Evidence chain retained','Officer action retained','Synthetic data labelled'].map(x=><div key={x} className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle2 className="h-4 w-4 text-emerald-400"/>{x}</div>)}</div><div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[10px] leading-5 text-emerald-200">DRISHTI produces prioritisation signals. Final administrative, financial and fraud determinations remain with authorised officials.</div></div></div>}
  </div>;
}
