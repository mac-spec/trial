import { isolationForestModel } from './isolationForestModel';

export interface RiskFeatures {
  cost_overrun_pct: number;
  payment_gap_pct: number;
  progress_gap_pct: number;
  delay_days: number;
  duplicate_similarity: number;
  contractor_repeat_rate: number;
  expenditure_ratio: number;
}

export type RiskLevel = 'high' | 'medium' | 'low';

const clamp = (n:number,min:number,max:number) => Math.min(max,Math.max(min,n));
const harmonic = (n:number) => { if (n <= 1) return 0; let h=0; for(let i=1;i<=n;i++) h += 1/i; return h; };
const c = (n:number) => n <= 1 ? 0 : 2*harmonic(n-1) - (2*(n-1)/n);

type ForestTree = { l: readonly number[]; r: readonly number[]; f: readonly number[]; t: readonly number[]; n: readonly number[] };

function pathLength(tree:ForestTree, x:number[]):number {
  let node=0, depth=0;
  while (tree.l[node] !== -1) {
    const f=tree.f[node]; node = x[f] <= tree.t[node] ? tree.l[node] : tree.r[node]; depth++;
  }
  const n=tree.n[node] ?? 1;
  return depth + c(n);
}

export function isolationForestScore(features: RiskFeatures) {
  const x=[features.cost_overrun_pct,features.payment_gap_pct,features.progress_gap_pct,features.delay_days,features.duplicate_similarity,features.contractor_repeat_rate,features.expenditure_ratio];
  const paths=(isolationForestModel.trees as readonly ForestTree[]).map(t=>pathLength(t,x));
  const mean=paths.reduce((a,b)=>a+b,0)/paths.length;
  const raw=Math.pow(2,-mean/c(isolationForestModel.max_samples));
  // sklearn IsolationForest score_samples is the negative of the normalized path score.
  // decision_function = score_samples - offset; lower/negative means more anomalous.
  const scoreSamples=-raw;
  const decision=scoreSamples-isolationForestModel.offset;
  const anomaly=clamp(raw*100,0,100);
  return { anomalyScore: Number(anomaly.toFixed(1)), decision, outlier: decision < 0, meanPathLength: Number(mean.toFixed(2)) };
}

export function buildRiskFeatures(work:any): RiskFeatures {
  const budget=Math.max(Number(work.budget)||0,1);
  const expenditure=Math.max(Number(work.total_expenditure)||0,0);
  const payments=Math.max(Number(work.total_payments_released)||0,0);
  const progress=Number(work.physical_progress_percentage)||0;
  const expected=Number(work.expected_progress_percentage)||0;
  const target=work.target_date ? new Date(work.target_date) : null;
  const delay=Math.max(0, Number(work.delay_days)|| (target && !Number.isNaN(target.getTime()) && target<new Date() ? Math.round((Date.now()-target.getTime())/86400000) : 0));
  return {
    cost_overrun_pct: Math.max(0,((expenditure-budget)/budget)*100),
    payment_gap_pct: Math.max(0,((payments-expenditure)/budget)*100),
    progress_gap_pct: Math.max(0,expected-progress),
    delay_days: delay,
    duplicate_similarity: clamp(Number(work.duplicate_similarity)||0,0,1),
    contractor_repeat_rate: clamp(Number(work.contractor_repeat_rate)||0,0,1),
    expenditure_ratio: expenditure/budget,
  };
}

export function calculateRisk(work:any): { anomalyScore:number; decision:number; outlier:boolean; meanPathLength:number; features:RiskFeatures; ruleScore:number; riskScore:number; riskLevel:RiskLevel; explanations:string[]; model:string; modelTrainingSamples:number } {
  const features=buildRiskFeatures(work);
  const ml=isolationForestScore(features);
  const ruleSignals={
    cost: clamp(features.cost_overrun_pct/50*100,0,100),
    payment: clamp(features.payment_gap_pct/25*100,0,100),
    progress: clamp(features.progress_gap_pct/50*100,0,100),
    delay: clamp(features.delay_days/180*100,0,100),
    duplicate: features.duplicate_similarity*100,
    network: features.contractor_repeat_rate*100,
  };
  const ruleScore=ruleSignals.cost*.24+ruleSignals.payment*.18+ruleSignals.progress*.18+ruleSignals.delay*.12+ruleSignals.duplicate*.16+ruleSignals.network*.12;
  const final=clamp(ml.anomalyScore*.65+ruleScore*.35,0,100);
  const level:RiskLevel=final>=75?'high':final>=50?'medium':'low';
  const explanationCandidates:Array<[number,string]>=[
    [ruleSignals.cost,'cost estimate / expenditure outlier'],[ruleSignals.payment,'payment vs expenditure divergence'],[ruleSignals.progress,'physical progress lag'],[ruleSignals.delay,'schedule delay'],[ruleSignals.duplicate,'near-duplicate work similarity'],[ruleSignals.network,'contractor concentration pattern']
  ];
  const explanations=explanationCandidates.filter(([score])=>score>25).sort((a,b)=>b[0]-a[0]).slice(0,3).map(([,text])=>text);
  return { ...ml, features, ruleScore:Number(ruleScore.toFixed(1)), riskScore:Number(final.toFixed(1)), riskLevel:level, explanations, model:'Isolation Forest v1 + deterministic compliance rules', modelTrainingSamples:isolationForestModel.training_samples };
}
