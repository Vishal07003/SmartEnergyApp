/**
 * Secure In-Memory and State-Backed Session Storage
 * For storing JWT Access & Refresh Tokens without exposing them in unencrypted logs.
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class SessionStorageManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenListeners: Array<(tokens: AuthTokens | null) => void> = [];

  setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.notifyListeners({ ...tokens });
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.notifyListeners(null);
  }

  isAuthenticated(): boolean {
    return Boolean(this.accessToken);
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

