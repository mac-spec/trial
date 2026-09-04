import { useState, useMemo, useEffect, useCallback } from 'react';
import { Sidebar, type View } from '@/components/Sidebar';
import { KPIStrip } from '@/components/KPIStrip';
import { AlertList } from '@/components/AlertList';
import { FundVelocityChart } from '@/components/FundVelocityChart';
import { WardMap } from '@/components/WardMap';
import { DeepDivePanel } from '@/components/DeepDivePanel';
import { GovernanceCenter } from '@/components/GovernanceCenter';
import { wards, fundVelocityData, formatCurrency } from '@/lib/mockData';
import type { Ward as WardType } from '@/lib/types';
import { fetchWorkOrders } from '@/services/auditService';
import type { WorkOrder } from '@/services/auditService';
import { Map as MapIcon, FileSearch, Activity, Zap } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<View>('overview');
  const [selectedAlert, setSelectedAlert] = useState<WorkOrder | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardType | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const loadWorkOrders = useCallback(async () => { setLoadingOrders(true); try { setWorkOrders(await fetchWorkOrders()); } catch (err) { console.error('Failed to fetch work orders:', err); setWorkOrders([]); } finally { setLoadingOrders(false); } }, []);
  useEffect(() => { loadWorkOrders(); }, [loadWorkOrders]);
  const totalFunds = useMemo(() => workOrders.reduce((s, w) => s + w.budget, 0), [workOrders]);
  const frozenFunds = useMemo(() => workOrders.reduce((s, w) => s + (w.funds_frozen ?? 0), 0), [workOrders]);
  const flaggedAlerts = useMemo(() => workOrders.filter(a => a.status === 'flagged' || a.status === 'frozen'), [workOrders]);
  const estimatedSavings = Math.round(frozenFunds * 0.34);
  const contractorImage = 'https://images.pexels.com/photos/2058120/pexels-photo-2058120.jpeg?auto=compress&cs=tinysrgb&w=800';
  const aiBaselineImage = 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800';
  const handleAlertSelect = (alert: WorkOrder) => setSelectedAlert(alert);
  const handleFundsFrozen = useCallback((workId: string) => { setWorkOrders(prev => prev.map(w => w.work_id === workId ? { ...w, status: 'frozen', funds_frozen: w.budget } : w)); setSelectedAlert(prev => prev && prev.work_id === workId ? { ...prev, status: 'frozen', funds_frozen: prev.budget } : prev); loadWorkOrders(); }, [loadWorkOrders]);
  const filteredAlerts = useMemo(() => !selectedWard ? workOrders : workOrders.filter(a => a.ward_name === selectedWard.name), [selectedWard, workOrders]);
  return <div className="min-h-screen bg-slate-950 text-slate-200 flex">
    <Sidebar activeView={view} onNavigate={v => { setView(v); if (v !== 'map') setSelectedWard(null); }} alertCount={flaggedAlerts.length} />
    <main className="flex-1 overflow-y-auto"><header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-6 py-3"><div className="flex items-center justify-between"><div><h1 className="text-base font-bold text-white">{view === 'overview' && 'Executive Overview Dashboard'}{view === 'governance' && 'MPLADS Governance Intelligence Center'}{view === 'map' && 'Ward-Wise Geospatial Risk View'}{view === 'deepdive' && 'Multi-Modal Fraud Deep-Dive'}</h1><p className="text-xs text-slate-500">Kavach · Bangalore MPLADS AI-Driven Audit & Fraud Forensics Engine</p></div><div className="flex items-center gap-2 text-xs text-slate-500"><Activity className="w-3.5 h-3.5 text-emerald-400" />Live monitoring <span className="text-slate-700">|</span><Zap className="w-3.5 h-3.5 text-amber-400" />AI confidence 94.2%</div></div></header>
      <div className="p-6 space-y-6">
        {view === 'governance' && <GovernanceCenter />}
        {view === 'overview' && <><KPIStrip totalFunds={totalFunds} anomalies={workOrders.length} frozenFunds={frozenFunds} savings={estimatedSavings} /><div className="grid grid-cols-1 xl:grid-cols-5 gap-6"><div className="xl:col-span-3"><FundVelocityChart data={fundVelocityData} /></div><div className="xl:col-span-2"><ZoneBreakdown funds={totalFunds} frozen={frozenFunds} /></div></div><AlertList alerts={workOrders.slice(0, 8)} onSelect={handleAlertSelect} title="Recent Critical Alerts" loading={loadingOrders} /><div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-2"><FileSearch className="w-3.5 h-3.5" />Click any alert to open the Multi-Modal Fraud Deep-Dive panel</div></>}
        {view === 'map' && <><WardMap wards={wards} selectedWard={selectedWard} onSelectWard={w => setSelectedWard(w)} /><div className="flex items-center gap-2 text-xs text-slate-500 px-1"><MapIcon className="w-3.5 h-3.5" />{selectedWard ? `Showing filtered alerts for ${selectedWard.name} — ${filteredAlerts.length} matches` : 'Showing all alerts across Bangalore wards'}{selectedWard && <button onClick={() => setSelectedWard(null)} className="ml-2 text-amber-400 hover:text-amber-300">Clear filter</button>}</div><AlertList alerts={filteredAlerts} onSelect={handleAlertSelect} title={selectedWard ? `Alerts: ${selectedWard.name}` : 'All Ward Alerts'} loading={loadingOrders} /></>}
        {view === 'deepdive' && <DeepDiveLanding alerts={workOrders} loading={loadingOrders} onSelect={handleAlertSelect} />}
      </div></main>
    {selectedAlert && <DeepDivePanel alert={selectedAlert} onClose={() => setSelectedAlert(null)} contractorImage={contractorImage} aiBaselineImage={aiBaselineImage} onFundsFrozen={handleFundsFrozen} />}
  </div>;
}
function ZoneBreakdown({ funds, frozen }: { funds: number; frozen: number }) { const zones = [{name:'Bangalore North',funds:funds*.36,flagged:12,color:'bg-blue-500'},{name:'Bangalore South',funds:funds*.38,flagged:14,color:'bg-emerald-500'},{name:'Bangalore Central',funds:funds*.26,flagged:9,color:'bg-amber-500'}]; return <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 h-full"><h2 className="text-sm font-semibold text-white mb-1">Constituency Zone Breakdown</h2><p className="text-xs text-slate-500 mb-4">Fund distribution across 3 Bangalore MPLADS zones</p><div className="space-y-4">{zones.map(z=><div key={z.name}><div className="flex items-center justify-between mb-1.5"><span className="text-sm text-slate-300">{z.name}</span><span className="text-sm font-bold text-white">{formatCurrency(z.funds)}</span></div><div className="h-2 rounded-full bg-slate-800 overflow-hidden"><div className={`h-full rounded-full ${z.color}`} style={{width:`${(z.funds/funds)*100}%`}} /></div><div className="flex justify-between mt-1 text-[10px] text-slate-500"><span>{z.flagged} flagged works</span><span>{((z.funds/funds)*100).toFixed(1)}%</span></div></div>)}</div><div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between"><span className="text-xs text-slate-500">Total Frozen</span><span className="text-sm font-bold text-amber-400">{formatCurrency(frozen)}</span></div></div> }
function DeepDiveLanding({ alerts, loading, onSelect }: { alerts: WorkOrder[]; loading: boolean; onSelect: (a: WorkOrder) => void }) { const highRisk = alerts.filter(a => a.risk_level === 'high'); return <div className="space-y-6"><div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6"><h2 className="text-lg font-bold text-white">Multi-Modal Fraud Deep-Dive</h2><p className="text-xs text-slate-500 mt-1">BoQ, vision-forensics and collusion signals for high-risk work orders.</p></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{['Textual & BoQ Audit','Spatial-Temporal Vision','Collusion Network Graph'].map(t=><div key={t} className="rounded-xl bg-slate-900 border border-slate-800 p-4"><h3 className="text-sm font-semibold text-white">{t}</h3><p className="text-xs text-slate-500 mt-1">Open a high-risk work order for detailed inspection.</p></div>)}</div><AlertList alerts={highRisk} onSelect={onSelect} title="High-Risk Work Orders — Open to Inspect" loading={loading} /></div> }
