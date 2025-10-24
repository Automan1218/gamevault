import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App as AntdApp } from 'antd';
import enUS from 'antd/locale/en_US';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

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
        <html lang="en">
        <body className={inter.className}>
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
                <AntdApp>
                    <AuthProvider>
                        <CartProvider>
                            {children}
                        </CartProvider>
                    </AuthProvider>
                </AntdApp>
            </ConfigProvider>
        </AntdRegistry>
        </body>
        </html>
    );
}
