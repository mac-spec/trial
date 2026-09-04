import type {
  Alert,
  BoQItem,
  FundVelocityPoint,
  NetworkEdge,
  NetworkNode,
  Ward,
  RiskLevel,
} from './types';

export const wards: Ward[] = [
  {
    id: 'ward-indiranagar',
    name: 'Indiranagar',
    zone: 'Central',
    riskLevel: 'high',
    riskScore: 84,
    totalFunds: 18500000,
    flaggedWorks: 7,
    frozenFunds: 4200000,
    polygon: '180,120 260,110 290,160 270,210 200,220 160,180',
    labelX: 220,
    labelY: 165,
    mp: 'Shri Ramesh Jigajinagi',
  },
  {
    id: 'ward-koramangala',
    name: 'Koramangala',
    zone: 'South',
    riskLevel: 'medium',
    riskScore: 62,
    totalFunds: 15200000,
    flaggedWorks: 4,
    frozenFunds: 1800000,
    polygon: '290,210 360,200 380,250 350,290 280,280 270,230',
    labelX: 325,
    labelY: 245,
    mp: 'Smt. Tejaswini Ananthkumar',
  },
  {
    id: 'ward-whitefield',
    name: 'Whitefield',
    zone: 'East',
    riskLevel: 'high',
    riskScore: 91,
    totalFunds: 22300000,
    flaggedWorks: 9,
    frozenFunds: 6100000,
    polygon: '380,120 470,110 500,160 480,210 410,200 380,160',
    labelX: 440,
    labelY: 155,
    mp: 'Shri P. C. Mohan',
  },
  {
    id: 'ward-vasanthnagar',
    name: 'Vasanth Nagar',
    zone: 'Central',
    riskLevel: 'low',
    riskScore: 28,
    totalFunds: 9800000,
    flaggedWorks: 1,
    frozenFunds: 0,
    polygon: '160,60 250,50 270,100 230,120 170,110 140,80',
    labelX: 205,
    labelY: 85,
    mp: 'Shri D. V. Sadananda Gowda',
  },
  {
    id: 'ward-jayanagar',
    name: 'Jayanagar',
    zone: 'South',
    riskLevel: 'medium',
    riskScore: 55,
    totalFunds: 13400000,
    flaggedWorks: 3,
    frozenFunds: 900000,
    polygon: '200,280 290,290 310,340 270,370 190,360 170,320',
    labelX: 245,
    labelY: 325,
    mp: 'Shri Ananthkumar Hegde',
  },
  {
    id: 'ward-malleshwaram',
    name: 'Malleshwaram',
    zone: 'North',
    riskLevel: 'medium',
    riskScore: 58,
    totalFunds: 11700000,
    flaggedWorks: 4,
    frozenFunds: 1500000,
    polygon: '80,50 160,45 170,95 130,115 70,100 55,70',
    labelX: 115,
    labelY: 78,
    mp: 'Shri Prahlad Joshi',
  },
  {
    id: 'ward-hebbal',
    name: 'Hebbal',
    zone: 'North',
    riskLevel: 'high',
    riskScore: 79,
    totalFunds: 16800000,
    flaggedWorks: 6,
    frozenFunds: 3700000,
    polygon: '60,120 150,125 160,175 120,200 60,185 40,150',
    labelX: 105,
    labelY: 158,
    mp: 'Shri K. H. Muniyappa',
  },
  {
    id: 'ward-banashankari',
    name: 'Banashankari',
    zone: 'South',
    riskLevel: 'low',
    riskScore: 32,
    totalFunds: 10500000,
    flaggedWorks: 2,
    frozenFunds: 300000,
    polygon: '170,370 270,380 290,420 240,450 160,440 140,400',
    labelX: 218,
    labelY: 410,
    mp: 'Smt. A. Narayanaswamy',
  },
  {
    id: 'ward-electronics',
    name: 'Electronics City',
    zone: 'South',
    riskLevel: 'medium',
    riskScore: 67,
    totalFunds: 19200000,
    flaggedWorks: 5,
    frozenFunds: 2400000,
    polygon: '310,300 400,310 420,360 380,390 320,380 295,340',
    labelX: 365,
    labelY: 345,
    mp: 'Shri Tejasvi Surya',
  },
  {
    id: 'ward-yelahanka',
    name: 'Yelahanka',
    zone: 'North',
    riskLevel: 'low',
    riskScore: 35,
    totalFunds: 8900000,
    flaggedWorks: 1,
    frozenFunds: 0,
    polygon: '50,210 140,205 150,255 100,275 45,260 25,235',
    labelX: 95,
    labelY: 238,
    mp: 'Shri B. N. Bache Gowda',
  },
  {
    id: 'ward-padmanabhanagar',
    name: 'Padmanabhanagar',
    zone: 'South',
    riskLevel: 'high',
    riskScore: 73,
    totalFunds: 14100000,
    flaggedWorks: 5,
    frozenFunds: 2800000,
    polygon: '40,290 130,285 145,335 95,360 40,345 20,315',
    labelX: 85,
    labelY: 318,
    mp: 'Shri R. Ashoka',
  },
  {
    id: 'ward-shantinagar',
    name: 'Shantinagar',
    zone: 'Central',
    riskLevel: 'medium',
    riskScore: 51,
    totalFunds: 11200000,
    flaggedWorks: 3,
    frozenFunds: 700000,
    polygon: '170,150 240,145 255,190 210,210 160,195 145,170',
    labelX: 200,
    labelY: 175,
    mp: 'Shri M. Krishnappa',
  },
];

