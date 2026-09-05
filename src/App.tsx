import { useState, useMemo, useEffect, useCallback } from 'react';
import { Sidebar, type View } from '@/components/Sidebar';
import { KPIStrip } from '@/components/KPIStrip';
import { AlertList } from '@/components/AlertList';
import { FundVelocityChart, type FundVelocityPoint } from '@/components/FundVelocityChart';
import { WardMap } from '@/components/WardMap';
import { DeepDivePanel } from '@/components/DeepDivePanel';
import { GovernanceCenter } from '@/components/GovernanceCenter';
import { LiveAuditLab } from '@/components/LiveAuditLab';
import { LoginPage } from '@/components/LoginPage';
import { ProfileSettings } from '@/components/ProfileSettings';
import { AllocationSnapshot } from '@/components/AllocationSnapshot';
import { DigitalTwin } from '@/components/DigitalTwin';
import { FieldIntelligence } from '@/components/FieldIntelligence';
import { wards, formatCurrency } from '@/lib/mockData';
import type { Ward as WardType } from '@/lib/types';
import { fetchWorkOrders } from '@/services/auditService';
import type { WorkOrder } from '@/services/auditService';
import { Map as MapIcon, FileSearch, Activity, Zap, ShieldCheck, LogOut } from 'lucide-react';

type User = { name: string; role: string };
const SESSION_KEY = 'drishti_session';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(false);
  const [view, setView] = useState<View>('overview');
  const [selectedAlert, setSelectedAlert] = useState<WorkOrder | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardType | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const loadWorkOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      setWorkOrders(await fetchWorkOrders());
    } catch (err) {
      console.error('Failed to fetch work orders:', err);
      setWorkOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (user) void loadWorkOrders();
  }, [loadWorkOrders, user]);

  const totalFunds = useMemo(
    () => workOrders.reduce((sum, work) => sum + Number(work.budget || 0), 0),
    [workOrders],
  );
  const frozenFunds = useMemo(
    () => workOrders.reduce((sum, work) => sum + Number(work.funds_frozen || 0), 0),
    [workOrders],
  );
  const flaggedAlerts = useMemo(
    () => workOrders.filter((work) => work.risk_level === 'high' || work.status === 'frozen'),
    [workOrders],
  );
  const riskExposure = useMemo(
    () => Math.round(
      workOrders.reduce(
        (sum, work) => sum + Number(work.budget || 0) * Math.max(0, Number(work.risk_score || 0)) / 100,
        0,
      ),
    ),
    [workOrders],
  );

  const liveChart = useMemo<FundVelocityPoint[]>(() => {
    const groups = new Map<string, {
      sanction: number;
      spend: number;
      payment: number;
      progress: number;
      count: number;
    }>();

    workOrders.forEach((work) => {
      const key = (work.date || '').slice(0, 7) || 'Current';
      const group = groups.get(key) || {
        sanction: 0,
        spend: 0,
        payment: 0,
        progress: 0,
        count: 0,
      };
      group.sanction += Number(work.budget || 0);
      group.spend += Number(work.total_expenditure || 0);
      group.payment += Number(work.total_payments_released || 0);
      group.progress += Number(work.physical_progress_percentage || 0);
      group.count += 1;
      groups.set(key, group);
    });

    if (!groups.size) {
      return [{ month: 'Current', fundUtilization: 0, paymentUtilization: 0, physicalProgress: 0 }];
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, group]) => ({
        month,
        fundUtilization: group.sanction
          ? Number((group.spend / group.sanction * 100).toFixed(1))
          : 0,
        paymentUtilization: group.sanction
          ? Number((group.payment / group.sanction * 100).toFixed(1))
          : 0,
        physicalProgress: group.count
          ? Number((group.progress / group.count).toFixed(1))
          : 0,
      }));
  }, [workOrders]);

  const contractorImage = 'https://images.pexels.com/photos/2058120/pexels-photo-2058120.jpeg?auto=compress&cs=tinysrgb&w=800';
  const aiBaselineImage = 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800';

  const handleFundsFrozen = useCallback((workId: string) => {
    setWorkOrders((previous) => previous.map((work) => (
      work.work_id === workId
        ? { ...work, status: 'frozen', funds_frozen: work.budget }
        : work
    )));
    setSelectedAlert((previous) => (
      previous && previous.work_id === workId
        ? { ...previous, status: 'frozen', funds_frozen: previous.budget }
        : previous
    ));
    void loadWorkOrders();
  }, [loadWorkOrders]);

  const filteredAlerts = useMemo(
    () => !selectedWard
      ? workOrders
      : workOrders.filter((work) => work.ward_name === selectedWard.name),
    [selectedWard, workOrders],
  );

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  if (!user) {
    return (
      <LoginPage
        onLogin={(loggedInUser) => {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
          setUser(loggedInUser);
        }}
      />
    );
  }

  const title = view === 'overview'
    ? 'Executive Overview'
    : view === 'digitaltwin'
      ? 'MPLADS Digital Twin'
      : view === 'governance'
        ? 'Governance Intelligence Center'
        : view === 'map'
          ? 'Ward-Wise Geospatial Risk View'
          : view === 'fieldintel'
            ? 'Field Intelligence Hub'
            : 'Multi-Modal Fraud Deep-Dive';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row">
      <Sidebar
        activeView={view}
        onNavigate={(nextView) => {
          setView(nextView);
          if (nextView !== 'map') setSelectedWard(null);
          setSelectedAlert(null);
        }}
        alertCount={flaggedAlerts.length}
        onProfile={() => setProfile(true)}
        user={user}
      />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-3 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white truncate">{title}</h1>
                <span className="hidden xs:inline text-[9px] uppercase tracking-widest rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300 px-2 py-1">
                  DRISHTI
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                Decision intelligence for MPLADS · Bengaluru demonstration jurisdiction
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Audit engine <span className="text-slate-700">|</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                ML inference live
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-lg border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-900"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[.07] px-3 py-2 flex items-start gap-2 text-[10px] sm:text-xs text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>SIH DEMO MODE</strong> — Grounded in the supplied MPLADS allocation extract + synthetic testing scenarios. No eSAKSHI records are fabricated.
            </span>
          </div>
        </header>

        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          {view === 'digitaltwin' && (
            <DigitalTwin workOrders={workOrders} loading={loadingOrders} onInspect={setSelectedAlert} />
          )}
          {view === 'fieldintel' && <FieldIntelligence workOrders={workOrders} />}
          {view === 'governance' && <GovernanceCenter />}

          {view === 'overview' && (
            <>
              <AllocationSnapshot />
              <KPIStrip
                totalFunds={totalFunds}
                anomalies={flaggedAlerts.length}
                frozenFunds={frozenFunds}
                savings={riskExposure}
              />
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
                <div className="xl:col-span-3"><FundVelocityChart data={liveChart} /></div>
                <div className="xl:col-span-2"><ZoneBreakdown funds={totalFunds} frozen={frozenFunds} /></div>
              </div>
              <LiveAuditLab />
              <AlertList
                alerts={workOrders.slice(0, 8)}
                onSelect={setSelectedAlert}
                title="Recent Critical Alerts"
                loading={loadingOrders}
              />
              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-slate-500 py-2">
                <FileSearch className="w-3.5 h-3.5" />
                Tap an alert to open the Multi-Modal Fraud Deep-Dive
              </div>
            </>
          )}

          {view === 'map' && (
            <>
              <WardMap wards={wards} selectedWard={selectedWard} onSelectWard={setSelectedWard} />
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-slate-500 px-1">
                <MapIcon className="w-3.5 h-3.5" />
                {selectedWard
                  ? `Showing filtered alerts for ${selectedWard.name} — ${filteredAlerts.length} matches`
                  : 'Showing all alerts across Bangalore wards'}
                {selectedWard && (
                  <button onClick={() => setSelectedWard(null)} className="text-amber-400 hover:text-amber-300">
                    Clear filter
                  </button>
                )}
              </div>
              <AlertList
                alerts={filteredAlerts}
                onSelect={setSelectedAlert}
                title={selectedWard ? `Alerts: ${selectedWard.name}` : 'All Ward Alerts'}
                loading={loadingOrders}
              />
            </>
          )}

          {view === 'deepdive' && (
            <DeepDiveLanding alerts={workOrders} loading={loadingOrders} onSelect={setSelectedAlert} />
          )}
        </div>
      </main>

      {selectedAlert && (
        <DeepDivePanel
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          contractorImage={contractorImage}
          aiBaselineImage={aiBaselineImage}
          onFundsFrozen={handleFundsFrozen}
        />
      )}
      {profile && <ProfileSettings user={user} onClose={() => setProfile(false)} />}
    </div>
  );
}

