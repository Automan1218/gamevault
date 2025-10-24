"use client";

import { useRouter, usePathname } from "next/navigation";
import { Layout, Menu } from "antd";
import {
    AppstoreOutlined,
    UploadOutlined,
    BarChartOutlined,
} from "@ant-design/icons";
import React from "react";
import { cardStyle } from "@/components/common/theme";

const { Sider, Content } = Layout;
export const dynamic = 'force-dynamic';
export default function DevCenterLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { key: "dashboard", icon: <BarChartOutlined />, label: "Dashboard" },
        { key: "upload", icon: <UploadOutlined />, label: "Upload Game" },
        { key: "manage", icon: <AppstoreOutlined />, label: "Game Management" },
    ];

    const selectedKey =
        pathname.includes("upload") ? "upload" :
            pathname.includes("manage") ? "manage" :
                "dashboard";

    return (
        <Layout style={{ minHeight: "calc(100vh - 200px)", background: "transparent" }}>
            {/* Left vertical navigation */}
            <Sider 
                width={240} 
                style={{ 
                    ...cardStyle,
                    margin: "0 24px 0 0",
                }}
            >
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    style={{ 
                        height: "100%", 
                        borderRight: 0,
                        background: "transparent",
                    }}
                    items={menuItems}
                    onClick={({ key }) => {
                        router.push(`/dashboard/developer/devcenter/${key}`);
                    }}
                />
            </Sider>

            {/* Main content area */}
            <Layout style={{ background: "transparent" }}>
                <Content
                    style={{
                        ...cardStyle,
                        padding: 32,
                        minHeight: 280,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