export const alerts: Alert[] = [
  {
    id: 'alert-001',
    wardName: 'Whitefield',
    workCategory: 'Stormwater Drain',
    agency: 'BBMP',
    riskScore: 94,
    riskLevel: 'high',
    workTitle: 'Stormwater Drain Re-lining - Varthur Main Road',
    fundAmount: 4200000,
    date: '2026-08-29',
    contractor: 'Sri Venkateshwara Infra Projects Pvt Ltd',
    status: 'flagged',
  },
  {
    id: 'alert-002',
    wardName: 'Indiranagar',
    workCategory: 'Road Asphalt',
    agency: 'BBMP',
    riskScore: 87,
    riskLevel: 'high',
    workTitle: '100ft Road Re-asphalting - 12th to CMH Road',
    fundAmount: 3100000,
    date: '2026-08-27',
    contractor: 'GVR Constructions',
    status: 'frozen',
  },
  {
    id: 'alert-003',
    wardName: 'Hebbal',
    workCategory: 'Community Hall',
    agency: 'BBMP',
    riskScore: 82,
    riskLevel: 'high',
    workTitle: 'Hebbal Lake View Community Hall Construction',
    fundAmount: 5600000,
    date: '2026-08-25',
    contractor: 'Nagara Nirmana Associates',
    status: 'flagged',
  },
  {
    id: 'alert-004',
    wardName: 'Padmanabhanagar',
    workCategory: 'Park Development',
    agency: 'BBMP',
    riskScore: 76,
    riskLevel: 'high',
    workTitle: 'Banashankari Stage V Park Landscaping',
    fundAmount: 1850000,
    date: '2026-08-24',
    contractor: 'Green Earth Horticulture Ltd',
    status: 'under_review',
  },
  {
    id: 'alert-005',
    wardName: 'Electronics City',
    workCategory: 'Street Lighting',
    agency: 'BESCOM',
    riskScore: 69,
    riskLevel: 'medium',
    workTitle: 'LED Street Light Installation - Hosur Road Stretch',
    fundAmount: 2200000,
    date: '2026-08-22',
    contractor: 'PowerTech Illumination Systems',
    status: 'flagged',
  },
  {
    id: 'alert-006',
    wardName: 'Koramangala',
    workCategory: 'Sanitation',
    agency: 'BBMP',
    riskScore: 64,
    riskLevel: 'medium',
    workTitle: 'Public Toilet Complex - 80 Feet Road',
    fundAmount: 950000,
    date: '2026-08-20',
    contractor: 'Sanitary Solutions India',
    status: 'under_review',
  },
  {
    id: 'alert-007',
    wardName: 'Malleshwaram',
    workCategory: 'Water Supply',
    agency: 'BWSSB',
    riskScore: 58,
    riskLevel: 'medium',
    workTitle: 'Cauvery Water Pipeline Augmentation - 8th Cross',
    fundAmount: 2700000,
    date: '2026-08-18',
    contractor: 'AquaFlow Pipeline Contractors',
    status: 'flagged',
  },
  {
    id: 'alert-008',
    wardName: 'Shantinagar',
    workCategory: 'Road Asphalt',
    agency: 'BBMP',
    riskScore: 52,
    riskLevel: 'medium',
    workTitle: 'Mini Road Patch Work - Lavelle Road Extension',
    fundAmount: 680000,
    date: '2026-08-15',
    contractor: 'Shanthi Constructions',
    status: 'cleared',
  },
  {
    id: 'alert-009',
    wardName: 'Jayanagar',
    workCategory: 'Stormwater Drain',
    agency: 'BBMP',
    riskScore: 55,
    riskLevel: 'medium',
    workTitle: 'Raja Kaluve Desilting - 4th Block',
    fundAmount: 1300000,
    date: '2026-08-12',
    contractor: 'Jayanagar Infra Works',
    status: 'under_review',
  },
  {
    id: 'alert-010',
    wardName: 'Vasanth Nagar',
    workCategory: 'Street Lighting',
    agency: 'BESCOM',
    riskScore: 26,
    riskLevel: 'low',
    workTitle: 'Street Light Pole Replacement - Crescent Road',
    fundAmount: 420000,
    date: '2026-08-10',
    contractor: 'Luminous Urban Systems',
    status: 'cleared',
  },
];

