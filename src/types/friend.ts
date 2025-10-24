/**
 * User search result
 */
export interface UserSearchResult {
    userId: number;
    username: string;
    email: string;
    isFriend: boolean;      // Whether already a friend
    hasPending: boolean;    // Whether has pending request
}

/**
 * Friend request
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
 * Friend information
 */
export interface Friend {
    userId: number;
    username: string;
    email: string;
    remark?: string;
    friendSince: string;
}