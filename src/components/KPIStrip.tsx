import { TrendingUp, AlertTriangle, Snowflake, PiggyBank, ShieldCheck, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/mockData';
import { ROLE_DEFINITIONS } from '@/lib/rbac';
interface KPICardProps { title: string; value: string; subtitle: string; icon: typeof TrendingUp; trend?: string; accent: 'amber' | 'red' | 'blue' | 'emerald'; }
const accentMap = { amber: { iconBg: 'bg-amber-500/10', iconText: 'text-amber-400', glow: 'shadow-amber-500/10' }, red: { iconBg: 'bg-red-500/10', iconText: 'text-red-400', glow: 'shadow-red-500/10' }, blue: { iconBg: 'bg-blue-500/10', iconText: 'text-blue-400', glow: 'shadow-blue-500/10' }, emerald: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400', glow: 'shadow-emerald-500/10' } };
function KPICard({ title, value, subtitle, icon: Icon, trend, accent }: KPICardProps) { const a = accentMap[accent]; return <div className={`relative rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-lg ${a.glow} overflow-hidden group hover:border-slate-700 transition-colors`}><div className="absolute top-0 right-0 w-24 h-24 opacity-5 blur-2xl rounded-full bg-current" /><div className="flex items-start justify-between mb-3"><div className={`w-11 h-11 rounded-lg ${a.iconBg} flex items-center justify-center`}><Icon className={`w-5.5 h-5.5 ${a.iconText}`} /></div>{trend && <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-400" />{trend}</span>}</div><p className="text-xs text-slate-500 mb-1">{title}</p><p className="text-2xl font-bold text-white tracking-tight">{value}</p><p className="text-[11px] text-slate-500 mt-1">{subtitle}</p></div>; }
interface KPIStripProps { totalFunds: number; anomalies: number; frozenFunds: number; savings: number; }
export function KPIStrip({ totalFunds, anomalies, frozenFunds, savings }: KPIStripProps) {
  const storedUser = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('drishti_session') || 'null') : null;
  const roleLabel = storedUser?.role || 'MPLADS Audit Officer';
  const role = ROLE_DEFINITIONS.find((item) => item.label === roleLabel) || ROLE_DEFINITIONS[0];
  const roleMetric = role.id === 'mospi'
    ? { value: anomalies.toString(), title: 'Ministry Risk Queue', subtitle: 'Cross-jurisdiction cases requiring attention', icon: ShieldCheck, accent: 'red' as const }
    : role.id === 'state_nodal'
      ? { value: `${Math.max(0, 100 - anomalies * 5)}%`, title: 'State Compliance Health', subtitle: 'Portfolio indicator from current audit queue', icon: ShieldCheck, accent: 'emerald' as const }
      : role.id === 'district_authority'
        ? { value: anomalies.toString(), title: 'District Priority Queue', subtitle: 'Risk cases for district review', icon: AlertTriangle, accent: 'blue' as const }
        : role.id === 'implementing_agency'
          ? { value: frozenFunds > 0 ? formatCurrency(frozenFunds) : '₹0', title: 'Assigned Funds On Hold', subtitle: 'Work requiring response or verification', icon: Snowflake, accent: 'amber' as const }
          : { value: anomalies.toString(), title: 'Constituency Risk Queue', subtitle: 'Portfolio cases visible to MP office', icon: AlertTriangle, accent: 'emerald' as const };

  return <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <KPICard title="Total MPLADS Funds Monitored" value={formatCurrency(totalFunds)} subtitle="Live sanctioned portfolio" icon={TrendingUp} accent="blue" />
      <KPICard title="Anomalies Flagged" value={anomalies.toString()} subtitle="High-risk or frozen work orders" icon={AlertTriangle} accent="red" />
      <KPICard title="Funds Frozen" value={formatCurrency(frozenFunds)} subtitle="Current work-order hold value" icon={Snowflake} accent="amber" />
      <KPICard title="Risk-Weighted Exposure" value={formatCurrency(savings)} subtitle="Illustrative protectable exposure" icon={PiggyBank} accent="emerald" />
      <KPICard title={roleMetric.title} value={roleMetric.value} subtitle={`${role.shortLabel} · ${roleMetric.subtitle}`} icon={roleMetric.icon} accent={roleMetric.accent} />
    </div>
    <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[.045] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3"><div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-emerald-400" /></div><div><p className="text-xs font-semibold text-slate-200">Overall Governance Insight</p><p className="text-[10px] text-slate-500 mt-0.5">Shared portfolio insight is visible to authorised roles; decision actions remain role-restricted.</p></div></div>
      <div className="flex items-center gap-4 text-[10px] text-slate-400"><span><b className="text-white">{anomalies}</b> priority cases</span><span><b className="text-white">{formatCurrency(frozenFunds)}</b> held</span><span><b className="text-white">{formatCurrency(totalFunds)}</b> monitored</span></div>
    </div>
  </>;
}
