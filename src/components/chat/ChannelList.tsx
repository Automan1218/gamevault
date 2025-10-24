import React, { useState } from 'react';
import { Input, Badge, Avatar, Typography, Divider, Space, Button, Collapse } from 'antd';
import {BellOutlined, SearchOutlined, TeamOutlined, UserAddOutlined, UserOutlined} from '@ant-design/icons';
import { GroupChat, Conversation, FriendConversation } from '@/types/chat';

const { Text } = Typography;
const { Panel } = Collapse;

interface ChannelListProps {
    friends: FriendConversation[];
    groups: GroupChat[];
    selectedConversation: Conversation | null;
    onSelectConversation: (conversation: Conversation) => void;
    onCreateGroup?: () => void;
    onAddFriend?: () => void;
    onViewFriendRequests?: () => void;
    friendRequestCount?: number;
    currentUserId: number;
    darkMode?: boolean;
}

/**
 * Middle conversation list (group chats + friends)
 */
export const ChannelList: React.FC<ChannelListProps> = ({
                                                            friends,
                                                            groups,
                                                            selectedConversation,
                                                            onSelectConversation,
                                                            onCreateGroup,
                                                            onAddFriend,
                                                            onViewFriendRequests,
                                                            friendRequestCount = 0,
                                                            currentUserId,
                                                            darkMode = true,
                                                        }) => {
    const [searchKeyword, setSearchKeyword] = useState('');

    // Convert to unified conversation format
    const groupConversations: Conversation[] = groups.map(group => ({
        id: `group-${group.id}`,
        type: 'group',
        name: group.title,
        unread: group.unread || 0,
        lastMessage: group.lastMessage,
        lastMessageTime: group.lastMessageTime,
        data: group,
    }));

    const friendConversations: Conversation[] = friends.map(friend => ({
        id: `private-${friend.userId}`,
        type: 'private' as const,
        name: friend.remark || friend.username,
        unread: friend.unread || 0,
        lastMessage: friend.lastMessage,
        lastMessageTime: friend.lastMessageTime,
        data: friend,
    }));

    // Search filtering
    const filteredGroups = searchKeyword
        ? groupConversations.filter(c =>
            c.name.toLowerCase().includes(searchKeyword.toLowerCase())
        )
        : groupConversations;

    const filteredFriends = searchKeyword
        ? friendConversations.filter(c =>
            c.name.toLowerCase().includes(searchKeyword.toLowerCase())
        )
        : friendConversations;

    // Render conversation item
    const renderConversationItem = (conversation: Conversation) => {
        const isSelected = selectedConversation?.id === conversation.id;
        const isGroup = conversation.type === 'group';

        return (
            <div
                key={conversation.id}
                style={{
                    padding: '12px',
                    borderRadius: 8,
                    background: isSelected
                        ? darkMode
                            ? 'rgba(99, 102, 241, 0.2)'
                            : '#e6f7ff'
                        : 'transparent',
                    cursor: 'pointer',
                    marginBottom: 4,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: isSelected ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                }}
                onClick={() => onSelectConversation(conversation)}
                onMouseEnter={(e) => {
                    if (!isSelected) {
                        e.currentTarget.style.background = darkMode ? 'rgba(99, 102, 241, 0.08)' : '#f5f5f5';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                    }
                }}
            >
                <Space>
                    {isGroup ? (
                        <Avatar size={40} style={{ background: '#1890ff' }}>
                            <TeamOutlined />
                        </Avatar>
                    ) : (
                        <Badge
                            dot
                            status={
                                (conversation.data as FriendConversation).status === 'online'
                                    ? 'success'
                                    : 'default'
                            }
                        >
                            <Avatar
                                size={40}
                                src={conversation.avatar}
                                style={{ background: '#87d068' }}
                            >
                                <UserOutlined />
                            </Avatar>
                        </Badge>
                    )}

                    {/* Name and last message */}
                    <div style={{ maxWidth: 140 }}>
                        <div
                            style={{
                                fontWeight: (conversation.unread || 0) > 0 ? 600 : 400,
                                marginBottom: 4,
                            }}
                        >
                            {conversation.name}
                        </div>
                        {conversation.lastMessage && (
                            <Text
                                type="secondary"
                                ellipsis
                                style={{ fontSize: 12, maxWidth: 140 }}
                            >
                                {conversation.lastMessage}
                            </Text>
                        )}
                    </div>
                </Space>

                {/* Unread count */}
                {(conversation.unread || 0) > 0 && <Badge count={conversation.unread} />}
            </div>
        );
    };

    return (
        <div
            style={{
                width: 240,
                background: darkMode ? 'rgba(15, 23, 42, 0.5)' : '#fafafa',
                backdropFilter: darkMode ? 'blur(10px)' : 'none',
                borderRight: `1px solid ${darkMode ? 'rgba(99, 102, 241, 0.3)' : '#f0f0f0'}`,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: darkMode ? '4px 0 16px rgba(0, 0, 0, 0.2)' : 'none',
            }}
        >
            {/* Search box */}
            <div style={{ padding: '16px' }}>
                <Input
                    placeholder="Search groups or friends"
                    prefix={<SearchOutlined />}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                />
            </div>

            {/* Conversation list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
                <Collapse
                    defaultActiveKey={['groups', 'friends']}
                    ghost
                    expandIconPosition="end"
                >
                    {/* Group chat list */}
                    <Panel
                        header={
                            <Space>
                                <TeamOutlined />
                                <Text strong>Group Chats</Text>
                                <Text type="secondary">({filteredGroups.length})</Text>
                            </Space>
                        }
                        key="groups"
                    >
                        {filteredGroups.length > 0 ? (
                            filteredGroups.map(renderConversationItem)
                        ) : (
                            <Text type="secondary" style={{ padding: '12px', display: 'block' }}>
                                No group chats yet
                            </Text>
                        )}
                        <Button
                            type="dashed"
                            block
                            icon={<TeamOutlined />}
                            onClick={onCreateGroup}
                            style={{ marginTop: 8 }}
                        >
                            Create Group Chat
                        </Button>
                    </Panel>

                    {/* Friends list */}
                    <Panel
                        header={
                            <Space>
                                <UserOutlined />
                                <Text strong>Friends</Text>
                                <Text type="secondary">({filteredFriends.length})</Text>
                            </Space>
                        }
                        key="friends"
                        extra={
                            <Space size="small" onClick={(e) => e.stopPropagation()}>
                                <Badge count={friendRequestCount} offset={[-5, 5]}>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<BellOutlined />}
                                        onClick={onViewFriendRequests}
                                        title="Friend Requests"
                                    />
                                </Badge>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<UserAddOutlined />}
                                    onClick={onAddFriend}
                                    title="Add Friend"
                                />
                            </Space>
                        }
                    >
                        {filteredFriends.length > 0 ? (
                            filteredFriends.map(renderConversationItem)
                        ) : (
                            <Text type="secondary" style={{ padding: '12px', display: 'block' }}>
                                No friends yet
                            </Text>
                        )}
                    </Panel>
                </Collapse>
            </div>

            <Divider style={{ margin: 0 }} />

            {/* User status */}
            <div
                style={{
                    padding: '12px',
                    borderTop: `1px solid ${darkMode ? '#262626' : '#f0f0f0'}`,
                }}
            >
                <Space>
                    <Badge status="success" dot>
                        <Avatar size={40}>
                            <UserOutlined />
                        </Avatar>
                    </Badge>
                    <div>
                        <div style={{ fontWeight: 500 }}>Current User</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Online
                        </Text>
                    </div>
                </Space>
            </div>
        </div>
    );
};