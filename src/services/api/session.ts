/**
 * Secure Keystore-Backed Session Storage
 * Persists JWT Access & Refresh Tokens, and cached user profile across app restarts and phone reboots.
 */

import { secureStorage } from '../storage/secureStorage';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const STORAGE_KEY_ACCESS = 'auth_access_token';
const STORAGE_KEY_REFRESH = 'auth_refresh_token';
const STORAGE_KEY_USER = 'auth_cached_user';

class SessionStorageManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private cachedUserJson: string | null = null;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private tokenListeners: Array<(tokens: AuthTokens | null) => void> = [];

  /**
   * Initializes session from Android Keystore / secure hardware-backed storage.
   * Ensures idempotency: multiple calls share the same initialization promise.
   */
  async loadTokens(): Promise<AuthTokens | null> {
    if (this.isLoaded) {
      if (this.accessToken && this.refreshToken) {
        return { accessToken: this.accessToken, refreshToken: this.refreshToken };
      }
      return null;
    }

    if (this.loadPromise) {
      await this.loadPromise;
      if (this.accessToken && this.refreshToken) {
        return { accessToken: this.accessToken, refreshToken: this.refreshToken };
      }
      return null;
    }

    this.loadPromise = (async () => {
      try {
        const [access, refresh, user] = await Promise.all([
          secureStorage.getItem(STORAGE_KEY_ACCESS),
          secureStorage.getItem(STORAGE_KEY_REFRESH),
          secureStorage.getItem(STORAGE_KEY_USER),
        ]);

        this.accessToken = access;
        this.refreshToken = refresh;
        this.cachedUserJson = user;
        this.isLoaded = true;

        if (this.accessToken && this.refreshToken) {
          this.notifyListeners({ accessToken: this.accessToken, refreshToken: this.refreshToken });
        }
      } catch {
        this.isLoaded = true;
      } finally {
        this.loadPromise = null;
      }
    })();

    await this.loadPromise;
    if (this.accessToken && this.refreshToken) {
      return { accessToken: this.accessToken, refreshToken: this.refreshToken };
    }
    return null;
  }

  async setTokens(tokens: AuthTokens): Promise<void> {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.isLoaded = true;

    // Persist securely to Keystore-backed storage
    await Promise.all([
      secureStorage.setItem(STORAGE_KEY_ACCESS, tokens.accessToken),
      secureStorage.setItem(STORAGE_KEY_REFRESH, tokens.refreshToken),
    ]);

    this.notifyListeners({ ...tokens });
  }

  async setCachedUser(userData: any): Promise<void> {
    try {
      const json = JSON.stringify(userData);
      this.cachedUserJson = json;
      await secureStorage.setItem(STORAGE_KEY_USER, json);
    } catch {
      // Non-fatal
    }
  }

  getCachedUser<T = any>(): T | null {
    if (!this.cachedUserJson) return null;
    try {
      return JSON.parse(this.cachedUserJson) as T;
    } catch {
      return null;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    this.cachedUserJson = null;
    this.isLoaded = true;

    await Promise.all([
      secureStorage.removeItem(STORAGE_KEY_ACCESS),
      secureStorage.removeItem(STORAGE_KEY_REFRESH),
      secureStorage.removeItem(STORAGE_KEY_USER),
    ]);

    this.notifyListeners(null);
  }

  isAuthenticated(): boolean {
    return Boolean(this.accessToken || this.refreshToken);
  }

  subscribe(listener: (tokens: AuthTokens | null) => void): () => void {
    this.tokenListeners.push(listener);
    return () => {
      this.tokenListeners = this.tokenListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(tokens: AuthTokens | null) {
    this.tokenListeners.forEach(listener => {
      try {
        listener(tokens);
      } catch {
        // Suppress listener errors
      }
    });
  }
}

export const sessionStorage = new SessionStorageManager();
