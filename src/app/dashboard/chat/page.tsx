// src/app/dashboard/chat/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ConfigProvider, theme, message as antMessage } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/app/features/chat/hooks/useWebSocket';
import { useFriendList } from '@/app/features/chat/hooks/useFriendList';
import { usePrivateChat } from '@/app/features/chat/hooks/usePrivateChat';
import { useGroupChat } from '@/app/features/chat/hooks/useGroupChat';
import {
    ServerList,
    ChannelList,
    ChatWindow,
    CreateGroupModal,
    GroupSettingsModal,
} from '@/components/chat';
import { Conversation, Friend, GroupChat } from '@/types/chat';

export default function ChatPage() {
    const { user } = useAuth();
    const [darkMode, setDarkMode] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);

    // WebSocket 连接
    const { isConnected, status } = useWebSocket();

    // 好友列表
    const {
        friends,
        loading: friendsLoading,
        updateFriendMessage,
        clearFriendUnread,
        getFriend,
    } = useFriendList();

    // 群聊管理
    const {
        groups,
        currentGroup,
        messages: groupMessages,
        members: groupMembers,
        loading: groupLoading,
        sending: groupSending,
        createGroup,
        selectGroup,
        unselectGroup,
        sendMessage: sendGroupMessage,
        dissolveGroup,
    } = useGroupChat();

    // 私聊管理
    const [privateChatUserId, setPrivateChatUserId] = useState<number | null>(null);
    const {
        messages: privateMessages,
        loading: privateLoading,
        sending: privateSending,
        sendMessage: sendPrivateMessage,
    } = usePrivateChat(privateChatUserId);

    // 连接状态提示
    useEffect(() => {
        if (status === 'connected') {
            antMessage.success('聊天服务已连接');
        } else if (status === 'disconnected') {
            antMessage.warning('聊天服务已断开');
        } else if (status === 'error') {
            antMessage.error('聊天服务连接失败');
        }
    }, [status]);

    // 选择会话
    const handleSelectConversation = (conversation: Conversation) => {
        // 如果选择的是当前会话，直接返回
        if (selectedConversation?.id === conversation.id) return;

        // 取消之前的订阅
        if (selectedConversation) {
            if (selectedConversation.type === 'group') {
                unselectGroup();
            }
        }

        setSelectedConversation(conversation);

        if (conversation.type === 'private') {
            // 私聊
            const friend = conversation.data as Friend;
            setPrivateChatUserId(friend.userId);
            clearFriendUnread(friend.userId);
        } else {
            // 群聊
            const group = conversation.data as GroupChat;
            setPrivateChatUserId(null);
            selectGroup(group);
        }
    };

    // 发送消息
    const handleSendMessage = async (content: string) => {
        if (!selectedConversation || !user) return;

        if (selectedConversation.type === 'private') {
            const friend = selectedConversation.data as Friend;
            await sendPrivateMessage(content);
            updateFriendMessage(friend.userId, content, false);
        } else {
            await sendGroupMessage(content);
        }
    };

    // 创建群聊
    const handleCreateGroup = async (title: string) => {
        const newGroup = await createGroup(title);
        if (newGroup) {
            setShowCreateGroupModal(false);
            antMessage.success(`群聊 "${title}" 创建成功`);
        }
    };

    // 解散群聊
    const handleDissolveGroup = async (conversationId: number) => {
        await dissolveGroup(conversationId);
        setShowGroupSettingsModal(false);
    };

    // 主题配置
    const darkTheme = {
        algorithm: theme.darkAlgorithm,
        token: {
            colorPrimary: '#667eea',
            colorBgContainer: '#1a1a1a',
            colorBgElevated: '#262626',
            colorBgLayout: '#0d0d0d',
        },
    };

    // 获取当前消息列表
    const currentMessages = selectedConversation?.type === 'group'
        ? groupMessages
        : privateMessages;

    // 获取加载状态
    const isLoading = selectedConversation?.type === 'group'
        ? groupLoading
        : privateLoading;

    // 获取发送状态
    const isSending = selectedConversation?.type === 'group'
        ? groupSending
        : privateSending;

    if (!user) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                请先登录
            </div>
        );
    }

    return (
        <ConfigProvider theme={darkMode ? darkTheme : undefined}>
            <div style={{
                height: '100vh',
                display: 'flex',
                background: darkMode ? '#0d0d0d' : '#f5f5f5'
            }}>
                {/* 最左侧 - 服务器列表 */}
                <ServerList
                    darkMode={darkMode}
                    onCreateGroup={() => setShowCreateGroupModal(true)}
                />

                {/* 中间 - 会话列表 */}
                <ChannelList
                    friends={friends}
                    groups={groups}
                    selectedConversation={selectedConversation}
                    onSelectConversation={handleSelectConversation}
                    onCreateGroup={() => setShowCreateGroupModal(true)}
                    currentUserId={user.userId}
                    darkMode={darkMode}
                />

                {/* 右侧 - 聊天窗口 */}
                <ChatWindow
                    conversation={selectedConversation}
                    messages={currentMessages}
                    currentUserId={user.userId}
                    loading={isLoading}
                    sending={isSending}
                    members={selectedConversation?.type === 'group' ? groupMembers : []}
                    onSendMessage={handleSendMessage}
                    onOpenSettings={() => setShowGroupSettingsModal(true)}
                    onAddMember={() => antMessage.info('添加成员功能开发中')}
                    darkMode={darkMode}
                />

                {/* 创建群聊弹窗 */}
                <CreateGroupModal
                    open={showCreateGroupModal}
                    loading={groupLoading}
                    onCancel={() => setShowCreateGroupModal(false)}
                    onConfirm={handleCreateGroup}
                />

                {/* 群聊设置弹窗 */}
                <GroupSettingsModal
                    open={showGroupSettingsModal}
                    group={currentGroup}
                    members={groupMembers}
                    currentUserId={user.userId}
                    onClose={() => setShowGroupSettingsModal(false)}
                    onDissolveGroup={handleDissolveGroup}
                />
            </div>
        </ConfigProvider>
    );
}