import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { demoWorkOrders, findDemoWorkOrder } from '@/lib/demoWorkOrders';

export interface WorkOrder {
  id: string;
  work_id: string;
  title: string;
  ward_name: string;
  contractor: string;
  agency: string;
  work_category: string;
  budget: number;
  risk_score: number;
  risk_level: 'high' | 'medium' | 'low';
  status: 'flagged' | 'frozen' | 'under_review' | 'cleared';
  funds_frozen: number;
  date: string;
  created_at: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'mp' | 'contractor' | 'subcontractor' | 'bank';
  x: number;
  y: number;
  risk_score: number;
}

export interface GraphEdge {
  id: string;
  from_node: string;
  to_node: string;
  label: string;
  is_suspicious: boolean;
}

export interface CollusionNetwork {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface VisionForensics {
  id: string;
  work_id: string;
  contractor_photo_url: string | null;
  gps_coordinates: string;
  gps_verified: boolean;
  timestamp_verified: boolean;
  shadow_geometry_score: number;
  duplicate_detected: boolean;
  ai_status: string;
  created_at: string;
  updated_at: string;
}

export interface AIPipelineResponse {
  success: boolean;
  work_id: string;
  status: string;
  funds_frozen: number | boolean;
  message: string;
  mode?: string;
  shadow_geometry_score?: number;
  gps_verified?: boolean;
  timestamp_verified?: boolean;
  duplicate_detected?: boolean;
}

const EDGE_FUNCTION_URL =
  'https://mfxfyaoygvbsslvfrpxr.supabase.co/functions/v1/audit-pipeline';

// ---------------------------------------------------------------------------
// Live-schema row types (columns as they actually exist in Supabase)
// ---------------------------------------------------------------------------

interface WorkOrderRow {
  work_id: string;
  ward_id: string | null;
  title: string | null;
  implementing_agency: string | null;
  contractor_name: string | null;
  total_budget: number | string | null;
  risk_score: number | string | null;
  status: string | null;
  created_at: string;
}

interface GraphNodeRow {
  id: string;
  label: string | null;
  type: string | null;
  created_at: string;
}

interface GraphEdgeRow {
  id: string;
  source_id: string;
  target_id: string;
  relationship_type: string | null;
  is_suspicious: boolean | null;
  created_at: string;
}

interface VisionForensicsRow {
  work_id: string;
  contractor_photo_url: string | null;
  baseline_photo_url: string | null;
  extracted_latitude: number | string | null;
  extracted_longitude: number | string | null;
  gps_verification_status: string | null;
  shadow_geometry_match_score: number | string | null;
  duplicate_detected: boolean | null;
}

// ---------------------------------------------------------------------------
// Mappers: live rows -> UI interfaces
// ---------------------------------------------------------------------------

function riskLevelFromScore(score: number): WorkOrder['risk_level'] {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function mapStatus(raw: string | null): WorkOrder['status'] {
  switch ((raw ?? '').toUpperCase()) {
    case 'FLAGGED':
      return 'flagged';
    case 'FROZEN':
    case 'FUNDS_FROZEN':
      return 'frozen';
    case 'CLEARED':
    case 'APPROVED':
      return 'cleared';
    // PENDING_AUDIT, UNDER_REVIEW, and anything else awaiting action:
    default:
      return 'under_review';
  }
}

function prettifyWard(wardId: string | null): string {
  if (!wardId) return 'Unassigned Ward';
  // "WARD_142" -> "Ward 142"
  const cleaned = wardId.replace(/_/g, ' ').toLowerCase();
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** No category column exists in the DB, so derive a readable one from the title. */
function deriveCategory(title: string | null): string {
  const t = (title ?? '').toLowerCase();
  if (/drain|desilt|sewer|storm/.test(t)) return 'Drainage & Sanitation';
  if (/road|asphalt|tar|pavement/.test(t)) return 'Roads & Transport';
  if (/wall|retaining|bridge|culvert|concrete/.test(t)) return 'Civil Structures';
  if (/water|pipe|borewell|supply/.test(t)) return 'Water Supply';
  if (/light|electric|solar|transformer/.test(t)) return 'Electrical Works';
  if (/park|garden|play|landscap/.test(t)) return 'Parks & Recreation';
  return 'General Civil Works';
}

function mapWorkOrder(row: WorkOrderRow): WorkOrder {
  const risk = Number(row.risk_score ?? 0);
  const budget = Number(row.total_budget ?? 0);
  const status = mapStatus(row.status);
  return {
    id: row.work_id,
    work_id: row.work_id,
    title: row.title ?? 'Untitled Work Order',
    ward_name: prettifyWard(row.ward_id),
    contractor: row.contractor_name ?? 'Unknown Contractor',
    agency: row.implementing_agency ?? 'N/A',
    work_category: deriveCategory(row.title),
    budget,
    risk_score: Math.round(risk),
    risk_level: riskLevelFromScore(risk),
    status,
    funds_frozen: status === 'frozen' ? budget : 0,
    date: row.created_at ? row.created_at.slice(0, 10) : '',
    created_at: row.created_at,
  };
}

function mapNodeType(raw: string | null): GraphNode['type'] {
  const t = (raw ?? '').toLowerCase();
  if (t.includes('bank')) return 'bank';
  if (t.includes('sub')) return 'subcontractor';
  if (t.includes('contract')) return 'contractor';
  return 'mp';
}

function prettifyRelationship(raw: string | null): string {
  return (raw ?? 'linked').replace(/_/g, ' ').toLowerCase();
}

/**
 * Live graph tables store no coordinates or per-node risk. We synthesize a
 * tidy tiered layout (MP -> contractor -> subcontractor -> bank) and infer
 * node risk from how many suspicious edges touch it, so the SVG renders.
 */
function buildCollusionNetwork(
  nodeRows: GraphNodeRow[],
  edgeRows: GraphEdgeRow[]
): CollusionNetwork {
  const edges: GraphEdge[] = edgeRows.map((e) => ({
    id: e.id,
    from_node: e.source_id,
    to_node: e.target_id,
    label: prettifyRelationship(e.relationship_type),
    is_suspicious: !!e.is_suspicious,
  }));

  // Count suspicious links per node to derive a risk score.
  const suspiciousCount = new Map<string, number>();
  for (const e of edgeRows) {
    if (e.is_suspicious) {
      suspiciousCount.set(e.source_id, (suspiciousCount.get(e.source_id) ?? 0) + 1);
      suspiciousCount.set(e.target_id, (suspiciousCount.get(e.target_id) ?? 0) + 1);
    }
  }

  const tierOrder: GraphNode['type'][] = ['mp', 'contractor', 'subcontractor', 'bank'];
  const tierY: Record<GraphNode['type'], number> = {
    mp: 70,
    contractor: 190,
    subcontractor: 330,
    bank: 460,
  };

  // Group nodes by tier to spread them horizontally within their row.
  const byTier = new Map<GraphNode['type'], GraphNodeRow[]>();
  for (const n of nodeRows) {
    const type = mapNodeType(n.type);
    const list = byTier.get(type) ?? [];
    list.push(n);
    byTier.set(type, list);
  }

  const WIDTH = 720;
  const nodes: GraphNode[] = [];
  for (const type of tierOrder) {
    const list = byTier.get(type) ?? [];
    list.forEach((n, i) => {
      const step = WIDTH / (list.length + 1);
      const susp = suspiciousCount.get(n.id) ?? 0;
      const risk = susp >= 2 ? 90 : susp === 1 ? 78 : 45;
      nodes.push({
        id: n.id,
        label: n.label ?? n.id,
        type,
        x: Math.round(step * (i + 1)),
        y: tierY[type],
        risk_score: risk,
      });
    });
  }

  return { nodes, edges };
}

function formatCoord(lat: number | null, lng: number | null): string {
  if (lat == null || lng == null) return 'Coordinates unavailable';
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lng).toFixed(4)}° ${ew}`;
}

function mapVisionForensics(row: VisionForensicsRow): VisionForensics {
  const status = (row.gps_verification_status ?? '').toUpperCase();
  const gpsVerified = status === 'VERIFIED' || status === 'MATCHED';
  const now = new Date().toISOString();
  return {
    id: `vf-${row.work_id}`,
    work_id: row.work_id,
    contractor_photo_url: row.contractor_photo_url,
    gps_coordinates: formatCoord(
      row.extracted_latitude == null ? null : Number(row.extracted_latitude),
      row.extracted_longitude == null ? null : Number(row.extracted_longitude)
    ),
    gps_verified: gpsVerified,
    // No timestamp column in the live schema; treat GPS-verified rows as timestamp-trusted.
    timestamp_verified: gpsVerified,
    shadow_geometry_score: Number(row.shadow_geometry_match_score ?? 0),
    duplicate_detected: !!row.duplicate_detected,
    ai_status: row.contractor_photo_url ? 'analyzed' : 'awaiting_upload',
    created_at: now,
    updated_at: now,
  };
}

// ---------------------------------------------------------------------------
// Demo fallback data (used when Supabase is not configured)
// ---------------------------------------------------------------------------

const demoCollusionNetwork: CollusionNetwork = {
  nodes: [
    { id: 'mp1', label: 'MP Office', type: 'mp', x: 360, y: 70, risk_score: 62 },
    { id: 'c1', label: 'Sri Venkateshwara Infra', type: 'contractor', x: 360, y: 210, risk_score: 88 },
    { id: 's1', label: 'Nova Subworks', type: 'subcontractor', x: 190, y: 340, risk_score: 74 },
    { id: 's2', label: 'Apex Builders', type: 'subcontractor', x: 360, y: 360, risk_score: 71 },
    { id: 's3', label: 'Sunrise Traders', type: 'subcontractor', x: 530, y: 340, risk_score: 69 },
    { id: 'b1', label: 'A/C ****4821', type: 'bank', x: 360, y: 460, risk_score: 91 },
  ],
  edges: [
    { id: 'e1', from_node: 'mp1', to_node: 'c1', label: 'awarded', is_suspicious: false },
    { id: 'e2', from_node: 'c1', to_node: 's1', label: 'sub-let', is_suspicious: true },
    { id: 'e3', from_node: 'c1', to_node: 's2', label: 'sub-let', is_suspicious: true },
    { id: 'e4', from_node: 'c1', to_node: 's3', label: 'sub-let', is_suspicious: false },
    { id: 'e5', from_node: 's1', to_node: 'b1', label: 'Rs 18L', is_suspicious: true },
    { id: 'e6', from_node: 's2', to_node: 'b1', label: 'Rs 12L', is_suspicious: true },
  ],
};

/**
 * In-memory demo vision-forensics store keyed by work_id. Lets the upload +
 * AI-analysis flow feel live without a backend.
 */
const demoVisionStore = new Map<string, VisionForensics>();

function getOrSeedDemoForensics(workId: string): VisionForensics {
  const existing = demoVisionStore.get(workId);
  if (existing) return existing;
  const now = new Date().toISOString();
  const seeded: VisionForensics = {
    id: `demo-vf-${workId}`,
    work_id: workId,
    contractor_photo_url: null,
    gps_coordinates: '12.9345° N, 77.6100° E',
    gps_verified: false,
    timestamp_verified: false,
    shadow_geometry_score: 0,
    duplicate_detected: false,
    ai_status: 'awaiting_upload',
    created_at: now,
    updated_at: now,
  };
  demoVisionStore.set(workId, seeded);
  return seeded;
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function fetchWorkOrders(): Promise<WorkOrder[]> {
  if (!isSupabaseConfigured || !supabase) {
    // Fallback: seeded demo work orders (includes MPLADS-2026-BLR-0042),
    // pre-sorted by risk to mirror the live query ordering.
    return [...demoWorkOrders].sort((a, b) => b.risk_score - a.risk_score);
  }

  const { data, error } = await supabase
    .from('work_orders')
    .select('*')
    .order('risk_score', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch work orders: ${error.message}`);
  }

  // Map the live column names/shape into the UI's WorkOrder interface so the
  // executive overview KPIs and the critical-alerts table populate correctly.
  return ((data ?? []) as WorkOrderRow[]).map(mapWorkOrder);
}

