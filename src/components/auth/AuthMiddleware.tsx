// src/components/auth/AuthMiddleware.tsx
"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthMiddlewareProps {
  children: React.ReactNode;
}

// 需要认证的页面路径
const PROTECTED_ROUTES = [
  '/dashboard/library',
  '/dashboard/orders',
  '/dashboard/settings',
  '/dashboard/chat',
  '/dashboard/developer',
];

// 不需要认证的页面路径
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/',
];

export function AuthMiddleware({ children }: AuthMiddlewareProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 如果还在加载中，不进行路由检查
    if (isLoading) {
      return;
    }

    // 检查当前路径是否需要认证
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname.startsWith(route)
    );
    
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname.startsWith(route)
    );

    // 如果是受保护的页面且用户未认证，重定向到登录页
    if (isProtectedRoute && !isAuthenticated) {
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?redirect=${redirectUrl}`);
      return;
    }

    // 如果用户已认证且访问登录页，重定向到首页或之前的页面
    if (isAuthenticated && pathname.startsWith('/auth/login')) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      router.push(redirect || '/dashboard/library');
      return;
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // 如果还在加载中，显示加载状态
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div>正在验证身份...</div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
