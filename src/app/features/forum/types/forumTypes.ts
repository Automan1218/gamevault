// features/forum/types/forumTypes.ts

// 基础帖子类型（基于你现有的Post接口扩展）
export interface ForumPost {
    contentId: number;  // 匹配后端的contentId
    title: string;
    body: string;
    bodyPlain?: string;
    authorId: number;
    authorUsername?: string;  // 匹配后端的authorUsername
    authorEmail?: string;     // 匹配后端的authorEmail
    authorName?: string;
    authorNickname?: string;
    authorAvatar?: string;
    viewCount: number;
    likeCount: number;
    replyCount?: number;      // 可选，因为后端可能没有实现
    createdDate: string;
    updatedDate: string;
    status: string;           // 匹配后端的status字段

    // Forum特有字段
    category?: string;
    tags?: string[];
    isPinned?: boolean;
    isLocked?: boolean;
    lastReplyAt?: string;
    lastReplyBy?: string;
    hotScore?: number;
}

// 帖子分类
export interface ForumCategory {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    postCount: number;
    onlineUsers: number;
    parentId?: string;
    children?: ForumCategory[];
}

// 帖子列表响应
export interface ForumPostListResponse {
    posts: ForumPost[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    categories?: ForumCategory[];
}

// 帖子创建请求
export interface CreateForumPostRequest {
    title: string;
    body: string;
    category?: string;
    tags?: string[];
    isPinned?: boolean;
}

// 帖子更新请求
export interface UpdateForumPostRequest extends Partial<CreateForumPostRequest> {
    isLocked?: boolean;
}

// 论坛统计
export interface ForumStats {
    todayPosts: number;
    onlineUsers: number;
    totalUsers: number;
    totalPosts: number;
    totalTopics: number;
}

// 游戏板块
export interface GameBoard extends ForumCategory {
    gameInfo?: {
        developer?: string;
        releaseDate?: string;
        platforms?: string[];
        genres?: string[];
    };
}

// 帖子过滤器
export interface ForumPostFilter {
    category?: string;
    tags?: string[];
    sortBy?: 'latest' | 'popular' | 'hot' | 'replies';
    timeRange?: 'today' | 'week' | 'month' | 'all';
    authorId?: number;
}

// Hook状态类型
export interface UseForumState {
    posts: ForumPost[];
    categories: ForumCategory[];
    stats: ForumStats | null;
    loading: boolean;
    error: string | null;
    hasNextPage: boolean;
}

// 组件Props类型
export interface ForumPostCardProps {
    post: ForumPost;
    showCategory?: boolean;
    showActions?: boolean;
    onLike?: (postId: number) => void;
    onShare?: (post: ForumPost) => void;
    onClick?: (post: ForumPost) => void;
}

export interface ForumCategoryCardProps {
    category: ForumCategory;
    onClick?: (category: ForumCategory) => void;
}

export interface ForumPostEditorProps {
    initialData?: Partial<CreateForumPostRequest>;
    categories: ForumCategory[];
    onSubmit: (data: CreateForumPostRequest) => Promise<void>;
    onSaveDraft?: (data: Partial<CreateForumPostRequest>) => void;
    loading?: boolean;
}

export interface ForumStatsCardProps {
    stats: ForumStats;
    className?: string;
}

// 表单类型
export interface ForumSearchForm {
    keyword: string;
    category?: string;
    tags?: string[];
    sortBy?: ForumPostFilter['sortBy'];
}

export interface ForumPostForm {
    title: string;
    content: string;
    category: string;
    tags: string[];
    isPinned: boolean;
}

// 论坛回复类型
export interface ForumReply {
    id: number;
    postId: number;
    content: string;
    authorId: number;
    authorName: string;
    authorAvatar?: string;
    createdDate: string;
    updatedDate?: string;
    likeCount: number;
    replyTo?: number; // 回复的回复ID
}

// 论坛回复请求
export interface CreateForumReplyRequest {
    postId: number;
    content: string;
    replyTo?: number;
}

// 常量类型
export const FORUM_SORT_OPTIONS = {
    LATEST: 'latest',
    POPULAR: 'popular',
    HOT: 'hot',
    REPLIES: 'replies'
} as const;

export const FORUM_TIME_RANGES = {
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month',
    ALL: 'all'
} as const;

export const FORUM_POST_STATUS = {
    PUBLISHED: 'published',
    DRAFT: 'draft',
    LOCKED: 'locked',
    DELETED: 'deleted'
} as const;

// 工具类型
export type ForumSortType = typeof FORUM_SORT_OPTIONS[keyof typeof FORUM_SORT_OPTIONS];
export type ForumTimeRangeType = typeof FORUM_TIME_RANGES[keyof typeof FORUM_TIME_RANGES];
export type ForumPostStatus = typeof FORUM_POST_STATUS[keyof typeof FORUM_POST_STATUS];