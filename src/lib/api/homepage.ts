import { apiClient } from './client';
import { GamesApi, Game } from './games';
import { PostsApi, Post } from './posts';

// Homepage data interface
export interface HomepageStats {
    totalGames: number;
    activeUsers: number;
    developers: number;
    totalDownloads: number;
}

export interface FeaturedGame extends Game {
    discount?: number;
    players?: string;
}

export interface HotGame extends Game {
    isNew?: boolean;
    isHot?: boolean;
    rating?: number;
    players?: string;
}

export interface SpecialOffer extends Game {
    originalPrice: number;
    discount: number;
    endTime: string;
    rating?: number;
}

export interface UpcomingGame {
    gameId: number;
    title: string;
    cover: string;
    releaseDate: string;
    preOrderPrice: number;
    tags: string[];
    wishlist: number;
    developer: string;
    genre?: string;
    platform?: string;
}

export interface CommunityPost {
    id: number;
    author: string;
    avatar?: string;
    content: string;
    game: string;
    likes: number;
    comments: number;
    time: string;
}

export interface FeaturedDeveloper {
    id: number;
    name: string;
    avatar?: string;
    games: number;
    followers: number;
    description: string;
    featuredGame: string;
}

export interface FriendActivity {
    name: string;
    game: string;
    status: string;
    time: string;
}

export interface UserGameStats {
    totalGames: number;
    achievements: number;
    level: number;
    xp: number;
    nextLevelXp: number;
}

export class HomepageApi {
    /**
     * Get platform statistics
     */
    static async getPlatformStats(): Promise<HomepageStats> {
        try {
            // Using estimated values here, as backend may not have dedicated statistics API
            // Should actually call backend statistics API
            const games = await GamesApi.getGames();
            
            return {
                totalGames: games.length,
                activeUsers: 892000, // Mock data
                developers: 1250, // Mock data
                totalDownloads: 15600000 // Mock data
            };
        } catch (error) {
            console.error('Failed to fetch platform stats:', error);
            // Return default values instead of throwing error
            return {
                totalGames: 0,
                activeUsers: 0,
                developers: 0,
                totalDownloads: 0
            };
        }
    }

    /**
     * Get featured games (games with biggest discounts)
     */
    static async getFeaturedGames(): Promise<FeaturedGame[]> {
        try {
            const games = await GamesApi.getGames();
            
            // Calculate discount and sort
            const gamesWithDiscount = games
                .filter(game => game.discountPrice && game.discountPrice < game.price)
                .map(game => ({
                    ...game,
                    discount: Math.round(((game.price - (game.discountPrice || game.price)) / game.price) * 100),
                    players: '1M+' // Mock data
                }))
                .sort((a, b) => (b.discount || 0) - (a.discount || 0))
                .slice(0, 3);
            
            return gamesWithDiscount;
        } catch (error) {
            console.error('Failed to fetch featured games:', error);
            return [];
        }
    }

    /**
     * Get hot games
     */
    static async getHotGames(): Promise<HotGame[]> {
        try {
            const games = await GamesApi.getGames();
            
            // Sort by price and discount, simulate hot games
            const hotGames = games
                .slice(0, 4)
                .map((game, index) => ({
                    ...game,
                    isNew: index === 0,
                    isHot: index < 2,
                    rating: 4.5 + (Math.random() * 0.4), // Random rating between 4.5-4.9
                    players: index === 0 ? '1M+' : index === 1 ? '500K+' : index === 2 ? '300K+' : '800K+'
                }));
            
            return hotGames;
        } catch (error) {
            console.error('Failed to fetch hot games:', error);
            return [];
        }
    }

    /**
     * Get special offers
     */
    static async getSpecialOffers(): Promise<SpecialOffer[]> {
        try {
            const games = await GamesApi.getGames();
            
            // Find games with discounts
            const offers = games
                .filter(game => game.discountPrice && game.discountPrice < game.price)
                .map(game => ({
                    ...game,
                    originalPrice: game.price,
                    discount: Math.round(((game.price - (game.discountPrice || game.price)) / game.price) * 100),
                    endTime: ['24h', '36h', '48h'][Math.floor(Math.random() * 3)],
                    rating: 4.5 + (Math.random() * 0.4)
                }))
                .sort((a, b) => b.discount - a.discount)
                .slice(0, 3);
            
            return offers;
        } catch (error) {
            console.error('Failed to fetch special offers:', error);
            return [];
        }
    }

