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
 * Chat window component
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

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // No conversation selected
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
                    description="Select a conversation to start chatting"
                    style={{
                        color: darkMode ? '#9ca3af' : undefined,
                    }}
                />
            </div>
        );
    }

    const isGroup = conversation.type === 'group';

    // Get message sender information
    const getSenderInfo = (message: ChatMessage) => {
        if (message.senderId === currentUserId) {
            return { name: 'Me', avatar: undefined };
        }

        if (isGroup && members.length > 0) {
            const member = members.find((m) => m.userId === message.senderId);
            return {
                name: member?.nickname || member?.username || 'Unknown User',
                avatar: undefined,
            };
        }

        return {
            name: conversation.name,
            avatar: conversation.avatar,
        };
    };

    // Get bizId
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
            {/* Title bar */}
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
                            <TeamOutlined /> {members.length} members
                        </Tag>
                    )}
                </Space>

                <Space>
                    <Button
                        icon={<BellOutlined />}
                        type="text"
                        title="Notification settings (not implemented yet)"
                    />
                    {isGroup && (
                        <>
                            <Button
                                icon={<UserAddOutlined />}
                                type="text"
                                onClick={onAddMember}
                                title="Add member"
                            />
                            <Button
                                icon={<SettingOutlined />}
                                type="text"
                                onClick={onOpenSettings}
                                title="Group settings"
                            />
                        </>
                    )}
                </Space>
            </div>

            {/* Message list */}
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
                        <Spin tip="Loading messages..." />
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
                        description="No messages yet, send the first message to start chatting"
                        style={{ margin: 'auto' }}
                    />
                )}
            </div>

            {/* Input box */}
            <MessageInput
                onSend={onSendMessage}
                loading={sending}
                placeholder={`Send message to ${conversation.name}`}
                bizType={conversation.type === 'group' ? 'conversation' : 'message'}
                bizId={getBizId()}
            />
        </div>
    );
};