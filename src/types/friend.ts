/**
 * 用户搜索结果
 */
export interface UserSearchResult {
    uid: number;
    username: string;
    email: string;
    isFriend: boolean;      // 是否已是好友
    hasPending: boolean;    // 是否有待处理的请求
}

/**
 * 好友请求
 */
export interface FriendRequest {
    id: number;
    fromUserId: number;
    fromUsername: string;
    fromEmail: string;
    toUserId: number;
    toUsername: string;
    toEmail: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    createdAt: string;
    handledAt?: string;
}

/**
 * 好友信息
 */
export interface Friend {
    uid: number;
    username: string;
    email: string;
    remark?: string;
    friendSince: string;
}