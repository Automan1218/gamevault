// src/app/dashboard/forum/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menubar } from '@/components/layout';
import {
    Avatar,
    Button,
    Card,
    Col,
    ConfigProvider,
    Divider,
    Dropdown,
    Empty,
    List,
    message,
    Modal,
    Pagination,
    Row,
    Space,
    Spin,
    Tabs,
    Tag,
    Typography,
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CommentOutlined,
    DeleteOutlined,
    EditOutlined,
    EllipsisOutlined,
    EyeOutlined,
    FileTextOutlined,
    HeartOutlined,
    LikeOutlined,
    MessageOutlined,
    PlusOutlined,
    UserOutlined,
    TrophyOutlined,
    FireOutlined,
    StarOutlined,
} from '@ant-design/icons';

import { PostsApi, Post } from '@/lib/api/posts';
import { AuthApi } from '@/lib/api/auth';
import { UsersApi } from "@/lib/api/users";
import { navigationRoutes } from '@/lib/navigation';
import { darkTheme, cardStyle } from '@/components/common/theme';
import { PostStateManager } from '@/lib/api/PostStateManager';
import '@/components/common/animations.css';
import { getAvatarUrl, handleAvatarError, getDefaultAvatarStyle } from '@/lib/api/avatar';
import { ProfileApi } from '@/lib/api/profile';

const { Title, Text, Paragraph } = Typography;

// Directly use Post type, add additional optional fields
interface PostItem extends Post {
    category?: string;
    tags?: string[];
    isPinned?: boolean;
    isEssence?: boolean;
}

interface PostStats {
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
    totalReplies: number;
}

