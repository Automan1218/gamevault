// src/app/features/chat/hooks/useGroupChat.ts
import { useState, useEffect, useCallback } from 'react';
import { ChatApi } from '@/lib/api/chat';
import { chatWebSocket } from '@/lib/websocket/chatWebSocket';
import { GroupChat, ChatMessage, GroupMember, CreateGroupRequest } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { message } from 'antd';

/**
 * 群聊管理 Hook
 */
export function useGroupChat() {
    const { user } = useAuth();
    const [groups, setGroups] = useState<GroupChat[]>([]);
    const [currentGroup, setCurrentGroup] = useState<GroupChat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    // 加载用户的群聊列表（从本地存储）
    const loadGroups = useCallback(() => {
        if (!user) return;

        const localGroups = ChatApi.getLocalGroups(user.userId);
        setGroups(localGroups);
    }, [user]);

    // 创建群聊
    const createGroup = useCallback(
        async (title: string): Promise<GroupChat | null> => {
            if (!user) return null;

            setLoading(true);

            try {
                const request: CreateGroupRequest = {
                    title,
                    ownerId: user.userId,
                };

                const response = await ChatApi.createGroup(request);

                const newGroup: GroupChat = {
                    id: response.id,
                    title: response.title,
                    ownerId: response.ownerId,
                    createdAt: response.createdAt,
                    unread: 0,
                };

                setGroups(prev => [...prev, newGroup]);
                message.success('群聊创建成功');

                return newGroup;
            } catch (error) {
                console.error('创建群聊失败:', error);
                message.error('创建群聊失败');
                return null;
            } finally {
                setLoading(false);
            }
        },
        [user]
    );

    // 选择群聊
    const selectGroup = useCallback(
        async (group: GroupChat) => {
            if (!user) return;

            setCurrentGroup(group);
            setLoading(true);

            try {
                // 加载历史消息
                const history = await ChatApi.getGroupMessages(group.id);
                setMessages(history);

                // 加载群成员
                const groupMembers = await ChatApi.getGroupMembers(group.id);
                setMembers(groupMembers);

                // 订阅群聊消息
                chatWebSocket.subscribeGroup(group.id, (newMessage: ChatMessage) => {
                    setMessages(prev => [...prev, newMessage]);
                });

                // 清除未读数
                ChatApi.clearLocalGroupUnread(user.userId, group.id);
                setGroups(prev =>
                    prev.map(g => (g.id === group.id ? { ...g, unread: 0 } : g))
                );
            } catch (error) {
                console.error('加载群聊失败:', error);
                message.error('加载群聊失败');
            } finally {
                setLoading(false);
            }
        },
        [user]
    );

    // 取消选择群聊
    const unselectGroup = useCallback(() => {
        if (currentGroup) {
            chatWebSocket.unsubscribeGroup(currentGroup.id);
        }
        setCurrentGroup(null);
        setMessages([]);
        setMembers([]);
    }, [currentGroup]);

    // 发送群聊消息
    const sendMessage = useCallback(
        async (content: string) => {
            if (!user || !currentGroup || !content.trim()) {
                return;
            }

            setSending(true);

            try {
                chatWebSocket.sendGroupMessage(user.userId, currentGroup.id, content);

                // 乐观更新：立即显示消息
                const optimisticMessage: ChatMessage = {
                    id: Date.now(), // 临时 ID
                    senderId: user.userId,
                    conversationId: currentGroup.id,
                    content,
                    createdAt: new Date().toISOString(),
                };

                setMessages(prev => [...prev, optimisticMessage]);

                // 更新本地群聊的最后消息
                ChatApi.updateLocalGroupMessage(
                    user.userId,
                    currentGroup.id,
                    content,
                    false // 自己发送的消息不增加未读数
                );

                setGroups(prev =>
                    prev.map(g =>
                        g.id === currentGroup.id
                            ? {
                                ...g,
                                lastMessage: content,
                                lastMessageTime: new Date().toISOString(),
                            }
                            : g
                    )
                );
            } catch (error) {
                console.error('发送群聊消息失败:', error);
                message.error('发送失败，请检查网络连接');
            } finally {
                setSending(false);
            }
        },
        [user, currentGroup]
    );

    // 添加群成员
    const addMember = useCallback(
        async (userId: number) => {
            if (!currentGroup) return;

            try {
                await ChatApi.addGroupMember({
                    conversationId: currentGroup.id,
                    userId,
                });

                // 重新加载群成员
                const groupMembers = await ChatApi.getGroupMembers(currentGroup.id);
                setMembers(groupMembers);

                message.success('成员添加成功');
            } catch (error) {
                console.error('添加群成员失败:', error);
                message.error('添加成员失败');
            }
        },
        [currentGroup]
    );

    // 解散群聊
    const dissolveGroup = useCallback(
        async (conversationId: number) => {
            if (!user) return;

            try {
                await ChatApi.dissolveGroup({ conversationId });

                // 从列表中移除
                setGroups(prev => prev.filter(g => g.id !== conversationId));

                // 如果是当前群聊，取消选择
                if (currentGroup?.id === conversationId) {
                    unselectGroup();
                }

                message.success('群聊已解散');
            } catch (error) {
                console.error('解散群聊失败:', error);
                message.error('解散群聊失败');
            }
        },
        [user, currentGroup, unselectGroup]
    );

    // 搜索群聊
    const searchGroups = useCallback(
        (keyword: string): GroupChat[] => {
            if (!keyword.trim()) return groups;

            const lowerKeyword = keyword.toLowerCase();
            return groups.filter(group =>
                group.title.toLowerCase().includes(lowerKeyword)
            );
        },
        [groups]
    );

    // 组件挂载时加载群聊列表
    useEffect(() => {
        loadGroups();
    }, [loadGroups]);

    // 组件卸载时取消订阅
    useEffect(() => {
        return () => {
            if (currentGroup) {
                chatWebSocket.unsubscribeGroup(currentGroup.id);
            }
        };
    }, [currentGroup]);

    return {
        groups,
        currentGroup,
        messages,
        members,
        loading,
        sending,
        loadGroups,
        createGroup,
        selectGroup,
        unselectGroup,
        sendMessage,
        addMember,
        dissolveGroup,
        searchGroups,
    };
}