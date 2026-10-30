export type OccupancyState = 'EMPTY' | 'ACTIVE' | 'IDLE_TRANSITION';

export interface EnvironmentalSensors {
  temperature: number; // Celsius
  humidity: number; // %
  ambientLight: number; // Lux
  soundLevel: number; // dB
  motionDetected: boolean;
  lastMotionTime: string; // ISO 8601
}

export interface RoomOccupancyInfo {
  state: OccupancyState;
  confidenceScore: number; // 0.0 - 1.0 from ML model
  detectedCount: number; // Estimated count if active
  lastStateChange: string; // ISO 8601
  idleTimerMinutes: number; // Time in idle before transition to empty
}

export interface RoomElectricalSummary {
  livePowerWatts: number;
  voltageVolts: number;
  currentAmps: number;
  todayEnergyKwh: number;
  activeApplianceCount: number;
  totalApplianceCount: number;
}

export interface Room {
  id: string;
  name: string;
  roomNumber: string;
  building: string;
  floor: string;
  type: 'Classroom' | 'Computer Lab' | 'Seminar Hall' | 'Research Lab';
  occupancy: RoomOccupancyInfo;
  sensors: EnvironmentalSensors;
  electrical: RoomElectricalSummary;
  connectedDeviceIds: string[];
  aiRecommendations: string[];
  recentActivities: RoomActivity[];
}

export interface RoomActivity {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'OCCUPANCY_CHANGE' | 'LOAD_TOGGLE' | 'ALERT_TRIGGERED' | 'AUTOMATION_ACTION';
}

