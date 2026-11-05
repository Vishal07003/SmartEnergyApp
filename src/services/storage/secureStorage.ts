import { NativeModules, Platform } from 'react-native';

const { SecureStorage } = NativeModules;

// In-memory fallback for platforms or test environments where native module is unavailable
const memoryFallback = new Map<string, string>();

export const secureStorage = {
  async setItem(key: string, value: string): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && SecureStorage && typeof SecureStorage.setItem === 'function') {
        return await SecureStorage.setItem(key, value);
      }
      memoryFallback.set(key, value);
      return true;
    } catch {
      memoryFallback.set(key, value);
      return false;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'android' && SecureStorage && typeof SecureStorage.getItem === 'function') {
        const val = await SecureStorage.getItem(key);
        return val ?? null;
      }
      return memoryFallback.get(key) ?? null;
    } catch {
      return memoryFallback.get(key) ?? null;
    }
  },

  async removeItem(key: string): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && SecureStorage && typeof SecureStorage.removeItem === 'function') {
        return await SecureStorage.removeItem(key);
      }
      memoryFallback.delete(key);
      return true;
    } catch {
      memoryFallback.delete(key);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && SecureStorage && typeof SecureStorage.clear === 'function') {
        return await SecureStorage.clear();
      }
      memoryFallback.clear();
      return true;
    } catch {
      memoryFallback.clear();
      return false;
    }
  },
};

