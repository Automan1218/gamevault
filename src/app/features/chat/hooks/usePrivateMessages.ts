// src/app/features/chat/hooks/usePrivateMessages.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatWebSocket } from '@/lib/websocket/chatWebSocket';
import { MessageApi } from '@/lib/api/message';
import type { ChatMessage } from '@/types/chat';

export function usePrivateMessages(friendId: number | null, currentUserId: number) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const subscriptionRef = useRef<>(null);
    const hasSubscribedRef = useRef(false);

    const friendIdRef = useRef(friendId);

    useEffect(() => {
        friendIdRef.current = friendId;
    }, [friendId]);

    // 加载历史消息
    useEffect(() => {
        if (!friendId || !currentUserId) {
            setMessages([]);
            return;
        }

        const loadMessages = async () => {
            setLoading(true);
            try {
                const history = await MessageApi.getPrivateMessages(friendId, 0, 50);
                setMessages(history);
            } catch (error) {
                console.error('加载失败:', error);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [friendId, currentUserId]);

    // 订阅私聊消息
    useEffect(() => {
        if (!currentUserId) {
            return;
        }

        if (!chatWebSocket.isConnected()) {
            const timer = setInterval(() => {
                if (chatWebSocket.isConnected() && !hasSubscribedRef.current) {
                    clearInterval(timer);
                    performSubscription();
                }
            }, 500);

            return () => clearInterval(timer);
        }

        if (!hasSubscribedRef.current) {
            performSubscription();
        }

        function performSubscription() {
            try {
                const subscription = chatWebSocket.subscribeToPrivateMessages(
                    currentUserId,
                    (newMessage) => {
                        // 使用 ref 获取最新的 friendId
                        const currentFriendId = friendIdRef.current;

                        const chatMessage: ChatMessage = {
                            id: newMessage.id,
                            senderId: newMessage.senderId,
                            receiverId: newMessage.receiverId,
                            senderUsername: newMessage.senderUsername,
                            senderEmail: newMessage.senderEmail,
                            content: newMessage.content,
                            messageType: newMessage.messageType || 'text',
                            createdAt: newMessage.timestamp || newMessage.createdAt,
                        };

                        const isMyMessage = newMessage.senderId === currentUserId && newMessage.receiverId === currentFriendId;
                        const isFriendMessage = newMessage.senderId === currentFriendId && newMessage.receiverId === currentUserId;
                        const isCurrentChat = isMyMessage || isFriendMessage;

                        if (isCurrentChat) {
                            setMessages(prev => {
                                if (prev.some(m => m.id === newMessage.id)) {
                                    return prev;
                                }
                                return [...prev, chatMessage];
                            });
                        } else {
                        }
                    }
                );

                subscriptionRef.current = subscription;
                hasSubscribedRef.current = true;
            } catch (error) {
                console.error('订阅失败:', error);
            }
        }

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
                hasSubscribedRef.current = false;
            }
        };
    }, [currentUserId]);

    const sendMessage = useCallback(async (content: string) => {
        if (!friendId || !content.trim()) {
            return;
        }

        setSending(true);
        try {
            chatWebSocket.sendPrivateMessage(friendId, content.trim());
        } catch (error) {
            console.error('发送失败:', error);
            throw error;
        } finally {
            setSending(false);
        }
    }, [friendId]);

    return {
        messages,
        loading,
        sending,
        sendMessage,
    };
}