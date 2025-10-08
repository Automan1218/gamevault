// src/components/chat/MessageInput.tsx

import React, { useState, KeyboardEvent } from 'react';
import { Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface MessageInputProps {
    onSend: (content: string) => void;
    loading?: boolean;
    placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
                                                              onSend,
                                                              loading = false,
                                                              placeholder = '输入消息...',
                                                          }) => {
    const [content, setContent] = useState('');

    const handleSend = () => {
        if (!content.trim() || loading) return;

        onSend(content.trim());
        setContent('');  // 清空输入框
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Ctrl/Cmd + Enter 发送
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #262626',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
        }}>
            <TextArea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={placeholder}
                autoSize={{ minRows: 1, maxRows: 4 }}
                disabled={loading}
                style={{ flex: 1 }}
            />
            <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={loading}
                disabled={!content.trim() || loading}
            >
                发送
            </Button>
        </div>
    );
};