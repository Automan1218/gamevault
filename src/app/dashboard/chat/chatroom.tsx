// src/app/chat/post_page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    ProLayout,
    ProCard,
} from '@ant-design/pro-components';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    ConfigProvider,
    Divider,
    Dropdown,
    Empty,
    Form,
    Input,
    List,
    Menu,
    Modal,
    Popover,
    Row,
    Space,
    Tag,
    theme,
    Tooltip,
    Typography,
    message,
} from 'antd';
import {
    AudioOutlined,
    BellOutlined,
    CloseOutlined,
    DeleteOutlined,
    EllipsisOutlined,
    FileImageOutlined,
    FolderAddOutlined,
    GifOutlined,
    GlobalOutlined,
    LockOutlined,
    LogoutOutlined,
    MoreOutlined,
    NotificationOutlined,
    PaperClipOutlined,
    PlusOutlined,
    PushpinOutlined,
    SearchOutlined,
    SendOutlined,
    SettingOutlined,
    SmileOutlined,
    SoundOutlined,
    TeamOutlined,
    UserAddOutlined,
    UserDeleteOutlined,
    UserOutlined,
    UsergroupAddOutlined,
    VideoCameraOutlined,
    WechatOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface User {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'busy' | 'away';
    statusText?: string;
}

interface Message {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    timestamp: Date;
    type: 'text' | 'image' | 'file';
    isSystem?: boolean;
}

interface Channel {
    id: string;
    name: string;
    type: 'group' | 'direct';
    icon?: string;
    members?: number;
    unread?: number;
    lastMessage?: string;
    isPinned?: boolean;
}

interface Group {
    id: string;
    name: string;
    icon?: string;
    channels: Channel[];
}

export default function ChatRoom() {
    const [darkMode, setDarkMode] = useState(true);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<string>('1');
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showChannelSettings, setShowChannelSettings] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [form] = Form.useForm();

    // 模拟数据
    const currentUser: User = {
        id: '1',
        name: '游戏达人',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
        status: 'online',
        statusText: '正在玩黑神话悟空',
    };

    const [groups, setGroups] = useState<Group[]>([
        {
            id: '1',
            name: 'GameVault社区',
            icon: '🎮',
            channels: [
                { id: '1', name: '公告频道', type: 'group', icon: '📢', members: 1234, isPinned: true },
                { id: '2', name: '综合讨论', type: 'group', icon: '💬', members: 892, unread: 5 },
                { id: '3', name: '游戏攻略', type: 'group', icon: '📚', members: 567 },
                { id: '4', name: '组队开黑', type: 'group', icon: '🎯', members: 234, unread: 12 },
            ],
        },
        {
            id: '2',
            name: '私人消息',
            icon: '💌',
            channels: [
                { id: '5', name: '系统助手', type: 'direct', unread: 1, lastMessage: '欢迎使用聊天功能' },
                { id: '6', name: '小明', type: 'direct', lastMessage: '一起玩吗？' },
                { id: '7', name: '游戏好友', type: 'direct', lastMessage: '明天有空吗' },
            ],
        },
    ]);

    const onlineUsers: User[] = [
        { id: '2', name: '小明', status: 'online', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
        { id: '3', name: '游戏高手', status: 'busy', statusText: '请勿打扰', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
        { id: '4', name: '萌新玩家', status: 'away', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
        { id: '5', name: '老司机', status: 'online', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' },
    ];

    // 模拟消息
    useEffect(() => {
        if (selectedChannel) {
            setMessages([
                {
                    id: '1',
                    userId: '2',
                    userName: '小明',
                    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
                    content: '大家好，有人一起玩黑神话悟空吗？',
                    timestamp: new Date(Date.now() - 3600000),
                    type: 'text',
                },
                {
                    id: '2',
                    userId: '3',
                    userName: '游戏高手',
                    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
                    content: '我已经通关了，可以带你',
                    timestamp: new Date(Date.now() - 1800000),
                    type: 'text',
                },
                {
                    id: '3',
                    userId: 'system',
                    userName: '系统',
                    content: '游戏高手 加入了频道',
                    timestamp: new Date(Date.now() - 900000),
                    type: 'text',
                    isSystem: true,
                },
            ]);
        }
    }, [selectedChannel]);

    // 自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 发送消息
    const sendMessage = () => {
        if (!messageInput.trim() || !selectedChannel) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            content: messageInput,
            timestamp: new Date(),
            type: 'text',
        };

        setMessages([...messages, newMessage]);
        setMessageInput('');
    };

    // 创建群组
    const handleCreateGroup = (values: any) => {
        const newGroup: Group = {
            id: Date.now().toString(),
            name: values.name,
            icon: values.icon || '🎮',
            channels: [
                {
                    id: Date.now().toString(),
                    name: '综合频道',
                    type: 'group',
                    icon: '💬',
                    members: 1,
                },
            ],
        };
        setGroups([...groups, newGroup]);
        setShowCreateGroup(false);
        message.success('群组创建成功');
    };

    // 退出群组
    const handleLeaveGroup = () => {
        Modal.confirm({
            title: '确认退出群组',
            content: `确定要退出 ${selectedChannel?.name} 吗？`,
            onOk: () => {
                message.success('已退出群组');
                setSelectedChannel(null);
            },
        });
    };

    // 渲染消息
    const renderMessage = (msg: Message) => {
        if (msg.isSystem) {
            return (
                <div key={msg.id} style={{ textAlign: 'center', margin: '16px 0' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {msg.content}
                    </Text>
                </div>
            );
        }

        const isCurrentUser = msg.userId === currentUser.id;

        return (
            <div
                key={msg.id}
                style={{
                    display: 'flex',
                    flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                    marginBottom: 16,
                    alignItems: 'flex-start',
                }}
            >
                <Avatar src={msg.userAvatar} style={{ flexShrink: 0 }}>
                    {msg.userName[0]}
                </Avatar>
                <div
                    style={{
                        marginLeft: isCurrentUser ? 0 : 12,
                        marginRight: isCurrentUser ? 12 : 0,
                        maxWidth: '70%',
                    }}
                >
                    <div style={{ marginBottom: 4 }}>
                        <Text strong style={{ marginRight: 8 }}>
                            {msg.userName}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </Text>
                    </div>
                    <Card
                        size="small"
                        style={{
                            background: isCurrentUser
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : darkMode ? '#262626' : '#f0f0f0',
                            border: 'none',
                        }}
                    >
                        <Text style={{ color: isCurrentUser ? '#fff' : undefined }}>
                            {msg.content}
                        </Text>
                    </Card>
                </div>
            </div>
        );
    };

    const darkTheme = {
        algorithm: theme.darkAlgorithm,
        token: {
            colorPrimary: '#667eea',
            colorBgContainer: '#1a1a1a',
            colorBgElevated: '#262626',
            colorBgLayout: '#0d0d0d',
        },
    };

    return (
        <ConfigProvider theme={darkMode ? darkTheme : undefined}>
            <div style={{ height: '100vh', display: 'flex', background: darkMode ? '#0d0d0d' : '#f5f5f5' }}>
                {/* 左侧边栏 - 群组列表 */}
                <div style={{
                    width: 80,
                    background: darkMode ? '#0a0a0a' : '#fff',
                    borderRight: `1px solid ${darkMode ? '#262626' : '#f0f0f0'}`,
                    padding: '16px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Avatar size={48} style={{ marginBottom: 24, cursor: 'pointer' }}>
                        🎮
                    </Avatar>
                    <Divider style={{ margin: '8px 0' }} />

                    {groups.map(group => (
                        <Tooltip key={group.id} title={group.name} placement="right">
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: selectedGroup === group.id ? 16 : 24,
                                    background: selectedGroup === group.id
                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        : darkMode ? '#262626' : '#f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    marginBottom: 12,
                                    fontSize: 24,
                                    transition: 'all 0.3s',
                                }}
                                onClick={() => setSelectedGroup(group.id)}
                            >
                                {group.icon}
                            </div>
                        </Tooltip>
                    ))}

                    <Tooltip title="创建群组" placement="right">
                        <Button
                            type="dashed"
                            shape="circle"
                            icon={<PlusOutlined />}
                            size="large"
                            onClick={() => setShowCreateGroup(true)}
                        />
                    </Tooltip>
                </div>

                {/* 频道列表 */}
                <div style={{
                    width: 240,
                    background: darkMode ? '#141414' : '#fafafa',
                    borderRight: `1px solid ${darkMode ? '#262626' : '#f0f0f0'}`,
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    {/* 群组标题 */}
                    <div style={{
                        padding: '16px',
                        borderBottom: `1px solid ${darkMode ? '#262626' : '#f0f0f0'}`,
                    }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Title level={5} style={{ margin: 0 }}>
                                {groups.find(g => g.id === selectedGroup)?.name}
                            </Title>
                            <Dropdown
                                menu={{
                                    items: [
                                        { key: 'invite', label: '邀请成员', icon: <UserAddOutlined /> },
                                        { key: 'settings', label: '群组设置', icon: <SettingOutlined /> },
                                        { type: 'divider' },
                                        { key: 'leave', label: '退出群组', icon: <LogoutOutlined />, danger: true },
                                    ],
                                }}
                            >
                                <Button type="text" icon={<MoreOutlined />} />
                            </Dropdown>
                        </Space>
                    </div>

                    {/* 频道列表 */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                        {groups.find(g => g.id === selectedGroup)?.channels.map(channel => (
                            <div
                                key={channel.id}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    background: selectedChannel?.id === channel.id
                                        ? darkMode ? '#262626' : '#e6f7ff'
                                        : 'transparent',
                                    cursor: 'pointer',
                                    marginBottom: 4,
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                                onClick={() => setSelectedChannel(channel)}
                            >
                                <Space>
                                    {channel.isPinned && <PushpinOutlined style={{ color: '#faad14' }} />}
                                    <span style={{ fontSize: 16, marginRight: 8 }}>{channel.icon || '#'}</span>
                                    <Text>{channel.name}</Text>
                                </Space>
                                {channel.unread && (
                                    <Badge count={channel.unread} />
                                )}
                            </div>
                        ))}

                        <Button
                            type="dashed"
                            block
                            icon={<PlusOutlined />}
                            style={{ marginTop: 8 }}
                        >
                            添加频道
                        </Button>
                    </div>

                    {/* 用户状态 */}
                    <div style={{
                        padding: '12px',
                        borderTop: `1px solid ${darkMode ? '#262626' : '#f0f0f0'}`,
                    }}>
                        <Space>
                            <Badge status="success" dot>
                                <Avatar src={currentUser.avatar}>
                                    {currentUser.name[0]}
                                </Avatar>
                            </Badge>
                            <div>
                                <div>{currentUser.name}</div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {currentUser.statusText}
                                </Text>
                            </div>
                        </Space>
                    </div>
                </div>

                {/* 聊天区域 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {selectedChannel ? (
                        <>
                            {/* 频道标题栏 */}
                            <div style={{
                                height: 60,
                                padding: '0 24px',
                                borderBottom: `1px solid ${darkMode ? '#262626' : '#f0f0f0'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <Space>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {selectedChannel.icon} {selectedChannel.name}
                                    </Title>
                                    {selectedChannel.type === 'group' && (
                                        <Tag color="blue">
                                            <TeamOutlined /> {selectedChannel.members}
                                        </Tag>
                                    )}
                                </Space>
                                <Space>
                                    <Button icon={<BellOutlined />} type="text" />
                                    <Button icon={<PushpinOutlined />} type="text" />
                                    <Button icon={<SearchOutlined />} type="text" />
                                    <Button
                                        icon={<UserAddOutlined />}
                                        type="text"
                                        onClick={() => setShowInviteModal(true)}
                                    />
                                </Space>
                            </div>

                            {/* 消息区域 */}
                            <div style={{
                                flex: 1,
                                padding: '24px',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                                {messages.length > 0 ? (
                                    messages.map(renderMessage)
                                ) : (
                                    <Empty
                                        description="暂无消息"
                                        style={{ margin: 'auto' }}
                                    />
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* 输入区域 */}
                            <div style={{
                                padding: '16px 24px',
                                borderTop: `1px solid ${darkMode ? '#262626' : '#f0f0f0'}`,
                            }}>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Button icon={<PlusOutlined />} />
                                    <Input
                                        placeholder="输入消息..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onPressEnter={sendMessage}
                                        style={{ flex: 1 }}
                                        suffix={
                                            <Space>
                                                <SmileOutlined style={{ cursor: 'pointer' }} />
                                                <GifOutlined style={{ cursor: 'pointer' }} />
                                                <PaperClipOutlined style={{ cursor: 'pointer' }} />
                                            </Space>
                                        }
                                    />
                                    <Button
                                        type="primary"
                                        icon={<SendOutlined />}
                                        onClick={sendMessage}
                                    >
                                        发送
                                    </Button>
                                </Space.Compact>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Empty description="选择一个频道开始聊天" />
                        </div>
                    )}
                </div>

                {/* 右侧边栏 - 在线用户 */}
                {selectedChannel && selectedChannel.type === 'group' && (
                    <div style={{
                        width: 240,
                        background: darkMode ? '#141414' : '#fafafa',
                        borderLeft: `1px solid ${darkMode ? '#262626' : '#f0f0f0'}`,
                        padding: '16px',
                    }}>
                        <Title level={5}>在线成员</Title>
                        <List
                            dataSource={onlineUsers}
                            renderItem={(user) => (
                                <List.Item style={{ padding: '8px 0' }}>
                                    <List.Item.Meta
                                        avatar={
                                            <Badge
                                                dot
                                                status={
                                                    user.status === 'online' ? 'success' :
                                                        user.status === 'busy' ? 'error' :
                                                            user.status === 'away' ? 'warning' : 'default'
                                                }
                                            >
                                                <Avatar src={user.avatar}>{user.name[0]}</Avatar>
                                            </Badge>
                                        }
                                        title={user.name}
                                        description={user.statusText}
                                    />
                                    <Dropdown
                                        menu={{
                                            items: [
                                                { key: 'chat', label: '发送消息', icon: <MessageOutlined /> },
                                                { key: 'profile', label: '查看资料', icon: <UserOutlined /> },
                                                { type: 'divider' },
                                                { key: 'remove', label: '移出群组', icon: <UserDeleteOutlined />, danger: true },
                                            ],
                                        }}
                                    >
                                        <Button type="text" icon={<EllipsisOutlined />} size="small" />
                                    </Dropdown>
                                </List.Item>
                            )}
                        />
                    </div>
                )}

                {/* 创建群组弹窗 */}
                <Modal
                    title="创建群组"
                    open={showCreateGroup}
                    onCancel={() => setShowCreateGroup(false)}
                    onOk={() => form.submit()}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleCreateGroup}
                    >
                        <Form.Item
                            name="name"
                            label="群组名称"
                            rules={[{ required: true, message: '请输入群组名称' }]}
                        >
                            <Input placeholder="输入群组名称" />
                        </Form.Item>
                        <Form.Item
                            name="icon"
                            label="群组图标"
                        >
                            <Input placeholder="输入emoji图标，如 🎮" />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label="群组描述"
                        >
                            <TextArea rows={3} placeholder="输入群组描述" />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* 邀请成员弹窗 */}
                <Modal
                    title="邀请成员"
                    open={showInviteModal}
                    onCancel={() => setShowInviteModal(false)}
                    footer={[
                        <Button key="cancel" onClick={() => setShowInviteModal(false)}>
                            取消
                        </Button>,
                        <Button key="invite" type="primary" icon={<UserAddOutlined />}>
                            发送邀请
                        </Button>,
                    ]}
                >
                    <Input.Search
                        placeholder="搜索用户名或ID"
                        style={{ marginBottom: 16 }}
                    />
                    <List
                        dataSource={onlineUsers.filter(u => u.id !== currentUser.id)}
                        renderItem={(user) => (
                            <List.Item
                                actions={[
                                    <Button type="primary" size="small">
                                        邀请
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar src={user.avatar}>{user.name[0]}</Avatar>}
                                    title={user.name}
                                    description={`ID: ${user.id}`}
                                />
                            </List.Item>
                        )}
                    />
                </Modal>
            </div>
        </ConfigProvider>
    );
}