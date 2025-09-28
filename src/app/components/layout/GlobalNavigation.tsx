'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button, Space } from 'antd';
import { navigationRoutes } from '@/lib/navigation';

interface GlobalNavigationProps {
    style?: React.CSSProperties;
    className?: string;
}

export default function GlobalNavigation({ style, className }: GlobalNavigationProps) {
    const router = useRouter();
    const pathname = usePathname();

    // 导航按钮配置
    const navButtons = [
        {
            key: 'home',
            label: '首页',
            path: navigationRoutes.home,
            color:'#fff'
        },
        {
            key: 'community',
            label: '社区',
            path: navigationRoutes.forum, // 指向 /dashboard/forum
            color:'#fff'
        },
        {
            key: 'store',
            label: '商城',
            path: navigationRoutes.shop,
            color:'#fff'
        },
        {
            key: 'developer',
            label: '开发',
            path: navigationRoutes.developer,
            color:'#fff'
        },
        {
            key: 'chat',
            label: '聊天',
            path: navigationRoutes.chat,
            color:'#fff'
        }
    ];


    // 检查当前路径是否激活
    const isActivePath = (path: string) => {
        if (path === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(path);
    };

    // 处理导航点击
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