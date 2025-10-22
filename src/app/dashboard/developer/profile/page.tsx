"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Card, Spin, Empty, Button, App } from "antd";
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useDeveloperDashboard } from "@/app/features/devgames/hooks/useDeveloperDashboard";

export default function DeveloperProfilePage() {
    const router = useRouter();
    const { message } = App.useApp();
    const { data, loading, error, refetch } = useDeveloperDashboard();

    useEffect(() => {
        if (error === "No authentication token found") {
            message.warning("请先登录以访问开发者中心");
            const timer = setTimeout(() => router.push("/login"), 1500);
            return () => clearTimeout(timer);
        }
    }, [error, message, router]);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                }}
            >
                <Empty description={error || "No dashboard data"} />
                <Button
                    type="primary"
                    style={{ marginTop: 16 }}
                    onClick={() => refetch()}
                >
                    Retry
                </Button>
            </div>
        );
    }

    const summary = data?.summary ?? {};
    const games = data?.games ?? [];
    const developerId = data?.developerId ?? "N/A";

    const pieData = [
        { name: "Games", value: summary?.totalGames ?? 0, color: "#1677ff" },
        { name: "Views", value: summary?.totalViews ?? 0, color: "#fadb14" },
        { name: "Downloads", value: summary?.totalDownloads ?? 0, color: "#52c41a" },
    ];

    const lineData = games.map((g) => ({
        name: g.name,
        views: g.viewCount,
        downloads: g.downloadCount,
    }));

    return (
        <div
            style={{
                background: "#fff",
                minHeight: "100vh",
                padding: "60px 80px",
                fontFamily: "Inter, sans-serif",
            }}
        >
            {/* ===== Developer Header ===== */}
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
                <Avatar size={120} style={{ background: "#BFD6FF" }}>
                    D
                </Avatar>
                <h2
                    style={{
                        marginTop: "20px",
                        marginBottom: "12px",
                        fontWeight: 600,
                        fontSize: "22px",
                    }}
                >
                    Developer Dashboard
                </h2>
                <div
                    style={{
                        background: "#f7f7f7",
                        borderRadius: "8px",
                        padding: "10px 16px",
                        display: "inline-block",
                        color: "#333",
                        fontSize: "15px",
                    }}
                >
                    ID: {developerId}
                </div>
            </div>

            {/* ===== Summary Cards ===== */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "20px",
                    marginBottom: "40px",
                }}
            >
                <Card variant="borderless" style={{ background: "#f0f5ff" }}>
                    <h3 style={{ marginBottom: "8px" }}>Games</h3>
                    <p style={{ fontSize: "24px", fontWeight: 700 }}>
                        {summary?.totalGames ?? 0}
                    </p>
                </Card>

                <Card variant="borderless" style={{ background: "#fff7e6" }}>
                    <h3 style={{ marginBottom: "8px" }}>Total Views</h3>
                    <p style={{ fontSize: "24px", fontWeight: 700 }}>
                        {summary?.totalViews ?? 0}
                    </p>
                </Card>

                <Card variant="borderless" style={{ background: "#f6ffed" }}>
                    <h3 style={{ marginBottom: "8px" }}>Downloads</h3>
                    <p style={{ fontSize: "24px", fontWeight: 700 }}>
                        {summary?.totalDownloads ?? 0}
                    </p>
                </Card>

                <Card variant="borderless" style={{ background: "#fff0f6" }}>
                    <h3 style={{ marginBottom: "8px" }}>Average Rating</h3>
                    <p style={{ fontSize: "24px", fontWeight: 700 }}>
                        {(summary?.averageRating ?? 0).toFixed(1)}
                    </p>
                </Card>
            </div>

            {/* ===== Charts ===== */}
            <div
                style={{
                    display: "flex",
                    gap: "40px",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                }}
            >
                {/* --- Pie Chart --- */}
                <div
                    style={{
                        flex: "1 1 300px",
                        background: "#fafafa",
                        borderRadius: "12px",
                        padding: "20px",
                    }}
                >
                    <h4>Status Overview</h4>
                    <p style={{ fontSize: "14px", color: "#666" }}>
                        Snapshot of your games statistics
                    </p>
                    <div style={{ width: "100%", height: 200 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <p style={{ textAlign: "center", marginTop: "10px", color: "#555" }}>
                        <b>{pieData.reduce((a, b) => a + b.value, 0)}</b> Total Data Points
                    </p>
                </div>

                {/* --- Line Chart --- */}
                <div
                    style={{
                        flex: "2 1 500px",
                        background: "#fafafa",
                        borderRadius: "12px",
                        padding: "20px",
                    }}
                >
                    <h4>Game Performance</h4>
                    <div style={{ width: "100%", height: 220 }}>
                        <ResponsiveContainer>
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#1677ff"
                                    strokeWidth={2}
                                    name="Views"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="downloads"
                                    stroke="#52c41a"
                                    strokeWidth={2}
                                    name="Downloads"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
