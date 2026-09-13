import { useMemo, useState } from 'react';
import { Camera, CheckCircle2, Crosshair, FileImage, MapPin, Send, ShieldCheck, Sparkles, Upload, XCircle } from 'lucide-react';
import type { WorkOrder } from '@/services/auditService';

type EvidenceImage = { id: string; name: string; kind: 'reference' | 'top' | 'front' | 'side' | 'other'; preview: string; size: number };

type AgentPackage = {
  workId?: string;
  coordinates: { latitude: number; longitude: number; accuracy?: number } | null;
  locationText: string;
  referenceImages: string[];
  fieldImages: Array<{ name: string; kind: string; size: number }>;
  evidenceCoverage: number;
  referenceCoverage: number;
  agentDecision: 'READY_FOR_DRISHTI' | 'REVIEW_REQUIRED' | 'INSUFFICIENT_EVIDENCE';
  confidence: number;
  generatedAt: string;
};

const ACCEPTED = 'image/jpeg,image/png,image/webp';

export function CopernicusEvidenceAgent({ workOrders }: { workOrders: WorkOrder[] }) {
  const records = Array.isArray(workOrders) ? workOrders : [];
  const [selected, setSelected] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [locationText, setLocationText] = useState('');
  const [images, setImages] = useState<EvidenceImage[]>([]);
  const [referenceCount, setReferenceCount] = useState(0);
  const [busyLocation, setBusyLocation] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const active = useMemo(() => records.find((w) => w.work_id === selected) || records[0], [records, selected]);
  const workId = active?.work_id;

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Geolocation is not available in this browser. Enter the coordinates manually below.');
      return;
    }
    setBusyLocation(true);
    setMessage('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy });
        setLocationText(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        setBusyLocation(false);
      },
      () => {
        setBusyLocation(false);
        setMessage('Location permission was not granted. The agent can still work from the selected project coordinates.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const addFiles = (files: FileList | null, kind: EvidenceImage['kind']) => {
    if (!files?.length) return;
    const next = Array.from(files).filter((file) => file.type.startsWith('image/')).slice(0, 8);
    next.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const preview = String(reader.result || '');
        setImages((current) => [...current, { id: `${file.name}-${file.lastModified}-${Math.random()}`, name: file.name, kind, preview, size: file.size }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => setImages((current) => current.filter((image) => image.id !== id));

  const packageData = (): AgentPackage => {
    const field = images.filter((image) => image.kind !== 'reference');
    const refs = images.filter((image) => image.kind === 'reference');
    const requiredAngles = ['top', 'front', 'side'];
    const coveredAngles = requiredAngles.filter((kind) => field.some((image) => image.kind === kind)).length;
    const evidenceCoverage = Math.round((coveredAngles / requiredAngles.length) * 100);
    const referenceCoverage = Math.min(100, referenceCount * 25);
    const hasLocation = Boolean(coordinates || active);
    let agentDecision: AgentPackage['agentDecision'] = 'INSUFFICIENT_EVIDENCE';
    if (hasLocation && coveredAngles === requiredAngles.length && refs.length > 0) agentDecision = 'READY_FOR_DRISHTI';
    else if (hasLocation && field.length > 0) agentDecision = 'REVIEW_REQUIRED';
    const confidence = Math.min(0.98, Math.max(0.32, (evidenceCoverage * 0.55 + referenceCoverage * 0.25 + (hasLocation ? 20 : 0)) / 100));
    return {
      workId,
      coordinates: coordinates || null,
      locationText: locationText || (active ? 'Selected MPLADS work coordinates' : 'Not captured'),
      referenceImages: refs.map((image) => image.name),
      fieldImages: field.map((image) => ({ name: image.name, kind: image.kind, size: image.size })),
      evidenceCoverage,
      referenceCoverage,
      agentDecision,
      confidence: Number(confidence.toFixed(2)),
      generatedAt: new Date().toISOString(),
    };
  };

  const sendToDrishti = () => {
    const payload = packageData();
    localStorage.setItem('drishti_copernicus_evidence_package', JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('drishti:evidence-package', { detail: payload }));
    setSent(true);
    setMessage(`Evidence package sent to DRISHTI for ${payload.workId || 'the selected audit context'}.`);
  };

  const pkg = packageData();
  const decisionClass = pkg.agentDecision === 'READY_FOR_DRISHTI' ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : pkg.agentDecision === 'REVIEW_REQUIRED' ? 'text-amber-300 border-amber-500/30 bg-amber-500/10' : 'text-rose-300 border-rose-500/30 bg-rose-500/10';

  return (
    <section className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/20 p-4 shadow-xl sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-300" /><h3 className="text-base font-semibold text-white">Copernicus AI Evidence Agent</h3><span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-1 text-[9px] uppercase tracking-wider text-violet-200">AGENT WORKSPACE</span></div>
          <p className="mt-1 max-w-4xl text-[10px] leading-5 text-slate-400">Capture the work location and field evidence, align it with reference photographs, create a traceable evidence package, then hand the package to DRISHTI for the final audit calculation.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-400" />No image or government record is fabricated</div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">1 · Audit context</p>
          <select value={selected} onChange={(event) => setSelected(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200"><option value="">{records.length ? 'Use default monitored work' : 'No work-order record loaded'}</option>{records.map((work) => <option key={work.work_id} value={work.work_id}>{work.work_id} · {work.work_title || 'Monitored work'}</option>)}</select>
          <div className="mt-2 text-[10px] text-slate-500">{active ? `${active.constituency || 'Bengaluru'} · budget ₹${Number(active.budget || 0).toLocaleString('en-IN')}` : 'The agent can still capture evidence without a loaded work-order.'}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">2 · Coordinates & location</p>
          <button type="button" onClick={captureLocation} disabled={busyLocation} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-200 hover:bg-violet-500/20 disabled:opacity-60"><Crosshair className="h-4 w-4" />{busyLocation ? 'Capturing location…' : 'Capture current coordinates'}</button>
          <input value={locationText} onChange={(event) => setLocationText(event.target.value)} placeholder="Latitude, longitude or location note" className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-[10px] text-slate-300" />
          <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500"><MapPin className="h-3.5 w-3.5" />{coordinates ? `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)} ±${Math.round(coordinates.accuracy || 0)}m` : active ? 'Project location will be used by the Copernicus AOI workflow.' : 'No coordinates captured yet.'}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">3 · Agent decision</p>
          <div className={`mt-2 rounded-lg border px-3 py-2 text-xs font-semibold ${decisionClass}`}>{pkg.agentDecision.replaceAll('_', ' ')}</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]"><div className="rounded-lg bg-slate-900 p-2 text-slate-400">Angles <b className="block text-white">{pkg.evidenceCoverage}%</b></div><div className="rounded-lg bg-slate-900 p-2 text-slate-400">Confidence <b className="block text-white">{Math.round(pkg.confidence * 100)}%</b></div></div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <label className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 cursor-pointer hover:border-violet-500/50"><div className="flex items-center gap-2"><Upload className="h-4 w-4 text-violet-300" /><span className="text-xs font-semibold text-white">Reference photographs</span><span className="text-[9px] text-slate-500">baseline / sanctioned design evidence</span></div><input type="file" accept={ACCEPTED} multiple className="hidden" onChange={(event) => { setReferenceCount(event.target.files?.length || 0); addFiles(event.target.files, 'reference'); }} /><div className="mt-2 text-[10px] text-slate-500">Upload existing reference images for comparison.</div></label>
          <label className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 cursor-pointer hover:border-violet-500/50"><div className="flex items-center gap-2"><Camera className="h-4 w-4 text-violet-300" /><span className="text-xs font-semibold text-white">Field photographs</span><span className="text-[9px] text-slate-500">top / front / side / other</span></div><input type="file" accept={ACCEPTED} multiple className="hidden" onChange={(event) => addFiles(event.target.files, 'other')} /><div className="mt-2 text-[10px] text-slate-500">Use the angle buttons below after upload to classify each photograph.</div></label>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(['top', 'front', 'side', 'other'] as const).map((kind) => <label key={kind} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-center cursor-pointer hover:border-violet-500/40"><FileImage className="mx-auto h-4 w-4 text-slate-400" /><span className="mt-1 block text-[10px] font-semibold uppercase text-slate-300">{kind}</span><input type="file" accept={ACCEPTED} multiple className="hidden" onChange={(event) => addFiles(event.target.files, kind)} /></label>)}
      </div>

      {images.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">{images.map((image) => <div key={image.id} className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950"><img src={image.preview} alt={image.name} className="h-28 w-full object-cover" /><div className="absolute left-1 top-1 rounded bg-slate-950/80 px-1.5 py-1 text-[8px] uppercase text-white">{image.kind}</div><button type="button" onClick={() => removeImage(image.id)} className="absolute right-1 top-1 rounded bg-slate-950/80 p-1 text-slate-300 hover:text-rose-300"><XCircle className="h-4 w-4" /></button><div className="truncate px-2 py-1.5 text-[9px] text-slate-500">{image.name}</div></div>)}</div>}

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
        <div className="grid gap-3 md:grid-cols-4">
          <div><p className="text-[9px] uppercase text-slate-500">Location evidence</p><p className="mt-1 text-sm font-bold text-white">{coordinates || active ? 'Available' : 'Missing'}</p></div>
          <div><p className="text-[9px] uppercase text-slate-500">Reference set</p><p className="mt-1 text-sm font-bold text-white">{images.filter((image) => image.kind === 'reference').length} images</p></div>
          <div><p className="text-[9px] uppercase text-slate-500">Field set</p><p className="mt-1 text-sm font-bold text-white">{images.filter((image) => image.kind !== 'reference').length} images</p></div>
          <div><p className="text-[9px] uppercase text-slate-500">DRISHTI handoff</p><button type="button" onClick={sendToDrishti} className="mt-1 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-[10px] font-bold text-slate-950 hover:bg-emerald-400"><Send className="h-3.5 w-3.5" />Send evidence package</button></div>
        </div>
        {message && <p className="mt-3 text-[10px] text-slate-400">{sent ? '✓ ' : ''}{message}</p>}
      </div>
    </section>
  );
}
