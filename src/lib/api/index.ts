// src/api/index.ts
// Unified API exports

// Import API classes first
import { PostsApi } from './posts';
import { UsersApi } from './users';

// API Clients
export { apiClient } from './client';
export { PostsApi } from './posts';
export { UsersApi } from './users';

// Types
export * from './posts';
export * from './users';

// Configuration
export { ENV } from '../../config/env';

// Re-export commonly used API methods for convenience based on actual backend endpoints
export const api = {
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
        // getActive: UsersApi.getActiveUsers,   // User service method
        checkUsername: UsersApi.checkUsernameExists, // User service method
        getBatch: UsersApi.getUsersByIds,     // User service method
    },
};