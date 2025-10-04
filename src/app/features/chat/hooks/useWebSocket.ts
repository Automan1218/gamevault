// src/app/features/chat/hooks/useWebSocket.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { chatWebSocket } from '@/lib/websocket/chatWebSocket';
import { WebSocketStatus } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { message as antMessage } from 'antd';

/**
 * WebSocket 连接管理 Hook
 */
export function useWebSocket() {
    const { user, isAuthenticated } = useAuth();
    const [status, setStatus] = useState<WebSocketStatus>('disconnected');
    const [isConnecting, setIsConnecting] = useState(false);
    const hasConnected = useRef(false);

    // 连接 WebSocket
    const connect = useCallback(async () => {
        if (!isAuthenticated || !user) {
            console.warn('未登录，无法连接 WebSocket');
            return;
        }

        if (isConnecting || chatWebSocket.isConnected()) {
            console.log('WebSocket 正在连接或已连接');
            return;
        }

        setIsConnecting(true);

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Token 不存在');
            }

            await chatWebSocket.connect(token, user.userId);
            hasConnected.current = true;
            antMessage.success('聊天服务已连接');
        } catch (error) {
            console.error('WebSocket 连接失败:', error);
            antMessage.error('聊天服务连接失败');
            hasConnected.current = false;
        } finally {
            setIsConnecting(false);
        }
    }, [isAuthenticated, user, isConnecting]);

    // 断开连接
    const disconnect = useCallback(() => {
        chatWebSocket.disconnect();
        hasConnected.current = false;
    }, []);

    // 重新连接
    const reconnect = useCallback(async () => {
        disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await connect();
    }, [connect, disconnect]);

    // 监听状态变化
    useEffect(() => {
        const unsubscribe = chatWebSocket.onStatusChange((newStatus) => {
            setStatus(newStatus);
        });

        return unsubscribe;
    }, []);

    // 自动连接
    useEffect(() => {
        if (isAuthenticated && user && !hasConnected.current && !isConnecting) {
            connect();
        }
    }, [isAuthenticated, user, connect, isConnecting]);

    // 组件卸载时断开连接
    useEffect(() => {
        return () => {
            if (hasConnected.current) {
                disconnect();
            }
        };
    }, [disconnect]);

    return {
        status,
        isConnected: status === 'connected',
        isConnecting,
        connect,
        disconnect,
        reconnect,
    };
}