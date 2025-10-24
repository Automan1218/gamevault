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
     * Get group chat history messages
     */
    static async getMessages(
        conversationId: number,
        page: number = 0,
        size: number = 50,
        retries: number = 3  // Retry count
    ): Promise<MessageResponse[]> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                console.log(`Attempting to load group chat messages (${attempt + 1}/${retries}) - conversationId:`, conversationId);

                const response = await chatroomApiClient.get<MessageResponse[]>(
                    `/message/${conversationId}`,
                    { page, size }
                );

                console.log(`Group chat messages loaded successfully, count:`, response.length);
                return response;

            } catch (error) {
                lastError = error as Error;
                console.error(`Failed to load group chat messages (${attempt + 1}/${retries}):`, error);

                // If there are still retry opportunities, wait and retry
                if (attempt < retries - 1) {
                    const delay = Math.min(1000 * Math.pow(2, attempt), 5000);  // Exponential backoff, max 5 seconds
                    console.log(`Retrying in ${delay / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // All retries failed
        console.error('Group chat message loading completely failed');
        throw lastError;
    }


    /**
     * Get private chat history messages (with retry)
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
                console.log(`Attempting to load private chat messages (${attempt + 1}/${retries}) - friendId:`, friendId);

                const response = await chatroomApiClient.get<MessageResponse[]>(
                    `/message/private/${friendId}`,
                    { page, size }
                );

                console.log(`Private chat messages loaded successfully, count:`, response.length);
                return response;

            } catch (error) {
                lastError = error as Error;
                console.error(`Failed to load private chat messages (${attempt + 1}/${retries}):`, error);

                if (attempt < retries - 1) {
                    const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
                    console.log(`Retrying in ${delay / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        console.error('Private chat message loading completely failed');
        throw lastError;
    }

    /**
     * Send private message (REST API, for testing)
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