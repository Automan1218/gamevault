// features/forum/utils/forumUtils.ts
import { ForumPost, ForumCategory, ForumSortType } from '../types/forumTypes';

// 时间格式化工具
export const formatPostTime = (dateString: string): string => {
    const now = new Date();
    const postTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
        return '刚刚';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}分钟前`;
    } else if (diffInMinutes < 1440) { // 24小时
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours}小时前`;
    } else if (diffInMinutes < 10080) { // 7天
        const days = Math.floor(diffInMinutes / 1440);
        return `${days}天前`;
    } else {
        return postTime.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
};

// 格式化数字显示
export const formatNumber = (num: number): string => {
    if (num < 1000) {
        return num.toString();
    } else if (num < 10000) {
        return `${(num / 1000).toFixed(1)}K`;
    } else if (num < 100000) {
        return `${(num / 10000).toFixed(1)}万`;
    } else {
        return `${Math.floor(num / 10000)}万`;
    }
};

// 格式化浏览量
export const formatViewCount = (count: number): string => {
    return `${formatNumber(count)} 浏览`;
};

// 格式化点赞数
export const formatLikeCount = (count: number): string => {
    return `${formatNumber(count)} 赞`;
};

// 格式化回复数
export const formatReplyCount = (count: number): string => {
    return `${formatNumber(count)} 回复`;
};

// 截断文本
export const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

// 提取帖子摘要
export const extractPostSummary = (content: string, maxLength: number = 150): string => {
    // 移除HTML标签
    const plainText = content.replace(/<[^>]*>/g, '');
    // 移除多余的空白字符
    const cleanText = plainText.replace(/\s+/g, ' ').trim();
    // 截断文本
    return truncateText(cleanText, maxLength);
};

// 生成帖子链接
export const generatePostUrl = (postId: number, title?: string): string => {
    const baseUrl = `/dashboard/forum/${postId}`;
    if (title) {
        const slug = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        return `${baseUrl}/${slug}`;
    }
    return baseUrl;
};

// 生成分类链接
export const generateCategoryUrl = (categoryId: string): string => {
    return `/dashboard/forum/category/${categoryId}`;
};

// 生成用户帖子链接
export const generateUserPostsUrl = (userId: number): string => {
    return `/dashboard/forum/user/${userId}`;
};

// 计算帖子热度分数
export const calculateHotScore = (post: ForumPost): number => {
    const now = Date.now();
    const postTime = new Date(post.createdDate).getTime();
    const ageInHours = (now - postTime) / (1000 * 60 * 60);

    // 基础分数：点赞数 * 3 + 回复数 * 5 + 浏览数 * 0.1
    const baseScore = post.likeCount * 3 + post.replyCount * 5 + post.viewCount * 0.1;

    // 时间衰减因子
    const decayFactor = Math.pow(ageInHours + 2, 1.5);

    return baseScore / decayFactor;
};

// 帖子排序
export const sortPosts = (posts: ForumPost[], sortBy: ForumSortType): ForumPost[] => {
    const sortedPosts = [...posts];

    switch (sortBy) {
        case 'latest':
            return sortedPosts.sort((a, b) =>
                new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
            );

        case 'popular':
            return sortedPosts.sort((a, b) => b.likeCount - a.likeCount);

        case 'hot':
            return sortedPosts.sort((a, b) =>
                calculateHotScore(b) - calculateHotScore(a)
            );

        case 'replies':
            return sortedPosts.sort((a, b) => b.replyCount - a.replyCount);

        default:
            return sortedPosts;
    }
};

// 过滤帖子
export const filterPosts = (
    posts: ForumPost[],
    options: {
        category?: string;
        tags?: string[];
        authorId?: number;
        keyword?: string;
    }
): ForumPost[] => {
    return posts.filter(post => {
        // 分类过滤
        if (options.category && post.category !== options.category) {
            return false;
        }

        // 标签过滤
        if (options.tags && options.tags.length > 0) {
            const hasMatchingTag = post.tags?.some(tag =>
                options.tags!.includes(tag)
            );
            if (!hasMatchingTag) return false;
        }

        // 作者过滤
        if (options.authorId && post.authorId !== options.authorId) {
            return false;
        }

        // 关键词过滤
        if (options.keyword) {
            const keyword = options.keyword.toLowerCase();
            const titleMatch = post.title.toLowerCase().includes(keyword);
            const bodyMatch = post.body.toLowerCase().includes(keyword);
            const authorMatch = post.authorName?.toLowerCase().includes(keyword);

            if (!titleMatch && !bodyMatch && !authorMatch) {
                return false;
            }
        }

        return true;
    });
};

