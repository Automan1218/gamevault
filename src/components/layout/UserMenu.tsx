"use client";

import React, { useState } from 'react';
import { Dropdown, Avatar, Button } from 'antd';
import { UserOutlined, PlaySquareOutlined, HeartOutlined, TeamOutlined, SettingOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/navigation';
import { navigationRoutes } from '@/lib/navigation';

interface UserMenuProps {
  username?: string;
  avatar?: string;
}

function UserMenu({ username = "DawnZYC", avatar }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
        // 设置页面路由（暂时跳转到首页）
        router.push('/');
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
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar 
              size={40} 
              src={avatar}
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
                {username}
              </div>
              <div style={{ 
                color: '#9ca3af', 
                fontSize: '14px',
              }}>
                Your personal account
              </div>
            </div>
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      key: 'profile',
      icon: <UserOutlined style={{ color: '#6366f1' }} />,
      label: '个人资料',
      style: { 
        color: '#ffffff',
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
      },
    },
    {
      key: 'library',
      icon: <PlaySquareOutlined style={{ color: '#6366f1' }} />,
      label: '游戏库',
      style: { 
        color: '#ffffff',
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
      },
    },
    {
      key: 'wishlist',
      icon: <HeartOutlined style={{ color: '#6366f1' }} />,
      label: '愿望单',
      style: { 
        color: '#ffffff',
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
      },
    },
    {
      key: 'friends',
      icon: <TeamOutlined style={{ color: '#6366f1' }} />,
      label: '好友',
      style: { 
        color: '#ffffff',
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined style={{ color: '#6366f1' }} />,
      label: '设置',
      style: { 
        color: '#ffffff',
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
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
          src={avatar}
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
          {username}
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
