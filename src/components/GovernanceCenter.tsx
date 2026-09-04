import { useState } from 'react';
import { Building2, Landmark, ShieldCheck, Users } from 'lucide-react';
import { LiveAuditLab } from './LiveAuditLab';

type Role = 'MP' | 'District Authority' | 'State Nodal Authority' | 'Ministry';

const roles: { name: Role; icon: typeof Landmark; desc: string }[] = [
  { name: 'MP', icon: Users, desc: 'Constituency allocation and work-level oversight' },
  { name: 'District Authority', icon: Building2, desc: 'Execution, payment and physical verification' },
  { name: 'State Nodal Authority', icon: ShieldCheck, desc: 'Cross-district compliance and escalation' },
  { name: 'Ministry', icon: Landmark, desc: 'Portfolio-wide risk and early-warning intelligence' },
];

export function GovernanceCenter() {
  const [role, setRole] = useState<Role>('Ministry');
  const RoleIcon = roles.find(r => r.name === role)?.icon ?? Landmark;

  return <div className="space-y-6">
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div><div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest"><Landmark className="w-4 h-4" /> Governance Intelligence Center</div><h2 className="text-xl font-bold text-white mt-2">Live decision-support for MPLADS monitoring</h2><p className="text-xs text-slate-500 mt-1">Role simulation + live dataset audit. Switch roles to demonstrate how the same evidence supports different authorities.</p></div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"><RoleIcon className="w-4 h-4 text-amber-400" /> Active demo role: <span className="text-slate-200 font-semibold">{role}</span></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-5">{roles.map(r => { const Icon = r.icon; const active = role === r.name; return <button key={r.name} onClick={() => setRole(r.name)} className={`text-left rounded-lg border p-3 transition ${active ? 'border-amber-500/40 bg-amber-500/10' : 'border-slate-800 bg-slate-950 hover:bg-slate-800/60'}`}><Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-500'}`} /><p className="text-xs font-semibold text-slate-200 mt-2">{r.name}</p><p className="text-[10px] leading-4 text-slate-600 mt-1">{r.desc}</p></button>; })}</div>
    </div>

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-widest text-slate-600">Verified allocation master data</p><p className="text-sm font-semibold text-white mt-1">Bangalore MPLADS allocation limit · 4 MPs</p></div><div className="text-left md:text-right"><p className="text-xl font-bold text-amber-400">₹58.8 Cr</p><p className="text-[10px] text-slate-500">₹14.7 Cr allocation limit per listed MP</p></div></div>

    <LiveAuditLab />
  </div>;
}
