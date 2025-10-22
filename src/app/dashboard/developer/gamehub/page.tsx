"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Spin, Empty, Card } from "antd";
import { usePublicDevGames } from "@/app/features/devgames/hooks/usePublicDevGames";
import { useHotGames } from "@/app/features/devgames/hooks/useHotGames";
import { DevGame } from "@/app/features/devgames/types/devGameTypes";

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
        <div
            style={{
                background: "#fff",
                minHeight: "100vh",
                padding: "40px 80px",
                fontFamily: "Inter, sans-serif",
            }}
        >
            {/* ===== 🔥 Hot Games Section ===== */}
            <div style={{ position: "relative", marginBottom: "60px" }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
                    🔥 Trending Games
                </h2>

                {hotLoading ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <Spin size="large" />
                    </div>
                ) : hotError ? (
                    <p style={{ textAlign: "center", color: "red" }}>{hotError}</p>
                ) : !Array.isArray(hotGames) || hotGames.length === 0 ? (
                    <p style={{ textAlign: "center" }}>No trending games yet.</p>
                ) : (
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        {/* Left Button */}
                        <button
                            onClick={scrollLeft}
                            style={{
                                position: "absolute",
                                left: "-40px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                border: "none",
                                background: "transparent",
                                fontSize: "28px",
                                cursor: "pointer",
                                color: "#555",
                                zIndex: 2,
                            }}
                        >
                            <LeftOutlined />
                        </button>

                        {/* Hot game cards */}
                        <div
                            ref={scrollRef}
                            style={{
                                display: "flex",
                                gap: "24px",
                                overflowX: "auto",
                                scrollBehavior: "smooth",
                                paddingBottom: "10px",
                            }}
                        >
                            {hotGames.map((game) => (
                                <Card
                                    key={game.id}
                                    hoverable
                                    style={{
                                        width: 260,
                                        flexShrink: 0,
                                        borderRadius: 12,
                                        overflow: "hidden",
                                        boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
                                    }}
                                    cover={
                                        <img
                                            src={game.coverImageUrl ?? "/placeholder.png"}
                                            alt={game.name}
                                            style={{
                                                width: "100%",
                                                height: 160,
                                                objectFit: "cover",
                                            }}
                                        />
                                    }
                                    onClick={() =>
                                        router.push(`/dashboard/developer/gamehub/${game.id}`)
                                    }
                                >
                                    <Card.Meta
                                        title={
                                            <span style={{ fontWeight: 600, fontSize: 16 }}>
                                                {game.name}
                                            </span>
                                        }
                                        description={
                                            <span style={{ color: "#888", fontSize: 13 }}>
                                                Score: {Math.round(game.score ?? 0)}
                                            </span>
                                        }
                                    />
                                </Card>
                            ))}
                        </div>

                        {/* Right Button */}
                        <button
                            onClick={scrollRight}
                            style={{
                                position: "absolute",
                                right: "-40px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                border: "none",
                                background: "transparent",
                                fontSize: "28px",
                                cursor: "pointer",
                                color: "#555",
                                zIndex: 2,
                            }}
                        >
                            <RightOutlined />
                        </button>
                    </div>
                )}
            </div>

            {/* ===== 🎮 All Games Section ===== */}
            <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
                    🎮 All Games
                </h2>

                {!Array.isArray(safeGames) || safeGames.length === 0 ? (
                    <Empty description="No games found" />
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
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                    }}
                                    onClick={() =>
                                        router.push(`/dashboard/developer/gamehub/${g.id}`)
                                    }
                                    ref={index === safeGames.length - 1 ? lastGameRef : null}
                                    cover={
                                        <img
                                            src={g.imageUrl ?? "/placeholder.png"}
                                            alt={g.name}
                                            style={{
                                                width: "100%",
                                                height: "180px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    }
                                >
                                    <Card.Meta
                                        title={g.name}
                                        description={g.description || "No description"}
                                    />
                                </Card>
                            ))}
                        </div>

                        {loading && (
                            <div style={{ textAlign: "center", margin: "20px 0" }}>
                                <Spin size="large" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
