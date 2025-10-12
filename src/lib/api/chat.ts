// lib/api/chat.ts
import { apiClient } from './client';
import type {GroupChat, GroupMember} from '@/types/chat';

// 后端响应类型定义
interface ConversationListItem {
    id: number;
    title: string;
    ownerId: number;
    createdAt: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
    status?: string;
}

interface CreateConversationResponse {
    conversationId: number;
}

interface MemberResponse {
    userId: number;
    username: string;
    email: string;
    role: string;
    joinedAt: string;
}

export class ChatApi {

    /**
     * 获取用户的所有群聊列表
     */
    async getGroupList(): Promise<GroupChat[]> {
        const conversations = await apiClient.get<ConversationListItem[]>('/conversation/list');

        return conversations.map((conv) => ({
            id: conv.id,
            title: conv.title,
            ownerId: conv.ownerId,
            unread: conv.unreadCount || 0,
            lastMessage: conv.lastMessage || '',
            status: conv.status,
        }));
    }

    /**
     * 创建群聊
     */
    async createGroup(params: { name: string }): Promise<GroupChat> {
        const response = await apiClient.post<CreateConversationResponse>(
            '/conversation/create',
            { title: params.name }
        );

        // 检查响应是否有效（后端返回的是 conversationId）
        if (!response || typeof response.conversationId === 'undefined') {
            console.error('创建群聊响应无效:', response);
            throw new Error('创建群聊失败：服务器未返回群聊ID');
        }

        // 使用 conversationId 字段
        return {
            id: response.conversationId,
            title: params.name,
            ownerId: '', // 暂时留空，创建成功后会在列表中获取
            unread: 0,
            lastMessage: '',
        };
    }

    /**
     * 解散群聊
     */
    async dissolveGroup(conversationId: number): Promise<void> {
        await apiClient.post<void>('/conversation/dissolve', {
            conversationId: parseInt(conversationId)
        });
    }

    /**
     * 获取群聊成员列表
     */
    async getGroupMembers(conversationId: number): Promise<GroupMember[]> {
        const members = await apiClient.get<MemberResponse[]>(
            `/conversation/${conversationId}/members`
        );

        return members.map(member => ({
            userId: member.userId,
            username: member.username,
            email: member.email,
            role: member.role as 'owner' | 'member',
            nickname: member.username,
            joinedAt: member.joinedAt,
        }));
    }

    /**
     * 添加成员到群聊
     */
    async addMembersToGroup(conversationId: number, userIds: number[]): Promise<void> {
        await apiClient.post(`/conversation/${conversationId}/members/add`, {
            userIds
        });
    }
}

export const chatApi = new ChatApi();