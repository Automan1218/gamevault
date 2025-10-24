// src/app/features/chat/hooks/usePrivateMessages.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { chatWebSocket, FileMessageInfo } from '@/lib/websocket/chatWebSocket'; // 添加 FileMessageInfo
import { MessageApi } from '@/lib/api/message';
import type { ChatMessage } from '@/types/chat';
import type { FileUploadResponse } from '@/lib/api/file';
export const dynamic = 'force-dynamic';
export function usePrivateMessages(friendId: number | null, currentUserId: number) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const subscriptionRef = useRef<any>(null);
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
                            // 添加文件附件支持
                            attachment: newMessage.attachment,
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

    // 发送消息（支持文件）
    const sendMessage = useCallback(async (content: string, fileInfo?: FileUploadResponse) => {
        if (!friendId || (!content.trim() && !fileInfo)) {
            return;
        }

        setSending(true);
        try {
            if (fileInfo) {
                // 使用新的文件消息方法
                const fileMessageInfo: FileMessageInfo = {
                    fileId: fileInfo.fileId,
                    fileName: fileInfo.fileName,
                    fileSize: fileInfo.fileSize,
                    fileType: fileInfo.fileType,
                    fileExt: fileInfo.fileExt,
                    accessUrl: fileInfo.accessUrl,
                    thumbnailUrl: fileInfo.thumbnailUrl,
                };

                chatWebSocket.sendPrivateMessageWithFile(
                    friendId,
                    content.trim() || `[文件] ${fileInfo.fileName}`,
                    fileMessageInfo
                );
            } else {
                chatWebSocket.sendPrivateMessage(friendId, content.trim());
            }
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