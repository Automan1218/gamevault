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
// Import state manager
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

    // Safely get post ID
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

    // User interaction state
    const [isLiked, setIsLiked] = useState(false);
    const [isStarred, setIsStarred] = useState(false);
    const [likedReplies, setLikedReplies] = useState<Set<number>>(new Set());

    // Current user information
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);

        // Clean up expired sessions
        ImprovedPostSessionManager.cleanExpiredSessions();

        // Get post ID and initialize
        const id = PostStateManager.getCurrentPost();
        if (!id) {
            message.error('Please enter from post list to view details');
            router.push(navigationRoutes.forum);
            return;
        }

        setContentId(id);

        // Get browsing history
        const history = PostStateManager.getHistory();
        setViewHistory(history.filter(h => h !== id).slice(0, 5)); // Exclude current post, take latest 5

        // Create or update session
        const newSessionId = ImprovedPostSessionManager.createOrUpdateSession(id, document.referrer);
        setSessionId(newSessionId);

        initializeUserAndPost(id);
    }, []);

    // Clean up when page unmounts
    useEffect(() => {
        return () => {
            if (contentId) {
                PostStateManager.clearCurrentPost();
            }
        };
    }, [contentId]);

    // Initialize user information and post data
    const initializeUserAndPost = async (id: number) => {
        try {
            // Get current user information
            const [userId, username] = await Promise.all([
                UsersApi.getUserId(),
                UsersApi.getUsername(),
            ]);
            setCurrentUserId(userId);
            setCurrentUsername(username);




            // Get post details
            await fetchPostDetail(id);

            // Verify session and increase view count
            if (sessionId) {
                const session = ImprovedPostSessionManager.validateAndUpdateSession(sessionId);
                if (session && session.viewCount === 1) {
                    // Only increase view count on first view
                    incrementViewCount(id);
                }
            }

            // Load replies
            fetchReplies(id);
        } catch (error) {
            console.error('Initialization failed:', error);
        }
    };

    // Get post details
    const fetchPostDetail = async (id: number) => {
        try {
            setLoading(true);
            const data = await PostsApi.getPostById(id);
            setPost(data);
            // Set like status directly from backend data
            setIsLiked(data.isLiked || false);
        } catch (error) {
            message.error('Failed to get post details');
        } finally {
            setLoading(false);
        }
    };

    // Increase view count
    const incrementViewCount = (id: number) => {
        // Use sessionStorage to record viewed
        const viewedKey = `viewed_post_${id}_${new Date().toDateString()}`;
        if (!sessionStorage.getItem(viewedKey)) {
            sessionStorage.setItem(viewedKey, 'true');

            // Update locally displayed view count
            if (post) {
                setPost(prev => prev ? { ...prev, viewCount: prev.viewCount + 1 } : null);
            }
        }
    };

    // Get replies list

    const fetchReplies = async (postId: number) => {
        try {
            const response = await PostsApi.getReplies(postId);

            // 🔥 Add debug logs
            console.log('📦 Raw data returned from backend:', response);
            console.log('📦 Replies list:', response.replies);

            const repliesData = response.replies.map((reply: any) => {
                // 🔥 Print key fields of each reply
                console.log(`Reply ${reply.replyId}:`, {
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
                    replyTo: reply.replyTo, // Target reply ID
                    replyToName: reply.replyToName, // Target username
                };
            });

            console.log('📊 Processed replies data:', repliesData);

            // Build tree structure
            const repliesMap = new Map<number, ForumReply>();
            const rootReplies: ForumReply[] = [];

            // First store all replies in Map and initialize children array
            repliesData.forEach((reply: ForumReply) => {
                repliesMap.set(reply.replyId, { ...reply, children: [] });
            });

            // Build parent-child relationships
            repliesData.forEach((reply: ForumReply) => {
                const replyWithChildren = repliesMap.get(reply.replyId);
                console.log(`🔗 Processing reply ${reply.replyId}, replyTo: ${reply.replyTo}`);

                if (reply.replyTo) {
                    // If there's replyTo (replying to a reply), add to the corresponding reply's children
                    const parent = repliesMap.get(reply.replyTo);
                    if (parent && replyWithChildren) {
                        parent.children!.push(replyWithChildren);
                        console.log(`✅ Successfully added reply ${reply.replyId} to parent reply ${reply.replyTo}'s children`);
                    } else {
                        // If parent reply not found (may be deleted), treat as root reply
                        if (replyWithChildren) {
                            rootReplies.push(replyWithChildren);
                            console.log(`⚠️ Parent reply ${reply.replyTo} not found, treating reply ${reply.replyId} as root reply`);
                        }
                    }
                } else {
                    // No replyTo, it's a root reply (directly replying to post)
                    if (replyWithChildren) {
                        rootReplies.push(replyWithChildren);
                        console.log(`✅ Reply ${reply.replyId} is a root reply (directly replying to post)`);
                    }
                }
            });

            // Sort by time (earliest first)
            rootReplies.sort((a, b) =>
                new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
            );

            console.log('🌲 Final tree structure:', rootReplies);
            console.log('📌 Root replies count:', rootReplies.length);
            rootReplies.forEach((reply, index) => {
                console.log(`  Floor ${index + 1}: ReplyID=${reply.replyId}, Child replies=${reply.children?.length || 0}`);
                if (reply.children && reply.children.length > 0) {
                    reply.children.forEach((child, childIndex) => {
                        console.log(`    └─ Nested reply ${childIndex + 1}: ReplyID=${child.replyId}, Reply to @${child.replyToName}`);
                    });
                }
            });

            setReplies(rootReplies);
        } catch (error: any) {
            console.error('Failed to get replies list:', error);
            message.error(error.response?.data?.message || 'Failed to get replies list');
        }
    };

    // Like/unlike post
    const handleLikePost = async () => {
        if (!currentUserId || !contentId) {
            message.warning('Please login first');
            router.push(navigationRoutes.login);
            return;
        }

        try {
            // Call backend toggle API
            const response = await PostsApi.toggleLike(contentId);

            // Update local state (using real value returned from backend)
            setIsLiked(response.liked);
            if (post) {
                setPost({ ...post, likeCount: response.likeCount });
            }

            message.success(response.liked ? 'Liked successfully' : 'Unliked');
        } catch (error) {
            message.error('Operation failed');
        }
    };

    // Star/unstar post
    const handleStarPost = () => {
        if (!currentUserId || !contentId) {
            message.warning('Please login first');
            router.push(navigationRoutes.login);
            return;
        }

        const starredPosts = JSON.parse(localStorage.getItem(`starred_posts_${currentUserId}`) || '[]');

        if (isStarred) {
            const newStarredPosts = starredPosts.filter((id: number) => id !== contentId);
            localStorage.setItem(`starred_posts_${currentUserId}`, JSON.stringify(newStarredPosts));
            setIsStarred(false);
            message.success('Unstarred');
        } else {
            starredPosts.push(contentId);
            localStorage.setItem(`starred_posts_${currentUserId}`, JSON.stringify(starredPosts));
            setIsStarred(true);
            message.success('Starred successfully');
        }
    };

    // Share post
    const handleSharePost = () => {
        if (!post) return;

        // Generate secure share link (without direct ID)
        const shareUrl = `${window.location.origin}/dashboard/forum`;
        const shareText = `Check out this post: ${post.title}`;

        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: shareText,
                url: shareUrl,
            }).catch(() => {
                // User cancelled sharing
            });
        } else {
            // Copy share text to clipboard
            navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            message.success('Share link copied');
        }
    };


    // Submit reply
    // Modified function signature
    const handleSubmitReply = async (valuesOrContent?: any, customReplyTo?: ForumReply | null) => {
        if (!currentUserId || !contentId) {
            message.warning('Please login before replying');
            router.push(navigationRoutes.login);
            return;
        }

        let content: string;
        if (typeof valuesOrContent === 'string') {
            // Direct string input (inline reply)
            content = valuesOrContent;
        } else if (valuesOrContent && valuesOrContent.content) {
            // Object passed from Form.onFinish { content: '...' }
            content = valuesOrContent.content;
        } else {
            // Use value from state
            content = replyContent;
        }

        const targetReply = customReplyTo !== undefined ? customReplyTo : replyToReply;

        if (!content || !content.trim()) {
            message.warning('Reply content cannot be empty');
            return;
        }

        try {
            setReplyLoading(true);

            // Call backend API
            await PostsApi.createReply(contentId, {
                body: content.trim(),
                replyTo: targetReply?.replyId,
            });

            // Clear input field
            setReplyContent('');
            setReplyToReply(null);
            form.resetFields();

            // Reload replies list
            await fetchReplies(contentId);

            // Update post reply count
            if (post) {
                setPost({ ...post, replyCount: (post.replyCount || 0) + 1 });
            }

            message.success('Reply posted successfully');
        } catch (error) {
            message.error('Reply failed');
        } finally {
            setReplyLoading(false);
        }
    };

    // Delete reply (supports tree structure)
    const handleDeleteReply = async (replyId: number) => {
        if (!contentId) return; // contentId is postId

        try {
            await PostsApi.deleteReply(contentId, replyId); // Pass postId and replyId
            message.success('Deleted successfully');

            // Recursively delete replies
            const removeReplyFromTree = (replies: ForumReply[]): ForumReply[] => {
                return replies.filter(r => {
                    if (r.replyId === replyId) {
                        return false; // Delete this reply
                    }
                    if (r.children && r.children.length > 0) {
                        r.children = removeReplyFromTree(r.children); // Recursively process child replies
                    }
                    return true;
                });
            };

            setReplies(prev => removeReplyFromTree(prev));

            // Update post reply count
            if (post) {
                setPost({ ...post, replyCount: (post.replyCount || 0) - 1 });
            }
        } catch (error: any) {
            console.error('Failed to delete reply:', error);
            message.error(error.response?.data?.message || 'Delete failed');
        }
    };
    // Like reply
    const handleLikeReply = async (reply: ForumReply) => {
        if (!currentUserId || !contentId) {
            message.warning('Please login first');
            router.push(navigationRoutes.login);
            return;
        }

        try {
            const isCurrentlyLiked = reply.isLiked;

            // Call real API (not using localStorage)
            if (isCurrentlyLiked) {
                await PostsApi.unlikeReply(contentId, reply.replyId);
            } else {
                await PostsApi.likeReply(contentId, reply.replyId);
            }

            // Recursively update reply status
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
            message.success(isCurrentlyLiked ? 'Unliked' : 'Liked successfully');
        } catch (error: any) {
            console.error('Failed to like reply:', error);
            message.error(error.response?.data?.message || 'Operation failed');
        }
    };
    // Delete post
    const handleDeletePost = async () => {
        if (!contentId) return;

        try {
            await PostsApi.deletePost(contentId);
            message.success('Deleted successfully');

            // Clear state
            PostStateManager.clearCurrentPost();

            router.push(navigationRoutes.forum);
        } catch (error) {
            message.error('Delete failed');
        }
    };

    // Report post
    const handleReportPost = (reason: string) => {
        if (!contentId) return;

        // Save report record to localStorage
        const reports = JSON.parse(localStorage.getItem('post_reports') || '[]');
        reports.push({
            contentId,
            userId: currentUserId,
            reason,
            timestamp: new Date().toISOString(),
        });
        localStorage.setItem('post_reports', JSON.stringify(reports));

        setReportModalVisible(false);
        message.success('Report submitted, we will handle it as soon as possible');
    };

    const [showReplyBoxId, setShowReplyBoxId] = useState<number | null>(null);
    const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
    const [collapsedReplies, setCollapsedReplies] = useState<Set<number>>(new Set());

    // Render reply item
    // Render reply item (supports recursive rendering of child replies)
    const renderReplyItem = (reply: ForumReply, level: number = 0) => {
        const isReplyAuthor = currentUserId === reply.authorId;
        const hasChildren = reply.children && reply.children.length > 0;
        const childCount = reply.children?.length || 0;

        // 🔥 Get from parent component state
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
                            {/* User information */}
                            <div style={{ marginBottom: 8 }}>
                                <Space split={<Divider type="vertical" style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }} />}>
                                    <Text strong style={{ color: '#f9fafb', fontSize: level > 0 ? '13px' : '14px' }}>
                                        {reply.authorNickname || reply.authorName || 'Anonymous'}
                                    </Text>
                                    {/* 🔥 Floor number */}
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

                            {/* Reply content */}
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
                                    Reply to @{reply.replyToName}:
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

                            {/* Action buttons */}
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

                                {/* 🔥 Reply button */}
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
                                    Reply {childCount > 0 && `(${childCount})`}
                                </Button>

                                {/* 🔥 Expand/collapse child replies */}
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
                                        {collapsed ? `Expand ${childCount} replies` : 'Collapse'}
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
                                        Delete
                                    </Button>
                                )}
                            </Space>

                            {/* 🔥 Inline reply input box */}
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
                                        placeholder={`Reply to @${reply.authorName}...`}
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
                                                    message.warning('Please enter reply content');
                                                    return;
                                                }

                                                try {
                                                    // 🔥 Pass parameters directly, not dependent on state
                                                    await handleSubmitReply(replyText, reply);

                                                    // Clear input field and state
                                                    setReplyTexts({
                                                        ...replyTexts,
                                                        [reply.replyId]: ''
                                                    });
                                                    setShowReplyBoxId(null);
                                                } catch (error) {
                                                    console.error('Reply failed:', error);
                                                }
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                border: 'none',
                                            }}
                                        >
                                            Send
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
                                            Cancel
                                        </Button>
                                    </Space>
                                </div>
                            )}
                        </div>
                    </Space>
                </List.Item>

                {/* Child replies area */}
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
                        {/* 🔥 Display child replies based on collapse state */}
                        {(collapsed ? reply.children!.slice(0, 3) : reply.children!).map((childReply) =>
                            renderReplyItem(childReply, level + 1)
                        )}

                        {/* 🔥 Expand button (if there are more replies and in collapsed state) */}
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
                                Expand remaining {childCount - 3} replies &gt;&gt;
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
                    {/* Breadcrumb navigation */}
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
                                        <div style={{ marginTop: 16, color: '#9ca3af' }}>Loading...</div>
                                    </div>
                                </Card>
                            ) : post ? (
                                <>
                                    {/* Post body */}
                                    <Card
                                        className="animate-card-hover"
                                        style={{
                                            ...cardStyle,
                                            marginBottom: 24,
                                        }}
                                        styles={{ body: { padding: '32px' } }}
                                    >
                                        {/* Post header */}
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
                                                        Hot
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
                                                            handleAvatarError(new Error('Avatar loading failed'), true);
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
                                                        {post.viewCount} View
                                                    </Text>
                                                </Space>
                                            </Space>
                                        </div>

                                        <Divider style={{ borderColor: 'rgba(99, 102, 241, 0.2)' }} />

                                        {/* Post content */}

                                        <div
                                            className="quill-content"  // Add this class
                                            style={{
                                                color: '#e5e7eb',
                                                fontSize: '15px',
                                                lineHeight: 1.8,
                                                minHeight: 200,
                                            }}
                                            dangerouslySetInnerHTML={{ __html: post.body }}  // Use HTML rendering
                                        />

                                        {/* Tags */}
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

                                        {/* Action bar */}
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
                                                </Space>
                                            </Col>
                                            <Col>
                                                <Space>
                                                    {isAuthor && (
                                                        <>
                                                            <Button
                                                                type="text"
                                                                danger
                                                                icon={<DeleteOutlined />}
                                                                onClick={() => setDeleteModalVisible(true)}
                                                            >
                                                                Delete
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
                                                            Report
                                                        </Button>
                                                    )}
                                                </Space>
                                            </Col>
                                        </Row>
                                    </Card>

                                    {/* Reply input box */}
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
                                                                Reply to @{replyToReply.authorName}
                                                            </Text>
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                onClick={() => setReplyToReply(null)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </Space>
                                                    </div>
                                                )}

                                                <Form form={form} onFinish={handleSubmitReply}>
                                                    <Form.Item
                                                        name="content"
                                                        rules={[{ required: true, message: 'Please enter reply content' }]}
                                                    >
                                                        <TextArea
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                            placeholder={
                                                                replyToReply
                                                                    ? `Reply to @${replyToReply.authorName}...`
                                                                    : 'Write your reply...'
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
                                                            Reply
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
                                                Please
                                                <Button
                                                    type="link"
                                                    onClick={() => router.push(navigationRoutes.login)}
                                                    style={{ padding: '0 4px' }}
                                                >
                                                    login
                                                </Button>
                                                to join the discussion
                                            </Text>
                                        </Card>
                                    )}

                                    {/* Replies list */}
                                    <Card
                                        title={
                                            <Space>
                                                <CommentOutlined style={{ color: '#6366f1' }} />
                                                <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>
                                                    All Replies ({replies.length})
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
                                                locale={{ emptyText: 'No replies yet' }}
                                            />
                                        ) : (
                                            <Empty
                                                description={
                                                    <span style={{ color: '#9ca3af' }}>
                                                        No replies yet, be the first to comment!
                                                    </span>
                                                }
                                                style={{ padding: '40px 0' }}
                                            />
                                        )}
                                    </Card>
                                </>
                            ) : (
                                <Card style={cardStyle}>
                                    <Empty description="Post does not exist or has been deleted" />
                                </Card>
                            )}
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Delete confirmation modal */}
            <Modal
                title={
                    <Space>
                        <WarningOutlined style={{ color: '#ef4444' }} />
                        <span>Confirm Delete</span>
                    </Space>
                }
                open={deleteModalVisible}
                onOk={handleDeletePost}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Confirm Delete"
                cancelText="Cancel"
                okButtonProps={{
                    danger: true,
                }}
            >
                <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            </Modal>

            {/* Report modal */}
            <Modal
                title="Report Post"
                open={reportModalVisible}
                onCancel={() => setReportModalVisible(false)}
                footer={null}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Text>Please select a reason for reporting:</Text>
                    {['Inappropriate Content', 'Advertising', 'Malicious Attack', 'False Information', 'Other'].map(reason => (
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