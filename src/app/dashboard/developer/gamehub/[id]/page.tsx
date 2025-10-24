"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin, Card, Button, message, Typography, Space, Row, Col, Tag, Divider, Statistic, Tooltip } from "antd";
import { usePublicGameDetail } from "@/app/features/devgames/hooks/usePublicGameDetail";
import { 
    ArrowLeftOutlined, 
    DownloadOutlined, 
    EyeOutlined, 
    CalendarOutlined, 
    UserOutlined,
    PlayCircleOutlined,
    FileZipOutlined,
    TrophyOutlined,
    FireOutlined
} from "@ant-design/icons";
import { cardStyle, titleStyle, primaryButtonStyle } from "@/components/common/theme";

const { Title, Text, Paragraph } = Typography;
export const dynamic = 'force-dynamic';
export default function PublicGameDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { game, loading, error } = usePublicGameDetail(id as string);

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !game) {
        return (
            <div style={{ 
                textAlign: "center", 
                padding: "100px 0",
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                minHeight: '100vh',
                color: '#e5e7eb'
            }}>
                <Title level={2} style={{ color: '#e5e7eb' }}>Game not found</Title>
                <Text style={{ color: '#9ca3af' }}>The game you're looking for doesn't exist or has been removed.</Text>
            </div>
        );
    }

    const handleDownload = () => {
                        if (!game.zipUrl) {
                            message.error("No download link available");
                            return;
                        }

                        // ✅ Direct browser to download URL
                        const a = document.createElement("a");
                        a.href = game.zipUrl;
                        a.download = ""; // Optional: prompt browser to download instead of opening
                        a.target = "_blank"; // Prevent blocking current page
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);

                        message.success("Download started ✅");
    };

    return (
        <div
            style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                minHeight: "100vh",
                padding: "40px 20px",
                fontFamily: "Inter, sans-serif",
            }}
        >
            {/* Top Navigation */}
            <div style={{ maxWidth: 1200, margin: "0 auto 40px auto" }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    size="large"
                    style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: '#6366f1',
                        height: '48px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                    }}
                >
                    Back to Game Hub
                </Button>
            </div>

            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <Row gutter={[32, 32]}>
                    {/* Left: Game cover and video */}
                    <Col xs={24} lg={14}>
                        <Card
                            style={{
                                ...cardStyle,
                                padding: 0,
                                overflow: 'hidden',
                                marginBottom: '24px',
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={game.coverImageUrl ?? "/placeholder.png"}
                                    alt={game.name}
                                    style={{
                                        width: "100%",
                                        height: "400px",
                                        objectFit: "cover",
                                    }}
                                />
                                {/* Game title overlay */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'linear-gradient(to top, rgba(15,23,42,0.95), transparent)',
                                    padding: '32px',
                                }}>
                                    <Title level={1} style={{ 
                                        color: '#fff', 
                                        margin: 0, 
                                        textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                                        fontSize: '36px',
                                        fontWeight: 700,
                                    }}>
                                        {game.name}
                                    </Title>
                                </div>
                            </div>
                        </Card>

                        {/* Game video */}
                        {game.videoUrl && (
                            <Card style={{ ...cardStyle, marginBottom: '24px' }}>
                                <Space align="center" style={{ marginBottom: '16px' }}>
                                    <PlayCircleOutlined style={{ color: '#6366f1', fontSize: '20px' }} />
                                    <Text strong style={{ color: '#e5e7eb', fontSize: '18px' }}>
                                        Gameplay Video
                                    </Text>
                                </Space>
                                <video
                                    key={game.videoUrl}
                                    src={game.videoUrl}
                                    controls
                                    preload="metadata"
                                    style={{
                                        width: "100%",
                                        maxHeight: "400px",
                                        borderRadius: 12,
                                        background: "#000",
                                    }}
                                />
                            </Card>
                        )}
                    </Col>

                    {/* Right: Game information and download */}
                    <Col xs={24} lg={10}>
                        {/* Game statistics */}
                        <Card style={{ ...cardStyle, marginBottom: '24px' }}>
                            <Title level={4} style={{ color: '#e5e7eb', marginBottom: '24px' }}>
                                <TrophyOutlined style={{ marginRight: '8px', color: '#6366f1' }} />
                                Game Statistics
                            </Title>
                            
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Statistic
                                        title={
                                            <Space>
                                                <EyeOutlined style={{ color: '#06b6d4' }} />
                                                <Text style={{ color: '#9ca3af' }}>Views</Text>
                                            </Space>
                                        }
                                        value={(game as any).viewCount || 0}
                                        valueStyle={{ color: '#06b6d4' }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title={
                                            <Space>
                                                <DownloadOutlined style={{ color: '#10b981' }} />
                                                <Text style={{ color: '#9ca3af' }}>Downloads</Text>
                                            </Space>
                                        }
                                        value={(game as any).downloadCount || 0}
                                        valueStyle={{ color: '#10b981' }}
                                    />
                                </Col>
                            </Row>
                        </Card>

                        {/* Game information */}
                        <Card style={{ ...cardStyle, marginBottom: '24px' }}>
                            <Title level={4} style={{ color: '#e5e7eb', marginBottom: '24px' }}>
                                Game Information
                            </Title>
                            
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <div>
                                    <Space align="center" style={{ marginBottom: '8px' }}>
                                        <FileZipOutlined style={{ color: '#6366f1', fontSize: '16px' }} />
                                        <Text strong style={{ color: '#e5e7eb' }}>Game ID</Text>
                                    </Space>
                                    <div style={{ color: '#9ca3af', paddingLeft: '24px', fontFamily: 'monospace' }}>
                                        #{game.id}
                                    </div>
                                </div>

                                <div>
                                    <Space align="center" style={{ marginBottom: '8px' }}>
                                        <UserOutlined style={{ color: '#6366f1', fontSize: '16px' }} />
                                        <Text strong style={{ color: '#e5e7eb' }}>Status</Text>
                                    </Space>
                                    <div style={{ color: '#9ca3af', paddingLeft: '24px' }}>
                                        <Tag color="green" style={{ margin: 0 }}>
                                            Published
                                        </Tag>
                                    </div>
                                </div>
                            </Space>
                        </Card>

                        {/* Download area */}
                        <Card style={{ ...cardStyle }}>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                                padding: '24px',
                                borderRadius: '12px',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                textAlign: 'center',
                            }}>
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    <div>
                                        <DownloadOutlined style={{ fontSize: '48px', color: '#6366f1', marginBottom: '16px' }} />
                                        <Title level={4} style={{ color: '#e5e7eb', margin: 0 }}>
                                            Download Game
                                        </Title>
                                        <Text style={{ color: '#9ca3af' }}>
                                            Get the complete game package
                                        </Text>
                                    </div>

                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<DownloadOutlined />}
                                        onClick={handleDownload}
                                        style={{
                                            ...primaryButtonStyle,
                                            height: '56px',
                                            fontSize: '18px',
                                            width: '100%',
                                        }}
                                    >
                                        Download Now
                                    </Button>

                                    <Text style={{ color: '#9ca3af', fontSize: '12px' }}>
                                        Free download • No registration required
                                    </Text>
                                </Space>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Game description */}
                <Card style={{ ...cardStyle, marginTop: '24px' }}>
                    <Title level={4} style={{ color: '#e5e7eb', marginBottom: '24px' }}>
                        Game Description
                    </Title>
                    <Paragraph
                        style={{
                            color: '#9ca3af',
                            fontSize: '16px',
                            lineHeight: 1.8,
                            textAlign: 'justify',
                        }}
                    >
                        {game.description || "No description available for this game."}
                    </Paragraph>
            </Card>
            </div>
        </div>
    );
}
