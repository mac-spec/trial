import { useMemo, useState } from 'react';
import { Bot, Globe2, MapPin, Satellite, Send, Sparkles, Database, ExternalLink, Languages, ShieldCheck, CalendarClock, ChevronDown, Activity, Eye, Route, Clock3 } from 'lucide-react';
import type { WorkOrder } from '@/services/auditService';

const kannada = {
  title: 'ಕ್ಷೇತ್ರ ಗುಪ್ತಚರ ಕೇಂದ್ರ',
  intro: 'DRISHTI ಕ್ಷೇತ್ರದ ಸ್ಥಳ, ಯೋಜನೆ ಮತ್ತು ಆಡಳಿತ ಮಾಹಿತಿಯನ್ನು ಒಂದೇ ಜಾಗದಲ್ಲಿ ಸಂಪರ್ಕಿಸುತ್ತದೆ.',
  ask: 'ಪ್ರಶ್ನೆ ಕೇಳಿ...',
};

type WindowKey = '6d' | '12d' | 'weekly';

type EvidenceFrame = {
  label: string;
  date: string;
  progress: number;
  spend: number;
  change: string;
  image: string;
  note: string;
};

const timeline: Record<WindowKey, EvidenceFrame[]> = {
  '6d': [
    { label: 'Day 0', date: '06 days ago', progress: 38, spend: 41, change: 'Road base preparation visible', image: 'https://images.pexels.com/photos/1631677/pexels-photo-1631677.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Baseline evidence frame' },
    { label: 'Day 2', date: '04 days ago', progress: 52, spend: 55, change: 'Sub-base activity expanded', image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Construction footprint increased' },
    { label: 'Day 4', date: '02 days ago', progress: 68, spend: 64, change: 'Road surface preparation detected', image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Latest available demonstration frame' },
    { label: 'Now', date: 'Current audit cycle', progress: 74, spend: 69, change: 'Physical progress trend is positive', image: 'https://images.pexels.com/photos/2101137/pexels-photo-2101137.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Current synthetic evidence state' },
  ],
  '12d': [
    { label: 'Day 0', date: '12 days ago', progress: 12, spend: 18, change: 'Site mobilization', image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Baseline evidence frame' },
    { label: 'Day 4', date: '08 days ago', progress: 31, spend: 35, change: 'Earthwork footprint increased', image: 'https://images.pexels.com/photos/1631677/pexels-photo-1631677.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Change detected' },
    { label: 'Day 8', date: '04 days ago', progress: 56, spend: 52, change: 'Base layer activity', image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Change detected' },
    { label: 'Now', date: 'Current audit cycle', progress: 74, spend: 69, change: 'Surface preparation underway', image: 'https://images.pexels.com/photos/2101137/pexels-photo-2101137.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Current synthetic evidence state' },
  ],
  weekly: [
    { label: 'Week -3', date: '21 days ago', progress: 8, spend: 11, change: 'Pre-mobilization', image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Historical demonstration frame' },
    { label: 'Week -2', date: '14 days ago', progress: 24, spend: 28, change: 'Earthwork started', image: 'https://images.pexels.com/photos/1631677/pexels-photo-1631677.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Historical demonstration frame' },
    { label: 'Week -1', date: '07 days ago', progress: 51, spend: 48, change: 'Sub-base progressing', image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Historical demonstration frame' },
    { label: 'Now', date: 'Current audit cycle', progress: 74, spend: 69, change: 'Surface preparation underway', image: 'https://images.pexels.com/photos/2101137/pexels-photo-2101137.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Current synthetic evidence state' },
  ],
};

const windowLabels: Record<WindowKey, string> = { '6d': 'Last 6 days', '12d': 'Last 12 days', weekly: 'Weekly view' };

export function FieldIntelligence({ workOrders }: { workOrders: WorkOrder[] }) {
  const records = Array.isArray(workOrders) ? workOrders : [];
  const [kn, setKn] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [windowKey, setWindowKey] = useState<WindowKey>('6d');
  const [frameIndex, setFrameIndex] = useState(3);

  const active = useMemo(() => records.find((w) => w.work_id === selected) || records[0], [records, selected]);
  const frames = timeline[windowKey];
  const frame = frames[Math.min(frameIndex, frames.length - 1)];

  const answer = (q: string) => {
    const x = q.toLowerCase();
    if (x.includes('risk') || x.includes('ಅಪಾಯ')) {
      return active ? `${active.work_id}: current DRISHTI risk is ${Math.round(Number(active.risk_score || 0))}/100. This is an anomaly-prioritisation signal, not proof of fraud.` : 'No monitored project record is loaded yet.';
    }
    if (x.includes('satellite') || x.includes('ಭೂ')) return 'Satellite evidence path: work GPS/AOI → authorised BHOONIDHI search → dated imagery → temporal change analysis → physical-progress cross-check. Live government credentials are not claimed in this prototype.';
    if (x.includes('progress') || x.includes('timeline')) return `Selected ${windowLabels[windowKey]}: the demonstration timeline moves from ${frames[0].progress}% to ${frames[frames.length - 1].progress}% physical progress with a dated evidence frame at each checkpoint.`;
    if (x.includes('data') || x.includes('csv') || x.includes('ಡೇಟಾ')) return 'The supplied official extract contains State, MP, Constituency and allocated amount. Project-level audit fields are demonstrated with controlled testing records rather than fabricated eSAKSHI records.';
    return 'Try: “Why is this work high risk?”, “Show progress timeline”, “What data do we have?”, or “How will satellite evidence help?”';
  };

  const submit = () => {
    const q = query.trim();
    if (!q) return;
    setMessages((m) => [...m, `You: ${q}`, `DRISHTI: ${answer(q)}`]);
    setQuery('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 p-4 sm:p-6 shadow-2xl shadow-black/20">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-400" /><h2 className="text-lg font-bold text-white">{kn ? kannada.title : 'Field Intelligence Hub'}</h2><span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] uppercase tracking-wider text-amber-300">DEMO</span></div>
            <p className="mt-1 max-w-3xl text-xs text-slate-400">{kn ? kannada.intro : 'Audit Copilot + project timeline + map + satellite evidence. Select one road project and move through dated evidence frames.'}</p>
          </div>
          <button type="button" onClick={() => setKn((v) => !v)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 transition hover:border-emerald-500/40 hover:text-white"><Languages className="h-4 w-4" />{kn ? 'English' : 'ಕನ್ನಡ'}</button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-black/10 sm:p-5 xl:col-span-2">
          <div className="mb-4 flex items-center gap-2"><Bot className="h-5 w-5 text-emerald-400" /><div><h3 className="text-sm font-semibold text-white">DRISHTI Audit Copilot</h3><p className="text-[10px] text-slate-500">Rule-grounded conversational demo</p></div></div>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><Activity className="mb-1 h-4 w-4 text-emerald-400" /><p className="text-[9px] uppercase tracking-wider text-slate-500">Risk signal</p><p className="text-sm font-bold text-white">{active ? `${Math.round(Number(active.risk_score || 0))}/100` : '—'}</p></div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><Eye className="mb-1 h-4 w-4 text-sky-400" /><p className="text-[9px] uppercase tracking-wider text-slate-500">Evidence</p><p className="text-sm font-bold text-white">{frames.length} frames</p></div>
          </div>
          <div className="min-h-44 max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
            <p className="text-slate-400">{kn ? kannada.intro : 'Ask why a work is risky, what data is available, or how satellite evidence changes the audit.'}</p>
            {messages.map((m, i) => <p key={`${i}-${m.slice(0, 12)}`} className={`mt-2 ${m.startsWith('DRISHTI:') ? 'text-emerald-300' : 'text-slate-300'}`}>{m}</p>)}
          </div>
          <div className="mt-3 flex gap-2"><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} placeholder={kn ? kannada.ask : 'Ask DRISHTI...'} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none transition focus:border-emerald-500/50" /><button type="button" onClick={submit} className="rounded-xl bg-emerald-500 px-3 text-slate-950 transition hover:bg-emerald-400" aria-label="Send"><Send className="h-4 w-4" /></button></div>
          <div className="mt-3 flex flex-wrap gap-2">{['Why is this work high risk?', 'Show progress timeline', 'How will satellite evidence help?'].map((q) => <button type="button" key={q} onClick={() => { setQuery(q); }} className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-[10px] text-slate-400 transition hover:border-emerald-500/30 hover:text-white">{q}</button>)}</div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-black/10 sm:p-5 xl:col-span-3">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-amber-400" /><div><h3 className="text-sm font-semibold text-white">Project Evidence Map</h3><p className="text-[10px] text-slate-500">Google Maps-style navigation surface · OpenStreetMap base</p></div></div><div className="flex items-center gap-2"><select value={selected} onChange={(e) => setSelected(e.target.value)} className="max-w-[230px] rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 outline-none"><option value="">{records.length ? 'Select monitored work' : 'Demo road project'}</option>{records.map((w) => <option key={w.work_id} value={w.work_id}>{w.work_id} · {w.work_title || 'Monitored work'}</option>)}</select></div></div>
          <div className="relative h-64 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
            <iframe title="DRISHTI project map" className="absolute inset-0 h-full w-full border-0" src="https://www.openstreetmap.org/export/embed.html?bbox=77.54%2C12.90%2C77.66%2C13.04&layer=mapnik&marker=12.9716%2C77.5946" loading="lazy" />
            <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between"><div className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-[9px] text-slate-300 backdrop-blur"><span className="font-semibold text-emerald-400">● PROJECT SITE</span><span className="ml-3 text-slate-500">Bengaluru demonstration</span></div><div className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-[9px] text-slate-400 backdrop-blur"><Route className="mr-1 inline h-3 w-3 text-amber-400" />GPS/AOI ready</div></div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2"><div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><p className="text-[9px] text-slate-500">PROJECT</p><p className="mt-1 truncate text-xs font-semibold text-white">{active?.work_title || 'Road construction — demo'}</p></div><div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><p className="text-[9px] text-slate-500">PROGRESS</p><p className="mt-1 text-xs font-semibold text-emerald-300">{frame.progress}%</p></div><div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><p className="text-[9px] text-slate-500">EVIDENCE</p><p className="mt-1 text-xs font-semibold text-sky-300">{frame.label}</p></div></div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-sky-500/20 bg-slate-900 shadow-xl shadow-black/10">
        <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 to-sky-950/20 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex items-center gap-2"><Satellite className="h-5 w-5 text-sky-400" /><h3 className="text-sm font-semibold text-white">BHOONIDHI Temporal Evidence Viewer</h3><span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[9px] text-sky-300">API-READY</span></div><p className="mt-1 text-[10px] text-slate-500">One monitored road project · dated imagery checkpoints · physical-progress cross-check</p></div><div className="flex flex-wrap items-center gap-2"><div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-950 p-1">{(['6d', '12d', 'weekly'] as WindowKey[]).map((key) => <button type="button" key={key} onClick={() => { setWindowKey(key); setFrameIndex(3); }} className={`rounded-lg px-3 py-1.5 text-[10px] transition ${windowKey === key ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>{windowLabels[key]}</button>)}</div><label className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-[10px] text-slate-400"><CalendarClock className="h-3.5 w-3.5" /><select value={frameIndex} onChange={(e) => setFrameIndex(Number(e.target.value))} className="bg-transparent text-slate-200 outline-none">{frames.map((f, i) => <option key={f.label} value={i}>{f.label} · {f.date}</option>)}</select><ChevronDown className="h-3 w-3" /></label></div></div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-5">
          <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 lg:col-span-3">
            <img src={frame.image} alt={`${frame.label} road construction evidence`} className="h-full min-h-[280px] w-full object-cover transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/10" />
            <div className="absolute left-3 top-3 rounded-xl border border-white/10 bg-slate-950/85 px-3 py-2 backdrop-blur"><div className="flex items-center gap-2 text-[10px] font-semibold text-white"><Clock3 className="h-3.5 w-3.5 text-sky-400" />{frame.label} · {frame.date}</div><p className="mt-1 text-[9px] text-slate-400">{frame.note}</p></div>
            <div className="absolute bottom-3 left-3 right-3"><p className="text-sm font-semibold text-white">{frame.change}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${frame.progress}%` }} /></div></div>
          </div>

          <div className="space-y-3 lg:col-span-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><div className="mb-3 flex items-center justify-between"><div><p className="text-[9px] uppercase tracking-widest text-slate-500">Selected evidence</p><p className="mt-1 text-sm font-bold text-white">{frame.label}</p></div><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-300">{frame.progress}% physical</span></div><div className="grid grid-cols-2 gap-2"><div className="rounded-xl border border-slate-800 p-3"><p className="text-[9px] text-slate-500">Evidence date</p><p className="mt-1 text-xs font-semibold text-white">{frame.date}</p></div><div className="rounded-xl border border-slate-800 p-3"><p className="text-[9px] text-slate-500">Spend index</p><p className="mt-1 text-xs font-semibold text-white">{frame.spend}%</p></div></div></div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><div className="mb-3 flex items-center justify-between"><p className="text-[9px] uppercase tracking-widest text-slate-500">Timeline checkpoints</p><span className="text-[9px] text-slate-600">{frames.length} frames</span></div><div className="space-y-2">{frames.map((f, i) => <button type="button" key={f.label} onClick={() => setFrameIndex(i)} className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${i === frameIndex ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-800 hover:border-slate-700'}`}><div className={`h-2.5 w-2.5 rounded-full ${i === frameIndex ? 'bg-emerald-400 ring-4 ring-emerald-400/10' : 'bg-slate-600'}`} /><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold text-slate-200">{f.label} <span className="font-normal text-slate-500">· {f.date}</span></p><p className="truncate text-[9px] text-slate-500">{f.change}</p></div><span className="text-[10px] font-bold text-white">{f.progress}%</span></button>)}</div></div>
          </div>
        </div>
        <div className="border-t border-slate-800 px-4 py-3 text-[10px] text-slate-500 sm:px-5"><span className="font-semibold text-slate-300">Important:</span> the changing imagery above is a controlled demonstration timeline. In production, each checkpoint is populated from authorised BHOONIDHI imagery searched by project GPS/AOI and timestamp; DRISHTI then compares temporal change against reported progress.</div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-black/10 sm:p-5">
        <div className="mb-3 flex items-center gap-2"><Database className="h-5 w-5 text-amber-400" /><h3 className="text-sm font-semibold text-white">eSAKSHI / BHOONIDHI Integration Contract</h3></div>
        <div className="grid grid-cols-1 gap-2 text-[10px] text-slate-400 md:grid-cols-4"><div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><b className="text-white">1 · Source</b><br />Authorised project records + GPS/AOI</div><div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><b className="text-white">2 · Search</b><br />BHOONIDHI token + date range</div><div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><b className="text-white">3 · Compare</b><br />Before → after temporal evidence</div><div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><b className="text-white">4 · Decide</b><br />Change signal → risk → audit</div></div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-1 text-[10px] text-slate-600"><ShieldCheck className="h-3 w-3" /> Live government credentials are not claimed in this prototype.</p><a href="https://bhoonidhi.nrsc.gov.in/bhoonidhi-api/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 hover:text-emerald-300">View BHOONIDHI API specification <ExternalLink className="h-3 w-3" /></a></div>
      </section>
    </div>
  );
}
