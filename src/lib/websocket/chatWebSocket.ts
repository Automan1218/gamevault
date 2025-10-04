// src/lib/websocket/chatWebSocket.ts
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage, PrivateMessagePayload, GroupMessagePayload, WebSocketStatus } from '@/types/chat';
import { ENV } from '@/config/env';

/**
 * 聊天 WebSocket 服务
 * 使用 SockJS + Stomp 协议
 */
export class ChatWebSocketService {
    private client: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private status: WebSocketStatus = 'disconnected';
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;
    private statusListeners: Set<(status: WebSocketStatus) => void> = new Set();

    /**
     * 连接 WebSocket
     */
    connect(token: string, userId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.client?.connected) {
                console.log('WebSocket 已连接');
                resolve();
                return;
            }

            // 构建 WebSocket URL
            const wsUrl = ENV.FORUM_API_URL.replace(/^http/, 'ws').replace('/api', '/ws');
            console.log('连接 WebSocket:', wsUrl);

            this.updateStatus('connecting');

            // 创建 Stomp 客户端
            this.client = new Client({
                webSocketFactory: () => new SockJS(wsUrl),
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                debug: (str) => {
                    if (ENV.IS_DEVELOPMENT) {
                        console.log('[Stomp Debug]', str);
                    }
                },
                reconnectDelay: this.reconnectDelay,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            // 连接成功
            this.client.onConnect = () => {
                console.log('WebSocket 连接成功');
                this.updateStatus('connected');
                this.reconnectAttempts = 0;

                // 自动订阅私聊频道
                this.subscribePrivate(userId, () => {});

                resolve();
            };

            // 连接错误
            this.client.onStompError = (frame) => {
                console.error('WebSocket Stomp 错误:', frame);
                this.updateStatus('error');
                reject(new Error('WebSocket 连接失败'));
            };

            // WebSocket 错误
            this.client.onWebSocketError = (event) => {
                console.error('WebSocket 错误:', event);
                this.updateStatus('error');
            };

            // 连接关闭
            this.client.onDisconnect = () => {
                console.log('WebSocket 已断开');
                this.updateStatus('disconnected');
                this.subscriptions.clear();
            };

            // 激活连接
            this.client.activate();
        });
    }

    /**
     * 订阅私聊消息
     * 订阅地址：/queue/{userId}
     */
    subscribePrivate(
        userId: number,
        onMessage: (message: ChatMessage) => void
    ): void {
        if (!this.client?.connected) {
            console.warn('WebSocket 未连接，无法订阅私聊');
            return;
        }

        const destination = `/queue/${userId}`;
        const subscriptionId = `private-${userId}`;

        // 如果已订阅，先取消
        if (this.subscriptions.has(subscriptionId)) {
            console.log('已订阅私聊频道，跳过');
            return;
        }

        console.log('订阅私聊频道:', destination);

        const subscription = this.client.subscribe(
            destination,
            (message: IMessage) => {
                try {
                    const data: ChatMessage = JSON.parse(message.body);
                    console.log('收到私聊消息:', data);
                    onMessage(data);
                } catch (error) {
                    console.error('解析私聊消息失败:', error);
                }
            }
        );

        this.subscriptions.set(subscriptionId, subscription);
    }

    /**
     * 订阅群聊消息
     * 订阅地址：/topic/conversation/{conversationId}
     */
    subscribeGroup(
        conversationId: number,
        onMessage: (message: ChatMessage) => void
    ): void {
        if (!this.client?.connected) {
            console.warn('WebSocket 未连接，无法订阅群聊');
            return;
        }

        const destination = `/topic/conversation/${conversationId}`;
        const subscriptionId = `group-${conversationId}`;

        // 如果已订阅，先取消
        if (this.subscriptions.has(subscriptionId)) {
            console.log('已订阅群聊频道，跳过');
            return;
        }

        console.log('订阅群聊频道:', destination);

        const subscription = this.client.subscribe(
            destination,
            (message: IMessage) => {
                try {
                    const data: ChatMessage = JSON.parse(message.body);
                    console.log('收到群聊消息:', data);
                    onMessage(data);
                } catch (error) {
                    console.error('解析群聊消息失败:', error);
                }
            }
        );

        this.subscriptions.set(subscriptionId, subscription);
    }

    /**
     * 取消订阅群聊
     */
    unsubscribeGroup(conversationId: number): void {
        const subscriptionId = `group-${conversationId}`;
        const subscription = this.subscriptions.get(subscriptionId);

        if (subscription) {
            console.log('取消订阅群聊:', conversationId);
            subscription.unsubscribe();
            this.subscriptions.delete(subscriptionId);
        }
    }

    /**
     * 发送私聊消息
     * 目的地：/app/private
     */
    sendPrivateMessage(senderId: number, receiverId: number, content: string): void {
        if (!this.client?.connected) {
            console.error('WebSocket 未连接，无法发送私聊消息');
            throw new Error('WebSocket 未连接');
        }

        const payload: PrivateMessagePayload = {
            senderId,
            receiverId,
            content,
        };

        console.log('发送私聊消息:', payload);

        this.client.publish({
            destination: '/app/private',
            body: JSON.stringify(payload),
        });
    }

    /**
     * 发送群聊消息
     * 目的地：/app/chat
     */
    sendGroupMessage(senderId: number, conversationId: number, content: string): void {
        if (!this.client?.connected) {
            console.error('WebSocket 未连接，无法发送群聊消息');
            throw new Error('WebSocket 未连接');
        }

        const payload: GroupMessagePayload = {
            senderId,
            conversationId,
            content,
        };

        console.log('发送群聊消息:', payload);

        this.client.publish({
            destination: '/app/chat',
            body: JSON.stringify(payload),
        });
    }

    /**
     * 断开连接
     */
    disconnect(): void {
        if (this.client) {
            console.log('断开 WebSocket 连接');

            // 取消所有订阅
            this.subscriptions.forEach((subscription) => {
                subscription.unsubscribe();
            });
            this.subscriptions.clear();

            // 断开连接
            this.client.deactivate();
            this.client = null;
            this.updateStatus('disconnected');
        }
    }

    /**
     * 获取连接状态
     */
    getStatus(): WebSocketStatus {
        return this.status;
    }

    /**
     * 监听状态变化
     */
    onStatusChange(listener: (status: WebSocketStatus) => void): () => void {
        this.statusListeners.add(listener);
        // 返回取消监听的函数
        return () => {
            this.statusListeners.delete(listener);
        };
    }

    /**
     * 更新状态并通知监听器
     */
    private updateStatus(status: WebSocketStatus): void {
        this.status = status;
        this.statusListeners.forEach((listener) => {
            try {
                listener(status);
            } catch (error) {
                console.error('状态监听器执行失败:', error);
            }
        });
    }

    /**
     * 检查是否已连接
     */
    isConnected(): boolean {
        return this.client?.connected || false;
    }
}

// 导出单例
export const chatWebSocket = new ChatWebSocketService();