// 高亮搜索关键词
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
};

// 验证帖子标题
export const validatePostTitle = (title: string): { valid: boolean; error?: string } => {
    if (!title.trim()) {
        return { valid: false, error: '标题不能为空' };
    }

    if (title.length < 5) {
        return { valid: false, error: '标题至少需要5个字符' };
    }

    if (title.length > 100) {
        return { valid: false, error: '标题不能超过100个字符' };
    }

    return { valid: true };
};

// 验证帖子内容
export const validatePostContent = (content: string): { valid: boolean; error?: string } => {
    if (!content.trim()) {
        return { valid: false, error: '内容不能为空' };
    }

    if (content.length < 10) {
        return { valid: false, error: '内容至少需要10个字符' };
    }

    if (content.length > 10000) {
        return { valid: false, error: '内容不能超过10000个字符' };
    }

    return { valid: true };
};

// 生成随机颜色
export const generateRandomColor = (): string => {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ];

    return colors[Math.floor(Math.random() * colors.length)];
};

// 获取分类颜色
export const getCategoryColor = (category: ForumCategory): string => {
    return category.color || generateRandomColor();
};

// 判断是否为今天的帖子
export const isToday = (dateString: string): boolean => {
    const today = new Date();
    const postDate = new Date(dateString);

    return today.toDateString() === postDate.toDateString();
};

// 判断是否为本周的帖子
export const isThisWeek = (dateString: string): boolean => {
    const now = new Date();
    const postDate = new Date(dateString);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return postDate >= oneWeekAgo;
};

// 判断是否为本月的帖子
export const isThisMonth = (dateString: string): boolean => {
    const now = new Date();
    const postDate = new Date(dateString);

    return now.getMonth() === postDate.getMonth() &&
        now.getFullYear() === postDate.getFullYear();
};

// 生成SEO友好的URL slug
export const generateUrlSlug = (title: string): string => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};

// 解析帖子标签
export const parsePostTags = (content: string): string[] => {
    const tagRegex = /#(\w+)/g;
    const matches = content.match(tagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
};

// 清理HTML内容
export const cleanHtmlContent = (html: string): string => {
    // 移除脚本标签
    let cleaned = html.replace(/<script[^>]*>.*?<\/script>/gi, '');

    // 移除样式标签
    cleaned = cleaned.replace(/<style[^>]*>.*?<\/style>/gi, '');

    // 移除注释
    cleaned = cleaned.replace(/<!--.*?-->/g, '');

    return cleaned;
};

// 估算阅读时间（基于中文字符）
export const estimateReadingTime = (content: string): string => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const characterCount = plainText.length;

    // 中文阅读速度大约每分钟300-400字
    const readingSpeed = 350;
    const minutes = Math.ceil(characterCount / readingSpeed);

    if (minutes < 1) {
        return '1分钟内';
    } else if (minutes === 1) {
        return '1分钟';
    } else {
        return `${minutes}分钟`;
    }
};

// 检查用户权限
export const canUserEditPost = (post: ForumPost, currentUserId?: number): boolean => {
    if (!currentUserId) return false;

    // 作者可以编辑
    if (post.authorId === currentUserId) return true;

    // 这里可以添加管理员权限检查
    // if (isAdmin(currentUserId)) return true;

    return false;
};

export const canUserDeletePost = (post: ForumPost, currentUserId?: number): boolean => {
    if (!currentUserId) return false;

    // 作者可以删除
    if (post.authorId === currentUserId) return true;

    // 这里可以添加管理员权限检查
    // if (isAdmin(currentUserId)) return true;

    return false;
};