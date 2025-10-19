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

    const fetchReplies = async (postId: number) => {
        try {
            const response = await PostsApi.getReplies(postId);

            // 🔥 添加调试日志
            console.log('📦 后端返回的原始数据:', response);
            console.log('📦 回复列表:', response.replies);

            const repliesData = response.replies.map((reply: any) => {
                // 🔥 打印每条回复的关键字段
                console.log(`回复 ${reply.replyId}:`, {
                    replyId: reply.replyId,
                    parentId: reply.parentId,
                    replyTo: reply.replyTo,
                    replyToName: reply.replyToName,
                    authorName: reply.authorName,
                });

                return {
                    replyId: reply.replyId,
                    parentId: reply.parentId,
                    body: reply.body,
                    bodyPlain: reply.bodyPlain,
                    authorId: reply.authorId,
                    authorName: reply.authorName || reply.authorUsername || 'Anonymous',
                    authorNickname: reply.authorNickname,
                    authorAvatarUrl: reply.authorAvatarUrl,
                    createdDate: reply.createdDate,
                    updatedDate: reply.updatedDate,
                    likeCount: reply.likeCount || 0,
                    isLiked: reply.isLiked || false,
                    replyTo: reply.replyTo, // 回复的目标回复ID
                    replyToName: reply.replyToName, // 回复的目标用户名
                };
            });

            console.log('📊 处理后的回复数据:', repliesData);

            // 构建树形结构
            const repliesMap = new Map<number, ForumReply>();
            const rootReplies: ForumReply[] = [];

            // 先将所有回复存入 Map，并初始化 children 数组
            repliesData.forEach((reply: ForumReply) => {
                repliesMap.set(reply.replyId, { ...reply, children: [] });
            });

            // 构建父子关系
            repliesData.forEach((reply: ForumReply) => {
                const replyWithChildren = repliesMap.get(reply.replyId);
                console.log(`🔗 处理回复 ${reply.replyId}, replyTo: ${reply.replyTo}`);

                if (reply.replyTo) {
                    // 如果有 replyTo（回复的是某条回复），添加到对应回复的 children 中
                    const parent = repliesMap.get(reply.replyTo);
                    if (parent && replyWithChildren) {
                        parent.children!.push(replyWithChildren);
                        console.log(`✅ 成功将回复 ${reply.replyId} 添加到父回复 ${reply.replyTo} 的 children`);
                    } else {
                        // 如果找不到父回复（可能被删除），作为根回复处理
                        if (replyWithChildren) {
                            rootReplies.push(replyWithChildren);
                            console.log(`⚠️ 找不到父回复 ${reply.replyTo}，将回复 ${reply.replyId} 作为根回复`);
                        }
                    }
                } else {
                    // 没有 replyTo，是根回复（直接回复帖子）
                    if (replyWithChildren) {
                        rootReplies.push(replyWithChildren);
                        console.log(`✅ 回复 ${reply.replyId} 是根回复（直接回复帖子）`);
                    }
                }
            });

            // 按时间排序（最早的在前）
            rootReplies.sort((a, b) =>
                new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
            );

            console.log('🌲 最终的树形结构:', rootReplies);
            console.log('📌 根回复数量:', rootReplies.length);
            rootReplies.forEach((reply, index) => {
                console.log(`  ${index + 1}楼: 回复ID=${reply.replyId}, 子回复数=${reply.children?.length || 0}`);
                if (reply.children && reply.children.length > 0) {
                    reply.children.forEach((child, childIndex) => {
                        console.log(`    └─ 楼中楼 ${childIndex + 1}: 回复ID=${child.replyId}, 回复 @${child.replyToName}`);
                    });
                }
            });

            setReplies(rootReplies);
        } catch (error: any) {
            console.error('获取回复列表失败:', error);
            message.error(error.response?.data?.message || '获取回复列表失败');
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
    // 修改函数签名
    const handleSubmitReply = async (customContent?: string, customReplyTo?: ForumReply | null) => {
        if (!currentUserId || !contentId) {
            message.warning('请先登录后再回复');
            router.push(navigationRoutes.login);
            return;
        }

        // 🔥 使用传入的参数，如果没有则使用 state
        const content = customContent ?? replyContent;
        const targetReply = customReplyTo !== undefined ? customReplyTo : replyToReply;

        if (!content.trim()) {
            message.warning('回复内容不能为空');
            return;
        }

        try {
            setReplyLoading(true);

            // 调用后端 API
            await PostsApi.createReply(contentId, {
                body: content.trim(),
                replyTo: targetReply?.replyId,
            });

            // 清空输入框
            setReplyContent('');
            setReplyToReply(null);
            form.resetFields();

            // 重新获取回复列表
            await fetchReplies(contentId);

            // 更新帖子回复数
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

    // 删除回复（支持树形结构）
    const handleDeleteReply = async (replyId: number) => {
        if (!contentId) return; // contentId 就是 postId

        try {
            await PostsApi.deleteReply(contentId, replyId); // 传入 postId 和 replyId
            message.success('删除成功');

            // 递归删除回复
            const removeReplyFromTree = (replies: ForumReply[]): ForumReply[] => {
                return replies.filter(r => {
                    if (r.replyId === replyId) {
                        return false; // 删除该回复
                    }
                    if (r.children && r.children.length > 0) {
                        r.children = removeReplyFromTree(r.children); // 递归处理子回复
                    }
                    return true;
                });
            };

            setReplies(prev => removeReplyFromTree(prev));

            // 更新帖子的回复数
            if (post) {
                setPost({ ...post, replyCount: (post.replyCount || 0) - 1 });
            }
        } catch (error: any) {
            console.error('删除回复失败:', error);
            message.error(error.response?.data?.message || '删除失败');
        }
    };
    // 点赞回复
    const handleLikeReply = async (reply: ForumReply) => {
        if (!currentUserId || !contentId) {
            message.warning('请先登录');
            router.push(navigationRoutes.login);
            return;
        }

        try {
            const isCurrentlyLiked = reply.isLiked;

            // 调用真实的 API（不使用 localStorage）
            if (isCurrentlyLiked) {
                await PostsApi.unlikeReply(contentId, reply.replyId);
            } else {
                await PostsApi.likeReply(contentId, reply.replyId);
            }

            // 递归更新回复状态
            const updateReplyInTree = (replies: ForumReply[]): ForumReply[] => {
                return replies.map(r => {
                    if (r.replyId === reply.replyId) {
                        return {
                            ...r,
                            isLiked: !isCurrentlyLiked,
                            likeCount: r.likeCount + (isCurrentlyLiked ? -1 : 1),
                        };
                    }
                    if (r.children && r.children.length > 0) {
                        return {
                            ...r,
                            children: updateReplyInTree(r.children),
                        };
                    }
                    return r;
                });
            };

            setReplies(prev => updateReplyInTree(prev));
            message.success(isCurrentlyLiked ? '已取消点赞' : '点赞成功');
        } catch (error: any) {
            console.error('点赞回复失败:', error);
            message.error(error.response?.data?.message || '操作失败');
        }
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

    const [showReplyBoxId, setShowReplyBoxId] = useState<number | null>(null);
    const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
    const [collapsedReplies, setCollapsedReplies] = useState<Set<number>>(new Set());

    // 渲染回复项
    // 渲染回复项（支持递归渲染子回复）
    const renderReplyItem = (reply: ForumReply, level: number = 0) => {
        const isReplyAuthor = currentUserId === reply.authorId;
        const hasChildren = reply.children && reply.children.length > 0;
        const childCount = reply.children?.length || 0;

        // 🔥 从父组件状态获取
        const showReplyBox = showReplyBoxId === reply.replyId;
        const replyText = replyTexts[reply.replyId] || '';
        const collapsed = collapsedReplies.has(reply.replyId);

        return (
            <div key={reply.replyId}>
                <List.Item
                    style={{
                        borderBottom: level === 0 ? '1px solid rgba(99, 102, 241, 0.1)' : 'none',
                        padding: level === 0 ? '24px 0' : '16px 12px',
                        background: level > 0 ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                        borderRadius: level > 0 ? '8px' : '0',
                        marginBottom: level > 0 ? '8px' : '0',
                    }}
                >
                    <Space align="start" style={{ width: '100%' }}>
                        <Avatar
                            size={level === 0 ? 40 : 32}
                            src={getAvatarUrl(reply.authorAvatarUrl)}
                            icon={<UserOutlined />}
                            style={getDefaultAvatarStyle(level === 0 ? 40 : 32)}
                        />
                        <div style={{ flex: 1 }}>
                            {/* 用户信息 */}
                            <div style={{ marginBottom: 8 }}>
                                <Space split={<Divider type="vertical" style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }} />}>
                                    <Text strong style={{ color: '#f9fafb', fontSize: level > 0 ? '13px' : '14px' }}>
                                        {reply.authorNickname || reply.authorName || 'Anonymous'}
                                    </Text>
                                    {/* 🔥 楼层号 */}
                                    {level === 0 && (
                                        <Tag color="blue" style={{ margin: 0 }}>
                                            #Floor {replies.indexOf(reply) + 1}
                                        </Tag>
                                    )}
                                    <Text type="secondary" style={{ fontSize: '13px', color: '#9ca3af' }}>
                                        {formatPostTime(reply.createdDate)}
                                    </Text>
                                </Space>
                            </div>

                            {/* 回复内容 */}
                            {level > 0 && reply.replyToName && (
                                <Text
                                    style={{
                                        color: '#6366f1',
                                        fontSize: '13px',
                                        marginBottom: '6px',
                                        display: 'inline-block',
                                        marginRight: '4px'
                                    }}
                                >
                                    回复 @{reply.replyToName}:
                                </Text>
                            )}

                            <Paragraph
                                style={{
                                    color: '#e5e7eb',
                                    marginBottom: 12,
                                    fontSize: level > 0 ? '13px' : '14px',
                                    lineHeight: 1.6,
                                    display: level > 0 && reply.replyToName ? 'inline' : 'block',
                                }}
                            >
                                {reply.bodyPlain || reply.body}
                            </Paragraph>

                            {/* 操作按钮 */}
                            <Space size="small">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={reply.isLiked ? <LikeFilled /> : <LikeOutlined />}
                                    onClick={() => handleLikeReply(reply)}
                                    style={{
                                        color: reply.isLiked ? '#ef4444' : '#9ca3af',
                                        fontSize: '12px',
                                    }}
                                >
                                    {reply.likeCount || 0}
                                </Button>

                                {/* 🔥 回复按钮 */}
                                <Button
                                    type="text"
                                    size="small"
                                    onClick={() => {
                                        if (showReplyBox) {
                                            setShowReplyBoxId(null);
                                        } else {
                                            setShowReplyBoxId(reply.replyId);
                                            setReplyToReply(reply);
                                        }
                                    }}
                                    style={{
                                        color: showReplyBox ? '#6366f1' : '#9ca3af',
                                        fontSize: '12px'
                                    }}
                                >
                                    回复 {childCount > 0 && `(${childCount})`}
                                </Button>

                                {/* 🔥 展开/收起子回复 */}
                                {hasChildren && childCount > 3 && (
                                    <Button
                                        type="text"
                                        size="small"
                                        onClick={() => {
                                            const newCollapsed = new Set(collapsedReplies);
                                            if (collapsed) {
                                                newCollapsed.delete(reply.replyId);
                                            } else {
                                                newCollapsed.add(reply.replyId);
                                            }
                                            setCollapsedReplies(newCollapsed);
                                        }}
                                        style={{ color: '#9ca3af', fontSize: '12px' }}
                                    >
                                        {collapsed ? `展开${childCount}条回复` : '收起'}
                                    </Button>
                                )}

                                {isReplyAuthor && (
                                    <Button
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteReply(reply.replyId)}
                                        style={{ fontSize: '12px' }}
                                    >
                                        删除
                                    </Button>
                                )}
                            </Space>

                            {/* 🔥 内联回复输入框 */}
                            {showReplyBox && (
                                <div
                                    style={{
                                        marginTop: 12,
                                        padding: 12,
                                        background: 'rgba(99, 102, 241, 0.05)',
                                        borderRadius: 8,
                                        border: '1px solid rgba(99, 102, 241, 0.2)',
                                    }}
                                >
                                    <TextArea
                                        value={replyText}
                                        onChange={(e) => {
                                            setReplyTexts({
                                                ...replyTexts,
                                                [reply.replyId]: e.target.value
                                            });
                                        }}
                                        placeholder={`回复 @${reply.authorName}...`}
                                        rows={3}
                                        autoFocus
                                        style={{
                                            background: 'rgba(31, 41, 55, 0.5)',
                                            border: '1px solid rgba(75, 85, 99, 0.3)',
                                            color: '#f9fafb',
                                            borderRadius: 8,
                                            marginBottom: 8,
                                        }}
                                    />
                                    <Space>
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<SendOutlined />}
                                            loading={replyLoading}
                                            onClick={async () => {
                                                if (!replyText.trim()) {
                                                    message.warning('请输入回复内容');
                                                    return;
                                                }

                                                try {
                                                    // 🔥 直接传参，不依赖 state
                                                    await handleSubmitReply(replyText, reply);

                                                    // 清空输入框和状态
                                                    setReplyTexts({
                                                        ...replyTexts,
                                                        [reply.replyId]: ''
                                                    });
                                                    setShowReplyBoxId(null);
                                                } catch (error) {
                                                    console.error('回复失败:', error);
                                                }
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                border: 'none',
                                            }}
                                        >
                                            发送
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setShowReplyBoxId(null);
                                                setReplyTexts({
                                                    ...replyTexts,
                                                    [reply.replyId]: ''
                                                });
                                                setReplyToReply(null);
                                            }}
                                        >
                                            取消
                                        </Button>
                                    </Space>
                                </div>
                            )}
                        </div>
                    </Space>
                </List.Item>

                {/* 子回复区域 */}
                {hasChildren && (
                    <div
                        style={{
                            marginLeft: level === 0 ? '52px' : '44px',
                            paddingLeft: 16,
                            borderLeft: '2px solid rgba(99, 102, 241, 0.15)',
                            marginTop: 8,
                            marginBottom: level === 0 ? 16 : 8,
                        }}
                    >
                        {/* 🔥 根据折叠状态显示子回复 */}
                        {(collapsed ? reply.children!.slice(0, 3) : reply.children!).map((childReply) =>
                            renderReplyItem(childReply, level + 1)
                        )}

                        {/* 🔥 展开按钮(如果有更多回复且处于折叠状态) */}
                        {collapsed && childCount > 3 && (
                            <Button
                                type="link"
                                size="small"
                                onClick={() => {
                                    const newCollapsed = new Set(collapsedReplies);
                                    newCollapsed.delete(reply.replyId);
                                    setCollapsedReplies(newCollapsed);
                                }}
                                style={{
                                    padding: '4px 0',
                                    color: '#6366f1',
                                    fontSize: '13px',
                                }}
                            >
                                展开剩余{childCount - 3}条回复 &gt;&gt;
                            </Button>
                        )}
                    </div>
                )}
            </div>
        );
    };

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
                                title: <a onClick={() => router.push('/')}>Homepage</a>,
                            },
                            {
                                title: <a onClick={() => router.push(navigationRoutes.forum)}>Forum</a>,
                            },
                            {
                                title: 'Post Detail',
                            },
                        ]}
                    />

                    <Row gutter={24} justify="center">
                        <Col xs={24} sm={24} md={24} lg={24} xl={20}>
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