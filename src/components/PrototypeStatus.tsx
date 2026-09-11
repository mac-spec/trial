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
  { name: 'Sanction / approval monitoring', status: 'LIVE', detail: 'Schema supports sanctioned/budget fields and the audit workflow can ingest authorised work records.' },
  { name: 'Expenditure / fund utilization', status: 'LIVE', detail: 'Financial utilization, expenditure and payment-divergence indicators when project fields exist.' },
  { name: 'Cost estimates / cost overruns', status: 'LIVE', detail: 'Cost screening is implemented; production BoQ comparison requires authorised project records.' },
  { name: 'Work execution / physical progress', status: 'LIVE', detail: 'Physical-versus-expected progress and execution indicators.' },
  { name: 'Payments monitoring', status: 'LIVE', detail: 'Payment-versus-expenditure divergence is surfaced as an audit signal.' },
  { name: 'Asset creation monitoring', status: 'DEMO', detail: 'Asset/evidence workflow is represented; real asset registers require authorised records.' },
  { name: 'AI/ML anomaly detection', status: 'LIVE', detail: 'Trained Isolation Forest inference combined with explainable governance rules.' },
  { name: 'Potential fraud / irregularity screening', status: 'LIVE', detail: 'Risk signals and evidence are generated; DRISHTI does not declare fraud from an anomaly alone.' },
  { name: 'Duplicate works', status: 'LIVE', detail: 'Description similarity and duplicate alert workflow.' },
  { name: 'Delayed projects', status: 'LIVE', detail: 'Delay fields plus physical-versus-expected progress early-warning logic.' },
  { name: 'Trend analysis', status: 'LIVE', detail: 'Portfolio risk/utilization views and time-grouped monitoring indicators.' },
  { name: 'Predictive early warning', status: 'DEMO', detail: 'Risk trajectory is demonstrated; production forecasting needs authorised historical calibration.' },
  { name: 'Risk-based alerts', status: 'LIVE', detail: 'High/medium/low risk queue with explainable signals and investigation workflow.' },
  { name: 'Automated compliance monitoring', status: 'LIVE', detail: 'Compliance matrix, rules and traceable audit decisions.' },
  { name: 'Decision-support dashboards', status: 'LIVE', detail: 'Executive, governance, digital-twin, geospatial, deep-dive and field-intelligence views.' },
  { name: 'MP / State / District / Ministry views', status: 'DEMO', detail: 'Role-oriented dashboard architecture is present; nationwide authority data requires authorised feeds.' },
  { name: 'Transparency / accountability', status: 'LIVE', detail: 'Evidence trail, human-review actions and append-only audit records.' },
  { name: 'Reduce manual monitoring effort', status: 'LIVE', detail: 'Automated screening prioritizes high-risk works for human investigation.' },
  { name: 'Asset / photo / GPS forensics', status: 'DEMO', detail: 'Evidence workflow and forensic fields are present; production CV is not claimed.' },
  { name: 'Collusion / relationship signals', status: 'DEMO', detail: 'Network investigation surface is demonstrated; current graph is not a live fraud finding.' },
  { name: 'Project test records', status: 'SYNTHETIC', detail: 'Generated scenarios are used where the supplied allocation extract lacks project-level histories.' },
  { name: 'MPLADS allocation baseline', status: 'LIVE', detail: 'Uses the supplied MPLADS Digital Governance Dashboard extract.' },
  { name: 'Copernicus satellite evidence', status: 'EXTERNAL INTEGRATION', detail: 'External authenticated service; OAuth credentials remain server-side in deployment.' },
  { name: 'BHOONIDHI satellite evidence', status: 'EXTERNAL INTEGRATION', detail: 'Integration boundary until authorised BHOONIDHI credentials/API access are available.' },
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
          <p className="mt-1 max-w-3xl text-[10px] leading-5 text-slate-500">Every SIH capability is explicitly labelled so the demo never confuses a working local capability with a demonstration, synthetic evidence, or an external government/satellite integration.</p>
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
