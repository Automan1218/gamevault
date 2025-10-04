// src/app/features/chat/hooks/useFriendList.ts
import { useState, useEffect, useCallback } from 'react';
import { ChatApi } from '@/lib/api/chat';
import { Friend } from '@/types/chat';
import { message } from 'antd';

/**
 * 好友列表管理 Hook
 */
export function useFriendList() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 加载好友列表
    const loadFriends = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await ChatApi.getFriendList();

            // 初始化前端字段
            const friendsWithStatus = data.map(friend => ({
                ...friend,
                status: 'offline' as const, // 默认离线，后续通过 WebSocket 更新
                unread: 0,
                lastMessage: undefined,
                lastMessageTime: undefined,
            }));

            setFriends(friendsWithStatus);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : '获取好友列表失败';
            setError(errorMsg);
            message.error(errorMsg);
            console.error('加载好友列表失败:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 更新好友的在线状态
    const updateFriendStatus = useCallback(
        (userId: number, status: 'online' | 'offline') => {
            setFriends(prev =>
                prev.map(friend =>
                    friend.userId === userId ? { ...friend, status } : friend
                )
            );
        },
        []
    );

    // 更新好友的最后消息
    const updateFriendMessage = useCallback(
        (userId: number, lastMessage: string, incrementUnread: boolean = true) => {
            setFriends(prev =>
                prev.map(friend =>
                    friend.userId === userId
                        ? {
                            ...friend,
                            lastMessage,
                            lastMessageTime: new Date().toISOString(),
                            unread: incrementUnread ? (friend.unread || 0) + 1 : friend.unread,
                        }
                        : friend
                )
            );
        },
        []
    );

    // 清除好友的未读消息数
    const clearFriendUnread = useCallback((userId: number) => {
        setFriends(prev =>
            prev.map(friend =>
                friend.userId === userId ? { ...friend, unread: 0 } : friend
            )
        );
    }, []);

    // 搜索好友
    const searchFriends = useCallback(
        (keyword: string): Friend[] => {
            if (!keyword.trim()) return friends;

            const lowerKeyword = keyword.toLowerCase();
            return friends.filter(
                friend =>
                    friend.username.toLowerCase().includes(lowerKeyword) ||
                    friend.nickname?.toLowerCase().includes(lowerKeyword)
            );
        },
        [friends]
    );

    // 获取好友信息
    const getFriend = useCallback(
        (userId: number): Friend | undefined => {
            return friends.find(f => f.userId === userId);
        },
        [friends]
    );

    // 组件挂载时加载好友列表
    useEffect(() => {
        loadFriends();
    }, [loadFriends]);

    return {
        friends,
        loading,
        error,
        loadFriends,
        updateFriendStatus,
        updateFriendMessage,
        clearFriendUnread,
        searchFriends,
        getFriend,
    };
}