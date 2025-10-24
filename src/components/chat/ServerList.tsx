// src/components/chat/ServerList.tsx
import React from 'react';
import {Avatar, Tooltip, Button, Divider, Badge} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface ServerListProps {
    darkMode?: boolean;
    onCreateGroup?: () => void;
    isWebSocketConnected?: boolean;
    unreadCount?: number;
}

/**
 * Leftmost server/group list
 * Temporarily only shows GameVault main server
 */
export const ServerList: React.FC<ServerListProps> = ({
                                                          darkMode = true,
                                                          onCreateGroup,
                                                          isWebSocketConnected = false,
                                                          unreadCount = 0,
                                                      }) => {
    return (
        <div
            style={{
                width: 80,
                background: darkMode ? 'rgba(15, 23, 42, 0.6)' : '#fff',
                backdropFilter: darkMode ? 'blur(10px)' : 'none',
                borderRight: `1px solid ${darkMode ? 'rgba(99, 102, 241, 0.3)' : '#f0f0f0'}`,
                padding: '16px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: darkMode ? '4px 0 16px rgba(0, 0, 0, 0.2)' : 'none',
            }}
        >
            {/* Main server icon */}
            <Tooltip title="GameVault" placement="right">
                <Badge count={unreadCount} offset={[-5, 5]}>
                    <Avatar
                        size={48}
                        style={{
                            marginBottom: 24,
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                            fontSize: 24,
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
                        }}
                    >
                        🎮
                    </Avatar>
                </Badge>
            </Tooltip>

            <Divider style={{ margin: '8px 0' }} />

            {/* Create group button */}
            <Tooltip title="Create Group" placement="right">
                <Button
                    type="dashed"
                    shape="circle"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={onCreateGroup}
                    style={{ marginTop: 8 }}
                />
            </Tooltip>
            <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isWebSocketConnected ? '#52c41a' : '#ff4d4f',
                marginTop: 'auto',
            }}
                 title={isWebSocketConnected ? '🟢' : '🔴'}
            />
        </div>
    );
};