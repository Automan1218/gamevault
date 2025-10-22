"use client";
import React from "react";
import type { MenuProps } from "antd";
import { Dropdown, App } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { DevGame } from "@/app/features/devgames/types/devGameTypes";

interface GameCardProps {
    game: DevGame;
    onDelete: (id: string) => void;
    onEdit?: (id: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onDelete, onEdit }) => {
    const { modal } = App.useApp(); // ✅ 用 App context 里的 modal，v5 推荐方式

    const handleMenuClick: MenuProps["onClick"] = (e) => {
        if (e.key === "edit") {
            onEdit?.(game.id);
        } else if (e.key === "delete") {
            modal.confirm({
                title: `Delete "${game.name}"?`,
                content: "This action cannot be undone.",
                okText: "Yes, delete",
                okType: "danger",
                cancelText: "Cancel",
                onOk: () => {
                    console.log("✅ Confirmed delete:", game.id);
                    onDelete(game.id);
                },
            });
        }
    };

    const items: MenuProps["items"] = [
        { key: "edit", label: "Edit",onClick: () => onEdit?.(game.id) },
        { key: "delete", label: "Delete", danger: true },
    ];

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #eee",
                padding: "14px 8px",
            }}
        >
            {/* 左边封面 + 名称 */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                    style={{
                        width: "100px",
                        height: "60px",
                        borderRadius: "8px",
                        background: "#C6DBFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                    }}
                >
                    {game.imageUrl ? (
                        <img
                            src={game.imageUrl}
                            alt={game.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <span style={{ color: "#fff", fontWeight: 600 }}>No Img</span>
                    )}
                </div>

                <div>
                    <div
                        style={{
                            color: "#1677ff",
                            fontWeight: 600,
                            fontSize: "16px",
                            marginBottom: "2px",
                        }}
                    >
                        {game.name}
                    </div>
                    <div style={{ color: "#666", fontSize: "14px" }}>
                        {game.description?.length > 60
                            ? game.description.substring(0, 60) + "..."
                            : game.description}
                    </div>
                </div>
            </div>

            {/* 右边：日期 + 三点菜单 */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#666", fontSize: "14px" }}>
                    {game.createdDate?.substring(0, 10)}
                </span>
                <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={["click"]}>
                    <EllipsisOutlined
                        style={{ fontSize: "20px", cursor: "pointer", color: "#888" }}
                    />
                </Dropdown>
            </div>
        </div>
    );
};
