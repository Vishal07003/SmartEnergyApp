export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type AlertCategory =
  | 'UNOCCUPIED_WASTAGE'
  | 'ABNORMAL_SPIKE'
  | 'DEVICE_OFFLINE'
  | 'SENSOR_MALFUNCTION'
  | 'OVERLOAD_RISK'
  | 'VOLTAGE_FLUCTUATION'
  | 'PHANTOM_LOAD'
  | 'ANOMALOUS_CONSUMPTION'
  | 'OVERHEATING'
  | 'POWER_FACTOR_DROP'
  | string;

export interface AIAlert {
  id: string;
  title: string;
  severity: AlertSeverity;
  category: AlertCategory;
  roomId: string;
  roomName: string;
  deviceId?: string;
  deviceName?: string;
  timestamp: string;
  description: string;
  possibleReason: string;
  recommendedAction: string;
  isAcknowledged: boolean;
  powerWastageEstimateWatts?: number;
}

