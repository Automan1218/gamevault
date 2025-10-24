// ========================================
// src/app/layout.tsx
// Update root layout file
// ========================================

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import '@/app/globals.css';
import React from "react";

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
    title: 'GameVault - Game Forum',
    description: 'Community for game players',
    keywords: 'game,forum,strategy,review,GameVault',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <AntdRegistry>
            <ConfigProvider
                locale={enUS}
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
