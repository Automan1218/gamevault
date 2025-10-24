// src/lib/api/library.ts
import { apiClient } from './client';
import { ENV } from '@/config/env';
import { gameApi } from '@/app/features/store/services/gameApi';

// Library related type definitions
export interface OwnedGame {
    gameId: number;
    title: string;
    price?: number;
    imageUrl?: string;
    activationCodes: ActivationCode[];
}

export interface ActivationCode {
    activationId: number;
    code: string;
}

export interface LibraryResponse {
    items: LibraryItem[];
}

export interface LibraryItem {
    gameId: number;
    title: string;
    price?: number;
    imageUrl?: string;
    activationId: number;
    activationCode: string;
}

export class LibraryApi {
    // Get user game library
    static async getLibrary(): Promise<OwnedGame[]> {
        try {
            const response = await apiClient.authenticatedRequest<LibraryResponse>('/library', undefined, {
                method: 'GET'
            });
            
            // Deduplicate backend data by game ID and merge activation codes
            const rawItems = response.items || [];
            const gameMap = new Map<number, OwnedGame>();
            
            // Get all game IDs
            const gameIds = [...new Set(rawItems.map(item => item.gameId))];
            
            // Get game details from game API (including images)
            const gameDetails = new Map<number, any>();
            try {
                const allGames = await gameApi.getGames();
                allGames.forEach(game => {
                    gameDetails.set(game.gameId, game);
                });
            } catch (error) {
                console.warn('Failed to fetch game details for images:', error);
            }
            
            rawItems.forEach((item: LibraryItem) => {
                const gameId = item.gameId;
                if (gameMap.has(gameId)) {
                    // If game already exists, add activation code
                    gameMap.get(gameId)!.activationCodes.push({
                        activationId: item.activationId,
                        code: item.activationCode
                    });
                } else {
                    // Get game details
                    const gameDetail = gameDetails.get(gameId);
                    
                    // Create new game record
                    gameMap.set(gameId, {
                        gameId: item.gameId,
                        title: item.title || gameDetail?.title || 'Unknown Game',
                        price: item.price || gameDetail?.price,
                        imageUrl: item.imageUrl || gameDetail?.imageUrl,
                        activationCodes: [{
                            activationId: item.activationId,
                            code: item.activationCode
                        }]
                    });
                }
            });
            
            return Array.from(gameMap.values());
        } catch (error) {
            console.error('Failed to fetch library:', error);
            throw new Error('Failed to get game library');
        }
    }

    // Search game library
    static async searchLibrary(keyword: string): Promise<OwnedGame[]> {
        try {
            const allGames = await this.getLibrary();
            return allGames.filter(game => 
                game.title.toLowerCase().includes(keyword.toLowerCase())
            );
        } catch (error) {
            console.error('Failed to search library:', error);
            throw new Error('Failed to search game library');
        }
    }

    // Get game details
    static async getGameDetails(gameId: number): Promise<OwnedGame | null> {
        try {
            const library = await this.getLibrary();
            return library.find(game => game.gameId === gameId) || null;
        } catch (error) {
            console.error(`Failed to fetch game details for ${gameId}:`, error);
            throw new Error('Failed to get game details');
        }
    }
}
