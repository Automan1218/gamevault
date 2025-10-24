// src/components/chat/MessageInput.tsx
import React, { useState, KeyboardEvent, useRef } from 'react';
import { Input, Button, Space, message } from 'antd';
import { SendOutlined, SmileOutlined } from '@ant-design/icons';
import { FileUploadArea } from './FileUploadArea';
import type { FileUploadResponse } from '@/lib/api/file';

const { TextArea } = Input;

interface MessageInputProps {
    onSend: (content: string, fileInfo?: FileUploadResponse) => void;
    loading?: boolean;
    placeholder?: string;
    bizType?: string;
    bizId?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
                                                              onSend,
                                                              loading = false,
                                                              placeholder = 'Type a message...',
                                                              bizType,
                                                              bizId,
                                                          }) => {
    const [content, setContent] = useState('');
    const textAreaRef = useRef<any>(null);

    const handleSend = (fileInfo?: FileUploadResponse) => {
        console.log('📤 handleSend called:', {
            hasFileInfo: !!fileInfo,
            fileInfo: fileInfo,
            content: content
        });

        if (fileInfo) {
            console.log('✅ File detected, calling onSend with fileInfo');
            console.log('👉 Calling onSend(content, fileInfo)');
            console.log('   content:', content.trim() || `[File] ${fileInfo.fileName}`);
            console.log('   fileInfo:', fileInfo);

            onSend(content.trim() || `[File] ${fileInfo.fileName}`, fileInfo);
            setContent('');
            return;
        }

        if (!content.trim() || loading) return;
        console.log('📝 Sending plain text message');
        onSend(content.trim());
        setContent('');
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Ctrl/Cmd + Enter to send
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSend();
        }
        // Enter to send directly (optional, uncomment to enable)
        // if (e.key === 'Enter' && !e.shiftKey) {
        //     e.preventDefault();
        //     handleSend();
        // }
    };

    // Handle paste image
    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    message.info('Image detected, preparing to upload...');
                    // This will be automatically handled by FileUploadArea
                }
            }
        }
    };

    return (
        <div
            style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-end',
                background: 'rgba(15, 23, 42, 0.5)',
                position: 'relative',
            }}
        >
            {/* Left toolbar */}
            <Space>
                <FileUploadArea
                    bizType={bizType}
                    bizId={bizId}
                    onUploadSuccess={(fileInfo) => handleSend(fileInfo)}
                    onUploadError={(error) => {
                        console.error('Upload failed:', error);
                    }}
                />
                {/* Emoji button (placeholder, can be implemented later) */}
                <Button
                    icon={<SmileOutlined />}
                    type="text"
                    title="Emoji (not implemented yet)"
                    disabled
                />
            </Space>

            {/* Input box */}
            <TextArea
                ref={textAreaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyPress}
                onPaste={handlePaste}
                placeholder={placeholder}
                autoSize={{ minRows: 1, maxRows: 4 }}
                disabled={loading}
                style={{ flex: 1 }}
            />

            {/* Send button */}
            <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => handleSend()}
                loading={loading}
                disabled={!content.trim() || loading}
            >
                Send
            </Button>

            {/* Hint text */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 24,
                    fontSize: 11,
                    color: '#666',
                }}
            >
                Ctrl+Enter to send
            </div>
        </div>
    );
};