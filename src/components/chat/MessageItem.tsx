// src/components/chat/MessageItem.tsx

import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { ChatMessage } from '@/types/chat';
import { formatMessageTime } from '@/lib/utils/timeFormat';

interface MessageItemProps {
    message: ChatMessage;
    isCurrentUser: boolean;
    senderName: string;
    senderAvatar?: string;
    darkMode?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
                                                            message,
                                                            isCurrentUser,
                                                            senderName,
                                                            senderAvatar,
                                                            darkMode = true,
                                                        }) => {
    const displayTime = formatMessageTime(message.createdAt || message.timestamp);

    return (
        <div style={{
            display: 'flex',
            flexDirection: isCurrentUser ? 'row-reverse' : 'row',
            marginBottom: 16,
            gap: 12,
        }}>
            {/* 头像 */}
            <Avatar
                size={36}
                src={senderAvatar}
                style={{
                    background: isCurrentUser ? '#1890ff' : '#87d068',
                    flexShrink: 0,
                }}
            >
                <UserOutlined />
            </Avatar>

            {/* 消息内容 */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                maxWidth: '60%',
            }}>
                {/* 发送者名称 */}
                {!isCurrentUser && (
                    <div style={{
                        fontSize: 12,
                        color: '#999',
                        marginBottom: 4,
                    }}>
                        {senderName}
                    </div>
                )}

                {/* 消息气泡 */}
                <div style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: isCurrentUser
                        ? '#1890ff'
                        : (darkMode ? '#262626' : '#f0f0f0'),
                    color: isCurrentUser ? '#fff' : (darkMode ? '#fff' : '#000'),
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                }}>
                    {message.content}
                </div>

                {/* 时间 */}
                <div style={{
                    fontSize: 11,
                    color: '#999',
                    marginTop: 4,
                }}>
                    {displayTime}
                </div>
            </div>
        </div>
    );
};