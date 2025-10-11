// src/app/dashboard/forum/detail/page.tsx
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
    Form,
    Input,
    List,
    message,
    Modal,
    Row,
    Space,
    Spin,
    Tag,
    Typography,
    Breadcrumb,
} from 'antd';
import {
    CalendarOutlined,
    CommentOutlined,
    DeleteOutlined,
    EditOutlined,
    EllipsisOutlined,
    EyeOutlined,
    FireOutlined,
    LikeOutlined,
    LikeFilled,
    MessageOutlined,
    ShareAltOutlined,
    StarOutlined,
    StarFilled,
    UserOutlined,
    WarningOutlined,
    SendOutlined,
    FlagOutlined,
    HistoryOutlined, TagOutlined,
} from '@ant-design/icons';

import { PostsApi } from '@/lib/api/posts';
import { AuthApi } from '@/lib/api/auth';
import { UsersApi } from '@/lib/api/users';
import { navigationRoutes } from '@/lib/navigation';
import { darkTheme, cardStyle } from '@/components/common/theme';
import { formatPostTime } from '@/app/features/forum/utils/forumUtils';
import '@/components/common/animations.css';
import { ForumReply } from '@/app/features/forum/types/forumTypes';
// 导入状态管理器
import { PostStateManager } from '@/lib/api/PostStateManager';
import { ImprovedPostSessionManager } from '@/lib/api/PostSession';
import { getAvatarUrl, handleAvatarError, getDefaultAvatarStyle } from '@/lib/api/avatar';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface PostDetail {
    contentId: number;
    title: string;
    body: string;
    bodyPlain?: string;
    authorId: number;
    authorUsername?: string;
    authorEmail?: string;
    authorName?: string;
    authorNickname?: string;
    authorAvatar?: string;
    viewCount: number;
    likeCount: number;
    replyCount?: number;
    createdDate: string;
    updatedDate: string;
    status: string;
    category?: string;
    tags?: string[];
    isLiked?: boolean;
}


