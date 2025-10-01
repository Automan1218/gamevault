"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, Button, Space, Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { navigationRoutes } from "@/lib/navigation";
import React from "react";

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
            {/* Top toolbar */}
            <Card
                style={{
                    borderRadius: 0,
                    borderBottom: "1px solid #e8e8e8",
                    background: "#fff",
                }}
                styles={{ body: { padding: "8px 24px" } }}
            >
                <Space>
                    <Button
                        type="default"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.push("/")}
                    >
                        Back to Home
                    </Button>
                </Space>
            </Card>

            {/* Sub navigation */}
            <Card
                style={{
                    borderRadius: 0,
                    borderBottom: "1px solid #e8e8e8",
                    background: "#fff",
                }}
                styles={{ body: { padding: "0 24px" } }}
            >
                <Tabs
                    size="large"
                    tabBarStyle={{ marginBottom: 0 }}
                    activeKey={
                        pathname.includes("devgames") ? "devgames" :
                            pathname.includes("devcommunity") ? "devcommunity" :
                                pathname.includes("devcenter") ? "devcenter" : "devgames"
                    }
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

            {/* Subpage content */}
            <div style={{ padding: "24px" }}>{children}</div>
        </div>
    );
}
