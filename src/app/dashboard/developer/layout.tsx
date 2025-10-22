"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, Card } from "antd";
import { navigationRoutes } from "@/lib/navigation";
import React from "react";

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    /**
     * 根据当前路径动态确定 Tabs 高亮项
     * - 让 upload 页面也归属于 mygames
     * - 避免未匹配时默认跳到 profile
     */
    let activeKey = "profile";

    if (
        pathname.startsWith("/dashboard/developer/mygames") ||
        pathname.startsWith("/dashboard/developer/upload") // ✅ 新增：upload 属于 mygames
    ) {
        activeKey = "mygames";
    } else if (pathname.startsWith("/dashboard/developer/gamehub")) {
        activeKey = "gamehub";
    } else if (pathname.startsWith("/dashboard/developer/profile")) {
        activeKey = "profile";
    }

    /**
     * Tabs 切换路由逻辑
     */
    const handleTabChange = (key: string) => {
        switch (key) {
            case "profile":
                router.push(navigationRoutes.developerProfile);
                break;
            case "mygames":
                router.push(navigationRoutes.developerMyGames);
                break;
            case "gamehub":
                router.push(navigationRoutes.developerGameHub);
                break;
        }
    };

    return (
        <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
            {/* ===== 顶部 Tab 导航 ===== */}
            <Card
                style={{
                    borderRadius: 0,
                    borderBottom: "1px solid #e8e8e8",
                    background: "#fff",
                }}
                styles={{
                    body: { padding: "0 24px" },
                }}
            >
                <Tabs
                    size="large"
                    tabBarStyle={{ marginBottom: 0 }}
                    activeKey={activeKey}
                    onChange={handleTabChange}
                    items={[
                        { key: "profile", label: "Profile" },
                        { key: "mygames", label: "My Games" },
                        { key: "gamehub", label: "GameHub" },
                    ]}
                />
            </Card>

            {/* ===== 页面内容区域 ===== */}
            <div style={{ padding: "24px" }}>{children}</div>
        </div>
    );
}
