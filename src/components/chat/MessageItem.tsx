// src/components/chat/MessageItem.tsx
import React from 'react';
import { Avatar, Card, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { ChatMessage } from '@/types/chat';

const { Text } = Typography;

interface MessageItemProps {
    message: ChatMessage;
    isCurrentUser: boolean;
    senderName?: string;
    senderAvatar?: string;
    darkMode?: boolean;
}

/**
 * 消息项组件
 */
export const MessageItem: React.FC<MessageItemProps> = ({
                                                            message,
                                                            isCurrentUser,
                                                            senderName,
                                                            senderAvatar,
                                                            darkMode = true,
                                                        }) => {
    // 格式化时间
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 24) {
            return date.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } else {
            return date.toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                marginBottom: 16,
                alignItems: 'flex-start',
            }}
        >
            {/* 头像 */}
            <Avatar
                src={senderAvatar}
                style={{ flexShrink: 0 }}
                size={40}
            >
                {senderName ? senderName[0] : <UserOutlined />}
            </Avatar>

            {/* 消息内容 */}
            <div
                style={{
                    marginLeft: isCurrentUser ? 0 : 12,
                    marginRight: isCurrentUser ? 12 : 0,
                    maxWidth: '70%',
                }}
            >
                {/* 发送者名称和时间 */}
                <div
                    style={{
                        marginBottom: 4,
                        display: 'flex',
                        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                        alignItems: 'center',
                    }}
                >
                    {senderName && (
                        <Text strong style={{ marginRight: isCurrentUser ? 0 : 8, marginLeft: isCurrentUser ? 8 : 0 }}>
                            {senderName}
                        </Text>
                    )}
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatTime(message.createdAt)}
                    </Text>
                </div>

                {/* 消息气泡 */}
                <Card
                    size="small"
                    style={{
                        background: isCurrentUser
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : darkMode
                                ? '#262626'
                                : '#f0f0f0',
                        border: 'none',
                        borderRadius: isCurrentUser ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    }}
                    bodyStyle={{ padding: '8px 12px' }}
                >
                    <Text
                        style={{
                            color: isCurrentUser ? '#fff' : undefined,
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {message.content}
                    </Text>
                </Card>
            </div>
        </div>
    );
};