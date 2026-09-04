import { MapPin, Building2, Users, Filter } from 'lucide-react';
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
          <p className="text-xs text-slate-500 mt-0.5">Click a ward to filter risk data</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-3 rounded bg-red-500" /> High
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-3 rounded bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-3 rounded bg-emerald-500" /> Low
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Map */}
        <div className="lg:col-span-2 relative bg-slate-950 p-4">
          <svg viewBox="0 0 550 480" className="w-full h-auto" style={{ maxHeight: '520px' }}>
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width="550" height="480" fill="url(#grid)" />

            {/* Water body accent */}
            <ellipse cx="430" cy="400" rx="60" ry="35" fill="#1e3a5f" opacity="0.3" />
            <text x="430" y="405" textAnchor="middle" fill="#475569" fontSize="9">Bellandur Lake</text>

            <ellipse cx="90" cy="250" rx="30" ry="20" fill="#1e3a5f" opacity="0.3" />
            <text x="90" y="255" textAnchor="middle" fill="#475569" fontSize="8">Hebbal Lake</text>

            {/* Ward polygons */}
            {wards.map((ward) => {
              const isSelected = selectedWard?.id === ward.id;
              const fill = getRiskFill(ward.riskLevel);
              return (
                <g key={ward.id} onClick={() => onSelectWard(ward)} className="cursor-pointer">
                  <polygon
                    points={ward.polygon}
                    fill={fill}
                    fillOpacity={isSelected ? 0.35 : 0.18}
                    stroke={fill}
                    strokeWidth={isSelected ? 2.5 : 1}
                    filter={isSelected ? 'url(#glow)' : undefined}
                    className="transition-all duration-200"
                    style={{ pointerEvents: 'all' }}
                  />
                  <text
                    x={ward.labelX}
                    y={ward.labelY}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="11"
                    fontWeight="600"
                    className="pointer-events-none select-none"
                  >
                    {ward.name}
                  </text>
                  <text
                    x={ward.labelX}
                    y={ward.labelY + 13}
                    textAnchor="middle"
                    fill={fill}
                    fontSize="9"
                    fontWeight="700"
                    className="pointer-events-none select-none"
                  >
                    {ward.riskScore}%
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend overlay */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur rounded-lg border border-slate-800 px-3 py-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Coverage</p>
            <p className="text-xs text-slate-300">12 Wards · 3 Zones</p>
          </div>
        </div>

        {/* Ward detail panel */}
        <div className="border-t lg:border-t-0 lg:border-l border-slate-800 p-5 bg-slate-900/50">
          {selectedWard ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">Selected Ward</span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedWard.name}</h3>
                <p className="text-xs text-slate-500">{selectedWard.zone} Zone · MP: {selectedWard.mp}</p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">Risk Score</span>
                    <span className={`text-sm font-bold ${selectedWard.riskLevel === 'high' ? 'text-red-400' : selectedWard.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {selectedWard.riskScore}/100
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${selectedWard.riskLevel === 'high' ? 'bg-red-500' : selectedWard.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${selectedWard.riskScore}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <Building2 className="w-4 h-4 text-slate-500 mb-1" />
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Funds</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(selectedWard.totalFunds)}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <Filter className="w-4 h-4 text-slate-500 mb-1" />
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Flagged Works</p>
                    <p className="text-sm font-bold text-red-400">{selectedWard.flaggedWorks}</p>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-500">Funds Frozen</span>
                  </div>
                  <p className="text-sm font-bold text-amber-400">{formatCurrency(selectedWard.frozenFunds)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <MapPin className="w-8 h-8 text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">Select a ward on the map</p>
              <p className="text-xs text-slate-600 mt-1">to view detailed risk metrics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
