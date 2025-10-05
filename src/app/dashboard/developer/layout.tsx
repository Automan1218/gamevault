"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, Card, Typography } from "antd";
import { navigationRoutes } from "@/lib/navigation";
import React from "react";

const { Title } = Typography;

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    // 当前选中Tab
    const activeKey = pathname.includes("devgames")
        ? "devgames"
        : pathname.includes("devcommunity")
            ? "devcommunity"
            : "devcenter";

    return (
        <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
            {/* ✅ 顶部改为 Developer Header */}
            <Card
                style={{
                    borderRadius: 0,
                    borderBottom: "1px solid #e8e8e8",
                    background: "#fff",
                }}
                bodyStyle={{ padding: "12px 24px" }}
            >
                <Title level={4} style={{ margin: 0 }}>
                    👨‍💻 Developer Dashboard
                </Title>
                <p style={{ margin: 0, color: "#888" }}>
                    Manage your games, assets, and community.
                </p>
            </Card>

            {/* ✅ 二级导航栏 */}
            <Card
                style={{
                    borderRadius: 0,
                    borderBottom: "1px solid #e8e8e8",
                    background: "#fff",
                }}
                bodyStyle={{ padding: "0 24px" }}
            >
                <Tabs
                    size="large"
                    tabBarStyle={{ marginBottom: 0 }}
                    activeKey={activeKey}
                    onChange={(key) => {
                        switch (key) {
                            case "devgames":
                                router.push(navigationRoutes.developer + "/devgames");
                                break;
                            case "devcommunity":
                                router.push(navigationRoutes.developer + "/devcommunity");
                                break;
                            case "devcenter":
                                router.push(navigationRoutes.developer + "/devcenter");
                                break;
                        }
                    }}
                    items={[
                        { key: "devgames", label: "Dev Games" },
                        { key: "devcommunity", label: "Dev Community" },
                        { key: "devcenter", label: "Dev Center" },
                    ]}
                />
            </Card>

            {/* 内容区域 */}
            <div style={{ padding: "24px" }}>{children}</div>
        </div>
    );
}
