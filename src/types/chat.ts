// src/types/chat.ts

/**
 * 消息类型（匹配后端接口）
 */
export interface ChatMessage {
    id: number;
    senderId: number;
    receiverId?: number;        // 私聊消息才有
    conversationId?: number;    // 群聊消息才有
    content: string;
    createdAt: string;          // ISO 8601 格式
}

/**
 * 好友信息
 */
export interface Friend {
    userId: number;
    username: string;
    nickname?: string;
    avatar?: string;
    status?: 'online' | 'offline';  // 前端模拟
    unread?: number;                // 前端统计
    lastMessage?: string;           // 前端维护
    lastMessageTime?: string;       // 前端维护
}

/**
 * 群聊信息
 */
export interface GroupChat {
    id: number;                 // conversationId
    title: string;
    ownerId: number;
    createdAt?: string;
    unread?: number;            // 前端统计
    lastMessage?: string;       // 前端维护
    lastMessageTime?: string;   // 前端维护
}

/**
 * 群成员信息
 */
export interface GroupMember {
    userId: number;
    username: string;
    nickname?: string;
    avatar?: string;
    role: 'owner' | 'member';
    joinedAt?: string;
}

/**
 * 会话类型（统一私聊和群聊）
 */
export interface Conversation {
    id: string;                 // 格式：'private-{userId}' 或 'group-{conversationId}'
    type: 'private' | 'group';
    name: string;
    avatar?: string;
    unread: number;
    lastMessage?: string;
    lastMessageTime?: string;
    data: Friend | GroupChat;   // 原始数据
}

/**
 * 创建群聊请求
 */
export interface CreateGroupRequest {
    title: string;
    ownerId: number;
}

/**
 * 创建群聊响应
 */
export interface CreateGroupResponse {
    id: number;
    title: string;
    ownerId: number;
    createdAt: string;
}

/**
 * 添加成员请求
 */
export interface AddMemberRequest {
    conversationId: number;
    userId: number;
}

/**
 * 解散群聊请求
 */
export interface DissolveGroupRequest {
    conversationId: number;
}

/**
 * WebSocket 消息载荷（发送私聊消息）
 */
export interface PrivateMessagePayload {
    senderId: number;
    receiverId: number;
    content: string;
}

/**
 * WebSocket 消息载荷（发送群聊消息）
 */
export interface GroupMessagePayload {
    senderId: number;
    conversationId: number;
    content: string;
}

/**
 * 本地存储的群聊列表
 */
export interface LocalGroupChats {
    [userId: string]: GroupChat[];  // key: userId, value: 用户的群聊列表
}

/**
 * WebSocket 连接状态
 */
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';