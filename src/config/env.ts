// src/config/env.ts
const BASE_URL = 'http://52.77.169.8:30132';

export const ENV = {
    AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || `${BASE_URL}/api`,
    // 商城
    SHOP_API_URL: `${BASE_URL}/api`,
    // 论坛
    FORUM_API_URL: `${BASE_URL}/api`,
    // 聊天室
    CHATROOM_API_URL: `${BASE_URL}/api`,
    // 文件服务
    FILE_API_URL: `${BASE_URL}/api`,
    WS_URL:  BASE_URL,
    DEVGAMES_API_URL: `${BASE_URL}/api/developer`,

    // Application Configuration
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'GameVault',
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

    // Pagination Configuration
    DEFAULT_PAGE_SIZE: Number(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE) || 20,
    MAX_PAGE_SIZE: Number(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE) || 100,

    // Theme Configuration
    DEFAULT_THEME: process.env.NEXT_PUBLIC_DEFAULT_THEME || 'dark',

    // Cache Configuration
    CACHE_TIMEOUT: Number(process.env.NEXT_PUBLIC_CACHE_TIMEOUT) || 300000, // 5 minutes

    // External Services
    AVATAR_SERVICE_URL: process.env.NEXT_PUBLIC_AVATAR_SERVICE_URL || 'https://api.dicebear.com/7.x/avataaars/svg',

    // Development Configuration
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',

    // API Timeouts
    API_TIMEOUT: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000, // 10 seconds

    // Feature Flags
    ENABLE_SEARCH: process.env.NEXT_PUBLIC_ENABLE_SEARCH !== 'false',
    ENABLE_DARK_MODE: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE !== 'false',
    ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
} as const;
if (process.env.NODE_ENV === 'development') {
    console.log('Environment configuration:', {
        AUTH_API_URL: ENV.AUTH_API_URL,
        SHOP_API_URL: ENV.SHOP_API_URL,
        FORUM_API_URL: ENV.FORUM_API_URL,
        CHATROOM_API_URL: ENV.CHATROOM_API_URL,
        WS_URL: ENV.WS_URL,
    });
}
// Type for environment variables
export type EnvConfig = typeof ENV;