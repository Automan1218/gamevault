// features/forum/services/forumApi.ts
import {Post, PostListResponse, PostsApi} from '@/lib/api/posts';
import {
    CreateForumPostRequest,
    CreateForumReplyRequest,
    ForumCategory,
    ForumPost,
    ForumPostFilter,
    ForumPostListResponse,
    ForumReply,
    ForumStats,
    GameBoard,
    UpdateForumPostRequest
} from '../types/forumTypes';
export const dynamic = 'force-dynamic';
export class ForumApi {
    // Get forum posts list (includes Forum-specific logic)
    static async getForumPosts(
        page: number = 0,
        size: number = 20,
        filter?: ForumPostFilter
    ): Promise<ForumPostListResponse> {
        try {
            // Use base API to get posts
            const response: PostListResponse = await PostsApi.getPosts(page, size);

            // Convert to Forum-specific format and add extra information
            const forumPosts: ForumPost[] = await Promise.all(
                response.posts.map(async (post) => {
                    return this.convertToForumPost(post);
                })
            );

            // Apply filters
            const filteredPosts = this.applyFilter(forumPosts, filter);

            return {
                posts: filteredPosts,
                currentPage: response.currentPage,
                pageSize: response.pageSize,
                totalCount: response.totalCount,
                totalPages: response.totalPages,
                categories: await this.getCategories()
            };
        } catch (error) {
            console.error('Failed to fetch forum posts:', error);
            throw new Error('Failed to fetch forum posts');
        }
    }

    // Get single forum post details
    static async getForumPostById(id: number): Promise<ForumPost> {
        try {
            const post = await PostsApi.getPostById(id);
            return this.convertToForumPost(post);
        } catch (error) {
            console.error(`Failed to fetch forum post ${id}:`, error);
            throw new Error('Failed to get post details');
        }
    }

    // Create forum post (includes Forum-specific logic)
    static async createForumPost(data: CreateForumPostRequest): Promise<ForumPost> {
        try {
            // Preprocess content (add category and tag information)
            const processedBody = this.preprocessPostContent(data);

            // Use base API to create post
            const post = await PostsApi.createPost({
                title: data.title,
                body: processedBody
            });

            // Convert to Forum format
            return this.convertToForumPost(post);
        } catch (error) {
            console.error('Failed to create forum post:', error);
            throw new Error('Failed to create forum post');
        }
    }

    // Update forum post
    static async updateForumPost(id: number, data: UpdateForumPostRequest): Promise<ForumPost> {
        try {
            const processedBody = data.body ? this.preprocessPostContent(data) : undefined;

            const updatedPost = await PostsApi.updatePost(id, {
                title: data.title,
                body: processedBody
            });

            return this.convertToForumPost(updatedPost);
        } catch (error) {
            console.error(`Failed to update forum post ${id}:`, error);
            throw new Error('Failed to update post');
        }
    }

    // Delete forum post
    static async deleteForumPost(id: number): Promise<void> {
        try {
            await PostsApi.deletePost(id);
        } catch (error) {
            console.error(`Failed to delete forum post ${id}:`, error);
            throw new Error('Failed to delete post');
        }
    }

    // Get hot posts (Forum-specific business logic)
    static async getHotPosts(limit: number = 10): Promise<ForumPost[]> {
        try {
            const response = await PostsApi.getPosts(0, limit * 2); // Get more data for sorting

            // Calculate hotness based on likes and replies
            const postsWithScore = response.posts.map(post => ({
                ...post,
                hotScore: this.calculateHotScore(post)
            }));

            // Sort by hotness and take top N
            const hotPosts = postsWithScore
                .sort((a, b) => b.hotScore - a.hotScore)
                .slice(0, limit);

            return Promise.all(hotPosts.map(post => this.convertToForumPost(post)));
        } catch (error) {
            console.error('Failed to fetch hot posts:', error);
            throw new Error('Failed to get hot posts');
        }
    }

    // Get user's forum posts
    static async getUserForumPosts(
        userId: number,
        page: number = 0,
        size: number = 20
    ): Promise<ForumPostListResponse> {
        try {
            const response = await PostsApi.getUserPosts(userId, page, size);

            const forumPosts = await Promise.all(
                response.posts.map(post => this.convertToForumPost(post))
            );

            return {
                posts: forumPosts,
                currentPage: response.currentPage,
                pageSize: response.pageSize,
                totalCount: response.totalCount,
                totalPages: response.totalPages
            };
        } catch (error) {
            console.error(`Failed to fetch user forum posts for user ${userId}:`, error);
            throw new Error('Failed to get user posts');
        }
    }

    // Get forum statistics
    static async getForumStats(): Promise<ForumStats> {
        try {
            // Here we can call dedicated statistics API, or aggregate multiple base APIs
            const [postsToday, onlineUsers] = await Promise.all([
                this.getTodayPostsCount(),
                this.getOnlineUsersCount()
            ]);

            return {
                todayPosts: postsToday,
                onlineUsers: onlineUsers,
                totalUsers: 12680, // Mock data, should be fetched from API in practice
                totalPosts: 45320,
                totalTopics: 8567
            };
        } catch (error) {
            console.error('Failed to fetch forum stats:', error);
            throw new Error('Failed to get forum statistics');
        }
    }

