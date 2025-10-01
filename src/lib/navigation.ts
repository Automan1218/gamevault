// ========================================
// src/lib/navigation.ts
// 导航路由配置
// ========================================

export const navigationRoutes = {
    // 主要页面
    home: '/',
    login: '/auth/login',
    register: '/auth/login', // 和登录同页面，通过 tab 切换

    // Dashboard - 新增的主要功能区域
    dashboard: '/dashboard',

    // Forum相关 - 更新为新的路由结构
    forum: '/dashboard/forum',
    forumDetail: (id: number) => `/dashboard/forum/${id}`,
    forumEdit: (id: number) => `/dashboard/forum/${id}/edit`,
    forumCategory: (categoryId: string) => `/dashboard/forum/category/${categoryId}`,
    forumSearch: '/dashboard/forum/search',
    forumHot: '/dashboard/forum/hot',
    forumLatest: '/dashboard/forum/latest',
    forumMyPosts: '/dashboard/forum/my-posts',
    forumFavorites: '/dashboard/forum/favorites',
    forumUserPosts: (userId: number) => `/dashboard/forum/user/${userId}`,

    // Chat相关 - 新增
    chat: '/dashboard/chat',
    chatRoom: (roomId: string) => `/dashboard/chat/${roomId}`,
    chatCreate: '/dashboard/chat/create',

    // Developer相关 - 新增
    developer: '/dashboard/developer',
    developerProfile: (userId: string) => `/dashboard/developer/${userId}`,
    developerProjects: '/dashboard/developer/projects',
    developerEditor: '/dashboard/developer/editor',

    // Shopping相关 - 新增（未来扩展）
    shopping: '/dashboard/shopping',
    shoppingProduct: (productId: string) => `/dashboard/shopping/${productId}`,
    shoppingCart: '/dashboard/shopping/cart',

    // 帖子相关 - 保留旧版兼容
    postCreate: '/dashboard/forum/create',
    postDetail: (id: number) => `/post/${id}`,
    postEdit: (id: number) => `/post/edit/${id}`,

    // 用户相关
    profile: (id: number) => `/profile/${id}`,
    myPosts: '/dashboard/forum/profile',
    favorites: '/favorites',
    settings: '/dashboard/settings',
    notifications: '/notifications',
    library: '/dashboard/library', // 游戏库路由
    orders: '/dashboard/orders', // 订单路由

    // 板块相关 - 更新跳转目标
    games: '/dashboard/forum/category/games',        // 游戏板块跳转到forum的游戏分类
    shop: '/dashboard/forum/category/games',        // 游戏板块跳转到forum的游戏分类




    // 搜索
    search: (keyword: string) => `/search?q=${encodeURIComponent(keyword)}`,
    forumSearchResults: (keyword: string) => `/dashboard/forum/search?q=${encodeURIComponent(keyword)}`,
};

// 面包屑配置 - 扩展版本
export const breadcrumbConfig = {
    // 主要页面
    '/': '首页',
    '/login': '登录',
    '/dashboard': '控制台',

    // Forum相关
    '/dashboard/forum': '论坛',
    '/dashboard/forum/create': '发布新帖',
    '/dashboard/forum/hot': '热门帖子',
    '/dashboard/forum/latest': '最新帖子',
    '/dashboard/forum/my-posts': '我的发帖',
    '/dashboard/forum/favorites': '我的收藏',
    '/dashboard/forum/search': '搜索结果',

    // Chat相关
    '/dashboard/chat': '聊天',
    '/dashboard/chat/create': '创建聊天室',

    // Developer相关
    '/dashboard/developer': '开发者',
    '/dashboard/developer/projects': '项目管理',
    '/dashboard/developer/editor': '代码编辑器',

    // Shopping相关
    '/dashboard/shopping': '商城',
    '/dashboard/shopping/cart': '购物车',

    // 旧版兼容
    '/my-posts': '我的发帖',
    '/post/create': '发布新帖',
    '/favorites': '我的收藏',
    '/dashboard/settings': '设置',
    '/dashboard/library': '游戏库',
    '/dashboard/orders': '订单',
    '/notifications': '通知',

    // 板块相关
    '/games': '游戏板块',
    '/community': '社区',
    '/ranking': '排行榜',
    '/news': '资讯',
};

// 导航菜单配置 - 新增

// Dashboard子菜单配置
export const dashboardMenuItems = [
    {
        key: 'forum',
        label: '论坛',
        path: navigationRoutes.forum,
        icon: '💬',
        children: [
            {
                key: 'forum-latest',
                label: '最新帖子',
                path: navigationRoutes.forumLatest
            },
            {
                key: 'forum-hot',
                label: '热门帖子',
                path: navigationRoutes.forumHot
            },
            {
                key: 'forum-create',
                label: '发布新帖',
                path: navigationRoutes.postCreate
            },
            {
                key: 'forum-my-posts',
                label: '我的发帖',
                path: navigationRoutes.forumMyPosts
            }
        ]
    },
    {
        key: 'chat',
        label: '聊天',
        path: navigationRoutes.chat,
        icon: '💬'
    },
    {
        key: 'developer',
        label: '开发者',
        path: navigationRoutes.developer,
        icon: '👨‍💻'
    },
    {
        key: 'shopping',
        label: '商城',
        path: navigationRoutes.shopping,
        icon: '🛒'
    }
];

// 工具函数
export const getPageTitle = (path: string): string => {
    return breadcrumbConfig[path as keyof typeof breadcrumbConfig] || 'GameVault';
};

export const isForumRoute = (path: string): boolean => {
    return path.startsWith('/dashboard/forum') || path.startsWith('/post/') || path === '/my-posts' || path === '/favorites';
};

export const isChatRoute = (path: string): boolean => {
    return path.startsWith('/dashboard/chat');
};

export const isDeveloperRoute = (path: string): boolean => {
    return path.startsWith('/dashboard/developer');
};

export const isShoppingRoute = (path: string): boolean => {
    return path.startsWith('/dashboard/shopping');
};