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

            const cachedUserInfo = localStorage.getItem('user_info');
            if (cachedUserInfo) {
                try {
                    const cachedUser = JSON.parse(cachedUserInfo);
                    setUser(cachedUser);  // 先设置缓存的用户信息
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('解析缓存用户信息失败:', error);
                }
            } else {
                console.log("can not get user");
            }

            // 然后验证 token 并获取最新用户信息
            try {
                const userData = await AuthApi.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
                // 更新缓存
                localStorage.setItem('user_info', JSON.stringify(userData));
            } catch (error) {
                // Token 无效或过期，清除认证状态
                console.error('Token 验证失败，清除认证状态:', error);
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

  // 登录
  const login = (token: string, userData: User) => {
    // 清除旧用户的缓存
    UsersApi.clearUserCache();
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_info', JSON.stringify(userData));
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
      localStorage.removeItem('user_info')
      setUser(null);
      setIsAuthenticated(false);
    }
  };

    // 刷新认证状态
    const refreshAuth = async () => {
        await initializeAuth();
    };

    // refetchUser别名
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