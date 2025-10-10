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
import {apiClient} from "@/lib/api";

export class ForumApi {
    // 获取论坛帖子列表（包含Forum特定逻辑）
    static async getForumPosts(
        page: number = 0,
        size: number = 20,
        filter?: ForumPostFilter
    ): Promise<ForumPostListResponse> {
        try {
            // 使用基础API获取帖子
            const response: PostListResponse = await PostsApi.getPosts(page, size);

            // 转换为Forum特定格式并添加额外信息
            const forumPosts: ForumPost[] = await Promise.all(
                response.posts.map(async (post) => {
                    return this.convertToForumPost(post);
                })
            );

            // 应用过滤器
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
            throw new Error('获取论坛帖子失败');
        }
    }

    // 获取单个论坛帖子详情
    static async getForumPostById(id: number): Promise<ForumPost> {
        try {
            const post = await PostsApi.getPostById(id);
            return this.convertToForumPost(post);
        } catch (error) {
            console.error(`Failed to fetch forum post ${id}:`, error);
            throw new Error('获取帖子详情失败');
        }
    }

    // 创建论坛帖子（包含Forum特定逻辑）
    static async createForumPost(data: CreateForumPostRequest): Promise<ForumPost> {
        try {
            // 预处理内容（添加分类和标签信息）
            const processedBody = this.preprocessPostContent(data);

            // 使用基础API创建帖子
            const post = await PostsApi.createPost({
                title: data.title,
                body: processedBody
            });

            // 转换为Forum格式
            return this.convertToForumPost(post);
        } catch (error) {
            console.error('Failed to create forum post:', error);
            throw new Error('创建论坛帖子失败');
        }
    }

