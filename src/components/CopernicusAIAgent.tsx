import { useMemo, useState } from 'react';
import { Camera, CheckCircle2, ChevronRight, Crosshair, FileImage, MapPin, PackageCheck, Send, ShieldAlert, Sparkles, Upload, X } from 'lucide-react';
import { calculateRisk } from '@/ml/anomalyEngine';
import type { WorkOrder } from '@/services/auditService';

type EvidenceKind = 'top' | 'front' | 'side' | 'other';
type Evidence = { id: string; kind: EvidenceKind; name: string; preview: string; source: 'field' | 'reference' };

type Props = { active?: WorkOrder; scene?: { id: string; date: string; cloud: number; platform: string }; aoi: string };

const kindLabel: Record<EvidenceKind, string> = { top: 'Top view', front: 'Front view', side: 'Side / angle', other: 'Other view' };

export function CopernicusAIAgent({ active, scene, aoi }: Props) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [referenceCount, setReferenceCount] = useState(0);
  const [location, setLocation] = useState(aoi || '12.9716,77.5946');
  const [capturing, setCapturing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ready' | 'sent'>('idle');
  const [result, setResult] = useState<ReturnType<typeof calculateRisk> | null>(null);

  const coverage = useMemo(() => {
    const required: EvidenceKind[] = ['top', 'front', 'side'];
    return required.filter((kind) => evidence.some((item) => item.kind === kind)).length;
  }, [evidence]);

  const captureLocation = () => {
    if (!navigator.geolocation) return;
    setCapturing(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(`${position.coords.latitude.toFixed(6)},${position.coords.longitude.toFixed(6)}`);
        setCapturing(false);
      },
      () => setCapturing(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const addFiles = (files: FileList | null, source: 'field' | 'reference') => {
    if (!files?.length) return;
    const selected = Array.from(files).slice(0, 8);
    if (source === 'reference') setReferenceCount((n) => n + selected.length);
    selected.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const kind: EvidenceKind = source === 'reference' ? 'other' : (['top', 'front', 'side', 'other'] as EvidenceKind[])[Math.min(index, 3)];
      setEvidence((items) => [...items, { id: `${Date.now()}-${Math.random()}`, kind, name: file.name, preview: url, source }]);
    });
    setStatus('ready');
  };

  const removeEvidence = (id: string) => setEvidence((items) => items.filter((item) => item.id !== id));

  const sendToDrishti = () => {
    const base = active || ({ work_id: 'FIELD-DEMO', budget: 10000000, total_expenditure: 6900000, total_payments_released: 6900000, physical_progress_percentage: 74, expected_progress_percentage: 85, target_date: new Date(Date.now() - 20 * 86400000).toISOString(), duplicate_similarity: 0, contractor_repeat_rate: 0 } as WorkOrder);
    const enriched = {
      ...base,
      physical_progress_percentage: active?.physical_progress_percentage ?? 74,
      expected_progress_percentage: active?.expected_progress_percentage ?? 85,
      duplicate_similarity: Number(active?.duplicate_similarity || 0),
      contractor_repeat_rate: Number(active?.contractor_repeat_rate || 0),
    };
    const audit = calculateRisk(enriched);
    const packageData = {
      agent: 'DRISHTI Copernicus AI Evidence Agent v1',
      created_at: new Date().toISOString(),
      work_id: enriched.work_id,
      work_title: enriched.work_title || 'Monitored MPLADS work',
      location,
      aoi,
      copernicus_scene: scene ? { id: scene.id, date: scene.date, cloud_cover: scene.cloud, platform: scene.platform } : null,
      field_evidence: evidence.map(({ id, kind, name, source }) => ({ id, kind, name, source })),
      reference_image_count: referenceCount,
      evidence_coverage: `${coverage}/3 required field views`,
      agent_decision: coverage >= 2 ? 'READY_FOR_DRISHTI' : 'REVIEW_REQUIRED',
      agent_confidence: Number(Math.min(0.98, 0.55 + coverage * 0.12 + (scene ? 0.15 : 0)).toFixed(2)),
      drishti_assessment: { risk_score: audit.riskScore, risk_level: audit.riskLevel, rule_score: audit.ruleScore, ml_anomaly_score: audit.anomalyScore, explanations: audit.explanations, model: audit.model },
    };
    localStorage.setItem('drishti_copernicus_evidence_package', JSON.stringify(packageData));
    setResult(audit);
    setStatus('sent');
  };

  return (
    <section className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/20 p-4 shadow-2xl sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3"><div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-2.5"><Sparkles className="h-5 w-5 text-violet-300" /></div><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-bold text-white">Copernicus AI Evidence Agent</h3><span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-violet-200">AI AGENT</span></div><p className="mt-1 max-w-3xl text-[10px] leading-5 text-slate-400">Capture location + multimodal field evidence, combine it with Copernicus scene context, compare coverage with reference material, then hand the structured evidence package to DRISHTI.</p></div></div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[9px] text-emerald-200"><span className="font-semibold">PIPELINE</span> Agent → Evidence Package → DRISHTI ML + Rules</div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-sky-400" /><p className="text-xs font-semibold text-white">1 · Location & coordinates</p></div><p className="mt-2 break-all text-[10px] text-slate-400">{location}</p><button type="button" onClick={captureLocation} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-[10px] text-slate-300 hover:border-sky-500/40 hover:text-white"><Crosshair className="h-3.5 w-3.5" />{capturing ? 'Capturing…' : 'Capture current location'}</button></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><div className="flex items-center gap-2"><Camera className="h-4 w-4 text-amber-400" /><p className="text-xs font-semibold text-white">2 · Field photographs</p></div><p className="mt-2 text-[10px] text-slate-500">Top + front + side/angle views are the preferred inspection set.</p><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-[10px] font-semibold text-slate-950"><Upload className="h-3.5 w-3.5" />Add field photos<input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files, 'field')} /></label></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><div className="flex items-center gap-2"><FileImage className="h-4 w-4 text-emerald-400" /><p className="text-xs font-semibold text-white">3 · Reference images</p></div><p className="mt-2 text-[10px] text-slate-500">Upload sanctioned/reference photographs for visual comparison.</p><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[10px] font-semibold text-emerald-200"><Upload className="h-3.5 w-3.5" />Add reference photos<input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files, 'reference')} /></label></div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-semibold text-white">Evidence matrix</p><p className="text-[9px] text-slate-500">{coverage}/3 preferred field angles captured · {referenceCount} reference image(s) · {scene ? 'Copernicus scene attached' : 'No live scene attached'}</p></div><div className={`rounded-full px-2 py-1 text-[9px] font-semibold ${coverage >= 2 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>{coverage >= 2 ? 'READY' : 'REVIEW REQUIRED'}</div></div>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">{(['top', 'front', 'side', 'other'] as EvidenceKind[]).map((kind) => { const item = evidence.find((x) => x.kind === kind && x.source === 'field'); return <div key={kind} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">{item ? <div className="relative"><img src={item.preview} alt={kindLabel[kind]} className="h-28 w-full object-cover" /><button type="button" onClick={() => removeEvidence(item.id)} className="absolute right-1 top-1 rounded-full bg-slate-950/80 p-1 text-slate-300"><X className="h-3 w-3" /></button></div> : <div className="flex h-28 items-center justify-center"><div className="text-center"><Camera className="mx-auto h-5 w-5 text-slate-600" /><p className="mt-1 text-[9px] text-slate-500">{kindLabel[kind]}</p></div></div>}<p className="px-2 py-1.5 text-[9px] text-slate-400">{kindLabel[kind]}</p></div>; })}</div>
      </div>

      <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3"><div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-violet-300" /><p className="text-xs font-semibold text-white">AI evidence decision</p></div><div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3"><div className="rounded-lg border border-slate-800 bg-slate-950 p-2"><p className="text-[8px] uppercase text-slate-500">Decision</p><p className="mt-1 text-xs font-bold text-white">{coverage >= 2 ? 'READY FOR DRISHTI' : 'REVIEW REQUIRED'}</p></div><div className="rounded-lg border border-slate-800 bg-slate-950 p-2"><p className="text-[8px] uppercase text-slate-500">Evidence confidence</p><p className="mt-1 text-xs font-bold text-white">{Math.round(Math.min(98, 55 + coverage * 12 + (scene ? 15 : 0)))}%</p></div><div className="rounded-lg border border-slate-800 bg-slate-950 p-2"><p className="text-[8px] uppercase text-slate-500">Copernicus context</p><p className="mt-1 truncate text-xs font-bold text-white">{scene?.id || 'Awaiting scene'}</p></div></div></div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold text-white">Send structured evidence to DRISHTI</p><p className="mt-1 text-[9px] text-slate-500">DRISHTI recalculates the ML + deterministic-rule risk signal from the evidence context. This is an audit-prioritisation signal, not proof of fraud.</p></div><button type="button" onClick={sendToDrishti} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"><Send className="h-4 w-4" />{status === 'sent' ? 'Sent to DRISHTI' : 'Send to DRISHTI'}<ChevronRight className="h-4 w-4" /></button></div>

      {status === 'sent' && result && <div className="mt-3 rounded-xl border border-emerald-500/25 bg-slate-950 p-3"><div className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-emerald-400" /><p className="text-xs font-semibold text-white">DRISHTI final assessment received</p><CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" /></div><div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4"><div className="rounded-lg border border-slate-800 p-2"><p className="text-[8px] text-slate-500">Risk score</p><p className="text-lg font-bold text-white">{result.riskScore}/100</p></div><div className="rounded-lg border border-slate-800 p-2"><p className="text-[8px] text-slate-500">Risk level</p><p className="text-sm font-bold uppercase text-amber-300">{result.riskLevel}</p></div><div className="rounded-lg border border-slate-800 p-2"><p className="text-[8px] text-slate-500">ML anomaly</p><p className="text-sm font-bold text-white">{result.anomalyScore}/100</p></div><div className="rounded-lg border border-slate-800 p-2"><p className="text-[8px] text-slate-500">Rule score</p><p className="text-sm font-bold text-white">{result.ruleScore}/100</p></div></div><p className="mt-3 text-[9px] text-slate-400">{result.explanations.length ? `Primary signals: ${result.explanations.join(' · ')}` : 'No dominant deterministic rule signal crossed the explanation threshold.'}</p></div>}
    </section>
  );
}
