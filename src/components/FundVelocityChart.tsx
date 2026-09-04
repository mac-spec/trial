import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ComposedChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

export interface FundVelocityPoint { month: string; fundUtilization: number; physicalProgress: number; paymentUtilization: number; }
interface FundVelocityChartProps { data: FundVelocityPoint[]; }

export function FundVelocityChart({ data }: FundVelocityChartProps) {
  const latest = data[data.length - 1];
  const gap = latest ? Math.max(0, latest.fundUtilization - latest.physicalProgress) : 0;
  return <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
    <div className="flex items-start justify-between mb-4"><div><h2 className="text-sm font-semibold text-white">Financial Divergence: Sanction vs Expenditure vs Payments</h2><p className="text-xs text-slate-500 mt-0.5">Utilization and payment velocity are compared with reported physical progress.</p></div><div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-lg"><TrendingUp className="w-3.5 h-3.5" /><span className="font-medium">{gap.toFixed(1)}% progress gap</span></div></div>
    <ResponsiveContainer width="100%" height={260}><ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} /><YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" /><Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} /><Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} /><Area type="monotone" dataKey="fundUtilization" name="Expenditure / Sanction %" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.08} /><Area type="monotone" dataKey="paymentUtilization" name="Payments / Sanction %" stroke="#a78bfa" strokeWidth={2} fill="#a78bfa" fillOpacity={0.06} /><Area type="monotone" dataKey="physicalProgress" name="Physical Progress %" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.06} /></ComposedChart></ResponsiveContainer>
    <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500"><span>Sanction is the 100% reference baseline.</span><span>Current portfolio divergence: {gap.toFixed(1)} pp</span></div>
  </div>;
}
