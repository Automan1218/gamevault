"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button, Typography, Empty, Spin } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useDevGames } from "@/app/features/devgames/hooks/useDevGames";
import { GameCard } from "./components/GameCard";
import { cardStyle, titleStyle } from "@/components/common/theme";

const { Title, Text } = Typography;
export const dynamic = 'force-dynamic';
export default function DeveloperMyGamesPage() {
    const router = useRouter();
    const { games, loading, error, deleteGame } = useDevGames();

    const handleEdit = (id: string) => {
        router.push(`/dashboard/developer/edit/${id}`);
    };

    const safeGames = Array.isArray(games) ? games : [];

    return (
        <div style={{ fontFamily: "Inter, sans-serif" }}>
            {/* ===== Page header ===== */}
            <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <Title level={2} style={{ ...titleStyle, margin: 0 }}>
                        My Games
                    </Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => router.push("/dashboard/developer/upload")}
                        style={{
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            border: "none",
                            borderRadius: "12px",
                            height: "48px",
                            padding: "0 24px",
                            fontWeight: 600,
                            boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
                        }}
                    >
                        Upload New Game
                    </Button>
                </div>
                <Text style={{ color: "#9ca3af", fontSize: "16px" }}>
                    Manage and track your published games
                </Text>
            </div>

            {/* ===== Content area ===== */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <Spin size="large" />
                    <div style={{ marginTop: "16px", color: "#9ca3af" }}>Loading your games...</div>
                </div>
            ) : error ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <Empty 
                        description={
                            <div>
                                <div style={{ color: "#ef4444", marginBottom: "8px" }}>Failed to load games</div>
                                <div style={{ color: "#9ca3af" }}>{error}</div>
                            </div>
                        }
                    />
                </div>
            ) : safeGames.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <div
                        style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                            border: "2px solid rgba(99, 102, 241, 0.2)",
                        }}
                    >
                        <UploadOutlined style={{ fontSize: "48px", color: "#6366f1" }} />
                    </div>
                    <Title level={3} style={{ color: "#f9fafb", marginBottom: "16px" }}>
                        No games uploaded yet
                    </Title>
                    <Text style={{ color: "#9ca3af", display: "block", marginBottom: "24px" }}>
                        Start your journey by uploading your first game
                    </Text>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => router.push("/dashboard/developer/upload")}
                        style={{
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            border: "none",
                            borderRadius: "12px",
                            height: "48px",
                            padding: "0 32px",
                            fontWeight: 600,
                            boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
                        }}
                    >
                        Upload Your First Game
                    </Button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {safeGames.map((g) => (
                        <div key={g.id} style={{ ...cardStyle, padding: "0" }}>
                            <GameCard
                                game={g}
                                onDelete={deleteGame}
                                onEdit={handleEdit}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}