    /**
     * Get upcoming games
     */
    static async getUpcomingGames(): Promise<UpcomingGame[]> {
        try {
            const games = await GamesApi.getGames();
            
            // Select newest games as upcoming
            const upcomingGames = games
                .slice(-2)
                .map((game, index) => ({
                    gameId: game.gameId,
                    title: game.title,
                    cover: game.imageUrl || '',
                    releaseDate: index === 0 ? 'March 21, 2025' : 'April 15, 2025',
                    preOrderPrice: game.price,
                    tags: game.genre ? [game.genre, game.platform] : [],
                    wishlist: index === 0 ? 125000 : 89000,
                    developer: game.developer,
                    genre: game.genre,
                    platform: game.platform
                }));
            
            return upcomingGames;
        } catch (error) {
            console.error('Failed to fetch upcoming games:', error);
            return [];
        }
    }

    /**
     * Get community posts
     */
    static async getCommunityPosts(): Promise<CommunityPost[]> {
        try {
            const postResponse = await PostsApi.getPosts(0, 3);
            
            // Convert forum posts to community activity format
            const posts = postResponse.posts.map((post: Post) => {
                return {
                    id: post.contentId,
                    author: post.authorName || post.authorNickname || post.authorUsername || `User${post.authorId}`,
                    avatar: post.authorAvatar,
                    content: post.bodyPlain || post.title,
                    game: post.title.split(' - ')[0] || post.title, // Try to extract game name
                    likes: post.likeCount || 0,
                    comments: post.replyCount || 0,
                    time: this.getRelativeTime(post.createdDate)
                };
            });
            
            return posts;
        } catch (error) {
            console.error('Failed to fetch community posts:', error);
            return [];
        }
    }

    /**
     * Get featured developers
     */
    static async getFeaturedDevelopers(): Promise<FeaturedDeveloper[]> {
        try {
            const games = await GamesApi.getGames();
            
            // Group by developer
            const developerMap = new Map<string, { count: number; game: Game }>();
            games.forEach(game => {
                if (game.developer) {
                    const existing = developerMap.get(game.developer);
                    if (existing) {
                        existing.count++;
                    } else {
                        developerMap.set(game.developer, { count: 1, game });
                    }
                }
            });
            
            // Convert to developer list and sort
            const developers: FeaturedDeveloper[] = Array.from(developerMap.entries())
                .map(([name, data], index) => ({
                    id: index + 1,
                    name,
                    games: data.count,
                    followers: (data.count * 50000) + Math.floor(Math.random() * 50000),
                    description: `Specialized in ${data.game.genre || 'game'} development`,
                    featuredGame: data.game.title,
                    avatar: undefined
                }))
                .sort((a, b) => b.games - a.games)
                .slice(0, 3);
            
            return developers;
        } catch (error) {
            console.error('Failed to fetch featured developers:', error);
            return [];
        }
    }

    /**
     * Get friend activities (requires login)
     */
    static async getFriendActivities(): Promise<FriendActivity[]> {
        try {
            // Temporarily return empty array, as backend may not have friend activity API
            // Should actually call friend-related API
            return [];
        } catch (error) {
            console.error('Failed to fetch friend activities:', error);
            return [];
        }
    }

    /**
     * Get user game statistics (requires login)
     */
    static async getUserGameStats(): Promise<UserGameStats | null> {
        try {
            // Should call backend user statistics API here
            // Temporarily return null, indicating not logged in or no data
            const response = await apiClient.authenticatedRequest<{
                items: any[];
            }>('/library', undefined, { method: 'GET' });
            
            const totalGames = response.items?.length || 0;
            
            return {
                totalGames,
                achievements: totalGames * 12, // Assume 12 achievements per game on average
                level: Math.floor(totalGames / 4) + 1,
                xp: totalGames * 250,
                nextLevelXp: (Math.floor(totalGames / 4) + 2) * 1000
            };
        } catch (error) {
            console.error('Failed to fetch user game stats:', error);
            return null;
        }
    }

    /**
     * Get user avatar (by user ID)
     */
    private static async getUserAvatar(userId: number): Promise<string | undefined> {
        try {
            // Temporarily return undefined, as backend doesn't have API to get avatar by user ID
            // Can add backend API support later
            return undefined;
        } catch (error) {
            console.warn(`Failed to get avatar for user ${userId}:`, error);
            return undefined;
        }
    }

    /**
     * Calculate relative time
     */
    private static getRelativeTime(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return `${seconds}s ago`;
    }
}

