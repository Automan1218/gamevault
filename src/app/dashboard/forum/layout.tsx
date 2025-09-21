// ========================================
// src/app/layout.tsx
// 更新根布局文件
// ========================================

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import '@/app/globals.css';
import React from "react";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'GameVault - 游戏论坛',
    description: '游戏玩家的交流社区',
    keywords: '游戏,论坛,攻略,评测,GameVault',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <AntdRegistry>
            <ConfigProvider
                locale={zhCN}
                theme={{
                    token: {
                        colorPrimary: '#FF6B6B',
                        borderRadius: 8,
                    },
                }}
            >
                {children}
            </ConfigProvider>
        </AntdRegistry>
    );
}
