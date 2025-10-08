import { useState, useEffect, useCallback, useRef } from 'react';
import { message as antMessage } from 'antd';
import { chatWebSocket } from '@/lib/websocket/chatWebSocket';
import { MessageApi } from '@/lib/api/message';
import type { ChatMessage } from '@/types/chat';

interface UseGroupMessagesReturn {
    messages: ChatMessage[];
    loading: boolean;
    sending: boolean;
    sendMessage: (content: string) => Promise<void>;
    loadMessages: () => Promise<void>;
}

export function useGroupMessages(conversationId: number | null): UseGroupMessagesReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const subscriptionRef = useRef<>(null);

    /**
     * 加载历史消息
     */
    const loadMessages = useCallback(async () => {
        if (!conversationId) return;

        setLoading(true);
        try {
            const history = await MessageApi.getMessages(conversationId, 0, 50);
            const formattedMessages: ChatMessage[] = history.map(msg => ({
                id: msg.id,
                senderId: msg.senderId,
                senderUsername: msg.senderUsername,
                senderEmail: msg.senderEmail,
                conversationId: msg.conversationId,
                content: msg.content,
                messageType: msg.messageType,
                createdAt: msg.createdAt,
            }));
            setMessages(formattedMessages);
        } catch (error) {
            console.error('加载消息失败:', error);
            antMessage.error('加载消息失败');
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

    /**
     * 订阅实时消息
     */
    const subscribeMessages = useCallback(() => {
        if (!conversationId || !chatWebSocket.isConnected()) {
            return;
        }

        // 取消之前的订阅
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
        }

        // 订阅新消息
        subscriptionRef.current = chatWebSocket.subscribeToConversation(
            conversationId,
            (newMessage: ChatMessage) => {
                console.log('收到实时消息:', newMessage);
                const formattedMessage: ChatMessage = {
                    id: newMessage.id,
                    senderId: newMessage.senderId,
                    senderUsername: newMessage.senderUsername,
                    senderEmail: newMessage.senderEmail,
                    conversationId: newMessage.conversationId,
                    content: newMessage.content,
                    messageType: newMessage.messageType,
                    createdAt: newMessage.timestamp || newMessage.createdAt,
                };

                setMessages((prev) => {
                    // 避免重复添加
                    if (prev.some(m => m.id === formattedMessage.id)) {
                        return prev;
                    }
                    return [...prev, formattedMessage];
                });
            }
        );
    }, [conversationId]);

    /**
     * 发送消息
     */
    const sendMessage = useCallback(async (content: string) => {
        if (!conversationId || !content.trim()) {
            return;
        }

        setSending(true);
        try {
            // 通过 WebSocket 发送
            chatWebSocket.sendMessage(conversationId, content.trim());

            // 注意：不需要手动添加到列表，WebSocket 会广播回来
        } catch (error) {
            console.error('发送消息失败:', error);
            antMessage.error('发送失败');
        } finally {
            setSending(false);
        }
    }, [conversationId]);

    /**
     * 切换群聊时重新加载
     */
    useEffect(() => {
        if (conversationId) {
            loadMessages();
            subscribeMessages();
        } else {
            setMessages([]);
        }

        return () => {
            // 组件卸载时取消订阅
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
        };
    }, [conversationId, loadMessages, subscribeMessages]);

    return {
        messages,
        loading,
        sending,
        sendMessage,
        loadMessages,
    };
}