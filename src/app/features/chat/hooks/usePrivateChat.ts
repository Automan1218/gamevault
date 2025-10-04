// src/app/features/chat/hooks/usePrivateChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatApi } from '@/lib/api/chat';
import { chatWebSocket } from '@/lib/websocket/chatWebSocket';
import { ChatMessage } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { message } from 'antd';

/**
 * 私聊消息管理 Hook
 */
export function usePrivateChat(friendUserId: number | null) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const hasSubscribed = useRef(false);

    // 加载历史消息
    const loadHistory = useCallback(async () => {
        if (!user || !friendUserId) return;

        setLoading(true);

        try {
            const history = await ChatApi.getPrivateMessages(user.userId, friendUserId);
            setMessages(history);
        } catch (error) {
            console.error('加载私聊历史失败:', error);
            message.error('加载历史消息失败');
        } finally {
            setLoading(false);
        }
    }, [user, friendUserId]);

    // 订阅私聊消息
    const subscribeMessages = useCallback(() => {
        if (!user || hasSubscribed.current) return;

        chatWebSocket.subscribePrivate(user.userId, (newMessage: ChatMessage) => {
            // 只处理当前会话的消息
            if (
                friendUserId &&
                (newMessage.senderId === friendUserId || newMessage.receiverId === friendUserId)
            ) {
                setMessages(prev => [...prev, newMessage]);
            }
        });

        hasSubscribed.current = true;
    }, [user, friendUserId]);

    // 发送消息
    const sendMessage = useCallback(
        async (content: string) => {
            if (!user || !friendUserId || !content.trim()) {
                return;
            }

            setSending(true);

            try {
                chatWebSocket.sendPrivateMessage(user.userId, friendUserId, content);

                // 乐观更新：立即显示消息
                const optimisticMessage: ChatMessage = {
                    id: Date.now(), // 临时 ID
                    senderId: user.userId,
                    receiverId: friendUserId,
                    content,
                    createdAt: new Date().toISOString(),
                };

                setMessages(prev => [...prev, optimisticMessage]);
            } catch (error) {
                console.error('发送私聊消息失败:', error);
                message.error('发送失败，请检查网络连接');
            } finally {
                setSending(false);
            }
        },
        [user, friendUserId]
    );

    // 清空消息
    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    // 当好友变化时，加载历史消息并订阅
    useEffect(() => {
        if (friendUserId) {
            hasSubscribed.current = false;
            loadHistory();
            subscribeMessages();
        } else {
            clearMessages();
        }
    }, [friendUserId, loadHistory, subscribeMessages, clearMessages]);

    return {
        messages,
        loading,
        sending,
        sendMessage,
        loadHistory,
        clearMessages,
    };
}