import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, LineChart, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';

export interface FundVelocityPoint { month: string; fundUtilization: number; physicalProgress: number; paymentUtilization: number; }
interface FundVelocityChartProps { data: FundVelocityPoint[]; }

export function FundVelocityChart({ data }: FundVelocityChartProps) {
  const latest = data[data.length - 1];
  const gap = latest ? latest.fundUtilization - latest.physicalProgress : 0;
  const hasHistory = data.length > 1;
  return <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
    <div className="flex items-start justify-between gap-3 mb-4"><div><h2 className="text-sm font-semibold text-white">Physical–Financial Divergence</h2><p className="text-xs text-slate-500 mt-0.5">Expenditure and payments are compared against reported physical progress. A positive gap means financial utilisation is ahead of physical progress.</p></div><div className={`shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg ${gap>10?'text-red-300 bg-red-500/10':'text-amber-400 bg-amber-500/10'}`}><TrendingUp className="w-3.5 h-3.5"/><span className="font-medium">{gap>=0?'+':''}{gap.toFixed(1)} pp gap</span></div></div>
    {!hasHistory && <div className="mb-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-[10px] text-slate-500">Single-period view: the supplied demo work-order set does not contain enough dated observations for a time trend. The point shown is the current portfolio snapshot, not a fabricated history.</div>}
    <ResponsiveContainer width="100%" height={260}><LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/><XAxis dataKey="month" stroke="#64748b" tick={{fontSize:11}}/><YAxis stroke="#64748b" tick={{fontSize:11}} unit="%"/><Tooltip contentStyle={{backgroundColor:'#0f172a',border:'1px solid #1e293b',borderRadius:'8px',fontSize:'12px'}}/><Legend wrapperStyle={{fontSize:'11px',paddingTop:'8px'}}/>
      <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4"/>
      <Line type="monotone" dataKey="fundUtilization" name="Expenditure / Sanction" stroke="#f59e0b" strokeWidth={2.5} dot={{r:3}}/>
      <Line type="monotone" dataKey="paymentUtilization" name="Payments / Sanction" stroke="#a78bfa" strokeWidth={2} dot={{r:3}}/>
      <Line type="monotone" dataKey="physicalProgress" name="Physical Progress" stroke="#3b82f6" strokeWidth={2.5} dot={{r:3}}/>
    </LineChart></ResponsiveContainer>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500"><span>100% = full sanctioned-fund baseline</span><span>Current financial–physical divergence: <strong className="text-slate-300">{gap>=0?'+':''}{gap.toFixed(1)} percentage points</strong></span></div>
  </div>;
}