    // 更新论坛帖子
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
            throw new Error('更新帖子失败');
        }
    }

    // 删除论坛帖子
    static async deleteForumPost(id: number): Promise<void> {
        try {
            await PostsApi.deletePost(id);
        } catch (error) {
            console.error(`Failed to delete forum post ${id}:`, error);
            throw new Error('删除帖子失败');
        }
    }

    // 获取热门帖子（Forum特定业务逻辑）
    static async getHotPosts(limit: number = 10): Promise<ForumPost[]> {
        try {
            const response = await PostsApi.getPosts(0, limit * 2); // 获取更多数据用于排序

            // 根据点赞数和回复数计算热度
            const postsWithScore = response.posts.map(post => ({
                ...post,
                hotScore: this.calculateHotScore(post)
            }));

            // 按热度排序并取前N个
            const hotPosts = postsWithScore
                .sort((a, b) => b.hotScore - a.hotScore)
                .slice(0, limit);

            return Promise.all(hotPosts.map(post => this.convertToForumPost(post)));
        } catch (error) {
            console.error('Failed to fetch hot posts:', error);
            throw new Error('获取热门帖子失败');
        }
    }

    // 获取用户的论坛帖子
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
            throw new Error('获取用户帖子失败');
        }
    }

    // 获取论坛统计信息
    static async getForumStats(): Promise<ForumStats> {
        try {
            // 这里可以调用专门的统计API，或者聚合多个基础API
            const [postsToday, onlineUsers] = await Promise.all([
                this.getTodayPostsCount(),
                this.getOnlineUsersCount()
            ]);

            return {
                todayPosts: postsToday,
                onlineUsers: onlineUsers,
                totalUsers: 12680, // 模拟数据，实际应从API获取
                totalPosts: 45320,
                totalTopics: 8567
            };
        } catch (error) {
            console.error('Failed to fetch forum stats:', error);
            throw new Error('获取论坛统计失败');
        }
    }

    // 获取分类列表
    static async getCategories(): Promise<ForumCategory[]> {
        try {
            // 这里应该调用专门的分类API
            // 现在返回模拟数据
            return [
                {
                    id: 'game-discussion',
                    name: '游戏讨论',
                    description: '分享游戏心得、讨论游戏剧情',
                    postCount: 1234,
                    onlineUsers: 567,
                    icon: '🎮',
                    color: '#FF6B6B'
                },
                {
                    id: 'strategy-guide',
                    name: '攻略指南',
                    description: '游戏攻略、技巧分享',
                    postCount: 890,
                    onlineUsers: 234,
                    icon: '📚',
                    color: '#4ECDC4'
                },
                {
                    id: 'team-up',
                    name: '寻找队友',
                    description: '组队游戏、寻找伙伴',
                    postCount: 567,
                    onlineUsers: 123,
                    icon: '👥',
                    color: '#45B7D1'
                },
                {
                    id: 'tech-talk',
                    name: '技术交流',
                    description: '游戏开发、技术讨论',
                    postCount: 345,
                    onlineUsers: 89,
                    icon: '💻',
                    color: '#96CEB4'
                },
                {
                    id: 'game-news',
                    name: '游戏资讯',
                    description: '最新游戏资讯、新闻',
                    postCount: 678,
                    onlineUsers: 145,
                    icon: '📰',
                    color: '#FFEAA7'
                },
                {
                    id: 'other',
                    name: '其他',
                    description: '其他相关讨论',
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

    // 获取游戏板块
    static async getGameBoards(): Promise<GameBoard[]> {
        try {
            // const baseCategories = await this.getCategories();

            // 模拟游戏板块数据
            return [
                {
                    id: 'genshin',
                    name: '原神',
                    description: '开放世界冒险RPG',
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
                    name: '王者荣耀',
                    description: '5v5王者对战手游',
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
                    name: '无畏契约',
                    description: '5v5角色射击游戏',
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

    // 搜索帖子（Forum特定搜索逻辑）
    static async searchForumPosts(
        keyword: string,
        filter?: ForumPostFilter,
        page: number = 0,
        size: number = 20
    ): Promise<ForumPostListResponse> {
        try {
            const response = await PostsApi.searchPosts(keyword, page, size);

            // 应用Forum特定的搜索后处理
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
            throw new Error('搜索论坛帖子失败');
        }
    }

    // 点赞帖子
    static async likeForumPost(postId: number): Promise<void> {
        try {
            await PostsApi.likePost(postId);
        } catch (error) {
            console.error(`Failed to like forum post ${postId}:`, error);
            throw new Error('点赞失败');
        }
    }

    // 取消点赞
    static async unlikeForumPost(postId: number): Promise<void> {
        try {
            await PostsApi.unlikePost(postId);
        } catch (error) {
            console.error(`Failed to unlike forum post ${postId}:`, error);
            throw new Error('取消点赞失败');
        }
    }

    // 获取帖子回复
    static async getPostReplies(postId: number, page: number = 0, size: number = 20): Promise<ForumReply[]> {
        try {
            // 这里应该调用专门的回复API
            // 现在返回模拟数据
            return [];
        } catch (error) {
            console.error(`Failed to fetch replies for post ${postId}:`, error);
            throw new Error('获取回复失败');
        }
    }

    // 创建回复
    static async createReply(data: CreateForumReplyRequest): Promise<ForumReply> {
        try {
            // 这里应该调用专门的回复API
            // 现在返回模拟数据
            throw new Error('回复功能暂未实现');
        } catch (error) {
            console.error('Failed to create reply:', error);
            throw new Error('创建回复失败');
        }
    }

    // 私有辅助方法
    // private static async getUserAvatar(userId: number): Promise<string | undefined> {
    //     try {
    //         const user = await UsersApi.getUserById(userId);
    //         return user.avatarUrl;
    //     } catch {
    //         return undefined;
    //     }
    // }

    private static extractTags(content: string): string[] {
        // 从帖子内容中提取标签的逻辑
        const tagRegex = /#(\w+)/g;
        const matches = content.match(tagRegex);
        return matches ? matches.map(tag => tag.substring(1)) : [];
    }

    private static extractCategory(content: string): string | undefined {
        // 从帖子内容中提取分类的逻辑
        const categoryRegex = /\[分类:(\w+)\]/;
        const match = content.match(categoryRegex);
        return match ? match[1] : undefined;
    }

    private static preprocessPostContent(data: CreateForumPostRequest | UpdateForumPostRequest): string {
        let content = data.body || '';

        // 添加分类信息
        if (data.category) {
            content = `[分类:${data.category}]\n${content}`;
        }

        // 添加标签信息
        if (data.tags && data.tags.length > 0) {
            const tagString = data.tags.map(tag => `#${tag}`).join(' ');
            content = `${content}\n\n标签: ${tagString}`;
        }

        return content;
    }

    private static calculateHotScore(post: Post): number {
        // 热度计算算法
        const now = Date.now();
        const postTime = new Date(post.createdDate).getTime();
        const ageInHours = (now - postTime) / (1000 * 60 * 60);

        // 综合考虑点赞数、回复数、浏览数和时间衰减
        return (
            post.likeCount * 3 +
            post.replyCount * 5 +
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
            hotScore: this.calculateHotScore(post)
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

        // 时间范围过滤
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

        // 排序
        if (filter.sortBy) {
            switch (filter.sortBy) {
                case 'popular':
                    filtered.sort((a, b) => b.likeCount - a.likeCount);
                    break;
                case 'hot':
                    filtered.sort((a, b) => (b.hotScore || 0) - (a.hotScore || 0));
                    break;
                case 'replies':
                    filtered.sort((a, b) => b.replyCount - a.replyCount);
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
        // 模拟获取今日帖子数，实际应该调用专门的API
        return Math.floor(Math.random() * 200) + 50; // 50-250之间的随机数
    }

    private static async getOnlineUsersCount(): Promise<number> {
        // 模拟获取在线用户数，实际应该调用专门的API
        return Math.floor(Math.random() * 1000) + 500; // 500-1500之间的随机数
    }

    // 在 ForumApi 类中添加
    static async toggleLikeForumPost(postId: number): Promise<{
        liked: boolean;
        likeCount: number;
    }> {
        return PostsApi.toggleLike(postId);  // 直接复用
    }
}