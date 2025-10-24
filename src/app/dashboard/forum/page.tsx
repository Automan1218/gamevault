// src/app/dashboard/forum/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { navigationRoutes } from '@/lib/navigation';
import { useRouter } from 'next/navigation';
import { Menubar } from '@/components/layout';
import {
    Avatar,
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Row,
    Space,
    Spin,
    Tag,
    Typography,
    ConfigProvider,
    List,
    Carousel,
    App,
} from 'antd';
import {
    CommentOutlined,
    EyeOutlined,
    FileTextOutlined,
    MailOutlined,
    LikeOutlined,
    MessageOutlined,
    PlusOutlined,
    UserOutlined,
    FireOutlined,
    ClockCircleOutlined,
    StarOutlined,
    TrophyOutlined,
    CrownOutlined,
} from '@ant-design/icons';
// Import API from your existing API files
import { AuthApi } from '@/lib/api/auth';
import { useForum } from "@/app/features/forum/hooks/useForum";
import { ForumPost } from "@/app/features/forum/types/forumTypes";
import { darkTheme, cardStyle } from '@/components/common/theme';
import '@/components/common/animations.css';
import { PostStateManager } from '@/lib/api/PostStateManager';
import { getAvatarUrl, handleAvatarError, getDefaultAvatarStyle } from '@/lib/api/avatar';

const { Title, Text, Paragraph } = Typography;

