// src/app/dashboard/chat/page.tsx
'use client';

import React, { useState } from 'react';
import { ConfigProvider, theme, App, message as antMessage } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { useGroupChat } from '@/app/features/chat/hooks/useGroupChat';
import { useFriend } from '@/app/features/friend/hooks/useFriend';
import { useWebSocket } from '@/app/features/chat/hooks/useWebSocket';
import { useGroupMessages } from '@/app/features/chat/hooks/useGroupMessages';
import { usePrivateMessages } from '@/app/features/chat/hooks/usePrivateMessages';
import {
    ServerList,
    ChannelList,
    ChatWindow,
    CreateGroupModal,
    GroupSettingsModal,
} from '@/components/chat';

import SearchUserModal from '@/components/friend/SearchUserModal';
import FriendRequestsModal from '@/components/friend/FriendRequestsModal';
import AddMembersModal from '@/components/friend/AddMembersModal';

import { FriendConversation, Conversation, GroupChat } from '@/types/chat';
import { chatApi } from "@/lib/api/chat";

export default function ChatPage() {
    const { user } = useAuth();
    const [darkMode, setDarkMode] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);

    const [showSearchUserModal, setShowSearchUserModal] = useState(false);
    const [showFriendRequestsModal, setShowFriendRequestsModal] = useState(false);
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);

    // WebSocket 连接
    const { isConnected } = useWebSocket();

    // 群聊管理
    const {
        groups,
        loading: groupLoading,
        members: groupMembers,
        createGroup,
        dissolveGroup,
        selectGroup,
        unselectGroup,
        loadGroups,
    } = useGroupChat();

    // 好友管理 Hook
    const {
        friends: friendList,
        receivedRequests,
        sentRequests,
        searchUsers,
        sendFriendRequest,
        handleFriendRequest,
        loadSentRequests,
    } = useFriend();

    // 转换好友为会话格式
    const friendConversations: FriendConversation[] = friendList.map(friend => ({
        uid: friend.uid,
        username: friend.username,
        email: friend.email,
        remark: friend.remark,
        status: 'offline' as const,
        unread: 0,
        lastMessage: undefined,
        lastMessageTime: undefined,
    }));

    // 添加消息管理
    const {
        messages: groupMessages,
        loading: groupMessagesLoading,
        sending: groupSending,
        sendMessage: sendGroupMessage,
    } = useGroupMessages(
        selectedConversation?.type === 'group'
            ? (selectedConversation.data as GroupChat).id
            : null
    );

    // 私聊信息管理
    const {
        messages: privateMessages,
        loading: privateMessagesLoading,
        sending: privateSending,
        sendMessage: sendPrivateMessage,
    } = usePrivateMessages(
        selectedConversation?.type === 'private'
            ? (selectedConversation.data as FriendConversation).uid
            : null,
        user?.uid || 0
    );

    // 修改发送消息处理
    const handleSendMessage = async (content: string) => {
        if (selectedConversation?.type === 'group') {
            await sendGroupMessage(content);
        } else if (selectedConversation?.type === 'private') {
            await sendPrivateMessage(content);
        }
    };

    // 创建群聊
    const handleCreateGroup = async (title: string) => {
        try {
            await createGroup(title);
            setShowCreateGroupModal(false);
            antMessage.success(`群聊 "${title}" 创建成功`);
        } catch (error) {
            console.error('创建群聊失败:', error);
            antMessage.error(error instanceof Error ? error.message : '创建群聊失败');
        }
    };

     // 解散群聊
    const handleDissolveGroup = async (conversationId: number) => {
        try {
            await dissolveGroup(conversationId);
            antMessage.success('群聊已解散');
            setShowGroupSettingsModal(false);
            setSelectedConversation(null);
        } catch (error) {
            console.error('解散群聊失败:', error);
            antMessage.error(error instanceof Error ? error.message : '解散群聊失败');
        }
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

    // 选择会话
    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);

        if (conversation.type === 'group') {
            const group = conversation.data as GroupChat;
            selectGroup(group);
        } else {
            unselectGroup();
        }
    };

    // 添加成员到群聊
    const handleAddMembers = async (conversationId: string, userIds: number[]) => {
        await chatApi.addMembersToGroup(conversationId, userIds);
    };

    // 添加成员成功后的回调
    const handleAddMembersSuccess = async () => {
        // 重新加载群成员
        if (selectedConversation?.type === 'group') {
            const group = selectedConversation.data as GroupChat;
            await selectGroup(group);  // 重新加载成员列表
        }
    };


    const currentMessages = selectedConversation?.type === 'group'
        ? groupMessages
        : privateMessages;

    const isLoading = groupLoading || groupMessagesLoading || privateMessagesLoading;
    const isSending = groupSending || privateSending;

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
            <App>
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    background: darkMode ? '#0d0d0d' : '#f5f5f5'
                }}>
                    {/* 最左侧 - 服务器列表 */}
                    <ServerList
                        darkMode={darkMode}
                        onCreateGroup={() => setShowCreateGroupModal(true)}
                        isWebSocketConnected={isConnected}
                    />

                    {/* 中间 - 会话列表 */}
                    <ChannelList
                        friends={friendConversations}
                        groups={groups}
                        selectedConversation={selectedConversation}
                        onSelectConversation={handleSelectConversation}
                        onCreateGroup={() => setShowCreateGroupModal(true)}
                        onAddFriend={() => setShowSearchUserModal(true)}
                        onViewFriendRequests={() => setShowFriendRequestsModal(true)}
                        friendRequestCount={receivedRequests.length}
                        currentUserId={user.uid}
                        darkMode={darkMode}
                    />

                    {/* 右侧 - 聊天窗口 */}
                    <ChatWindow
                        conversation={selectedConversation}
                        messages={currentMessages}
                        currentUserId={user.uid}
                        loading={isLoading}
                        sending={isSending}
                        members={selectedConversation?.type === 'group' ? groupMembers : []}
                        onSendMessage={handleSendMessage}
                        onOpenSettings={() => setShowGroupSettingsModal(true)}
                        onAddMember={() => setShowAddMembersModal(true)}
                        darkMode={darkMode}
                    />

                    {/* 创建群聊弹窗 */}
                    <CreateGroupModal
                        open={showCreateGroupModal}
                        loading={groupLoading}
                        onCancel={() => setShowCreateGroupModal(false)}
                        onConfirm={handleCreateGroup}
                    />

                    {selectedConversation?.type === 'group' && (
                        <>
                            <GroupSettingsModal
                                open={showGroupSettingsModal}
                                group={selectedConversation.data as GroupChat}
                                members={groupMembers}
                                currentUserId={user.uid}
                                onClose={() => setShowGroupSettingsModal(false)}
                                onDissolveGroup={handleDissolveGroup}
                            />

                            <AddMembersModal
                                open={showAddMembersModal}
                                conversationId={(selectedConversation.data as GroupChat).id}
                                friends={friendList}
                                onClose={() => setShowAddMembersModal(false)}
                                onSubmit={handleAddMembers}
                                onSuccess={handleAddMembersSuccess}
                            />
                        </>
                    )}

                    {/* 搜索用户弹窗 */}
                    <SearchUserModal
                        open={showSearchUserModal}
                        onClose={() => setShowSearchUserModal(false)}
                        onSearch={searchUsers}
                        onSendRequest={sendFriendRequest}
                    />

                    {/* 好友请求弹窗 */}
                    <FriendRequestsModal
                        open={showFriendRequestsModal}
                        onClose={() => setShowFriendRequestsModal(false)}
                        receivedRequests={receivedRequests}
                        sentRequests={sentRequests}
                        onHandle={handleFriendRequest}
                        onLoadSentRequests={loadSentRequests}
                    />
                </div>
            </App>
        </ConfigProvider>
    );
}