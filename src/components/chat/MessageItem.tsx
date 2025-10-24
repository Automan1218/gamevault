// src/components/chat/MessageItem.tsx
import React from 'react';
import { Avatar, Image, Button, Space } from 'antd';
import {
    UserOutlined,
    DownloadOutlined,
    FileImageOutlined,
    FileOutlined,
    VideoCameraOutlined,
    AudioOutlined,
} from '@ant-design/icons';
import type { ChatMessage } from '@/types/chat';
import { formatMessageTime } from '@/lib/utils/timeFormat';
import { FileUploader } from '@/lib/utils/fileUploader';

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
    const hasAttachment = !!message.attachment;

    // Get file icon
    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'image':
                return <FileImageOutlined style={{ fontSize: 24 }} />;
            case 'video':
                return <VideoCameraOutlined style={{ fontSize: 24 }} />;
            case 'audio':
                return <AudioOutlined style={{ fontSize: 24 }} />;
            default:
                return <FileOutlined style={{ fontSize: 24 }} />;
        }
    };

    // Render file attachment
    const renderAttachment = () => {
        if (!message.attachment) return null;

        const { fileType, fileName, fileSize, accessUrl, thumbnailUrl } =
            message.attachment;

        // Image message
        if (fileType === 'image') {
            return (
                <div style={{ marginTop: hasTextContent() ? 8 : 0 }}>
                    <Image
                        src={thumbnailUrl || accessUrl}
                        alt={fileName}
                        style={{
                            maxWidth: 300,
                            maxHeight: 300,
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'block',
                        }}
                        preview={{
                            src: accessUrl,
                        }}
                    />
                    <div
                        style={{
                            fontSize: 12,
                            color: isCurrentUser ? 'rgba(255,255,255,0.7)' : '#999',
                            marginTop: 4,
                        }}
                    >
                        {fileName} · {FileUploader.formatFileSize(fileSize)}
                    </div>
                </div>
            );
        }

        // Video message
        if (fileType === 'video') {
            return (
                <div
                    style={{
                        marginTop: hasTextContent() ? 8 : 0,
                        padding: 12,
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: 8,
                    }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                            {getFileIcon(fileType)}
                            <div>
                                <div style={{ fontSize: 14, color: '#fff' }}>{fileName}</div>
                                <div style={{ fontSize: 12, color: '#999' }}>
                                    {FileUploader.formatFileSize(fileSize)}
                                </div>
                            </div>
                        </Space>
                        <video
                            src={accessUrl}
                            controls
                            style={{
                                width: '100%',
                                maxWidth: 400,
                                borderRadius: 4,
                            }}
                        />
                    </Space>
                </div>
            );
        }

        // Audio message
        if (fileType === 'audio') {
            return (
                <div
                    style={{
                        marginTop: hasTextContent() ? 8 : 0,
                        padding: 12,
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: 8,
                    }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                            {getFileIcon(fileType)}
                            <div>
                                <div style={{ fontSize: 14, color: '#fff' }}>{fileName}</div>
                                <div style={{ fontSize: 12, color: '#999' }}>
                                    {FileUploader.formatFileSize(fileSize)}
                                </div>
                            </div>
                        </Space>
                        <audio src={accessUrl} controls style={{ width: '100%' }} />
                    </Space>
                </div>
            );
        }

        // Other files (documents, etc.)
        return (
            <div
                style={{
                    marginTop: hasTextContent() ? 8 : 0,
                    padding: 12,
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 8,
                    minWidth: 200,
                }}
            >
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                        {getFileIcon(fileType)}
                        <div>
                            <div style={{ fontSize: 14, color: '#fff' }}>{fileName}</div>
                            <div style={{ fontSize: 12, color: '#999' }}>
                                {FileUploader.formatFileSize(fileSize)}
                            </div>
                        </div>
                    </Space>
                    <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        href={accessUrl}
                        target="_blank"
                        style={{ color: isCurrentUser ? '#fff' : '#1890ff' }}
                    >
                        Download
                    </Button>
                </Space>
            </div>
        );
    };

    // Check if there is text content
    const hasTextContent = () => {
        return message.content &&
            message.content.trim() &&
            !message.content.startsWith('[File]');
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                marginBottom: 16,
                gap: 12,
            }}
        >
            {/* Avatar */}
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

            {/* Message content */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                    maxWidth: '60%',
                }}
            >
                {/* Sender name */}
                {!isCurrentUser && (
                    <div
                        style={{
                            fontSize: 12,
                            color: '#999',
                            marginBottom: 4,
                        }}
                    >
                        {senderName}
                    </div>
                )}

                {/* Message bubble */}
                <div
                    style={{
                        padding: hasAttachment ? '8px' : '10px 14px',
                        borderRadius: 12,
                        background: isCurrentUser
                            ? '#1890ff'
                            : darkMode
                                ? '#262626'
                                : '#f0f0f0',
                        color: isCurrentUser ? '#fff' : darkMode ? '#fff' : '#000',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    {/* Text content (if any and not default [File] text) */}
                    {hasTextContent() && <div>{message.content}</div>}

                    {/* File attachment */}
                    {renderAttachment()}
                </div>

                {/* Time */}
                <div
                    style={{
                        fontSize: 11,
                        color: '#999',
                        marginTop: 4,
                    }}
                >
                    {displayTime}
                </div>
            </div>
        </div>
    );
};