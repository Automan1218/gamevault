// src/app/dashboard/chat/page.tsx
'use client';

import React, {useCallback, useState} from 'react';
import { ConfigProvider, theme, App, Layout, message as antMessage } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { useGroupChat } from '@/app/features/chat/hooks/useGroupChat';
import { useFriend } from '@/app/features/friend/hooks/useFriend';
import { useWebSocket } from '@/app/features/chat/hooks/useWebSocket';
import { useGroupMessages } from '@/app/features/chat/hooks/useGroupMessages';
import { usePrivateMessages } from '@/app/features/chat/hooks/usePrivateMessages';
import { useMessageNotifications } from '@/app/features/chat/hooks/useMessageNotifications';
import { ConnectionMonitor } from '@/components/common/ConnectionMonitor';
import { Menubar } from '@/components/layout';
import {
    ServerList,
    ChannelList,
    ChatWindow,
    CreateGroupModal,
    GroupSettingsModal,
} from '@/components/chat';
import '@/components/common/animations.css';

import SearchUserModal from '@/components/friend/SearchUserModal';
import FriendRequestsModal from '@/components/friend/FriendRequestsModal';
import AddMembersModal from '@/components/friend/AddMembersModal';

import { FriendConversation, Conversation, GroupChat } from '@/types/chat';
import { chatApi } from "@/lib/api/chat";
import type { FileUploadResponse } from '@/lib/api/file';

const { Header, Content } = Layout;

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

    // 消息通知 Hook - 添加群聊参数
    const {
        unreadMessages,
        unreadGroupMessages,
        getUnreadCount,
        getGroupUnreadCount,
        getTotalUnreadCount,
        markAsRead,
        markGroupAsRead,
    } = useMessageNotifications(
        user?.userId || 0,
        selectedConversation?.type === 'private'
            ? (selectedConversation.data as FriendConversation).userId
            : null,
        selectedConversation?.type === 'group'
            ? (selectedConversation.data as GroupChat).id
            : null,
        groups
    );

    // 转换好友列表，添加未读信息
    const friendConversations: FriendConversation[] = friendList.map(friend => {
        const unreadInfo = unreadMessages.get(friend.userId);

        return {
            friendId: friend.userId,
            userId: friend.userId,
            username: friend.username,
            email: friend.email,
            remark: friend.remark,
            status: 'offline' as const,
            unread: unreadInfo?.unreadCount || 0,
            lastMessage: unreadInfo?.lastMessage,
            lastMessageTime: unreadInfo?.lastMessageTime,
        };
    });

    const groupConversations: GroupChat[] = groups.map(group => {
        const unreadInfo = unreadGroupMessages.get(group.id);

        return {
            ...group,
            unread: unreadInfo?.unreadCount || group.unread || 0,
            lastMessage: unreadInfo?.lastMessage || group.lastMessage,
            lastMessageTime: unreadInfo?.lastMessageTime || group.lastMessageTime,
        };
    });

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
            ? (selectedConversation.data as FriendConversation).userId
            : null,
        user?.userId || 0
    );

    // 修改发送消息处理
    const handleSendMessage = async (content: string, fileInfo?: FileUploadResponse) => {
        console.log('🔵 ChatPage.handleSendMessage 被调用:', {
            content,
            hasFileInfo: !!fileInfo,
            fileInfo,
            conversationType: selectedConversation?.type
        });

        if (selectedConversation?.type === 'group') {
            console.log('✅ 发送群聊消息，传递 fileInfo:', fileInfo);
            await sendGroupMessage(content, fileInfo);  // ✅ 传递 fileInfo
        } else if (selectedConversation?.type === 'private') {
            console.log('✅ 发送私聊消息，传递 fileInfo:', fileInfo);
            await sendPrivateMessage(content, fileInfo);  // ✅ 传递 fileInfo
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

    // 主题配置 - 与login界面保持一致
    const darkTheme = {
        algorithm: theme.darkAlgorithm,
        token: {
            colorPrimary: '#6366f1',
            colorBgContainer: 'rgba(15, 23, 42, 0.8)',
            colorBgElevated: 'rgba(31, 41, 55, 0.9)',
            colorBorder: 'rgba(75, 85, 99, 0.3)',
            colorText: '#f9fafb',
            colorTextSecondary: '#d1d5db',
            colorBgLayout: '#0f172a',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
    };

    // 选择会话
    const handleSelectConversation = useCallback((conversation: Conversation) => {
        setSelectedConversation(conversation);

        if (conversation.type === 'group') {
            const group = conversation.data as GroupChat;
            selectGroup(group);

            markGroupAsRead(group.id);
        } else {
            unselectGroup();

            // 标记私聊为已读
            const friend = conversation.data as FriendConversation;
            markAsRead(friend.userId);
        }
    }, [selectGroup, unselectGroup, markAsRead, markGroupAsRead]);

    // 添加成员到群聊
    const handleAddMembers = async (conversationId: number, userIds: number[]) => {
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
                <ConnectionMonitor />
                <Layout
                    style={{
                        minHeight: '100vh',
                        background: `
                            radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                            radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
                            radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                            linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%)
                        `,
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* 动态背景装饰 */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            pointerEvents: 'none',
                            zIndex: 0,
                            overflow: 'hidden',
                        }}
                    >
                        {/* 浮动光球 */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '10%',
                                left: '15%',
                                width: 300,
                                height: 300,
                                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
                                borderRadius: '50%',
                                filter: 'blur(40px)',
                                animation: 'float 20s ease-in-out infinite',
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: '60%',
                                right: '10%',
                                width: 350,
                                height: 350,
                                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
                                borderRadius: '50%',
                                filter: 'blur(50px)',
                                animation: 'float 25s ease-in-out infinite reverse',
                            }}
                        />
                    </div>

                    {/* 固定顶部导航栏 */}
                    <Header
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            padding: 0,
                            height: 'auto',
                            lineHeight: 'normal',
                            background: 'rgba(15, 23, 42, 0.8)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            borderBottom: '1px solid rgba(99, 102, 241, 0.3)',
                            boxShadow: '0 4px 24px rgba(99, 102, 241, 0.15), 0 2px 8px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        <Menubar currentPath="/dashboard/chat" />
                    </Header>

                    {/* 聊天内容区域 */}
                    <Content
                        style={{
                            marginTop: 64,
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        <div style={{
                            height: 'calc(100vh - 64px)',
                            display: 'flex',
                        }}>
                    {/* 最左侧 - 服务器列表 */}
                    <ServerList
                        darkMode={darkMode}
                        onCreateGroup={() => setShowCreateGroupModal(true)}
                        isWebSocketConnected={isConnected}
                        unreadCount={getTotalUnreadCount()}
                    />

                    {/* 中间 - 会话列表 */}
                    <ChannelList
                        friends={friendConversations}
                        groups={groupConversations}
                        selectedConversation={selectedConversation}
                        onSelectConversation={handleSelectConversation}
                        onCreateGroup={() => setShowCreateGroupModal(true)}
                        onAddFriend={() => setShowSearchUserModal(true)}
                        onViewFriendRequests={() => setShowFriendRequestsModal(true)}
                        friendRequestCount={receivedRequests.length}
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
                                currentUserId={user.userId}
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
                    </Content>
                </Layout>
            </App>
        </ConfigProvider>
    );
}