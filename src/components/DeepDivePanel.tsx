import { Snowflake, ClipboardCheck, CheckCircle2, X, FileBadge2, ScanEye, Network, Loader2, AlertCircle, Printer, History } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { WorkOrder, AuditTrailEntry } from '@/services/auditService';
import { triggerAIPipeline, updateWorkOrderStatus, fetchAuditTrail, recordAuditAction } from '@/services/auditService';
import { BoQAuditTab } from './BoQAuditTab';
import { VisionAuditTab } from './VisionAuditTab';
import { CollusionGraphTab } from './CollusionGraphTab';
import { boqItems, formatCurrency } from '@/lib/mockData';

interface DeepDivePanelProps { alert: WorkOrder | null; onClose: () => void; contractorImage: string; aiBaselineImage: string; onFundsFrozen?: (workId: string) => void; }
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
  const [logs, setLogs] = useState<AuditTrailEntry[]>([]);

  useEffect(() => { if (alert) void fetchAuditTrail(alert.work_id).then(setLogs); }, [alert]);
  if (!alert) return null;
  const isFrozen = frozenStatus || alert.status === 'frozen';

  const refreshLogs = async () => setLogs(await fetchAuditTrail(alert.work_id));

  const handleFreezeFunds = async () => {
    setIsProcessing(true); setActionError(null); setActionResult(null);
    try {
      // Persist status locally immediately; backend sync is best-effort.
      await updateWorkOrderStatus(alert.work_id, 'frozen', 'FUNDS_FROZEN', 'Auditor froze milestone funds after reviewing the risk evidence.');
      setFrozenStatus(true);
      setActionResult(`Funds frozen: ${formatCurrency(alert.budget)} held pending audit review.`);
      onFundsFrozen?.(alert.work_id);
      await refreshLogs();
    } catch (err) { setActionError(err instanceof Error ? err.message : 'Failed to freeze funds'); }
    finally { setIsProcessing(false); }
  };

  const handleAction = async (action: 'MANUAL_PHYSICAL_AUDIT' | 'APPROVED') => {
    setIsProcessing(true); setActionError(null); setActionResult(null);
    try {
      const status = action === 'APPROVED' ? 'cleared' : 'under_review';
      await updateWorkOrderStatus(alert.work_id, status, action, action === 'APPROVED' ? 'Auditor approved release after review.' : 'Auditor requested field verification based on risk evidence.');
      setActionResult(action === 'APPROVED' ? 'Funds approved & release decision recorded.' : 'Manual physical audit requested and recorded. Work order moved to Under Review.');
      await refreshLogs();
    } catch (err) { setActionError(err instanceof Error ? err.message : 'Unable to record action'); }
    finally { setIsProcessing(false); }
  };

  const generateCertificate = async () => {
    setIsProcessing(true); setActionError(null);
    try {
      await recordAuditAction(alert.work_id, 'AUDIT_CERTIFICATE_GENERATED', `Certificate generated for ${alert.work_id} using available BoQ, vision and network evidence.`);
      await refreshLogs();
      const w = window.open('', '_blank', 'width=900,height=700');
      if (!w) throw new Error('Popup blocked. Allow popups to generate the certificate.');
      w.document.write(`<html><head><title>DRISHTI Audit Certificate ${alert.work_id}</title><style>body{font-family:Arial,sans-serif;padding:48px;color:#111}table{border-collapse:collapse;width:100%;margin-top:24px}td,th{border:1px solid #ddd;padding:10px;text-align:left}.risk{font-size:26px;font-weight:700}.note{margin-top:32px;color:#555;font-size:12px}</style></head><body><h1>DRISHTI — AI Audit Certificate</h1><p>SIH demonstration artifact · ${new Date().toLocaleString()}</p><h2>${alert.title}</h2><p>Work ID: ${alert.work_id} · Ward: ${alert.ward_name} · Agency: ${alert.agency} · Contractor: ${alert.contractor}</p><table><tr><th>Budget / Sanction</th><th>Risk Score</th><th>Status</th><th>Funds Frozen</th></tr><tr><td>${formatCurrency(alert.budget)}</td><td>${alert.risk_score}/100</td><td>${isFrozen ? 'FUNDS_FROZEN' : alert.status}</td><td>${formatCurrency(alert.funds_frozen || 0)}</td></tr></table><p class="risk">Decision-support audit record</p><p class="note">This prototype artifact is not a statutory government certificate and is generated only from evidence available to the demonstration system.</p><script>window.onload=()=>window.print()</script></body></html>`);
      w.document.close(); setActionResult('Audit certificate opened in a print-ready window. Choose Save as PDF.');
    } catch (err) { setActionError(err instanceof Error ? err.message : 'Certificate generation failed'); }
    finally { setIsProcessing(false); }
  };

  const actions = [
    { label: 'Freeze Milestone Funds', icon: Snowflake, color: 'amber', action: handleFreezeFunds, disabled: isProcessing || isFrozen },
    { label: 'Request Manual Physical Audit', icon: ClipboardCheck, color: 'blue', action: () => void handleAction('MANUAL_PHYSICAL_AUDIT'), disabled: isProcessing },
    { label: 'Approve & Release Funds', icon: CheckCircle2, color: 'emerald', action: () => void handleAction('APPROVED'), disabled: isProcessing },
    { label: 'Generate AI Audit Certificate', icon: Printer, color: 'slate', action: () => void generateCertificate(), disabled: isProcessing },
  ] as const;
  const colorMap: Record<string, string> = { amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20', blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20', emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20', slate: 'bg-slate-700/30 text-slate-300 border-slate-600/30 hover:bg-slate-700/50' };
  const riskLevel = alert.risk_level as 'high' | 'medium' | 'low';

  return <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    {isProcessing && <div className="absolute inset-0 z-10 bg-slate-950/90 backdrop-blur flex flex-col items-center justify-center"><Loader2 className="w-16 h-16 text-amber-400 animate-spin" /><p className="mt-6 text-sm font-semibold text-white">DRISHTI action processing</p><p className="mt-1 text-xs text-slate-400">Saving the decision and audit evidence…</p></div>}
    <div className="w-full max-w-6xl max-h-[92vh] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-800 flex items-start justify-between shrink-0"><div><div className="flex items-center gap-2 mb-1"><span className={`w-2.5 h-2.5 rounded-full ${riskLevel === 'high' ? 'bg-red-500' : riskLevel === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} /><span className="text-[10px] uppercase tracking-widest text-slate-500">Work Order Inspection · {alert.work_id}</span>{isFrozen && <span className="text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded uppercase tracking-wider">Funds Frozen</span>}</div><h2 className="text-lg font-bold text-white">{alert.title}</h2><div className="flex items-center gap-4 mt-1 text-xs text-slate-500"><span>Ward: <span className="text-slate-300">{alert.ward_name}</span></span><span>Agency: <span className="text-slate-300">{alert.agency}</span></span><span>Contractor: <span className="text-slate-300">{alert.contractor}</span></span><span>Budget: <span className="text-slate-300">{formatCurrency(alert.budget)}</span></span></div></div><button onClick={onClose} disabled={isProcessing} className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-40"><X className="w-5 h-5" /></button></div>
      <div className="px-6 border-b border-slate-800 flex gap-1 shrink-0">{tabs.map(tab => { const Icon = tab.icon; const active = activeTab === tab.id; return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${active ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}><Icon className="w-4 h-4" />{tab.label}</button>; })}</div>
      <div className="flex-1 overflow-y-auto p-6">{activeTab === 'boq' && <BoQAuditTab items={boqItems} />}{activeTab === 'vision' && <VisionAuditTab workId={alert.work_id} aiBaselineImage={aiBaselineImage} onFundsFrozen={onFundsFrozen} />}{activeTab === 'collusion' && <CollusionGraphTab />}</div>
      <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 shrink-0"><div className="mb-3 flex items-center gap-2"><span className="text-[10px] uppercase tracking-widest text-slate-500">Current Status:</span>{isFrozen ? <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2.5 py-1 rounded uppercase"><Snowflake className="w-3.5 h-3.5" />Funds_Frozen</span> : <span className="inline-flex text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded capitalize">{alert.status.replace('_', ' ')}</span>}</div>{actionResult && <div className="mb-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2"><CheckCircle2 className="w-4 h-4" />{actionResult}</div>}{actionError && <div className="mb-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2"><AlertCircle className="w-4 h-4" />{actionError}</div>}<div className="flex items-center justify-between flex-wrap gap-3"><div><p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Action Control Center</p><p className="text-xs text-slate-400">Actions remain usable in demo mode even if backend persistence is unavailable.</p></div><div className="flex flex-wrap gap-2">{actions.map(action => { const Icon = action.icon; return <button key={action.label} type="button" onClick={action.action} disabled={action.disabled} className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border ${colorMap[action.color]} ${action.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}><Icon className="w-4 h-4" />{action.label}</button>; })}</div></div><div className="mt-4 border-t border-slate-800 pt-3"><div className="flex items-center gap-2 text-xs font-semibold text-white"><History className="w-4 h-4 text-amber-400" /> Audit trail ({logs.length})</div>{logs.length > 0 && <div className="mt-2 max-h-24 overflow-y-auto space-y-1">{logs.map(log => <div key={log.audit_id} className="text-[10px] text-slate-500"><span className="text-amber-400">{log.action_executed}</span> · {log.actor} · {new Date(log.created_at).toLocaleString()}</div>)}</div>}</div></div>
    </div>
  </div>;
}