export default function MyPostsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [myPosts, setMyPosts] = useState<PostItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPosts, setTotalPosts] = useState(0);
    const [activeTab, setActiveTab] = useState('published');
    const [stats, setStats] = useState<PostStats>({
        totalPosts: 0,
        totalViews: 0,
        totalLikes: 0,
        totalReplies: 0,
    });
    const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    // User information
    const [userId, setUserId] = useState<number | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        setMounted(true);
        (async () => {
            // Clear cache to ensure getting latest user information
            UsersApi.clearUserCache();

            const [id, name] = await Promise.all([
                UsersApi.getUserId(),
                UsersApi.getUsername(),
            ]);
            setUserId(id);
            setUsername(name);

            // Get user avatar
            try {
                const profile = await ProfileApi.getProfile();
                setAvatarUrl(profile.avatarUrl);
            } catch (error) {
                console.warn('Failed to get user avatar:', error);
                setAvatarUrl(undefined);
            }
        })();
    }, []);

    // Check login status
    useEffect(() => {
        if (mounted && !AuthApi.isAuthenticated()) {
            message.warning('Please login first');
            router.push('/login');
        }
    }, [mounted]);

    // Get my posts
    const fetchMyPosts = async (page: number = 1) => {
        if (!userId) return;

        try {
            setLoading(true);

            // Use PostsApi to call get user posts API
            const data = await PostsApi.getUserPosts(userId, page - 1, pageSize);

            setMyPosts(data.posts as PostItem[] || []);
            setTotalPosts(data.totalCount || 0);

            // Calculate statistics
            calculateStats(data.posts as PostItem[] || []);
        } catch (error) {
            console.error('Failed to get my posts:', error);
            message.error('Failed to get post list');
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const calculateStats = (posts: PostItem[]) => {
        const stats = posts.reduce((acc, post) => ({
            totalPosts: acc.totalPosts + 1,
            totalViews: acc.totalViews + (post.viewCount || 0),
            totalLikes: acc.totalLikes + (post.likeCount || 0),
            totalReplies: acc.totalReplies + (post.replyCount || 0),
        }), {
            totalPosts: 0,
            totalViews: 0,
            totalLikes: 0,
            totalReplies: 0,
        });

        setStats(stats);
    };

    // Delete post
    const handleDeletePost = async () => {
        if (!selectedPost) return;

        try {
            await PostsApi.deletePost(selectedPost.contentId);
            message.success('Deleted successfully');
            setDeleteModalVisible(false);
            setSelectedPost(null);
            await fetchMyPosts(currentPage);
        } catch (error) {
            message.error('Delete failed');
        }
    };

    // Edit post
    const handleEditPost = (postId: number) => {
        router.push(`/post/edit/${postId}`);
    };

    // Initialize
    useEffect(() => {
        if (userId) {
            fetchMyPosts(1);
        }
    }, [userId]);

    // Render post card
    const renderPostCard = (post: PostItem) => {
        const menuItems = [
            {
                key: 'edit',
                label: 'Edit',
                icon: <EditOutlined />,
                onClick: () => handleEditPost(post.contentId),
            },
            {
                key: 'delete',
                label: 'Delete',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => {
                    setSelectedPost(post);
                    setDeleteModalVisible(true);
                },
            },
        ];

        return (
            <Card
                key={post.contentId}
                hoverable
                className="animate-card-hover"
                style={{
                    marginBottom: 20,
                    ...cardStyle,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                }}
                styles={{ body: { padding: '24px' } }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {/* Post header: tags and time */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space size="small">
                            {post.isPinned && (
                                <Tag
                                    color="red"
                                    style={{
                                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '2px 12px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                    }}
                                >
                                    Pinned
                                </Tag>
                            )}
                            {post.isEssence && (
                                <Tag
                                    color="gold"
                                    style={{
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '2px 12px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                    }}
                                >
                                    Featured
                                </Tag>
                            )}
                            <Tag
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '2px 12px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#fff',
                                }}
                            >
                                {post.category || 'Discussion'}
                            </Tag>
                        </Space>
                        <Space>
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
                            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                                <Button
                                    type="text"
                                    icon={<EllipsisOutlined />}
                                    style={{
                                        color: '#9ca3af',
                                        transition: 'all 0.3s ease',
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </Dropdown>
                        </Space>
                    </div>

                    {/* Post title */}
                    <div onClick={() => {
                        PostStateManager.setCurrentPost(post.contentId);
                        router.push(navigationRoutes.forumDetail);
                    }}>
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
                    </div>

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
                            onClick={() => {
                                PostStateManager.setCurrentPost(post.contentId);
                                router.push(navigationRoutes.forumDetail);
                            }}
                        >
                            {post.bodyPlain.substring(0, 150)}
                        </Paragraph>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <Space size={4} wrap>
                            {post.tags.map(tag => (
                                <Tag
                                    key={tag}
                                    style={{
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                        color: '#a5b4fc',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                    }}
                                >
                                    {tag}
                                </Tag>
                            ))}
                        </Space>
                    )}

                    <Divider style={{ margin: '12px 0', borderColor: 'rgba(99, 102, 241, 0.2)' }} />

                    {/* Post footer: interaction data */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Space size="large">
                            <Space size={4} style={{ color: '#9ca3af', fontSize: '14px' }}>
                                <EyeOutlined />
                                <span>{post.viewCount || 0}</span>
                            </Space>
                            <Space size={4} style={{ color: '#9ca3af', fontSize: '14px' }}>
                                <MessageOutlined />
                                <span>{post.replyCount || 0}</span>
                            </Space>
                            <Space size={4} style={{ color: '#9ca3af', fontSize: '14px' }}>
                                <LikeOutlined />
                                <span>{post.likeCount || 0}</span>
                            </Space>
                        </Space>
                    </div>
                </Space>
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
            <Menubar currentPath={navigationRoutes.myPosts} />

            {/* Main content area */}
            <div
                className="animate-fade-in-up"
                style={{
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
                    {/* User information card */}
                    <Card
                        className="animate-card-hover"
                        style={{
                            ...cardStyle,
                            marginBottom: 24,
                        }}
                        styles={{ body: { padding: '32px' } }}
                    >
                        <Row gutter={24} align="middle">
                            <Col key="user-avatar" flex="none">
                                <Avatar
                                    size={80}
                                    src={getAvatarUrl(avatarUrl)}
                                    icon={<UserOutlined />}
                                    onError={() => {
                                        handleAvatarError(new Error('Avatar loading failed'), true);
                                        return false;
                                    }}
                                    style={{
                                        ...getDefaultAvatarStyle(80),
                                        border: '3px solid rgba(99, 102, 241, 0.3)',
                                    }}
                                >
                                    {!avatarUrl && username?.charAt(0).toUpperCase()}
                                </Avatar>
                            </Col>
                            <Col key="user-info" flex="auto">
                                <Space direction="vertical" size={4}>
                                    <Title level={3} style={{ margin: 0, color: '#f9fafb', fontWeight: 700 }}>
                                        {username || 'User'}
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: '14px', color: '#9ca3af' }}>
                                        User ID: {userId}
                                    </Text>
                                </Space>
                            </Col>
                            <Col key="user-action" flex="none">
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    size="large"
                                    onClick={() => router.push(navigationRoutes.postCreate)}
                                    style={{
                                        height: '48px',
                                        padding: '0 28px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                        transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                                    }}
                                >
                                    Create New Post
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    {/* Statistics */}
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col key="stat-posts" xs={12} sm={6}>
                            <Card
                                className="animate-card-hover"
                                style={{
                                    ...cardStyle,
                                    textAlign: 'center',
                                }}
                                styles={{ body: { padding: '24px' } }}
                            >
                                <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                                    <FileTextOutlined style={{ color: '#6366f1' }} />
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#f9fafb', marginBottom: '4px' }}>
                                    {stats.totalPosts}
                                </div>
                                <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                                    Total Posts
                                </div>
                            </Card>
                        </Col>
                        <Col key="stat-views" xs={12} sm={6}>
                            <Card
                                className="animate-card-hover"
                                style={{
                                    ...cardStyle,
                                    textAlign: 'center',
                                }}
                                styles={{ body: { padding: '24px' } }}
                            >
                                <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                                    <EyeOutlined style={{ color: '#06b6d4' }} />
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#f9fafb', marginBottom: '4px' }}>
                                    {stats.totalViews}
                                </div>
                                <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                                    Total Views
                                </div>
                            </Card>
                        </Col>
                        <Col key="stat-likes" xs={12} sm={6}>
                            <Card
                                className="animate-card-hover"
                                style={{
                                    ...cardStyle,
                                    textAlign: 'center',
                                }}
                                styles={{ body: { padding: '24px' } }}
                            >
                                <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                                    <LikeOutlined style={{ color: '#ef4444' }} />
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#f9fafb', marginBottom: '4px' }}>
                                    {stats.totalLikes}
                                </div>
                                <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                                    Total Likes
                                </div>
                            </Card>
                        </Col>
                        <Col key="stat-replies" xs={12} sm={6}>
                            <Card
                                className="animate-card-hover"
                                style={{
                                    ...cardStyle,
                                    textAlign: 'center',
                                }}
                                styles={{ body: { padding: '24px' } }}
                            >
                                <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                                    <CommentOutlined style={{ color: '#fbbf24' }} />
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#f9fafb', marginBottom: '4px' }}>
                                    {stats.totalReplies}
                                </div>
                                <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                                    Total Replies
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Post list */}
                    <Card
                        style={cardStyle}
                        styles={{ body: { padding: '24px' } }}
                    >
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            size="large"
                            items={[
                                {
                                    key: 'published',
                                    label: (
                                        <span style={{ fontSize: '16px', fontWeight: 600 }}>
                                            <FileTextOutlined /> Published
                                        </span>
                                    ),
                                    children: (
                                        <Spin spinning={loading}>
                                            {myPosts.length > 0 ? (
                                                <>
                                                    <div>
                                                        {myPosts.map(post => renderPostCard(post))}
                                                    </div>
                                                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                                                        <Pagination
                                                            current={currentPage}
                                                            total={totalPosts}
                                                            pageSize={pageSize}
                                                            onChange={(page) => {
                                                                setCurrentPage(page);
                                                                fetchMyPosts(page);
                                                            }}
                                                            showSizeChanger={false}
                                                            style={{
                                                                display: 'inline-block',
                                                            }}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <Empty
                                                    description={
                                                        <span style={{ color: '#9ca3af', fontSize: '16px' }}>
                                                            No posts published yet
                                                        </span>
                                                    }
                                                    style={{ padding: '60px 0' }}
                                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                >
                                                    <Button
                                                        type="primary"
                                                        size="large"
                                                        icon={<PlusOutlined />}
                                                        onClick={() => router.push(navigationRoutes.postCreate)}
                                                        style={{
                                                            height: '48px',
                                                            padding: '0 28px',
                                                            fontSize: '16px',
                                                            fontWeight: 600,
                                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                                                            border: 'none',
                                                            borderRadius: '12px',
                                                        }}
                                                    >
                                                        Publish First Post
                                                    </Button>
                                                </Empty>
                                            )}
                                        </Spin>
                                    )
                                },
                                {
                                    key: 'drafts',
                                    label: (
                                        <span style={{ fontSize: '16px', fontWeight: 600 }}>
                                            <EditOutlined /> Drafts
                                        </span>
                                    ),
                                    children: (
                                        <Empty
                                            description={
                                                <span style={{ color: '#9ca3af', fontSize: '16px' }}>
                                                    No drafts
                                                </span>
                                            }
                                            style={{ padding: '60px 0' }}
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    )
                                },
                                {
                                    key: 'deleted',
                                    label: (
                                        <span style={{ fontSize: '16px', fontWeight: 600 }}>
                                            <DeleteOutlined /> Trash
                                        </span>
                                    ),
                                    children: (
                                        <Empty
                                            description={
                                                <span style={{ color: '#9ca3af', fontSize: '16px' }}>
                                                    Trash is empty
                                                </span>
                                            }
                                            style={{ padding: '60px 0' }}
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    )
                                }
                            ]}
                        />
                    </Card>
                </div>
            </div>

            {/* Delete confirmation modal */}
            <Modal
                title={
                    <span style={{ fontSize: '18px', fontWeight: 600, color: '#f9fafb' }}>
                        Confirm Delete
                    </span>
                }
                open={deleteModalVisible}
                onOk={handleDeletePost}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setSelectedPost(null);
                }}
                okText="Confirm Delete"
                cancelText="Cancel"
                okButtonProps={{
                    danger: true,
                    size: 'large',
                    style: { fontWeight: 600 }
                }}
                cancelButtonProps={{
                    size: 'large',
                    style: { fontWeight: 600 }
                }}
                centered
            >
                <div style={{ padding: '20px 0' }}>
                    <p style={{ fontSize: '16px', color: '#d1d5db', marginBottom: '8px' }}>
                        Are you sure you want to delete the post "<span style={{ color: '#f9fafb', fontWeight: 600 }}>{selectedPost?.title}</span>"?
                    </p>
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                        This action cannot be undone.
                    </p>
                </div>
            </Modal>
        </ConfigProvider>
    );
}