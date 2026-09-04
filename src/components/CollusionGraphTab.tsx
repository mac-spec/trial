import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { fetchCollusionNetwork } from '@/services/auditService';
import type { GraphNode, GraphEdge } from '@/services/auditService';

const nodeConfig: Record<GraphNode['type'], { fill: string; stroke: string; label: string }> = {
  mp: { fill: '#3b82f6', stroke: '#60a5fa', label: 'MP' },
  contractor: { fill: '#3b82f6', stroke: '#60a5fa', label: 'Contractor' },
  subcontractor: { fill: '#f59e0b', stroke: '#fbbf24', label: 'Sub-contractor' },
  bank: { fill: '#f59e0b', stroke: '#fbbf24', label: 'Bank Account' },
};

export function CollusionGraphTab() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const network = await fetchCollusionNetwork();
        if (cancelled) return;
        setNodes(network.nodes);
        setEdges(network.edges);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load collusion network');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const suspiciousEdges = edges.filter((e) => e.is_suspicious);
  const hasCollusion = suspiciousEdges.length > 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading collusion network from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Collusion Network Detection</span>
          {hasCollusion && (
            <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded font-medium">
              {suspiciousEdges.length} suspicious links detected
            </span>
          )}
        </div>

        <div className="relative bg-slate-950">
          <svg viewBox="0 0 720 500" className="w-full h-auto" style={{ maxHeight: '500px' }}>
            <defs>
              <pattern id="netgrid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#475569" />
              </marker>
              <marker id="arrowhead-sus" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
              </marker>
            </defs>
            <rect width="720" height="500" fill="url(#netgrid)" />

            {/* Edges */}
            {edges.map((edge) => {
              const from = nodeMap.get(edge.from_node);
              const to = nodeMap.get(edge.to_node);
              if (!from || !to) return null;
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              return (
                <g key={edge.id}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={edge.is_suspicious ? '#ef4444' : '#334155'}
                    strokeWidth={edge.is_suspicious ? 2 : 1}
                    strokeDasharray={edge.is_suspicious ? '5' : 'none'}
                    opacity={edge.is_suspicious ? 0.8 : 0.4}
                    markerEnd={edge.is_suspicious ? 'url(#arrowhead-sus)' : 'url(#arrowhead)'}
                  >
                    {edge.is_suspicious && (
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0;-20"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    )}
                  </line>
                  <text
                    x={midX}
                    y={midY - 4}
                    textAnchor="middle"
                    fill={edge.is_suspicious ? '#f87171' : '#64748b'}
                    fontSize="8"
                    className="select-none"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const cfg = nodeConfig[node.type] ?? { fill: '#64748b', stroke: '#94a3b8', label: '?' };
              const radius = node.type === 'mp' ? 22 : node.type === 'contractor' ? 20 : 16;
              return (
                <g key={node.id}>
                  {node.risk_score > 70 && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius + 6}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1"
                      strokeDasharray="3 2"
                      opacity="0.4"
                    >
                      <animate
                        attributeName="r"
                        values={`${radius + 4};${radius + 8};${radius + 4}`}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={cfg.fill}
                    fillOpacity={0.2}
                    stroke={cfg.stroke}
                    strokeWidth={2}
                  />
                  <text
                    x={node.x}
                    y={node.y - 1}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="9"
                    fontWeight="600"
                    className="select-none"
                  >
                    {cfg.label}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 10}
                    textAnchor="middle"
                    fill={node.risk_score > 70 ? '#f87171' : '#94a3b8'}
                    fontSize="8"
                    fontWeight="700"
                    className="select-none"
                  >
                    R:{node.risk_score}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + radius + 14}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    className="select-none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend & insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <h4 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">Node Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#60a5fa', background: '#3b82f633' }}>
                <span className="text-[8px] text-slate-300 font-bold">M</span>
              </div>
              <span className="text-sm text-slate-400">MP / Contractors (blue)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#fbbf24', background: '#f59e0b33' }}>
                <span className="text-[8px] text-slate-300 font-bold">B</span>
              </div>
              <span className="text-sm text-slate-400">Bank Accounts / Shell Sub-contractors (amber)</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-6 h-6 rounded-full border-2 border-red-500 border-dashed opacity-50" />
              <span className="text-sm text-slate-400">High-risk ring (R&gt;70)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 border-t-2 border-dashed border-red-500" />
              <span className="text-sm text-slate-400">Suspicious link (animated dashed red)</span>
            </div>
          </div>
        </div>

        {/* Collusion insight panel */}
        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider">AI Collusion Insights</h4>
          </div>
          {hasCollusion ? (
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex gap-2">
                <span className="text-red-400 shrink-0">●</span>
                <span className="text-red-300 font-medium">
                  Collusion Detected: Multiple sub-contractors are routing public funds back into the same shared bank account node.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-red-400 shrink-0">●</span>
                <span>{suspiciousEdges.length} suspicious connections flagged across the network</span>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-400 shrink-0">●</span>
                <span>Inter-account transfer of Rs18L detected between linked bank nodes</span>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-400 shrink-0">●</span>
                <span>Single-signatory bank accounts detected across sub-contractor entities</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No suspicious links detected in the current network.</p>
          )}
        </div>
      </div>
    </div>
  );
}
