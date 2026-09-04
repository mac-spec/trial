import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { alerts } from '@/lib/mockData';

const DEMO_KEY = 'kavach-demo-work-orders-v1';
const DEMO_VISION_KEY = 'kavach-demo-vision-v1';

export interface GraphNode { id: string; label: string; type: 'mp' | 'contractor' | 'subcontractor' | 'bank'; x: number; y: number; risk_score: number; }
export interface GraphEdge { id: string; from_node: string; to_node: string; label: string; is_suspicious: boolean; }
export interface CollusionNetwork { nodes: GraphNode[]; edges: GraphEdge[]; }
export interface VisionForensics { id: string; work_id: string; contractor_photo_url: string | null; gps_coordinates: string; gps_verified: boolean; timestamp_verified: boolean; shadow_geometry_score: number; duplicate_detected: boolean; ai_status: string; created_at: string; updated_at: string; }
export interface AIPipelineResponse { success: boolean; work_id: string; status: string; funds_frozen: number | boolean; message: string; mode?: string; shadow_geometry_score?: number; gps_verified?: boolean; timestamp_verified?: boolean; duplicate_detected?: boolean; risk_score?: number; risk_level?: string; }
export interface WorkOrder { id: string; work_id: string; title: string; ward_name: string; contractor: string; agency: string; work_category: string; budget: number; risk_score: number; risk_level: 'high' | 'medium' | 'low'; status: 'flagged' | 'frozen' | 'under_review' | 'cleared' | 'PENDING_AUDIT'; funds_frozen: number; date: string; created_at: string; }

const DEMO_NETWORK: CollusionNetwork = {
  nodes: [
    { id: 'mp1', label: 'MP — Oversight', type: 'mp', x: 360, y: 80, risk_score: 45 },
    { id: 'con1', label: 'Contractor A', type: 'contractor', x: 180, y: 210, risk_score: 92 },
    { id: 'con2', label: 'Contractor B', type: 'contractor', x: 540, y: 210, risk_score: 76 },
    { id: 'sub1', label: 'Shell Vendor', type: 'subcontractor', x: 270, y: 350, risk_score: 88 },
    { id: 'bank1', label: 'Shared Account', type: 'bank', x: 450, y: 350, risk_score: 91 },
  ],
  edges: [
    { id: 'e1', from_node: 'mp1', to_node: 'con1', label: 'award', is_suspicious: false },
    { id: 'e2', from_node: 'mp1', to_node: 'con2', label: 'award', is_suspicious: false },
    { id: 'e3', from_node: 'con1', to_node: 'sub1', label: 'sub-contract', is_suspicious: true },
    { id: 'e4', from_node: 'con2', to_node: 'bank1', label: 'payment', is_suspicious: true },
    { id: 'e5', from_node: 'sub1', to_node: 'bank1', label: 'transfer', is_suspicious: true },
  ],
};

const demoOrders = (): WorkOrder[] => {
  const stored = localStorage.getItem(DEMO_KEY);
  if (stored) return JSON.parse(stored) as WorkOrder[];
  const seeded = alerts.map((a) => ({ id: a.id, work_id: a.id, title: a.workTitle, ward_name: a.wardName, contractor: a.contractor, agency: a.agency, work_category: a.workCategory, budget: a.fundAmount, risk_score: a.riskScore, risk_level: a.riskLevel, status: a.status, funds_frozen: a.status === 'frozen' ? a.fundAmount : 0, date: a.date, created_at: `${a.date}T09:00:00.000Z` }));
  localStorage.setItem(DEMO_KEY, JSON.stringify(seeded));
  return seeded;
};
const saveDemo = (orders: WorkOrder[]) => localStorage.setItem(DEMO_KEY, JSON.stringify(orders));
const riskFor = (score: number): WorkOrder['risk_level'] => score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';

export async function fetchWorkOrders(): Promise<WorkOrder[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('work_orders').select('*').order('risk_score', { ascending: false });
    if (!error) return (data ?? []) as WorkOrder[];
  }
  return demoOrders().sort((a, b) => b.risk_score - a.risk_score);
}

export async function fetchCollusionNetwork(): Promise<CollusionNetwork> {
  if (isSupabaseConfigured && supabase) {
    const [nodesRes, edgesRes] = await Promise.all([supabase.from('graph_nodes').select('*'), supabase.from('graph_edges').select('*')]);
    if (!nodesRes.error && !edgesRes.error) return { nodes: (nodesRes.data ?? []) as GraphNode[], edges: (edgesRes.data ?? []) as GraphEdge[] };
  }
  return DEMO_NETWORK;
}

