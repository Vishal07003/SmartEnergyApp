import { Platform } from 'react-native';

/**
 * Global Configuration for Backend API Connectivity.
 * 
 * Supports:
 * - Android Emulator: 10.0.2.2 points to host loopback.
 * - Physical Android / iOS Devices: Configure via your local LAN IP (e.g. 192.168.1.X:8000).
 * - Web / Desktop: localhost:8000.
 */
export const API_CONFIG = {
  // Override DEV_MACHINE_LAN_IP with your host PC's Wi-Fi / Ethernet IP when running on physical hardware
  DEV_MACHINE_LAN_IP: '192.168.1.100',
  PORT: 8000,
  API_PREFIX: '/api/v1',
  TIMEOUT_MS: 15000,
};

export const getBaseApiUrl = (): string => {
  // Android Emulator default loopback proxy is 10.0.2.2
  if (Platform.OS === 'android') {
    // If running on an emulator, 10.0.2.2 is standard.
    // When deploying to a physical device on same Wi-Fi, change to DEV_MACHINE_LAN_IP.
    return `http://10.0.2.2:${API_CONFIG.PORT}${API_CONFIG.API_PREFIX}`;
  }
  return `http://127.0.0.1:${API_CONFIG.PORT}${API_CONFIG.API_PREFIX}`;
};

