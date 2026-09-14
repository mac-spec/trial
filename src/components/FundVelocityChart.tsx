import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, LineChart, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';

export interface FundVelocityPoint { month: string; fundUtilization: number; physicalProgress: number; paymentUtilization: number; }
interface FundVelocityChartProps { data: FundVelocityPoint[]; }

function buildSyntheticHistory(current: FundVelocityPoint): FundVelocityPoint[] {
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Current'];
  const currentFund = Math.max(0, current.fundUtilization);
  const currentPayment = Math.max(0, current.paymentUtilization);
  const currentProgress = Math.max(0, current.physicalProgress);
  const clamp = (value: number) => Number(Math.max(0, Math.min(100, value)).toFixed(1));
  return months.map((month, index) => {
    const t = index / (months.length - 1);
    return { month, fundUtilization: clamp(Math.max(4, currentFund * (0.35 + 0.65 * t))), paymentUtilization: clamp(Math.max(3, currentPayment * (0.30 + 0.70 * t))), physicalProgress: clamp(Math.max(5, currentProgress * (0.25 + 0.75 * t))) };
  });
}

export function FundVelocityChart({ data }: FundVelocityChartProps) {
  const hasHistory = data.length > 1;
  const chartData = hasHistory ? data : buildSyntheticHistory(data[0] || { month: 'Current', fundUtilization: 0, paymentUtilization: 0, physicalProgress: 0 });
  const latest = chartData[chartData.length - 1];
  const gap = latest ? latest.fundUtilization - latest.physicalProgress : 0;

  return <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Physical–Financial Divergence</h2>
          {!hasHistory && <span className="text-[9px] uppercase tracking-wider rounded-full border border-cyan-200 bg-cyan-50 text-cyan-800 px-2 py-1 font-bold">Synthetic demo data</span>}
        </div>
        <p className="text-xs text-slate-600 mt-1">Financial utilisation is compared with reported physical progress. A positive gap means financial utilisation is ahead of physical progress.</p>
      </div>
      <div className={`shrink-0 flex items-center gap-2 text-sm sm:text-base px-3 py-2 rounded-lg font-black border ${gap>10?'text-red-800 bg-red-50 border-red-200':'text-emerald-800 bg-emerald-50 border-emerald-200'}`}><TrendingUp className="w-4 h-4"/><span>{gap>=0?'+':''}{gap.toFixed(1)} pp gap</span></div>
    </div>
    {!hasHistory && <div className="mb-3 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-900">Interactive trend demonstration using synthetic historical points because the supplied allocation/work-order extract does not contain enough dated observations. Replace with authorised historical records when available.</div>}
    <ResponsiveContainer width="100%" height={260}><LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1"/><XAxis dataKey="month" stroke="#475569" tick={{fontSize:11}}/><YAxis stroke="#475569" tick={{fontSize:11}} unit="%"/><Tooltip contentStyle={{backgroundColor:'#ffffff',color:'#17211f',border:'1px solid #cbd5e1',borderRadius:'8px',fontSize:'12px'}} labelStyle={{color:'#17211f',fontWeight:700}} itemStyle={{color:'#33413d'}}/><Legend wrapperStyle={{fontSize:'11px',paddingTop:'8px',color:'#33413d'}}/>
      <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4"/>
      <Line type="monotone" dataKey="fundUtilization" name="Expenditure / Sanction" stroke="#d97706" strokeWidth={3} dot={{r:3}} isAnimationActive/>
      <Line type="monotone" dataKey="paymentUtilization" name="Payments / Sanction" stroke="#7c3aed" strokeWidth={2.5} dot={{r:3}} isAnimationActive/>
      <Line type="monotone" dataKey="physicalProgress" name="Physical Progress" stroke="#059669" strokeWidth={3} dot={{r:3}} isAnimationActive/>
    </LineChart></ResponsiveContainer>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600"><span>100% = full sanctioned-fund baseline</span><span>Current financial–physical divergence: <strong className="text-base font-black text-emerald-800">{gap>=0?'+':''}{gap.toFixed(1)} percentage points</strong></span></div>
  </div>;
}
