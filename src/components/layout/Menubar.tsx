"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button, Space, Dropdown, Badge, Input, ConfigProvider } from 'antd';
import {
  SearchOutlined, 
  BellOutlined, 
  ShoppingCartOutlined, 
  HomeOutlined,
  TeamOutlined,
  LoginOutlined,
  MessageOutlined,
  CodeOutlined,
  FileTextOutlined,
  CommentOutlined,
  UserOutlined,
  AppstoreOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { getLoginRedirectUrl, navigationRoutes } from '@/lib/navigation';
import { AuthApi } from '@/lib/api/auth';
import { User } from '@/types/api';
import UserMenu from './UserMenu';
import { darkTheme } from '@/components/common/theme';
import { useCart } from '@/contexts/CartContext';
import '@/components/common/animations.css';

interface MenubarProps {
  currentPath?: string;
}

type DropdownNavItem = {
  key: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  requireAuth: boolean;
};

type NavItem = DropdownNavItem & {
  hasDropdown?: boolean;
  dropdownItems?: DropdownNavItem[];
};
export const dynamic = 'force-dynamic';
function Menubar({ currentPath = '/' }: MenubarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Get cart information
  const { cart } = useCart();
  const cartItemCount = cart?.cartItems?.length || 0;

  const resolvedCurrentPath = useMemo(() => {
    const nextPath = pathname || currentPath;
    if (!searchParams) {
      return nextPath;
    }

    const queryString = searchParams.toString();
    return queryString ? `${nextPath}?${queryString}` : nextPath;
  }, [pathname, searchParams, currentPath]);

  // Check login status
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
        console.error('Failed to check authentication status:', error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
        setMounted(true);
      }
    };

    checkAuthStatus();
  }, []);

  // Check if path matches (supports sub-path matching)
  const isPathActive = (itemPath: string, currentPath: string) => {
    // If exact match
    if (currentPath === itemPath) return true;
    
    // If homepage, only exact match counts
    if (itemPath === '/') return false;
    
    // If current path is a sub-path of this menu item
    return currentPath.startsWith(itemPath + '/');
  };

  // Navigation menu items
  const navItems: NavItem[] = [
    { key: 'home', label: 'Home', path: navigationRoutes.home, icon: <HomeOutlined />, requireAuth: false },
    { key: 'store', label: 'Store', path: navigationRoutes.shopping, icon: <ShoppingCartOutlined />, requireAuth: false },
    {
      key: 'forum', 
      label: 'Forum', 
      path: navigationRoutes.forum,
      icon: <TeamOutlined />,
      requireAuth: false,
      hasDropdown: true,
      dropdownItems: [
        { 
          key: 'forum-home', 
          label: 'Forum Home', 
          path: navigationRoutes.forum,
          icon: <CommentOutlined />,
          requireAuth: false 
        },
        { 
          key: 'my-posts', 
          label: 'My Posts', 
          path: navigationRoutes.myPosts, 
          icon: <FileTextOutlined />,
          requireAuth: true 
        },
      ]
    },
    { key: 'chat', label: 'Chat', path: '/dashboard/chat', icon: <MessageOutlined />, requireAuth: true },
    {
      key: 'developer', 
      label: 'Developer', 
      path: navigationRoutes.developer,
      icon: <CodeOutlined />,
      requireAuth: true,
      hasDropdown: true,
      dropdownItems: [
        { 
          key: 'developer-profile', 
          label: 'Profile', 
          path: navigationRoutes.developerProfile,
          icon: <UserOutlined />,
          requireAuth: true 
        },
        { 
          key: 'developer-mygames', 
          label: 'My Games', 
          path: navigationRoutes.developerMyGames, 
          icon: <AppstoreOutlined />,
          requireAuth: true 
        },
        { 
          key: 'developer-gamehub', 
          label: 'GameHub', 
          path: navigationRoutes.developerGameHub, 
          icon: <RocketOutlined />,
          requireAuth: true 
        },
      ]
    },
  ];

  // Handle navigation click
  const handleNavClick = (item: NavItem) => {
    // If menu item requires login but user is not logged in, redirect to login page
    if (item.requireAuth && !isLoggedIn) {
      router.push(getLoginRedirectUrl(item.path));
      return;
    }
    
    router.push(item.path);
  };

  // Handle cart click
  const handleCartClick = () => {
    if (!isLoggedIn) {
      router.push(getLoginRedirectUrl(navigationRoutes.cart));
      return;
    }
    router.push(navigationRoutes.cart);
  };

  // Handle notification click
  const handleNotificationClick = () => {
    router.push(navigationRoutes.notifications);
  };

  // Handle login
  const handleLogin = () => {
    router.push(getLoginRedirectUrl(resolvedCurrentPath));
  };

  // Search input state and submission (first version implementation)
  const [searchValue, setSearchValue] = useState<string>("");
  const handleSearchSubmit = () => {
    const q = searchValue.trim();
    if (q) {
      router.push(`${navigationRoutes.shopping}?q=${encodeURIComponent(q)}`);
    } else {
      router.push(navigationRoutes.shopping);
    }
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
        {/* Left side Logo and navigation */}
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

          {/* Navigation menu */}
          <Space size="large">
            {navItems.map((item) => {
              // If has dropdown menu
              if (item.hasDropdown && item.dropdownItems) {
                const filteredItems = mounted ? item.dropdownItems.filter(dropItem => !dropItem.requireAuth || isLoggedIn) : [];
                
                // If no menu items after filtering, show as regular button
                if (filteredItems.length === 0) {
                  return (
                    <Button
                      key={item.key}
                      type="text"
                      icon={item.icon}
                      onClick={() => handleNavClick(item)}
                      style={{
                        color: mounted && isPathActive(item.path, currentPath) ? '#6366f1' : '#d1d5db',
                        fontWeight: mounted && isPathActive(item.path, currentPath) ? 600 : 500,
                        fontSize: '16px',
                        height: '40px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        background: mounted && isPathActive(item.path, currentPath) 
                          ? 'rgba(99, 102, 241, 0.1)' 
                          : 'transparent',
                        border: mounted && isPathActive(item.path, currentPath) 
                          ? '1px solid rgba(99, 102, 241, 0.3)' 
                          : '1px solid transparent',
                        transition: 'all 0.3s ease',
                        opacity: item.requireAuth && mounted && !isLoggedIn ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (mounted && !isPathActive(item.path, currentPath)) {
                          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                          e.currentTarget.style.color = '#e0e7ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (mounted && !isPathActive(item.path, currentPath)) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.color = '#d1d5db';
                        }
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                }
                
                const dropdownMenuItems = filteredItems.map((dropItem, index) => {
                  const menuItem = {
                    key: dropItem.key,
                    label: (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {dropItem.icon}
                        {dropItem.label}
                      </span>
                    ),
                    onClick: () => router.push(dropItem.path),
                  };
                  
                  // Add divider for Developer menu: after the first menu item
                  if (item.key === 'developer' && index === 0 && filteredItems.length > 1) {
                    return [menuItem, { type: 'divider' as const, key: `divider-${index}` }];
                  }
                  
                  // Add divider for Developer menu after My Games
                  if (item.key === 'developer' && dropItem.key === 'developer-mygames' && filteredItems.length > 2) {
                    return [menuItem, { type: 'divider' as const, key: `divider-${index}` }];
                  }
                  
                  // Add divider for Forum menu: after the first menu item (if user is logged in)
                  if (item.key === 'forum' && index === 0 && filteredItems.length > 1 && isLoggedIn) {
                    return [menuItem, { type: 'divider' as const, key: `divider-${index}` }];
                  }
                  
                  return menuItem;
                }).flat();

                return (
                  <Dropdown
                    key={item.key}
                    menu={{ 
                      items: dropdownMenuItems,
                      style: {
                        background: 'rgba(31, 41, 55, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '12px',
                        padding: '8px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        minWidth: '160px',
                      }
                    }}
                    placement="bottom"
                    trigger={['hover']}
                    overlayClassName="forum-dropdown"
                  >
                    <Button
                      type="text"
                      icon={item.icon}
                      onClick={() => handleNavClick(item)}
                      style={{
                        color: isPathActive(item.path, currentPath) ? '#6366f1' : '#d1d5db',
                        fontWeight: isPathActive(item.path, currentPath) ? 600 : 500,
                        fontSize: '16px',
                        height: '40px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        background: isPathActive(item.path, currentPath) 
                          ? 'rgba(99, 102, 241, 0.1)' 
                          : 'transparent',
                        border: isPathActive(item.path, currentPath) 
                          ? '1px solid rgba(99, 102, 241, 0.3)' 
                          : '1px solid transparent',
                        transition: 'all 0.3s ease',
                        opacity: item.requireAuth && !isLoggedIn ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (mounted && !isPathActive(item.path, currentPath)) {
                          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                          e.currentTarget.style.color = '#e0e7ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (mounted && !isPathActive(item.path, currentPath)) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.color = '#d1d5db';
                        }
                      }}
                    >
                      {item.label}
                    </Button>
                  </Dropdown>
                );
              }

              // Regular button
              return (
                <Button
                  key={item.key}
                  type="text"
                  icon={item.icon}
                  onClick={() => handleNavClick(item)}
                  style={{
                    color: isPathActive(item.path, currentPath) ? '#6366f1' : '#d1d5db',
                    fontWeight: isPathActive(item.path, currentPath) ? 600 : 500,
                    fontSize: '16px',
                    height: '40px',
                    padding: '0 16px',
                    borderRadius: '12px',
                    background: isPathActive(item.path, currentPath) 
                      ? 'rgba(99, 102, 241, 0.1)' 
                      : 'transparent',
                    border: isPathActive(item.path, currentPath) 
                      ? '1px solid rgba(99, 102, 241, 0.3)' 
                      : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    opacity: item.requireAuth && !isLoggedIn ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isPathActive(item.path, currentPath)) {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                      e.currentTarget.style.color = '#e0e7ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPathActive(item.path, currentPath)) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.color = '#d1d5db';
                    }
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Space>
        </div>

        {/* Right side search and user area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Search box */}
          <Input
            placeholder="Search games..."
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
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleSearchSubmit}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
              e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(75, 85, 99, 0.4)';
              e.target.style.boxShadow = 'none';
            }}
          />

          {/* Notification and cart icons */}
          {isLoggedIn && (
            <Space size="middle">
              <Badge count={3} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  onClick={handleNotificationClick}
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
              <Badge count={cartItemCount} size="small" showZero={false}>
                <Button
                  type="text"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleCartClick}
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
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.3)';
                    e.currentTarget.style.color = '#d1d5db';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              </Badge>
            </Space>
          )}

          {/* User menu or login button */}
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
              Login
            </Button>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
}

export default Menubar;