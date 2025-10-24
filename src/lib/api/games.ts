import { apiClient } from './client';

// Game related interfaces
export interface Game {
    gameId: number;
    title: string;
    developer: string;
    description: string;
    price: number;
    discountPrice?: number;
    genre: string;
    platform: string;
    releaseDate: string;
    isActive: boolean;
    imageUrl?: string;
}

export class GamesApi {
    /**
     * Get all games
     * GET /api/games
     */
    static async getGames(): Promise<Game[]> {
        try {
            return await apiClient.get<Game[]>('/games');
        } catch (error) {
            console.error('Failed to fetch games:', error);
            throw new Error('Failed to get games list');
        }
    }

    /**
     * Search games by type
     * GET /api/games?genre={genre}
     */
    static async getGamesByGenre(genre: string): Promise<Game[]> {
        try {
            return await apiClient.get<Game[]>('/games', { genre });
        } catch (error) {
            console.error('Failed to fetch games by genre:', error);
            throw new Error('Failed to search games by type');
        }
    }

    /**
     * Search games by platform
     * GET /api/games?platform={platform}
     */
    static async getGamesByPlatform(platform: string): Promise<Game[]> {
        try {
            return await apiClient.get<Game[]>('/games', { platform });
        } catch (error) {
            console.error('Failed to fetch games by platform:', error);
            throw new Error('Failed to search games by platform');
        }
    }

    /**
     * Search games
     * GET /api/games?q={keyword}
     */
    static async searchGames(keyword: string): Promise<Game[]> {
        try {
            return await apiClient.get<Game[]>('/games', { q: keyword });
        } catch (error) {
            console.error('Failed to search games:', error);
            throw new Error('Failed to search games');
        }
    }

    /**
     * Get single game details
     * GET /api/games/{id}
     */
    static async getGameById(id: number): Promise<Game> {
        try {
            return await apiClient.get<Game>(`/games/${id}`);
        } catch (error) {
            console.error('Failed to fetch game:', error);
            throw new Error('Failed to get game details');
        }
    }
}

// Export API instance
export const gameApi = GamesApi;

