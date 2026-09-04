import { Snowflake, ClipboardCheck, CheckCircle2, FileBadge, X, FileBadge2, ScanEye, Network, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { WorkOrder } from '@/services/auditService';
import { triggerAIPipeline } from '@/services/auditService';
import { BoQAuditTab } from './BoQAuditTab';
import { VisionAuditTab } from './VisionAuditTab';
import { CollusionGraphTab } from './CollusionGraphTab';
import { boqItems, formatCurrency } from '@/lib/mockData';

interface DeepDivePanelProps {
  alert: WorkOrder | null;
  onClose: () => void;
  contractorImage: string;
  aiBaselineImage: string;
  onFundsFrozen?: (workId: string) => void;
}

type TabId = 'boq' | 'vision' | 'collusion';

const tabs: { id: TabId; label: string; icon: typeof Snowflake }[] = [
  { id: 'boq', label: 'Textual & BoQ Audit', icon: FileBadge2 },
  { id: 'vision', label: 'Spatial-Temporal Vision Audit', icon: ScanEye },
  { id: 'collusion', label: 'Collusion Network Graph', icon: Network },
];

export function DeepDivePanel({ alert, onClose, contractorImage, aiBaselineImage, onFundsFrozen }: DeepDivePanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('boq');
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [frozenStatus, setFrozenStatus] = useState(false);

  if (!alert) return null;

  const isFrozen = frozenStatus || alert.status === 'frozen';

  const handleFreezeFunds = async () => {
    setIsProcessing(true);
    setActionError(null);
    setActionResult(null);
    try {
      const result = await triggerAIPipeline(alert.work_id);
      setFrozenStatus(true);
      setActionResult(result.message);
      onFundsFrozen?.(alert.work_id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to process AI pipeline');
    } finally {
      setIsProcessing(false);
    }
  };

  const actions = [
    { label: 'Freeze Milestone Funds', icon: Snowflake, color: 'amber', action: handleFreezeFunds, disabled: isProcessing || isFrozen },
    { label: 'Request Manual Physical Audit', icon: ClipboardCheck, color: 'blue', action: () => setActionResult(`Manual Physical Audit requested for ${alert.ward_name} work order.`), disabled: isProcessing },
    { label: 'Approve & Release Funds', icon: CheckCircle2, color: 'emerald', action: () => setActionResult(`Funds approved & released for ${alert.ward_name} work order.`), disabled: isProcessing },
    { label: 'Generate AI Audit Certificate', icon: FileBadge, color: 'slate', action: () => setActionResult(`AI Audit Certificate generated for ${alert.ward_name} work order.`), disabled: isProcessing },
  ] as const;

  const colorMap: Record<string, string> = {
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
    slate: 'bg-slate-700/30 text-slate-300 border-slate-600/30 hover:bg-slate-700/50',
  };

  const riskLevel = alert.risk_level as 'high' | 'medium' | 'low';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* AI Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-10 bg-slate-950/90 backdrop-blur flex flex-col items-center justify-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-amber-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Snowflake className="w-7 h-7 text-amber-300" />
            </div>
          </div>
          <p className="mt-6 text-sm font-semibold text-white">AI Pipeline Processing</p>
          <p className="mt-1 text-xs text-slate-400">Analyzing work order {alert.work_id}...</p>
          <p className="mt-3 text-[10px] text-slate-600 uppercase tracking-widest">Freezing milestone funds</p>
        </div>
      )}

      <div className="w-full max-w-6xl max-h-[92vh] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${riskLevel === 'high' ? 'bg-red-500' : riskLevel === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="text-[10px] uppercase tracking-widest text-slate-500">Work Order Inspection · {alert.work_id}</span>
              {isFrozen && (
                <span className="text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
                  Funds Frozen
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white">{alert.title}</h2>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
              <span>Ward: <span className="text-slate-300">{alert.ward_name}</span></span>
              <span>Agency: <span className="text-slate-300">{alert.agency}</span></span>
              <span>Contractor: <span className="text-slate-300">{alert.contractor}</span></span>
              <span>Budget: <span className="text-slate-300">{formatCurrency(alert.budget)}</span></span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-800 flex gap-1 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  active
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'boq' && <BoQAuditTab items={boqItems} />}
          {activeTab === 'vision' && (
            <VisionAuditTab workId={alert.work_id} aiBaselineImage={aiBaselineImage} onFundsFrozen={onFundsFrozen} />
          )}
          {activeTab === 'collusion' && <CollusionGraphTab />}
        </div>

        {/* Action Control Center */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 shrink-0">
          {/* Status badge — dynamically updated */}
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Current Status:</span>
            {isFrozen ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2.5 py-1 rounded uppercase tracking-wider">
                <Snowflake className="w-3.5 h-3.5" />
                Funds_Frozen
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded capitalize">
                {alert.status.replace('_', ' ')}
              </span>
            )}
          </div>

          {actionResult && (
            <div className="mb-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4" />
              {actionResult}
              <button onClick={() => setActionResult(null)} className="ml-auto text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {actionError && (
            <div className="mb-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4" />
              {actionError}
              <button onClick={() => setActionError(null)} className="ml-auto text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Action Control Center</p>
              <p className="text-xs text-slate-400">Select an audit action for this work order</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={action.action}
                    disabled={action.disabled}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${colorMap[action.color]} ${action.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing && action.label === 'Freeze Milestone Funds' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
