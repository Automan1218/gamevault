// src/lib/api/message.ts

import { chatroomApiClient } from './client';

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
        size: number = 50,
        retries: number = 3  // 重试次数
    ): Promise<MessageResponse[]> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                console.log(`尝试加载群聊消息 (${attempt + 1}/${retries}) - conversationId:`, conversationId);

                const response = await chatroomApiClient.get<MessageResponse[]>(
                    `/message/${conversationId}`,
                    { page, size }
                );

                console.log(`群聊消息加载成功，数量:`, response.length);
                return response;

            } catch (error) {
                lastError = error as Error;
                console.error(`加载群聊消息失败 (${attempt + 1}/${retries}):`, error);

                // 如果还有重试机会，等待后重试
                if (attempt < retries - 1) {
                    const delay = Math.min(1000 * Math.pow(2, attempt), 5000);  // 指数退避，最大5秒
                    console.log(`${delay / 1000}秒后重试...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // 所有重试都失败
        console.error('群聊消息加载彻底失败');
        throw lastError;
    }


    /**
     * 获取私聊历史消息（带重试）
     */
    static async getPrivateMessages(
        friendId: number,
        page: number = 0,
        size: number = 50,
        retries: number = 3
    ): Promise<MessageResponse[]> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                console.log(`尝试加载私聊消息 (${attempt + 1}/${retries}) - friendId:`, friendId);

                const response = await chatroomApiClient.get<MessageResponse[]>(
                    `/message/private/${friendId}`,
                    { page, size }
                );

                console.log(`私聊消息加载成功，数量:`, response.length);
                return response;

            } catch (error) {
                lastError = error as Error;
                console.error(`加载私聊消息失败 (${attempt + 1}/${retries}):`, error);

                if (attempt < retries - 1) {
                    const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
                    console.log(`${delay / 1000}秒后重试...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        console.error('私聊消息加载彻底失败');
        throw lastError;
    }

    /**
     * 发送私聊消息（REST API，用于测试）
     */
    static async sendPrivateMessage(
        receiverId: number,
        content: string,
        messageType: string = 'text'
    ): Promise<MessageResponse> {
        return chatroomApiClient.post<MessageResponse>('/message/private/send', {
            receiverId,
            content,
            messageType,
        });
    }
}