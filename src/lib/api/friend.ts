import { apiClient } from './client';

interface UserSearchResponse {
    uid: number;
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
    uid: number;
    username: string;
    email: string;
    remark?: string;
    friendSince: string;
}

export class FriendApi {
    /**
     * 搜索好友列表
     */
    async searchUsers(keyword: string): Promise<UserSearchResponse[]> {
        return apiClient.get<UserSearchResponse[]>('/friend/search', { keyword });
    }

    /**
     * 发送好友请求
     */
    async sendFriendRequest(toUserId: number, message?: string): Promise<void> {
        await apiClient.post('/friend/request/send', { toUserId, message });
    }

    /**
     * 获取收到的好友请求
     */
    async getReceivedRequests(): Promise<FriendRequestResponse[]> {
        return apiClient.get<FriendRequestResponse[]>('/friend/request/received');
    }

    /**
     * 获取发送的好友请求
     */
    async getSentRequests(): Promise<FriendRequestResponse[]> {
        return apiClient.get<FriendRequestResponse[]>('/friend/request/sent');
    }

    /**
     * 处理好友请求
     */
    async handleFriendRequest(requestId: number, accept: boolean): Promise<void> {
        await apiClient.post('/friend/request/handle', { requestId, accept });
    }

    /**
     * 获取好友列表
     */
    async getFriends(): Promise<FriendResponse[]> {
        return apiClient.get<FriendResponse[]>('/friend/list');
    }

    /**
     * 删除好友
     */
    async deleteFriend(friendId: number): Promise<void> {
        await apiClient.delete(`/friend/${friendId}`);
    }
}

export const friendApi = new FriendApi();