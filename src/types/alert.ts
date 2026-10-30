export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export type AlertCategory =
  | 'UNOCCUPIED_WASTAGE'
  | 'ABNORMAL_SPIKE'
  | 'DEVICE_OFFLINE'
  | 'SENSOR_MALFUNCTION'
  | 'OVERLOAD_RISK';

export interface AlertSensorSnapshot {
  motionDetected: boolean;
  temperature: number; // °C
  humidity: number; // %
  ambientLight: number; // Lux
  liveWatts: number;
  wifiRssi?: number;
}

export interface AIAlert {
  id: string; // e.g. "ALT-8021"
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: AlertCategory;
  roomId: string;
  roomName: string;
  deviceId?: string;
  deviceName?: string;
  timestamp: string;
  description: string;
  possibleReason: string;
  recommendedAction: string;
  aiConfidenceScore: number; // 0.0 - 1.0
  isAcknowledged: boolean;
  powerWastageEstimateWatts?: number;
  sensorSnapshot: AlertSensorSnapshot;
  historyLog: { time: string; event: string }[];
}

export interface AlertSummaryCounts {
  totalActive: number;
  critical: number;
  warning: number;
  info: number;
  resolved: number;
}
