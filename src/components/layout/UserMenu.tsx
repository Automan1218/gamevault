"use client";

import React, { useState, useEffect } from 'react';
import { Dropdown, Avatar, Button, Spin } from 'antd';
import { UserOutlined, PlaySquareOutlined, HeartOutlined, TeamOutlined, SettingOutlined, DownOutlined, LogoutOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/navigation';
import { navigationRoutes } from '@/lib/navigation';
import { AuthApi } from '@/lib/api/auth';
import { ProfileApi } from '@/lib/api/profile';
import { User } from '@/types/api';
import { getAvatarUrl, handleAvatarError, getDefaultAvatarStyle, avatarEvents } from '@/lib/api/avatar';

interface UserMenuProps {
  username?: string;
  avatar?: string;
}
export const dynamic = 'force-dynamic';
function UserMenu({ username: propUsername, avatar }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user information and avatar
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if token exists
        if (!AuthApi.isAuthenticated()) {
          setUser(null);
          setAvatarUrl(undefined);
          return;
        }

        // Get basic user information
        const userData = await AuthApi.getCurrentUser();
        setUser(userData);

        // Try to get complete user profile (including avatar)
        try {
          const profile = await ProfileApi.getProfile();
          setAvatarUrl(profile.avatarUrl);
        } catch (profileErr) {
          console.warn('Failed to fetch user profile, using default avatar:', profileErr);
          setAvatarUrl(undefined);
        }
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user info');
        setUser(null);
        setAvatarUrl(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Listen for avatar update events
  useEffect(() => {
    const unsubscribe = avatarEvents.subscribe((newAvatarUrl) => {
      console.log('UserMenu received avatar update event:', newAvatarUrl);
      setAvatarUrl(newAvatarUrl || undefined);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Use fetched user data or props
  const displayUsername = user?.username || propUsername || "User";
  const displayEmail = user?.email || "Email not set";
  const displayAvatar = avatarUrl || avatar;

  // Handle avatar display logic
  const getAvatarSrc = () => {
    if (!displayAvatar) return undefined;
    return getAvatarUrl(displayAvatar);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await AuthApi.logout();
      setUser(null);
      // Navigate to login page
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Clear local state even if API call fails
      setUser(null);
      router.push('/auth/login');
    }
  };

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const { key } = e;
    
    switch (key) {
      case 'profile':
        // Profile page route (temporarily redirect to homepage)
        router.push('/');
        break;
      case 'library':
        router.push(navigationRoutes.library);
        break;
      case 'wishlist':
        // Wishlist page route (temporarily redirect to homepage)
        router.push('/');
        break;
      case 'friends':
        // Friends page route (temporarily redirect to homepage)
        router.push('/');
        break;
      case 'settings':
        // Settings page route
        router.push(navigationRoutes.settings);
        break;
      case 'orders':
        router.push(navigationRoutes.orders);
        break;
      case 'logout':
        // Logout
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
              src={getAvatarSrc()}
              icon={<UserOutlined />}
              onError={() => {
                handleAvatarError(new Error('Avatar failed to load'), true);
                return false;
              }}
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
          Profile
        </span>
      ),
      className: 'user-menu-item',
      style: { 
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
        margin: '2px 8px',
        cursor: 'pointer',
        borderLeft: '3px solid transparent',
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
          Game Library
        </span>
      ),
      className: 'user-menu-item',
      style: { 
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
        margin: '2px 8px',
        cursor: 'pointer',
        borderLeft: '3px solid transparent',
      },
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined style={{ color: '#6366f1', transition: 'color 0.2s ease' }} />,
      label: (
        <span style={{ 
          color: '#ffffff',
          transition: 'color 0.2s ease',
          fontWeight: 500,
        }}>
          My Orders
        </span>
      ),
      className: 'user-menu-item',
      style: { 
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
        margin: '2px 8px',
        cursor: 'pointer',
        borderLeft: '3px solid transparent',
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
          Wishlist
        </span>
      ),
      className: 'user-menu-item',
      style: { 
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
        margin: '2px 8px',
        cursor: 'pointer',
        borderLeft: '3px solid transparent',
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
          Friends
        </span>
      ),
      className: 'user-menu-item',
      style: { 
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
        margin: '2px 8px',
        cursor: 'pointer',
        borderLeft: '3px solid transparent',
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
          Settings
        </span>
      ),
      className: 'user-menu-item',
      style: { 
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
        margin: '2px 8px',
        cursor: 'pointer',
        borderLeft: '3px solid transparent',
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
          Logout
        </span>
      ),
      className: 'user-menu-item logout-item',
      style: { 
        padding: '12px 16px',
        background: 'rgba(31, 41, 55, 0.8)',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
        margin: '2px 8px',
        cursor: 'pointer',
        borderLeft: '3px solid transparent',
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
          height: 40,
          padding: '8px 16px',
          background: 'rgba(31, 41, 55, 0.8)',
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
          src={getAvatarSrc()}
          icon={<UserOutlined />}
          onError={() => {
            handleAvatarError(new Error('Avatar failed to load'), true);
            return false;
          }}
          style={getDefaultAvatarStyle(32)}
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
