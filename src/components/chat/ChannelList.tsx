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
 * 中间会话列表（群聊 + 好友）
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

    // 转换为统一的会话格式
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
        id: `private-${friend.uid}`,
        type: 'private' as const,
        name: friend.remark || friend.username,
        unread: friend.unread || 0,
        lastMessage: friend.lastMessage,
        lastMessageTime: friend.lastMessageTime,
        data: friend,
    }));

    // 搜索过滤
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

    // 渲染会话项
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
                            ? '#262626'
                            : '#e6f7ff'
                        : 'transparent',
                    cursor: 'pointer',
                    marginBottom: 4,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
                onClick={() => onSelectConversation(conversation)}
                onMouseEnter={(e) => {
                    if (!isSelected) {
                        e.currentTarget.style.background = darkMode ? '#1a1a1a' : '#f5f5f5';
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

                    {/* 名称和最后消息 */}
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

                {/* 未读数 */}
                {(conversation.unread || 0) > 0 && <Badge count={conversation.unread} />}
            </div>
        );
    };

    return (
        <div
            style={{
                width: 240,
                background: darkMode ? '#141414' : '#fafafa',
                borderRight: `1px solid ${darkMode ? '#262626' : '#f0f0f0'}`,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* 搜索框 */}
            <div style={{ padding: '16px' }}>
                <Input
                    placeholder="搜索群聊或好友"
                    prefix={<SearchOutlined />}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                />
            </div>

            {/* 会话列表 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
                <Collapse
                    defaultActiveKey={['groups', 'friends']}
                    ghost
                    expandIconPosition="end"
                >
                    {/* 群聊列表 */}
                    <Panel
                        header={
                            <Space>
                                <TeamOutlined />
                                <Text strong>群聊</Text>
                                <Text type="secondary">({filteredGroups.length})</Text>
                            </Space>
                        }
                        key="groups"
                    >
                        {filteredGroups.length > 0 ? (
                            filteredGroups.map(renderConversationItem)
                        ) : (
                            <Text type="secondary" style={{ padding: '12px', display: 'block' }}>
                                暂无群聊
                            </Text>
                        )}
                        <Button
                            type="dashed"
                            block
                            icon={<TeamOutlined />}
                            onClick={onCreateGroup}
                            style={{ marginTop: 8 }}
                        >
                            创建群聊
                        </Button>
                    </Panel>

                    {/* 好友列表 */}
                    <Panel
                        header={
                            <Space>
                                <UserOutlined />
                                <Text strong>好友</Text>
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
                                        title="好友请求"
                                    />
                                </Badge>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<UserAddOutlined />}
                                    onClick={onAddFriend}
                                    title="添加好友"
                                />
                            </Space>
                        }
                    >
                        {filteredFriends.length > 0 ? (
                            filteredFriends.map(renderConversationItem)
                        ) : (
                            <Text type="secondary" style={{ padding: '12px', display: 'block' }}>
                                暂无好友
                            </Text>
                        )}
                    </Panel>
                </Collapse>
            </div>

            <Divider style={{ margin: 0 }} />

            {/* 用户状态 */}
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
                        <div style={{ fontWeight: 500 }}>当前用户</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            在线
                        </Text>
                    </div>
                </Space>
            </div>
        </div>
    );
};