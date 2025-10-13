// src/lib/websocket/chatWebSocket.ts

import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type MessageCallback = (message: any) => void;

class ChatWebSocketClient {
    private client: Client | null = null;
    private subscribers: Map<string, MessageCallback> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;  // 增加到 10 次
    private reconnectDelay = 3000;  // 重连延迟 3 秒
    private isManualDisconnect = false;  // 是否手动断开
    private subscriptionQueue: Array<{ destination: string; callback: MessageCallback }> = [];  // 订阅队列
    private activeSubscriptions: Map<string, StompSubscription> = new Map();  // 活跃订阅

    /**
     * 连接 WebSocket
     */
    connect(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('开始连接 WebSocket...');

            this.isManualDisconnect = false;

            this.client = new Client({
                // 使用 SockJS
                webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

                // 连接头部（带 JWT Token）
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },

                // 心跳配置 - 保持连接活跃
                heartbeatIncoming: 10000,  // 10秒
                heartbeatOutgoing: 10000,  // 10秒

                // 自动重连配置
                reconnectDelay: this.reconnectDelay,

                // 调试
                debug: (str) => {
                    if (str.includes('ERROR') || str.includes('CLOSE')) {
                        console.error('[STOMP Debug]', str);
                    } else {
                        console.log('[STOMP Debug]', str);
                    }
                },

                // 连接成功回调
                onConnect: () => {
                    console.log('WebSocket 连接成功');
                    this.reconnectAttempts = 0;

                    // 恢复之前的订阅
                    this.restoreSubscriptions();

                    resolve();
                },

                // STOMP 错误回调
                onStompError: (frame) => {
                    console.error('STOMP 错误:', frame);
                    console.error('   - 错误信息:', frame.headers.message);
                    console.error('   - 错误详情:', frame.body);

                    // 不立即 reject，让重连机制处理
                    if (this.reconnectAttempts === 0) {
                        reject(new Error(frame.headers.message || 'WebSocket 连接失败'));
                    }
                },

                // WebSocket 错误回调
                onWebSocketError: (error) => {
                    console.error('WebSocket 错误:', error);
                },

                // 断开连接回调
                onDisconnect: () => {
                    console.log('WebSocket 已断开');

                    // 如果不是手动断开，尝试重连
                    if (!this.isManualDisconnect) {
                        this.attemptReconnect(token);
                    }
                },

                // WebSocket 关闭回调
                onWebSocketClose: (event) => {
                    console.log('WebSocket 连接关闭');
                    console.log('   - Code:', event.code);
                    console.log('   - Reason:', event.reason);
                    console.log('   - Clean:', event.wasClean);
                },
            });

