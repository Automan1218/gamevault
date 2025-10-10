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
  refetchUser: () => Promise<void>; // 添加别名
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化认证状态（优化版本）
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // 检查是否有 token
      const token = AuthApi.getToken();
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // 先设置认证状态为true，避免页面闪烁
      // 实际的token验证会在API调用时通过拦截器处理
      setIsAuthenticated(true);
      
      // 尝试获取用户信息，但不阻塞页面加载
      try {
        const userData = await AuthApi.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.warn('获取用户信息失败，将在API调用时重新验证:', error);
        // 不立即清除认证状态，让拦截器处理
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  // 登录
  const login = (token: string, userData: User) => {
    // 清除旧用户的缓存
    UsersApi.clearUserCache();
    localStorage.setItem('auth_token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  // 登出
  const logout = async () => {
    try {
      await AuthApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 清除用户缓存
      UsersApi.clearUserCache();
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // 刷新认证状态
  const refreshAuth = async () => {
    await initializeAuth();
  };

  // refetchUser别名，用于向后兼容
  const refetchUser = async () => {
    await initializeAuth();
  };

  // 组件挂载时初始化认证状态
  useEffect(() => {
    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 监听 localStorage 变化（用于多标签页同步）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        if (e.newValue === null) {
          // Token 被清除，登出
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Token 被设置，重新验证
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
