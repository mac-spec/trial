import { supabase } from '@/lib/supabaseClient';

export async function fetchWorkOrders(): Promise<WorkOrder[]> {
  const { data, error } = await supabase.from('work_orders').select('*').order('risk_score', { ascending: false });
  if (error) throw new Error(`Failed to fetch work orders: ${error.message}`);
  return (data ?? []) as WorkOrder[];
}

export interface GraphNode { id: string; label: string; type: 'mp' | 'contractor' | 'subcontractor' | 'bank'; x: number; y: number; risk_score: number; }
export interface GraphEdge { id: string; from_node: string; to_node: string; label: string; is_suspicious: boolean; }
export interface CollusionNetwork { nodes: GraphNode[]; edges: GraphEdge[]; }

export async function fetchCollusionNetwork(): Promise<CollusionNetwork> {
  const [nodesRes, edgesRes] = await Promise.all([supabase.from('graph_nodes').select('*'), supabase.from('graph_edges').select('*')]);
  if (nodesRes.error) throw new Error(`Failed to fetch nodes: ${nodesRes.error.message}`);
  if (edgesRes.error) throw new Error(`Failed to fetch edges: ${edgesRes.error.message}`);
  return { nodes: (nodesRes.data ?? []) as GraphNode[], edges: (edgesRes.data ?? []) as GraphEdge[] };
}

export interface VisionForensics {
  id: string; work_id: string; contractor_photo_url: string | null; gps_coordinates: string;
  gps_verified: boolean; timestamp_verified: boolean; shadow_geometry_score: number;
  duplicate_detected: boolean; ai_status: string; created_at: string; updated_at: string;
}

export async function fetchVisionForensics(workId: string): Promise<VisionForensics | null> {
  const { data, error } = await supabase.from('vision_forensics').select('*').eq('work_id', workId).maybeSingle();
  if (error) throw new Error(`Failed to fetch vision forensics: ${error.message}`);
  return data as VisionForensics | null;
}

export async function uploadMilestonePhoto(file: File, workId: string): Promise<{ publicUrl: string }> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `public/${workId}_progress.${extension}`;
  const { error: uploadError } = await supabase.storage.from('construction-milestones').upload(filePath, file, { upsert: true });
  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);
  const { data: urlData } = supabase.storage.from('construction-milestones').getPublicUrl(filePath);
  const publicUrl = urlData.publicUrl;
  const { error: updateError } = await supabase.from('vision_forensics').update({ contractor_photo_url: publicUrl, ai_status: 'analyzing', updated_at: new Date().toISOString() }).eq('work_id', workId);
  if (updateError) throw new Error(`Failed to update vision_forensics: ${updateError.message}`);
  return { publicUrl };
}

export async function updateVisionForensicsResults(workId: string, results: Partial<Pick<VisionForensics, 'shadow_geometry_score' | 'gps_verified' | 'timestamp_verified' | 'duplicate_detected' | 'ai_status'>>): Promise<void> {
  const { error } = await supabase.from('vision_forensics').update({ ...results, updated_at: new Date().toISOString() }).eq('work_id', workId);
  if (error) throw new Error(`Failed to update vision results: ${error.message}`);
}

export interface AIPipelineResponse {
  success: boolean; work_id: string; status: string; funds_frozen: number | boolean; message: string;
  mode?: string; shadow_geometry_score?: number; gps_verified?: boolean;
  timestamp_verified?: boolean; duplicate_detected?: boolean; risk_score?: number; risk_level?: string;
}

export interface WorkOrder {
  id: string; work_id: string; title: string; ward_name: string; contractor: string; agency: string;
  work_category: string; budget: number; risk_score: number; risk_level: 'high' | 'medium' | 'low';
  status: 'flagged' | 'frozen' | 'under_review' | 'cleared' | 'PENDING_AUDIT'; funds_frozen: number;
  date: string; created_at: string;
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL || 'https://mfxfyaoygvbsslvfrpxr.supabase.co'}/functions/v1/audit-pipeline`;

export async function triggerAIPipeline(workId: string, mode: 'freeze' | 'vision' = 'freeze'): Promise<AIPipelineResponse> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
    body: JSON.stringify({ work_id: workId, mode }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(`AI pipeline request failed (${response.status}): ${data.error ?? data.message ?? response.statusText}`);
  return data;
}

export async function triggerPendingAudits(workIds: string[]): Promise<AIPipelineResponse[]> {
  const results: AIPipelineResponse[] = [];
  for (const workId of workIds) results.push(await triggerAIPipeline(workId, 'freeze'));
  return results;
}
