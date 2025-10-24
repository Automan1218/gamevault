// ========================================
// src/lib/navigation.ts
// Navigation route configuration
// ========================================
export const dynamic = 'force-dynamic';
export const navigationRoutes = {
    // Main pages
    home: '/',
    login: '/auth/login',
    register: '/auth/login', // Same page as login, switch via tab

    // Dashboard - New main functional area
    dashboard: '/dashboard',

    // Forum related - Updated to new route structure
    forum: '/dashboard/forum',
    forumDetail: `/dashboard/forum/detail`,
    forumEdit: (id: number) => `/dashboard/forum/${id}/edit`,
    forumCategory: (categoryId: string) => `/dashboard/forum/category/${categoryId}`,
    forumSearch: '/dashboard/forum/search',
    forumHot: '/dashboard/forum/hot',
    forumLatest: '/dashboard/forum/latest',
    forumMyPosts: '/dashboard/forum/my-posts',
    forumFavorites: '/dashboard/forum/favorites',
    forumUserPosts: (userId: number) => `/dashboard/forum/user/${userId}`,

    chat: '/dashboard/chat',
    chatRoom: (roomId: string) => `/dashboard/chat/${roomId}`,
    chatCreate: '/dashboard/chat/create',

    // Developer related
    developer: '/dashboard/developer',
    devcenterUpload: "/dashboard/developer/devcenter/upload",
    devcenterUploadForm: '/dashboard/developer/devcenter/upload/form',

    developerProfile: "/dashboard/developer/profile",
    developerMyGames: "/dashboard/developer/mygames",
    developerGameHub: "/dashboard/developer/gamehub",

    // Store & Shopping related
    store: '/dashboard/store',
    shopping: '/dashboard/store',
    storeProduct: (productId: string) => `/dashboard/store/${productId}`,
    cart: '/dashboard/cart',
    checkout: '/dashboard/checkout',

    // Post related - Keep old version compatibility
    postCreate: '/dashboard/forum/create',
    postDetail: (id: number) => `/post/${id}`,
    postEdit: (id: number) => `/post/edit/${id}`,

    // User related
    profile: (id: number) => `/profile/${id}`,
    myPosts: '/dashboard/forum/profile',
    favorites: '/favorites',
    settings: '/dashboard/settings',
    notifications: '/notifications',
    library: '/dashboard/library', // Game library route
    orders: '/dashboard/orders', // Order route

    // Section related - Updated redirect targets
    games: '/dashboard/forum/category/games',        // Game section redirects to forum's game category
    shop: '/dashboard/forum/category/games',        // Game section redirects to forum's game category

    // Search
    search: (keyword: string) => `/search?q=${encodeURIComponent(keyword)}`,
    forumSearchResults: (keyword: string) => `/dashboard/forum/search?q=${encodeURIComponent(keyword)}`,
};

// Breadcrumb configuration - Extended version
export const breadcrumbConfig = {
    // Main pages
    '/': 'Home',
    '/login': 'Login',
    '/dashboard': 'Dashboard',

    // Forum related
    '/dashboard/forum': 'Forum',
    '/dashboard/forum/create': 'Create Post',
    '/dashboard/forum/hot': 'Hot Posts',
    '/dashboard/forum/latest': 'Latest Posts',
    '/dashboard/forum/my-posts': 'My Posts',
    '/dashboard/forum/favorites': 'My Favorites',
    '/dashboard/forum/search': 'Search Results',

    // Chat related
    '/dashboard/chat': 'Chat',
    '/dashboard/chat/create': 'Create Chat Room',

    // Developer related
    '/dashboard/developer': 'Developer',
    '/dashboard/developer/projects': 'Project Management',
    '/dashboard/developer/editor': 'Code Editor',

    // Shopping related
    '/dashboard/shopping': 'Store',
    '/dashboard/cart': 'Shopping Cart',
    '/dashboard/checkout': 'Checkout',

    // Legacy compatibility
    '/my-posts': 'My Posts',
    '/post/create': 'Create Post',
    '/favorites': 'My Favorites',
    '/dashboard/settings': 'Settings',
    '/dashboard/library': 'Game Library',
    '/dashboard/orders': 'Orders',
    '/notifications': 'Notifications',

    // Section related
    '/games': 'Game Section',
    '/community': 'Community',
    '/ranking': 'Rankings',
    '/news': 'News',
};

// Navigation menu configuration - New

// Dashboard submenu configuration
export const dashboardMenuItems = [
    {
        key: 'forum',
        label: 'Forum',
        path: navigationRoutes.forum,
        icon: '💬',
        children: [
            {
                key: 'forum-latest',
                label: 'Latest Posts',
                path: navigationRoutes.forumLatest
            },
            {
                key: 'forum-hot',
                label: 'Hot Posts',
                path: navigationRoutes.forumHot
            },
            {
                key: 'forum-create',
                label: 'Create Post',
                path: navigationRoutes.postCreate
            },
            {
                key: 'forum-my-posts',
                label: 'My Posts',
                path: navigationRoutes.forumMyPosts
            }
        ]
    },
    {
        key: 'chat',
        label: 'Chat',
        path: navigationRoutes.chat,
        icon: '💬'
    },
    {
        key: 'developer',
        label: 'Developer',
        path: navigationRoutes.developer,
        icon: '👨‍💻'
    },
    {
        key: 'shopping',
        label: 'Store',
        path: navigationRoutes.shopping,
        icon: '🛒'
    }
];

// Utility functions
export const getPageTitle = (path: string): string => {
    return breadcrumbConfig[path as keyof typeof breadcrumbConfig] || 'GameVault';
};

export const getLoginRedirectUrl = (targetPath?: string): string => {
    const fallback = navigationRoutes.home;
    if (!targetPath || typeof targetPath !== 'string') {
        return `${navigationRoutes.login}?redirect=${encodeURIComponent(fallback)}`;
    }

    const trimmed = targetPath.trim();
    const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed.replace(/^\/+/, '')}`;

    return `${navigationRoutes.login}?redirect=${encodeURIComponent(withLeadingSlash || fallback)}`;
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
    return path.startsWith('/dashboard/shopping') || path.startsWith('/dashboard/cart') || path.startsWith('/dashboard/checkout');
};