export default function PostDetailPage() {
    const router = useRouter();
    const [form] = Form.useForm();

    // 安全获取帖子ID
    const [contentId, setContentId] = useState<number | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const [post, setPost] = useState<PostDetail | null>(null);
    const [replies, setReplies] = useState<ForumReply[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyLoading, setReplyLoading] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replyToReply, setReplyToReply] = useState<ForumReply | null>(null);
    const [viewHistory, setViewHistory] = useState<number[]>([]);

    // 用户交互状态
    const [isLiked, setIsLiked] = useState(false);
    const [isStarred, setIsStarred] = useState(false);
    const [likedReplies, setLikedReplies] = useState<Set<number>>(new Set());

    // 当前用户信息
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);

        // 清理过期会话
        ImprovedPostSessionManager.cleanExpiredSessions();

        // 获取帖子ID并初始化
        const id = PostStateManager.getCurrentPost();
        if (!id) {
            message.error('请从帖子列表进入查看详情');
            router.push(navigationRoutes.forum);
            return;
        }

        setContentId(id);

        // 获取浏览历史
        const history = PostStateManager.getHistory();
        setViewHistory(history.filter(h => h !== id).slice(0, 5)); // 排除当前帖子，取最近5个

        // 创建或更新会话
        const newSessionId = ImprovedPostSessionManager.createOrUpdateSession(id, document.referrer);
        setSessionId(newSessionId);

        initializeUserAndPost(id);
    }, []);

    // 页面卸载时清理
    useEffect(() => {
        return () => {
            if (contentId) {
                PostStateManager.clearCurrentPost();
            }
        };
    }, [contentId]);

    // 初始化用户信息和帖子数据
    const initializeUserAndPost = async (id: number) => {
        try {
            // 获取当前用户信息
            const [userId, username] = await Promise.all([
                UsersApi.getUserId(),
                UsersApi.getUsername(),
            ]);
            setCurrentUserId(userId);
            setCurrentUsername(username);

            // 加载用户交互状态


            // 获取帖子详情
            await fetchPostDetail(id);

            // 验证会话并增加浏览量
            if (sessionId) {
                const session = ImprovedPostSessionManager.validateAndUpdateSession(sessionId);
                if (session && session.viewCount === 1) {
                    // 只在第一次查看时增加浏览量
                    incrementViewCount(id);
                }
            }

            // 加载回复
            fetchReplies(id);
        } catch (error) {
            console.error('初始化失败:', error);
        }
    };

    // 获取帖子详情
    const fetchPostDetail = async (id: number) => {
        try {
            setLoading(true);
            const data = await PostsApi.getPostById(id);
            setPost(data);
            // 直接从后端数据设置点赞状态
            setIsLiked(data.isLiked || false);
        } catch (error) {
            message.error('获取帖子详情失败');
        } finally {
            setLoading(false);
        }
    };

    // 增加浏览量
    const incrementViewCount = (id: number) => {
        // 使用sessionStorage记录已浏览
        const viewedKey = `viewed_post_${id}_${new Date().toDateString()}`;
        if (!sessionStorage.getItem(viewedKey)) {
            sessionStorage.setItem(viewedKey, 'true');

            // 更新本地显示的浏览量
            if (post) {
                setPost(prev => prev ? { ...prev, viewCount: prev.viewCount + 1 } : null);
            }
        }
    };

    // 获取回复列表
    const fetchReplies = async (id: number) => {
        try {
            const data = await PostsApi.getReplies(id, 0, 20); // 第一页，20条
            setReplies(data.replies);
        } catch (error) {
            console.error('获取回复失败:', error);
            message.error('获取回复失败');
        }
    };

    // 点赞/取消点赞帖子
    const handleLikePost = async () => {
        if (!currentUserId || !contentId) {
            message.warning('请先登录');
            router.push(navigationRoutes.login);
            return;
        }

        try {
            // 调用后端 toggle API
            const response = await PostsApi.toggleLike(contentId);

            // 更新本地状态（使用后端返回的真实值）
            setIsLiked(response.liked);
            if (post) {
                setPost({ ...post, likeCount: response.likeCount });
            }

            message.success(response.liked ? '点赞成功' : '已取消点赞');
        } catch (error) {
            message.error('操作失败');
        }
    };

    // 收藏/取消收藏
    const handleStarPost = () => {
        if (!currentUserId || !contentId) {
            message.warning('请先登录');
            router.push(navigationRoutes.login);
            return;
        }

        const starredPosts = JSON.parse(localStorage.getItem(`starred_posts_${currentUserId}`) || '[]');

        if (isStarred) {
            const newStarredPosts = starredPosts.filter((id: number) => id !== contentId);
            localStorage.setItem(`starred_posts_${currentUserId}`, JSON.stringify(newStarredPosts));
            setIsStarred(false);
            message.success('已取消收藏');
        } else {
            starredPosts.push(contentId);
            localStorage.setItem(`starred_posts_${currentUserId}`, JSON.stringify(starredPosts));
            setIsStarred(true);
            message.success('收藏成功');
        }
    };

    // 分享帖子
    const handleSharePost = () => {
        if (!post) return;

        // 生成安全的分享链接（不包含直接的ID）
        const shareUrl = `${window.location.origin}/dashboard/forum`;
        const shareText = `来看看这个帖子：${post.title}`;

        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: shareText,
                url: shareUrl,
            }).catch(() => {
                // 用户取消分享
            });
        } else {
            // 复制分享文本到剪贴板
            navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            message.success('分享链接已复制');
        }
    };

    // 提交回复
    const handleSubmitReply = async () => {
        if (!currentUserId || !contentId) {
            message.warning('请先登录后再回复');
            router.push(navigationRoutes.login);
            return;
        }

        if (!replyContent.trim()) {
            message.warning('回复内容不能为空');
            return;
        }

        try {
            setReplyLoading(true);

            // 🔥 调用后端 API 创建回复
            await PostsApi.createReply(contentId, replyContent.trim());

            // 清空输入框
            setReplyContent('');
            setReplyToReply(null);
            form.resetFields();

            // 🔥 重新获取回复列表（显示最新数据）
            await fetchReplies(contentId);

            // 更新帖子回复数（本地显示）
            if (post) {
                setPost({ ...post, replyCount: (post.replyCount || 0) + 1 });
            }

            message.success('回复成功');
        } catch (error) {
            message.error('回复失败');
        } finally {
            setReplyLoading(false);
        }
    };

    // 点赞回复
    const handleLikeReply = (replyId: number) => {
        if (!currentUserId || !contentId) {
            message.warning('请先登录');
            return;
        }

        const likedReplyIds = Array.from(likedReplies);
        const updatedReplies = replies.map(reply => {
            if (reply.replyId === replyId) {
                if (likedReplies.has(replyId)) {
                    // 取消点赞
                    const index = likedReplyIds.indexOf(replyId);
                    likedReplyIds.splice(index, 1);
                    return { ...reply, likeCount: Math.max(0, reply.likeCount - 1) };
                } else {
                    // 点赞
                    likedReplyIds.push(replyId);
                    return { ...reply, likeCount: reply.likeCount + 1 };
                }
            }
            return reply;
        });

        setReplies(updatedReplies);
        setLikedReplies(new Set(likedReplyIds));
        localStorage.setItem(`liked_replies_${currentUserId}`, JSON.stringify(likedReplyIds));
        localStorage.setItem(`post_replies_${contentId}`, JSON.stringify(updatedReplies));
    };

    // 删除帖子
    const handleDeletePost = async () => {
        if (!contentId) return;

        try {
            await PostsApi.deletePost(contentId);
            message.success('删除成功');

            // 清理状态
            PostStateManager.clearCurrentPost();

            router.push(navigationRoutes.forum);
        } catch (error) {
            message.error('删除失败');
        }
    };

    // 举报帖子
    const handleReportPost = (reason: string) => {
        if (!contentId) return;

        // 保存举报记录到localStorage
        const reports = JSON.parse(localStorage.getItem('post_reports') || '[]');
        reports.push({
            contentId,
            userId: currentUserId,
            reason,
            timestamp: new Date().toISOString(),
        });
        localStorage.setItem('post_reports', JSON.stringify(reports));

        setReportModalVisible(false);
        message.success('举报已提交，我们会尽快处理');
    };

    // 跳转到历史帖子
    const handleViewHistoryPost = (historyPostId: number) => {
        // 设置新的当前帖子
        PostStateManager.setCurrentPost(historyPostId);
        // 刷新页面以加载新帖子
        window.location.reload();
    };

    // 渲染回复项
    const renderReplyItem = (reply: ForumReply) => (
        <List.Item
            key={reply.replyId}
            className="animate-fade-in"
            style={{
                padding: '20px 0',
                borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
            }}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* 回复头部 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                        <Avatar
                            size={36}
                            src={getAvatarUrl(reply.authorAvatarUrl)}
                            icon={<UserOutlined />}
                            onError={() => {
                                handleAvatarError(new Error('头像加载失败'), true);
                                return false;
                            }}
                            style={getDefaultAvatarStyle(36)}
                        />
                        <Space direction="vertical" size={0}>
                            <Space>
                                <Text strong style={{ color: '#f9fafb', fontSize: '14px' }}>
                                    {reply.authorName}
                                </Text>
                                {reply.replyToName && (
                                    <>
                                        <Text style={{ color: '#9ca3af' }}>回复</Text>
                                        <Text style={{ color: '#818cf8' }}>@{reply.replyToName}</Text>
                                    </>
                                )}
                            </Space>
                            <Text type="secondary" style={{ fontSize: '12px', color: '#6b7280' }}>
                                {formatPostTime(reply.createdDate)}
                            </Text>
                        </Space>
                    </Space>

                    {currentUserId === reply.authorId && (
                        <Dropdown
                            menu={{
                                items: [
                                    // 找到删除按钮的 onClick
                                    {
                                        key: 'delete',
                                        label: '删除',
                                        icon: <DeleteOutlined />,
                                        danger: true,
                                        onClick: async () => { // ⚠️ 改成 async
                                            if (!contentId) return;

                                            try {
                                                // 🔥 调用后端 API 删除
                                                await PostsApi.deleteReply(contentId, reply.replyId);

                                                // 🔥 重新获取回复列表
                                                await fetchReplies(contentId);

                                                // 更新帖子回复数
                                                if (post) {
                                                    setPost({ ...post, replyCount: Math.max(0, (post.replyCount || 1) - 1) });
                                                }

                                                message.success('删除成功');
                                            } catch (error) {
                                                message.error('删除失败');
                                            }
                                        },
                                    }
                                ],
                            }}
                        >
                            <Button type="text" icon={<EllipsisOutlined />} />
                        </Dropdown>
                    )}
                </div>

                {/* 回复内容 */}
                <Paragraph style={{ margin: 0, color: '#d1d5db', fontSize: '14px', lineHeight: 1.6 }}>
                    {reply.body}
                </Paragraph>

                {/* 回复操作 */}
                <Space>
                    <Button
                        type="text"
                        size="small"
                        icon={likedReplies.has(reply.replyId) ? <LikeFilled /> : <LikeOutlined />}
                        onClick={() => handleLikeReply(reply.replyId)}
                        style={{
                            color: likedReplies.has(reply.replyId) ? '#ef4444' : '#9ca3af',
                        }}
                    >
                        {reply.likeCount > 0 ? reply.likeCount : '赞'}
                    </Button>
                    <Button
                        type="text"
                        size="small"
                        icon={<CommentOutlined />}
                        onClick={() => setReplyToReply(reply)}
                        style={{ color: '#9ca3af' }}
                    >
                        回复
                    </Button>
                </Space>
            </Space>
        </List.Item>
    );

    if (!mounted) {
        return null;
    }

    const isAuthor = currentUserId === post?.authorId;
    const isLoggedIn = !!currentUserId;

    return (
        <ConfigProvider theme={darkTheme}>
            <Menubar currentPath="/dashboard/forum" />

            <div
                className="animate-fade-in-up"
                style={{
                    minHeight: '100vh',
                    background: `
                        radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
                        radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                        linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)
                    `,
                    paddingTop: '88px',
                    paddingBottom: '40px',
                }}
            >
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
                    {/* 面包屑导航 */}
                    <Breadcrumb
                        style={{ marginBottom: 24 }}
                        items={[
                            {
                                title: <a onClick={() => router.push('/')}>首页</a>,
                            },
                            {
                                title: <a onClick={() => router.push(navigationRoutes.forum)}>论坛</a>,
                            },
                            {
                                title: '帖子详情',
                            },
                        ]}
                    />

                    <Row gutter={24}>
                        <Col xs={24} lg={18}>
                            {loading ? (
                                <Card style={cardStyle}>
                                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                        <Spin size="large" />
                                        <div style={{ marginTop: 16, color: '#9ca3af' }}>加载中...</div>
                                    </div>
                                </Card>
                            ) : post ? (
                                <>
                                    {/* 帖子主体 */}
                                    <Card
                                        className="animate-card-hover"
                                        style={{
                                            ...cardStyle,
                                            marginBottom: 24,
                                        }}
                                        styles={{ body: { padding: '32px' } }}
                                    >
                                        {/* 帖子头部 */}
                                        <div style={{ marginBottom: 24 }}>
                                            <Space style={{ marginBottom: 16 }}>
                                                {post.category && (
                                                    <Tag
                                                        color="purple"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '2px 12px',
                                                        }}
                                                    >
                                                        {post.category}
                                                    </Tag>
                                                )}
                                                {post.viewCount > 1000 && (
                                                    <Tag
                                                        icon={<FireOutlined />}
                                                        color="error"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '2px 12px',
                                                        }}
                                                    >
                                                        热门
                                                    </Tag>
                                                )}
                                            </Space>

                                            <Title
                                                level={2}
                                                style={{
                                                    color: '#f9fafb',
                                                    fontSize: '28px',
                                                    fontWeight: 700,
                                                    marginBottom: 16,
                                                }}
                                            >
                                                {post.title}
                                            </Title>

                                            <Space split={<Divider type="vertical" style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }} />}>
                                                <Space>
                                                    <Avatar
                                                        size={24}
                                                        src={getAvatarUrl(post.authorAvatar)}
                                                        icon={<UserOutlined />}
                                                        onError={() => {
                                                            handleAvatarError(new Error('头像加载失败'), true);
                                                            return false;
                                                        }}
                                                        style={getDefaultAvatarStyle(24)}
                                                    />
                                                    <Text style={{ color: '#d1d5db' }}>
                                                        {post.authorName}
                                                    </Text>
                                                </Space>
                                                <Space>
                                                    <CalendarOutlined style={{ color: '#9ca3af' }} />
                                                    <Text type="secondary" style={{ color: '#9ca3af' }}>
                                                        {new Date(post.createdDate).toLocaleDateString()}
                                                    </Text>
                                                </Space>
                                                <Space>
                                                    <EyeOutlined style={{ color: '#9ca3af' }} />
                                                    <Text type="secondary" style={{ color: '#9ca3af' }}>
                                                        {post.viewCount} 浏览
                                                    </Text>
                                                </Space>
                                            </Space>
                                        </div>

                                        <Divider style={{ borderColor: 'rgba(99, 102, 241, 0.2)' }} />

                                        {/* 帖子内容 */}
                                        <div
                                            style={{
                                                color: '#e5e7eb',
                                                fontSize: '15px',
                                                lineHeight: 1.8,
                                                minHeight: 200,
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {post.bodyPlain || post.body}
                                        </div>

                                        {/* 标签 */}
                                        {post.tags && post.tags.length > 0 && (
                                            <div style={{ marginTop: 24 }}>
                                                <Space wrap>
                                                    {post.tags.map(tag => (
                                                        <Tag
                                                            key={tag}
                                                            icon={<TagOutlined />}
                                                            style={{
                                                                background: 'rgba(99, 102, 241, 0.1)',
                                                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                                                color: '#a5b4fc',
                                                                borderRadius: '6px',
                                                            }}
                                                        >
                                                            {tag}
                                                        </Tag>
                                                    ))}
                                                </Space>
                                            </div>
                                        )}

                                        <Divider style={{ borderColor: 'rgba(99, 102, 241, 0.2)' }} />

                                        {/* 操作栏 */}
                                        <Row justify="space-between" align="middle">
                                            <Col>
                                                <Space size="large">
                                                    <Button
                                                        type="text"
                                                        icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
                                                        onClick={handleLikePost}
                                                        style={{
                                                            color: isLiked ? '#ef4444' : '#9ca3af',
                                                        }}
                                                    >
                                                        {post.likeCount || 0}
                                                    </Button>
                                                    <Button
                                                        type="text"
                                                        icon={<MessageOutlined />}
                                                        style={{ color: '#9ca3af' }}
                                                    >
                                                        {post.replyCount || 0}
                                                    </Button>
                                                    <Button
                                                        type="text"
                                                        icon={isStarred ? <StarFilled /> : <StarOutlined />}
                                                        onClick={handleStarPost}
                                                        style={{
                                                            color: isStarred ? '#fbbf24' : '#9ca3af',
                                                        }}
                                                    >
                                                        收藏
                                                    </Button>
                                                    <Button
                                                        type="text"
                                                        icon={<ShareAltOutlined />}
                                                        onClick={handleSharePost}
                                                        style={{ color: '#9ca3af' }}
                                                    >
                                                        分享
                                                    </Button>
                                                </Space>
                                            </Col>
                                            <Col>
                                                <Space>
                                                    {isAuthor && (
                                                        <>
                                                            <Button
                                                                type="text"
                                                                icon={<EditOutlined />}
                                                                onClick={() => {
                                                                    if (!contentId) return;
                                                                    PostStateManager.setCurrentPost(contentId);
                                                                    router.push('/dashboard/forum/edit');
                                                                }}
                                                                style={{ color: '#9ca3af' }}
                                                            >
                                                                编辑
                                                            </Button>
                                                            <Button
                                                                type="text"
                                                                danger
                                                                icon={<DeleteOutlined />}
                                                                onClick={() => setDeleteModalVisible(true)}
                                                            >
                                                                删除
                                                            </Button>
                                                        </>
                                                    )}
                                                    {!isAuthor && isLoggedIn && (
                                                        <Button
                                                            type="text"
                                                            icon={<FlagOutlined />}
                                                            onClick={() => setReportModalVisible(true)}
                                                            style={{ color: '#9ca3af' }}
                                                        >
                                                            举报
                                                        </Button>
                                                    )}
                                                </Space>
                                            </Col>
                                        </Row>
                                    </Card>

                                    {/* 回复输入框 */}
                                    {isLoggedIn ? (
                                        <Card
                                            style={{
                                                ...cardStyle,
                                                marginBottom: 24,
                                            }}
                                            styles={{ body: { padding: '24px' } }}
                                        >
                                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                                {replyToReply && (
                                                    <div
                                                        style={{
                                                            background: 'rgba(99, 102, 241, 0.1)',
                                                            border: '1px solid rgba(99, 102, 241, 0.3)',
                                                            borderRadius: '8px',
                                                            padding: '12px',
                                                            marginBottom: '12px',
                                                        }}
                                                    >
                                                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                            <Text style={{ color: '#a5b4fc' }}>
                                                                回复 @{replyToReply.authorName}
                                                            </Text>
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                onClick={() => setReplyToReply(null)}
                                                            >
                                                                取消
                                                            </Button>
                                                        </Space>
                                                    </div>
                                                )}

                                                <Form form={form} onFinish={handleSubmitReply}>
                                                    <Form.Item
                                                        name="content"
                                                        rules={[{ required: true, message: '请输入回复内容' }]}
                                                    >
                                                        <TextArea
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                            placeholder={
                                                                replyToReply
                                                                    ? `回复 @${replyToReply.authorName}...`
                                                                    : '写下你的回复...'
                                                            }
                                                            rows={4}
                                                            style={{
                                                                background: 'rgba(31, 41, 55, 0.5)',
                                                                border: '1px solid rgba(75, 85, 99, 0.3)',
                                                                color: '#f9fafb',
                                                                borderRadius: '8px',
                                                            }}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item>
                                                        <Button
                                                            type="primary"
                                                            htmlType="submit"
                                                            loading={replyLoading}
                                                            icon={<SendOutlined />}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                            }}
                                                        >
                                                            发表回复
                                                        </Button>
                                                    </Form.Item>
                                                </Form>
                                            </Space>
                                        </Card>
                                    ) : (
                                        <Card
                                            style={{
                                                ...cardStyle,
                                                marginBottom: 24,
                                                textAlign: 'center',
                                            }}
                                            styles={{ body: { padding: '32px' } }}
                                        >
                                            <Text style={{ color: '#9ca3af', fontSize: '14px' }}>
                                                请
                                                <Button
                                                    type="link"
                                                    onClick={() => router.push(navigationRoutes.login)}
                                                    style={{ padding: '0 4px' }}
                                                >
                                                    登录
                                                </Button>
                                                后参与讨论
                                            </Text>
                                        </Card>
                                    )}

                                    {/* 回复列表 */}
                                    <Card
                                        title={
                                            <Space>
                                                <CommentOutlined style={{ color: '#6366f1' }} />
                                                <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>
                                                    全部回复 ({replies.length})
                                                </span>
                                            </Space>
                                        }
                                        style={cardStyle}
                                        styles={{ body: { padding: '24px' } }}
                                    >
                                        {replies.length > 0 ? (
                                            <List
                                                dataSource={replies}
                                                renderItem={renderReplyItem}
                                                locale={{ emptyText: '暂无回复' }}
                                            />
                                        ) : (
                                            <Empty
                                                description={
                                                    <span style={{ color: '#9ca3af' }}>
                                                        还没有回复，快来抢沙发吧！
                                                    </span>
                                                }
                                                style={{ padding: '40px 0' }}
                                            />
                                        )}
                                    </Card>
                                </>
                            ) : (
                                <Card style={cardStyle}>
                                    <Empty description="帖子不存在或已被删除" />
                                </Card>
                            )}
                        </Col>

                        {/* 右侧边栏 */}
                        <Col xs={0} lg={6}>
                            {/* 作者信息 */}
                            {post && (
                                <Card
                                    style={{
                                        ...cardStyle,
                                        marginBottom: 20,
                                    }}
                                    styles={{ body: { padding: '20px' } }}
                                >
                                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                                        <Avatar
                                            size={64}
                                            src={getAvatarUrl(post.authorAvatar)}
                                            icon={<UserOutlined />}
                                            onError={() => {
                                                handleAvatarError(new Error('头像加载失败'), true);
                                                return false;
                                            }}
                                            style={{
                                                ...getDefaultAvatarStyle(64),
                                                border: '3px solid rgba(99, 102, 241, 0.3)',
                                            }}
                                        />
                                        <Title level={5} style={{ margin: '8px 0 4px', color: '#f9fafb' }}>
                                            {post.authorName }
                                        </Title>
                                        <Text type="secondary" style={{ color: '#9ca3af', fontSize: '13px' }}>
                                            注册于 {new Date(post.createdDate).getFullYear()} 年
                                        </Text>
                                        <Divider style={{ margin: '16px 0', borderColor: 'rgba(99, 102, 241, 0.2)' }} />
                                        <Button
                                            type="primary"
                                            block
                                            onClick={() => router.push(`/dashboard/forum/user/${post.authorId}`)}
                                            style={{
                                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                            }}
                                        >
                                            查看主页
                                        </Button>
                                    </Space>
                                </Card>
                            )}

                            {/* 浏览历史 */}
                            {viewHistory.length > 0 && (
                                <Card
                                    title={
                                        <Space>
                                            <HistoryOutlined style={{ color: '#6366f1' }} />
                                            <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>
                                                浏览历史
                                            </span>
                                        </Space>
                                    }
                                    style={{
                                        ...cardStyle,
                                        marginBottom: 20,
                                    }}
                                    styles={{ body: { padding: '16px' } }}
                                >
                                    <List
                                        size="small"
                                        dataSource={viewHistory}
                                        renderItem={(historyId) => (
                                            <List.Item
                                                style={{
                                                    padding: '8px 0',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                }}
                                                onClick={() => handleViewHistoryPost(historyId)}
                                            >
                                                <Text
                                                    style={{
                                                        color: '#d1d5db',
                                                        fontSize: '13px',
                                                    }}
                                                    ellipsis
                                                >
                                                    帖子 #{historyId}
                                                </Text>
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            )}

                            {/* 会话信息（仅开发模式显示） */}
                            {process.env.NODE_ENV === 'development' && sessionId && (
                                <Card
                                    title="会话信息"
                                    style={{
                                        ...cardStyle,
                                        marginBottom: 20,
                                    }}
                                    styles={{ body: { padding: '16px' } }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Text style={{ color: '#9ca3af', fontSize: '12px' }}>
                                            会话ID: {sessionId}
                                        </Text>
                                        <Text style={{ color: '#9ca3af', fontSize: '12px' }}>
                                            帖子ID: {contentId}
                                        </Text>
                                    </Space>
                                </Card>
                            )}

                            {/* 相关推荐 */}
                            <Card
                                title={
                                    <Space>
                                        <FireOutlined style={{ color: '#ef4444' }} />
                                        <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>
                                            相关推荐
                                        </span>
                                    </Space>
                                }
                                style={cardStyle}
                                styles={{ body: { padding: '16px' } }}
                            >
                                <Empty
                                    description={
                                        <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                                            暂无相关推荐
                                        </span>
                                    }
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* 删除确认弹窗 */}
            <Modal
                title={
                    <Space>
                        <WarningOutlined style={{ color: '#ef4444' }} />
                        <span>确认删除</span>
                    </Space>
                }
                open={deleteModalVisible}
                onOk={handleDeletePost}
                onCancel={() => setDeleteModalVisible(false)}
                okText="确认删除"
                cancelText="取消"
                okButtonProps={{
                    danger: true,
                }}
            >
                <p>确定要删除这篇帖子吗？此操作不可恢复。</p>
            </Modal>

            {/* 举报弹窗 */}
            <Modal
                title="举报帖子"
                open={reportModalVisible}
                onCancel={() => setReportModalVisible(false)}
                footer={null}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Text>请选择举报原因：</Text>
                    {['违规内容', '广告营销', '恶意攻击', '虚假信息', '其他'].map(reason => (
                        <Button
                            key={reason}
                            block
                            onClick={() => handleReportPost(reason)}
                            style={{
                                textAlign: 'left',
                                borderRadius: '8px',
                            }}
                        >
                            {reason}
                        </Button>
                    ))}
                </Space>
            </Modal>
        </ConfigProvider>
    );
}