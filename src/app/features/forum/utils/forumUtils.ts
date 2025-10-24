// features/forum/utils/forumUtils.ts
import { ForumPost, ForumCategory, ForumSortType } from '../types/forumTypes';

// Time formatting utility
export const formatPostTime = (dateString: string): string => {
    const now = new Date();
    const postTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} hours ago`;
    } else if (diffInMinutes < 10080) { // 7 days
        const days = Math.floor(diffInMinutes / 1440);
        return `${days} days ago`;
    } else {
        return postTime.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
};

// Format number display
export const formatNumber = (num: number): string => {
    if (num < 1000) {
        return num.toString();
    } else if (num < 10000) {
        return `${(num / 1000).toFixed(1)}K`;
    } else if (num < 100000) {
        return `${(num / 10000).toFixed(1)}W`;
    } else {
        return `${Math.floor(num / 10000)}W`;
    }
};

// Format view count
export const formatViewCount = (count: number): string => {
    return `${formatNumber(count)} views`;
};

// Format like count
export const formatLikeCount = (count: number): string => {
    return `${formatNumber(count)} likes`;
};

// Format reply count
export const formatReplyCount = (count: number): string => {
    return `${formatNumber(count)} replies`;
};

// Truncate text
export const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

// Extract post summary
export const extractPostSummary = (content: string, maxLength: number = 150): string => {
    // Remove HTML tags
    const plainText = content.replace(/<[^>]*>/g, '');
    // Remove extra whitespace
    const cleanText = plainText.replace(/\s+/g, ' ').trim();
    // Truncate text
    return truncateText(cleanText, maxLength);
};

// Generate post URL
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

// Generate category URL
export const generateCategoryUrl = (categoryId: string): string => {
    return `/dashboard/forum/category/${categoryId}`;
};

// Generate user posts URL
export const generateUserPostsUrl = (userId: number): string => {
    return `/dashboard/forum/user/${userId}`;
};

// Calculate post hot score
export const calculateHotScore = (post: ForumPost): number => {
    const now = Date.now();
    const postTime = new Date(post.createdDate).getTime();
    const ageInHours = (now - postTime) / (1000 * 60 * 60);

    // Base score: likes * 3 + replies * 5 + views * 0.1
    const baseScore = post.likeCount * 3 + post.replyCount * 5 + post.viewCount * 0.1;

    // Time decay factor
    const decayFactor = Math.pow(ageInHours + 2, 1.5);

    return baseScore / decayFactor;
};

// Post sorting
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

// Filter posts
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
        // Category filter
        if (options.category && post.category !== options.category) {
            return false;
        }

        // Tag filter
        if (options.tags && options.tags.length > 0) {
            const hasMatchingTag = post.tags?.some(tag =>
                options.tags!.includes(tag)
            );
            if (!hasMatchingTag) return false;
        }

        // Author filter
        if (options.authorId && post.authorId !== options.authorId) {
            return false;
        }

        // Keyword filter
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

// Highlight search terms
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
};

// Validate post title
export const validatePostTitle = (title: string): { valid: boolean; error?: string } => {
    if (!title.trim()) {
        return { valid: false, error: 'Title cannot be empty' };
    }

    if (title.length < 5) {
        return { valid: false, error: 'Title must be at least 5 characters' };
    }

    if (title.length > 100) {
        return { valid: false, error: 'Title cannot exceed 100 characters' };
    }

    return { valid: true };
};

// Validate post content
export const validatePostContent = (content: string): { valid: boolean; error?: string } => {
    if (!content.trim()) {
        return { valid: false, error: 'Content cannot be empty' };
    }

    if (content.length < 10) {
        return { valid: false, error: 'Content must be at least 10 characters' };
    }

    if (content.length > 10000) {
        return { valid: false, error: 'Content cannot exceed 10000 characters' };
    }

    return { valid: true };
};

// Generate random color
export const generateRandomColor = (): string => {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ];

    return colors[Math.floor(Math.random() * colors.length)];
};

// Get category color
export const getCategoryColor = (category: ForumCategory): string => {
    return category.color || generateRandomColor();
};

// Check if post is from today
export const isToday = (dateString: string): boolean => {
    const today = new Date();
    const postDate = new Date(dateString);

    return today.toDateString() === postDate.toDateString();
};

// Check if post is from this week
export const isThisWeek = (dateString: string): boolean => {
    const now = new Date();
    const postDate = new Date(dateString);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return postDate >= oneWeekAgo;
};

// Check if post is from this month
export const isThisMonth = (dateString: string): boolean => {
    const now = new Date();
    const postDate = new Date(dateString);

    return now.getMonth() === postDate.getMonth() &&
        now.getFullYear() === postDate.getFullYear();
};

// Generate SEO-friendly URL slug
export const generateUrlSlug = (title: string): string => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};

// Parse post tags
export const parsePostTags = (content: string): string[] => {
    const tagRegex = /#(\w+)/g;
    const matches = content.match(tagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
};

// Clean HTML content
export const cleanHtmlContent = (html: string): string => {
    // Remove script tags
    let cleaned = html.replace(/<script[^>]*>.*?<\/script>/gi, '');

    // Remove style tags
    cleaned = cleaned.replace(/<style[^>]*>.*?<\/style>/gi, '');

    // Remove comments
    cleaned = cleaned.replace(/<!--.*?-->/g, '');

    return cleaned;
};

// Estimate reading time (based on Chinese characters)
export const estimateReadingTime = (content: string): string => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const characterCount = plainText.length;

    // Chinese reading speed is about 300-400 characters per minute
    const readingSpeed = 350;
    const minutes = Math.ceil(characterCount / readingSpeed);

    if (minutes < 1) {
        return 'Less than 1 minute';
    } else if (minutes === 1) {
        return '1 minute';
    } else {
        return `${minutes} minutes`;
    }
};

// Check user permissions
export const canUserEditPost = (post: ForumPost, currentUserId?: number): boolean => {
    if (!currentUserId) return false;

    // Author can edit
    if (post.authorId === currentUserId) return true;

    // Admin permission check can be added here
    // if (isAdmin(currentUserId)) return true;

    return false;
};

export const canUserDeletePost = (post: ForumPost, currentUserId?: number): boolean => {
    if (!currentUserId) return false;

    // Author can delete
    if (post.authorId === currentUserId) return true;

    // Admin permission check can be added here
    // if (isAdmin(currentUserId)) return true;

    return false;
};