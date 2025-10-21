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

    // 获取文件图标
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

    // 渲染文件附件
    const renderAttachment = () => {
        if (!message.attachment) return null;

        const { fileType, fileName, fileSize, accessUrl, thumbnailUrl } =
            message.attachment;

        // 图片消息
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

        // 视频消息
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

        // 音频消息
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

        // 其他文件（文档等）
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
                        下载
                    </Button>
                </Space>
            </div>
        );
    };

    // 判断是否有文本内容
    const hasTextContent = () => {
        return message.content &&
            message.content.trim() &&
            !message.content.startsWith('[文件]');
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
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                    maxWidth: '60%',
                }}
            >
                {/* 发送者名称 */}
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

                {/* 消息气泡 */}
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
                    {/* 文本内容（如果有且不是默认的[文件]文本） */}
                    {hasTextContent() && <div>{message.content}</div>}

                    {/* 文件附件 */}
                    {renderAttachment()}
                </div>

                {/* 时间 */}
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