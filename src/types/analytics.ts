export type TimeHorizon = 'Day' | 'Week' | 'Month' | 'Year';

export interface ChartBarData {
  label: string;
  actualKwh: number;
  baselineTargetKwh: number;
  isPeak?: boolean;
}

export interface ZoneEnergyAllocation {
  id: string;
  name: string;
  category: string;
  consumptionKwh: number;
  percentage: number;
  isHighest?: boolean;
  statusBadge: 'OPTIMAL' | 'ELEVATED' | 'HIGH';
}

export interface AIGovernanceMetrics {
  efficiencyIndex: number; // 0 - 100
  efficiencyRating: string; // e.g. "Top 5% of Campus Facilities"
  smartSheddingKwh: number;
  completeLoadCutKwh: number;
  estimatedCostSavings: number; // institutional currency
  abnormalSpikesCount: number;
  recommendations: string[];
}

export interface PeriodAnalyticsData {
  timeHorizon: TimeHorizon;
  dateRangeLabel: string;
  totalConsumptionKwh: number;
  deltaPercentVsPrevious: number; // negative means saving
  liveCampusDemandWatts: number;
  carbonOffsetKg: number;
  targetBudgetKwh: number;
  chartData: ChartBarData[];
  peakPeriodLabel: string;
  allocations: ZoneEnergyAllocation[];
  governance: AIGovernanceMetrics;
}

