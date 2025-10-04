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

import { PostsApi } from '@/lib/api/posts';
import { AuthApi } from '@/lib/api/auth';
import { UsersApi } from "@/lib/api/users";
import { navigationRoutes } from '@/lib/navigation';
import { darkTheme, cardStyle } from '@/components/common/theme';
import '@/components/common/animations.css';

const { Title, Text, Paragraph } = Typography;

interface PostItem {
    postId: number;
    title: string;
    body: string;
    bodyPlain: string;
    authorId: number;
    authorName?: string;
    viewCount: number;
    likeCount: number;
    replyCount: number;
    createdDate: string;
    updatedDate: string;
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

    // 用户信息
    const [userId, setUserId] = useState<number | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        (async () => {
            const [id, name] = await Promise.all([
                UsersApi.getUserId(),
                UsersApi.getUsername(),
            ]);
            setUserId(id);
            setUsername(name);
        })();
    }, []);

    // 检查登录状态
    useEffect(() => {
        if (mounted && !AuthApi.isAuthenticated()) {
            message.warning('请先登录');
            router.push('/login');
        }
    }, [mounted]);

    // 获取我的帖子
    const fetchMyPosts = async (page: number = 1) => {
        if (!userId) return;

        try {
            setLoading(true);

            // 使用 PostsApi 调用获取用户帖子的API
            const data = await PostsApi.getUserPosts(userId, page - 1, pageSize);

            setMyPosts(data.posts || []);
            setTotalPosts(data.totalCount || 0);

            // 计算统计数据
            calculateStats(data.posts || []);
        } catch (error) {
            console.error('获取我的帖子失败:', error);
            message.error('获取帖子列表失败');
        } finally {
            setLoading(false);
        }
    };

    // 计算统计数据
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

    // 删除帖子
    const handleDeletePost = async () => {
        if (!selectedPost) return;

        try {
            await PostsApi.deletePost(selectedPost.postId);
            message.success('删除成功');
            setDeleteModalVisible(false);
            setSelectedPost(null);
            await fetchMyPosts(currentPage);
        } catch (error) {
            message.error('删除失败');
        }
    };

    // 编辑帖子
    const handleEditPost = (postId: number) => {
        router.push(`/post/edit/${postId}`);
    };

    // 初始化
    useEffect(() => {
        if (userId) {
            fetchMyPosts(1);
        }
    }, [userId]);

    // 渲染帖子卡片
    const renderPostCard = (post: PostItem) => {
        const menuItems = [
            {
                key: 'edit',
                label: '编辑',
                icon: <EditOutlined />,
                onClick: () => handleEditPost(post.postId),
            },
            {
                key: 'delete',
                label: '删除',
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
                key={post.postId}
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
                    {/* 帖子头部：标签和时间 */}
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
                                    置顶
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
                                    精华
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
                                {post.category || '讨论'}
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

                    {/* 帖子标题 */}
                    <div onClick={() => router.push(`/post/${post.postId}`)}>
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

                    {/* 帖子内容摘要 */}
                    {post.bodyPlain && (
                        <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{
                                margin: 0,
                                color: '#9ca3af',
                                fontSize: '14px',
                                lineHeight: 1.6,
                            }}
                            onClick={() => router.push(`/post/${post.postId}`)}
                        >
                            {post.bodyPlain.substring(0, 150)}
                        </Paragraph>
                    )}

                    {/* 标签 */}
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

                    {/* 帖子底部：互动数据 */}
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
            {/* 顶部导航栏 */}
            <Menubar currentPath={navigationRoutes.myPosts} />

            {/* 主内容区 */}
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
                    {/* 用户信息卡片 */}
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
                                    icon={<UserOutlined />}
                                    style={{
                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        border: '3px solid rgba(99, 102, 241, 0.3)',
                                        fontSize: '36px',
                                    }}
                                >
                                    {username?.charAt(0).toUpperCase()}
                                </Avatar>
                            </Col>
                            <Col key="user-info" flex="auto">
                                <Space direction="vertical" size={4}>
                                    <Title level={3} style={{ margin: 0, color: '#f9fafb', fontWeight: 700 }}>
                                        {username || '用户'}
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: '14px', color: '#9ca3af' }}>
                                        用户ID: {userId}
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
                                    发布新帖
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    {/* 统计数据 */}
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
                                    总发帖数
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
                                    总浏览量
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
                                    获得点赞
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
                                    收到回复
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* 帖子列表 */}
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
                                            <FileTextOutlined /> 已发布
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
                                                            还没有发布过帖子
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
                                                        发布第一篇帖子
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
                                            <EditOutlined /> 草稿箱
                                        </span>
                                    ),
                                    children: (
                                        <Empty
                                            description={
                                                <span style={{ color: '#9ca3af', fontSize: '16px' }}>
                                                    暂无草稿
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
                                            <DeleteOutlined /> 回收站
                                        </span>
                                    ),
                                    children: (
                                        <Empty
                                            description={
                                                <span style={{ color: '#9ca3af', fontSize: '16px' }}>
                                                    回收站为空
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

            {/* 删除确认弹窗 */}
            <Modal
                title={
                    <span style={{ fontSize: '18px', fontWeight: 600, color: '#f9fafb' }}>
                        确认删除
                    </span>
                }
                open={deleteModalVisible}
                onOk={handleDeletePost}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setSelectedPost(null);
                }}
                okText="确认删除"
                cancelText="取消"
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
                        确定要删除帖子《<span style={{ color: '#f9fafb', fontWeight: 600 }}>{selectedPost?.title}</span>》吗？
                    </p>
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                        删除后将无法恢复。
                    </p>
                </div>
            </Modal>
        </ConfigProvider>
    );
}