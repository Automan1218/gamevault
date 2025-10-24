"use client";
import React from "react";
import type { MenuProps } from "antd";
import { Dropdown, App, Typography, Tag, Space } from "antd";
import { EllipsisOutlined, EyeOutlined, DownloadOutlined, CalendarOutlined } from "@ant-design/icons";
import { DevGame } from "@/app/features/devgames/types/devGameTypes";

const { Text } = Typography;

interface GameCardProps {
    game: DevGame;
    onDelete: (id: string) => void;
    onEdit?: (id: string) => void;
}
export const GameCard: React.FC<GameCardProps> = ({ game, onDelete, onEdit }) => {
    const { modal } = App.useApp();

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
        { key: "edit", label: "Edit", onClick: () => onEdit?.(game.id) },
        { key: "delete", label: "Delete", danger: true },
    ];

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "28px",
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(31, 41, 55, 0.6) 100%)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: "20px",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(31, 41, 55, 0.8) 100%)";
                e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(99, 102, 241, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.2)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(31, 41, 55, 0.6) 100%)";
                e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
            }} />
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '80px',
                height: '80px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translate(-20px, 20px)',
            }} />
            {/* Left cover + info */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1, position: "relative", zIndex: 1 }}>
                <div
                    style={{
                        width: "140px",
                        height: "90px",
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        border: "1px solid rgba(99, 102, 241, 0.4)",
                        position: "relative",
                        boxShadow: "0 4px 16px rgba(99, 102, 241, 0.2)",
                    }}
                >
                    {game.imageUrl ? (
                        <img
                            src={game.imageUrl}
                            alt={game.name}
                            style={{ 
                                width: "100%", 
                                height: "100%", 
                                objectFit: "cover",
                                borderRadius: "16px",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                color: "#6366f1",
                                fontWeight: 600,
                                fontSize: "14px",
                                textAlign: "center",
                            }}
                        >
                            No Image
                        </div>
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            color: "#f9fafb",
                            fontWeight: 700,
                            fontSize: "20px",
                            marginBottom: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        {game.name}
                        <Tag 
                            color="blue" 
                            style={{ 
                                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)", 
                                border: "1px solid rgba(99, 102, 241, 0.4)",
                                color: "#6366f1",
                                fontWeight: 600,
                                borderRadius: "8px",
                                padding: "4px 12px",
                            }}
                        >
                            Published
                        </Tag>
                    </div>
                    <Text 
                        style={{ 
                            color: "#9ca3af", 
                            fontSize: "15px",
                            display: "block",
                            marginBottom: "16px",
                            lineHeight: 1.5,
                        }}
                    >
                        {game.description?.length > 100
                            ? game.description.substring(0, 100) + "..."
                            : game.description || "No description available"}
                    </Text>
                    
                    {/* Statistics info */}
                    <Space size="large" wrap>
                        <Space size="small">
                            <EyeOutlined style={{ color: "#8b5cf6", fontSize: "14px" }} />
                            <Text style={{ color: "#9ca3af", fontSize: "13px", fontWeight: 500 }}>
                                {(game as any).viewCount || 0} views
                            </Text>
                        </Space>
                        <Space size="small">
                            <DownloadOutlined style={{ color: "#06b6d4", fontSize: "14px" }} />
                            <Text style={{ color: "#9ca3af", fontSize: "13px", fontWeight: 500 }}>
                                {(game as any).downloadCount || 0} downloads
                            </Text>
                        </Space>
                        <Space size="small">
                            <CalendarOutlined style={{ color: "#fbbf24", fontSize: "14px" }} />
                            <Text style={{ color: "#9ca3af", fontSize: "13px", fontWeight: 500 }}>
                                {game.createdDate?.substring(0, 10) || "Unknown date"}
                            </Text>
                        </Space>
                    </Space>
                </div>
            </div>

            {/* Right: action menu */}
            <div style={{ display: "flex", alignItems: "center", position: "relative", zIndex: 1 }}>
                <Dropdown 
                    menu={{ items, onClick: handleMenuClick }} 
                    trigger={["click"]}
                    placement="bottomRight"
                >
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: "0 2px 8px rgba(99, 102, 241, 0.1)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)";
                            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)";
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(99, 102, 241, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)";
                            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)";
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(99, 102, 241, 0.1)";
                        }}
                    >
                        <EllipsisOutlined
                            style={{ 
                                fontSize: "20px", 
                                color: "#6366f1",
                                fontWeight: 600,
                            }}
                        />
                    </div>
                </Dropdown>
            </div>
        </div>
    );
};