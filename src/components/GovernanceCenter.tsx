import { useMemo, useState } from 'react';
import { Activity, Building2, CheckCircle2, Clock3, FileCheck2, IndianRupee, Landmark, ShieldAlert, TrendingUp, Users, WalletCards } from 'lucide-react';

type Role = 'MP' | 'District Authority' | 'State Nodal Authority' | 'Ministry';

const works = [
  { id: 'MPLADS-BLR-001', title: 'Stormwater Drain Re-lining - Varthur Main Road', constituency: 'Bangalore North', sanctioned: 42, expenditure: 34.6, payment: 31.2, progress: 68, expected: 78, daysLate: 18, risk: 91, compliance: 72, asset: 'Under construction' },
  { id: 'MPLADS-BLR-002', title: '100ft Road Re-asphalting - 12th to CMH Road', constituency: 'Bangalore Central', sanctioned: 31, expenditure: 28.7, payment: 28.7, progress: 91, expected: 96, daysLate: 7, risk: 84, compliance: 81, asset: 'Near completion' },
  { id: 'MPLADS-BLR-003', title: 'Hebbal Lake View Community Hall', constituency: 'Bangalore North', sanctioned: 56, expenditure: 12.4, payment: 18.9, progress: 23, expected: 54, daysLate: 42, risk: 96, compliance: 49, asset: 'Delayed' },
  { id: 'MPLADS-BLR-004', title: 'Banashankari Stage V Park Landscaping', constituency: 'Bangalore South', sanctioned: 18.5, expenditure: 15.1, payment: 14.8, progress: 71, expected: 75, daysLate: 3, risk: 67, compliance: 88, asset: 'On track' },
];

export function GovernanceCenter() {
  const [role, setRole] = useState<Role>('Ministry');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => works.filter(w => `${w.id} ${w.title} ${w.constituency}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const total = works.reduce((s, w) => s + w.sanctioned, 0);
  const spent = works.reduce((s, w) => s + w.expenditure, 0);
  const atRisk = works.filter(w => w.risk >= 75).length;
  const delayed = works.filter(w => w.daysLate > 0).length;

  return <div className="space-y-6">
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest"><Landmark className="w-4 h-4" /> Governance Intelligence Center</div>
          <h2 className="text-xl font-bold text-white mt-2">MPLADS monitoring across finance, execution & compliance</h2>
          <p className="text-xs text-slate-500 mt-1">Demo intelligence layer — replace sample work records with verified government work-order, payment and progress feeds.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['MP','District Authority','State Nodal Authority','Ministry'] as Role[]).map(r => <button key={r} onClick={() => setRole(r)} className={`px-3 py-2 rounded-lg text-xs border ${role === r ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>{r}</button>)}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <Metric icon={IndianRupee} label="Sanctioned value" value={`₹${total.toFixed(1)}L`} sub="selected work portfolio" />
      <Metric icon={WalletCards} label="Expenditure" value={`₹${spent.toFixed(1)}L`} sub={`${((spent / total) * 100).toFixed(1)}% utilized`} />
      <Metric icon={ShieldAlert} label="High-risk works" value={String(atRisk)} sub="risk score ≥ 75" />
      <Metric icon={Clock3} label="Delayed works" value={String(delayed)} sub="schedule variance detected" />
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center justify-between gap-3 mb-4"><div><h3 className="text-sm font-semibold text-white">Financial + Execution Monitor</h3><p className="text-[11px] text-slate-500">Sanction → expenditure → payment → physical progress</p></div><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search work..." className="w-44 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none" /></div>
        <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="text-slate-600 border-b border-slate-800"><th className="text-left py-2">Work</th><th className="text-right">Sanction</th><th className="text-right">Spend</th><th className="text-right">Progress</th><th className="text-right">Risk</th><th className="text-right">Compliance</th></tr></thead><tbody>{filtered.map(w => <tr key={w.id} className="border-b border-slate-800/70"><td className="py-3 pr-4"><p className="text-slate-300 font-medium">{w.title}</p><p className="text-[10px] text-slate-600">{w.id} · {w.constituency}</p></td><td className="text-right text-slate-400">₹{w.sanctioned}L</td><td className="text-right text-slate-400">₹{w.expenditure}L</td><td className="text-right"><span className={w.progress < w.expected - 10 ? 'text-red-400' : 'text-emerald-400'}>{w.progress}%</span></td><td className="text-right"><span className={w.risk >= 75 ? 'text-red-400' : 'text-amber-400'}>{w.risk}</span></td><td className="text-right text-slate-400">{w.compliance}%</td></tr>)}</tbody></table></div>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="text-sm font-semibold text-white">Predictive Early Warnings</h3><p className="text-[11px] text-slate-500 mt-1">Model-style decision signals for {role}</p>
        <div className="space-y-3 mt-4"><Warning title="Completion delay forecast" text="Hebbal Community Hall is projected to miss its target by ~42 days." /><Warning title="Payment-progress mismatch" text="₹18.9L paid while physical progress is only 23%. Review payment sequence." /><Warning title="Cost-overrun watch" text="Stormwater Drain has 20%+ BoQ variance on selected items." /><Warning title="Duplicate-work check" text="Spatial similarity check recommended before final release for flagged locations." /></div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Control icon={FileCheck2} title="Compliance Engine" text="Sanction, finance, payment, schedule, asset and evidence checks." status="ACTIVE" />
      <Control icon={Activity} title="Early Warning Engine" text="Combines risk, trend, delay and utilization signals into priority alerts." status="ACTIVE" />
      <Control icon={Users} title="Role-based Oversight" text="MP, district, state and ministry views share one audit trail." status="READY" />
    </div>
  </div>;
}

function Metric({ icon: Icon, label, value, sub }: { icon: typeof IndianRupee; label: string; value: string; sub: string }) { return <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><Icon className="w-4 h-4 text-amber-400 mb-3" /><p className="text-[11px] text-slate-500">{label}</p><p className="text-xl font-bold text-white">{value}</p><p className="text-[10px] text-slate-600 mt-1">{sub}</p></div> }
function Warning({ title, text }: { title: string; text: string }) { return <div className="rounded-lg border border-red-500/10 bg-red-500/5 p-3"><div className="flex gap-2"><ShieldAlert className="w-4 h-4 text-red-400 shrink-0" /><div><p className="text-xs font-semibold text-slate-300">{title}</p><p className="text-[10px] leading-4 text-slate-500 mt-1">{text}</p></div></div></div> }
function Control({ icon: Icon, title, text, status }: { icon: typeof FileCheck2; title: string; text: string; status: string }) { return <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="flex justify-between"><Icon className="w-5 h-5 text-emerald-400" /><span className="text-[9px] text-emerald-400 border border-emerald-500/20 rounded px-2 py-0.5">{status}</span></div><h3 className="text-sm font-semibold text-white mt-3">{title}</h3><p className="text-[10px] text-slate-500 mt-1 leading-4">{text}</p></div> }
