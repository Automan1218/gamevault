// src/lib/websocket/chatWebSocket.ts

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type MessageCallback = (message: any) => void;

class ChatWebSocketClient {
    private client: Client | null = null;
    private subscribers: Map<string, MessageCallback> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    /**
     * 连接 WebSocket
     */
    connect(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client = new Client({
                // 使用 SockJS
                webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

                // 连接头部（带 JWT Token）
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },

                // 心跳
                heartbeatIncoming: 10000,
                heartbeatOutgoing: 10000,

                // 重连配置
                reconnectDelay: 5000,

                // 调试
                debug: (str) => {
                    console.log('[STOMP Debug]', str);
                },

                // 连接成功回调
                onConnect: () => {
                    console.log('WebSocket 连接成功');
                    this.reconnectAttempts = 0;
                    resolve();
                },

                // 连接错误回调
                onStompError: (frame) => {
                    console.error('STOMP 错误:', frame);
                    reject(new Error(frame.headers.message || 'WebSocket 连接失败'));
                },

                // WebSocket 错误回调
                onWebSocketError: (error) => {
                    console.error('WebSocket 错误:', error);
                    reject(error);
                },

                // 断开连接回调
                onDisconnect: () => {
                    console.log('🔌 WebSocket 已断开');
                },
            });

            this.client.activate();
        });
    }

    /**
     * 订阅私聊消息
     */
    subscribeToPrivateMessages(userId: string, callback: MessageCallback) {
        if (!this.client || !this.client.connected) {
            return {
                unsubscribe: () => {}
            };
        }

        // 改为订阅 topic
        const destination = `/topic/private/${userId}`;

        console.log('订阅私聊消息:', destination);

        try {
            const subscription = this.client.subscribe(destination, (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    callback(payload);
                } catch (error) {
                    console.error('解析失败:', error);
                }
            });

            return subscription;

        } catch (error) {
            console.error('订阅失败:', error);
            return {
                unsubscribe: () => {}
            };
        }
    }

    /**
     * 订阅群聊消息
     */
    subscribeToConversation(conversationId: string, callback: MessageCallback) {
        if (!this.client || !this.client.connected) {
            console.error('WebSocket 未连接');
            return {
                unsubscribe: () => {
                    console.log('无效的订阅，无需取消');
                }
            };
        }

        const destination = `/topic/chat/${conversationId}`;

        // 订阅
        const subscription = this.client.subscribe(destination, (message) => {
            try {
                const payload = JSON.parse(message.body);
                callback(payload);
            } catch (error) {
                console.error('解析消息失败:', error);
            }
        });

        // 保存订阅
        this.subscribers.set(conversationId, callback);

        console.log(`已订阅群聊: ${conversationId}`);

        return subscription;
    }

    /**
     * 取消订阅
     */
    unsubscribeFromConversation(conversationId: string) {
        this.subscribers.delete(conversationId);
        console.log(`取消订阅群聊: ${conversationId}`);
    }

    /**
     * 发送消息
     */
    sendMessage(conversationId: string, content: string, messageType: string = 'text') {
        if (!this.client || !this.client.connected) {
            throw new Error('WebSocket 未连接');
        }

        const message = {
            conversationId: parseInt(conversationId),
            content,
            messageType,
        };

        this.client.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(message),
        });

        console.log('发送消息:', message);
    }

    /**
     * 发送私聊消息
     */
    sendPrivateMessage(receiverId: number, content: string, messageType: string = 'text') {
        if (!this.client || !this.client.connected) {
            throw new Error('WebSocket 未连接');
        }

        const message = {
            receiverId,
            content,
            messageType,
        };

        this.client.publish({
            destination: '/app/chat.sendPrivateMessage',
            body: JSON.stringify(message),
        });
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.subscribers.clear();
            console.log('WebSocket 已主动断开');
        }
    }

    /**
     * 检查连接状态
     */
    isConnected(): boolean {
        return this.client?.connected || false;
    }
}

// 导出单例
export const chatWebSocket = new ChatWebSocketClient();