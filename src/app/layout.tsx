import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './globals.css';
import {AuthProvider} from "@/contexts/AuthContext";

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
        <AuthProvider>
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
                    <AntdApp>{children}</AntdApp>
                </ConfigProvider>
            </AntdRegistry>
        </AuthProvider>
        </body>
        </html>
    );
}
