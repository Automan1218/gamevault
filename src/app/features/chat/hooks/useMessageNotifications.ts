import { useState, useEffect, useCallback, useRef } from 'react';
import { chatWebSocket } from '@/lib/websocket/chatWebSocket';
import { message as antMessage } from 'antd';

export interface UnreadMessage {
    friendId: number;
    friendName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export interface UnreadGroupMessage {
    groupId: number;
    groupName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    senderName: string;
}
export const dynamic = 'force-dynamic';
export function useMessageNotifications(
    currentUserId: number,
    currentChatFriendId: number | null,
    currentChatGroupId: number | null,  // 当前选中的群聊ID
    userGroups: Array<{ id: number; title: string }>  // 用户的群聊列表
) {
    const [unreadMessages, setUnreadMessages] = useState<Map<number, UnreadMessage>>(new Map());
    const [unreadGroupMessages, setUnreadGroupMessages] = useState<Map<number, UnreadGroupMessage>>(new Map());

    const hasSubscribedRef = useRef(false);
    const hasSubscribedGroupsRef = useRef(false);
    const currentChatFriendIdRef = useRef(currentChatFriendId);
    const currentChatGroupIdRef = useRef(currentChatGroupId);
    const subscriptionRef = useRef<any>(null);
    const groupSubscriptionsRef = useRef<Map<number, any>>(new Map());

    useEffect(() => {
        currentChatFriendIdRef.current = currentChatFriendId;
    }, [currentChatFriendId]);

    useEffect(() => {
        currentChatGroupIdRef.current = currentChatGroupId;
    }, [currentChatGroupId]);

    // 获取好友未读数
    const getUnreadCount = useCallback((friendId: number): number => {
        return unreadMessages.get(friendId)?.unreadCount || 0;
    }, [unreadMessages]);

    // 获取群聊未读数
    const getGroupUnreadCount = useCallback((groupId: number): number => {
        return unreadGroupMessages.get(groupId)?.unreadCount || 0;
    }, [unreadGroupMessages]);

    // 获取总未读数
    const getTotalUnreadCount = useCallback((): number => {
        let total = 0;
        unreadMessages.forEach(msg => {
            total += msg.unreadCount;
        });
        unreadGroupMessages.forEach(msg => {  // 加上群聊未读
            total += msg.unreadCount;
        });
        return total;
    }, [unreadMessages, unreadGroupMessages]);

    // 标记私聊已读
    const markAsRead = useCallback((friendId: number) => {
        setUnreadMessages(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(friendId);
            if (existing) {
                newMap.set(friendId, { ...existing, unreadCount: 0 });
            }
            return newMap;
        });
    }, []);

