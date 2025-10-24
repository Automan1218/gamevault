"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Card, Spin, Empty, Button, App, Typography } from "antd";
import {
    CodeOutlined,
    EyeOutlined,
    DownloadOutlined,
    StarOutlined,
} from "@ant-design/icons";
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
import { cardStyle, titleStyle } from "@/components/common/theme";

const { Title, Text } = Typography;

export default function DeveloperProfilePage() {
    const router = useRouter();
    const { message } = App.useApp();
    const { data, loading, error, refetch } = useDeveloperDashboard();

    useEffect(() => {
        if (error === "No authentication token found") {
            message.warning("Please login first to access the developer center");
            const timer = setTimeout(() => router.push("/login"), 1500);
            return () => clearTimeout(timer);
        }
    }, [error, message, router]);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "60vh",
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
                    minHeight: "60vh",
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
        { name: "Games", value: summary?.totalGames ?? 0, color: "#6366f1" },
        { name: "Views", value: summary?.totalViews ?? 0, color: "#8b5cf6" },
        { name: "Downloads", value: summary?.totalDownloads ?? 0, color: "#06b6d4" },
    ];

    const lineData = games.map((g) => ({
        name: g.name,
        views: g.viewCount,
        downloads: g.downloadCount,
    }));

    return (
        <div style={{ fontFamily: "Inter, sans-serif" }}>
            {/* ===== Developer Header ===== */}
            <Card
                style={{
                    ...cardStyle,
                    marginBottom: "32px",
                    textAlign: "center",
                }}
            >
                <div style={{ padding: "20px 0" }}>
                    <Avatar 
                        size={120} 
                        style={{ 
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            marginBottom: "24px",
                            boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
                        }}
                    >
                        <CodeOutlined style={{ fontSize: "48px" }} />
                    </Avatar>
                    <Title 
                        level={2} 
                        style={{
                            ...titleStyle,
                            marginBottom: "16px",
                        }}
                    >
                        Developer Dashboard
                    </Title>
                    <div
                        style={{
                            background: "rgba(99, 102, 241, 0.1)",
                            borderRadius: "12px",
                            padding: "12px 24px",
                            display: "inline-block",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                        }}
                    >
                        <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                            Developer ID: <Text style={{ color: "#f9fafb", fontWeight: 600 }}>{developerId}</Text>
                        </Text>
                    </div>
                </div>
            </Card>

            {/* ===== Summary Cards ===== */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "24px",
                    marginBottom: "32px",
                }}
            >
                <Card
                    style={{
                        ...cardStyle,
                        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div
                            style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "12px",
                                background: "rgba(99, 102, 241, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CodeOutlined style={{ fontSize: "24px", color: "#6366f1" }} />
                        </div>
                        <div>
                            <Text style={{ color: "#9ca3af", display: "block", marginBottom: "4px" }}>
                                Total Games
                            </Text>
                            <Title level={3} style={{ margin: 0, color: "#f9fafb" }}>
                                {summary?.totalGames ?? 0}
                            </Title>
                        </div>
                    </div>
                </Card>

                <Card
                    style={{
                        ...cardStyle,
                        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div
                            style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "12px",
                                background: "rgba(139, 92, 246, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <EyeOutlined style={{ fontSize: "24px", color: "#8b5cf6" }} />
                        </div>
                        <div>
                            <Text style={{ color: "#9ca3af", display: "block", marginBottom: "4px" }}>
                                Total Views
                            </Text>
                            <Title level={3} style={{ margin: 0, color: "#f9fafb" }}>
                                {summary?.totalViews ?? 0}
                            </Title>
                        </div>
                    </div>
                </Card>

                <Card
                    style={{
                        ...cardStyle,
                        background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)",
                        border: "1px solid rgba(6, 182, 212, 0.3)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div
                            style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "12px",
                                background: "rgba(6, 182, 212, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <DownloadOutlined style={{ fontSize: "24px", color: "#06b6d4" }} />
                        </div>
                        <div>
                            <Text style={{ color: "#9ca3af", display: "block", marginBottom: "4px" }}>
                                Downloads
                            </Text>
                            <Title level={3} style={{ margin: 0, color: "#f9fafb" }}>
                                {summary?.totalDownloads ?? 0}
                            </Title>
                        </div>
                    </div>
                </Card>

                <Card
                    style={{
                        ...cardStyle,
                        background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)",
                        border: "1px solid rgba(251, 191, 36, 0.3)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div
                            style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "12px",
                                background: "rgba(251, 191, 36, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <StarOutlined style={{ fontSize: "24px", color: "#fbbf24" }} />
                        </div>
                        <div>
                            <Text style={{ color: "#9ca3af", display: "block", marginBottom: "4px" }}>
                                Avg Rating
                            </Text>
                            <Title level={3} style={{ margin: 0, color: "#f9fafb" }}>
                                {(summary?.averageRating ?? 0).toFixed(1)}
                            </Title>
                        </div>
                    </div>
                </Card>
            </div>

            {/* ===== Charts Section ===== */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                    marginBottom: "32px",
                }}
            >
                {/* Pie Chart */}
                <Card
                    style={cardStyle}
                    title={
                        <Text style={{ color: "#f9fafb", fontSize: "18px", fontWeight: 600 }}>
                            Statistics Overview
                        </Text>
                    }
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{
                                    background: "rgba(15, 23, 42, 0.9)",
                                    border: "1px solid rgba(99, 102, 241, 0.3)",
                                    borderRadius: "8px",
                                    color: "#f9fafb",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                {/* Line Chart */}
                <Card
                    style={cardStyle}
                    title={
                        <Text style={{ color: "#f9fafb", fontSize: "18px", fontWeight: 600 }}>
                            Games Performance
                        </Text>
                    }
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(75, 85, 99, 0.3)" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#9ca3af"
                                tick={{ fill: "#9ca3af" }}
                            />
                            <YAxis 
                                stroke="#9ca3af"
                                tick={{ fill: "#9ca3af" }}
                            />
                            <Tooltip 
                                contentStyle={{
                                    background: "rgba(15, 23, 42, 0.9)",
                                    border: "1px solid rgba(99, 102, 241, 0.3)",
                                    borderRadius: "8px",
                                    color: "#f9fafb",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="views"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={{ fill: "#8b5cf6" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="downloads"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                dot={{ fill: "#06b6d4" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
}
