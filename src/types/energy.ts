export interface HourlyEnergyPoint {
  hour: string; // e.g., "08:00", "09:00"
  consumptionKwh: number;
  averagePowerWatts: number;
  isPeak: boolean;
}

export interface DailyEnergySummary {
  date: string; // YYYY-MM-DD
  totalKwh: number;
  peakPowerWatts: number;
  wastedKwh: number;
  savedKwh: number;
  estimatedCost: number; // Institutional currency units
}

export interface RoomEnergyBreakdown {
  roomId: string;
  roomName: string;
  consumptionKwh: number;
  percentage: number;
  powerState: 'NORMAL' | 'HIGH' | 'ABNORMAL';
}

export interface SystemEnergyMetrics {
  todayConsumptionKwh: number;
  yesterdayConsumptionKwh: number;
  liveSystemPowerWatts: number;
  peakPowerTodayWatts: number;
  totalActiveRooms: number;
  totalEmptyRooms: number;
  totalConnectedDevices: number;
  onlineDevicesCount: number;
  todayWastageKwh: number;
  todaySavingsKwh: number;
  co2OffsetKg: number;
  hourlyTrends: HourlyEnergyPoint[];
  roomBreakdowns: RoomEnergyBreakdown[];
}

