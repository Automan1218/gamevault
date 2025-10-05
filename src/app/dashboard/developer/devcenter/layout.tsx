"use client";

import { useRouter, usePathname } from "next/navigation";
import { Layout, Menu } from "antd";
import {
    AppstoreOutlined,
    UploadOutlined,
    BarChartOutlined,
} from "@ant-design/icons";
import React from "react";

const { Sider, Content } = Layout;

export default function DevCenterLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { key: "dashboard", icon: <BarChartOutlined />, label: "Dashboard" },
        { key: "upload", icon: <UploadOutlined />, label: "Upload Game" },
        { key: "manage", icon: <AppstoreOutlined />, label: "Game Management" },
        // ⚡ 已去掉 Settings
    ];

    const selectedKey =
        pathname.includes("upload") ? "upload" :
            pathname.includes("manage") ? "manage" :
                "dashboard";

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* 左侧竖直导航 */}
            <Sider width={200} theme="light" style={{ borderRight: "1px solid #eee" }}>
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    style={{ height: "100%", borderRight: 0 }}
                    items={menuItems}
                    onClick={({ key }) => {
                        router.push(`/dashboard/developer/devcenter/${key}`);
                    }}
                />
            </Sider>

            {/* 主内容区 */}
            <Layout style={{ padding: "24px" }}>
                <Content
                    style={{
                        padding: 24,
                        margin: 0,
                        minHeight: 280,
                        background: "#fff",
                        borderRadius: 8,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}