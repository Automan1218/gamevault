// src/app/features/chat/hooks/useGroupMessages.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { chatWebSocket, FileMessageInfo } from '@/lib/websocket/chatWebSocket';
import { MessageApi } from '@/lib/api/message';
import type { ChatMessage } from '@/types/chat';
import type { FileUploadResponse } from '@/lib/api/file';
import { message as antMessage } from 'antd';
export const dynamic = 'force-dynamic';
export function useGroupMessages(conversationId: number | null) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const subscriptionRef = useRef<any>(null);
    const isSubscribedRef = useRef(false);

    // 加载历史消息（带错误处理）
    const loadMessages = useCallback(async () => {
        if (!conversationId) {
            setMessages([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('加载群聊历史 - conversationId:', conversationId);
            const history = await MessageApi.getMessages(conversationId);
            console.log('加载成功，消息数:', history.length);
            setMessages(history);
            setError(null);
        } catch (err) {
            const errorMsg = '加载群聊消息失败，请刷新重试';
            console.error('加载失败:', err);
            setError(errorMsg);
            antMessage.error(errorMsg);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

    // 订阅实时消息
    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            return;
        }

        if (!chatWebSocket.isConnected()) {
            console.log('WebSocket 未连接，等待连接...');

            const timer = setInterval(() => {
                if (chatWebSocket.isConnected() && !isSubscribedRef.current) {
                    console.log('WebSocket 已连接，开始订阅群聊');
                    clearInterval(timer);
                    performSubscription();
                }
            }, 500);

            return () => clearInterval(timer);
        }

        if (!isSubscribedRef.current) {
            performSubscription();
        }

        function performSubscription() {
            console.log('订阅群聊消息 - conversationId:', conversationId);

            try {
                const subscription = chatWebSocket.subscribeToConversation(
                    conversationId!.toString(),
                    (newMessage: any) => {
                        console.log('收到新消息:', newMessage.content);

                        setMessages(prev => {
                            // 防止重复
                            if (prev.some(m => m.id === newMessage.id)) {
                                return prev;
                            }
                            return [...prev, newMessage];
                        });
                    }
                );

                subscriptionRef.current = subscription;
                isSubscribedRef.current = true;
                console.log('群聊订阅成功');

            } catch (error) {
                console.error('订阅失败:', error);
                antMessage.error('实时消息订阅失败');
            }
        }

        return () => {
            console.log('🧹 清理群聊订阅');
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
                isSubscribedRef.current = false;
            }
        };
    }, [conversationId]);

    // 加载历史消息
    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    // 发送消息（支持文件）
    const sendMessage = useCallback(async (content: string, fileInfo?: FileUploadResponse) => {
        console.log('🟢 useGroupMessages.sendMessage 被调用');
        console.log('   conversationId:', conversationId);
        console.log('   content:', content);
        console.log('   fileInfo:', fileInfo);
        console.log('   hasFileInfo:', !!fileInfo);
        console.log('   fileInfo 类型:', typeof fileInfo);
        if (!conversationId || (!content.trim() && !fileInfo)) {
            return;
        }

        setSending(true);
        setError(null);

        try {
            console.log('发送群聊消息:', content, fileInfo ? `[文件: ${fileInfo.fileName}]` : '');

            if (fileInfo) {
                // 使用新的文件消息方法
                console.log('✅✅✅ fileInfo 存在！准备发送文件消息');
                console.log('fileInfo 详情:', JSON.stringify(fileInfo, null, 2));
                const fileMessageInfo: FileMessageInfo = {
                    fileId: fileInfo.fileId,
                    fileName: fileInfo.fileName,
                    fileSize: fileInfo.fileSize,
                    fileType: fileInfo.fileType,
                    fileExt: fileInfo.fileExt,
                    accessUrl: fileInfo.accessUrl,
                    thumbnailUrl: fileInfo.thumbnailUrl,
                };
                console.log('📎 构建的 fileMessageInfo:', fileMessageInfo);
                console.log('👉 即将调用 chatWebSocket.sendMessageWithFile');

                chatWebSocket.sendMessageWithFile(
                    conversationId.toString(),
                    content.trim() || `[文件] ${fileInfo.fileName}`,
                    fileMessageInfo
                );
                console.log('✅ chatWebSocket.sendMessageWithFile 调用完成');
            } else {
                console.log('❌❌❌ fileInfo 不存在或为空！发送纯文本消息');
                console.log('fileInfo 值:', fileInfo);
                console.log('fileInfo 类型:', typeof fileInfo);
                // 普通文本消息
                chatWebSocket.sendMessage(conversationId.toString(), content.trim());
            }

            console.log('消息已发送');
        } catch (err) {
            const errorMsg = '发送消息失败，请检查网络连接';
            console.error('发送失败:', err);
            setError(errorMsg);
            antMessage.error(errorMsg);
            throw err;
        } finally {
            setSending(false);
        }
    }, [conversationId]);

    // 重试加载
    const retry = useCallback(() => {
        loadMessages();
    }, [loadMessages]);

    return {
        messages,
        loading,
        sending,
        error,
        sendMessage,
        retry,
    };
}