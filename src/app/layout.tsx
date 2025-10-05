// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './globals.css';
import Menubar from '@/components/layout/Menubar'; // ✅ 引入你的全局导航栏

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'GameVault',
    description: 'Your Ultimate Gaming Hub',
    keywords: 'game,forum,shopping,developer,chat',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN">
        <body className={inter.className}>
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
                <AntdApp>
                    {/* ✅ 一级导航栏始终存在 */}
                    <Menubar />

                    {/* ✅ 页面内容区（留出 Menubar 的高度） */}
                    <div style={{ paddingTop: 64 }}>
                        {children}
                    </div>
                </AntdApp>
            </ConfigProvider>
        </AntdRegistry>
        </body>
        </html>
    );
}
