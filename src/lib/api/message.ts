// src/lib/api/message.ts

import { apiClient } from './client';

interface MessageResponse {
    id: number;
    conversationId?: number;
    senderId: number;
    receiverId?: number;
    senderUsername: string;
    senderEmail: string;
    content: string;
    messageType: string;
    chatType?: string;
    createdAt: string;
}

export class MessageApi {
    /**
     * 获取群聊历史消息
     */
    static async getMessages(
        conversationId: number,
        page: number = 0,
        size: number = 50
    ): Promise<MessageResponse[]> {
        return apiClient.get<MessageResponse[]>(
            `/message/${conversationId}`,
            { page, size }
        );
    }

    /**
     * 获取私聊历史消息
     */
    static async getPrivateMessages(
        friendId: number,
        page: number = 0,
        size: number = 50
    ): Promise<MessageResponse[]> {
        return apiClient.get<MessageResponse[]>(
            `/message/private/${friendId}`,  // 确保路径正确
            { page, size }
        );
    }

    /**
     * 发送私聊消息（REST API，用于测试）
     */
    static async sendPrivateMessage(
        receiverId: number,
        content: string,
        messageType: string = 'text'
    ): Promise<MessageResponse> {
        return apiClient.post<MessageResponse>('/message/private/send', {
            receiverId,
            content,
            messageType,
        });
    }
}