import { ShieldCheck, LayoutDashboard, Map, FileSearch, AlertTriangle, Landmark } from 'lucide-react';

export type View = 'overview' | 'map' | 'deepdive' | 'governance';
interface SidebarProps { activeView: View; onNavigate: (view: View) => void; alertCount: number; }
const navItems: { id: View; label: string; icon: typeof ShieldCheck; desc: string }[] = [
  { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard, desc: 'KPIs & critical alerts' },
  { id: 'governance', label: 'Governance Center', icon: Landmark, desc: 'Finance, progress & compliance' },
  { id: 'map', label: 'Ward Risk Map', icon: Map, desc: 'Geospatial risk view' },
  { id: 'deepdive', label: 'Fraud Deep-Dive', icon: FileSearch, desc: 'Multi-modal inspection' },
];
export function Sidebar({ activeView, onNavigate, alertCount }: SidebarProps) {
  return <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col h-screen sticky top-0">
    <div className="p-5 border-b border-slate-800"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-900/30"><ShieldCheck className="w-6 h-6 text-slate-950" /></div><div><h1 className="text-lg font-bold text-white tracking-tight">KAVACH</h1><p className="text-[10px] text-slate-500 uppercase tracking-widest">MPLADS Forensics</p></div></div></div>
    <div className="px-5 py-3 border-b border-slate-800"><p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Jurisdiction</p><p className="text-sm font-medium text-slate-300">Bangalore MPLADS</p><p className="text-[11px] text-slate-500">North · South · Central</p></div>
    <nav className="flex-1 p-3 space-y-1"><p className="text-[10px] uppercase tracking-widest text-slate-600 px-3 py-2">Navigation</p>{navItems.map(item => { const Icon=item.icon; const active=activeView===item.id; return <button key={item.id} onClick={()=>onNavigate(item.id)} className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${active?'bg-amber-500/10 text-amber-400 border border-amber-500/20':'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'}`}><Icon className="w-5 h-5 shrink-0 mt-0.5" /><div className="text-left"><div className="flex items-center gap-2">{item.label}{item.id==='overview'&&alertCount>0&&<span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full"><AlertTriangle className="w-2.5 h-2.5" />{alertCount}</span>}</div><p className={`text-[10px] font-normal ${active?'text-amber-500/60':'text-slate-600'}`}>{item.desc}</p></div></button> })}</nav>
    <div className="p-4 border-t border-slate-800 space-y-3"><div className="rounded-lg bg-slate-900 p-3"><div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-xs font-medium text-slate-300">AI Engine Active</span></div><p className="text-[10px] text-slate-500">Risk · anomaly · vision analysis</p></div><div className="flex items-center gap-2 px-1"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">AU</div><div><p className="text-xs font-medium text-slate-300">Auditor · CAG</p><p className="text-[10px] text-slate-500">L2 Clearance</p></div></div></div>
  </aside>;
}
