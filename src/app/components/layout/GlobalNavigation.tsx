'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button, Space } from 'antd';
import { navigationRoutes } from '@/lib/navigation';

interface GlobalNavigationProps {
    style?: React.CSSProperties;
    className?: string;
}
export const dynamic = 'force-dynamic';
export default function GlobalNavigation({ style, className }: GlobalNavigationProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Navigation button configuration
    const navButtons = [
        {
            key: 'home',
            label: 'Home',
            path: navigationRoutes.home,
            color:'#fff'
        },
        {
            key: 'community',
            label: 'Community',
            path: navigationRoutes.forum, // Points to /dashboard/forum
            color:'#fff'
        },
        {
            key: 'store',
            label: 'Store',
            path: navigationRoutes.shop,
            color:'#fff'
        },
        {
            key: 'developer',
            label: 'Developer',
            path: navigationRoutes.developer,
            color:'#fff'
        },
        {
            key: 'chat',
            label: 'Chat',
            path: navigationRoutes.chat,
            color:'#fff'
        }
    ];


    // Check if current path is active
    const isActivePath = (path: string) => {
        if (path === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(path);
    };

    // Handle navigation click
    const handleNavClick = (path: string) => {
        router.push(path);
    };

    return (
        <div
            className={className}
            style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                ...style
            }}
        >
            <Space size="large">
                {navButtons.map((button) => (
                    <Button
                        key={button.key}
                        type="text"
                        style={{
                            color: isActivePath(button.path) ? '#1890ff' : button.color,
                            fontWeight: isActivePath(button.path) ? 'bold' : 'normal',
                            fontSize: '16px',
                            height: 'auto',
                            padding: '8px 16px',
                            borderBottom: isActivePath(button.path) ? '2px solid #1890ff' : 'none'
                        }}
                        onClick={() => handleNavClick(button.path)}
                    >
                        {button.label}
                    </Button>
                ))}
            </Space>
        </div>
    );
}