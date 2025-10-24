// src/api/index.ts
// Unified API exports

// Import API classes first
import { AuthApi } from './auth';
import { PostsApi } from './posts';
import { UsersApi } from './users';
import { LibraryApi } from './library';
import { OrdersApi } from './orders';
import { GamesApi } from './games';
import { HomepageApi } from './homepage';

// API Clients
export { apiClient, authApiClient, shopApiClient, forumApiClient } from './client';
export { AuthApi } from './auth';
export { PostsApi } from './posts';
export { UsersApi } from './users';
export { LibraryApi } from './library';
export { OrdersApi } from './orders';
export { GamesApi } from './games';
export { HomepageApi } from './homepage';

// Types
export * from './auth';
export * from './posts';
export * from './users';
export * from './library';
export * from './orders';
export * from './games';
export * from './homepage';

// Configuration
export { ENV } from '../../config/env';

// Re-export commonly used API methods for convenience based on actual backend endpoints
export const api = {
    // Auth - authentication related
    auth: {
        login: AuthApi.login,
        register: AuthApi.register,
        logout: AuthApi.logout,
        getCurrentUser: AuthApi.getCurrentUser,
        changePassword: AuthApi.changePassword,
        changeEmail: AuthApi.changeEmail,
    },

    // Posts - based on PostController endpoints
    posts: {
        getList: PostsApi.getPosts,           // GET /api/posts
        getById: PostsApi.getPostById,        // GET /api/posts/{id}
        create: PostsApi.createPost,          // POST /api/posts
        search: PostsApi.searchPosts,         // GET /api/posts/search
        delete: PostsApi.deletePost,          // DELETE /api/posts/{id}
    },

    // Users - based on UserService methods
    users: {
        getById: UsersApi.getUserById,        // User service method
        getByUsername: UsersApi.getUserByUsername, // User service method
        checkUsername: UsersApi.checkUsernameExists, // User service method
        getBatch: UsersApi.getUsersByIds,     // User service method
    },

    // Library - user's game library
    library: {
        getLibrary: LibraryApi.getLibrary,
        searchLibrary: LibraryApi.searchLibrary,
        getGameDetails: LibraryApi.getGameDetails,
    },

    // Orders - user's orders
    orders: {
        getOrders: OrdersApi.getOrders,
        getOrderById: OrdersApi.getOrderById,
        createOrder: OrdersApi.createOrder,
        cancelOrder: OrdersApi.cancelOrder,
        getOrderStats: OrdersApi.getOrderStats,
        searchOrders: OrdersApi.searchOrders,
    },

    // Games - game catalog
    games: {
        getAll: GamesApi.getGames,
        getById: GamesApi.getGameById,
        getByGenre: GamesApi.getGamesByGenre,
        getByPlatform: GamesApi.getGamesByPlatform,
        search: GamesApi.searchGames,
    },

    // Homepage - homepage data
    homepage: {
        getStats: HomepageApi.getPlatformStats,
        getFeatured: HomepageApi.getFeaturedGames,
        getHot: HomepageApi.getHotGames,
        getOffers: HomepageApi.getSpecialOffers,
        getUpcoming: HomepageApi.getUpcomingGames,
        getCommunity: HomepageApi.getCommunityPosts,
        getDevelopers: HomepageApi.getFeaturedDevelopers,
        getFriends: HomepageApi.getFriendActivities,
        getUserStats: HomepageApi.getUserGameStats,
    },
};