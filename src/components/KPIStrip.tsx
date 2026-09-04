import { TrendingUp, AlertTriangle, Snowflake, PiggyBank } from 'lucide-react';
import { formatCurrency } from '@/lib/mockData';

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: typeof TrendingUp;
  trend?: string;
  accent: 'amber' | 'red' | 'blue' | 'emerald';
}

const accentMap = {
  amber: {
    iconBg: 'bg-amber-500/10',
    iconText: 'text-amber-400',
    glow: 'shadow-amber-500/10',
  },
  red: {
    iconBg: 'bg-red-500/10',
    iconText: 'text-red-400',
    glow: 'shadow-red-500/10',
  },
  blue: {
    iconBg: 'bg-blue-500/10',
    iconText: 'text-blue-400',
    glow: 'shadow-blue-500/10',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-400',
    glow: 'shadow-emerald-500/10',
  },
};

function KPICard({ title, value, subtitle, icon: Icon, trend, accent }: KPICardProps) {
  const a = accentMap[accent];
  return (
    <div className={`relative rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-lg ${a.glow} overflow-hidden group hover:border-slate-700 transition-colors`}>
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 blur-2xl rounded-full bg-current" />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-lg ${a.iconBg} flex items-center justify-center`}>
          <Icon className={`w-5.5 h-5.5 ${a.iconText}`} />
        </div>
        {trend && (
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}

interface KPIStripProps {
  totalFunds: number;
  anomalies: number;
  frozenFunds: number;
  savings: number;
}

export function KPIStrip({ totalFunds, anomalies, frozenFunds, savings }: KPIStripProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total MPLADS Funds Monitored"
        value={formatCurrency(totalFunds)}
        subtitle="3 constituencies · 12 wards"
        icon={TrendingUp}
        trend="+8.2% YoY"
        accent="blue"
      />
      <KPICard
        title="Anomalies Flagged"
        value={anomalies.toString()}
        subtitle="AI-detected across BoQ & vision"
        icon={AlertTriangle}
        trend="+12 this week"
        accent="red"
      />
      <KPICard
        title="Funds Frozen"
        value={formatCurrency(frozenFunds)}
        subtitle="Pending physical verification"
        icon={Snowflake}
        accent="amber"
      />
      <KPICard
        title="AI-Estimated Savings"
        value={formatCurrency(savings)}
        subtitle="Cost recovery from flagging"
        icon={PiggyBank}
        trend="+₹41L this quarter"
        accent="emerald"
      />
    </div>
  );
}
