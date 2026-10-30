export type DeviceType = 
  | 'ESP32_NODE' 
  | 'RELAY_MODULE' 
  | 'SMART_POWER_SOCKET' 
  | 'CURRENT_SENSOR' 
  | 'LIGHTING_BANK' 
  | 'HVAC_FAN_CONTROLLER';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED';

export interface DeviceTelemetry {
  voltage: number; // Volts
  current: number; // Amperes
  powerWatts: number; // Active Watts
  powerFactor: number;
  frequency: number; // Hz
  temperatureInternal?: number;
  wifiRssi: number; // dBm signal strength
  lastPacketReceived: string; // ISO 8601
}

export interface ControlledRelayChannel {
  channelId: number;
  label: string; // e.g., "North Row Lights", "Ceiling Fan Array 1", "PC Power Rack"
  isOn: boolean;
  powerWatts: number;
  isControllable: boolean; // Hardware supports remote switching
  safetyLocked?: boolean; // Cannot be automatically cut off (e.g. servers/critical equipment)
}

export interface IoTDevice {
  id: string;
  name: string;
  hardwareId: string; // e.g., "ESP32-ENG-B1-R204"
  macAddress: string;
  ipAddress: string;
  roomId: string;
  roomName: string;
  type: DeviceType;
  status: DeviceStatus;
  telemetry: DeviceTelemetry;
  channels: ControlledRelayChannel[];
  firmwareVersion: string;
  automationEnabled: boolean;
  uptimeHours: number;
  lastCommunicationTime: string;
}