    // Get categories list
    static async getCategories(): Promise<ForumCategory[]> {
        try {
            // Here should call dedicated categories API
            // Now return mock data
            return [
                {
                    id: 'game-discussion',
                    name: 'Game Discussion',
                    description: 'Share gaming insights and discuss game plots',
                    postCount: 1234,
                    onlineUsers: 567,
                    icon: '🎮',
                    color: '#FF6B6B'
                },
                {
                    id: 'strategy-guide',
                    name: 'Strategy Guide',
                    description: 'Game strategies and tips sharing',
                    postCount: 890,
                    onlineUsers: 234,
                    icon: '📚',
                    color: '#4ECDC4'
                },
                {
                    id: 'team-up',
                    name: 'Find Teammates',
                    description: 'Team up for games and find partners',
                    postCount: 567,
                    onlineUsers: 123,
                    icon: '👥',
                    color: '#45B7D1'
                },
                {
                    id: 'tech-talk',
                    name: 'Technical Exchange',
                    description: 'Game development and technical discussions',
                    postCount: 345,
                    onlineUsers: 89,
                    icon: '💻',
                    color: '#96CEB4'
                },
                {
                    id: 'game-news',
                    name: 'Game News',
                    description: 'Latest game news and information',
                    postCount: 678,
                    onlineUsers: 145,
                    icon: '📰',
                    color: '#FFEAA7'
                },
                {
                    id: 'other',
                    name: 'Other',
                    description: 'Other related discussions',
                    postCount: 234,
                    onlineUsers: 67,
                    icon: '🌟',
                    color: '#DDA0DD'
                }
            ];
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            return [];
        }
    }

    // Get game boards
    static async getGameBoards(): Promise<GameBoard[]> {
        try {
            // const baseCategories = await this.getCategories();

            // Mock game board data
            return [
                {
                    id: 'genshin',
                    name: 'Genshin Impact',
                    description: 'Open world adventure RPG',
                    postCount: 15234,
                    onlineUsers: 892,
                    icon: '🌟',
                    color: '#FFD700',
                    gameInfo: {
                        developer: 'miHoYo',
                        releaseDate: '2020-09-28',
                        platforms: ['PC', 'Mobile', 'PS4', 'PS5'],
                        genres: ['RPG', 'Open World', 'Adventure']
                    }
                },
                {
                    id: 'honor-of-kings',
                    name: 'Honor of Kings',
                    description: '5v5 MOBA mobile game',
                    postCount: 12456,
                    onlineUsers: 765,
                    icon: '👑',
                    color: '#FF6B6B',
                    gameInfo: {
                        developer: 'TiMi Studio',
                        releaseDate: '2015-11-26',
                        platforms: ['Mobile'],
                        genres: ['MOBA', 'Strategy']
                    }
                },
                {
                    id: 'valorant',
                    name: 'Valorant',
                    description: '5v5 character-based shooter',
                    postCount: 9876,
                    onlineUsers: 543,
                    icon: '⚔️',
                    color: '#4ECDC4',
                    gameInfo: {
                        developer: 'Riot Games',
                        releaseDate: '2020-06-02',
                        platforms: ['PC'],
                        genres: ['FPS', 'Tactical Shooter']
                    }
                }
            ];
        } catch (error) {
            console.error('Failed to fetch game boards:', error);
            return [];
        }
    }

    // Search posts (Forum-specific search logic)
    static async searchForumPosts(
        keyword: string,
        filter?: ForumPostFilter,
        page: number = 0,
        size: number = 20
    ): Promise<ForumPostListResponse> {
        try {
            const response = await PostsApi.searchPosts(keyword, page, size);

            // Apply Forum-specific search post-processing
            const forumPosts = await Promise.all(
                response.posts.map(post => this.convertToForumPost(post))
            );

            const filteredPosts = this.applyFilter(forumPosts, filter);

            return {
                posts: filteredPosts,
                currentPage: response.currentPage,
                pageSize: response.pageSize,
                totalCount: response.totalCount,
                totalPages: response.totalPages
            };
        } catch (error) {
            console.error('Failed to search forum posts:', error);
            throw new Error('Failed to search forum posts');
        }
    }

    // Like post
    static async likeForumPost(postId: number): Promise<void> {
        try {
            await PostsApi.likePost(postId);
        } catch (error) {
            console.error(`Failed to like forum post ${postId}:`, error);
            throw new Error('Failed to like post');
        }
    }

    // Unlike post
    static async unlikeForumPost(postId: number): Promise<void> {
        try {
            await PostsApi.unlikePost(postId);
        } catch (error) {
            console.error(`Failed to unlike forum post ${postId}:`, error);
            throw new Error('Failed to unlike post');
        }
    }

