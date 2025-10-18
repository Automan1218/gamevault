/**
 * 头像相关工具函数
 */
import { ENV } from '@/config/env';

/**
 * 获取基础URL（去除/api后缀）
 * @returns 基础URL
 */
function getBaseUrl(): string {
    return ENV.AUTH_API_URL.replace('/api', '');
}

/**
 * 获取完整的头像URL
 * @param avatarUrl 头像URL（可能是相对路径或完整URL）
 * @param apiBaseUrl API基础URL
 * @returns 完整的头像URL或undefined
 */
export function getAvatarUrl(avatarUrl?: string, apiBaseUrl?: string): string | undefined {
    if (!avatarUrl) return undefined;
    
    // 如果已经是完整URL，直接返回
    if (avatarUrl.startsWith('http')) {
        return avatarUrl;
    }
    
    // 如果是相对路径，拼接基础URL
    const baseUrl = apiBaseUrl || getBaseUrl();
    
    // 确保路径以 / 开头
    const path = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
    
    return `${baseUrl}${path}`;
}

/**
 * 检查头像URL是否有效
 * @param avatarUrl 头像URL
 * @returns 是否为有效的头像URL
 */
export function isValidAvatarUrl(avatarUrl?: string): boolean {
    if (!avatarUrl) return false;
    
    // 检查URL格式
    try {
        const baseUrl = getBaseUrl();
        const path = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
        const url = new URL(avatarUrl.startsWith('http') ? avatarUrl : `${baseUrl}${path}`);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * 获取默认头像配置
 * @param size 头像大小
 * @returns 默认头像的样式配置
 */
export function getDefaultAvatarStyle(size: number = 32) {
    return {
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        fontSize: `${size * 0.4}px`,
    };
}

/**
 * 处理头像加载错误
 * @param error 错误信息
 * @param fallback 是否使用默认头像
 */
export function handleAvatarError(error: any, fallback: boolean = true) {
    console.warn('头像加载失败:', error);
    if (fallback) {
        console.log('使用默认头像');
    }
}
