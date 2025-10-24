import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ENV } from '@/config/env';

export type MessageCallback = (message: any) => void;

// File information interface
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
     * Connect WebSocket
     */
    connect(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('Starting WebSocket connection...');

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
                    console.log('WebSocket connected successfully');
                    this.reconnectAttempts = 0;
                    this.restoreSubscriptions();
                    resolve();
                },

                onStompError: (frame) => {
                    console.error('STOMP error:', frame);
                    console.error('   - Error message:', frame.headers.message);
                    console.error('   - Error details:', frame.body);

                    if (this.reconnectAttempts === 0) {
                        reject(new Error(frame.headers.message || 'WebSocket connection failed'));
                    }
                },

                onWebSocketError: (error) => {
                    console.error('WebSocket error:', error);
                },

                onDisconnect: () => {
                    console.log('WebSocket disconnected');

                    if (!this.isManualDisconnect) {
                        this.attemptReconnect(token);
                    }
                },

                onWebSocketClose: (event) => {
                    console.log('WebSocket connection closed');
                    console.log('   - Code:', event.code);
                    console.log('   - Reason:', event.reason);
                    console.log('   - Clean:', event.wasClean);
                },
            });

            this.client.activate();
        });
    }

    /**
     * Attempting reconnection
     */
    private attemptReconnect(token: string) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Maximum reconnection attempts reached, stopping reconnection');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;

        console.log(`Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts}), retry in ${delay / 1000} seconds...`);

        setTimeout(() => {
            if (!this.isManualDisconnect) {
                console.log('Starting reconnection...');
                this.connect(token).catch(err => {
                    console.error('Reconnection failed:', err);
                });
            }
        }, delay);
    }

    /**
     * Restore subscriptions
     */
    private restoreSubscriptions() {
        if (this.subscriptionQueue.length === 0) {
            console.log('No subscriptions to restore');
            return;
        }

        console.log(`Restoring ${this.subscriptionQueue.length} subscriptions...`);

        this.subscriptionQueue.forEach(({ destination, callback }) => {
            try {
                const subscription = this.client!.subscribe(destination, (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        callback(payload);
                    } catch (error) {
                        console.error('Failed to parse message:', error);
                    }
                });

                this.activeSubscriptions.set(destination, subscription);
                console.log(`Restore subscriptions: ${destination}`);
            } catch (error) {
                console.error(`Failed to restore subscription: ${destination}`, error);
            }
        });
    }

    /**
     * Subscribe to private messages (with reconnection support)
     */
    subscribeToPrivateMessages(userId: number, callback: MessageCallback) {
        console.log('subscribeToPrivateMessages called - userId:', userId);

        if (!this.client || !this.client.connected) {
            console.error('WebSocket not connected, cannot subscribe');
            return {
                unsubscribe: () => {
                    console.log('⚠ Invalid subscription, no need to cancel');
                }
            };
        }

        const destination = `/topic/private/${userId}`;

        this.subscriptionQueue.push({ destination, callback });

        console.log('Subscribe to private messages:', destination);

        try {
            const subscription = this.client.subscribe(destination, (message) => {
                console.log('WebSocket received private message');
                console.log('Raw message:', message.body);

                try {
                    const payload = JSON.parse(message.body);
                    console.log('Parsed:', payload);
                    callback(payload);
                } catch (error) {
                    console.error('Failed to parse message:', error);
                }
            });

            this.activeSubscriptions.set(destination, subscription);
            console.log('Private message subscription successful - subscription.id:', subscription.id);

            return {
                unsubscribe: () => {
                    console.log('Unsubscribe from private messages:', destination);
                    subscription.unsubscribe();
                    this.activeSubscriptions.delete(destination);

                    this.subscriptionQueue = this.subscriptionQueue.filter(
                        sub => sub.destination !== destination
                    );
                }
            };

        } catch (error) {
            console.error('Error occurred during subscription:', error);
            return {
                unsubscribe: () => {
                    console.log('Subscription failed, no need to cancel');
                }
            };
        }
    }

    /**
     * Subscribe to group chat messages (with reconnection support)
     */
    subscribeToConversation(conversationId: string, callback: MessageCallback) {
        console.log('subscribeToConversation called - conversationId:', conversationId);

        if (!this.client || !this.client.connected) {
            console.error('WebSocket not connected, cannot subscribe');
            return {
                unsubscribe: () => {
                    console.log('Invalid subscription, no need to cancel');
                }
            };
        }

        const destination = `/topic/chat/${conversationId}`;

        this.subscriptionQueue.push({ destination, callback });

        console.log('Subscribe to group chat messages:', destination);

        try {
            const subscription = this.client.subscribe(destination, (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    console.log('Received group chat message:', payload.content);
                    console.log('🔔 Received group chat message:', {
                        id: payload.id,
                        messageType: payload.messageType,
                        content: payload.content,
                        hasAttachment: !!payload.attachment,
                        attachment: payload.attachment,
                        timestamp: payload.timestamp
                    });
                    callback(payload);
                } catch (error) {
                    console.error('Failed to parse message:', error);
                }
            });

            this.activeSubscriptions.set(destination, subscription);
            this.subscribers.set(conversationId, callback);

            console.log('Group chat message subscription successful - subscription.id:', subscription.id);

            return {
                unsubscribe: () => {
                    console.log('Unsubscribe from group chat:', destination);
                    subscription.unsubscribe();
                    this.activeSubscriptions.delete(destination);
                    this.subscribers.delete(conversationId);

                    this.subscriptionQueue = this.subscriptionQueue.filter(
                        sub => sub.destination !== destination
                    );
                }
            };

        } catch (error) {
            console.error('Error occurred during subscription:', error);
            return {
                unsubscribe: () => {}
            };
        }
    }

    /**
     * Send group chat message (with retry)
     */
    sendMessage(conversationId: string, content: string, messageType: string = 'text') {
        if (!this.client || !this.client.connected) {
            console.error('WebSocket not connected, cannot send message');
            throw new Error('WebSocket not connected');
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

            console.log('Group chat message sent:', message);
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }

    /**
     * Send group chat file message
     */
    sendMessageWithFile(conversationId: string, content: string, fileInfo: FileMessageInfo) {
        console.log('🟣 chatWebSocket.sendMessageWithFile called');
        console.log('   conversationId:', conversationId);
        console.log('   content:', content);
        console.log('   fileInfo:', fileInfo);

        if (!this.client || !this.client.connected) {
            console.error('WebSocket not connected, cannot send message');
            throw new Error('WebSocket not connected');
        }

        const message = {
            conversationId: parseInt(conversationId),
            content,
            messageType: 'file',
            // File related fields
            fileId: fileInfo.fileId,
            fileName: fileInfo.fileName,
            fileSize: fileInfo.fileSize,
            fileType: fileInfo.fileType,
            fileExt: fileInfo.fileExt,
            accessUrl: fileInfo.accessUrl,
            thumbnailUrl: fileInfo.thumbnailUrl,
        };

        console.log('📤 Message object to be sent:');
        console.log(JSON.stringify(message, null, 2));

        try {
            this.client.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(message),
            });

            console.log('Group chat file message sent:', message);
        } catch (error) {
            console.error('Failed to send file message:', error);
            throw error;
        }
    }

    /**
     * Send private message (with retry)
     */
    sendPrivateMessage(receiverId: number, content: string, messageType: string = 'text') {
        if (!this.client || !this.client.connected) {
            console.error('WebSocket not connected, cannot send message');
            throw new Error('WebSocket not connected');
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

            console.log('Private message sent:', message);
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }

    /**
     * Send private file message
     */
    sendPrivateMessageWithFile(receiverId: number, content: string, fileInfo: FileMessageInfo) {
        if (!this.client || !this.client.connected) {
            console.error('WebSocket not connected, cannot send message');
            throw new Error('WebSocket not connected');
        }

        const message = {
            receiverId,
            content,
            messageType: 'file',
            // 🆕 File related fields
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

            console.log('Private file message sent:', message);
        } catch (error) {
            console.error('Failed to send file message:', error);
            throw error;
        }
    }

    /**
     * Manually disconnect
     */
    disconnect() {
        console.log('Manually disconnect WebSocket connection');
        this.isManualDisconnect = true;

        if (this.client) {
            this.client.deactivate();
            this.subscribers.clear();
            this.activeSubscriptions.clear();
            this.subscriptionQueue = [];
        }
    }

    /**
     * Check connection status
     */
    isConnected(): boolean {
        return this.client?.connected || false;
    }

    /**
     * Get connection statistics
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

// Export singleton
export const chatWebSocket = new ChatWebSocketClient();