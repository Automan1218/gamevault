// src/config/env.ts
export const ENV = {
    // API Configuration
    FORUM_API_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://172.20.10.3:8081/api',

    // 第三方认证 API (仅用于登录/注册)
    AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8080/api',


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
        FORUM_API_URL: ENV.FORUM_API_URL,
        AUTH_API_URL: ENV.AUTH_API_URL,
    });
}
// Type for environment variables
export type EnvConfig = typeof ENV;