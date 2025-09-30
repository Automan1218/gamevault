// src/app/dashboard/forum/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { navigationRoutes } from '@/lib/navigation';
import { useRouter } from 'next/navigation';
import { Menubar } from '@/components/layout';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Input,
    message,
    Row,
    Space,
    Spin,
    Statistic,
    Tabs,
    Tag,
    Typography,
    ConfigProvider,
    theme,
} from 'antd';
import {
    BellOutlined,
    CommentOutlined,
    EyeOutlined,
    FileTextOutlined,
    HeartOutlined,
    LikeOutlined,
    MessageOutlined,
    PlusOutlined,
    ShareAltOutlined,
    UserOutlined,
} from '@ant-design/icons';
// Import API from your existing API files
import { PostsApi } from '@/lib/api/posts';
import { AuthApi } from '@/lib/api/auth';
import { useForum } from "@/app/features/forum/hooks/useForum";
import { ForumPost } from "@/app/features/forum/types/forumTypes";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

export default function ForumPage() {
    const {
        posts,
        loading,
        error,
        currentPage,
        refresh,
        loadMore,
        likePost,
        unlikePost
    } = useForum();

    const router = useRouter();
    const [darkMode, setDarkMode] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('latest');
    const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
    const [mounted, setMounted] = useState(false);

    // 论坛统计数据
    const [forumStats] = useState({
        totalPosts: 8542,
        todayPosts: 128,
        onlineUsers: 892,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const isLoggedIn = mounted ? AuthApi.isAuthenticated() : false;

    // 获取当前用户信息
    // const fetchCurrentUser = async () => {
    //     if (mounted && AuthApi.isAuthenticated()) {
    //         try {
    //             const user = await AuthApi.getCurrentUser();
    //             setCurrentUser(user);
    //         } catch (error) {
    //             console.error('获取用户信息失败:', error);
    //         }
    //     }
    // };

    // 搜索帖子
    const handleSearch = async (keyword: string) => {
        if (!keyword.trim()) {
            refresh();
            return;
        }

        try {
            setSearchLoading(true);
            const response = await PostsApi.searchPosts(keyword, 0, 20);
            message.success(`找到 ${response.totalCount} 条相关内容`);
        } catch (error) {
            console.error('搜索失败:', error);
            message.error('搜索失败，请稍后重试');
        } finally {
            setSearchLoading(false);
        }
    };

    // 删除帖子
    const handleDeletePost = async (postId: number) => {
        try {
            await PostsApi.deletePost(postId);
            message.success('删除成功');
            refresh();
        } catch (error) {
            message.error('删除失败');
        }
    };

    // 点赞帖子
    const handleLikePost = async (postId: number) => {
        try {
            if (likedPosts.has(postId)) {
                await unlikePost(postId);
                setLikedPosts(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(postId);
                    return newSet;
                });
                message.success('取消点赞');
            } else {
                await likePost(postId);
                setLikedPosts(prev => new Set(prev).add(postId));
                message.success('点赞成功');
            }
        } catch (error) {
            message.error('操作失败');
        }
    };

    // 初始化数据
    // useEffect(() => {
    //     fetchCurrentUser();
    // }, [fetchCurrentUser, mounted]);

    // 渲染帖子卡片
    const renderPostCard = (post: ForumPost) => (
        <Card
            hoverable
            style={{
                marginBottom: 16,
                background: darkMode ? '#1a1a1a' : '#fff',
                borderColor: darkMode ? '#333' : '#f0f0f0',
            }}
            onClick={() => router.push(navigationRoutes.postDetail(post.contentId))}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                    <Space size="small">
                        <Tag color="blue">讨论</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(post.createdDate).toLocaleDateString()}
                        </Text>
                    </Space>
                </div>

                <Title level={4} style={{
                    margin: '8px 0',
                    color: darkMode ? '#fff' : '#000',
                    fontSize: '18px',
                    fontWeight: 600,
                }}>
                    {post.title}
                </Title>

                {post.bodyPlain && (
                    <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{
                            margin: '8px 0',
                            color: darkMode ? '#999' : '#666'
                        }}
                    >
                        {post.bodyPlain.substring(0, 150)}...
                    </Paragraph>
                )}

                <Space split={<Divider type="vertical" />}>
                    <Space size={4}>
                        <Avatar
                            size="small"
                            icon={<UserOutlined />}
                            style={{ backgroundColor: '#87d068' }}
                        />
                        <Text type="secondary">
                                    {post.authorNickname || post.authorUsername || post.authorName || `用户${post.authorId}`}
                        </Text>
                    </Space>
                </Space>

                <Row gutter={24} style={{ marginTop: 12 }}>
                    <Col span={6}>
                        <Statistic
                            value={post.viewCount || 0}
                            prefix={<EyeOutlined />}
                            valueStyle={{ fontSize: 14, color: darkMode ? '#a0a0a0' : '#666' }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            value={post.replyCount || 0}
                            prefix={<MessageOutlined />}
                            valueStyle={{ fontSize: 14, color: darkMode ? '#a0a0a0' : '#666' }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            value={post.likeCount + (likedPosts.has(post.contentId) ? 1 : 0)}
                            prefix={
                                <LikeOutlined
                                    style={{ color: likedPosts.has(post.contentId) ? '#ff4d4f' : undefined }}
                                />
                            }
                            valueStyle={{
                                fontSize: 14,
                                color: likedPosts.has(post.contentId) ? '#ff4d4f' : darkMode ? '#a0a0a0' : '#666'
                            }}
                        />
                    </Col>
                    <Col span={6}>
                        <Space>
                            <Button
                                type="text"
                                icon={<HeartOutlined />}
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    message.info('收藏功能开发中');
                                }}
                            >
                                收藏
                            </Button>
                            <Button
                                type="text"
                                icon={<ShareAltOutlined />}
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    message.info('分享功能开发中');
                                }}
                            >
                                分享
                            </Button>
                            {currentUser && currentUser.userId === post.authorId && (
                                <Button
                                    type="text"
                                    danger
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePost(post.contentId);
                                    }}
                                >
                                    删除
                                </Button>
                            )}
                        </Space>
                    </Col>
                </Row>
            </Space>
        </Card>
    );

    // 主题配置
    const darkTheme = {
        algorithm: theme.darkAlgorithm,
        token: {
            colorPrimary: '#1890ff',
            colorBgContainer: '#1a1a1a',
            colorBgElevated: '#262626',
            colorBgLayout: '#0d0d0d',
        },
    };

    if (!mounted) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>加载中...</div>;
    }

    return (
        <ConfigProvider theme={darkMode ? darkTheme : undefined}>
            {/* 顶部导航栏 */}
            <Menubar currentPath={navigationRoutes.community} />
            
            <div style={{ 
                background: darkMode ? '#0a0a0a' : '#f0f2f5', 
                minHeight: '100vh', 
                padding: '96px 24px 24px 24px' // 顶部增加64px为Menubar留出空间
            }}>
                    {/* 论坛统计 */}
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col xs={8} sm={8}>
                            <Card>
                                <Statistic
                                    title="总帖子数"
                                    value={forumStats.totalPosts}
                                    prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={8} sm={8}>
                            <Card>
                                <Statistic
                                    title="今日发帖"
                                    value={forumStats.todayPosts}
                                    prefix={<MessageOutlined style={{ color: '#faad14' }} />}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={8} sm={8}>
                            <Card>
                                <Statistic
                                    title="在线用户"
                                    value={forumStats.onlineUsers}
                                    prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* 发帖按钮 */}
                    {isLoggedIn && (
                        <Card style={{ marginBottom: 24 }}>
                            <Button
                                type="primary"
                                size="large"
                                block
                                icon={<PlusOutlined />}
                                style={{
                                    height: 48,
                                    fontSize: 16,
                                }}
                                onClick={() => router.push(navigationRoutes.postCreate)}
                            >
                                发布新帖
                            </Button>
                        </Card>
                    )}

                    {/* 帖子列表 */}
                    <Card>
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            size="large"
                            items={[
                                {
                                    key: 'latest',
                                    label: '最新帖子',
                                    children: (
                                        <div>
                                            {loading && posts.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                                                    <Spin size="large" />
                                                </div>
                                            ) : error ? (
                                                <Empty description={error} />
                                            ) : posts.length === 0 ? (
                                                <Empty description="暂无帖子" />
                                            ) : (
                                                <>
                                                    {posts.map(post => (
                                                        <React.Fragment key={post.contentId}>
                                                            {renderPostCard(post)}
                                                        </React.Fragment>
                                                    ))}
                                                    {posts.length > 0 && (
                                                        <div style={{ textAlign: 'center', marginTop: 20 }}>
                                                            <Button
                                                                onClick={loadMore}
                                                                loading={loading}
                                                                disabled={!posts.length}
                                                            >
                                                                加载更多
                                                            </Button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    key: 'hot',
                                    label: '热门帖子',
                                    children: (
                                        <div>
                                            <Empty description="热门帖子功能开发中" />
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </Card>
            </div>
        </ConfigProvider>
    );
}