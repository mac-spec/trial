import { CheckCircle2, CircleDashed, Database, ExternalLink, FlaskConical, Info } from 'lucide-react';

type Status = 'LIVE' | 'DEMO' | 'SYNTHETIC' | 'EXTERNAL INTEGRATION';

type Item = { name: string; status: Status; detail: string };

const statusMeta: Record<Status, { Icon: typeof CheckCircle2; className: string }> = {
  LIVE: { Icon: CheckCircle2, className: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' },
  DEMO: { Icon: CircleDashed, className: 'text-amber-300 border-amber-500/30 bg-amber-500/10' },
  SYNTHETIC: { Icon: FlaskConical, className: 'text-violet-300 border-violet-500/30 bg-violet-500/10' },
  'EXTERNAL INTEGRATION': { Icon: ExternalLink, className: 'text-sky-300 border-sky-500/30 bg-sky-500/10' },
};

const items: Item[] = [
  { name: 'ML anomaly detection', status: 'LIVE', detail: 'Trained Isolation Forest inference + explainable governance rules.' },
  { name: 'Expenditure / payment analysis', status: 'LIVE', detail: 'Financial divergence and utilization indicators when project fields exist.' },
  { name: 'Cost overrun screening', status: 'LIVE', detail: 'Peer/statistical screening; production BoQ comparison requires authorised records.' },
  { name: 'Progress / delay monitoring', status: 'LIVE', detail: 'Physical-versus-expected progress and delay indicators.' },
  { name: 'Duplicate-work screening', status: 'LIVE', detail: 'Description similarity signal and duplicate alert workflow.' },
  { name: 'Risk alerts + human action', status: 'LIVE', detail: 'Risk levels, investigation queue, review/freeze actions and audit trail.' },
  { name: 'Compliance monitoring', status: 'LIVE', detail: 'Rule-based compliance matrix and traceable decision records.' },
  { name: 'Trend / early-warning view', status: 'DEMO', detail: 'Risk trajectory UI is demonstrated; trained forecasting needs historical calibration.' },
  { name: 'Asset / photo / GPS forensics', status: 'DEMO', detail: 'Evidence workflow and forensic fields are present; computer vision is not claimed as production CV.' },
  { name: 'Collusion / relationship signals', status: 'DEMO', detail: 'Network investigation surface is demonstrated; current graph is not a live fraud finding.' },
  { name: 'Project test records', status: 'SYNTHETIC', detail: 'Prototype work scenarios used where the supplied allocation extract lacks project-level records.' },
  { name: 'MPLADS allocation baseline', status: 'LIVE', detail: 'Uses the supplied MPLADS Digital Governance Dashboard extract.' },
  { name: 'Copernicus satellite imagery', status: 'EXTERNAL INTEGRATION', detail: 'Authenticated external service; OAuth credentials remain server-side in deployment.' },
  { name: 'BHOONIDHI satellite evidence', status: 'EXTERNAL INTEGRATION', detail: 'Integration boundary only until authorised BHOONIDHI credentials/API access are available.' },
  { name: 'eSAKSHI / government project records', status: 'EXTERNAL INTEGRATION', detail: 'Integration contract; no government records are fabricated in the prototype.' },
];

function Badge({ status }: { status: Status }) {
  const { Icon, className } = statusMeta[status];
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider ${className}`}><Icon className="h-3 w-3" />[{status}]</span>;
}

export function PrototypeStatus() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div>
          <h3 className="text-sm font-semibold text-white">Prototype Evidence Status</h3>
          <p className="mt-1 max-w-3xl text-[10px] leading-5 text-slate-500">Every SIH capability is explicitly labelled so the demo never confuses a working local capability with synthetic evidence or an external government/satellite integration.</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => <div key={item.name} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] font-semibold text-slate-200">{item.name}</p><Badge status={item.status} /></div>
          <p className="mt-2 text-[9px] leading-4 text-slate-500">{item.detail}</p>
        </div>)}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {([['LIVE', 'Working prototype capability', Database], ['DEMO', 'Demonstration workflow', CircleDashed], ['SYNTHETIC', 'Generated test evidence', FlaskConical], ['EXTERNAL INTEGRATION', 'Requires external service/data', ExternalLink]] as const).map(([label, detail, Icon]) => <div key={label} className="rounded-lg border border-slate-800 p-2.5"><div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-300"><Icon className="h-3.5 w-3.5" />[{label}]</div><p className="mt-1 text-[8px] text-slate-600">{detail}</p></div>)}
      </div>
    </section>
  );
}
