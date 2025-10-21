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
                                                              placeholder = '输入消息...',
                                                              bizType,
                                                              bizId,
                                                          }) => {
    const [content, setContent] = useState('');
    const textAreaRef = useRef<any>(null);

    const handleSend = (fileInfo?: FileUploadResponse) => {
        console.log('📤 handleSend 被调用:', {
            hasFileInfo: !!fileInfo,
            fileInfo: fileInfo,
            content: content
        });

        if (fileInfo) {
            console.log('✅ 检测到文件，调用 onSend with fileInfo');
            console.log('👉 调用 onSend(content, fileInfo)');
            console.log('   content:', content.trim() || `[文件] ${fileInfo.fileName}`);
            console.log('   fileInfo:', fileInfo);

            onSend(content.trim() || `[文件] ${fileInfo.fileName}`, fileInfo);
            setContent('');
            return;
        }

        if (!content.trim() || loading) return;
        console.log('📝 发送纯文本消息');
        onSend(content.trim());
        setContent('');
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Ctrl/Cmd + Enter 发送
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSend();
        }
        // Enter 直接发送（可选，取消注释启用）
        // if (e.key === 'Enter' && !e.shiftKey) {
        //     e.preventDefault();
        //     handleSend();
        // }
    };

    // 处理粘贴图片
    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    message.info('检测到图片，准备上传...');
                    // 这里会通过 FileUploadArea 自动处理
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
            {/* 左侧工具栏 */}
            <Space>
                <FileUploadArea
                    bizType={bizType}
                    bizId={bizId}
                    onUploadSuccess={(fileInfo) => handleSend(fileInfo)}
                    onUploadError={(error) => {
                        console.error('上传失败:', error);
                    }}
                />
                {/* 表情按钮（占位，可以后续实现） */}
                <Button
                    icon={<SmileOutlined />}
                    type="text"
                    title="表情（暂未实现）"
                    disabled
                />
            </Space>

            {/* 输入框 */}
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

            {/* 发送按钮 */}
            <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => handleSend()}
                loading={loading}
                disabled={!content.trim() || loading}
            >
                发送
            </Button>

            {/* 提示文本 */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 24,
                    fontSize: 11,
                    color: '#666',
                }}
            >
                Ctrl+Enter 发送
            </div>
        </div>
    );
};