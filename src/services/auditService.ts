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

  return (data ?? []) as WorkOrder[];
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

  return {
    nodes: (nodesRes.data ?? []) as GraphNode[],
    edges: (edgesRes.data ?? []) as GraphEdge[],
  };
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
  return data as VisionForensics | null;
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

  const { error: updateError } = await supabase
    .from('vision_forensics')
    .update({ contractor_photo_url: publicUrl, ai_status: 'analyzing', updated_at: new Date().toISOString() })
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

  const { error } = await supabase
    .from('vision_forensics')
    .update({ ...results, updated_at: new Date().toISOString() })
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