export const boqItems: BoQItem[] = [
  {
    id: 'boq-1',
    description: 'Excavation for drain trench, hard soil',
    unit: 'cu.m',
    quantity: 480,
    contractorPrice: 620,
    sorRate: 485,
    inflationPercent: 27.8,
  },
  {
    id: 'boq-2',
    description: 'RCC M25 drain lining with steel reinforcement',
    unit: 'cu.m',
    quantity: 210,
    contractorPrice: 14500,
    sorRate: 11800,
    inflationPercent: 22.9,
  },
  {
    id: 'boq-3',
    description: 'Precast concrete cover slabs 600x600x75mm',
    unit: 'nos',
    quantity: 350,
    contractorPrice: 1850,
    sorRate: 1620,
    inflationPercent: 14.2,
  },
  {
    id: 'boq-4',
    description: 'MS bar grating for drain inlet, heavy duty',
    unit: 'nos',
    quantity: 48,
    contractorPrice: 4200,
    sorRate: 3100,
    inflationPercent: 35.5,
  },
  {
    id: 'boq-5',
    description: 'Granular sub-base material, compacted',
    unit: 'cu.m',
    quantity: 180,
    contractorPrice: 2400,
    sorRate: 2150,
    inflationPercent: 11.6,
  },
  {
    id: 'boq-6',
    description: 'Pavement reinstatement - interlocking pavers',
    unit: 'sq.m',
    quantity: 620,
    contractorPrice: 890,
    sorRate: 745,
    inflationPercent: 19.5,
  },
  {
    id: 'boq-7',
    description: 'Silt trap chamber construction brick masonry',
    unit: 'nos',
    quantity: 12,
    contractorPrice: 22000,
    sorRate: 18500,
    inflationPercent: 18.9,
  },
  {
    id: 'boq-8',
    description: 'Chain link fencing along drain boundary',
    unit: 'rm',
    quantity: 240,
    contractorPrice: 580,
    sorRate: 520,
    inflationPercent: 11.5,
  },
];

export const fundVelocityData: FundVelocityPoint[] = [
  { month: 'Mar', fundUtilization: 15, physicalProgress: 12 },
  { month: 'Apr', fundUtilization: 32, physicalProgress: 22 },
  { month: 'May', fundUtilization: 51, physicalProgress: 31 },
  { month: 'Jun', fundUtilization: 68, physicalProgress: 38 },
  { month: 'Jul', fundUtilization: 82, physicalProgress: 44 },
  { month: 'Aug', fundUtilization: 91, physicalProgress: 49 },
  { month: 'Sep', fundUtilization: 95, physicalProgress: 52 },
];

export const networkNodes: NetworkNode[] = [
  { id: 'mp1', label: 'MP — R. Jigajinagi', type: 'mp', x: 400, y: 80, riskScore: 45 },
  { id: 'con1', label: 'Sri Venkateshwara Infra', type: 'contractor', x: 200, y: 180, riskScore: 88 },
  { id: 'con2', label: 'GVR Constructions', type: 'contractor', x: 550, y: 180, riskScore: 79 },
  { id: 'sub1', label: 'Sub: Varthur Civil Works', type: 'subcontractor', x: 100, y: 320, riskScore: 71 },
  { id: 'sub2', label: 'Sub: East Blr Materials', type: 'subcontractor', x: 300, y: 320, riskScore: 66 },
  { id: 'sub3', label: 'Sub: Indiranagar BuildCo', type: 'subcontractor', x: 620, y: 320, riskScore: 59 },
  { id: 'bank1', label: 'Acct: HDFC ****4421', type: 'bank', x: 180, y: 440, riskScore: 82 },
  { id: 'bank2', label: 'Acct: ICICI ****8830', type: 'bank', x: 400, y: 440, riskScore: 75 },
  { id: 'bank3', label: 'Acct: SBI ****1107', type: 'bank', x: 600, y: 440, riskScore: 68 },
];

export const networkEdges: NetworkEdge[] = [
  { from: 'mp1', to: 'con1', label: 'Awarded 4 works', suspicious: true },
  { from: 'mp1', to: 'con2', label: 'Awarded 3 works', suspicious: true },
  { from: 'con1', to: 'sub1', label: 'Subcontracted 60%', suspicious: true },
  { from: 'con1', to: 'sub2', label: 'Subcontracted 40%', suspicious: false },
  { from: 'con2', to: 'sub3', label: 'Subcontracted 55%', suspicious: true },
  { from: 'sub1', to: 'bank1', label: 'Payroll + transfer', suspicious: true },
  { from: 'sub2', to: 'bank2', label: 'Material payments', suspicious: false },
  { from: 'sub3', to: 'bank3', label: 'Single-signatory acct', suspicious: true },
  { from: 'bank1', to: 'bank2', label: 'Inter-acct transfer ₹18L', suspicious: true },
];

export const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const getRiskColor = (level: RiskLevel): string => {
  switch (level) {
    case 'high':
      return 'text-red-400';
    case 'medium':
      return 'text-amber-400';
    case 'low':
      return 'text-emerald-400';
  }
};

export const getRiskBg = (level: RiskLevel): string => {
  switch (level) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-amber-500';
    case 'low':
      return 'bg-emerald-500';
  }
};

export const getRiskFill = (level: RiskLevel): string => {
  switch (level) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#10b981';
  }
};
