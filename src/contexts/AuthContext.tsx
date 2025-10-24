"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthApi } from '@/lib/api/auth';
import { UsersApi } from '@/lib/api/users';
import { User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  refetchUser: () => Promise<void>; // Add alias
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const dynamic = 'force-dynamic';
interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state (optimized version)
  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Check if token exists
      const token = AuthApi.getToken();
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

            const cachedUserInfo = localStorage.getItem('user_info');
            if (cachedUserInfo) {
                try {
                    const cachedUser = JSON.parse(cachedUserInfo);
                    setUser(cachedUser);  // Set cached user info first
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Failed to parse cached user info:', error);
                }
            } else {
                console.log("can not get user");
            }

            // Then verify token and get latest user info
            try {
                const userData = await AuthApi.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
                // Update cache
                localStorage.setItem('user_info', JSON.stringify(userData));
            } catch (error) {
                // Token invalid or expired, clear authentication state
                console.error('Token verification failed, clearing auth state:', error);
                setUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_info');
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_info');
        } finally {
            setIsLoading(false);
        }
    };

  // Login
  const login = (token: string, userData: User) => {
    // Clear old user cache
    UsersApi.clearUserCache();
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_info', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout
  const logout = async () => {
    try {
      await AuthApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user cache
      UsersApi.clearUserCache();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info')
      setUser(null);
      setIsAuthenticated(false);
    }
  };

    // Refresh authentication status
    const refreshAuth = async () => {
        await initializeAuth();
    };

    // refetchUser alias
    const refetchUser = async () => {
        await initializeAuth();
    };

  // Initialize authentication status when component mounts
  useEffect(() => {
    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for localStorage changes (for multi-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        if (e.newValue === null) {
          // Token cleared, logout
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Token set, re-verify
          initializeAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshAuth,
        refetchUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}