import { FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { BoQItem } from '@/lib/types';
import { formatCurrency } from '@/lib/mockData';

interface BoQAuditTabProps {
  items: BoQItem[];
}

export function BoQAuditTab({ items }: BoQAuditTabProps) {
  const flaggedCount = items.filter((i) => i.inflationPercent > 15).length;
  const totalContractor = items.reduce((s, i) => s + i.contractorPrice * i.quantity, 0);
  const totalSoR = items.reduce((s, i) => s + i.sorRate * i.quantity, 0);
  const overallInflation = ((totalContractor - totalSoR) / totalSoR) * 100;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-800">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Contractor Total</p>
          <p className="text-base font-bold text-white">{formatCurrency(totalContractor)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-800">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">AI SoR Baseline</p>
          <p className="text-base font-bold text-blue-400">{formatCurrency(totalSoR)}</p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
          <p className="text-[10px] uppercase tracking-wider text-red-400/70">Overall Inflation</p>
          <p className="text-base font-bold text-red-400">+{overallInflation.toFixed(1)}%</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5">Description</th>
              <th className="text-center text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2.5">Unit</th>
              <th className="text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2.5">Qty</th>
              <th className="text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2.5">Contractor ₹</th>
              <th className="text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2.5">AI SoR ₹</th>
              <th className="text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2.5">Inflation</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const flagged = item.inflationPercent > 15;
              return (
                <tr
                  key={item.id}
                  className={`border-b border-slate-800/50 ${flagged ? 'bg-red-500/5' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {flagged ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" />
                      )}
                      <span className="text-sm text-slate-300">{item.description}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center text-xs text-slate-500">{item.unit}</td>
                  <td className="px-3 py-3 text-right text-sm text-slate-400 tabular-nums">{item.quantity}</td>
                  <td className="px-3 py-3 text-right text-sm text-slate-200 tabular-nums">
                    {formatCurrency(item.contractorPrice)}
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-blue-400 tabular-nums">
                    {formatCurrency(item.sorRate)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`text-xs font-bold tabular-nums px-2 py-1 rounded ${
                        flagged ? 'text-red-400 bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10'
                      }`}
                    >
                      +{item.inflationPercent.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <FileText className="w-3.5 h-3.5" />
        <span>{flaggedCount} of {items.length} line items exceed 15% inflation threshold (red-flagged by AI)</span>
      </div>
    </div>
  );
}
