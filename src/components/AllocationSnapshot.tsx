import { Database, ExternalLink, ShieldCheck, Users, WalletCards } from 'lucide-react';

const allocations = [
  { mp: 'DR C N MANJUNATH', constituency: 'BANGALORE RURAL', amount: 147000000 },
  { mp: 'P C Mohan', constituency: 'BANGALORE CENTRAL', amount: 159995711.11 },
  { mp: 'SHOBHA KARANDLAJE', constituency: 'BANGALORE NORTH', amount: 147000000 },
  { mp: 'Shri LS Tejasvi Surya', constituency: 'BANGALORE SOUTH', amount: 147000000 },
];
const formatCr=(n:number)=>`₹${(n/10000000).toFixed(2)} Cr`;

export function AllocationSnapshot(){
 const total=allocations.reduce((s,x)=>s+x.amount,0);
 return <section className="rounded-2xl border border-emerald-200 bg-white overflow-hidden shadow-sm">
   <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
     <div>
       <div className="flex flex-wrap items-center gap-2">
         <Database className="w-5 h-5 text-emerald-600"/>
         <h2 className="text-base sm:text-lg font-bold text-slate-900">Official Allocation Baseline</h2>
         <span className="text-[9px] font-bold rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1">OFFICIAL SOURCE DATA</span>
       </div>
       <p className="text-xs text-slate-600 mt-1.5 max-w-3xl">Supplied MPLADS public-dashboard CSV baseline. These allocation records are intentionally kept separate from project-level audit scenarios.</p>
     </div>
     <a href="https://mplads.mospi.gov.in/digigov/dashboard.html" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900">Open source <ExternalLink className="w-3.5 h-3.5"/></a>
   </div>
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-5 sm:p-6">
     <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest"><Users className="w-4 h-4 text-emerald-600"/>MPs in supplied extract</div>
       <div className="text-3xl font-black text-slate-900 mt-2">4</div><p className="text-xs text-slate-600 mt-1">Bangalore constituencies</p>
     </div>
     <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
       <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-800 uppercase tracking-widest"><WalletCards className="w-4 h-4"/>Bangalore allocation</div>
       <div className="text-3xl font-black text-emerald-800 mt-2">{formatCr(total)}</div><p className="text-xs text-emerald-800 mt-1">Sum of four supplied constituency rows</p>
     </div>
     <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest"><ShieldCheck className="w-4 h-4 text-emerald-600"/>Data lineage</div>
       <div className="text-base font-bold text-slate-900 mt-3">Verified input layer</div><p className="text-xs text-slate-600 mt-1">No project-level facts inferred from this allocation file</p>
     </div>
   </div>
   <div className="px-5 sm:px-6 pb-6 space-y-2">{allocations.map(a=><div key={a.constituency} className="grid grid-cols-[1.3fr_1fr_auto] gap-3 items-center rounded-lg bg-slate-50 border border-slate-200 px-3 py-3"><div className="text-xs font-semibold text-slate-800 truncate">{a.mp}</div><div className="text-[10px] font-medium text-slate-600 truncate">{a.constituency}</div><div className="text-sm font-bold text-slate-900">{formatCr(a.amount)}</div></div>)}</div>
 </section>;
}
