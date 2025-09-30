// src/app/dashboard/forum/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menubar } from '@/components/layout';
import {
    ProCard,
    StatisticCard,
} from '@ant-design/pro-components';
import {
    Avatar,
    Button,
    Card,
    Col,
    ConfigProvider,
    Divider,
    Dropdown,
    Empty,
    Input,
    List,
    message,
    Modal,
    Pagination,
    Row,
    Space,
    Spin,
    Statistic,
    Tabs,
    Tag,
    theme,
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
} from '@ant-design/icons';

import { PostsApi } from '@/lib/api/posts';
import { AuthApi } from '@/lib/api/auth';
import { ENV } from '@/config/env';
import {UsersApi} from "@/lib/api/users";

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
    const [darkMode, setDarkMode] = useState(true);
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

    // 用户信息
    const [userId, setUserId] = useState<number | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
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
        if (!AuthApi.isAuthenticated()) {
            message.warning('请先登录');
            router.push('/login');
        }
    }, []);

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

    // 备用方案：获取所有帖子并过滤


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
        fetchMyPosts(1);
    }, [userId]);

    // 渲染帖子列表项
    const renderPostItem = (post: PostItem) => {
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
        style={{
            marginBottom: 16,
                background: darkMode ? '#1a1a1a' : '#fff',
        }}
        actions={[
                <Space key="views">
                    <EyeOutlined />
                    {post.viewCount || 0}
                    </Space>,
                    <Space key="likes">
                <LikeOutlined />
                {post.likeCount || 0}
                </Space>,
                <Space key="replies">
                <CommentOutlined />
                {post.replyCount || 0}
                </Space>,
                <Dropdown menu={{ items: menuItems }} key="more">
        <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>,
    ]}
    >
        <Card.Meta
            title={
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space>
            {post.isPinned && <Tag color="red">置顶</Tag>}
        {post.isEssence && <Tag color="gold">精华</Tag>}
            <a onClick={() => router.push(`/post/${post.postId}`)}>
            {post.title}
            </a>
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
            <ClockCircleOutlined /> {new Date(post.createdDate).toLocaleDateString()}
            </Text>
            </Space>
        }
        description={
        <div>
        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
        {post.bodyPlain || post.body}
        </Paragraph>
        {post.category && (
            <Space>
                <Tag color="blue">{post.category}</Tag>
            {post.tags?.map(tag => (
                <Tag key={tag}>{tag}</Tag>
            ))}
            </Space>
        )}
        </div>
    }
        />
        </Card>
    );
    };

        const darkTheme = {
            algorithm: theme.darkAlgorithm,
            token: {
                colorPrimary: '#FF6B6B',
                colorBgContainer: '#1a1a1a',
                colorBgElevated: '#262626',
                colorBgLayout: '#0d0d0d',
            },
        };

        return (
            <ConfigProvider theme={darkMode ? darkTheme : undefined}>
                {/* 顶部导航栏 */}
                <Menubar currentPath="/dashboard/forum/profile" />
                
                <div style={{ 
                    background: darkMode ? '#0a0a0a' : '#f0f2f5', 
                    minHeight: '100vh', 
                    padding: '96px 24px 24px 24px' // 顶部增加64px为Menubar留出空间
                }}>
        {/* 用户信息卡片 */}
        <ProCard style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
        <Col flex="none">
        <Avatar size={80} icon={<UserOutlined />}>
        {username?.charAt(0).toUpperCase()}
        </Avatar>
        </Col>
        <Col flex="auto">
        <Space direction="vertical">
        <Title level={4} style={{ margin: 0 }}>
        {username || '用户'}
        </Title>
        <Text type="secondary">
            用户ID: {userId}
        </Text>
        </Space>
        </Col>
        <Col flex="none">
        <Button
            type="primary"
        icon={<PlusOutlined />}
        size="large"
        onClick={() => router.push('/post/create')}
        style={{
            background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
        }}
    >
        发布新帖
        </Button>
        </Col>
        </Row>
        </ProCard>

        {/* 统计数据 */}
        <ProCard style={{ marginBottom: 24 }}>
        <StatisticCard.Group>
            <StatisticCard
                statistic={{
            title: '总发帖数',
                value: stats.totalPosts,
                icon: <FileTextOutlined style={{ color: '#1890ff' }} />,
        }}
        />
        <Divider type="vertical" />
        <StatisticCard
            statistic={{
            title: '总浏览量',
                value: stats.totalViews,
                icon: <EyeOutlined style={{ color: '#52c41a' }} />,
        }}
        />
        <Divider type="vertical" />
        <StatisticCard
            statistic={{
            title: '获得点赞',
                value: stats.totalLikes,
                icon: <LikeOutlined style={{ color: '#ff4d4f' }} />,
        }}
        />
        <Divider type="vertical" />
        <StatisticCard
            statistic={{
            title: '收到回复',
                value: stats.totalReplies,
                icon: <CommentOutlined style={{ color: '#faad14' }} />,
        }}
        />
        </StatisticCard.Group>
        </ProCard>

        {/* 帖子列表 */}
        <Card>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'published',
                        label: '已发布',
                        children: (
                            <Spin spinning={loading}>
                                {myPosts.length > 0 ? (
                                    <>
                                        <List
                                            dataSource={myPosts}
                                            renderItem={renderPostItem}
                                        />
                                        <div style={{ textAlign: 'center', marginTop: 24 }}>
                                            <Pagination
                                                current={currentPage}
                                                total={totalPosts}
                                                pageSize={pageSize}
                                                onChange={(page) => {
                                                    setCurrentPage(page);
                                                    fetchMyPosts(page);
                                                }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <Empty
                                        description="还没有发布过帖子"
                                        style={{ padding: '40px 0' }}
                                    >
                                        <Button
                                            type="primary"
                                            onClick={() => router.push('/post/create')}
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
                        label: '草稿箱',
                        children: <Empty description="暂无草稿" />
                    },
                    {
                        key: 'deleted',
                        label: '回收站',
                        children: <Empty description="回收站为空" />
                    }
                ]}
            />
            </Card>

        {/* 删除确认弹窗 */}
        <Modal
            title="确认删除"
        open={deleteModalVisible}
        onOk={handleDeletePost}
        onCancel={() => {
            setDeleteModalVisible(false);
            setSelectedPost(null);
        }}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
    >
        <p>确定要删除帖子《{selectedPost?.title}》吗？</p>
        <p>删除后将无法恢复。</p>
        </Modal>
                </div>
        </ConfigProvider>
    );
    }