// types/chat.ts

/**
 * 群聊类型
 */
export interface GroupChat {
    id: number;
    title: string;
    ownerId: number;
    unread: number;
    lastMessage: string;
    lastMessageTime?: string;
    status?: string;
    createdAt?: string;
}

/**
 * 好友会话类型（用于聊天列表显示）
 */
export interface FriendConversation {
    friendId: any;
    uid: number;
    username: string;
    email: string;
    remark?: string;
    status: 'online' | 'offline' | 'busy' | 'away';
    unread: number;
    lastMessage?: string;
    lastMessageTime?: string;
}

/**
 * 统一会话类型
 */
export interface Conversation {
    id: string;
    type: 'group' | 'private';
    name: string;
    avatar?: string;
    unread?: number;
    lastMessage?: string;
    lastMessageTime?: string;
    data: GroupChat | FriendConversation;
}

/**
 * 聊天消息类型
 */
export interface ChatMessage {
    id: number;
    senderId: number;
    receiverId?: number;
    conversationId?: number;
    senderUsername?: string;
    senderEmail?: string;
    content: string;
    messageType?: string;
    chatType?: 'group' | 'private';
    createdAt: string;
    timestamp?: string;
}

/**
 * 群聊成员类型
 */
export interface GroupMember {
    userId: number;
    username: string;
    email?: string;
    role: 'owner' | 'member';
    nickname?: string;
    joinedAt?: string;
}

/**
 * WebSocket 状态
 */
export type WebSocketStatus = 'connected' | 'disconnected' | 'connecting' | 'error';