import { useState } from 'react';
import { ShieldCheck, LayoutDashboard, Map, FileSearch, AlertTriangle, Landmark, UserRound, PanelLeftClose, PanelLeftOpen, Menu, X } from 'lucide-react';

export type View = 'overview' | 'map' | 'deepdive' | 'governance';
interface SidebarProps { activeView: View; onNavigate: (view: View) => void; alertCount: number; onProfile: ()=>void; user: {name:string; role:string}; }
const navItems: { id: View; label: string; icon: typeof ShieldCheck; desc: string }[] = [
  { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard, desc: 'Live KPIs & audit queue' },
  { id: 'governance', label: 'Governance Intelligence', icon: Landmark, desc: 'Roles, compliance & decisions' },
  { id: 'map', label: 'Ward Risk Map', icon: Map, desc: 'Geospatial risk view' },
  { id: 'deepdive', label: 'Fraud Detection Deep-Dive', icon: FileSearch, desc: 'Evidence & investigations' },
];

export function Sidebar({ activeView, onNavigate, alertCount, onProfile, user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggle = () => setCollapsed(v => !v);
  const navigate = (view: View) => { onNavigate(view); setMobileOpen(false); };
  return <>
    <div className="md:hidden sticky top-0 z-50 h-14 px-3 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <button type="button" onClick={()=>setMobileOpen(v=>!v)} className="w-9 h-9 rounded-lg border border-slate-800 flex items-center justify-center text-slate-300" aria-label={mobileOpen?'Close navigation':'Open navigation'}>
        {mobileOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
      </button>
      <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 to-emerald-500 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-slate-950"/></div><span className="font-black text-white tracking-tight">DRISHTI</span></div>
      <button type="button" onClick={onProfile} className="w-9 h-9 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400" aria-label="Open profile"><UserRound className="w-4 h-4"/></button>
    </div>
    {mobileOpen && <button type="button" aria-label="Close navigation overlay" onClick={()=>setMobileOpen(false)} className="md:hidden fixed inset-0 top-14 z-40 bg-black/50"/>}
    <aside className={`${collapsed ? 'md:w-[76px]' : 'md:w-64'} ${mobileOpen ? 'fixed left-0 top-14 bottom-0 w-[280px]' : 'hidden md:flex'} md:h-screen md:sticky md:top-0 shrink-0 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950 flex-col transition-[width,transform] duration-200 z-40`}>
      <div className={`${collapsed ? 'md:p-3' : 'p-4 md:p-5'} border-b border-slate-800`}>
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={toggle} className="flex items-center gap-3 min-w-0" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-300 to-emerald-500 flex items-center justify-center shadow-lg shadow-amber-900/20"><ShieldCheck className="w-6 h-6 text-slate-950" /></div>
            <div className={`${collapsed ? 'md:hidden' : ''} text-left`}><h1 className="text-lg font-black text-white tracking-tight">DRISHTI</h1><p className="text-[9px] text-slate-500 uppercase tracking-[.22em]">MPLADS Intelligence</p></div>
          </button>
          <button type="button" onClick={toggle} className="hidden md:flex w-8 h-8 rounded-lg border border-slate-800 items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <PanelLeftOpen className="w-4 h-4"/> : <PanelLeftClose className="w-4 h-4"/>}</button>
        </div>
      </div>
      <div className={`${collapsed ? 'md:hidden' : ''} px-4 md:px-5 py-3 border-b border-slate-800`}><p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Monitoring scope</p><p className="text-sm font-medium text-slate-300">Bengaluru MPLADS</p><p className="text-[11px] text-slate-500">North · Central · South</p></div>
      <nav className={`${collapsed ? 'md:p-2' : 'p-3'} flex-1 overflow-y-auto`}>
        <p className={`${collapsed ? 'md:hidden' : ''} hidden md:block text-[10px] uppercase tracking-widest text-slate-600 px-3 py-2`}>Workspace</p>
        {navItems.map(item => { const Icon=item.icon; const active=activeView===item.id; return <button type="button" key={item.id} onClick={()=>navigate(item.id)} title={collapsed ? item.label : undefined} className={`${collapsed ? 'md:justify-center md:px-2' : ''} w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${active?'bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm':'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'}`}><Icon className="w-5 h-5 shrink-0 mt-0.5" /><div className={`${collapsed ? 'md:hidden' : ''} text-left flex-1`}><div className="flex items-center gap-2 whitespace-nowrap">{item.label}{item.id==='overview'&&alertCount>0&&<span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full"><AlertTriangle className="w-2.5 h-2.5" />{alertCount}</span>}</div><p className={`text-[10px] font-normal mt-0.5 ${active?'text-amber-500/60':'text-slate-600'}`}>{item.desc}</p></div></button> })}
      </nav>
      <div className={`${collapsed ? 'md:p-2' : 'p-3'} border-t border-slate-800 space-y-2`}>
        <button type="button" onClick={onProfile} title={collapsed ? user.name : undefined} className="w-full rounded-xl border border-slate-800 bg-slate-900/70 p-3 flex items-center gap-3 text-left hover:border-slate-700 transition"><div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">{user.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div className={`${collapsed ? 'md:hidden' : ''} min-w-0 flex-1`}><p className="text-xs font-semibold text-slate-300 truncate">{user.name}</p><p className="text-[10px] text-slate-500 truncate">{user.role}</p></div><UserRound className={`${collapsed ? 'md:hidden' : ''} w-4 h-4 text-slate-600`}/></button>
        <div className={`${collapsed ? 'md:hidden' : ''} rounded-xl bg-slate-900/70 border border-slate-800 p-3`}><div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/><span className="text-xs font-medium text-slate-300">Audit engine ready</span></div><p className="text-[10px] text-slate-500">Rules · anomaly · evidence</p></div>
      </div>
    </aside>
  </>;
}