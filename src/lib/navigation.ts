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
    forumCreate: '/dashboard/forum/create',
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
    developer: "/dashboard/developer",
    devgames: "/dashboard/developer/devgames",
    devcommunity: "/dashboard/developer/devcommunity",
    devcenter: "/dashboard/developer/devcenter",

    devcenterDashboard: "/dashboard/developer/devcenter/dashboard",
    devcenterUpload: "/dashboard/developer/devcenter/upload",
    devcenterUploadForm: '/dashboard/developer/devcenter/upload/form',
    devcenterManage: "/dashboard/developer/devcenter/manage",

    // Shopping相关 - 新增（未来扩展）
    shopping: '/dashboard/shopping',
    shoppingProduct: (productId: string) => `/dashboard/shopping/${productId}`,
    shoppingCart: '/dashboard/shopping/cart',

    // 帖子相关 - 保留旧版兼容
    postCreate: '/post/create',
    postDetail: (id: number) => `/post/${id}`,
    postEdit: (id: number) => `/post/edit/${id}`,

    // 用户相关
    profile: (id: number) => `/profile/${id}`,
    myPosts: '/my-posts',
    favorites: '/favorites',
    settings: '/settings',
    notifications: '/notifications',

    // 板块相关 - 更新跳转目标
    games: '/dashboard/forum/category/games',        // 游戏板块跳转到forum的游戏分类
    community: '/dashboard/forum',                   // 社区按钮跳转到forum主页 ⭐
    ranking: '/ranking',
    news: '/news',

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

    // Developer
    "/dashboard/developer": "developer platform",
    "/dashboard/developer/devgames": "developer games",
    "/dashboard/developer/devcommunity": "developer community",
    "/dashboard/developer/devcenter": "developer center",
    "/dashboard/developer/devcenter/upload": "upload game",
    "/dashboard/developer/devcenter/upload/form": "upload form",
    "/dashboard/developer/devcenter/manage": "mange game",
    "/dashboard/developer/devcenter/dashboard": "data show",

    // Shopping相关
    '/dashboard/shopping': '商城',
    '/dashboard/shopping/cart': '购物车',

    // 旧版兼容
    '/my-posts': '我的发帖',
    '/post/create': '发布新帖',
    '/favorites': '我的收藏',
    '/settings': '设置',
    '/notifications': '通知',

    // 板块相关
    '/games': '游戏板块',
    '/community': '社区',
    '/ranking': '排行榜',
    '/news': '资讯',
};

// 导航菜单配置 - 新增
export const mainMenuItems = [
    {
        key: 'home',
        label: '首页',
        path: navigationRoutes.home,
        icon: '🏠'
    },
    {
        key: 'community',
        label: '社区',
        path: navigationRoutes.community, // 指向 /dashboard/forum
        icon: '👥'
    },
    {
        key: 'games',
        label: '游戏',
        path: navigationRoutes.games,
        icon: '🎮'
    },
    {
        key: 'ranking',
        label: '排行榜',
        path: navigationRoutes.ranking,
        icon: '🏆'
    },
    {
        key: 'news',
        label: '资讯',
        path: navigationRoutes.news,
        icon: '📰'
    }
];

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
                path: navigationRoutes.forumCreate
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