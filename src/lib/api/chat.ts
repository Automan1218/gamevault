// lib/api/chat.ts
import { chatroomApiClient } from './client';
import type {GroupChat, GroupMember} from '@/types/chat';

// Backend response type definitions
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
     * Get all group chat lists for user
     */
    async getGroupList(): Promise<GroupChat[]> {
        const conversations = await chatroomApiClient.get<ConversationListItem[]>('/conversation/list');

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
     * Create group chat
     */
    async createGroup(params: { name: string }): Promise<GroupChat> {
        const response = await chatroomApiClient.post<CreateConversationResponse>(
            '/conversation/create',
            { title: params.name }
        );

        // Check if response is valid (backend returns conversationId)
        if (!response || typeof response.conversationId === 'undefined') {
            console.error('Invalid create group chat response:', response);
            throw new Error('Failed to create group chat: server did not return group chat ID');
        }

        // Use conversationId field
        return {
            id: response.conversationId,
            title: params.name,
            ownerId: '', // Leave empty for now, will be obtained from list after successful creation
            unread: 0,
            lastMessage: '',
        };
    }

    /**
     * Dissolve group chat
     */
    async dissolveGroup(conversationId: number): Promise<void> {
        await chatroomApiClient.post<void>('/conversation/dissolve', {
            conversationId: parseInt(conversationId)
        });
    }

    /**
     * Get group chat member list
     */
    async getGroupMembers(conversationId: number): Promise<GroupMember[]> {
        const members = await chatroomApiClient.get<MemberResponse[]>(
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
     * Add members to group chat
     */
    async addMembersToGroup(conversationId: number, userIds: number[]): Promise<void> {
        await chatroomApiClient.post(`/conversation/${conversationId}/members/add`, {
            userIds
        });
    }
}

export const chatApi = new ChatApi();