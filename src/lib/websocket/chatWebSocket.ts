import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ENV } from '@/config/env';

export type MessageCallback = (message: any) => void;

// 文件信息接口
export interface FileMessageInfo {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileExt: string;
    accessUrl?: string;
    thumbnailUrl?: string;
}

class ChatWebSocketClient {
    private client: Client | null = null;
    private subscribers: Map<string, MessageCallback> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private reconnectDelay = 3000;
    private isManualDisconnect = false;
    private subscriptionQueue: Array<{ destination: string; callback: MessageCallback }> = [];
    private activeSubscriptions: Map<string, StompSubscription> = new Map();

    /**
     * 连接 WebSocket
     */
    connect(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('开始连接 WebSocket...');

            this.isManualDisconnect = false;

            this.client = new Client({
                webSocketFactory: () => new SockJS(`${ENV.WS_URL}/ws`),

                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },

                heartbeatIncoming: 10000,
                heartbeatOutgoing: 10000,

                reconnectDelay: this.reconnectDelay,

                debug: (str) => {
                    if (str.includes('ERROR') || str.includes('CLOSE')) {
                        console.error('[STOMP Debug]', str);
                    } else {
                        console.log('[STOMP Debug]', str);
                    }
                },

                onConnect: () => {
                    console.log('WebSocket 连接成功');
                    this.reconnectAttempts = 0;
                    this.restoreSubscriptions();
                    resolve();
                },

                onStompError: (frame) => {
                    console.error('STOMP 错误:', frame);
                    console.error('   - 错误信息:', frame.headers.message);
                    console.error('   - 错误详情:', frame.body);

                    if (this.reconnectAttempts === 0) {
                        reject(new Error(frame.headers.message || 'WebSocket 连接失败'));
                    }
                },

                onWebSocketError: (error) => {
                    console.error('WebSocket 错误:', error);
                },

                onDisconnect: () => {
                    console.log('WebSocket 已断开');

                    if (!this.isManualDisconnect) {
                        this.attemptReconnect(token);
                    }
                },

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
        const delay = this.reconnectDelay * this.reconnectAttempts;

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

        this.subscriptionQueue.push({ destination, callback });

        console.log('订阅群聊消息:', destination);

        try {
            const subscription = this.client.subscribe(destination, (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    console.log('收到群聊消息:', payload.content);
                    console.log('🔔 收到群聊消息:', {
                        id: payload.id,
                        messageType: payload.messageType,
                        content: payload.content,
                        hasAttachment: !!payload.attachment,
                        attachment: payload.attachment,
                        timestamp: payload.timestamp
                    });
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
     * 发送群聊文件消息
     */
    sendMessageWithFile(conversationId: string, content: string, fileInfo: FileMessageInfo) {
        console.log('🟣 chatWebSocket.sendMessageWithFile 被调用');
        console.log('   conversationId:', conversationId);
        console.log('   content:', content);
        console.log('   fileInfo:', fileInfo);

        if (!this.client || !this.client.connected) {
            console.error('WebSocket 未连接，无法发送消息');
            throw new Error('WebSocket 未连接');
        }

        const message = {
            conversationId: parseInt(conversationId),
            content,
            messageType: 'file',
            // 文件相关字段
            fileId: fileInfo.fileId,
            fileName: fileInfo.fileName,
            fileSize: fileInfo.fileSize,
            fileType: fileInfo.fileType,
            fileExt: fileInfo.fileExt,
            accessUrl: fileInfo.accessUrl,
            thumbnailUrl: fileInfo.thumbnailUrl,
        };

        console.log('📤 即将发送的消息对象:');
        console.log(JSON.stringify(message, null, 2));

        try {
            this.client.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(message),
            });

            console.log('群聊文件消息已发送:', message);
        } catch (error) {
            console.error('发送文件消息失败:', error);
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
     * 发送私聊文件消息
     */
    sendPrivateMessageWithFile(receiverId: number, content: string, fileInfo: FileMessageInfo) {
        if (!this.client || !this.client.connected) {
            console.error('WebSocket 未连接，无法发送消息');
            throw new Error('WebSocket 未连接');
        }

        const message = {
            receiverId,
            content,
            messageType: 'file',
            // 🆕 文件相关字段
            fileId: fileInfo.fileId,
            fileName: fileInfo.fileName,
            fileSize: fileInfo.fileSize,
            fileType: fileInfo.fileType,
            fileExt: fileInfo.fileExt,
            accessUrl: fileInfo.accessUrl,
            thumbnailUrl: fileInfo.thumbnailUrl,
        };

        try {
            this.client.publish({
                destination: '/app/chat.sendPrivateMessage',
                body: JSON.stringify(message),
            });

            console.log('私聊文件消息已发送:', message);
        } catch (error) {
            console.error('发送文件消息失败:', error);
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