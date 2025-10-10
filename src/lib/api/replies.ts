// src/api/replies.ts
import { apiClient } from './client';

export interface Reply {
    replyId: number;
    parentId: number;
    body: string;
    authorId: number;
    authorName: string;
    authorNickname: string;
    likeCount: number;
    createdDate: string;
}

export interface CreateReplyRequest {
    body: string;
}

export class RepliesApi {
    // 创建回复
    static async createReply(postId: number, data: CreateReplyRequest): Promise<Reply> {
        const response = await apiClient.post<{ reply: Reply }>(`/posts/${postId}/replies`, data);
        return response.reply;
    }

    // 获取回复列表
    static async getReplies(postId: number, page = 0, size = 20): Promise<Reply[]> {
        const response = await apiClient.get<{ replies: Reply[] }>(
            `/posts/${postId}/replies`,
            { page, size }
        );
        return response.replies;
    }

    // 删除回复
    static async deleteReply(postId: number, replyId: number): Promise<void> {
        await apiClient.delete(`/posts/${postId}/replies/${replyId}`);
    }
}