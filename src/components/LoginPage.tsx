import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, ShieldCheck, ArrowRight, Activity } from 'lucide-react';

interface LoginPageProps { onLogin: (user: { name: string; role: string }) => void; }

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('auditor@drishti.gov.in');
  const [password, setPassword] = useState('drishti-demo');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError('Enter your demo credentials to continue.'); return; }
    setError('');
    onLogin({ name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), role: 'MPLADS Audit Officer' });
  };

  return <div className="min-h-screen bg-[#07100f] text-slate-100 flex items-center justify-center p-5 overflow-hidden relative">
    <div className="absolute inset-0 opacity-30" style={{backgroundImage:'radial-gradient(circle at 20% 20%, rgba(245,158,11,.18), transparent 30%), radial-gradient(circle at 80% 70%, rgba(16,185,129,.14), transparent 28%)'}} />
    <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full border border-amber-500/10" />
    <div className="absolute -bottom-48 -left-24 w-[34rem] h-[34rem] rounded-full border border-emerald-500/10" />
    <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1.1fr_.9fr] rounded-3xl border border-white/10 bg-slate-950/75 backdrop-blur-xl shadow-2xl overflow-hidden">
      <section className="hidden lg:flex p-12 flex-col justify-between border-r border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/30">
        <div><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-emerald-500 flex items-center justify-center"><ShieldCheck className="w-7 h-7 text-slate-950" /></div><div><div className="text-2xl font-black tracking-tight">DRISHTI</div><div className="text-[10px] uppercase tracking-[.28em] text-slate-500">MPLADS Intelligence</div></div></div>
        <div className="mt-20"><p className="text-amber-400 text-xs uppercase tracking-[.3em] font-semibold">Decision intelligence for public funds</p><h1 className="text-5xl font-black leading-[1.05] mt-4">See risk.<br/><span className="text-slate-400">Trace money.</span><br/>Act early.</h1><p className="text-slate-400 mt-6 max-w-md leading-7">A transparent audit cockpit for anomaly detection, financial divergence, work progress, evidence forensics and accountable intervention.</p></div></div>
        <div className="flex items-center gap-2 text-xs text-slate-500"><Activity className="w-4 h-4 text-emerald-400"/>Demo audit engine ready · Bengaluru jurisdiction</div>
      </section>
      <section className="p-7 sm:p-10 lg:p-12 flex items-center"><div className="w-full max-w-md mx-auto"><div className="lg:hidden flex items-center gap-3 mb-10"><div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-300 to-emerald-500 flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-slate-950"/></div><div><div className="text-xl font-black">DRISHTI</div><div className="text-[9px] uppercase tracking-[.25em] text-slate-500">MPLADS Intelligence</div></div></div>
        <div className="mb-8"><div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>SECURE DEMO ENVIRONMENT</div><h2 className="text-3xl font-bold mt-5 text-white">Welcome back</h2><p className="text-sm text-slate-500 mt-2">Sign in to continue to the governance intelligence center.</p></div>
        <form onSubmit={submit} className="space-y-5"><label className="block"><span className="text-xs font-medium text-slate-400">Official / demo email</span><input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3.5 text-sm outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10" /></label><label className="block"><span className="text-xs font-medium text-slate-400">Password</span><div className="relative mt-2"><LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600"/><input value={password} onChange={e=>setPassword(e.target.value)} type={showPassword?'text':'password'} className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-11 pr-11 py-3.5 text-sm outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"/><button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300">{showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></label>{error&&<p className="text-xs text-red-400">{error}</p>}<button className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold py-3.5 flex items-center justify-center gap-2 hover:from-amber-300 hover:to-amber-400 transition">Enter DRISHTI <ArrowRight className="w-4 h-4"/></button></form>
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 text-[10px] leading-5 text-slate-500"><strong className="text-slate-400">Demo access:</strong> credentials are prefilled for the SIH prototype. This login is a local demo gate and does not represent production government authentication.</div>
      </div></section>
    </div>
  </div>;
}
