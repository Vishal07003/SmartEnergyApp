/**
 * TypeScript Interfaces for Actual Django REST Framework API Responses
 */

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// 1. Auth Schemas
export interface BackendUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  role: string;
  employee_id: string;
  department: string;
  assigned_block: string;
  notifications_enabled: boolean;
  alert_push_enabled: boolean;
}

export interface LoginResponse {
  refresh: string;
  access: string;
  user: BackendUser;
}

export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  profile?: {
    employee_id: string;
    department: string;
    phone_number: string;
    role: string;
    assigned_block: string;
    notifications_enabled: boolean;
    alert_push_enabled: boolean;
    created_at: string;
    updated_at: string;
  };
}

// 2. Devices Schemas
export interface BackendRelayChannel {
  id: number;
  channel_index: number;
  label: string;
  is_on: boolean;
  power_watts: number;
  is_controllable: boolean;
  safety_locked: boolean;
  updated_at: string;
}

export interface BackendHeartbeat {
  id: number;
  voltage: number;
  current: number;
  power_watts: number;
  wifi_rssi: number;
  uptime_seconds: number;
  timestamp: string;
  calculated_status?: string;
}

export interface BackendDeviceListItem {
  id: number;
  name: string;
  hardware_id: string;
  device_type: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  calculated_status: 'ONLINE' | 'OFFLINE' | 'UNKNOWN';
  mac_address: string;
  ip_address: string;
  firmware_version: string;
  automation_enabled: boolean;
  uptime_hours: number;
  wifi_rssi: number;
  room: number | null;
  room_number: string | null;
  room_name: string | null;
  floor_level: number | null;
  building_code: string | null;
  building_name: string | null;
  channels_count: number;
  last_heartbeat_timestamp: string | null;
  last_communication_time: string | null;
  created_at: string;
}

export interface BackendDeviceDetail extends BackendDeviceListItem {
  channels: BackendRelayChannel[];
  latest_heartbeat: BackendHeartbeat | null;
}

export interface DeviceCreatePayload {
  name: string;
  hardware_id: string;
  device_type: string;
  room: number;
  mac_address?: string;
  ip_address?: string;
  firmware_version?: string;
  automation_enabled?: boolean;
  channels?: Array<{
    channel_index: number;
    label: string;
    is_on?: boolean;
    is_controllable?: boolean;
    safety_locked?: boolean;
  }>;
}

// 3. Rooms Schemas
export interface BackendRoomListItem {
  id: number;
  floor: number;
  floor_level: number;
  floor_name: string;
  building_id: number;
  building_name: string;
  building_code: string;
  name: string;
  room_number: string;
  room_type: 'Classroom' | 'Computer Lab' | 'Seminar Hall' | 'Research Lab';
  occupancy_state: 'EMPTY' | 'ACTIVE' | 'IDLE_TRANSITION';
  ml_confidence_score: number;
  idle_timer_minutes: number;
  is_active: boolean;
  devices_count: number;
  sensors_count: number;
  last_state_change: string | null;
  created_at: string;
}

export interface BackendRoomDetail extends BackendRoomListItem {
  devices: Array<{
    id: number;
    name: string;
    hardware_id: string;
    device_type: string;
    status: string;
    wifi_rssi: number;
    uptime_hours: number;
  }>;
  sensors: Array<{
    id: number;
    sensor_type: string;
    sensor_model: string;
    unit_of_measurement: string;
    is_active: boolean;
  }>;
}

// 4. Energy & Analytics Schemas
export interface BackendCampusEnergySummary {
  start_date: string;
  end_date: string;
  days_evaluated: number;
  total_consumption_kwh: number;
  average_power_watts: number;
  peak_power_watts: number;
  active_monitoring_rooms: number;
  room_distribution: Array<{
    room_number: string;
    room_name: string;
    total_kwh: number;
  }>;
  waste_estimate_notice: string;
}

export interface BackendBuildingComparison {
  period_days: number;
  since_date: string;
  buildings: Array<{
    building_id: number;
    building_name: string;
    building_code: string;
    total_kwh: number;
    peak_power_watts: number;
  }>;
}

export interface BackendEnergyReading {
  id: number;
  room: number;
  room_number: string;
  room_name: string;
  device: number | null;
  device_hardware_id: string | null;
  voltage_volts: number;
  current_amps: number;
  active_power_watts: number;
  power_factor: number;
  frequency_hz: number;
  energy_kwh: number;
  timestamp: string;
}

// 5. Alerts Schemas
export interface BackendAlertListItem {
  id: number;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: string;
  room: number | null;
  room_number: string | null;
  room_name: string | null;
  device: number | null;
  device_hardware_id: string | null;
  is_acknowledged: boolean;
  is_resolved: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  power_wastage_estimate_watts: number;
  timestamp: string;
}

export interface BackendAlertDetail extends BackendAlertListItem {
  possible_causes: string[];
  recommended_actions: string[];
  diagnostic_payload: Record<string, any>;
}

export interface BackendAlertSummary {
  total_unresolved: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  total_power_wastage_watts: number;
  category_breakdown: Record<string, number>;
}

// 6. Automation & Commands
export interface BackendManualControlResponse {
  command_id: string;
  device_hardware_id: string;
  channel_index: number;
  target_state: boolean;
  status: string;
  notes: string;
}

export interface BackendAutomationLog {
  id: number;
  device: number | null;
  device_hardware_id: string | null;
  room: number | null;
  room_number: string | null;
  action_taken: string;
  trigger_condition: string;
  execution_result: string;
  details: string;
  created_at: string;
}

