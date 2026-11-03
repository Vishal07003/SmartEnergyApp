import React, { createContext, useContext, useState, useEffect } from 'react';
import { StaffUser } from '../types';
import { liveApi } from '../services/api';
import { sessionStorage } from '../services/api/session';

interface AuthContextType {
  user: StaffUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    try {
      if (sessionStorage.isAuthenticated()) {
        const profile = await liveApi.getStaffProfile();
        setUser(profile);
      }
    } catch {
      sessionStorage.clearTokens();
      setUser(null);
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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await liveApi.logout();
    } finally {
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await liveApi.getStaffProfile();
      setUser(profile);
    } catch {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
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