    // Get post replies
    static async getPostReplies(postId: number, page: number = 0, size: number = 20): Promise<ForumReply[]> {
        try {
            // Should call dedicated reply API here
            // Now returning mock data
            return [];
        } catch (error) {
            console.error(`Failed to fetch replies for post ${postId}:`, error);
            throw new Error('Failed to fetch replies');
        }
    }

    // Create reply
    static async createReply(data: CreateForumReplyRequest): Promise<ForumReply> {
        try {
            // Should call dedicated reply API here
            // Now returning mock data
            throw new Error('Reply feature not implemented yet');
        } catch (error) {
            console.error('Failed to create reply:', error);
            throw new Error('Failed to create reply');
        }
    }

    // Private helper methods
    // private static async getUserAvatar(userId: number): Promise<string | undefined> {
    //     try {
    //         const user = await UsersApi.getUserById(userId);
    //         return user.avatarUrl;
    //     } catch {
    //         return undefined;
    //     }
    // }

    private static extractTags(content: string): string[] {
        // Logic to extract tags from post content
        const tagRegex = /#(\w+)/g;
        const matches = content.match(tagRegex);
        return matches ? matches.map(tag => tag.substring(1)) : [];
    }

    private static extractCategory(content: string): string | undefined {
        // Logic to extract category from post content
        const categoryRegex = /\[Category:(\w+)\]/;
        const match = content.match(categoryRegex);
        return match ? match[1] : undefined;
    }

    private static preprocessPostContent(data: CreateForumPostRequest | UpdateForumPostRequest): string {
        let content = data.body || '';

        // Add category information
        if (data.category) {
            content = `[Category:${data.category}]\n${content}`;
        }

        // Add tag information
        if (data.tags && data.tags.length > 0) {
            const tagString = data.tags.map(tag => `#${tag}`).join(' ');
            content = `${content}\n\nTags: ${tagString}`;
        }

        return content;
    }

    private static calculateHotScore(post: Post): number {
        // Hot score calculation algorithm
        const now = Date.now();
        const postTime = new Date(post.createdDate).getTime();
        const ageInHours = (now - postTime) / (1000 * 60 * 60);

        // Consider likes, replies, views and time decay
        return (
            post.likeCount * 3 +
            (post.replyCount ?? 0) * 5 +
            post.viewCount * 0.1
        ) / Math.pow(ageInHours + 2, 1.5);
    }

    private static async convertToForumPost(post: Post): Promise<ForumPost> {
        // const authorAvatar = post.authorId ? await this.getUserAvatar(post.authorId) : undefined;

        return {
            ...post,
            //authorAvatar,
            tags: this.extractTags(post.body),
            category: this.extractCategory(post.body),
            isPinned: false,
            isLocked: false,
            lastReplyAt: post.updatedDate,
            lastReplyBy: post.authorUsername,
            hotScore: this.calculateHotScore(post),
            isLiked: post.isLiked ?? false
        };
    }

    private static applyFilter(posts: ForumPost[], filter?: ForumPostFilter): ForumPost[] {
        if (!filter) return posts;

        let filtered = posts;

        if (filter.category) {
            filtered = filtered.filter(post => post.category === filter.category);
        }

        if (filter.tags && filter.tags.length > 0) {
            filtered = filtered.filter(post =>
                post.tags?.some(tag => filter.tags!.includes(tag))
            );
        }

        if (filter.authorId) {
            filtered = filtered.filter(post => post.authorId === filter.authorId);
        }

        // Time range filtering
        if (filter.timeRange && filter.timeRange !== 'all') {
            const now = new Date();
            let cutoffTime: Date;

            switch (filter.timeRange) {
                case 'today':
                    cutoffTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    cutoffTime = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                default:
                    cutoffTime = new Date(0);
            }

            filtered = filtered.filter(post =>
                new Date(post.createdDate) >= cutoffTime
            );
        }

        // Sorting
        if (filter.sortBy) {
            switch (filter.sortBy) {
                case 'popular':
                    filtered.sort((a, b) => b.likeCount - a.likeCount);
                    break;
                case 'hot':
                    filtered.sort((a, b) => (b.hotScore || 0) - (a.hotScore || 0));
                    break;
                case 'replies':
                    filtered.sort((a, b) => (b.replyCount ?? 0) - (a.replyCount ?? 0));
                    break;
                case 'latest':
                default:
                    filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
                    break;
            }
        }

        return filtered;
    }

    private static async getTodayPostsCount(): Promise<number> {
        // Simulate getting today's post count, should call dedicated API in practice
        return Math.floor(Math.random() * 200) + 50; // Random number between 50-250
    }

    private static async getOnlineUsersCount(): Promise<number> {
        // Simulate getting online user count, should call dedicated API in practice
        return Math.floor(Math.random() * 1000) + 500; // Random number between 500-1500
    }

    // Add to ForumApi class
    static async toggleLikeForumPost(postId: number): Promise<{
        liked: boolean;
        likeCount: number;
    }> {
        return PostsApi.toggleLike(postId);  // Direct reuse
    }
}