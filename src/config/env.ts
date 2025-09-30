// src/config/env.ts
export const ENV = {
  // Store Service API (游戏、购物车、订单)
  // 开发环境用 '/api' → Next.js rewrites 会代理到 8081
  STORE_API_URL: process.env.NEXT_PUBLIC_STORE_API_URL || '/api',

  // WC 开发测试专用，用户token
  DEV_TOKEN: process.env.NEXT_PUBLIC_DEV_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidGVzdHVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJhdmF0YXIiOiJodHRwczovL2V4YW1wbGUuY29tL2F2YXRhci5wbmciLCJpYXQiOjE2OTAwMDAwMDAsImV4cCI6MTk5MDAwMzYwMH0.YAQAR5si4csks7-fwd06xHOqXDGqkVxnxJJLsRD-AUY',

  // Forum/Community Service API
  // 这里如果以后也要代理，同样可以用 '/api/forum'，暂时保留直连
  FORUM_API_URL: process.env.NEXT_PUBLIC_FORUM_API_URL || 'http://127.0.0.1:8082/api',

  // 认证服务 API (登录/注册)
  AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://127.0.0.1:8080/api',

  // 应用配置
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'GameVault',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // 分页配置
  DEFAULT_PAGE_SIZE: Number(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE) || 20,
  MAX_PAGE_SIZE: Number(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE) || 100,

  // 主题
  DEFAULT_THEME: process.env.NEXT_PUBLIC_DEFAULT_THEME || 'dark',

  // 缓存
  CACHE_TIMEOUT: Number(process.env.NEXT_PUBLIC_CACHE_TIMEOUT) || 300000, // 5 分钟

  // 外部服务
  AVATAR_SERVICE_URL:
    process.env.NEXT_PUBLIC_AVATAR_SERVICE_URL ||
    'https://api.dicebear.com/7.x/avataaars/svg',

  // 环境标识
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',

  // API 超时
  API_TIMEOUT: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000, // 10 秒

  // 功能开关
  ENABLE_SEARCH: process.env.NEXT_PUBLIC_ENABLE_SEARCH !== 'false',
  ENABLE_DARK_MODE: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE !== 'false',
  ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
} as const;

if (ENV.IS_DEVELOPMENT) {
  console.log('Environment configuration:', {
    STORE_API_URL: ENV.STORE_API_URL,
    FORUM_API_URL: ENV.FORUM_API_URL,
    AUTH_API_URL: ENV.AUTH_API_URL,
  });
}

// Type for environment variables
export type EnvConfig = typeof ENV;
