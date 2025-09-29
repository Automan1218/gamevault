"use client";

import React, { useState, useEffect } from 'react';
import { Button, Space, Avatar, Dropdown, Badge, Input, ConfigProvider, theme } from 'antd';
import { 
  SearchOutlined, 
  BellOutlined, 
  ShoppingCartOutlined, 
  HomeOutlined,
  AppstoreOutlined,
  TeamOutlined,
  UserOutlined,
  MenuOutlined,
  LoginOutlined,
  MessageOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { navigationRoutes } from '@/lib/navigation';
import { AuthApi } from '@/lib/api/auth';
import { User } from '@/types/api';
import UserMenu from './UserMenu';
import { darkTheme } from '@/components/common/theme';
import '@/components/common/animations.css';

interface MenubarProps {
  currentPath?: string;
}

function Menubar({ currentPath = '/' }: MenubarProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 检查登录状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const authenticated = AuthApi.isAuthenticated();
        setIsLoggedIn(authenticated);
        
        if (authenticated) {
          const userData = await AuthApi.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('检查认证状态失败:', error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 导航菜单项
  const navItems = [
    { key: 'home', label: '首页', path: navigationRoutes.home, icon: <HomeOutlined />, requireAuth: false },
    { key: 'store', label: '商城', path: '/store', icon: <ShoppingCartOutlined />, requireAuth: false },
    { key: 'forum', label: '论坛', path: navigationRoutes.community, icon: <TeamOutlined />, requireAuth: false },
    { key: 'chat', label: '聊天室', path: '/chat', icon: <MessageOutlined />, requireAuth: true },
    { key: 'developer', label: '开发者', path: '/developer', icon: <CodeOutlined />, requireAuth: true },
  ];

  // 处理导航点击
  const handleNavClick = (item: any) => {
    // 如果菜单项需要登录但用户未登录，跳转到登录页面
    if (item.requireAuth && !isLoggedIn) {
      router.push(navigationRoutes.login);
      return;
    }
    
    // 如果功能开发中，显示提示信息
    if (item.key === 'store' || item.key === 'chat' || item.key === 'developer') {
      // 这里可以添加开发中提示，暂时先跳转
      router.push(item.path);
      return;
    }
    
    router.push(item.path);
  };

  // 处理登录
  const handleLogin = () => {
    router.push(navigationRoutes.login);
  };

  return (
    <ConfigProvider theme={darkTheme}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: `
            linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)
          `,
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        className="animate-slide-in"
      >
        {/* 左侧Logo和导航 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => router.push(navigationRoutes.home)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div
              style={{
                fontSize: '32px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3))',
                animation: 'glow 3s ease-in-out infinite alternate',
              }}
            >
              🎮
            </div>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
              }}
            >
              GameVault
            </span>
          </div>

          {/* 导航菜单 */}
          <Space size="large">
            {navItems.map((item) => (
              <Button
                key={item.key}
                type="text"
                icon={item.icon}
                onClick={() => handleNavClick(item)}
                style={{
                  color: currentPath === item.path ? '#6366f1' : '#d1d5db',
                  fontWeight: currentPath === item.path ? 600 : 500,
                  fontSize: '16px',
                  height: '40px',
                  padding: '0 16px',
                  borderRadius: '12px',
                  background: currentPath === item.path 
                    ? 'rgba(99, 102, 241, 0.1)' 
                    : 'transparent',
                  border: currentPath === item.path 
                    ? '1px solid rgba(99, 102, 241, 0.3)' 
                    : '1px solid transparent',
                  transition: 'all 0.3s ease',
                  opacity: item.requireAuth && !isLoggedIn ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (currentPath !== item.path) {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                    e.currentTarget.style.color = '#e0e7ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPath !== item.path) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = '#d1d5db';
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Space>
        </div>

        {/* 右侧搜索和用户区域 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* 搜索框 */}
          <Input
            placeholder="搜索游戏..."
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            style={{
              width: '280px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(31, 41, 55, 0.8)',
              border: '1px solid rgba(75, 85, 99, 0.4)',
              fontSize: '14px',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
              e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(75, 85, 99, 0.4)';
              e.target.style.boxShadow = 'none';
            }}
          />

          {/* 通知和购物车图标 */}
          {isLoggedIn && (
            <Space size="middle">
              <Badge count={3} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{
                    color: '#d1d5db',
                    fontSize: '18px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(31, 41, 55, 0.5)',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                    e.currentTarget.style.color = '#6366f1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.3)';
                    e.currentTarget.style.color = '#d1d5db';
                  }}
                />
              </Badge>
              <Badge count={2} size="small">
                <Button
                  type="text"
                  icon={<ShoppingCartOutlined />}
                  style={{
                    color: '#d1d5db',
                    fontSize: '18px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(31, 41, 55, 0.5)',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                    e.currentTarget.style.color = '#6366f1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.3)';
                    e.currentTarget.style.color = '#d1d5db';
                  }}
                />
              </Badge>
            </Space>
          )}

          {/* 用户菜单或登录按钮 */}
          {loading ? (
            <div style={{ width: '40px', height: '40px' }} />
          ) : isLoggedIn ? (
            <UserMenu 
              username={user?.username} 
              avatar={user?.profile?.avatar}
            />
          ) : (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={handleLogin}
              style={{
                height: '40px',
                padding: '0 20px',
                fontSize: '16px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
              }}
            >
              登录
            </Button>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
}

export default Menubar;
