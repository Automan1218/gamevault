// features/forum/types/forumTypes.ts

// 基础帖子类型（基于你现有的Post接口扩展）
export interface ForumPost {
    //postId: number;       // 匹配后端的postId
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
    replyCount?: number;
    createdDate: string;
    updatedDate: string;
    status: string;           // 匹配后端的status字段
    isLiked: boolean;
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
    onLike?: (contentId: number) => void;
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
// features/forum/types/forumTypes.ts

export interface ForumReply {
    replyId: number;
    parentId?: number;           // 父帖子ID
    body: string;                // 回复内容（后端用 body）
    bodyPlain?: string;          // 纯文本内容
    authorId: number;
    authorName?: string;         // ⚠️ 改成可选
    authorNickname?: string;
    authorAvatarUrl?: string;    // 后端返回的字段名
    createdDate: string;
    updatedDate?: string;
    likeCount: number;
    children?: ForumReply[];
    isLiked?: boolean;
    // 前端扩展字段（用于回复的回复）
    replyTo?: number;
    replyToName?: string;
}

export interface ReplyListResponse {
    replies: ForumReply[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}
// 论坛回复请求
export interface CreateForumReplyRequest {
    contentId: number;
    content: string;
    replyTo?: number;
}
export interface CreateReplyRequest {
    body: string;  // 注意:后端用的是 body,不是 content
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