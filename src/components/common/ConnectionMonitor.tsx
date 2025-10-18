import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'antd';
import { chatWebSocket } from '@/lib/websocket/chatWebSocket';

export const ConnectionMonitor: React.FC = () => {
    const [isOffline, setIsOffline] = useState(false);
    const [reconnecting, setReconnecting] = useState(false);

    useEffect(() => {
        const checkConnection = () => {
            const stats = chatWebSocket.getStats();

            if (!stats.connected && stats.reconnectAttempts > 0) {
                setReconnecting(true);
                setIsOffline(true);
            } else if (!stats.connected) {
                setIsOffline(true);
                setReconnecting(false);
            } else {
                setIsOffline(false);
                setReconnecting(false);
            }
        };

        // 每秒检查一次
        const timer = setInterval(checkConnection, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleReconnect = () => {
        window.location.reload();
    };

    if (!isOffline) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
        }}>
            <Alert
                message={reconnecting ? "连接已断开，正在重连..." : "网络连接已断开"}
                description={reconnecting ? "请稍候，系统正在尝试重新连接..." : "请检查您的网络连接"}
                type="warning"
                showIcon
                banner
                action={
                    !reconnecting && (
                        <Button size="small" onClick={handleReconnect}>
                            重新加载
                        </Button>
                    )
                }
            />
        </div>
    );
};