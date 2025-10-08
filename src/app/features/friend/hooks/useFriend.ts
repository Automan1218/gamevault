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

    // 加载好友列表
    const loadFriends = useCallback(async () => {
        try {
            setLoading(true);
            const data = await friendApi.getFriends();
            setFriends(data);
        } catch (error) {
            message.error(error.message || '加载好友列表失败');
        } finally {
            setLoading(false);
        }
    }, [message]);

    // 加载收到的好友请求
    const loadReceivedRequests = useCallback(async () => {
        try {
            const data = await friendApi.getReceivedRequests();
            setReceivedRequests(data);
        } catch (error) {
            message.error(error.message || '加载好友请求失败');
        }
    }, [message]);

    // 加载发送的好友请求
    const loadSentRequests = useCallback(async () => {
        try {
            const data = await friendApi.getSentRequests();
            setSentRequests(data);
        } catch (error) {
            message.error(error.message || '加载发送请求失败');
        }
    }, [message]);

    // 搜索用户
    const searchUsers = useCallback(async (keyword: string): Promise<UserSearchResult[]> => {
        try {
            return await friendApi.searchUsers(keyword);
        } catch (error) {
            message.error(error.message || '搜索用户失败');
            return [];
        }
    }, [message]);

    // 发送好友请求
    const sendFriendRequest = useCallback(async (toUserId: number, requestMessage?: string) => {
        try {
            await friendApi.sendFriendRequest(toUserId, requestMessage);
            message.success('好友请求已发送');
            await loadSentRequests();
        } catch (error) {
            message.error(error.message || '发送好友请求失败');
            throw error;
        }
    }, [loadSentRequests]);

    // 处理好友请求
    const handleFriendRequest = useCallback(async (requestId: number, accept: boolean) => {
        try {
            await friendApi.handleFriendRequest(requestId, accept);
            message.success(accept ? '已接受好友请求' : '已拒绝好友请求');
            await loadReceivedRequests();
            if (accept) {
                await loadFriends();
            }
        } catch (error) {
            message.error(error.message || '处理好友请求失败');
            throw error;
        }
    }, [loadReceivedRequests, loadFriends]);

    // 删除好友
    const deleteFriend = useCallback(async (friendId: number) => {
        try {
            await friendApi.deleteFriend(friendId);
            message.success('已删除好友');
            await loadFriends();
        } catch (error) {
            message.error(error.message || '删除好友失败');
            throw error;
        }
    }, [loadFriends]);

    // 初始化加载
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