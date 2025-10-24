import { chatroomApiClient } from './client';

interface UserSearchResponse {
    userId: number;
    username: string;
    email: string;
    isFriend: boolean;
    hasPending: boolean;
}

interface FriendRequestResponse {
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

interface FriendResponse {
    userId: number;
    username: string;
    email: string;
    remark?: string;
    friendSince: string;
}

export class FriendApi {
    /**
     * Search user list
     */
    async searchUsers(keyword: string): Promise<UserSearchResponse[]> {
        return chatroomApiClient.get<UserSearchResponse[]>('/friend/search', { keyword });
    }

    /**
     * Send friend request
     */
    async sendFriendRequest(toUserId: number, message?: string): Promise<void> {
        await chatroomApiClient.post('/friend/request/send', { toUserId, message });
    }

    /**
     * Get received friend requests
     */
    async getReceivedRequests(): Promise<FriendRequestResponse[]> {
        return chatroomApiClient.get<FriendRequestResponse[]>('/friend/request/received');
    }

    /**
     * Get sent friend requests
     */
    async getSentRequests(): Promise<FriendRequestResponse[]> {
        return chatroomApiClient.get<FriendRequestResponse[]>('/friend/request/sent');
    }

    /**
     * Handle friend request
     */
    async handleFriendRequest(requestId: number, accept: boolean): Promise<void> {
        await chatroomApiClient.post('/friend/request/handle', { requestId, accept });
    }

    /**
     * Get friend list
     */
    async getFriends(): Promise<FriendResponse[]> {
        return chatroomApiClient.get<FriendResponse[]>('/friend/list');
    }

    /**
     * Delete friend
     */
    async deleteFriend(friendId: number): Promise<void> {
        await chatroomApiClient.delete(`/friend/${friendId}`);
    }
}

export const friendApi = new FriendApi();