            this.client.activate();
        });
    }

    /**
     * 尝试重连
     */
    private attemptReconnect(token: string) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('已达到最大重连次数，停止重连');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;  // 递增延迟

        console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})，${delay / 1000}秒后重试...`);

        setTimeout(() => {
            if (!this.isManualDisconnect) {
                console.log('开始重连...');
                this.connect(token).catch(err => {
                    console.error('重连失败:', err);
                });
            }
        }, delay);
    }

    /**
     * 恢复订阅
     */
    private restoreSubscriptions() {
        if (this.subscriptionQueue.length === 0) {
            console.log('没有需要恢复的订阅');
            return;
        }

        console.log(`恢复 ${this.subscriptionQueue.length} 个订阅...`);

        this.subscriptionQueue.forEach(({ destination, callback }) => {
            try {
                const subscription = this.client!.subscribe(destination, (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        callback(payload);
                    } catch (error) {
                        console.error('解析消息失败:', error);
                    }
                });

                this.activeSubscriptions.set(destination, subscription);
                console.log(`恢复订阅: ${destination}`);
            } catch (error) {
                console.error(`恢复订阅失败: ${destination}`, error);
            }
        });
    }

    /**
     * 订阅私聊消息（带重连支持）
     */
    subscribeToPrivateMessages(userId: number, callback: MessageCallback) {
        console.log('subscribeToPrivateMessages 被调用 - userId:', userId);

        if (!this.client || !this.client.connected) {
            console.error('WebSocket 未连接，无法订阅');
            return {
                unsubscribe: () => {
                    console.log('⚠无效的订阅，无需取消');
                }
            };
        }

        const destination = `/topic/private/${userId}`;

        // 添加到订阅队列，支持重连后恢复
        this.subscriptionQueue.push({ destination, callback });

        console.log('订阅私聊消息:', destination);

        try {
            const subscription = this.client.subscribe(destination, (message) => {
                console.log('WebSocket 收到私聊消息');
                console.log('原始消息:', message.body);

                try {
                    const payload = JSON.parse(message.body);
                    console.log('解析后:', payload);
                    callback(payload);
                } catch (error) {
                    console.error('解析消息失败:', error);
                }
            });

            this.activeSubscriptions.set(destination, subscription);
            console.log('私聊消息订阅成功 - subscription.id:', subscription.id);

            return {
                unsubscribe: () => {
                    console.log('取消私聊订阅:', destination);
                    subscription.unsubscribe();
                    this.activeSubscriptions.delete(destination);

                    // 从队列中移除
                    this.subscriptionQueue = this.subscriptionQueue.filter(
                        sub => sub.destination !== destination
                    );
                }
            };

        } catch (error) {
            console.error('订阅时发生错误:', error);
            return {
                unsubscribe: () => {
                    console.log('订阅失败，无需取消');
                }
            };
        }
    }

    /**
     * 订阅群聊消息（带重连支持）
     */
    subscribeToConversation(conversationId: string, callback: MessageCallback) {
        console.log('subscribeToConversation 被调用 - conversationId:', conversationId);

        if (!this.client || !this.client.connected) {
            console.error('WebSocket 未连接，无法订阅');
            return {
                unsubscribe: () => {
                    console.log('无效的订阅，无需取消');
                }
            };
        }

        const destination = `/topic/chat/${conversationId}`;

        // 添加到订阅队列
        this.subscriptionQueue.push({ destination, callback });

        console.log('订阅群聊消息:', destination);

        try {
            const subscription = this.client.subscribe(destination, (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    console.log('收到群聊消息:', payload.content);
                    callback(payload);
                } catch (error) {
                    console.error('解析消息失败:', error);
                }
            });

            this.activeSubscriptions.set(destination, subscription);
            this.subscribers.set(conversationId, callback);

            console.log('群聊消息订阅成功 - subscription.id:', subscription.id);

            return {
                unsubscribe: () => {
                    console.log('取消群聊订阅:', destination);
                    subscription.unsubscribe();
                    this.activeSubscriptions.delete(destination);
                    this.subscribers.delete(conversationId);

                    // 从队列中移除
                    this.subscriptionQueue = this.subscriptionQueue.filter(
                        sub => sub.destination !== destination
                    );
                }
            };

        } catch (error) {
            console.error('订阅时发生错误:', error);
            return {
                unsubscribe: () => {}
            };
        }
    }

    /**
     * 发送群聊消息（带重试）
     */
    sendMessage(conversationId: string, content: string, messageType: string = 'text') {
        if (!this.client || !this.client.connected) {
            console.error('WebSocket 未连接，无法发送消息');
            throw new Error('WebSocket 未连接');
        }

        const message = {
            conversationId: parseInt(conversationId),
            content,
            messageType,
        };

        try {
            this.client.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(message),
            });

            console.log('群聊消息已发送:', message);
        } catch (error) {
            console.error('发送消息失败:', error);
            throw error;
        }
    }

    /**
     * 发送私聊消息（带重试）
     */
    sendPrivateMessage(receiverId: number, content: string, messageType: string = 'text') {
        if (!this.client || !this.client.connected) {
            console.error('WebSocket 未连接，无法发送消息');
            throw new Error('WebSocket 未连接');
        }

        const message = {
            receiverId,
            content,
            messageType,
        };

        try {
            this.client.publish({
                destination: '/app/chat.sendPrivateMessage',
                body: JSON.stringify(message),
            });

            console.log('私聊消息已发送:', message);
        } catch (error) {
            console.error('发送消息失败:', error);
            throw error;
        }
    }

    /**
     * 手动断开连接
     */
    disconnect() {
        console.log('手动断开 WebSocket 连接');
        this.isManualDisconnect = true;

        if (this.client) {
            this.client.deactivate();
            this.subscribers.clear();
            this.activeSubscriptions.clear();
            this.subscriptionQueue = [];
        }
    }

    /**
     * 检查连接状态
     */
    isConnected(): boolean {
        return this.client?.connected || false;
    }

    /**
     * 获取连接统计信息
     */
    getStats() {
        return {
            connected: this.isConnected(),
            reconnectAttempts: this.reconnectAttempts,
            activeSubscriptions: this.activeSubscriptions.size,
            queuedSubscriptions: this.subscriptionQueue.length,
        };
    }
}

// 导出单例
export const chatWebSocket = new ChatWebSocketClient();