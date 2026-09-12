import { ExternalLink, Info, Satellite, ShieldCheck } from 'lucide-react';
import type { WorkOrder } from '@/services/auditService';

export function BhoonidhiIntegration({ workOrders }: { workOrders: WorkOrder[] }) {
  const active = Array.isArray(workOrders) ? workOrders[0] : undefined;
  const candidate = active as (WorkOrder & { latitude?: number; longitude?: number }) | undefined;
  const lat = Number(candidate?.latitude) || 12.9716;
  const lon = Number(candidate?.longitude) || 77.5946;

  return (
    <section className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/10 p-4 shadow-xl sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-2.5">
            <Satellite className="h-5 w-5 text-orange-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-white">BHOONIDHI · ISRO / NRSC Earth Observation</h3>
              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-sky-300">EXTERNAL INTEGRATION</span>
            </div>
            <p className="mt-1 max-w-3xl text-[10px] leading-5 text-slate-400">
              Government EO evidence boundary for project-location verification. DRISHTI keeps this source separate from the live Copernicus catalogue so the prototype never presents unauthorised BHOONIDHI data as live.
            </p>
          </div>
        </div>
        <a
          href="https://bhoonidhi.nrsc.gov.in/bhoonidhi/home.html"
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-200 hover:bg-orange-500/15"
        >
          Open BHOONIDHI <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-[8px] uppercase tracking-wider text-slate-500">Source</p>
          <p className="mt-1 text-xs font-semibold text-white">ISRO / NRSC</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-[8px] uppercase tracking-wider text-slate-500">Audit AOI</p>
          <p className="mt-1 text-xs font-semibold text-white">{lat.toFixed(4)}, {lon.toFixed(4)}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-[8px] uppercase tracking-wider text-slate-500">Current state</p>
          <p className="mt-1 text-xs font-semibold text-sky-300">Integration ready</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-[8px] uppercase tracking-wider text-slate-500">Live data</p>
          <p className="mt-1 text-xs font-semibold text-amber-300">Authorised API required</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-orange-500/15 bg-orange-500/5 p-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-orange-200"><Info className="h-3.5 w-3.5" /> Intended DRISHTI evidence flow</div>
          <p className="mt-2 text-[9px] leading-5 text-slate-400">Project location → BHOONIDHI search → EO scene/product → temporal comparison → physical-progress evidence → audit signal.</p>
        </div>
        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-200"><ShieldCheck className="h-3.5 w-3.5" /> Prototype boundary</div>
          <p className="mt-2 text-[9px] leading-5 text-slate-400">No BHOONIDHI credentials or government imagery are fabricated here. Once authorised access is provided, the same AOI can feed the Field Intelligence evidence pipeline.</p>
        </div>
      </div>
    </section>
  );
}
