// src/app/features/chat/hooks/useGroupChat.ts
import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '@/lib/api/chat';
import { GroupChat, ChatMessage, GroupMember } from '@/types/chat';
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

    const loadGroups = useCallback(async () => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            console.log('用户未登录（无 token），跳过加载群聊列表');
            return;
        }

        setLoading(true);

        try {
            const groupList = await chatApi.getGroupList();
            const activeGroups = groupList.filter(g => g.status !== 'dissolved');
            setGroups(activeGroups);
        } catch (error) {
            console.error('加载群聊列表失败:', error);
            message.error('加载群聊列表失败');
            setGroups([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 创建群聊
    const createGroup = useCallback(
        async (title: string): Promise<GroupChat | null> => {
            if (!user) {
                message.error('用户未登录');
                return null;
            }

            setLoading(true);

            try {
                const newGroup = await chatApi.createGroup({ name: title });
                // 重新加载列表以获取最新数据
                await loadGroups();
                return newGroup;
            } catch (error) {
                console.error('创建群聊失败:', error);
                message.error(error instanceof Error ? error.message : '创建群聊失败');
                return null;
            } finally {
                setLoading(false);
            }
        },
        [user, loadGroups]
    );

    // 选择群聊
    const selectGroup = useCallback(
        async (group: GroupChat) => {
            if (!user) return;

            setCurrentGroup(group);

            setLoading(true);
            try {
                const groupMembers = await chatApi.getGroupMembers(group.id);
                setMembers(groupMembers);
                console.log('群聊成员加载成功:', groupMembers);
            } catch (error) {
                console.error('加载群聊成员失败:', error);
                message.error('加载群聊成员失败');
                setMembers([]);
            } finally {
                setLoading(false);
            }
        },
        [user]
    );

    const unselectGroup = useCallback(() => {
        console.log('取消选择群聊');
        setCurrentGroup(null);
        setMessages([]);
        setMembers([]);


    }, []);

    const sendMessage = useCallback(
        async (content: string) => {
            console.log('发送群聊消息:', content);
            message.info('发送消息功能开发中');
        },
        []
    );

    // 添加群成员
    const addMember = useCallback(
        async (userId: number) => {
            console.log('添加群成员:', userId);
            message.info('添加成员功能开发中');
        },
        []
    );

    // 解散群聊
    const dissolveGroup = useCallback(
        async (conversationId: number) => {
            if (!user) {
                message.error('用户未登录');
                return;
            }

            try {
                await chatApi.dissolveGroup(conversationId);

                // 从列表中移除
                setGroups(prev => prev.filter(g => g.id !== conversationId));

                // 如果是当前选中的群聊，取消选择
                if (currentGroup?.id === conversationId) {
                    unselectGroup();
                }

            } catch (error) {
                console.error('解散群聊失败:', error);
                throw error;
            }
        },
        [user, currentGroup]
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