export async function fetchCollusionNetwork(): Promise<CollusionNetwork> {
  if (!isSupabaseConfigured || !supabase) {
    return demoCollusionNetwork;
  }

  const [nodesRes, edgesRes] = await Promise.all([
    supabase.from('graph_nodes').select('*'),
    supabase.from('graph_edges').select('*'),
  ]);

  if (nodesRes.error) throw new Error(`Failed to fetch nodes: ${nodesRes.error.message}`);
  if (edgesRes.error) throw new Error(`Failed to fetch edges: ${edgesRes.error.message}`);

  return buildCollusionNetwork(
    (nodesRes.data ?? []) as GraphNodeRow[],
    (edgesRes.data ?? []) as GraphEdgeRow[]
  );
}

export async function fetchVisionForensics(workId: string): Promise<VisionForensics | null> {
  if (!isSupabaseConfigured || !supabase) {
    return demoVisionStore.get(workId) ?? null;
  }

  const { data, error } = await supabase
    .from('vision_forensics')
    .select('*')
    .eq('work_id', workId)
    .maybeSingle();
  if (error) throw new Error(`Failed to fetch vision forensics: ${error.message}`);
  return data ? mapVisionForensics(data as VisionForensicsRow) : null;
}

export async function uploadMilestonePhoto(
  file: File,
  workId: string
): Promise<{ publicUrl: string }> {
  if (!isSupabaseConfigured || !supabase) {
    // Demo mode: use a local object URL so the uploaded image renders,
    // and record it in the in-memory store.
    const publicUrl = URL.createObjectURL(file);
    const record = getOrSeedDemoForensics(workId);
    demoVisionStore.set(workId, {
      ...record,
      contractor_photo_url: publicUrl,
      ai_status: 'analyzing',
      updated_at: new Date().toISOString(),
    });
    return { publicUrl };
  }

  const filePath = `public/${workId}_progress.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('construction-milestones')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('construction-milestones')
    .getPublicUrl(filePath);

  const publicUrl = urlData.publicUrl;

  // Only touch columns that exist in the live vision_forensics schema.
  const { error: updateError } = await supabase
    .from('vision_forensics')
    .update({ contractor_photo_url: publicUrl })
    .eq('work_id', workId);

  if (updateError) {
    throw new Error(`Failed to update vision_forensics: ${updateError.message}`);
  }

  return { publicUrl };
}

export async function updateVisionForensicsResults(
  workId: string,
  results: Partial<Pick<VisionForensics, 'shadow_geometry_score' | 'gps_verified' | 'timestamp_verified' | 'duplicate_detected' | 'ai_status'>>
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const record = getOrSeedDemoForensics(workId);
    demoVisionStore.set(workId, {
      ...record,
      ...results,
      updated_at: new Date().toISOString(),
    });
    return;
  }

  // Translate UI-shaped fields back onto the live column names.
  const payload: Record<string, unknown> = {};
  if (results.shadow_geometry_score !== undefined)
    payload.shadow_geometry_match_score = results.shadow_geometry_score;
  if (results.duplicate_detected !== undefined)
    payload.duplicate_detected = results.duplicate_detected;
  if (results.gps_verified !== undefined)
    payload.gps_verification_status = results.gps_verified ? 'VERIFIED' : 'MISMATCHED_BOUNDARIES';

  if (Object.keys(payload).length === 0) return;

  const { error } = await supabase
    .from('vision_forensics')
    .update(payload)
    .eq('work_id', workId);
  if (error) throw new Error(`Failed to update vision results: ${error.message}`);
}

export async function triggerAIPipeline(
  workId: string,
  mode?: 'freeze' | 'vision'
): Promise<AIPipelineResponse> {
  if (!isSupabaseConfigured || !supabase) {
    // Demo mode: simulate the AI pipeline deterministically so the UI flows.
    await new Promise((r) => setTimeout(r, 1400));

    const order = findDemoWorkOrder(workId);

    if (mode === 'vision') {
      const record = getOrSeedDemoForensics(workId);
      const shadowScore = 61.5; // below threshold -> triggers freeze in demo
      const updated: VisionForensics = {
        ...record,
        gps_verified: true,
        timestamp_verified: false,
        shadow_geometry_score: shadowScore,
        duplicate_detected: true,
        ai_status: 'funds_frozen',
        updated_at: new Date().toISOString(),
      };
      demoVisionStore.set(workId, updated);
      return {
        success: true,
        work_id: workId,
        status: 'funds_frozen',
        funds_frozen: order ? order.budget : true,
        message: `Vision anomaly detected for ${workId}. Shadow/geometry match ${shadowScore}% is below the 85% threshold — milestone funds frozen (demo mode).`,
        mode,
        shadow_geometry_score: shadowScore,
        gps_verified: true,
        timestamp_verified: false,
        duplicate_detected: true,
      };
    }

    return {
      success: true,
      work_id: workId,
      status: 'funds_frozen',
      funds_frozen: order ? order.budget : true,
      message: `Milestone funds frozen for ${workId} pending physical audit (demo mode).`,
      mode: mode ?? 'freeze',
    };
  }

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ work_id: workId, mode: mode ?? 'freeze' }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      `AI pipeline request failed (${response.status}): ${errorBody.error ?? response.statusText}`
    );
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message ?? 'AI pipeline returned an error');
  }

  return data;
}
