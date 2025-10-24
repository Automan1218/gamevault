"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Spin, Empty, Card, Typography, Button } from "antd";
import { usePublicDevGames } from "@/app/features/devgames/hooks/usePublicDevGames";
import { useHotGames } from "@/app/features/devgames/hooks/useHotGames";
import { DevGame } from "@/app/features/devgames/types/devGameTypes";
import { cardStyle, titleStyle } from "@/components/common/theme";

const { Title, Text } = Typography;

export default function DeveloperGameHubPage() {
    const router = useRouter();
    const { fetchGames } = usePublicDevGames();
    const { hotGames, loading: hotLoading, error: hotError } = useHotGames(6);

    // ======= Pagination state =======
    const [games, setGames] = useState<DevGame[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // ======= Fetch paged games =======
    const loadGames = useCallback(
        async (pageToLoad: number) => {
            if (loading || !hasMore) return;
            setLoading(true);
            try {
                const data = await fetchGames(pageToLoad);
                const safeGames = Array.isArray(data?.games) ? data.games : [];

                setGames((prev) =>
                    pageToLoad === 1 ? safeGames : [...prev, ...safeGames]
                );
                setPage(data?.currentPage ?? 1);
                setTotalPages(data?.totalPages ?? 1);
                if ((data?.currentPage ?? 1) >= (data?.totalPages ?? 1)) setHasMore(false);
            } catch (err) {
                console.error("❌ Failed to load games", err);
            } finally {
                setLoading(false);
            }
        },
        [fetchGames, loading, hasMore]
    );

    // ======= Initial load =======
    useEffect(() => {
        setGames([]);
        setHasMore(true);
        loadGames(1);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ======= Reload on game upload =======
    useEffect(() => {
        const reload = () => {
            console.log("🎮 New game uploaded → reload GameHub");
            setGames([]);
            setHasMore(true);
            loadGames(1);
        };
        window.addEventListener("gameUploaded", reload);
        return () => window.removeEventListener("gameUploaded", reload);
    }, [loadGames]);

    // ======= Infinite scroll observer =======
    const observer = useRef<IntersectionObserver | null>(null);
    const lastGameRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadGames(page + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, page, loadGames]
    );

    // ======= Hot games scroll =======
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });

    const safeGames = Array.isArray(games) ? games : [];

    return (
        <div style={{ fontFamily: "Inter, sans-serif" }}>
            {/* ===== 🔥 Hot Games Section ===== */}
            <div style={{ position: "relative", marginBottom: "60px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 8px 32px rgba(239, 68, 68, 0.3)",
                        }}
                    >
                        <span style={{ fontSize: "24px" }}>🔥</span>
                    </div>
                    <Title level={2} style={{ ...titleStyle, margin: 0 }}>
                        Trending Games
                    </Title>
                </div>

                {hotLoading ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <Spin size="large" />
                        <div style={{ marginTop: "16px", color: "#9ca3af" }}>Loading trending games...</div>
                    </div>
                ) : hotError ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <Empty 
                            description={
                                <div>
                                    <div style={{ color: "#ef4444", marginBottom: "8px" }}>Failed to load trending games</div>
                                    <div style={{ color: "#9ca3af" }}>{hotError}</div>
                                </div>
                            }
                        />
                    </div>
                ) : !Array.isArray(hotGames) || hotGames.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <Empty description="No trending games yet" />
                    </div>
                ) : (
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        {/* Left Button */}
                        <Button
                            onClick={scrollLeft}
                            style={{
                                position: "absolute",
                                left: "-60px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                background: "rgba(15, 23, 42, 0.8)",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                                color: "#6366f1",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 2,
                                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                            }}
                            icon={<LeftOutlined />}
                        />

                        {/* Hot game cards */}
                        <div
                            ref={scrollRef}
                            style={{
                                display: "flex",
                                gap: "24px",
                                overflowX: "auto",
                                scrollBehavior: "smooth",
                                paddingBottom: "10px",
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                            }}
                        >
                            {hotGames.map((game) => (
                                <Card
                                    key={game.id}
                                    hoverable
                                    style={{
                                        width: 280,
                                        flexShrink: 0,
                                        overflow: "hidden",
                                        ...cardStyle,
                                        background: "rgba(15, 23, 42, 0.8)",
                                        border: "1px solid rgba(99, 102, 241, 0.2)",
                                        transition: "all 0.3s ease",
                                    }}
                                    cover={
                                        <div style={{ position: "relative" }}>
                                            <img
                                                src={game.coverImageUrl ?? "/placeholder.png"}
                                                alt={game.name}
                                                style={{
                                                    width: "100%",
                                                    height: 180,
                                                    objectFit: "cover",
                                                }}
                                            />
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "12px",
                                                    right: "12px",
                                                    background: "rgba(239, 68, 68, 0.9)",
                                                    color: "white",
                                                    padding: "4px 8px",
                                                    borderRadius: "6px",
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                🔥 HOT
                                            </div>
                                        </div>
                                    }
                                    onClick={() =>
                                        router.push(`/dashboard/developer/gamehub/${game.id}`)
                                    }
                                >
                                    <Card.Meta
                                        title={
                                            <Text style={{ color: "#f9fafb", fontWeight: 600, fontSize: 16 }}>
                                                {game.name}
                                            </Text>
                                        }
                                        description={
                                            <div style={{ marginTop: "8px" }}>
                                                <Text style={{ color: "#9ca3af", fontSize: 14 }}>
                                                    Score: {Math.round(game.score ?? 0)}
                                                </Text>
                                            </div>
                                        }
                                    />
                                </Card>
                            ))}
                        </div>

                        {/* Right Button */}
                        <Button
                            onClick={scrollRight}
                            style={{
                                position: "absolute",
                                right: "-60px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                background: "rgba(15, 23, 42, 0.8)",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                                color: "#6366f1",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 2,
                                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                            }}
                            icon={<RightOutlined />}
                        />
                    </div>
                )}
            </div>

            {/* ===== 🎮 All Games Section ===== */}
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
                        }}
                    >
                        <span style={{ fontSize: "24px" }}>🎮</span>
                    </div>
                    <Title level={2} style={{ ...titleStyle, margin: 0 }}>
                        All Games
                    </Title>
                </div>

                {!Array.isArray(safeGames) || safeGames.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <Empty description="No games found" />
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                                gap: "24px",
                            }}
                        >
                            {safeGames.map((g, index) => (
                                <Card
                                    key={g.id}
                                    hoverable
                                    style={{
                                        overflow: "hidden",
                                        ...cardStyle,
                                        background: "rgba(15, 23, 42, 0.8)",
                                        border: "1px solid rgba(99, 102, 241, 0.2)",
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={() =>
                                        router.push(`/dashboard/developer/gamehub/${g.id}`)
                                    }
                                    ref={index === safeGames.length - 1 ? lastGameRef : null}
                                    cover={
                                        <div style={{ position: "relative" }}>
                                            <img
                                                src={g.imageUrl ?? "/placeholder.png"}
                                                alt={g.name}
                                                style={{
                                                    width: "100%",
                                                    height: "200px",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </div>
                                    }
                                >
                                    <Card.Meta
                                        title={
                                            <Text style={{ color: "#f9fafb", fontWeight: 600, fontSize: 16 }}>
                                                {g.name}
                                            </Text>
                                        }
                                        description={
                                            <Text style={{ color: "#9ca3af", fontSize: 14 }}>
                                                {g.description || "No description"}
                                            </Text>
                                        }
                                    />
                                </Card>
                            ))}
                        </div>

                        {loading && (
                            <div style={{ textAlign: "center", margin: "40px 0" }}>
                                <Spin size="large" />
                                <div style={{ marginTop: "16px", color: "#9ca3af" }}>Loading more games...</div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}