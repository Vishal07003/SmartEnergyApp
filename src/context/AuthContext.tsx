import React, { createContext, useContext, useState, useEffect } from 'react';
import { StaffUser } from '../types';
import { liveApi } from '../services/api';
import { sessionStorage } from '../services/api/session';
import { ApiError } from '../services/api/client';

interface AuthContextType {
  user: StaffUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<void>;
  register: (payload: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    try {
      // 1. Restore stored JWT tokens from Android Keystore / hardware-backed storage
      const tokens = await sessionStorage.loadTokens();
      
      // 2. Load cached user profile immediately for instant offline session restoration
      const cachedUser = sessionStorage.getCachedUser<StaffUser>();
      if (cachedUser) {
        setUser(cachedUser);
      }

      // 3. If tokens exist, synchronize latest profile from backend
      if (tokens) {
        try {
          const profile = await liveApi.getStaffProfile();
          setUser(profile);
          await sessionStorage.setCachedUser(profile);
        } catch (fetchErr: any) {
          // If 401 Unauthorized or 403 Forbidden, token is genuinely invalid or revoked
          if (fetchErr instanceof ApiError && (fetchErr.status === 401 || fetchErr.status === 403)) {
            await sessionStorage.clearTokens();
            setUser(null);
          } else {
            // For network errors (status 0), timeouts (status 408), or server 5xx:
            // RETAIN THE SESSION AND CACHED USER. Do NOT clear tokens!
            if (!cachedUser && sessionStorage.isAuthenticated()) {
              // Create minimal fallback user placeholder if no cached user exists yet
              const minimalUser: StaffUser = {
                id: 'offline-user',
                name: 'Authenticated User',
                email: '',
                phoneNumber: '',
                employeeId: '',
                department: '',
                role: 'staff',
                assignedBlock: '',
                notificationsEnabled: true,
                alertPushEnabled: true,
                createdAt: new Date().toISOString(),
              };
              setUser(minimalUser);
            }
          }
        }
      }
    } catch {
      // Storage read error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (username: string, pass: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await liveApi.login(username, pass);
      setUser(loggedInUser);
      await sessionStorage.setCachedUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) => {
    setIsLoading(true);
    try {
      const registeredUser = await liveApi.register(payload);
      setUser(registeredUser);
      await sessionStorage.setCachedUser(registeredUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await liveApi.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await liveApi.getStaffProfile();
      setUser(profile);
      await sessionStorage.setCachedUser(profile);
    } catch {
      // Ignored for temporary errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