    // 标记群聊已读
    const markGroupAsRead = useCallback((groupId: number) => {
        // console.log('标记群聊已读 - groupId:', groupId);
        setUnreadGroupMessages(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(groupId);
            if (existing) {
                newMap.set(groupId, { ...existing, unreadCount: 0 });
            }
            return newMap;
        });
    }, []);

    const clearAll = useCallback(() => {
        setUnreadMessages(new Map());
        setUnreadGroupMessages(new Map());
    }, []);

    // 订阅私聊消息
    useEffect(() => {
        if (!currentUserId || currentUserId === 0) {
            // 清理私聊订阅
            // console.log('currentUserId 为空，清理私聊订阅');
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
                hasSubscribedRef.current = false;
            }
            return;
        }

        if (!chatWebSocket.isConnected()) {
            console.log('WebSocket 未连接，等待连接...');

            const timer = setInterval(() => {
                if (chatWebSocket.isConnected() && !hasSubscribedRef.current) {
                    console.log('WebSocket 已连接，开始订阅私聊');
                    clearInterval(timer);
                    performSubscription();
                }
            }, 500);

            return () => {
                clearInterval(timer);
            };
        }

        if (hasSubscribedRef.current) {
            // 已订阅私聊消息通知，跳过
            // console.log('已订阅私聊消息通知，跳过');
            return;
        }

        performSubscription();

        function performSubscription() {
            // 开始订阅私聊消息通知
            // console.log('========== 开始订阅私聊消息通知 ==========');
            // console.log('用户ID:', currentUserId);

            try {
                const subscription = chatWebSocket.subscribeToPrivateMessages(
                    currentUserId.toString(),
                    (newMessage) => {
                        const currentChatId = currentChatFriendIdRef.current;

                        // console.log('收到私聊消息通知:', newMessage.content);

                        const messageFriendId = newMessage.senderId === currentUserId
                            ? newMessage.receiverId
                            : newMessage.senderId;

                        // 正在与该好友聊天，不显示通知
                        if (messageFriendId === currentChatId) {
                            // console.log('正在与该好友聊天，不显示通知');
                            return;
                        }

                        // 这是我发给其他好友的消息，不显示通知
                        if (newMessage.senderId === currentUserId && messageFriendId !== currentChatId) {
                            // console.log('这是我发给其他好友的消息，不显示通知');
                            return;
                        }

                        // 新私聊未读消息 - friendId:
                        console.log('更新私聊未读消息 - friendId:', messageFriendId);

                        setUnreadMessages(prev => {
                            const newMap = new Map(prev);
                            const existing = newMap.get(messageFriendId);

                            if (existing) {
                                newMap.set(messageFriendId, {
                                    ...existing,
                                    lastMessage: newMessage.content,
                                    lastMessageTime: newMessage.timestamp || newMessage.createdAt,
                                    unreadCount: existing.unreadCount + 1,
                                });
                            } else {
                                newMap.set(messageFriendId, {
                                    friendId: messageFriendId,
                                    friendName: newMessage.senderUsername || '未知用户',
                                    lastMessage: newMessage.content,
                                    lastMessageTime: newMessage.timestamp || newMessage.createdAt,
                                    unreadCount: 1,
                                });
                            }

                            return newMap;
                        });

                        antMessage.info({
                            content: `${newMessage.senderUsername}: ${newMessage.content}`,
                            duration: 3,
                        });

                    }
                );

                subscriptionRef.current = subscription;
                hasSubscribedRef.current = true;
                // 私聊消息通知订阅成功

            } catch (error) {
                // 私聊订阅失败
                console.error('私聊订阅失败:', error);
            }
        }

        return () => {
            // 清理私聊订阅
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
                hasSubscribedRef.current = false;
            }
        };
    }, [currentUserId]);

    // 订阅群聊消息
    useEffect(() => {
        if (!currentUserId || currentUserId === 0) {
            // currentUserId 为空，清理群聊订阅
            // console.log('currentUserId 为空，清理群聊订阅');
            groupSubscriptionsRef.current.forEach(sub => sub.unsubscribe());
            groupSubscriptionsRef.current.clear();
            hasSubscribedGroupsRef.current = false;
            return;
        }

        if (userGroups.length === 0) {
            // 没有群聊，跳过订阅
            // console.log('没有群聊，跳过订阅');
            return;
        }

        if (!chatWebSocket.isConnected()) {
            // WebSocket 未连接，等待连接...
            // console.log('WebSocket 未连接，等待连接...');

            const timer = setInterval(() => {
                if (chatWebSocket.isConnected() && !hasSubscribedGroupsRef.current) {
                    // WebSocket 已连接，开始订阅群聊
                    // console.log('WebSocket 已连接，开始订阅群聊');
                    clearInterval(timer);
                    performGroupSubscription();
                }
            }, 500);

            return () => {
                clearInterval(timer);
            };
        }

        if (hasSubscribedGroupsRef.current) {
            // 已订阅群聊消息通知，跳过
            // console.log('已订阅群聊消息通知，跳过');
            return;
        }

        performGroupSubscription();

        function performGroupSubscription() {
            // 开始订阅群聊消息通知
            // console.log('========== 开始订阅群聊消息通知 ==========');
            // console.log('订阅群聊数量:', userGroups.length);

            userGroups.forEach(group => {
                try {
                    // group.id, '-', group.title
                    // console.log('订阅群聊:', group.id, '-', group.title);

                    const subscription = chatWebSocket.subscribeToConversation(
                        group.id.toString(),
                        (newMessage) => {
                            const currentGroupId = currentChatGroupIdRef.current;

                            // 如果是自己发的消息，不显示通知
                            if (newMessage.senderId === currentUserId) {
                                // 这是我发的消息，不显示通知
                                // console.log('这是我发的消息，不显示通知');
                                return;
                            }

                            // 如果正在这个群聊中，不增加未读数（但消息已经在聊天窗口显示了）
                            if (group.id === currentGroupId) {
                                // 正在该群聊中，不显示通知
                                // console.log('正在该群聊中，不显示通知');
                                return;
                            }
                            // 更新群聊未读消息 - groupId:
                            // console.log('更新群聊未读消息 - groupId:', group.id);

                            // 更新未读消息
                            setUnreadGroupMessages(prev => {
                                const newMap = new Map(prev);
                                const existing = newMap.get(group.id);

                                if (existing) {
                                    newMap.set(group.id, {
                                        ...existing,
                                        lastMessage: newMessage.content,
                                        lastMessageTime: newMessage.timestamp || newMessage.createdAt,
                                        senderName: newMessage.senderUsername,
                                        unreadCount: existing.unreadCount + 1,
                                    });
                                } else {
                                    newMap.set(group.id, {
                                        groupId: group.id,
                                        groupName: group.title,
                                        lastMessage: newMessage.content,
                                        lastMessageTime: newMessage.timestamp || newMessage.createdAt,
                                        senderName: newMessage.senderUsername,
                                        unreadCount: 1,
                                    });
                                }
                                // 群聊未读消息已更新
                                // console.log('群聊未读消息已更新');
                                return newMap;
                            });

                            // 显示通知
                            antMessage.info({
                                content: `${group.title} - ${newMessage.senderUsername}: ${newMessage.content}`,
                                duration: 3,
                            });

                        }
                    );

                    groupSubscriptionsRef.current.set(group.id, subscription);
                    // 群聊订阅成功 - groupId
                    // console.log('群聊订阅成功 - groupId:', group.id);

                } catch (error) {
                    // 群聊订阅失败 - groupId:
                    console.error('群聊订阅失败 - groupId:', group.id, error);
                }
            });

            hasSubscribedGroupsRef.current = true;
            // 所有群聊消息通知订阅完成
        }

        return () => {
            // 清理群聊订阅
            groupSubscriptionsRef.current.forEach(sub => sub.unsubscribe());
            groupSubscriptionsRef.current.clear();
            hasSubscribedGroupsRef.current = false;
        };
    }, [currentUserId, userGroups]);

    return {
        unreadMessages,
        unreadGroupMessages,
        getUnreadCount,
        getGroupUnreadCount,
        getTotalUnreadCount,
        markAsRead,
        markGroupAsRead,
        clearAll,
    };
}