export default function ForumPage() {
    const {
        posts,
        loading,
        error,
        loadMore,
        toggleLike
    } = useForum();

    const router = useRouter();
    const [activeTab, setActiveTab] = useState('latest');
    const [mounted, setMounted] = useState(false);
    const { message } = App.useApp();
    const [isHovered, setIsHovered] = useState(false);
    // Hot games data
    const hotGames = [
        {
            id: 1,
            name: 'Genshin Impact',
            description: 'Open World Adventure Game',
            icon: '🎮',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            players: '1.25M Online',
            posts: '8.5K Discussions',
        },
        {
            id: 2,
            name: 'League of Legends',
            description: 'Classic MOBA Game',
            icon: '⚔️',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            players: '980K Online',
            posts: '12.3K Discussions',
        },
        {
            id: 3,
            name: 'Counter-Strike: Global Offensive',
            description: 'First-Person Shooter',
            icon: '🔫',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            players: '760K Online',
            posts: '6.8K Discussions',
        },
        {
            id: 4,
            name: 'Valorant',
            description: 'Tactical Shooter Game',
            icon: '💎',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            players: '540K Online',
            posts: '4.2K Discussions',
        },
    ];

    useEffect(() => {
        setMounted(true);
    }, []);

    const isLoggedIn = mounted ? AuthApi.isAuthenticated() : false;

    // When clicking post card
    const handlePostClick = (contentId: number) => {
        // 1. First use PostStateManager to set the current post to view
        PostStateManager.setCurrentPost(contentId);

        // 2. Then navigate to detail page (without ID parameter)
        router.push(navigationRoutes.forumDetail);
    }

    // Like post
    const handleLikePost = async (postId: number) => {
        try {
            const liked = await toggleLike(postId);
            message.success(liked ? 'Liked successfully' : 'Unliked');
        } catch (error) {
            message.error('Operation failed');
        }
    };

    // Render post card
    const renderPostCard = (post: ForumPost) => (
        <Card
            hoverable
            className="animate-card-hover"
            style={{
                marginBottom: 20,
                ...cardStyle,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
            }}
            styles={{ body: { padding: '24px' } }}
            onClick={() => handlePostClick(post.contentId)}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* Post header: tags and time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="small">
                        <Tag 
                            color="purple" 
                            style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '2px 12px',
                                fontSize: '12px',
                                fontWeight: 600,
                            }}
                        >
                            Topic
                        </Tag>
                        {post.viewCount > 1000 && (
                            <Tag 
                                icon={<FireOutlined />}
                                color="error" 
                                style={{
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '2px 12px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                }}
                            >
                                Hot
                            </Tag>
                        )}
                    </Space>
                    <Text 
                        type="secondary" 
                        style={{ 
                            fontSize: '13px',
                            color: '#9ca3af',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <ClockCircleOutlined />
                        {new Date(post.createdDate).toLocaleDateString()}
                    </Text>
                </div>

                {/* Post title */}
                <Title 
                    level={4} 
                    style={{
                        margin: 0,
                        color: '#f9fafb',
                        fontSize: '20px',
                    fontWeight: 600,
                        lineHeight: 1.4,
                    }}
                >
                    {post.title}
                </Title>

                {/* Post content summary */}
                {post.bodyPlain && (
                    <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{
                            margin: 0,
                            color: '#9ca3af',
                            fontSize: '14px',
                            lineHeight: 1.6,
                        }}
                    >
                        {post.bodyPlain.substring(0, 150)}
                    </Paragraph>
                )}

                <Divider style={{ margin: '12px 0', borderColor: 'rgba(99, 102, 241, 0.2)' }} />

                {/* Post footer: author and interaction data */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Author information */}
                    <Space size="small">
                        <Avatar
                            size={32}
                            src={getAvatarUrl(post.authorAvatar)}
                            icon={<UserOutlined />}
                            onError={() => {
                                handleAvatarError(new Error('Avatar loading failed'), true);
                                return false;
                            }}
                            style={getDefaultAvatarStyle(32)}
                        />
                        <Text style={{ color: '#d1d5db', fontSize: '14px', fontWeight: 500 }}>
                                    {post.authorNickname || post.authorUsername || post.authorName || `User${post.authorId}`}
                        </Text>
                    </Space>

                    {/* Interaction data */}
                    <Space size="large">
                        <Space size={4} style={{ color: '#9ca3af', fontSize: '14px' }}>
                            <EyeOutlined />
                            <span>{post.viewCount || 0}</span>
                        </Space>
                        <Space size={4} style={{ color: '#9ca3af', fontSize: '14px' }}>
                            <MessageOutlined />
                            <span>{post.replyCount || 0}</span>
                </Space>
                        <Space 
                            size={4} 
                            style={{ 
                                color: post.isLiked ? '#ef4444' : '#9ca3af',
                                fontSize: '14px',
                                cursor: 'pointer',
                            }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                handleLikePost(post.contentId);
                            }}
                        >
                            <LikeOutlined />
                            <span>{post.likeCount}</span>
                        </Space>
                    </Space>
                </div>
            </Space>
        </Card>
    );

    // Render hot topics sidebar
    const renderHotTopics = () => {
        const hotTopics = [
            { id: 1, title: 'Latest Game Recommendations', icon: <FireOutlined />, count: 2341 },
            { id: 2, title: 'Game Strategy Sharing', icon: <TrophyOutlined />, count: 1892 },
            { id: 3, title: 'Player Communication', icon: <CommentOutlined />, count: 1654 },
            { id: 4, title: 'Game Reviews', icon: <StarOutlined />, count: 1423 },
            { id: 5, title: 'Game News', icon: <FileTextOutlined />, count: 1201 },
        ];

        return (
            <Card 
                title={
                    <Space>
                        <FireOutlined style={{ color: '#ef4444' }} />
                        <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>Hot Topics</span>
                    </Space>
                }
                style={{
                    ...cardStyle,
                    marginBottom: 20,
                }}
                styles={{ body: { padding: '16px' } }}
            >
                <List
                    dataSource={hotTopics}
                    renderItem={(topic, index) => (
                        <List.Item
                            style={{
                                border: 'none',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '8px',
                                background: 'rgba(31, 41, 55, 0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Space>
                                    <span style={{ 
                                        color: index < 3 ? '#ef4444' : '#9ca3af',
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                    }}>
                                        {index + 1}
                                    </span>
                                    <span style={{ color: '#6366f1' }}>{topic.icon}</span>
                                    <Text style={{ color: '#d1d5db', fontSize: '14px' }}>{topic.title}</Text>
                                </Space>
                                <Text type="secondary" style={{ fontSize: '12px', color: '#9ca3af' }}>
                                    {topic.count}
                                </Text>
                            </Space>
                        </List.Item>
                    )}
                />
            </Card>
        );
    };

    // Render active users sidebar
    const renderActiveUsers = () => {
        const activeUsers = [
            { id: 1, name: 'Game Master 01', posts: 245, icon: '🏆' },
            { id: 2, name: 'Game Enthusiast', posts: 189, icon: '⭐' },
            { id: 3, name: 'Strategy Expert', posts: 167, icon: '💎' },
        ];

        return (
            <Card 
                title={
                    <Space>
                        <CrownOutlined style={{ color: '#fbbf24' }} />
                        <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>Active Users</span>
                    </Space>
                }
                style={{
                    ...cardStyle,
                    marginBottom: 20,
                }}
                styles={{ body: { padding: '16px' } }}
            >
                <List
                    dataSource={activeUsers}
                    renderItem={(user, index) => (
                        <List.Item
                            style={{
                                border: 'none',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '8px',
                                background: 'rgba(31, 41, 55, 0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <Space>
                                <span style={{ fontSize: '24px' }}>{user.icon}</span>
                                <div>
                                    <div style={{ color: '#d1d5db', fontSize: '14px', fontWeight: 500 }}>
                                        {user.name}
                                    </div>
                                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                                        {user.posts} posts
                                    </div>
                                </div>
                            </Space>
                        </List.Item>
                    )}
                />
            </Card>
        );
    };

    if (!mounted) {
        return (
            <div style={{ 
                minHeight: '100vh',
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                background: `
                    radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
                    radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                    linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)
                `,
            }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <ConfigProvider theme={darkTheme}>
            {/* Top navigation bar */}
            <Menubar currentPath={navigationRoutes.forum} />
            
            {/* Main content area */}
            <div 
                className="animate-fade-in-up"
                style={{
                    padding:'24px',
                    position: 'relative',
                    minHeight: '100vh',
                    background: `
                        radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
                        radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                        radial-gradient(ellipse at center, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                        linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)
                    `,
                    paddingTop: '88px',
                    paddingBottom: '40px',

                }}
            >
            <div style={{ 
                    maxWidth: '1280px', 
                    margin: '0 auto', 
                    padding: '0 60px',
                }}>
                    <Row gutter={24}>
                        {/* Left main content area */}
                        <Col xs={24} lg={17}>
                            {/* Hot games carousel */}
                            <div style={{ marginBottom: 24 }}>
                                <Carousel 
                                    autoplay 
                                    autoplaySpeed={4000}
                                    dotPosition="bottom"
                                    effect="fade"
                                    style={{
                                        borderRadius: '24px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {hotGames.map((game) => (
                                        <div key={game.id}>
                                            <Card
                                                hoverable
                                                style={{
                                                    height: '280px',
                                                    background: game.gradient,
                                                    border: 'none',
                                                    borderRadius: '24px',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                }}
                                                styles={{ body: { 
                                                    padding: '40px',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                } }}
                                            >
                                                {/* Decorative background */}
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-50px',
                                                        right: '-50px',
                                                        width: '300px',
                                                        height: '300px',
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '50%',
                                                        filter: 'blur(40px)',
                                                    }}
                                                />
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '-80px',
                                                        left: '-80px',
                                                        width: '250px',
                                                        height: '250px',
                                                        background: 'rgba(0, 0, 0, 0.1)',
                                                        borderRadius: '50%',
                                                        filter: 'blur(40px)',
                                                    }}
                                                />

                                                {/* Game content */}
                                                <div style={{ position: 'relative', zIndex: 1 }}>
                                                    <div style={{ marginBottom: '16px' }}>
                                                        <span style={{ fontSize: '64px' }}>{game.icon}</span>
                                                    </div>
                                                    <Title 
                                                        level={2} 
                                                        style={{ 
                                                            margin: 0, 
                                                            color: '#fff',
                                                            fontSize: '36px',
                                                            fontWeight: 700,
                                                            textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                                        }}
                                                    >
                                                        {game.name}
                                                    </Title>
                                                    <Text 
                                                        style={{ 
                                                            fontSize: '16px',
                                                            color: 'rgba(255, 255, 255, 0.9)',
                                                            display: 'block',
                                                            marginTop: '8px',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {game.name}
                                                    </Text>
                                                    <Text 
                                                        style={{ 
                                                            fontSize: '14px',
                                                            color: 'rgba(255, 255, 255, 0.8)',
                                                            display: 'block',
                                                            marginTop: '12px',
                                                        }}
                                                    >
                                                        {game.description}
                                                    </Text>
                                                </div>

                                                {/* Game statistics */}
                                                <div style={{ position: 'relative', zIndex: 1 }}>
                                                    <Row gutter={24}>
                                                        <Col span={12}>
                                                            <div style={{
                                                                background: 'rgba(255, 255, 255, 0.2)',
                                                                backdropFilter: 'blur(10px)',
                                                                padding: '16px',
                                                                borderRadius: '16px',
                                                                textAlign: 'center',
                                                            }}>
                                                                <UserOutlined style={{ fontSize: '24px', color: '#fff' }} />
                                                                <div style={{
                                                                    color: '#fff',
                                                                    fontSize: '18px',
                                                                    fontWeight: 'bold',
                                                                    marginTop: '8px',
                                                                }}>
                                                                    {game.players}
                                                                </div>
                                                            </div>
                        </Col>
                                                        <Col span={12}>
                                                            <div style={{
                                                                background: 'rgba(255, 255, 255, 0.2)',
                                                                backdropFilter: 'blur(10px)',
                                                                padding: '16px',
                                                                borderRadius: '16px',
                                                                textAlign: 'center',
                                                            }}>
                                                                <CommentOutlined style={{ fontSize: '24px', color: '#fff' }} />
                                                                <div style={{
                                                                    color: '#fff',
                                                                    fontSize: '18px',
                                                                    fontWeight: 'bold',
                                                                    marginTop: '8px',
                                                                }}>
                                                                    {game.posts}
                                                                </div>
                                                            </div>
                        </Col>
                    </Row>
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </Carousel>
                            </div>

                    {/* Post button */}


                            {/* Tag navigation */}
                            <Card 
                                style={{
                                    ...cardStyle,
                                    marginBottom: 24,
                                }}
                                styles={{ body: { padding: '16px 24px' } }}
                            >
                                <Space size="large">
                                    <Button
                                        type={activeTab === 'latest' ? 'primary' : 'text'}
                                        icon={<ClockCircleOutlined />}
                                        size="large"
                                        onClick={() => setActiveTab('latest')}
                                        style={{
                                            background: activeTab === 'latest' 
                                                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                                                : 'transparent',
                                            border: 'none',
                                            color: activeTab === 'latest' ? '#fff' : '#9ca3af',
                                            fontWeight: 600,
                                            borderRadius: '12px',
                                        }}
                                    >
                                        Latest
                                    </Button>
                                    <Button
                                        type={activeTab === 'hot' ? 'primary' : 'text'}
                                        icon={<FireOutlined />}
                                        size="large"
                                        onClick={() => setActiveTab('hot')}
                                        style={{
                                            background: activeTab === 'hot' 
                                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                                                : 'transparent',
                                            border: 'none',
                                            color: activeTab === 'hot' ? '#fff' : '#9ca3af',
                                            fontWeight: 600,
                                            borderRadius: '12px',
                                        }}
                                    >
                                        Popular
                                    </Button>
                                </Space>
                            </Card>

                    {/* Post list */}
                                        <div>
                                            {loading && posts.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                                                    <Spin size="large" />
                                        <div style={{ marginTop: 16, color: '#9ca3af' }}>Loading...</div>
                                                </div>
                                            ) : error ? (
                                    <Card style={cardStyle}>
                                        <Empty 
                                            description={<span style={{ color: '#9ca3af' }}>{error}</span>} 
                                        />
                                    </Card>
                                            ) : posts.length === 0 ? (
                                    <Card style={cardStyle}>
                                        <Empty 
                                            description={<span style={{ color: '#9ca3af' }}>No posts yet</span>} 
                                        />
                                    </Card>
                                            ) : (
                                                <>
                                                    {posts.map(post => (
                                                        <React.Fragment key={post.contentId}>
                                                            {renderPostCard(post)}
                                                        </React.Fragment>
                                                    ))}
                                                    {posts.length > 0 && (
                                            <div style={{ textAlign: 'center', marginTop: 24 }}>
                                                            <Button
                                                    size="large"
                                                                loading={loading}
                                                                disabled={!posts.length}
                                                    onClick={loadMore}
                                                    style={{
                                                        height: 48,
                                                        padding: '0 32px',
                                                        borderRadius: '12px',
                                                        background: 'rgba(31, 41, 55, 0.8)',
                                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                                        color: '#d1d5db',
                                                        fontWeight: 600,
                                                    }}
                                                            >
                                                                Load More
                                                            </Button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                        </Col>

                        {/* Right sidebar */}
                        <Col xs={0} lg={7}>
                            {/* Hot topics */}
                            {renderHotTopics()}
                            
                            {/* Active users */}
                            {renderActiveUsers()}

                            {/* Forum rules */}
                            <Card 
                                title={
                                    <Space>
                                        <FileTextOutlined style={{ color: '#06b6d4' }} />
                                        <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>Forum Rules</span>
                                    </Space>
                                }
                                style={cardStyle}
                                styles={{ body: { padding: '16px' } }}
                            >
                                <div style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.8 }}>
                                    <p style={{ margin: '8px 0' }}>• Communicate friendly and respect others</p>
                                    <p style={{ margin: '8px 0' }}>• Prohibited to post illegal content</p>
                                    <p style={{ margin: '8px 0' }}>• No malicious spamming</p>
                                    <p style={{ margin: '8px 0' }}>• Please indicate source for original content</p>
                                    <p style={{ margin: '8px 0' }}>• Work together to maintain a good environment</p>
                                </div>
                    </Card>
                        </Col>
                    </Row>
                </div>
            </div>
            {isLoggedIn && (

                <Button
                    type="primary"
                    style={{
                        position: 'fixed',
                        right: 20,
                        bottom: 32,
                        width: isHovered ? 180 : 64,
                        height: 64,
                        fontSize: 24,
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                        border: 'none',
                        borderRadius: isHovered ? '32px' : '50%',
                        boxShadow: isHovered
                            ? '0 12px 48px rgba(99, 102, 241, 0.5)'
                            : '0 8px 32px rgba(99, 102, 241, 0.4)',
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isHovered ? 'flex-start' : 'center',
                        padding: isHovered ? '0 20px' : 0,
                        overflow: 'hidden',

                    }}

                    onClick={() => router.push(navigationRoutes.postCreate)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <MailOutlined
                        style={{
                            position: 'absolute',
                            left: isHovered ? 20 : '50%',
                            top: '50%',
                            transform: isHovered ? 'translate(0, -50%)' : 'translate(-50%, -50%)',
                            fontSize: '24px',
                            color: '#fff',
                            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            zIndex: 1,
                        }}
                    />
                    <span
                        style={{
                            position: 'absolute',
                            left: 56,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            opacity: isHovered ? 1 : 0,
                            whiteSpace: 'nowrap',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#fff',
                            transition: 'opacity 0.3s ease',
                            pointerEvents: 'none',
                        }}
                    >
                        New Post
                    </span>
                </Button>
            )}
        </ConfigProvider>
    );
}