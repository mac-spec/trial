import { MapPin, Building2, Users, Filter, Navigation } from 'lucide-react';
import type { Ward } from '@/lib/types';
import { getRiskFill, formatCurrency } from '@/lib/mockData';

interface WardMapProps {
  wards: Ward[];
  selectedWard: Ward | null;
  onSelectWard: (ward: Ward) => void;
}

export function WardMap({ wards, selectedWard, onSelectWard }: WardMapProps) {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-white">Bangalore Ward Geospatial Risk View</h2>
          <p className="text-xs text-slate-500 mt-0.5">Google Maps-style geographic view · select a ward from the risk list</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400"><span className="w-3 h-3 rounded-full bg-red-500" /> High</span>
          <span className="flex items-center gap-1.5 text-slate-400"><span className="w-3 h-3 rounded-full bg-amber-500" /> Medium</span>
          <span className="flex items-center gap-1.5 text-slate-400"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Low</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        <div className="lg:col-span-2 relative min-h-[520px] overflow-hidden bg-slate-100">
          <iframe
            title="Bengaluru Google Maps-style geographic view"
            className="absolute inset-0 w-full h-full border-0"
            src="https://www.google.com/maps?q=Bengaluru%2C%20Karnataka&z=12&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-[11px] font-medium text-slate-700 shadow-lg backdrop-blur">
            <MapPin className="h-4 w-4 text-red-500" /> Bengaluru · DRISHTI Risk View
          </div>

          <div className="absolute right-4 top-4 flex flex-col gap-1">
            <button type="button" onClick={() => selectedWard && onSelectWard(selectedWard)} className="rounded-lg bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 shadow-lg hover:bg-slate-50">
              <Navigation className="mr-1 inline h-3.5 w-3.5" /> Selected ward
            </button>
          </div>

          <div className="absolute bottom-4 left-4 max-w-[290px] rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">DRISHTI risk layer</p>
            <p className="mt-1 text-xs text-slate-600">Geographic basemap with ward risk information shown in the panel. No artificial hexagons or polygon map overlay.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {wards.slice(0, 4).map((ward) => {
                const fill = getRiskFill(ward.riskLevel);
                return (
                  <button key={ward.id} type="button" onClick={() => onSelectWard(ward)} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600 hover:bg-slate-50">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: fill }} />{ward.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-slate-800 p-5 bg-slate-900/50">
          {selectedWard ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1"><MapPin className="w-4 h-4 text-amber-400" /><span className="text-[10px] uppercase tracking-widest text-slate-500">Selected Ward</span></div>
                <h3 className="text-lg font-bold text-white">{selectedWard.name}</h3>
                <p className="text-xs text-slate-500">{selectedWard.zone} Zone · MP: {selectedWard.mp}</p>
              </div>
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1"><span className="text-xs text-slate-500">Risk Score</span><span className={`text-sm font-bold ${selectedWard.riskLevel === 'high' ? 'text-red-400' : selectedWard.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{selectedWard.riskScore}/100</span></div>
                  <div className="h-2 rounded-full bg-slate-700 overflow-hidden"><div className={`h-full rounded-full ${selectedWard.riskLevel === 'high' ? 'bg-red-500' : selectedWard.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${selectedWard.riskScore}%` }} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 rounded-lg p-3"><Building2 className="w-4 h-4 text-slate-500 mb-1" /><p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Funds</p><p className="text-sm font-bold text-white">{formatCurrency(selectedWard.totalFunds)}</p></div>
                  <div className="bg-slate-800/50 rounded-lg p-3"><Filter className="w-4 h-4 text-slate-500 mb-1" /><p className="text-[10px] text-slate-500 uppercase tracking-wider">Flagged Works</p><p className="text-sm font-bold text-red-400">{selectedWard.flaggedWorks}</p></div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3"><div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-slate-500" /><span className="text-xs text-slate-500">Funds Frozen</span></div><p className="text-sm font-bold text-amber-400">{formatCurrency(selectedWard.frozenFunds)}</p></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10"><MapPin className="w-8 h-8 text-slate-700 mb-3" /><p className="text-sm text-slate-500">Select a ward below the map</p><p className="text-xs text-slate-600 mt-1">to view detailed risk metrics</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
