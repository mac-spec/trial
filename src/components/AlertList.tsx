import { AlertTriangle, Snowflake, Eye, CheckCircle2, ChevronRight, Loader2, Clock3 } from 'lucide-react';
import type { WorkOrder } from '@/services/auditService';
import { formatCurrency } from '@/lib/mockData';

type RiskLevel = 'high' | 'medium' | 'low';
type StatusIcon = typeof AlertTriangle;

interface AlertListProps {
  alerts: WorkOrder[];
  onSelect?: (alert: WorkOrder) => void;
  title?: string;
  loading?: boolean;
}

const statusConfig: Record<WorkOrder['status'], { label: string; icon: StatusIcon; color: string }> = {
  flagged: { label: 'Flagged', icon: AlertTriangle, color: 'text-red-400 bg-red-500/10' },
  frozen: { label: 'Frozen', icon: Snowflake, color: 'text-amber-400 bg-amber-500/10' },
  under_review: { label: 'Under Review', icon: Eye, color: 'text-blue-400 bg-blue-500/10' },
  cleared: { label: 'Cleared', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10' },
  PENDING_AUDIT: { label: 'Pending Audit', icon: Clock3, color: 'text-slate-400 bg-slate-500/10' },
};

function RiskBadge({ score, level }: { score: number; level: RiskLevel }) {
  const barColor = level === 'high' ? 'bg-red-500' : level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500';
  const textColor = level === 'high' ? 'text-red-400' : level === 'medium' ? 'text-amber-400' : 'text-emerald-400';
  return <div className="flex items-center gap-2 w-28"><div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${score}%` }} /></div><span className={`text-xs font-bold ${textColor} tabular-nums`}>{score}%</span></div>;
}

function getRiskBg(level: RiskLevel): string { return level === 'high' ? 'bg-red-500' : level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'; }

export function AlertList({ alerts, onSelect, title = 'Recent Critical Alerts', loading }: AlertListProps) {
  return <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800"><h2 className="text-sm font-semibold text-white">{title}</h2><span className="text-xs text-slate-500">{loading ? 'Loading...' : `${alerts.length} entries`}</span></div>
    {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-amber-400 animate-spin" /></div> : alerts.length === 0 ? <div className="flex items-center justify-center py-16 text-sm text-slate-500">No work orders found.</div> : <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-800"><th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-5 py-2.5">Ward</th><th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2.5">Work Category</th><th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2.5">Agency</th><th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2.5">Budget</th><th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2.5">Status</th><th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2.5">Risk Score</th>{onSelect && <th className="px-3 py-2.5" />}</tr></thead><tbody>{alerts.map(alert=>{const sc=statusConfig[alert.status];const StatusIcon=sc.icon;const level=alert.risk_level as RiskLevel;return <tr key={alert.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${onSelect?'cursor-pointer':''}`} onClick={()=>onSelect?.(alert)}><td className="px-5 py-3"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${getRiskBg(level)}`} /><div><p className="text-sm font-medium text-slate-200">{alert.ward_name}</p><p className="text-[10px] text-slate-500">{alert.date}</p></div></div></td><td className="px-3 py-3"><p className="text-sm text-slate-300">{alert.work_category}</p><p className="text-[10px] text-slate-500 truncate max-w-[200px]">{alert.title}</p></td><td className="px-3 py-3"><span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded">{alert.agency}</span></td><td className="px-3 py-3"><span className="text-sm font-medium text-slate-200 tabular-nums">{formatCurrency(alert.budget)}</span></td><td className="px-3 py-3"><span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded ${sc.color}`}><StatusIcon className="w-3 h-3" />{sc.label}</span></td><td className="px-3 py-3"><RiskBadge score={alert.risk_score} level={level}/></td>{onSelect&&<td className="px-3 py-3"><ChevronRight className="w-4 h-4 text-slate-600"/></td>}</tr>})}</tbody></table></div>}
  </div>;
}