const demoVision = (workId: string): VisionForensics => {
  const stored = localStorage.getItem(`${DEMO_VISION_KEY}-${workId}`);
  if (stored) return JSON.parse(stored) as VisionForensics;
  return { id: `vision-${workId}`, work_id: workId, contractor_photo_url: null, gps_coordinates: '12.9716° N, 77.5946° E · Bengaluru', gps_verified: true, timestamp_verified: true, shadow_geometry_score: 78.5, duplicate_detected: false, ai_status: 'ready', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
};

export async function fetchVisionForensics(workId: string): Promise<VisionForensics | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('vision_forensics').select('*').eq('work_id', workId).maybeSingle();
    if (!error) return data as VisionForensics | null;
  }
  return demoVision(workId);
}

export async function uploadMilestonePhoto(file: File, workId: string): Promise<{ publicUrl: string }> {
  if (isSupabaseConfigured && supabase) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `public/${workId}_progress.${extension}`;
    const { error: uploadError } = await supabase.storage.from('construction-milestones').upload(filePath, file, { upsert: true });
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('construction-milestones').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;
      const { error: updateError } = await supabase.from('vision_forensics').update({ contractor_photo_url: publicUrl, ai_status: 'analyzing', updated_at: new Date().toISOString() }).eq('work_id', workId);
      if (!updateError) return { publicUrl };
    }
  }
  const publicUrl = URL.createObjectURL(file);
  localStorage.setItem(`${DEMO_VISION_KEY}-${workId}`, JSON.stringify({ ...demoVision(workId), contractor_photo_url: publicUrl, ai_status: 'analyzing', updated_at: new Date().toISOString() }));
  return { publicUrl };
}

export async function updateVisionForensicsResults(workId: string, results: Partial<Pick<VisionForensics, 'shadow_geometry_score' | 'gps_verified' | 'timestamp_verified' | 'duplicate_detected' | 'ai_status'>>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('vision_forensics').update({ ...results, updated_at: new Date().toISOString() }).eq('work_id', workId);
    if (!error) return;
  }
  localStorage.setItem(`${DEMO_VISION_KEY}-${workId}`, JSON.stringify({ ...demoVision(workId), ...results, updated_at: new Date().toISOString() }));
}

export async function triggerAIPipeline(workId: string, mode: 'freeze' | 'vision' = 'freeze'): Promise<AIPipelineResponse> {
  if (isSupabaseConfigured && supabase) {
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/audit-pipeline`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` }, body: JSON.stringify({ work_id: workId, mode }) });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) return data as AIPipelineResponse;
    } catch { /* local demo fallback */ }
  }
  const orders = demoOrders();
  const order = orders.find((o) => o.work_id === workId);
  if (!order) throw new Error(`Work order ${workId} not found`);
  await new Promise((resolve) => setTimeout(resolve, 650));
  if (mode === 'vision') {
    const score = workId === 'alert-001' ? 66.4 : 78.5;
    const duplicate = workId === 'alert-003';
    const frozen = score < 70;
    localStorage.setItem(`${DEMO_VISION_KEY}-${workId}`, JSON.stringify({ ...demoVision(workId), shadow_geometry_score: score, gps_verified: true, timestamp_verified: true, duplicate_detected: duplicate, ai_status: frozen ? 'funds_frozen' : 'completed', updated_at: new Date().toISOString() }));
    if (frozen) { order.status = 'frozen'; order.funds_frozen = order.budget; saveDemo(orders); }
    return { success: true, work_id: workId, mode, status: frozen ? 'FUNDS_FROZEN' : 'COMPLETED', funds_frozen: frozen ? order.budget : false, message: frozen ? `Vision anomaly detected (${score}%). Funds frozen.` : `Vision analysis completed (${score}%).`, shadow_geometry_score: score, gps_verified: true, timestamp_verified: true, duplicate_detected: duplicate };
  }
  const score = Math.max(order.risk_score, 80);
  order.risk_score = score; order.risk_level = riskFor(score); order.status = 'frozen'; order.funds_frozen = order.budget; saveDemo(orders);
  return { success: true, work_id: workId, status: 'FUNDS_FROZEN', funds_frozen: order.budget, risk_score: score, risk_level: order.risk_level, message: `AI audit completed. ₹${order.budget.toLocaleString('en-IN')} frozen pending review.` };
}

export async function triggerPendingAudits(workIds: string[]): Promise<AIPipelineResponse[]> {
  const results: AIPipelineResponse[] = [];
  for (const workId of workIds) results.push(await triggerAIPipeline(workId, 'freeze'));
  return results;
}
