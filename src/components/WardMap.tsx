import { MapPin, Building2, Users, Filter, ZoomIn, ZoomOut, LocateFixed } from 'lucide-react';
import type { Ward } from '@/lib/types';
import { getRiskFill, formatCurrency } from '@/lib/mockData';

interface WardMapProps { wards: Ward[]; selectedWard: Ward | null; onSelectWard: (ward: Ward) => void; }

export function WardMap({ wards, selectedWard, onSelectWard }: WardMapProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Bangalore Ward Geospatial Risk View</h2>
          <p className="mt-0.5 text-xs text-slate-500">Geographic basemap + DRISHTI ward-risk overlay · click a ward to inspect</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400"><span className="h-3 w-3 rounded bg-red-500"/>High</span>
          <span className="flex items-center gap-1.5 text-slate-400"><span className="h-3 w-3 rounded bg-amber-500"/>Medium</span>
          <span className="flex items-center gap-1.5 text-slate-400"><span className="h-3 w-3 rounded bg-emerald-500"/>Low</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
        <div className="relative min-h-[480px] overflow-hidden bg-slate-950 lg:col-span-2">
          <iframe
            title="Bengaluru ward geographic basemap"
            className="absolute inset-0 h-full w-full border-0 opacity-90"
            src="https://www.openstreetmap.org/export/embed.html?bbox=77.48%2C12.89%2C77.69%2C13.08&layer=mapnik&marker=12.9716%2C77.5946"
          />
          <div className="pointer-events-none absolute inset-0 bg-slate-950/20" />

          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-[10px] text-slate-300 shadow-xl backdrop-blur">
            <MapPin className="h-3.5 w-3.5 text-amber-400" /> Bengaluru · Ward risk layer
          </div>
          <div className="absolute right-4 top-4 flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-950/90 shadow-xl backdrop-blur">
            <button type="button" aria-label="Zoom in" className="border-b border-slate-700 p-2 text-slate-300 hover:text-white"><ZoomIn className="h-4 w-4"/></button>
            <button type="button" aria-label="Zoom out" className="border-b border-slate-700 p-2 text-slate-300 hover:text-white"><ZoomOut className="h-4 w-4"/></button>
            <button type="button" aria-label="Locate Bengaluru" className="p-2 text-slate-300 hover:text-white"><LocateFixed className="h-4 w-4"/></button>
          </div>

          <div className="absolute inset-0 p-8 sm:p-12">
            <svg viewBox="0 0 550 430" className="h-full w-full" preserveAspectRatio="none">
              <defs>
                <filter id="ward-risk-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              {wards.map((ward) => {
                const isSelected = selectedWard?.id === ward.id;
                const fill = getRiskFill(ward.riskLevel);
                return (
                  <g key={ward.id} onClick={() => onSelectWard(ward)} className="cursor-pointer">
                    <polygon points={ward.polygon} fill={fill} fillOpacity={isSelected ? 0.48 : 0.28} stroke={fill} strokeWidth={isSelected ? 3 : 1.5} filter={isSelected ? 'url(#ward-risk-glow)' : undefined} />
                    <text x={ward.labelX} y={ward.labelY} textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700" stroke="#0f172a" strokeWidth="3" paintOrder="stroke" className="pointer-events-none select-none">{ward.name}</text>
                    <text x={ward.labelX} y={ward.labelY + 14} textAnchor="middle" fill={fill} fontSize="10" fontWeight="800" stroke="#0f172a" strokeWidth="2" paintOrder="stroke" className="pointer-events-none select-none">{ward.riskScore}%</text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="absolute bottom-4 left-4 rounded-lg border border-slate-700 bg-slate-950/90 px-3 py-2 backdrop-blur">
            <p className="mb-1 text-[10px] uppercase tracking-widest text-slate-500">Risk overlay coverage</p>
            <p className="text-xs text-slate-300">12 Wards · 3 Zones</p>
          </div>
          <div className="absolute bottom-4 right-4 rounded-lg border border-slate-700 bg-slate-950/90 px-2 py-1 text-[9px] text-slate-500 backdrop-blur">Basemap: OpenStreetMap · Risk polygons: DRISHTI</div>
        </div>

        <div className="border-t border-slate-800 bg-slate-900/70 p-5 lg:border-l lg:border-t-0">
          {selectedWard ? (
            <div className="space-y-4">
              <div><div className="mb-1 flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-400"/><span className="text-[10px] uppercase tracking-widest text-slate-500">Selected Ward</span></div><h3 className="text-lg font-bold text-white">{selectedWard.name}</h3><p className="text-xs text-slate-500">{selectedWard.zone} Zone · MP: {selectedWard.mp}</p></div>
              <div className="space-y-3">
                <div className="rounded-lg bg-slate-800/50 p-3"><div className="mb-1 flex items-center justify-between"><span className="text-xs text-slate-500">Risk Score</span><span className={`text-sm font-bold ${selectedWard.riskLevel === 'high' ? 'text-red-400' : selectedWard.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{selectedWard.riskScore}/100</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-700"><div className={`h-full rounded-full ${selectedWard.riskLevel === 'high' ? 'bg-red-500' : selectedWard.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${selectedWard.riskScore}%` }}/></div></div>
                <div className="grid grid-cols-2 gap-3"><div className="rounded-lg bg-slate-800/50 p-3"><Building2 className="mb-1 h-4 w-4 text-slate-500"/><p className="text-[10px] uppercase tracking-wider text-slate-500">Total Funds</p><p className="text-sm font-bold text-white">{formatCurrency(selectedWard.totalFunds)}</p></div><div className="rounded-lg bg-slate-800/50 p-3"><Filter className="mb-1 h-4 w-4 text-slate-500"/><p className="text-[10px] uppercase tracking-wider text-slate-500">Flagged Works</p><p className="text-sm font-bold text-red-400">{selectedWard.flaggedWorks}</p></div></div>
                <div className="rounded-lg bg-slate-800/50 p-3"><div className="mb-1 flex items-center gap-2"><Users className="h-4 w-4 text-slate-500"/><span className="text-xs text-slate-500">Funds Frozen</span></div><p className="text-sm font-bold text-amber-400">{formatCurrency(selectedWard.frozenFunds)}</p></div>
              </div>
            </div>
          ) : <div className="flex h-full flex-col items-center justify-center py-10 text-center"><MapPin className="mb-3 h-8 w-8 text-slate-700"/><p className="text-sm text-slate-500">Select a ward on the map</p><p className="mt-1 text-xs text-slate-600">to view detailed risk metrics</p></div>}
        </div>
      </div>
    </div>
  );
}
