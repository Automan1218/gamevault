// src/components/chat/ServerList.tsx
import React from 'react';
import { Avatar, Tooltip, Button, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface ServerListProps {
    darkMode?: boolean;
    onCreateGroup?: () => void;
}

/**
 * 最左侧服务器/群组列表
 * 暂时只显示 GameVault 主服务器
 */
export const ServerList: React.FC<ServerListProps> = ({
                                                          darkMode = true,
                                                          onCreateGroup,
                                                      }) => {
    return (
        <div
            style={{
                width: 80,
                background: darkMode ? '#0a0a0a' : '#fff',
                borderRight: `1px solid ${darkMode ? '#262626' : '#f0f0f0'}`,
                padding: '16px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            {/* 主服务器图标 */}
            <Tooltip title="GameVault" placement="right">
                <Avatar
                    size={48}
                    style={{
                        marginBottom: 24,
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: 24,
                    }}
                >
                    🎮
                </Avatar>
            </Tooltip>

            <Divider style={{ margin: '8px 0' }} />

            {/* 创建群组按钮 */}
            <Tooltip title="创建群组" placement="right">
                <Button
                    type="dashed"
                    shape="circle"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={onCreateGroup}
                    style={{ marginTop: 8 }}
                />
            </Tooltip>
        </div>
    );
};