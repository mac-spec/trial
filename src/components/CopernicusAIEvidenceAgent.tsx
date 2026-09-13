import { useMemo, useRef, useState } from 'react';
import { Camera, CheckCircle2, Crosshair, FileCheck2, ImagePlus, MapPin, Send, ShieldAlert, Sparkles, Upload, X } from 'lucide-react';
import type { WorkOrder } from '@/services/auditService';

type EvidenceKind = 'top' | 'front' | 'side' | 'other' | 'reference';
type Evidence = { id: string; kind: EvidenceKind; name: string; url: string; source: 'field' | 'reference' };

type AgentPackage = {
  workId: string;
  coordinates: { latitude: number; longitude: number };
  evidenceCount: number;
  referenceCount: number;
  satelliteScenes: number;
  coverage: number;
  agentDecision: 'READY_FOR_DRISHTI' | 'REVIEW_REQUIRED' | 'INSUFFICIENT_EVIDENCE';
  confidence: number;
  reason: string;
  createdAt: string;
};

const kindLabels: Record<EvidenceKind, string> = {
  top: 'Top view', front: 'Front view', side: 'Side / angle', other: 'Other field view', reference: 'Reference',
};

export function CopernicusAIEvidenceAgent({ workOrders }: { workOrders: WorkOrder[] }) {
  const records = Array.isArray(workOrders) ? workOrders : [];
  const [selectedId, setSelectedId] = useState(records[0]?.work_id || '');
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState({ latitude: 12.9716, longitude: 77.5946 });
  const [scenes, setScenes] = useState(0);
  const [sent, setSent] = useState(false);
  const [packageData, setPackageData] = useState<AgentPackage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const active = useMemo(() => records.find((w) => w.work_id === selectedId) || records[0], [records, selectedId]);
  const fieldEvidence = evidence.filter((e) => e.source === 'field');
  const references = evidence.filter((e) => e.source === 'reference');
  const kinds = new Set(fieldEvidence.map((e) => e.kind));
  const coverage = Math.min(100, Math.round((kinds.size / 3) * 70 + Math.min(scenes, 2) * 10 + Math.min(references.length, 1) * 10));

  const captureLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => { setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude }); setLocating(false); },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const addFiles = (files: FileList | null, source: 'field' | 'reference') => {
    if (!files) return;
    const incoming = Array.from(files).slice(0, 8).map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      kind: source === 'reference' ? 'reference' as const : (['top', 'front', 'side', 'other'][Math.min(index, 3)] as EvidenceKind),
      name: file.name,
      url: URL.createObjectURL(file),
      source,
    }));
    setEvidence((current) => [...current, ...incoming]);
    setSent(false);
  };

  const runAgent = () => {
    const sufficient = coverage >= 60;
    const decision: AgentPackage['agentDecision'] = !sufficient ? 'INSUFFICIENT_EVIDENCE' : Number(active?.risk_score || 0) >= 75 ? 'REVIEW_REQUIRED' : 'READY_FOR_DRISHTI';
    const confidence = Math.min(0.98, 0.55 + coverage / 250 + (scenes ? 0.12 : 0) + (references.length ? 0.08 : 0));
    const reason = !sufficient ? 'Capture at least top/front/side evidence and one satellite/reference signal before handoff.' : decision === 'REVIEW_REQUIRED' ? 'Existing DRISHTI risk signal is already high; evidence should be escalated for audit analysis.' : 'Evidence coverage is sufficient for a controlled handoff to the DRISHTI audit engine.';
    setPackageData({ workId: active?.work_id || 'UNSELECTED', coordinates: coords, evidenceCount: fieldEvidence.length, referenceCount: references.length, satelliteScenes: scenes, coverage, agentDecision: decision, confidence, reason, createdAt: new Date().toISOString() });
    setSent(false);
  };

  const sendToDrishti = () => {
    if (!packageData) runAgent();
    const payload = packageData || { workId: active?.work_id || 'UNSELECTED', coordinates: coords, evidenceCount: fieldEvidence.length, referenceCount: references.length, satelliteScenes: scenes, coverage, agentDecision: coverage >= 60 ? 'READY_FOR_DRISHTI' : 'INSUFFICIENT_EVIDENCE', confidence: Math.min(0.98, 0.55 + coverage / 250), reason: 'Controlled evidence handoff', createdAt: new Date().toISOString() };
    localStorage.setItem('drishti_copernicus_evidence_package', JSON.stringify(payload));
    setSent(true);
  };

  return (
    <section className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/20 p-4 shadow-xl sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-300" /><h3 className="text-base font-semibold text-white">Copernicus AI Evidence Agent</h3><span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-1 text-[9px] uppercase tracking-wider text-violet-200">AGENT</span></div>
          <p className="mt-1 max-w-3xl text-[10px] leading-5 text-slate-400">Capture location and multimodal field evidence, combine it with Copernicus observations, make a transparent evidence-readiness decision, then hand the structured package to DRISHTI.</p>
        </div>
        <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setPackageData(null); setSent(false); }} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300"><option value="">Default Bengaluru project</option>{records.map((w) => <option key={w.work_id} value={w.work_id}>{w.work_id} · {w.work_title || 'Monitored work'}</option>)}</select>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><div className="flex items-center justify-between"><span className="text-[10px] text-slate-500">Location</span><MapPin className="h-4 w-4 text-sky-400" /></div><p className="mt-2 font-mono text-[10px] text-slate-200">{coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}</p><button onClick={captureLocation} disabled={locating} className="mt-2 text-[10px] text-sky-300 hover:text-white">{locating ? 'Capturing…' : 'Capture current coordinates'}</button></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><div className="flex items-center justify-between"><span className="text-[10px] text-slate-500">Satellite evidence</span><Crosshair className="h-4 w-4 text-emerald-400" /></div><p className="mt-2 text-lg font-bold text-white">{scenes}</p><p className="text-[9px] text-slate-500">Copernicus scenes attached</p><button onClick={() => setScenes((n) => Math.min(6, n + 1))} className="mt-2 text-[10px] text-emerald-300 hover:text-white">Attach selected scene</button></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><div className="flex items-center justify-between"><span className="text-[10px] text-slate-500">Evidence coverage</span><FileCheck2 className="h-4 w-4 text-amber-400" /></div><p className="mt-2 text-lg font-bold text-white">{coverage}%</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-violet-400" style={{ width: `${coverage}%` }} /></div></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><div className="flex items-center justify-between"><span className="text-[10px] text-slate-500">DRISHTI risk input</span><ShieldAlert className="h-4 w-4 text-rose-400" /></div><p className="mt-2 text-lg font-bold text-white">{Math.round(Number(active?.risk_score || 0))}/100</p><p className="text-[9px] text-slate-500">Existing audit signal</p></div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between gap-2"><div><h4 className="text-xs font-semibold text-white">Multiview field evidence</h4><p className="text-[9px] text-slate-500">Top + multiple angles; images stay local to this browser demo.</p></div><input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files, 'field')} /><button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-[10px] text-slate-300 hover:text-white"><ImagePlus className="h-3.5 w-3.5" />Add photos</button></div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{(['top', 'front', 'side', 'other'] as EvidenceKind[]).map((kind) => { const item = fieldEvidence.find((e) => e.kind === kind); return <div key={kind} className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/80">{item ? <div className="relative"><img src={item.url} alt={kindLabels[kind]} className="h-24 w-full object-cover" /><button onClick={() => setEvidence((items) => items.filter((e) => e.id !== item.id))} className="absolute right-1 top-1 rounded-full bg-slate-950/80 p-1 text-slate-300"><X className="h-3 w-3" /></button></div> : <div className="flex h-24 items-center justify-center"><Camera className="h-6 w-6 text-slate-700" /></div>}<p className="px-2 py-1.5 text-[9px] text-slate-400">{kindLabels[kind]}</p></div>; })}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <h4 className="text-xs font-semibold text-white">Reference comparison set</h4><p className="mt-1 text-[9px] text-slate-500">Upload existing reference images for visual comparison.</p>
          <input id="drishti-reference-images" type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files, 'reference')} />
          <label htmlFor="drishti-reference-images" className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 px-3 py-5 text-[10px] text-slate-400 hover:border-violet-400/50 hover:text-white"><Upload className="h-4 w-4" />{references.length ? `${references.length} reference image(s) attached` : 'Add reference images'}</label>
          <div className="mt-2 space-y-1">{references.slice(0, 3).map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-900 px-2 py-1.5 text-[9px] text-slate-400"><span className="truncate">{item.name}</span><button onClick={() => setEvidence((items) => items.filter((e) => e.id !== item.id))}><X className="h-3 w-3" /></button></div>)}</div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h4 className="text-xs font-semibold text-white">Agent decision layer</h4><p className="text-[9px] text-slate-500">Deterministic evidence-readiness logic; DRISHTI remains the final audit decision-maker.</p></div><div className="flex gap-2"><button onClick={runAgent} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-[10px] font-semibold text-white hover:bg-violet-400"><Sparkles className="h-3.5 w-3.5" />Run Evidence Agent</button><button onClick={sendToDrishti} disabled={!packageData && coverage < 20} className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[10px] font-semibold text-emerald-300 disabled:opacity-40"><Send className="h-3.5 w-3.5" />Send to DRISHTI</button></div></div>
        {packageData && <div className="mt-3 grid gap-2 sm:grid-cols-4"><div className="rounded-lg bg-slate-900 p-3"><p className="text-[9px] text-slate-500">Decision</p><p className="mt-1 text-xs font-bold text-white">{packageData.agentDecision.replaceAll('_', ' ')}</p></div><div className="rounded-lg bg-slate-900 p-3"><p className="text-[9px] text-slate-500">Confidence</p><p className="mt-1 text-xs font-bold text-white">{Math.round(packageData.confidence * 100)}%</p></div><div className="rounded-lg bg-slate-900 p-3"><p className="text-[9px] text-slate-500">Handoff payload</p><p className="mt-1 text-xs font-bold text-white">{packageData.evidenceCount + packageData.referenceCount + packageData.satelliteScenes} signals</p></div><div className="rounded-lg bg-slate-900 p-3"><p className="text-[9px] text-slate-500">Why</p><p className="mt-1 text-[9px] leading-4 text-slate-300">{packageData.reason}</p></div></div>}
        {sent && <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] text-emerald-300"><CheckCircle2 className="h-4 w-4" />Evidence package handed to DRISHTI. The audit engine can consume the stored handoff payload.</div>}
      </div>
    </section>
  );
}
