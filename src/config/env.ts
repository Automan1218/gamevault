// src/config/env.ts
export const ENV = {
    // API Configuration
    AUTH_API_URL: 'http://localhost:8080/api',
    // 论坛服务用你自己的
    FORUM_API_URL: 'http://localhost:8080/api',

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

// Type for environment variables
export type EnvConfig = typeof ENV;