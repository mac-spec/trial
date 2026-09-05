import { useMemo, useState } from 'react';
import { Activity, Bot, CalendarClock, Database, Eye, ExternalLink, Globe2, Languages, MapPin, Satellite, Send, ShieldCheck, Sparkles } from 'lucide-react';
import type { WorkOrder } from '@/services/auditService';

type WindowKey = '6d' | '12d' | 'weekly';
type EvidenceFrame = { label: string; date: string; progress: number; spend: number; change: string; image: string; note: string };

const timeline: Record<WindowKey, EvidenceFrame[]> = {
  '6d': [
    { label: 'Day 0', date: '06 days ago', progress: 38, spend: 41, change: 'Road base preparation visible', image: 'https://images.pexels.com/photos/1631677/pexels-photo-1631677.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Baseline demonstration frame' },
    { label: 'Day 2', date: '04 days ago', progress: 52, spend: 55, change: 'Sub-base activity expanded', image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Demonstration change frame' },
    { label: 'Day 4', date: '02 days ago', progress: 68, spend: 64, change: 'Road surface preparation detected', image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Demonstration change frame' },
    { label: 'Now', date: 'Current audit cycle', progress: 74, spend: 69, change: 'Physical progress trend is positive', image: 'https://images.pexels.com/photos/2101137/pexels-photo-2101137.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Current synthetic evidence state' },
  ],
  '12d': [
    { label: 'Day 0', date: '12 days ago', progress: 12, spend: 18, change: 'Site mobilization', image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Baseline demonstration frame' },
    { label: 'Day 4', date: '08 days ago', progress: 31, spend: 35, change: 'Earthwork footprint increased', image: 'https://images.pexels.com/photos/1631677/pexels-photo-1631677.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Demonstration change frame' },
    { label: 'Day 8', date: '04 days ago', progress: 56, spend: 52, change: 'Base layer activity', image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Demonstration change frame' },
    { label: 'Now', date: 'Current audit cycle', progress: 74, spend: 69, change: 'Surface preparation underway', image: 'https://images.pexels.com/photos/2101137/pexels-photo-2101137.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Current synthetic evidence state' },
  ],
  weekly: [
    { label: 'Week -3', date: '21 days ago', progress: 8, spend: 11, change: 'Pre-mobilization', image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Historical demonstration frame' },
    { label: 'Week -2', date: '14 days ago', progress: 24, spend: 28, change: 'Earthwork started', image: 'https://images.pexels.com/photos/1631677/pexels-photo-1631677.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Historical demonstration frame' },
    { label: 'Week -1', date: '07 days ago', progress: 51, spend: 48, change: 'Sub-base progressing', image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Historical demonstration frame' },
    { label: 'Now', date: 'Current audit cycle', progress: 74, spend: 69, change: 'Surface preparation underway', image: 'https://images.pexels.com/photos/2101137/pexels-photo-2101137.jpeg?auto=compress&cs=tinysrgb&w=1200', note: 'Current synthetic evidence state' },
  ],
};

const labels: Record<WindowKey, string> = { '6d': 'Last 6 days', '12d': 'Last 12 days', weekly: 'Weekly view' };

export function FieldIntelligence({ workOrders }: { workOrders: WorkOrder[] }) {
  const records = Array.isArray(workOrders) ? workOrders : [];
  const [kn, setKn] = useState(false);
  const [selected, setSelected] = useState('');
  const [windowKey, setWindowKey] = useState<WindowKey>('6d');
  const [frameIndex, setFrameIndex] = useState(3);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const active = useMemo(() => records.find((w) => w.work_id === selected) || records[0], [records, selected]);
  const frames = timeline[windowKey];
  const frame = frames[Math.min(frameIndex, frames.length - 1)];

  const answer = (q: string) => {
    const x = q.toLowerCase();
    if (x.includes('risk')) return active ? `${active.work_id}: DRISHTI risk signal is ${Math.round(Number(active.risk_score || 0))}/100. This prioritises audit attention; it is not proof of fraud.` : 'No monitored project record is loaded yet.';
    if (x.includes('satellite') || x.includes('bhoonidhi')) return 'Evidence path: work GPS/AOI → authorised BHOONIDHI search → dated imagery → temporal change analysis → physical-progress cross-check. Live government credentials are not claimed in this prototype.';
    if (x.includes('progress') || x.includes('timeline')) return `${labels[windowKey]} moves from ${frames[0].progress}% to ${frames[frames.length - 1].progress}% in this controlled demonstration timeline.`;
    if (x.includes('data') || x.includes('csv')) return 'The supplied official extract contains State, MP, Constituency and allocated amount. Project-level audit fields are demonstrated with controlled testing records rather than fabricated eSAKSHI records.';
    return 'Try: Why is this work high risk? · Show progress timeline · How will satellite evidence help? · What data do we have?';
  };

  const submit = () => { const q = query.trim(); if (!q) return; setMessages((m) => [...m, `You: ${q}`, `DRISHTI: ${answer(q)}`]); setQuery(''); };

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 p-4 sm:p-6 shadow-2xl shadow-black/20">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-400" /><h2 className="text-lg font-bold text-white">{kn ? 'ಕ್ಷೇತ್ರ ಗುಪ್ತಚರ ಕೇಂದ್ರ' : 'Field Intelligence Hub'}</h2><span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] uppercase tracking-wider text-amber-300">DEMO</span></div><p className="mt-1 max-w-3xl text-xs text-slate-400">Audit Copilot + Google Maps-style project map + dated evidence timeline + BHOONIDHI integration path.</p></div>
          <button type="button" onClick={() => setKn((v) => !v)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 hover:border-emerald-500/40 hover:text-white"><Languages className="h-4 w-4" />{kn ? 'English' : 'ಕನ್ನಡ'}</button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-5 xl:col-span-2">
          <div className="mb-4 flex items-center gap-2"><Bot className="h-5 w-5 text-emerald-400" /><div><h3 className="text-sm font-semibold text-white">DRISHTI Audit Copilot</h3><p className="text-[10px] text-slate-500">Rule-grounded conversational demo</p></div></div>
          <div className="mb-3 grid grid-cols-2 gap-2"><div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><Activity className="mb-1 h-4 w-4 text-emerald-400" /><p className="text-[9px] uppercase tracking-wider text-slate-500">Risk signal</p><p className="text-sm font-bold text-white">{active ? `${Math.round(Number(active.risk_score || 0))}/100` : '—'}</p></div><div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><Eye className="mb-1 h-4 w-4 text-sky-400" /><p className="text-[9px] uppercase tracking-wider text-slate-500">Evidence</p><p className="text-sm font-bold text-white">{frames.length} frames</p></div></div>
          <div className="min-h-44 max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs"><p className="text-slate-400">Ask why a work is risky, what data is available, or how satellite evidence changes the audit.</p>{messages.map((m, i) => <p key={`${i}-${m.slice(0, 12)}`} className={`mt-2 ${m.startsWith('DRISHTI:') ? 'text-emerald-300' : 'text-slate-300'}`}>{m}</p>)}</div>
          <div className="mt-3 flex gap-2"><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} placeholder="Ask DRISHTI..." className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50" /><button type="button" onClick={submit} className="rounded-xl bg-emerald-500 px-3 text-slate-950 hover:bg-emerald-400" aria-label="Send"><Send className="h-4 w-4" /></button></div>
          <div className="mt-3 flex flex-wrap gap-2">{['Why is this work high risk?', 'Show progress timeline', 'How will satellite evidence help?'].map((q) => <button type="button" key={q} onClick={() => setQuery(q)} className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-[10px] text-slate-400 hover:border-emerald-500/30 hover:text-white">{q}</button>)}</div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-5 xl:col-span-3">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-amber-400" /><div><h3 className="text-sm font-semibold text-white">Project Evidence Map</h3><p className="text-[10px] text-slate-500">Google Maps-style geographic view · no hexagons or artificial polygons</p></div></div><select value={selected} onChange={(e) => setSelected(e.target.value)} className="max-w-[250px] rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 outline-none"><option value="">{records.length ? 'Select monitored work' : 'Demo road project'}</option>{records.map((w) => <option key={w.work_id} value={w.work_id}>{w.work_id} · {w.work_title || 'Monitored work'}</option>)}</select></div>
          <div className="relative h-[390px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-100 shadow-inner">
            <iframe title="Bengaluru Google Maps-style project evidence map" className="absolute inset-0 h-full w-full border-0" src="https://www.google.com/maps?q=Bengaluru%2C%20Karnataka&z=12&output=embed" loading="eager" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            <div className="absolute left-4 top-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[10px] font-semibold text-slate-700 shadow-lg backdrop-blur"><MapPin className="mr-1 inline h-3.5 w-3.5 text-red-500" />DRISHTI · Bengaluru project view</div>
            <div className="absolute bottom-4 left-4 max-w-xs rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur"><p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Selected project</p><p className="mt-1 text-xs font-bold text-slate-800">{active?.work_title || active?.work_id || 'Demo road construction project'}</p><p className="mt-1 text-[10px] text-slate-600">Risk {active ? Math.round(Number(active.risk_score || 0)) : '—'}/100 · {frame.progress}% demo physical progress</p></div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-sky-400" /><h3 className="text-sm font-semibold text-white">BHOONIDHI Temporal Evidence Viewer</h3></div><p className="mt-1 text-[10px] text-slate-500">Move through dated evidence checkpoints for the selected road project.</p></div><div className="flex flex-wrap gap-2">{(Object.keys(labels) as WindowKey[]).map((key) => <button key={key} type="button" onClick={() => { setWindowKey(key); setFrameIndex(3); }} className={`rounded-lg border px-3 py-2 text-[10px] ${windowKey === key ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 text-slate-400 hover:text-white'}`}>{labels[key]}</button>)}</div></div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 lg:col-span-3"><img src={frame.image} alt="Construction evidence demonstration frame" className="h-64 w-full object-cover" /><div className="grid grid-cols-4 border-t border-slate-800">{frames.map((f, i) => <button key={f.label} type="button" onClick={() => setFrameIndex(i)} className={`border-r border-slate-800 px-2 py-3 text-left last:border-r-0 ${frameIndex === i ? 'bg-emerald-500/10' : 'hover:bg-slate-900'}`}><p className={`text-[10px] font-semibold ${frameIndex === i ? 'text-emerald-300' : 'text-slate-300'}`}>{f.label}</p><p className="mt-1 text-[9px] text-slate-500">{f.date}</p></button>)}</div></div>
          <div className="space-y-3 lg:col-span-2"><div className="rounded-xl border border-slate-800 bg-slate-950 p-4"><div className="flex items-center gap-2"><Satellite className="h-4 w-4 text-sky-400" /><span className="text-[10px] uppercase tracking-widest text-slate-500">Evidence checkpoint</span></div><p className="mt-2 text-sm font-semibold text-white">{frame.change}</p><p className="mt-1 text-xs text-slate-500">{frame.note}</p><div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-[9px] uppercase text-slate-500">Physical progress</p><p className="text-xl font-bold text-white">{frame.progress}%</p></div><div><p className="text-[9px] uppercase text-slate-500">Spend</p><p className="text-xl font-bold text-white">{frame.spend}%</p></div></div></div><div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-400" /><span className="text-[10px] uppercase tracking-widest text-amber-300">Controlled integration boundary</span></div><p className="mt-2 text-xs leading-5 text-slate-400">BHOONIDHI and eSAKSHI are integration targets. This prototype does not claim live government credentials or fabricate satellite/government records.</p></div></div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-emerald-400" /><p className="text-xs font-semibold text-white">eSAKSHI Integration</p></div><p className="mt-2 text-[10px] leading-5 text-slate-500">Authorised project, sanction, expenditure, progress and payment records enter the audit pipeline through a controlled API/CSV contract.</p><span className="mt-3 inline-block rounded-full border border-slate-700 px-2 py-1 text-[9px] text-slate-400">INTEGRATION READY</span></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-center gap-2"><Database className="h-4 w-4 text-sky-400" /><p className="text-xs font-semibold text-white">Evidence Fusion</p></div><p className="mt-2 text-[10px] leading-5 text-slate-500">Financial signals + progress + location + dated field/satellite evidence are brought together before an audit decision.</p><span className="mt-3 inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-300">DRISHTI PIPELINE</span></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-center gap-2"><ExternalLink className="h-4 w-4 text-amber-400" /><p className="text-xs font-semibold text-white">Demo boundary</p></div><p className="mt-2 text-[10px] leading-5 text-slate-500">Remote imagery shown here is demonstration content; the Google map is a geographic basemap, not a government asset layer.</p><span className="mt-3 inline-block rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-300">TRANSPARENT BY DESIGN</span></div>
      </section>
    </div>
  );
}
