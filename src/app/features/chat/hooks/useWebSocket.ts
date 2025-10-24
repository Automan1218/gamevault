// src/app/features/chat/hooks/useWebSocket.ts

import { useEffect, useState, useCallback } from 'react';
import { chatWebSocket } from '@/lib/websocket/chatWebSocket';
import { message } from 'antd';
export const dynamic = 'force-dynamic';
export function useWebSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);

    /**
     * 连接 WebSocket
     */
    const connect = useCallback(async () => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            console.warn('未找到 token，无法连接 WebSocket');
            return;
        }

        if (chatWebSocket.isConnected()) {
            console.log('WebSocket 已连接');
            setIsConnected(true);
            return;
        }

        setConnecting(true);
        try {
            await chatWebSocket.connect(token);
            setIsConnected(true);
            message.success('聊天服务已连接');
        } catch (error) {
            console.error('WebSocket 连接失败:', error);
            message.error('聊天服务连接失败');
            setIsConnected(false);
        } finally {
            setConnecting(false);
        }
    }, []);

    /**
     * 断开连接
     */
    const disconnect = useCallback(() => {
        chatWebSocket.disconnect();
        setIsConnected(false);
    }, []);

    /**
     * 组件挂载时自动连接
     */
    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        connecting,
        connect,
        disconnect,
    };
}