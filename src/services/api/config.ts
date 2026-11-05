import { Platform } from 'react-native';

/**
 * Centralized API Configuration.
 * Maintains all network constants, endpoints, and target host resolution.
 */
export const API_CONFIG = {
  // Host PC Wi-Fi LAN IP (for direct device connection on local Wi-Fi)
  PC_IP: '192.168.31.8:8000',
  // Local loopback host (for ADB reverse tethering / desktop / iOS simulator)
  LOCAL_HOST: '127.0.0.1',
  // Android Emulator standard loopback proxy
  EMULATOR_HOST: '10.0.2.2',
  PORT: 8000,
  API_PREFIX: '/api/v1',
  TIMEOUT_MS: 15000,

  /**
   * Connection mode:
   * - 'pc_ip': Direct Wi-Fi connection to host machine.
   * - 'local': USB reverse tethering (via adb reverse tcp:8000 tcp:8000).
   * - 'emulator': Android Studio emulator.
   * - 'auto': Uses PC IP on physical Android, 127.0.0.1 on other environments.
   */
  USE_MODE: 'auto' as 'pc_ip' | 'local' | 'emulator' | 'auto',
};

/**
 * Resolves the primary base URL for the active API client.
 */
export const getBaseApiUrl = (): string => {
  const { PC_IP, LOCAL_HOST, EMULATOR_HOST, PORT, API_PREFIX, USE_MODE } = API_CONFIG;

  switch (USE_MODE) {
    case 'pc_ip':
      return `http://${PC_IP}:${PORT}${API_PREFIX}`;
    case 'local':
      return `http://${LOCAL_HOST}:${PORT}${API_PREFIX}`;
    case 'emulator':
      return `http://${EMULATOR_HOST}:${PORT}${API_PREFIX}`;
    case 'auto':
    default:
      if (Platform.OS === 'android') {
        return `http://${PC_IP}:${PORT}${API_PREFIX}`;
      }
      return `http://${LOCAL_HOST}:${PORT}${API_PREFIX}`;
  }
};

export const getLocalApiUrl = (): string =>
  `http://${API_CONFIG.LOCAL_HOST}:${API_CONFIG.PORT}${API_CONFIG.API_PREFIX}`;

export const getPcIpApiUrl = (): string =>
  `http://${API_CONFIG.PC_IP}:${API_CONFIG.PORT}${API_CONFIG.API_PREFIX}`;
