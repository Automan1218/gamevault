// src/components/chat/ChatWindow.tsx
import React, { useEffect, useRef } from 'react';
import { Typography, Space, Button, Tag, Empty, Spin } from 'antd';
import {
    TeamOutlined,
    SettingOutlined,
    UserAddOutlined,
    BellOutlined,
} from '@ant-design/icons';
import { ChatMessage, Conversation, GroupMember } from '@/types/chat';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import type { FileUploadResponse } from '@/lib/api/file';

const { Title } = Typography;

interface ChatWindowProps {
    conversation: Conversation | null;
    messages: ChatMessage[];
    currentUserId: number;
    loading?: boolean;
    sending?: boolean;
    members?: GroupMember[];
    onSendMessage: (content: string, fileInfo?: FileUploadResponse) => void;
    onOpenSettings?: () => void;
    onAddMember?: () => void;
    darkMode?: boolean;
}

/**
 * 聊天窗口组件
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({
                                                          conversation,
                                                          messages,
                                                          currentUserId,
                                                          loading = false,
                                                          sending = false,
                                                          members = [],
                                                          onSendMessage,
                                                          onOpenSettings,
                                                          onAddMember,
                                                          darkMode = true,
                                                      }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 未选择会话
    if (!conversation) {
        return (
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: darkMode ? 'rgba(15, 23, 42, 0.3)' : '#fff',
                    backdropFilter: darkMode ? 'blur(10px)' : 'none',
                }}
            >
                <Empty
                    description="选择一个会话开始聊天"
                    style={{
                        color: darkMode ? '#9ca3af' : undefined,
                    }}
                />
            </div>
        );
    }

    const isGroup = conversation.type === 'group';

    // 获取消息发送者信息
    const getSenderInfo = (message: ChatMessage) => {
        if (message.senderId === currentUserId) {
            return { name: '我', avatar: undefined };
        }

        if (isGroup && members.length > 0) {
            const member = members.find((m) => m.userId === message.senderId);
            return {
                name: member?.nickname || member?.username || '未知用户',
                avatar: undefined,
            };
        }

        return {
            name: conversation.name,
            avatar: conversation.avatar,
        };
    };

    // 获取 bizId
    const getBizId = () => {
        if (conversation.type === 'group') {
            return String(conversation.data.id);
        } else {
            return String((conversation.data as any).userId);
        }
    };

    return (
        <div
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: darkMode ? 'rgba(15, 23, 42, 0.3)' : '#fff',
                backdropFilter: darkMode ? 'blur(10px)' : 'none',
            }}
        >
            {/* 标题栏 */}
            <div
                style={{
                    height: 60,
                    padding: '0 24px',
                    borderBottom: `1px solid ${
                        darkMode ? 'rgba(99, 102, 241, 0.3)' : '#f0f0f0'
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: darkMode ? 'rgba(15, 23, 42, 0.5)' : 'transparent',
                }}
            >
                <Space>
                    <Title level={4} style={{ margin: 0 }}>
                        {conversation.name}
                    </Title>
                    {isGroup && members.length > 0 && (
                        <Tag color="blue">
                            <TeamOutlined /> {members.length} 成员
                        </Tag>
                    )}
                </Space>

                <Space>
                    <Button
                        icon={<BellOutlined />}
                        type="text"
                        title="通知设置（暂未实现）"
                    />
                    {isGroup && (
                        <>
                            <Button
                                icon={<UserAddOutlined />}
                                type="text"
                                onClick={onAddMember}
                                title="添加成员"
                            />
                            <Button
                                icon={<SettingOutlined />}
                                type="text"
                                onClick={onOpenSettings}
                                title="群聊设置"
                            />
                        </>
                    )}
                </Space>
            </div>

            {/* 消息列表 */}
            <div
                style={{
                    flex: 1,
                    padding: '24px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin tip="加载消息中..." />
                    </div>
                ) : messages.length > 0 ? (
                    <>
                        {messages.map((message) => {
                            const senderInfo = getSenderInfo(message);
                            return (
                                <MessageItem
                                    key={message.id}
                                    message={message}
                                    isCurrentUser={message.senderId === currentUserId}
                                    senderName={senderInfo.name}
                                    senderAvatar={senderInfo.avatar}
                                    darkMode={darkMode}
                                />
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                ) : (
                    <Empty
                        description="暂无消息，发送第一条消息开始聊天吧"
                        style={{ margin: 'auto' }}
                    />
                )}
            </div>

            {/* 输入框 */}
            <MessageInput
                onSend={onSendMessage}
                loading={sending}
                placeholder={`发送消息到 ${conversation.name}`}
                bizType={conversation.type === 'group' ? 'conversation' : 'message'}
                bizId={getBizId()}
            />
        </div>
    );
};