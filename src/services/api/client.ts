import { getBaseApiUrl, API_CONFIG } from './config';
import { sessionStorage } from './session';

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  [key: string]: any;
}

export class ApiError extends Error {
  status: number;
  data: ApiErrorResponse;

  constructor(status: number, message: string, data: ApiErrorResponse = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string | null) => void> = [];

  private subscribeTokenRefresh(cb: (token: string | null) => void) {
    this.refreshSubscribers.push(cb);
  }

  private onRefreshed(token: string | null) {
    this.refreshSubscribers.forEach(cb => cb(token));
    this.refreshSubscribers = [];
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, params, ...customConfig } = options;
    const baseUrl = getBaseApiUrl();

    let fullUrl = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(customConfig.headers as Record<string, string>),
    };

    if (requiresAuth) {
      const token = sessionStorage.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

    try {
      const response = await fetch(fullUrl, {
        ...customConfig,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 401 Unauthorized handling & automatic token refresh
      if (response.status === 401 && requiresAuth) {
        const refreshedToken = await this.handleTokenRefresh();
        if (refreshedToken) {
          headers['Authorization'] = `Bearer ${refreshedToken}`;
          const retryResponse = await fetch(fullUrl, {
            ...customConfig,
            headers,
          });
          return await this.handleResponse<T>(retryResponse);
        } else {
          sessionStorage.clearTokens();
          throw new ApiError(401, 'Session expired. Please log in again.');
        }
      }

      return await this.handleResponse<T>(response);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new ApiError(408, 'Request timed out. Please check your network connection.');
      }
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(0, err.message || 'Network request failed. Is the Django server running?');
    }
  }

  private async handleTokenRefresh(): Promise<string | null> {
    const refreshToken = sessionStorage.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    if (this.isRefreshing) {
      return new Promise<string | null>(resolve => {
        this.subscribeTokenRefresh(token => resolve(token));
      });
    }

    this.isRefreshing = true;

    try {
      const baseUrl = getBaseApiUrl();
      const res = await fetch(`${baseUrl}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!res.ok) {
        this.onRefreshed(null);
        return null;
      }

      const data = await res.json();
      const newAccessToken = data.access;
      sessionStorage.setTokens({
        accessToken: newAccessToken,
        refreshToken: data.refresh || refreshToken,
      });

      this.onRefreshed(newAccessToken);
      return newAccessToken;
    } catch {
      this.onRefreshed(null);
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    let data: any = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { detail: text };
      }
    }

    if (!response.ok) {
      const message =
        data.detail ||
        data.message ||
        (Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : null) ||
        `HTTP Error ${response.status}`;
      throw new ApiError(response.status, message, data);
    }

    return data as T;
  }
}

export const apiClient = new ApiClient();

