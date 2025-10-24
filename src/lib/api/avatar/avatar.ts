/**
 * Avatar related utility functions
 */
import { ENV } from '@/config/env';

/**
 * Get base URL (remove /api suffix)
 * @returns Base URL
 */
function getBaseUrl(): string {
    return ENV.AUTH_API_URL.replace('/api', '');
}

/**
 * Get complete avatar URL
 * @param avatarUrl Avatar URL (may be relative path or complete URL)
 * @param apiBaseUrl API base URL
 * @returns Complete avatar URL or undefined
 */
export function getAvatarUrl(avatarUrl?: string, apiBaseUrl?: string): string | undefined {
    if (!avatarUrl) return undefined;
    
    // If already a complete URL, return directly
    if (avatarUrl.startsWith('http')) {
        return avatarUrl;
    }
    
    // If relative path, concatenate base URL
    const baseUrl = apiBaseUrl || getBaseUrl();
    
    // Ensure path starts with /
    const path = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
    
    return `${baseUrl}${path}`;
}

/**
 * Check if avatar URL is valid
 * @param avatarUrl Avatar URL
 * @returns Whether it's a valid avatar URL
 */
export function isValidAvatarUrl(avatarUrl?: string): boolean {
    if (!avatarUrl) return false;
    
    // Check URL format
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
 * Get default avatar configuration
 * @param size Avatar size
 * @returns Default avatar style configuration
 */
export function getDefaultAvatarStyle(size: number = 32) {
    return {
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        fontSize: `${size * 0.4}px`,
    };
}

/**
 * Handle avatar loading error
 * @param error Error information
 * @param fallback Whether to use default avatar
 */
export function handleAvatarError(error: any, fallback: boolean = true) {
    console.warn('Avatar loading failed:', error);
    if (fallback) {
        console.log('Using default avatar');
    }
}
