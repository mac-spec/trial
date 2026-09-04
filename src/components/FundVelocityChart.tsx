import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ComposedChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { FundVelocityPoint } from '@/lib/types';

interface FundVelocityChartProps {
  data: FundVelocityPoint[];
}

export function FundVelocityChart({ data }: FundVelocityChartProps) {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Fund Utilization Velocity vs Physical Progress</h2>
          <p className="text-xs text-slate-500 mt-0.5">Divergence indicates potential overbilling or ghost works</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-lg">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="font-medium">43% gap detected</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="fundUtilization"
            name="Fund Utilization %"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#fundGrad)"
          />
          <Area
            type="monotone"
            dataKey="physicalProgress"
            name="Physical Progress %"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#progGrad)"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-amber-500" />
          Fund Utilization
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-blue-500" />
          Physical Progress
        </div>
      </div>
    </div>
  );
}
