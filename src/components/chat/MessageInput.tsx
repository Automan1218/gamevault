// src/components/chat/MessageInput.tsx
import React, { useState, KeyboardEvent } from 'react';
import { Input, Button, Space } from 'antd';
import {
    SendOutlined,
    SmileOutlined,
    PaperClipOutlined,
    PlusOutlined,
} from '@ant-design/icons';

interface MessageInputProps {
    onSend: (content: string) => void;
    disabled?: boolean;
    loading?: boolean;
    placeholder?: string;
}

/**
 * 消息输入框组件
 */
export const MessageInput: React.FC<MessageInputProps> = ({
                                                              onSend,
                                                              disabled = false,
                                                              loading = false,
                                                              placeholder = '输入消息...',
                                                          }) => {
    const [message, setMessage] = useState('');

    // 发送消息
    const handleSend = () => {
        if (!message.trim() || disabled || loading) return;

        onSend(message);
        setMessage('');
    };

    // 按下回车发送
    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div
            style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            }}
        >
            <Space.Compact style={{ width: '100%' }} size="large">
                {/* 附件按钮 */}
                <Button
                    icon={<PlusOutlined />}
                    disabled={disabled}
                    title="添加附件（暂未实现）"
                />

                {/* 输入框 */}
                <Input.TextArea
                    placeholder={placeholder}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={disabled}
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    style={{ flex: 1 }}
                    // suffix={
                    //     <Space>
                    //         <SmileOutlined
                    //             style={{ cursor: 'pointer', color: '#8c8c8c' }}
                    //             title="表情（暂未实现）"
                    //         />
                    //         <PaperClipOutlined
                    //             style={{ cursor: 'pointer', color: '#8c8c8c' }}
                    //             title="附件（暂未实现）"
                    //         />
                    //     </Space>
                    // }
                />

                {/* 发送按钮 */}
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    disabled={disabled || !message.trim()}
                    loading={loading}
                >
                    发送
                </Button>
            </Space.Compact>

            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                按 Enter 发送，Shift + Enter 换行
            </div>
        </div>
    );
};