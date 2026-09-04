export type RiskLevel = 'high' | 'medium' | 'low';
export type WorkCategory =
  | 'Stormwater Drain'
  | 'Road Asphalt'
  | 'Street Lighting'
  | 'Park Development'
  | 'Community Hall'
  | 'Water Supply'
  | 'Sanitation';

export type Agency = 'BBMP' | 'BWSSB' | 'BESCOM' | 'KSCP' | 'Panchayat';

export interface BoQItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  contractorPrice: number;
  sorRate: number;
  inflationPercent: number;
}

export interface Alert {
  id: string;
  wardName: string;
  workCategory: WorkCategory;
  agency: Agency;
  riskScore: number;
  riskLevel: RiskLevel;
  workTitle: string;
  fundAmount: number;
  date: string;
  contractor: string;
  status: 'flagged' | 'frozen' | 'under_review' | 'cleared';
}

export interface Ward {
  id: string;
  name: string;
  zone: 'North' | 'South' | 'Central' | 'East';
  riskLevel: RiskLevel;
  riskScore: number;
  totalFunds: number;
  flaggedWorks: number;
  frozenFunds: number;
  // SVG polygon points for the mock map
  polygon: string;
  // label position
  labelX: number;
  labelY: number;
  mp: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'mp' | 'contractor' | 'subcontractor' | 'bank';
  x: number;
  y: number;
  riskScore: number;
}

export interface NetworkEdge {
  from: string;
  to: string;
  label: string;
  suspicious: boolean;
}

export interface FundVelocityPoint {
  month: string;
  fundUtilization: number;
  physicalProgress: number;
}
