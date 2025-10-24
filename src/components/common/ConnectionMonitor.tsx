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

        // Check every second
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
                message={reconnecting ? "Connection lost, reconnecting..." : "Network connection lost"}
                description={reconnecting ? "Please wait, system is trying to reconnect..." : "Please check your network connection"}
                type="warning"
                showIcon
                banner
                action={
                    !reconnecting && (
                        <Button size="small" onClick={handleReconnect}>
                            Reload
                        </Button>
                    )
                }
            />
        </div>
    );
};