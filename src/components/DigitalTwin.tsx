import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, Clock3, Cpu, Database, MapPin, RefreshCw, ShieldCheck, WalletCards } from 'lucide-react';
import type { WorkOrder } from '@/services/auditService';
import { calculateRisk } from '@/ml/anomalyEngine';

interface DigitalTwinProps { workOrders: WorkOrder[]; loading?: boolean; onInspect: (work: WorkOrder) => void; }

const pct=(n:number)=>`${Math.max(0,Math.min(100,n)).toFixed(0)}%`;
const money=(n:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Math.max(0,n));

function StateBar({label,actual,expected}:{label:string;actual:number;expected:number}){
 const gap=actual-expected;
 return <div className="space-y-1.5"><div className="flex items-center justify-between text-[11px]"><span className="text-slate-400">{label}</span><span className={gap< -10?'text-amber-300':'text-slate-300'}>{pct(actual)} <span className="text-slate-600">/ expected {pct(expected)}</span></span></div><div className="h-2 rounded-full bg-slate-800 overflow-hidden"><div className="h-full rounded-full bg-amber-500 transition-all" style={{width:`${Math.min(100,Math.max(0,actual))}%`}}/></div></div>;
}

export function DigitalTwin({workOrders,loading,onInspect}:DigitalTwinProps){
 const [selectedId,setSelectedId]=useState<string|undefined>();
 const selected=useMemo(()=>workOrders.find(w=>w.work_id===selectedId)||workOrders[0],[workOrders,selectedId]);
 const scored=useMemo(()=>selected?calculateRisk(selected):null,[selected]);
 const actualProgress=Number(selected?.physical_progress_percentage||0);
 const expectedProgress=Number(selected?.expected_progress_percentage||0);
 const expenditure=Number(selected?.total_expenditure||0);
 const payments=Number(selected?.total_payments_released||0);
 const budget=Number(selected?.budget||0);
 const financialState=budget?expenditure/budget*100:0;
 const paymentState=budget?payments/budget*100:0;
 const twinHealth=selected?Math.max(0,Math.round(100-(scored?.riskScore||selected.risk_score||0))):0;
 return <div className="space-y-4 sm:space-y-6">
   <section className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden">
    <div className="p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
       <div><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-lg border border-amber-500/20 bg-amber-500/10 flex items-center justify-center"><Cpu className="w-5 h-5 text-amber-400"/></div><div><h2 className="text-lg font-bold text-white">MPLADS Digital Twin</h2><p className="text-[10px] uppercase tracking-[.18em] text-slate-600">Project state simulation & deviation intelligence</p></div></div><p className="text-xs text-slate-400 max-w-3xl mt-3">A virtual representation of each monitored work order. DRISHTI compares the observed financial, physical and compliance state with the expected state, then passes deviations to the risk engine.</p></div>
       <div className="flex items-center gap-2 text-[10px] text-slate-500 border border-slate-800 rounded-lg px-3 py-2"><Database className="w-3.5 h-3.5"/>{workOrders.length} monitored records</div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] min-h-[470px]">
      <div className="border-b lg:border-b-0 lg:border-r border-slate-800 p-3 overflow-y-auto max-h-[520px]">
       <div className="flex items-center justify-between px-2 py-2"><span className="text-[10px] uppercase tracking-widest text-slate-600">Twin registry</span>{loading&&<RefreshCw className="w-3 h-3 text-slate-600 animate-spin"/>}</div>
       {workOrders.length===0&&!loading&&<div className="p-4 text-xs text-slate-500">No project-level records available.</div>}
       {workOrders.map(w=>{const risk=w.risk_score||0;return <button key={w.work_id} onClick={()=>setSelectedId(w.work_id)} className={`w-full text-left p-3 rounded-xl mb-1.5 border transition ${selected?.work_id===w.work_id?'border-amber-500/30 bg-amber-500/10':'border-transparent hover:border-slate-800 hover:bg-slate-800/40'}`}><div className="flex items-start justify-between gap-2"><span className="text-xs font-medium text-slate-200 line-clamp-2">{w.title}</span><span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${risk>=75?'bg-red-500/15 text-red-400':risk>=50?'bg-amber-500/15 text-amber-300':'bg-emerald-500/15 text-emerald-400'}`}>{risk.toFixed(0)}</span></div><p className="text-[10px] text-slate-600 mt-1">{w.work_id} · {w.ward_name}</p></button>})}
      </div>
      <div className="p-4 sm:p-6">
       {!selected?<div className="h-full flex items-center justify-center text-sm text-slate-500">Select a work order to instantiate its twin.</div>:<>
       <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5"><div><div className="flex items-center gap-2"><span className="text-[9px] uppercase tracking-widest text-amber-400 border border-amber-500/20 rounded-full px-2 py-1">LIVE TWIN STATE</span>{selected.is_demo_data!==false&&<span className="text-[9px] uppercase tracking-widest text-slate-500 border border-slate-800 rounded-full px-2 py-1">Demo record</span>}</div><h3 className="text-base font-bold text-white mt-2">{selected.title}</h3><p className="text-[10px] text-slate-500 mt-1">{selected.contractor} · {selected.agency} · {selected.work_category}</p></div><button onClick={()=>onInspect(selected)} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400">Open audit deep-dive <ArrowRight className="w-3.5 h-3.5"/></button></div>
       <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><p className="text-[9px] uppercase tracking-widest text-slate-600">Twin health</p><p className="text-xl font-black text-white mt-1">{twinHealth}<span className="text-xs text-slate-600">/100</span></p><p className="text-[9px] text-slate-500">inverse of risk</p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><p className="text-[9px] uppercase tracking-widest text-slate-600">Allocation</p><p className="text-xl font-black text-white mt-1">{money(budget)}</p><p className="text-[9px] text-slate-500">sanction/budget baseline</p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><p className="text-[9px] uppercase tracking-widest text-slate-600">Risk state</p><p className={`text-xl font-black mt-1 ${scored?.riskLevel==='high'?'text-red-400':scored?.riskLevel==='medium'?'text-amber-300':'text-emerald-400'}`}>{scored?.riskScore??selected.risk_score}<span className="text-xs text-slate-600">/100</span></p><p className="text-[9px] text-slate-500">ML + compliance</p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><p className="text-[9px] uppercase tracking-widest text-slate-600">Execution</p><p className="text-xl font-black text-white mt-1">{pct(actualProgress)}</p><p className="text-[9px] text-slate-500">physical progress</p></div>
       </div>
       <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 p-4"><div className="flex items-center gap-2 mb-4"><WalletCards className="w-4 h-4 text-amber-400"/><h4 className="text-sm font-semibold text-white">Financial state</h4></div><StateBar label="Expenditure / allocation" actual={financialState} expected={actualProgress}/><div className="mt-4"><StateBar label="Payments / allocation" actual={paymentState} expected={financialState}/></div><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><p className="text-slate-600">Expenditure</p><p className="font-semibold text-slate-300 mt-1">{money(expenditure)}</p></div><div><p className="text-slate-600">Payments released</p><p className="font-semibold text-slate-300 mt-1">{money(payments)}</p></div></div></div>
        <div className="rounded-xl border border-slate-800 p-4"><div className="flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-emerald-400"/><h4 className="text-sm font-semibold text-white">Physical & compliance state</h4></div><StateBar label="Physical progress" actual={actualProgress} expected={expectedProgress}/><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-lg bg-slate-950/60 p-3"><p className="text-[9px] text-slate-600 uppercase">Delay</p><p className="text-sm font-bold text-slate-300 mt-1">{Number(selected.delay_days||0)} days</p></div><div className="rounded-lg bg-slate-950/60 p-3"><p className="text-[9px] text-slate-600 uppercase">Duplicate signal</p><p className="text-sm font-bold text-slate-300 mt-1">{pct(Number(selected.duplicate_similarity||0))}</p></div><div className="rounded-lg bg-slate-950/60 p-3"><p className="text-[9px] text-slate-600 uppercase">Contractor repeat</p><p className="text-sm font-bold text-slate-300 mt-1">{pct(Number(selected.contractor_repeat_rate||0))}</p></div><div className="rounded-lg bg-slate-950/60 p-3"><p className="text-[9px] text-slate-600 uppercase">Target date</p><p className="text-sm font-bold text-slate-300 mt-1">{selected.target_date||'Not supplied'}</p></div></div></div>
       </div>
       <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400"/><h4 className="text-sm font-semibold text-white">Twin → AI handoff</h4></div><span className="text-[10px] text-slate-600">Model: {scored?.model||'Isolation Forest + rules'}</span></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3"><div className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0"/><p className="text-[10px] text-slate-400">Observed state assembled from the current work-order record.</p></div><div className="flex gap-2"><AlertTriangle className="w-4 h-4 text-amber-400 shrink-0"/><p className="text-[10px] text-slate-400">Deviations become explainable anomaly features rather than automatic fraud verdicts.</p></div><div className="flex gap-2"><Clock3 className="w-4 h-4 text-slate-500 shrink-0"/><p className="text-[10px] text-slate-500">Production refresh would consume authorised eSAKSHI updates on a scheduled/API basis.</p></div></div></div>
       <div className="mt-3 flex items-center gap-2 text-[9px] text-slate-600"><MapPin className="w-3 h-3"/>Twin identity: {selected.work_id} · jurisdiction: {selected.ward_name}</div>
       </>}
      </div>
    </div>
   </section>
 </div>;
}
