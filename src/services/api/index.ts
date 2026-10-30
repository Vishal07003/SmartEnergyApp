import {
  StaffUser,
  Room,
  IoTDevice,
  SystemEnergyMetrics,
  AIAlert,
} from '../../types';
import {
  mockCurrentUser,
  mockRooms,
  mockDevices,
  mockAIAlerts,
  mockDetailedAIAlerts,
  mockEnergyMetrics,
} from '../mockData';

class MockApiService {
  private rooms: Room[] = [...mockRooms];
  private devices: IoTDevice[] = [...mockDevices];
  private alerts: AIAlert[] = [...mockDetailedAIAlerts];

  async getStaffProfile(): Promise<StaffUser> {
    return { ...mockCurrentUser };
  }

  async getDashboardMetrics(): Promise<SystemEnergyMetrics> {
    return { ...mockEnergyMetrics };
  }

  async getRooms(): Promise<Room[]> {
    return [...this.rooms];
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    return this.rooms.find(r => r.id === id);
  }

  async getDevices(): Promise<IoTDevice[]> {
    return [...this.devices];
  }

  async getDeviceById(id: string): Promise<IoTDevice | undefined> {
    return this.devices.find(d => d.id === id);
  }

  async getAlerts(): Promise<AIAlert[]> {
    return [...this.alerts];
  }

  async getAnalyticsByHorizon(horizon: import('../../types').TimeHorizon): Promise<import('../../types').PeriodAnalyticsData> {
    const { mockAnalyticsData } = await import('../mockData/analyticsData');
    return { ...mockAnalyticsData[horizon] };
  }

  async acknowledgeAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isAcknowledged = true;
      if (alert.status === 'ACTIVE') {
        alert.status = 'ACKNOWLEDGED';
      }
      return true;
    }
    return false;
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'RESOLVED';
      alert.isAcknowledged = true;
      return true;
    }
    return false;
  }

  async getAlertById(alertId: string): Promise<AIAlert | undefined> {
    return this.alerts.find(a => a.id === alertId);
  }

  async toggleDeviceChannel(deviceId: string, channelId: number): Promise<IoTDevice> {
    const device = this.devices.find(d => d.id === deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }

    const channel = device.channels.find(c => c.channelId === channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found on device ${deviceId}`);
    }

    if (channel.safetyLocked) {
      throw new Error('This channel is safety-locked to protect critical equipment.');
    }

    // Toggle confirmed state
    channel.isOn = !channel.isOn;
    return { ...device };
  }
}

export const mockApi = new MockApiService();

