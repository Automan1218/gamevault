// types/chat.ts

/**
 * Group chat type
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
 * Friend session type (for chat list display)
 */
export interface FriendConversation {
    friendId: any;
    userId: number;
    username: string;
    email: string;
    remark?: string;
    status: 'online' | 'offline' | 'busy' | 'away';
    unread: number;
    lastMessage?: string;
    lastMessageTime?: string;
}

/**
 * Unified session type
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
 * Chat message type
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
    attachment?: MessageAttachment;
}

/**
 * Group chat member type
 */
export interface GroupMember {
    userId: number;
    username: string;
    email?: string;
    role: 'owner' | 'member';
    nickname?: string;
    joinedAt?: string;
}

// File attachment type
export interface MessageAttachment {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: 'image' | 'video' | 'audio' | 'document';
    fileExt: string;
    accessUrl?: string;
    thumbnailUrl?: string;
    downloadUrl?: string;
}

/**
 * WebSocket status
 */
export type WebSocketStatus = 'connected' | 'disconnected' | 'connecting' | 'error';