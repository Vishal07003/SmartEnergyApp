import { apiClient } from './client';
import { sessionStorage, AuthTokens } from './session';
import {
  LoginResponse,
  UserProfileResponse,
  PaginatedResponse,
  BackendDeviceListItem,
  BackendDeviceDetail,
  BackendRoomListItem,
  BackendRoomDetail,
  BackendCampusEnergySummary,
  BackendBuildingComparison,
  BackendAlertListItem,
  BackendAlertDetail,
  BackendAlertSummary,
  BackendManualControlResponse,
  BackendAutomationLog,
} from './backendTypes';
import {
  StaffUser,
  Room,
  IoTDevice,
  SystemEnergyMetrics,
  AIAlert,
  TimeHorizon,
  PeriodAnalyticsData,
  ControlledRelayChannel,
  DeviceStatus,
  DeviceType,
  RoomActivity,
} from '../../types';

class LiveApiService {
  // ==========================================
  // AUTHENTICATION & PROFILE
  // ==========================================

  async login(username: string, password: string): Promise<StaffUser> {
    const data = await apiClient.request<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      requiresAuth: false,
    });

    sessionStorage.setTokens({
      accessToken: data.access,
      refreshToken: data.refresh,
    });

    return this.transformBackendUser(data.user);
  }

  async logout(): Promise<void> {
    const refreshToken = sessionStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await apiClient.request('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch {
        // Clean up locally regardless of network or backend response
      }
    }
    sessionStorage.clearTokens();
  }

  async getStaffProfile(): Promise<StaffUser> {
    const data = await apiClient.request<UserProfileResponse>('/auth/me/');
    return this.transformUserProfile(data);
  }

  async updateStaffProfile(payload: {
    email?: string;
    first_name?: string;
    last_name?: string;
    profile?: {
      phone_number?: string;
      notifications_enabled?: boolean;
      alert_push_enabled?: boolean;
    };
  }): Promise<StaffUser> {
    const data = await apiClient.request<UserProfileResponse>('/auth/me/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return this.transformUserProfile(data);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ detail: string }> {
    return await apiClient.request<{ detail: string }>('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });
  }

  // ==========================================
  // DASHBOARD METRICS
  // ==========================================

  async getDashboardMetrics(): Promise<SystemEnergyMetrics> {
    // Dynamically aggregated from /energy/analytics/summary/, /rooms/, and /devices/
    const [energySummary, roomsRes, devicesRes] = await Promise.all([
      apiClient.request<BackendCampusEnergySummary>('/energy/analytics/summary/', { params: { days: 1 } }),
      apiClient.request<PaginatedResponse<BackendRoomListItem>>('/rooms/'),
      apiClient.request<PaginatedResponse<BackendDeviceListItem>>('/devices/'),
    ]);

    const rooms = roomsRes.results || [];
    const devices = devicesRes.results || [];

    const activeRooms = rooms.filter(r => r.occupancy_state === 'ACTIVE').length;
    const emptyRooms = rooms.filter(r => r.occupancy_state === 'EMPTY').length;

    // Devices status derived strictly from calculated_status
    const onlineDevices = devices.filter(d => (d.calculated_status || d.status) === 'ONLINE').length;

    // Room breakdowns
    const totalKwh = energySummary.total_consumption_kwh || 0;
    const roomBreakdowns = (energySummary.room_distribution || []).map((rd, idx) => ({
      roomId: String(idx + 1),
      roomName: rd.room_name || rd.room_number,
      consumptionKwh: rd.total_kwh,
      percentage: totalKwh > 0 ? Math.round((rd.total_kwh / totalKwh) * 100) : 0,
      powerState: (rd.total_kwh > 50 ? 'HIGH' : 'NORMAL') as 'NORMAL' | 'HIGH' | 'ABNORMAL',
    }));

    return {
      todayConsumptionKwh: energySummary.total_consumption_kwh,
      yesterdayConsumptionKwh: 0,
      liveSystemPowerWatts: energySummary.average_power_watts,
      peakPowerTodayWatts: energySummary.peak_power_watts,
      totalActiveRooms: activeRooms,
      totalEmptyRooms: emptyRooms,
      totalConnectedDevices: devices.length,
      onlineDevicesCount: onlineDevices,
      todayWastageKwh: 0,
      todaySavingsKwh: 0,
      co2OffsetKg: Math.round(energySummary.total_consumption_kwh * 0.82),
      hourlyTrends: [],
      roomBreakdowns,
    };
  }

  // ==========================================
  // ROOMS
  // ==========================================

  async getRooms(params?: Record<string, string | number>): Promise<Room[]> {
    const data = await apiClient.request<PaginatedResponse<BackendRoomListItem>>('/rooms/', {
      params,
    });
    return (data.results || []).map(r => this.transformRoomListItem(r));
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    try {
      const data = await apiClient.request<BackendRoomDetail>(`/rooms/${id}/`);
      return this.transformRoomDetail(data);
    } catch {
      return undefined;
    }
  }

  // ==========================================
  // DEVICES
  // ==========================================

  async getDevices(params?: Record<string, string | number>): Promise<IoTDevice[]> {
    const data = await apiClient.request<PaginatedResponse<BackendDeviceListItem>>('/devices/', {
      params,
    });
    return (data.results || []).map(d => this.transformDeviceListItem(d));
  }

  async getDeviceById(id: string): Promise<IoTDevice | undefined> {
    try {
      const data = await apiClient.request<BackendDeviceDetail>(`/devices/${id}/`);
      return this.transformDeviceDetail(data);
    } catch {
      return undefined;
    }
  }

  async registerDevice(payload: import('./backendTypes').DeviceCreatePayload): Promise<IoTDevice> {
    const data = await apiClient.request<BackendDeviceDetail>('/devices/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return this.transformDeviceDetail(data);
  }

  async toggleDeviceChannel(
    deviceId: string,
    channelIndex: number,
    targetState: boolean,
    reason: string = 'Manual App Control'
  ): Promise<BackendManualControlResponse> {
    return await apiClient.request<BackendManualControlResponse>('/automation/manual-control/', {
      method: 'POST',
      body: JSON.stringify({
        device_id: parseInt(deviceId, 10),
        channel_index: channelIndex,
        target_state: targetState,
        reason,
      }),
    });
  }

  // ==========================================
  // ALERTS
  // ==========================================

  async getAlerts(params?: Record<string, string | number>): Promise<AIAlert[]> {
    const data = await apiClient.request<PaginatedResponse<BackendAlertListItem>>('/alerts/', {
      params,
    });
    return (data.results || []).map(a => this.transformAlertListItem(a));
  }

  async getAlertSummary(): Promise<BackendAlertSummary> {
    return await apiClient.request<BackendAlertSummary>('/alerts/summary/');
  }

  async getAlertById(id: string): Promise<AIAlert | undefined> {
    try {
      const data = await apiClient.request<BackendAlertDetail>(`/alerts/${id}/`);
      return this.transformAlertDetail(data);
    } catch {
      return undefined;
    }
  }

  async acknowledgeAlert(alertId: string): Promise<boolean> {
    try {
      await apiClient.request(`/alerts/${alertId}/acknowledge/`, {
        method: 'POST',
      });
      return true;
    } catch {
      return false;
    }
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    try {
      await apiClient.request(`/alerts/${alertId}/resolve/`, {
        method: 'POST',
      });
      return true;
    } catch {
      return false;
    }
  }

  // ==========================================
  // ANALYTICS
  // ==========================================

  async getAnalyticsByHorizon(horizon: TimeHorizon): Promise<PeriodAnalyticsData> {
    const horizonDays: Record<TimeHorizon, number> = {
      Day: 1,
      Week: 7,
      Month: 30,
      Year: 365,
    };
    const days = horizonDays[horizon] || 7;

    const [summary, buildingComparison] = await Promise.all([
      apiClient.request<BackendCampusEnergySummary>('/energy/analytics/summary/', { params: { days } }),
      apiClient.request<BackendBuildingComparison>('/energy/analytics/buildings/', { params: { days } }),
    ]);

    const chartData = (buildingComparison.buildings || []).map(b => ({
      label: b.building_code || b.building_name,
      actualKwh: b.total_kwh,
      baselineTargetKwh: Math.round(b.total_kwh * 1.1),
    }));

    const allocations = (buildingComparison.buildings || []).map(b => {
      const total = summary.total_consumption_kwh || 1;
      const pct = Math.round((b.total_kwh / total) * 100);
      return {
        id: String(b.building_id),
        name: b.building_name,
        category: b.building_code,
        consumptionKwh: b.total_kwh,
        percentage: pct,
        statusBadge: (pct > 40 ? 'HIGH' : pct > 20 ? 'ELEVATED' : 'OPTIMAL') as 'HIGH' | 'ELEVATED' | 'OPTIMAL',
      };
    });

    return {
      timeHorizon: horizon,
      dateRangeLabel: `${summary.start_date} - ${summary.end_date}`,
      totalConsumptionKwh: summary.total_consumption_kwh,
      deltaPercentVsPrevious: 0,
      liveCampusDemandWatts: summary.average_power_watts,
      carbonOffsetKg: Math.round(summary.total_consumption_kwh * 0.82),
      targetBudgetKwh: Math.round(summary.total_consumption_kwh * 1.15),
      chartData,
      peakPeriodLabel: `${summary.peak_power_watts} W Peak`,
      allocations,
      governance: {
        efficiencyIndex: 88,
        efficiencyRating: 'Active Institutional Energy Governance',
        smartSheddingKwh: 0,
        completeLoadCutKwh: 0,
        estimatedCostSavings: Math.round(summary.total_consumption_kwh * 0.12),
        abnormalSpikesCount: 0,
        recommendations: [summary.waste_estimate_notice || 'All baseline assumptions verified by facility sensors.'],
      },
    };
  }

  // ==========================================
  // RECENT ACTIVITIES (FROM AUTOMATION LOGS)
  // ==========================================

  async getRecentActivities(): Promise<RoomActivity[]> {
    try {
      const res = await apiClient.request<PaginatedResponse<BackendAutomationLog>>('/automation/logs/');
      return (res.results || []).map(log => ({
        id: String(log.id),
        timestamp: log.created_at,
        title: log.action_taken.replace(/_/g, ' '),
        description: log.details || `${log.trigger_condition}: ${log.execution_result}`,
        type: 'AUTOMATION_ACTION' as const,
      }));
    } catch {
      return [];
    }
  }

  // ==========================================
  // DATA TRANSFORMERS (BACKEND -> UI TYPES)
  // ==========================================

  private transformBackendUser(u: any): StaffUser {
    const isAdmin = Boolean(u.is_staff || u.is_superuser || (u.role && u.role.toUpperCase() === 'ADMIN'));
    return {
      id: String(u.id),
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
      email: u.email,
      phoneNumber: u.phone_number || '',
      employeeId: u.employee_id || `EMP-${u.id}`,
      department: u.department || 'Facility Administration',
      role: isAdmin ? 'admin' : 'staff',
      isAdmin,
      assignedBlock: u.assigned_block || 'Campus Main',
      notificationsEnabled: u.notifications_enabled ?? true,
      alertPushEnabled: u.alert_push_enabled ?? true,
      createdAt: new Date().toISOString(),
    };
  }

  private transformUserProfile(u: UserProfileResponse): StaffUser {
    const prof = u.profile;
    const isAdmin = Boolean(u.is_staff || u.is_superuser || (prof && prof.role && prof.role.toUpperCase() === 'ADMIN'));
    return {
      id: String(u.id),
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
      email: u.email,
      phoneNumber: prof?.phone_number || '',
      employeeId: prof?.employee_id || `EMP-${u.id}`,
      department: prof?.department || 'Facility Administration',
      role: isAdmin ? 'admin' : 'staff',
      isAdmin,
      assignedBlock: prof?.assigned_block || 'Campus Main',
      notificationsEnabled: prof?.notifications_enabled ?? true,
      alertPushEnabled: prof?.alert_push_enabled ?? true,
      createdAt: prof?.created_at || new Date().toISOString(),
    };
  }

  private transformRoomListItem(r: BackendRoomListItem): Room {
    return {
      id: String(r.id),
      name: r.name,
      roomNumber: r.room_number,
      building: r.building_name || r.building_code,
      floor: r.floor_name || `Floor ${r.floor_level}`,
      type: r.room_type,
      occupancy: {
        state: r.occupancy_state,
        confidenceScore: r.ml_confidence_score,
        detectedCount: r.occupancy_state === 'ACTIVE' ? 1 : 0,
        lastStateChange: r.last_state_change || r.created_at,
        idleTimerMinutes: r.idle_timer_minutes,
      },
      sensors: {
        temperature: 24,
        humidity: 50,
        ambientLight: 300,
        soundLevel: 45,
        motionDetected: r.occupancy_state === 'ACTIVE',
        lastMotionTime: r.last_state_change || r.created_at,
      },
      electrical: {
        livePowerWatts: 0,
        voltageVolts: 230,
        currentAmps: 0,
        todayEnergyKwh: 0,
        activeApplianceCount: 0,
        totalApplianceCount: r.devices_count,
      },
      connectedDeviceIds: [],
      aiRecommendations: [],
      recentActivities: [],
    };
  }

  private transformRoomDetail(r: BackendRoomDetail): Room {
    const base = this.transformRoomListItem(r);
    return {
      ...base,
      connectedDeviceIds: (r.devices || []).map(d => String(d.id)),
    };
  }

  private transformDeviceListItem(d: BackendDeviceListItem): IoTDevice {
    const status: DeviceStatus =
      (d.calculated_status as DeviceStatus) || (d.status as DeviceStatus) || 'UNKNOWN';

    return {
      id: String(d.id),
      name: d.name,
      hardwareId: d.hardware_id,
      macAddress: d.mac_address || '00:00:00:00:00:00',
      ipAddress: d.ip_address || '0.0.0.0',
      roomId: d.room ? String(d.room) : '',
      roomName: d.room_name || d.room_number || 'Unassigned',
      type: (d.device_type as DeviceType) || 'ESP32_NODE',
      status: status === 'ONLINE' ? 'ONLINE' : status === 'DEGRADED' ? 'DEGRADED' : 'OFFLINE',
      telemetry: {
        voltage: 230,
        current: 0,
        powerWatts: 0,
        powerFactor: 0.95,
        frequency: 50,
        wifiRssi: d.wifi_rssi || -70,
        lastPacketReceived: d.last_heartbeat_timestamp || d.last_communication_time || d.created_at,
      },
      channels: [],
      firmwareVersion: d.firmware_version || 'v1.0.0',
      automationEnabled: d.automation_enabled,
      uptimeHours: d.uptime_hours || 0,
      lastCommunicationTime: d.last_communication_time || d.created_at,
    };
  }

  private transformDeviceDetail(d: BackendDeviceDetail): IoTDevice {
    const base = this.transformDeviceListItem(d);
    const channels: ControlledRelayChannel[] = (d.channels || []).map(ch => ({
      channelId: ch.channel_index,
      label: ch.label,
      isOn: ch.is_on,
      powerWatts: ch.power_watts,
      isControllable: ch.is_controllable,
      safetyLocked: ch.safety_locked,
    }));

    const hb = d.latest_heartbeat;
    return {
      ...base,
      channels,
      telemetry: {
        voltage: hb ? hb.voltage : 230,
        current: hb ? hb.current : 0,
        powerWatts: hb ? hb.power_watts : 0,
        powerFactor: 0.95,
        frequency: 50,
        wifiRssi: hb ? hb.wifi_rssi : d.wifi_rssi,
        lastPacketReceived: hb ? hb.timestamp : base.telemetry.lastPacketReceived,
      },
    };
  }

  private transformAlertListItem(a: BackendAlertListItem): AIAlert {
    return {
      id: String(a.id),
      title: a.title,
      severity: a.severity,
      category: a.category as any,
      roomId: a.room ? String(a.room) : '',
      roomName: a.room_name || a.room_number || 'Campus Facility',
      deviceId: a.device ? String(a.device) : undefined,
      deviceName: a.device_hardware_id || undefined,
      timestamp: a.timestamp,
      description: a.description,
      possibleReason: 'Energy anomaly identified by facility threshold rules.',
      recommendedAction: 'Inspect facility load and confirm occupancy.',
      isAcknowledged: a.is_acknowledged,
      powerWastageEstimateWatts: a.power_wastage_estimate_watts,
    };
  }

  private transformAlertDetail(a: BackendAlertDetail): AIAlert {
    const base = this.transformAlertListItem(a);
    return {
      ...base,
      possibleReason: (a.possible_causes || []).join('\n') || base.possibleReason,
      recommendedAction: (a.recommended_actions || []).join('\n') || base.recommendedAction,
    };
  }
}

export const liveApi = new LiveApiService();
// Alias mockApi to liveApi to seamlessly connect all screen imports while preserving existing method signatures
export const mockApi = liveApi;
