"use client";

import React, { useState, useEffect } from 'react';
import { Dropdown, Avatar, Button, Spin } from 'antd';
import { UserOutlined, PlaySquareOutlined, HeartOutlined, TeamOutlined, SettingOutlined, DownOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/navigation';
import { navigationRoutes } from '@/lib/navigation';
import { AuthApi } from '@/lib/api/auth';
import { User } from '@/types/api';

interface UserMenuProps {
  username?: string;
  avatar?: string;
}

function UserMenu({ username: propUsername, avatar }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取当前用户信息
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 检查是否有token
        if (!AuthApi.isAuthenticated()) {
          setUser(null);
          return;
        }

        const userData = await AuthApi.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('获取用户信息失败:', err);
        setError(err instanceof Error ? err.message : '获取用户信息失败');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // 使用获取到的用户数据或props
  const displayUsername = user?.username || propUsername || "用户";
  const displayEmail = user?.email || "未设置邮箱";
  const displayAvatar = user?.profile?.avatar || avatar;

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await AuthApi.logout();
      setUser(null);
      // 跳转到登录页面
      router.push('/auth/login');
    } catch (err) {
      console.error('退出登录失败:', err);
      // 即使API调用失败，也要清除本地状态
      setUser(null);
      router.push('/auth/login');
    }
  };

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const { key } = e;
    
    switch (key) {
      case 'profile':
        // 个人资料页面路由（暂时跳转到首页）
        router.push('/');
        break;
      case 'library':
        router.push(navigationRoutes.library);
        break;
      case 'wishlist':
        // 愿望单页面路由（暂时跳转到首页）
        router.push('/');
        break;
      case 'friends':
        // 好友页面路由（暂时跳转到首页）
        router.push('/');
        break;
      case 'settings':
        // 设置页面路由
        router.push('/settings');
        break;
      case 'logout':
        // 退出登录
        handleLogout();
        break;
      default:
        break;
    }
    
    setOpen(false);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(31, 41, 55, 0.8)',
          cursor: 'default',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar 
              size={40} 
              src={displayAvatar}
              icon={<UserOutlined />}
              style={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            />
            <div>
              <div style={{ 
                color: '#ffffff', 
                fontWeight: 600, 
                fontSize: '16px',
                marginBottom: 2,
              }}>
                {displayUsername}
              </div>
              <div style={{ 
                color: '#9ca3af', 
                fontSize: '14px',
              }}>
                {displayEmail}
              </div>
            </div>
          </div>
        </div>
      ),
      disabled: true,
      style: {
        cursor: 'default',
        pointerEvents: 'none',
      },
    },
    {
      key: 'profile',
      icon: <UserOutlined style={{ color: '#6366f1', transition: 'color 0.2s ease' }} />,
      label: (
        <span style={{ 
          color: '#ffffff',
          transition: 'color 0.2s ease',
          fontWeight: 500,
        }}>
          个人资料
        </span>
      ),
      style: { 
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
        margin: '2px 8px',
        cursor: 'pointer',
      },
      onMouseEnter: (e) => {
        const target = e.domEvent.currentTarget as HTMLElement;
        target.style.background = 'rgba(99, 102, 241, 0.2)';
        target.style.borderLeft = '3px solid #6366f1';
        const icon = target.querySelector('.anticon') as HTMLElement;
        const label = target.querySelector('span') as HTMLElement;
        if (icon) icon.style.color = '#8b5cf6';
        if (label) label.style.color = '#e0e7ff';
      },
      onMouseLeave: (e) => {
        const target = e.domEvent.currentTarget as HTMLElement;
        target.style.background = 'rgba(31, 41, 55, 0.8)';
        target.style.borderLeft = '3px solid transparent';
        const icon = target.querySelector('.anticon') as HTMLElement;
        const label = target.querySelector('span') as HTMLElement;
        if (icon) icon.style.color = '#6366f1';
        if (label) label.style.color = '#ffffff';
      },
    },
    {
      key: 'library',
      icon: <PlaySquareOutlined style={{ color: '#6366f1', transition: 'color 0.2s ease' }} />,
      label: (
        <span style={{ 
          color: '#ffffff',
          transition: 'color 0.2s ease',
          fontWeight: 500,
        }}>
          游戏库
        </span>
      ),
      style: { 
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
        margin: '2px 8px',
        cursor: 'pointer',
      },
      onMouseEnter: (e) => {
        const target = e.domEvent.currentTarget as HTMLElement;
        target.style.background = 'rgba(99, 102, 241, 0.2)';
        target.style.borderLeft = '3px solid #6366f1';
        const icon = target.querySelector('.anticon') as HTMLElement;
        const label = target.querySelector('span') as HTMLElement;
        if (icon) icon.style.color = '#8b5cf6';
        if (label) label.style.color = '#e0e7ff';
      },
      onMouseLeave: (e) => {
        const target = e.domEvent.currentTarget as HTMLElement;
        target.style.background = 'rgba(31, 41, 55, 0.8)';
        target.style.borderLeft = '3px solid transparent';
        const icon = target.querySelector('.anticon') as HTMLElement;
        const label = target.querySelector('span') as HTMLElement;
        if (icon) icon.style.color = '#6366f1';
        if (label) label.style.color = '#ffffff';
      },
    },
    {
      key: 'wishlist',
      icon: <HeartOutlined style={{ color: '#6366f1', transition: 'color 0.2s ease' }} />,
      label: (
        <span style={{ 
          color: '#ffffff',
          transition: 'color 0.2s ease',
          fontWeight: 500,
        }}>
          愿望单
        </span>
      ),
      style: { 
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
        margin: '2px 8px',
        cursor: 'pointer',
      },
      onMouseEnter: (e) => {
        const target = e.domEvent.currentTarget as HTMLElement;
        target.style.background = 'rgba(99, 102, 241, 0.2)';
        target.style.borderLeft = '3px solid #6366f1';
        const icon = target.querySelector('.anticon') as HTMLElement;
        const label = target.querySelector('span') as HTMLElement;
        if (icon) icon.style.color = '#8b5cf6';
        if (label) label.style.color = '#e0e7ff';
      },
      onMouseLeave: (e) => {
        const target = e.domEvent.currentTarget as HTMLElement;
        target.style.background = 'rgba(31, 41, 55, 0.8)';
        target.style.borderLeft = '3px solid transparent';
        const icon = target.querySelector('.anticon') as HTMLElement;
        const label = target.querySelector('span') as HTMLElement;
        if (icon) icon.style.color = '#6366f1';
        if (label) label.style.color = '#ffffff';
      },
    },
    {
      key: 'friends',
      icon: <TeamOutlined style={{ color: '#6366f1', transition: 'color 0.2s ease' }} />,
      label: (
        <span style={{ 
          color: '#ffffff',
          transition: 'color 0.2s ease',
          fontWeight: 500,
        }}>
          好友
        </span>
      ),
      style: { 
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
        margin: '2px 8px',
        cursor: 'pointer',
      },
      onMouseEnter: (e) => {
        const target = e.domEvent.currentTarget as HTMLElement;
        target.style.background = 'rgba(99, 102, 241, 0.2)';
        target.style.borderLeft = '3px solid #6366f1';
        const icon = target.querySelector('.anticon') as HTMLElement;
        const label = target.querySelector('span') as HTMLElement;
        if (icon) icon.style.color = '#8b5cf6';
        if (label) label.style.color = '#e0e7ff';
      },
      onMouseLeave: (e) => {
        const target = e.domEvent.currentTarget as HTMLElement;
        target.style.background = 'rgba(31, 41, 55, 0.8)';
        target.style.borderLeft = '3px solid transparent';
        const icon = target.querySelector('.anticon') as HTMLElement;
        const label = target.querySelector('span') as HTMLElement;
        if (icon) icon.style.color = '#6366f1';
        if (label) label.style.color = '#ffffff';
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined style={{ color: '#6366f1', transition: 'color 0.2s ease' }} />,
      label: (
        <span style={{ 
          color: '#ffffff',
          transition: 'color 0.2s ease',
          fontWeight: 500,
        }}>
          设置
        </span>
      ),
      style: { 
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
        margin: '2px 8px',
        cursor: 'pointer',
      },
      onMouseEnter: (e) => {
        const target = e.domEvent.currentTarget as HTMLElement;
        target.style.background = 'rgba(99, 102, 241, 0.2)';
        target.style.borderLeft = '3px solid #6366f1';
        const icon = target.querySelector('.anticon') as HTMLElement;
        const label = target.querySelector('span') as HTMLElement;
        if (icon) icon.style.color = '#8b5cf6';
        if (label) label.style.color = '#e0e7ff';
      },
      onMouseLeave: (e) => {
        const target = e.domEvent.currentTarget as HTMLElement;
        target.style.background = 'rgba(31, 41, 55, 0.8)';
        target.style.borderLeft = '3px solid transparent';
        const icon = target.querySelector('.anticon') as HTMLElement;
        const label = target.querySelector('span') as HTMLElement;
        if (icon) icon.style.color = '#6366f1';
        if (label) label.style.color = '#ffffff';
      },
    },
    {
      type: 'divider',
      style: {
        background: 'rgba(255, 255, 255, 0.1)',
        margin: '8px 0',
      },
    },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: '#ef4444', transition: 'color 0.2s ease' }} />,
      label: (
        <span style={{ 
          color: '#ef4444',
          transition: 'color 0.2s ease',
          fontWeight: 500,
        }}>
          退出登录
        </span>
      ),
      style: { 
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
        margin: '2px 8px',
        cursor: 'pointer',
      },
      onMouseEnter: (e) => {
        const target = e.domEvent.currentTarget as HTMLElement;
        target.style.background = 'rgba(239, 68, 68, 0.2)';
        target.style.borderLeft = '3px solid #ef4444';
        const icon = target.querySelector('.anticon') as HTMLElement;
        const label = target.querySelector('span') as HTMLElement;
        if (icon) icon.style.color = '#fca5a5';
        if (label) label.style.color = '#fecaca';
      },
      onMouseLeave: (e) => {
        const target = e.domEvent.currentTarget as HTMLElement;
        target.style.background = 'rgba(31, 41, 55, 0.8)';
        target.style.borderLeft = '3px solid transparent';
        const icon = target.querySelector('.anticon') as HTMLElement;
        const label = target.querySelector('span') as HTMLElement;
        if (icon) icon.style.color = '#ef4444';
        if (label) label.style.color = '#ef4444';
      },
    },
  ];

  return (
    <Dropdown
      menu={{ 
        items: menuItems, 
        onClick: handleMenuClick,
        style: {
          background: 'rgba(31, 41, 55, 0.95)',
          borderRadius: '12px',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
        }
      }}
      trigger={['hover']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Button
        type="text"
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          height: 48,
          padding: '8px 16px',
          background: 'rgba(31, 41, 55, 0.9)',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(31, 41, 55, 1)';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(31, 41, 55, 0.9)';
          e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.3)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        }}
      >
        <Avatar 
          size={32} 
          src={displayAvatar}
          icon={<UserOutlined />}
          style={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
          }}
        />
        <span style={{ 
          color: '#ffffff', 
          fontWeight: 500,
          fontSize: '14px',
        }}>
          {loading ? (
            <Spin size="small" style={{ color: '#ffffff' }} />
          ) : (
            displayUsername
          )}
        </span>
        <DownOutlined style={{ 
          color: '#9ca3af', 
          fontSize: '12px',
          transition: 'transform 0.3s ease',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }} />
      </Button>
    </Dropdown>
  );
}

export default UserMenu;
