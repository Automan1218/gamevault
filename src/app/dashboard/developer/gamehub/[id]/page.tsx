"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Spin, Card, Button, message } from "antd";
import { usePublicGameDetail } from "@/app/features/devgames/hooks/usePublicGameDetail";

export default function PublicGameDetailPage() {
    const { id } = useParams();
    const { game, loading, error } = usePublicGameDetail(id as string);

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !game) {
        return <div style={{ textAlign: "center", padding: "100px 0" }}>Game not found</div>;
    }

    return (
        <div
            style={{
                background: "#fff",
                minHeight: "100vh",
                padding: "40px 80px",
                fontFamily: "Inter, sans-serif",
            }}
        >
            <Card
                bordered={false}
                style={{
                    maxWidth: 1000,
                    margin: "0 auto",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                    borderRadius: 12,
                }}
                cover={
                    <img
                        src={game.coverImageUrl ?? "/placeholder.png"}
                        alt={game.name}
                        style={{
                            width: "100%",
                            height: "400px",
                            objectFit: "cover",
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                        }}
                    />
                }
            >
                <h1 style={{ fontSize: 32, fontWeight: 700 }}>{game.name}</h1>
                <p style={{ color: "#666", lineHeight: 1.6 }}>{game.description}</p>

                {game.videoUrl && (
                    <div style={{ marginTop: 24 }}>
                        <video
                            key={game.videoUrl}
                            src={game.videoUrl}
                            controls
                            preload="metadata"
                            style={{
                                width: "100%",
                                maxHeight: "400px",
                                borderRadius: 8,
                                background: "#000",
                            }}
                        />
                    </div>
                )}

                <Button
                    type="primary"
                    size="large"
                    style={{ marginTop: 30 }}
                    onClick={() => {
                        if (!game.zipUrl) {
                            message.error("No download link available");
                            return;
                        }

                        // ✅ 直接让浏览器跳转到下载地址
                        const a = document.createElement("a");
                        a.href = game.zipUrl;
                        a.download = ""; // 可选：提示浏览器下载而不是打开
                        a.target = "_blank"; // 防止阻塞当前页
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);

                        message.success("Download started ✅");
                    }}
                >
                    Download Game
                </Button>

            </Card>
        </div>
    );
}
