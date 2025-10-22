"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useDevGames } from "@/app/features/devgames/hooks/useDevGames";
import { GameCard } from "./components/GameCard";

export default function DeveloperMyGamesPage() {
    const router = useRouter();
    const { games, loading, error, deleteGame } = useDevGames();

    const handleEdit = (id: string) => {
        router.push(`/dashboard/developer/edit/${id}`);
    };

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
            {/* 顶部标题行 */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                }}
            >
                <h2 style={{ margin: 0 }}>My Games</h2>
                <span
                    style={{ cursor: "pointer", color: "#1677ff" }}
                    onClick={() => router.push("/dashboard/developer/upload")}
                >
                    Upload
                </span>
            </div>

            {/* 内容 */}
            {loading ? (
                <p style={{ color: "#666" }}>Loading your games...</p>
            ) : error ? (
                <p style={{ color: "red" }}>Failed to load: {error}</p>
            ) : safeGames.length === 0 ? (
                <p style={{ color: "#999" }}>You haven’t uploaded any games yet.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {safeGames.map((g) => (
                        <GameCard
                            key={g.id}
                            game={g}
                            onDelete={deleteGame}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
