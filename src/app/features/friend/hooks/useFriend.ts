// src/app/features/friend/hooks/useFriend.ts

import { useState, useEffect, useCallback } from 'react';
import { App, message } from 'antd';
import { friendApi } from '@/lib/api/friend';
import type { Friend, FriendRequest, UserSearchResult } from '@/types/friend';

export function useFriend() {
    const { message } = App.useApp();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(false);

    // Load friends list
    const loadFriends = useCallback(async () => {
        try {
            setLoading(true);
            const data = await friendApi.getFriends();
            setFriends(data);
        } catch (error) {
            message.error(error.message || 'Failed to load friends list');
        } finally {
            setLoading(false);
        }
    }, [message]);

    // Load received friend requests
    const loadReceivedRequests = useCallback(async () => {
        try {
            const data = await friendApi.getReceivedRequests();
            setReceivedRequests(data);
        } catch (error) {
            message.error(error.message || 'Failed to load friend requests');
        }
    }, [message]);

    // Load sent friend requests
    const loadSentRequests = useCallback(async () => {
        try {
            const data = await friendApi.getSentRequests();
            setSentRequests(data);
        } catch (error) {
            message.error(error.message || 'Failed to load sent requests');
        }
    }, [message]);

    // Search users
    const searchUsers = useCallback(async (keyword: string): Promise<UserSearchResult[]> => {
        try {
            return await friendApi.searchUsers(keyword);
        } catch (error) {
            message.error(error.message || 'Failed to search users');
            return [];
        }
    }, [message]);

    // Send friend request
    const sendFriendRequest = useCallback(async (toUserId: number, requestMessage?: string) => {
        try {
            await friendApi.sendFriendRequest(toUserId, requestMessage);
            message.success('Friend request sent');
            await loadSentRequests();
        } catch (error) {
            message.error(error.message || 'Failed to send friend request');
            throw error;
        }
    }, [loadSentRequests]);

    // Handle friend request
    const handleFriendRequest = useCallback(async (requestId: number, accept: boolean) => {
        try {
            await friendApi.handleFriendRequest(requestId, accept);
            message.success(accept ? 'Friend request accepted' : 'Friend request rejected');
            await loadReceivedRequests();
            if (accept) {
                await loadFriends();
            }
        } catch (error) {
            message.error(error.message || 'Failed to handle friend request');
            throw error;
        }
    }, [loadReceivedRequests, loadFriends]);

    // Delete friend
    const deleteFriend = useCallback(async (friendId: number) => {
        try {
            await friendApi.deleteFriend(friendId);
            message.success('Friend deleted');
            await loadFriends();
        } catch (error) {
            message.error(error.message || 'Failed to delete friend');
            throw error;
        }
    }, [loadFriends]);

    // Initialize load
    useEffect(() => {
        loadFriends();
        loadReceivedRequests();
    }, [loadFriends, loadReceivedRequests]);

    return {
        friends,
        receivedRequests,
        sentRequests,
        loading,
        loadFriends,
        loadReceivedRequests,
        loadSentRequests,
        searchUsers,
        sendFriendRequest,
        handleFriendRequest,
        deleteFriend,
    };
}