function ZoneBreakdown({ funds, frozen }: { funds: number; frozen: number }) {
  const zones = [
    { name: 'Bangalore North', funds: funds * 0.36 },
    { name: 'Bangalore South', funds: funds * 0.38 },
    { name: 'Bangalore Central', funds: funds * 0.26 },
  ];

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 sm:p-5 h-full">
      <h2 className="text-sm font-semibold text-white mb-1">Constituency Zone Breakdown</h2>
      <p className="text-[10px] sm:text-xs text-slate-500 mb-4">
        Allocation proportions applied to the currently monitored project portfolio.
      </p>
      <div className="space-y-4">
        {zones.map((zone) => (
          <div key={zone.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs sm:text-sm text-slate-300">{zone.name}</span>
              <span className="text-xs sm:text-sm font-bold text-white">{formatCurrency(zone.funds)}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${funds ? (zone.funds / funds) * 100 : 0}%` }}
              />
            </div>
            <div className="mt-1 text-[9px] text-slate-500">
              Portfolio allocation share: {funds ? ((zone.funds / funds) * 100).toFixed(1) : '0.0'}%
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500">Total Frozen</span>
        <span className="text-sm font-bold text-amber-400">{formatCurrency(frozen)}</span>
      </div>
    </div>
  );
}

function DeepDiveLanding({
  alerts,
  loading,
  onSelect,
}: {
  alerts: WorkOrder[];
  loading: boolean;
  onSelect: (alert: WorkOrder) => void;
}) {
  const highRisk = alerts.filter((alert) => alert.risk_level === 'high');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 sm:p-6">
        <h2 className="text-lg font-bold text-white">Multi-Modal Fraud Deep-Dive</h2>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
          BoQ, vision-forensics and relationship signals for high-risk work orders. Demonstration scenarios are clearly labelled unless loaded from an authorised source.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {['Textual & BoQ Audit', 'Spatial-Temporal Vision', 'Collusion Network Graph'].map((title) => (
          <div key={title} className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Open a high-risk work order for detailed inspection.</p>
          </div>
        ))}
      </div>
      <AlertList
        alerts={highRisk}
        onSelect={onSelect}
        title="High-Risk Work Orders — Open to Inspect"
        loading={loading}
      />
    </div>
  );
}
