import { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, Bot, CalendarDays, Download, Eye, ExternalLink, Globe2, Languages, MapPin, Maximize2, Play, RefreshCw, Satellite, Search, Send, ShieldCheck, Sparkles, Square, TimerReset } from 'lucide-react';
import type { WorkOrder } from '@/services/auditService';

type WindowKey = '6d' | '12d' | 'weekly';
type EvidenceFrame = { label: string; date: string; progress: number; spend: number; change: string; image: string; note: string };
type Scene = { id: string; date: string; cloud: number; platform: string; title: string; geometry?: unknown; assets?: Record<string, { href?: string; type?: string; title?: string }> };
type ActiveTool = 'visualize' | 'compare' | 'aoi' | 'measure' | 'timelapse' | 'statistics' | 'download' | 'spectral';

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
const stacSearchUrl = 'https://stac.dataspace.copernicus.eu/v1/search';

function previewAsset(scene?: Scene) {
  if (!scene?.assets) return '';
  const entries = Object.entries(scene.assets);
  const preferred = entries.find(([key, asset]) => /thumbnail|preview|visual|render/i.test(key) && /^image\//.test(asset.type || ''));
  const image = preferred || entries.find(([, asset]) => /^image\//.test(asset.type || ''));
  return image?.[1]?.href || '';
}

export function FieldIntelligence({ workOrders }: { workOrders: WorkOrder[] }) {
  const records = Array.isArray(workOrders) ? workOrders : [];
  const [kn, setKn] = useState(false);
  const [selected, setSelected] = useState('');
  const [windowKey, setWindowKey] = useState<WindowKey>('6d');
  const [frameIndex, setFrameIndex] = useState(3);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [cloud, setCloud] = useState(20);
  const [days, setDays] = useState(30);
  const [layer, setLayer] = useState('TRUE_COLOR');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [loadingScenes, setLoadingScenes] = useState(false);
  const [sceneError, setSceneError] = useState('');
  const [tool, setTool] = useState<ActiveTool>('visualize');
  const [aoi, setAoi] = useState('12.9716,77.5946');
  const [measure, setMeasure] = useState('12.9716,77.5946 → 12.9352,77.6245');
  const [timelapsePlaying, setTimelapsePlaying] = useState(false);

  const active = useMemo(() => records.find((w) => w.work_id === selected) || records[0], [records, selected]);
  const frames = timeline[windowKey];
  const frame = frames[Math.min(frameIndex, frames.length - 1)];
  const scene = scenes[Math.min(sceneIndex, Math.max(0, scenes.length - 1))];
  const preview = previewAsset(scene);

  const getCenter = () => {
    const candidate = active as (WorkOrder & { latitude?: number; longitude?: number }) | undefined;
    return { lat: Number(candidate?.latitude) || 12.9716, lon: Number(candidate?.longitude) || 77.5946 };
  };

  const searchScenes = async () => {
    setLoadingScenes(true); setSceneError('');
    try {
      const { lat, lon } = getCenter();
      const end = new Date();
      const start = new Date(Date.now() - days * 86400000);
      const body = {
        collections: ['sentinel-2-l2a'],
        datetime: `${start.toISOString()}/${end.toISOString()}`,
        bbox: [lon - 0.08, lat - 0.08, lon + 0.08, lat + 0.08],
        limit: 24,
        query: { 'eo:cloud_cover': { lte: cloud } },
        sortby: [{ field: 'datetime', direction: 'desc' }],
      };
      const response = await fetch(stacSearchUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
      const json = await response.json();
      const next: Scene[] = (json.features || []).map((f: any) => ({ id: f.id, date: f.properties?.datetime || f.properties?.start_datetime || '', cloud: Number(f.properties?.['eo:cloud_cover'] || 0), platform: f.properties?.platform || 'Sentinel-2', title: f.properties?.['sat:product_name'] || f.id, geometry: f.geometry, assets: f.assets }));
      setScenes(next); setSceneIndex(0);
      if (!next.length) setSceneError('No Sentinel-2 L2A scenes matched this MP/work location, date range and cloud filter.');
    } catch (error) {
      setSceneError(error instanceof Error ? error.message : 'Unable to query Copernicus catalog.');
    } finally { setLoadingScenes(false); }
  };

  useEffect(() => { searchScenes(); }, [selected]);
  useEffect(() => { if (!timelapsePlaying || scenes.length < 2) return; const id = window.setInterval(() => setSceneIndex((i) => (i + 1) % scenes.length), 1400); return () => window.clearInterval(id); }, [timelapsePlaying, scenes.length]);

  const answer = (q: string) => {
    const x = q.toLowerCase();
    if (x.includes('risk')) return active ? `${active.work_id}: DRISHTI risk signal is ${Math.round(Number(active.risk_score || 0))}/100. This prioritises audit attention; it is not proof of fraud.` : 'No monitored project record is loaded yet.';
    if (x.includes('satellite') || x.includes('bhoonidhi') || x.includes('copernicus')) return 'DRISHTI links the selected MP/work to an AOI, searches Sentinel-2 evidence, filters cloud cover, visualizes the selected scene, and sends the evidence into the audit timeline. Authorised BHOONIDHI remains a separate government-data integration boundary.';
    if (x.includes('progress') || x.includes('timeline')) return `${labels[windowKey]} moves from ${frames[0].progress}% to ${frames[frames.length - 1].progress}% in the controlled project-evidence demonstration.`;
    if (x.includes('scene') || x.includes('image')) return scene ? `${scene.platform} scene ${scene.id} acquired ${new Date(scene.date).toLocaleString()} with ${scene.cloud.toFixed(1)}% cloud cover.` : 'Run Search Scenes to load live Copernicus catalog results.';
    return 'Try: Why is this work high risk? · Search satellite scenes · Show progress timeline · What does NDVI mean?';
  };

  const submit = () => { const q = query.trim(); if (!q) return; setMessages((m) => [...m, `You: ${q}`, `DRISHTI: ${answer(q)}`]); setQuery(''); };

  const tools: { id: ActiveTool; label: string; icon: typeof Eye; description: string }[] = [
    { id: 'visualize', label: 'Visualize', icon: Eye, description: 'True Color, False Color, NDVI and custom visualization choices' },
    { id: 'compare', label: 'Compare', icon: Maximize2, description: 'Compare selected acquisitions side-by-side' },
    { id: 'aoi', label: 'AOI / POI', icon: MapPin, description: 'Work with a project point or GeoJSON/WKT AOI' },
    { id: 'measure', label: 'Measure', icon: Activity, description: 'Distance and area measurement workspace' },
    { id: 'timelapse', label: 'Timelapse', icon: Play, description: 'Play selected satellite acquisitions through time' },
    { id: 'statistics', label: 'Statistics', icon: BarChart3, description: 'Index statistics and time-series analysis' },
    { id: 'spectral', label: 'Spectral', icon: Satellite, description: 'Sentinel-2 spectral exploration' },
    { id: 'download', label: 'Download', icon: Download, description: 'Export selected evidence/product assets' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 p-4 shadow-2xl sm:p-6">
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-400" /><h2 className="text-lg font-bold text-white">{kn ? 'ಕ್ಷೇತ್ರ ಗುಪ್ತಚರ ಕೇಂದ್ರ' : 'Field Intelligence Hub'}</h2><span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] uppercase tracking-wider text-emerald-300">LIVE CATALOG</span></div><p className="mt-1 max-w-4xl text-xs leading-5 text-slate-400">A native Copernicus-style satellite workspace inside DRISHTI — no redirect required. The selected MP/work is the audit context for discovery, visualization, comparison and evidence capture.</p></div>
          <button type="button" onClick={() => setKn((v) => !v)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 hover:border-emerald-500/40 hover:text-white"><Languages className="h-4 w-4" />{kn ? 'English' : 'ಕನ್ನಡ'}</button>
        </div>
      </section>

      <section className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-slate-900 to-sky-950/20 p-4 shadow-xl sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex items-center gap-2"><Globe2 className="h-5 w-5 text-sky-400" /><h3 className="text-base font-semibold text-white">Copernicus Mission Control</h3></div><p className="mt-1 text-[10px] text-slate-500">Search and inspect the live CDSE STAC catalogue directly from DRISHTI.</p></div><div className="flex flex-wrap gap-2"><select value={selected} onChange={(e) => setSelected(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300"><option value="">{records.length ? 'All / default Bengaluru AOI' : 'Bengaluru AOI'}</option>{records.map((w) => <option key={w.work_id} value={w.work_id}>{w.work_id} · {w.work_title || 'Monitored work'}</option>)}</select><button type="button" onClick={searchScenes} disabled={loadingScenes} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loadingScenes ? 'animate-spin' : ''}`} />{loadingScenes ? 'Searching' : 'Search Scenes'}</button></div></div>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4"><label className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-[10px] text-slate-500">Collection<select value="Sentinel-2 L2A" disabled className="mt-1 w-full bg-transparent text-xs font-semibold text-white outline-none" /></label><label className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-[10px] text-slate-500">Max cloud<select value={cloud} onChange={(e) => setCloud(Number(e.target.value))} className="mt-1 w-full bg-transparent text-xs font-semibold text-white outline-none"><option value={5}>5%</option><option value={10}>10%</option><option value={20}>20%</option><option value={30}>30%</option><option value={50}>50%</option></select></label><label className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-[10px] text-slate-500">Time range<select value={days} onChange={(e) => setDays(Number(e.target.value))} className="mt-1 w-full bg-transparent text-xs font-semibold text-white outline-none"><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={365}>Last year</option></select></label><div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3"><p className="text-[9px] uppercase tracking-wider text-emerald-300">Audit context</p><p className="mt-1 truncate text-xs font-semibold text-white">{active?.mp_name || 'MPLADS MP'} · {active?.constituency || 'Bengaluru'}</p></div></div>
        {sceneError && <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] text-amber-200">{sceneError}</div>}
      </section>

      <section className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/10 p-4 shadow-xl sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-2.5"><Satellite className="h-5 w-5 text-orange-300" /></div>
            <div>
              <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-white">BHOONIDHI · ISRO / NRSC Earth Observation</h3><span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-sky-300">EXTERNAL INTEGRATION</span></div>
              <p className="mt-1 max-w-4xl text-[10px] leading-5 text-slate-400">Government EO evidence boundary for project-location verification. DRISHTI keeps this source separate from the live Copernicus catalogue so the prototype never presents unauthorised BHOONIDHI data as live.</p>
            </div>
          </div>
          <a href="https://bhoonidhi.nrsc.gov.in/bhoonidhi/home.html" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-200 hover:bg-orange-500/15">Open BHOONIDHI <ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><p className="text-[8px] uppercase tracking-wider text-slate-500">Source</p><p className="mt-1 text-xs font-semibold text-white">ISRO / NRSC</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><p className="text-[8px] uppercase tracking-wider text-slate-500">Audit AOI</p><p className="mt-1 text-xs font-semibold text-white">{getCenter().lat.toFixed(4)}, {getCenter().lon.toFixed(4)}</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><p className="text-[8px] uppercase tracking-wider text-slate-500">Current state</p><p className="mt-1 text-xs font-semibold text-sky-300">Integration ready</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><p className="text-[8px] uppercase tracking-wider text-slate-500">Live data</p><p className="mt-1 text-xs font-semibold text-amber-300">Authorised API required</p></div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-orange-500/15 bg-orange-500/5 p-3"><div className="flex items-center gap-2 text-[10px] font-semibold text-orange-200"><Search className="h-3.5 w-3.5" /> Intended DRISHTI evidence flow</div><p className="mt-2 text-[9px] leading-5 text-slate-400">Project location → BHOONIDHI search → EO scene/product → temporal comparison → physical-progress evidence → audit signal.</p></div>
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3"><div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-200"><ShieldCheck className="h-3.5 w-3.5" /> Prototype boundary</div><p className="mt-2 text-[9px] leading-5 text-slate-400">No BHOONIDHI credentials or government imagery are fabricated here. Once authorised access is provided, the same AOI can feed the Field Intelligence evidence pipeline.</p></div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-3 sm:grid-cols-4 lg:grid-cols-8">
        {tools.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => setTool(id)} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border px-2 text-[10px] font-semibold transition ${tool === id ? 'border-sky-500/50 bg-sky-500/10 text-sky-300' : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-600 hover:text-white'}`}><Icon className="h-4 w-4" />{label}</button>)}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3 rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-xl sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold text-white">Satellite Workspace · {layer}</p><p className="text-[10px] text-slate-500">{scene ? `${scene.platform} · ${new Date(scene.date).toLocaleString()} · ${scene.cloud.toFixed(1)}% cloud` : 'Run a catalog search to load live scenes'}</p></div><select value={layer} onChange={(e) => setLayer(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300"><option>TRUE_COLOR</option><option>FALSE_COLOR_URBAN</option><option>NDVI</option><option>MOISTURE_INDEX</option><option>SWIR_COMPOSITE</option></select></div>
          <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-black">
            {preview ? <img src={preview} alt="Selected Copernicus satellite scene" className="h-full max-h-[520px] w-full object-contain" /> : <div className="px-8 text-center"><Satellite className="mx-auto mb-3 h-10 w-10 text-sky-400" /><p className="text-sm font-semibold text-white">Native satellite canvas</p><p className="mt-2 text-xs leading-5 text-slate-500">Catalog metadata is live. Rendered True Color / NDVI / custom-band imagery requires a configured Sentinel Hub Processing/WMS connection; DRISHTI does not fabricate imagery.</p></div>}
            <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-slate-950/80 px-2 py-1 text-[9px] text-slate-300">{active?.work_id || 'Bengaluru AOI'} · {active?.constituency || 'Bengaluru'}</div>
            {scene && <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-slate-950/85 p-3 backdrop-blur"><p className="truncate text-[10px] font-semibold text-white">{scene.title}</p><p className="mt-1 text-[9px] text-slate-400">Scene ID: {scene.id}</p></div>}
          </div>
          {scenes.length > 0 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{scenes.slice(0, 8).map((s, i) => <button type="button" key={s.id} onClick={() => setSceneIndex(i)} className={`min-w-36 rounded-xl border p-2 text-left ${i === sceneIndex ? 'border-sky-500/50 bg-sky-500/10' : 'border-slate-800 bg-slate-950'}`}><p className="text-[10px] font-semibold text-white">{new Date(s.date).toLocaleDateString()}</p><p className="text-[9px] text-slate-500">Cloud {s.cloud.toFixed(1)}%</p></button>)}</div>}
        </div>

        <div className="space-y-4 xl:col-span-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="mb-3 flex items-center gap-2"><Search className="h-4 w-4 text-sky-400" /><h4 className="text-sm font-semibold text-white">Catalog Results</h4><span className="ml-auto text-[10px] text-slate-500">{scenes.length} scenes</span></div><div className="max-h-64 space-y-2 overflow-y-auto">{scenes.slice(0, 10).map((s, i) => <button type="button" key={s.id} onClick={() => setSceneIndex(i)} className={`w-full rounded-xl border p-3 text-left ${i === sceneIndex ? 'border-sky-500/40 bg-sky-500/5' : 'border-slate-800 bg-slate-950'}`}><div className="flex items-center justify-between"><p className="text-xs font-semibold text-white">{new Date(s.date).toLocaleString()}</p><span className="text-[9px] text-emerald-300">{s.cloud.toFixed(1)}% cloud</span></div><p className="mt-1 truncate text-[9px] text-slate-500">{s.id}</p></button>)}{!scenes.length && <p className="py-8 text-center text-xs text-slate-500">No scenes loaded yet.</p>}</div></section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-center gap-2"><Bot className="h-4 w-4 text-emerald-400" /><h4 className="text-sm font-semibold text-white">DRISHTI Audit Copilot</h4></div><div className="mt-3 max-h-40 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs"><p className="text-slate-500">Ask about the selected MP/work, scene, risk or satellite evidence.</p>{messages.map((m, i) => <p key={`${i}-${m.slice(0, 10)}`} className={`mt-2 ${m.startsWith('DRISHTI:') ? 'text-emerald-300' : 'text-slate-300'}`}>{m}</p>)}</div><div className="mt-2 flex gap-2"><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Ask DRISHTI..." className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white" /><button type="button" onClick={submit} className="rounded-xl bg-emerald-500 px-3 text-slate-950"><Send className="h-4 w-4" /></button></div></section>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-5">
        <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-400" /><div><h3 className="text-sm font-semibold text-white">Copernicus Feature Workspace</h3><p className="text-[10px] text-slate-500">Each tool activates a dedicated audit workflow instead of redirecting to Copernicus Browser.</p></div></div>
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
          {tool === 'visualize' && <div><p className="text-xs font-semibold text-white">1 · Visualize</p><p className="mt-1 text-[10px] leading-5 text-slate-400">Switch between True Color, Urban False Color, NDVI, moisture and SWIR workflows. Live catalogue discovery is connected now; processed layer rendering uses Sentinel Hub Processing/WMS when configured.</p></div>}
          {tool === 'compare' && <div><p className="text-xs font-semibold text-white">2 · Compare acquisitions</p><div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">{[scene, scenes[Math.min(1, scenes.length - 1)]].filter(Boolean).map((s, i) => <div key={`${s!.id}-${i}`} className="rounded-xl border border-slate-800 bg-slate-900 p-3"><p className="text-[10px] font-semibold text-white">{i === 0 ? 'Current selection' : 'Comparison scene'}</p><p className="mt-1 text-[9px] text-slate-500">{new Date(s!.date).toLocaleString()} · {s!.cloud.toFixed(1)}% cloud</p></div>)}</div></div>}
          {tool === 'aoi' && <div><p className="text-xs font-semibold text-white">3 · Area / Point of Interest</p><p className="mt-1 text-[10px] text-slate-400">Use the project coordinate or paste GeoJSON/WKT for a controlled AOI.</p><textarea value={aoi} onChange={(e) => setAoi(e.target.value)} className="mt-3 h-24 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white" placeholder="Lat, Lon or GeoJSON/WKT" /></div>}
          {tool === 'measure' && <div><p className="text-xs font-semibold text-white">4 · Measure</p><p className="mt-1 text-[10px] text-slate-400">Measurement workspace for audit distances/areas. Paste two coordinate pairs for a quick distance estimate or use the map tooling once the Processing/WMS map is connected.</p><input value={measure} onChange={(e) => setMeasure(e.target.value)} className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white" /></div>}
          {tool === 'timelapse' && <div><p className="text-xs font-semibold text-white">5 · Timelapse</p><p className="mt-1 text-[10px] text-slate-400">Cycle through the live scene catalogue to inspect change over time.</p><div className="mt-3 flex items-center gap-2"><button type="button" onClick={() => setTimelapsePlaying((v) => !v)} disabled={scenes.length < 2} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-40">{timelapsePlaying ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{timelapsePlaying ? 'Stop' : 'Play'}</button><TimerReset className="h-4 w-4 text-slate-500" /><span className="text-[10px] text-slate-500">{scenes.length} available acquisitions</span></div></div>}
          {tool === 'statistics' && <div><p className="text-xs font-semibold text-white">6 · Statistical analysis</p><p className="mt-1 text-[10px] leading-5 text-slate-400">NDVI statistics, histograms and time-series require the Sentinel Hub Statistical API. The DRISHTI panel is prepared for AOI + date-range + evalscript requests, but it will not invent values without an authenticated processing service.</p><div className="mt-3 grid grid-cols-3 gap-2"><div className="rounded-xl border border-slate-800 p-3"><p className="text-[9px] text-slate-500">Scenes</p><p className="text-sm font-bold text-white">{scenes.length}</p></div><div className="rounded-xl border border-slate-800 p-3"><p className="text-[9px] text-slate-500">Best cloud</p><p className="text-sm font-bold text-white">{scenes.length ? `${Math.min(...scenes.map((s) => s.cloud)).toFixed(1)}%` : '—'}</p></div><div className="rounded-xl border border-slate-800 p-3"><p className="text-[9px] text-slate-500">Index</p><p className="text-sm font-bold text-white">NDVI</p></div></div></div>}
          {tool === 'spectral' && <div><p className="text-xs font-semibold text-white">7 · Spectral Explorer</p><p className="mt-1 text-[10px] leading-5 text-slate-400">Sentinel-2 spectral exploration is available in the integration design. It requires the selected AOI and a processed multispectral response; no synthetic spectral values are displayed.</p></div>}
          {tool === 'download' && <div><p className="text-xs font-semibold text-white">8 · Download evidence</p><p className="mt-1 text-[10px] leading-5 text-slate-400">Download a public catalog asset when one is exposed by the selected scene, or use the authenticated Processing API for generated JPG/PNG/GeoTIFF/KMZ/ZIP outputs.</p>{preview && <a href={preview} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950"><Download className="h-4 w-4" />Open selected image asset</a>}</div>}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-amber-400" /><h4 className="text-sm font-semibold text-white">DRISHTI project timeline</h4></div><div className="mt-3 flex flex-wrap gap-2">{(['6d', '12d', 'weekly'] as WindowKey[]).map((key) => <button type="button" key={key} onClick={() => { setWindowKey(key); setFrameIndex(3); }} className={`rounded-lg px-3 py-1.5 text-[10px] ${windowKey === key ? 'bg-amber-500 text-slate-950' : 'border border-slate-700 text-slate-400'}`}>{labels[key]}</button>)}</div><div className="mt-3 grid grid-cols-4 gap-2">{frames.map((f, i) => <button type="button" key={f.label} onClick={() => setFrameIndex(i)} className={`rounded-xl border p-2 text-left ${i === frameIndex ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-800'}`}><p className="text-[9px] text-slate-500">{f.label}</p><p className="text-xs font-bold text-white">{f.progress}%</p></button>)}</div><p className="mt-3 text-[10px] text-slate-500">{frame.change} · {frame.note}</p></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-emerald-400" /><h4 className="text-sm font-semibold text-white">Evidence fusion</h4></div><div className="mt-3 space-y-2 text-[10px] text-slate-400"><p>✓ MP → constituency → monitored work context</p><p>✓ Copernicus STAC scene discovery</p><p>✓ Cloud-filtered temporal evidence</p><p>✓ Satellite scene metadata linked to audit context</p><p>△ Processed NDVI/statistics require configured Sentinel Hub API access</p><p>△ BHOONIDHI remains an authorised integration boundary</p></div></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sky-400" /><h4 className="text-sm font-semibold text-white">Production boundary</h4></div><p className="mt-3 text-[10px] leading-5 text-slate-400">The CDSE STAC catalogue is queried directly from this page. Copernicus processing services use OAuth access tokens and can provide rendered imagery, statistics and analysis; those credentials are intentionally not hard-coded into DRISHTI.</p></div>
      </section>
    </div>
  );
}
