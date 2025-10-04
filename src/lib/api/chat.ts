// src/lib/api/chat.ts
import { apiClient } from './client';
import {
    Friend,
    GroupChat,
    GroupMember,
    ChatMessage,
    CreateGroupRequest,
    CreateGroupResponse,
    AddMemberRequest,
    DissolveGroupRequest,
    LocalGroupChats,
} from '@/types/chat';

/**
 * 聊天相关 API
 */
export class ChatApi {
    /**
     * 获取好友列表
     * POST /api/friend/list
     */
    static async getFriendList(): Promise<Friend[]> {
        try {
            const response = await apiClient.post<Friend[]>('/friend/list');
            return response || [];
        } catch (error) {
            console.error('获取好友列表失败:', error);
            throw error;
        }
    }

    /**
     * 获取私聊历史消息
     * GET /api/message/private/{userId1}/{userId2}
     */
    static async getPrivateMessages(
        userId1: number,
        userId2: number
    ): Promise<ChatMessage[]> {
        try {
            const response = await apiClient.get<ChatMessage[]>(
                `/message/private/${userId1}/${userId2}`
            );
            return response || [];
        } catch (error) {
            console.error('获取私聊历史消息失败:', error);
            throw error;
        }
    }

    /**
     * 创建群聊
     * POST /api/conversation/create
     */
    static async createGroup(data: CreateGroupRequest): Promise<CreateGroupResponse> {
        try {
            const response = await apiClient.post<CreateGroupResponse>(
                '/conversation/create',
                data
            );

            // 创建成功后，保存到本地存储
            if (response && response.id) {
                this.saveGroupToLocal(data.ownerId, {
                    id: response.id,
                    title: response.title,
                    ownerId: response.ownerId,
                    createdAt: response.createdAt,
                    unread: 0,
                });
            }

            return response;
        } catch (error) {
            console.error('创建群聊失败:', error);
            throw error;
        }
    }

    /**
     * 获取群成员列表
     * GET /api/conversation/{conversationId}/members
     */
    static async getGroupMembers(conversationId: number): Promise<GroupMember[]> {
        try {
            const response = await apiClient.get<GroupMember[]>(
                `/conversation/${conversationId}/members`
            );
            return response || [];
        } catch (error) {
            console.error('获取群成员列表失败:', error);
            throw error;
        }
    }

    /**
     * 解散群聊
     * POST /api/conversation/dissolve
     */
    static async dissolveGroup(data: DissolveGroupRequest): Promise<void> {
        try {
            await apiClient.post('/conversation/dissolve', data);
            // 解散成功后，从本地存储移除
            this.removeGroupFromLocal(data.conversationId);
        } catch (error) {
            console.error('解散群聊失败:', error);
            throw error;
        }
    }

    /**
     * 添加群成员
     * POST /api/conversation/addMember
     */
    static async addGroupMember(data: AddMemberRequest): Promise<void> {
        try {
            await apiClient.post('/conversation/addMember', data);
        } catch (error) {
            console.error('添加群成员失败:', error);
            throw error;
        }
    }

    /**
     * 获取群聊历史消息
     * GET /api/message/group/{conversationId}
     */
    static async getGroupMessages(conversationId: number): Promise<ChatMessage[]> {
        try {
            const response = await apiClient.get<ChatMessage[]>(
                `/message/group/${conversationId}`
            );
            return response || [];
        } catch (error) {
            console.error('获取群聊历史消息失败:', error);
            throw error;
        }
    }

    // ==================== 本地存储管理 ====================

    /**
     * 获取当前用户的群聊列表（从 localStorage）
     */
    static getLocalGroups(userId: number): GroupChat[] {
        if (typeof window === 'undefined') return [];

        try {
            const stored = localStorage.getItem('chat_groups');
            if (!stored) return [];

            const allGroups: LocalGroupChats = JSON.parse(stored);
            return allGroups[userId.toString()] || [];
        } catch (error) {
            console.error('读取本地群聊列表失败:', error);
            return [];
        }
    }

    /**
     * 保存群聊到本地存储
     */
    static saveGroupToLocal(userId: number, group: GroupChat): void {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem('chat_groups');
            const allGroups: LocalGroupChats = stored ? JSON.parse(stored) : {};

            const userGroups = allGroups[userId.toString()] || [];

            // 检查是否已存在
            const existingIndex = userGroups.findIndex(g => g.id === group.id);
            if (existingIndex >= 0) {
                userGroups[existingIndex] = group;
            } else {
                userGroups.push(group);
            }

            allGroups[userId.toString()] = userGroups;
            localStorage.setItem('chat_groups', JSON.stringify(allGroups));
        } catch (error) {
            console.error('保存群聊到本地失败:', error);
        }
    }

    /**
     * 从本地存储移除群聊
     */
    static removeGroupFromLocal(conversationId: number): void {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem('chat_groups');
            if (!stored) return;

            const allGroups: LocalGroupChats = JSON.parse(stored);

            // 从所有用户的群聊列表中移除
            Object.keys(allGroups).forEach(userId => {
                allGroups[userId] = allGroups[userId].filter(g => g.id !== conversationId);
            });

            localStorage.setItem('chat_groups', JSON.stringify(allGroups));
        } catch (error) {
            console.error('从本地移除群聊失败:', error);
        }
    }

    /**
     * 更新本地群聊的未读数和最后消息
     */
    static updateLocalGroupMessage(
        userId: number,
        conversationId: number,
        lastMessage: string,
        incrementUnread: boolean = true
    ): void {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem('chat_groups');
            if (!stored) return;

            const allGroups: LocalGroupChats = JSON.parse(stored);
            const userGroups = allGroups[userId.toString()] || [];

            const group = userGroups.find(g => g.id === conversationId);
            if (group) {
                group.lastMessage = lastMessage;
                group.lastMessageTime = new Date().toISOString();
                if (incrementUnread) {
                    group.unread = (group.unread || 0) + 1;
                }

                allGroups[userId.toString()] = userGroups;
                localStorage.setItem('chat_groups', JSON.stringify(allGroups));
            }
        } catch (error) {
            console.error('更新本地群聊消息失败:', error);
        }
    }

    /**
     * 清除本地群聊的未读数
     */
    static clearLocalGroupUnread(userId: number, conversationId: number): void {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem('chat_groups');
            if (!stored) return;

            const allGroups: LocalGroupChats = JSON.parse(stored);
            const userGroups = allGroups[userId.toString()] || [];

            const group = userGroups.find(g => g.id === conversationId);
            if (group) {
                group.unread = 0;
                allGroups[userId.toString()] = userGroups;
                localStorage.setItem('chat_groups', JSON.stringify(allGroups));
            }
        } catch (error) {
            console.error('清除群聊未读数失败:', error);
        }
    }
}