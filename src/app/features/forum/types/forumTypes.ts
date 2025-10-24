// features/forum/types/forumTypes.ts

// Basic post type (extended based on your existing Post interface)
export interface ForumPost {
    //postId: number;       // Match backend postId
    contentId: number;  // Match backend contentId
    title: string;
    body: string;
    bodyPlain?: string;
    authorId: number;
    authorUsername?: string;  // Match backend authorUsername
    authorEmail?: string;     // Match backend authorEmail
    authorName?: string;
    authorNickname?: string;
    authorAvatar?: string;
    viewCount: number;
    likeCount: number;
    replyCount?: number;
    createdDate: string;
    updatedDate: string;
    status: string;           // Match backend status field
    isLiked: boolean;
    // Forum-specific fields
    category?: string;
    tags?: string[];
    isPinned?: boolean;
    isLocked?: boolean;
    lastReplyAt?: string;
    lastReplyBy?: string;
    hotScore?: number;
}

// Post categories
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

// Post list response
export interface ForumPostListResponse {
    posts: ForumPost[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    categories?: ForumCategory[];
}

// Post creation request
export interface CreateForumPostRequest {
    title: string;
    body: string;
    category?: string;
    tags?: string[];
    isPinned?: boolean;
}

// Post update request
export interface UpdateForumPostRequest extends Partial<CreateForumPostRequest> {
    isLocked?: boolean;
}

// Forum statistics
export interface ForumStats {
    todayPosts: number;
    onlineUsers: number;
    totalUsers: number;
    totalPosts: number;
    totalTopics: number;
}

// Game board
export interface GameBoard extends ForumCategory {
    gameInfo?: {
        developer?: string;
        releaseDate?: string;
        platforms?: string[];
        genres?: string[];
    };
}

// Post filter
export interface ForumPostFilter {
    category?: string;
    tags?: string[];
    sortBy?: 'latest' | 'popular' | 'hot' | 'replies';
    timeRange?: 'today' | 'week' | 'month' | 'all';
    authorId?: number;
}

// Hook state type
export interface UseForumState {
    posts: ForumPost[];
    categories: ForumCategory[];
    stats: ForumStats | null;
    loading: boolean;
    error: string | null;
    hasNextPage: boolean;
}

// Component Props type
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

// Form type
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

// Forum reply type
// features/forum/types/forumTypes.ts

export interface ForumReply {
    replyId: number;
    parentId?: number;           // Parent post ID
    body: string;                // Reply content (backend uses body)
    bodyPlain?: string;          // Plain text content
    authorId: number;
    authorName?: string;         // ⚠️ Changed to optional
    authorNickname?: string;
    authorAvatarUrl?: string;    // Backend returned field name
    createdDate: string;
    updatedDate?: string;
    likeCount: number;
    children?: ForumReply[];
    isLiked?: boolean;
    // Frontend extended fields (for replies to replies)
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
// Forum reply request
export interface CreateForumReplyRequest {
    contentId: number;
    content: string;
    replyTo?: number;
}
export interface CreateReplyRequest {
    body: string;  // Note: backend uses body, not content
}
// Constant types
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

// Utility types
export type ForumSortType = typeof FORUM_SORT_OPTIONS[keyof typeof FORUM_SORT_OPTIONS];
export type ForumTimeRangeType = typeof FORUM_TIME_RANGES[keyof typeof FORUM_TIME_RANGES];
export type ForumPostStatus = typeof FORUM_POST_STATUS[keyof typeof FORUM_POST_STATUS];