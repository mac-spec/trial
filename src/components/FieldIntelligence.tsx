import { useMemo, useState } from 'react';
import { Bot, Globe2, MapPin, Satellite, Send, Sparkles, Database, ExternalLink, Languages, ShieldCheck } from 'lucide-react';
import type { WorkOrder } from '@/services/auditService';

const kannada = {
  title: 'ಕ್ಷೇತ್ರ ಗುಪ್ತಚರ ಕೇಂದ್ರ',
  intro: 'DRISHTI ಕ್ಷೇತ್ರದ ಸ್ಥಳ, ಯೋಜನೆ ಮತ್ತು ಆಡಳಿತ ಮಾಹಿತಿಯನ್ನು ಒಂದೇ ಜಾಗದಲ್ಲಿ ಸಂಪರ್ಕಿಸುತ್ತದೆ.',
  ask: 'ಪ್ರಶ್ನೆ ಕೇಳಿ...',
};

export function FieldIntelligence({ workOrders }: { workOrders: WorkOrder[] }) {
  const records = Array.isArray(workOrders) ? workOrders : [];
  const [kn, setKn] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [selected, setSelected] = useState('');

  const active = useMemo(() => {
    if (!records.length) return undefined;
    return records.find((w) => w.work_id === selected) || records[0];
  }, [records, selected]);

  const answer = (q: string) => {
    const x = q.toLowerCase();
    if (x.includes('risk') || x.includes('ಅಪಾಯ')) {
      return active
        ? `${active.work_id}: current DRISHTI risk is ${Math.round(Number(active.risk_score || 0))}/100. This is an anomaly-prioritisation signal, not proof of fraud.`
        : 'No monitored project record is loaded yet. The copilot can answer once a project record is available.';
    }
    if (x.includes('satellite') || x.includes('ಭೂ')) {
      return 'Satellite evidence path: work GPS/AOI → authorised BHOONIDHI search → dated imagery → temporal change analysis → physical-progress cross-check. Live BHOONIDHI access is not claimed in this prototype.';
    }
    if (x.includes('data') || x.includes('csv') || x.includes('ಡೇಟಾ')) {
      return 'The supplied official extract contains State, MP, Constituency and allocated amount. Project-level audit fields are demonstrated with controlled testing records rather than fabricated eSAKSHI records.';
    }
    return 'Try: “Why is this work high risk?”, “What data do we have?”, or “How will satellite evidence help?”';
  };

  const submit = () => {
    const q = query.trim();
    if (!q) return;
    setMessages((m) => [...m, `You: ${q}`, `DRISHTI: ${answer(q)}`]);
    setQuery('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-2xl border border-emerald-500/20 bg-slate-900 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">{kn ? kannada.title : 'Field Intelligence Hub'}</h2>
              <span className="text-[9px] uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-1">DEMO</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">{kn ? kannada.intro : 'Conversational audit + live project map + satellite evidence integration surface.'}</p>
          </div>
          <button type="button" onClick={() => setKn((v) => !v)} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-xs text-slate-300 hover:text-white">
            <Languages className="w-4 h-4" />{kn ? 'English' : 'ಕನ್ನಡ'}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <section className="xl:col-span-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-emerald-400" />
            <div><h3 className="text-sm font-semibold text-white">DRISHTI Audit Copilot</h3><p className="text-[10px] text-slate-500">Rule-grounded conversational demo</p></div>
          </div>
          <div className="min-h-44 max-h-64 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2 text-xs">
            <p className="text-slate-400">{kn ? kannada.intro : 'Ask why a work is risky, what data is available, or how satellite evidence would be integrated.'}</p>
            {messages.map((m, i) => <p key={`${i}-${m.slice(0, 12)}`} className={m.startsWith('DRISHTI:') ? 'text-emerald-300' : 'text-slate-300'}>{m}</p>)}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} placeholder={kn ? kannada.ask : 'Ask DRISHTI about this portfolio...'} className="flex-1 min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50" />
            <button type="button" onClick={submit} className="rounded-xl px-3 bg-emerald-500 text-slate-950" aria-label="Send"><Send className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {['Why is this work high risk?', 'What data do we have?', 'How will satellite evidence help?'].map((q) => <button type="button" key={q} onClick={() => setQuery(q)} className="text-[10px] px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white">{q}</button>)}
          </div>
        </section>

        <section className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4"><MapPin className="w-5 h-5 text-amber-400" /><div><h3 className="text-sm font-semibold text-white">Evidence Map</h3><p className="text-[10px] text-slate-500">Project points + investigation zones</p></div></div>
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full mb-3 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300">
            <option value="">{records.length ? 'Select monitored work' : 'No project records loaded'}</option>
            {records.map((w) => <option key={w.work_id} value={w.work_id}>{w.work_id} · {w.work_title || 'Monitored work'}</option>)}
          </select>
          <div className="relative h-48 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(100,116,139,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.16) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="absolute left-[30%] top-[28%] w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" title="Monitored project" />
            <div className="absolute left-[62%] top-[54%] w-4 h-4 rounded-full bg-amber-400 ring-4 ring-amber-400/20" title="Review zone" />
            <div className="absolute left-[47%] top-[70%] w-3 h-3 rounded-full bg-red-400 ring-4 ring-red-400/20" title="High-risk point" />
            <div className="absolute top-3 left-3 rounded-lg bg-slate-950/90 border border-slate-700 px-2 py-1.5 text-[9px] text-slate-400"><span className="text-emerald-400">●</span> project <span className="ml-2 text-amber-400">●</span> review <span className="ml-2 text-red-400">●</span> high risk</div>
            <div className="absolute bottom-3 right-3 rounded-lg bg-slate-950/90 border border-slate-700 px-2 py-1.5 text-[9px] text-slate-500">Bengaluru demonstration layer</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-3"><Satellite className="w-4 h-4 text-sky-400 mb-2" /><p className="text-[10px] text-slate-500">BHOONIDHI</p><p className="text-xs font-semibold text-white">API-ready</p></div>
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-3"><Globe2 className="w-4 h-4 text-emerald-400 mb-2" /><p className="text-[10px] text-slate-500">Temporal evidence</p><p className="text-xs font-semibold text-white">Before ↔ After</p></div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3"><Database className="w-5 h-5 text-amber-400" /><h3 className="text-sm font-semibold text-white">eSAKSHI / BHOONIDHI Integration Contract</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[10px] text-slate-400">
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-3"><b className="text-white">1 · Source</b><br />Authorised project records</div>
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-3"><b className="text-white">2 · Sync</b><br />Secure gateway + provenance</div>
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-3"><b className="text-white">3 · Evidence</b><br />GPS/AOI → dated imagery</div>
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-3"><b className="text-white">4 · Decision</b><br />Change signal → risk → audit</div>
        </div>
        <p className="mt-3 text-[10px] text-slate-600 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Live government credentials are not claimed in this prototype.</p>
        <a href="https://bhoonidhi.nrsc.gov.in/bhoonidhi-api/" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-emerald-400 hover:text-emerald-300">View BHOONIDHI API specification <ExternalLink className="w-3 h-3" /></a>
      </section>
    </div>
  );
}
