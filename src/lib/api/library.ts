// src/lib/api/library.ts
import { apiClient } from './client';
import { ENV } from '@/config/env';
import { gameApi } from '@/app/features/store/services/gameApi';

// Library 相关类型定义
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
    // 获取用户游戏库
    static async getLibrary(): Promise<OwnedGame[]> {
        try {
            const response = await apiClient.authenticatedRequest<LibraryResponse>('/library', undefined, {
                method: 'GET'
            });
            
            // 将后端返回的数据按游戏ID去重，合并激活码
            const rawItems = response.items || [];
            const gameMap = new Map<number, OwnedGame>();
            
            // 获取所有游戏ID
            const gameIds = [...new Set(rawItems.map(item => item.gameId))];
            
            // 从游戏API获取游戏详细信息（包括图片）
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
                    // 如果游戏已存在，添加激活码
                    gameMap.get(gameId)!.activationCodes.push({
                        activationId: item.activationId,
                        code: item.activationCode
                    });
                } else {
                    // 获取游戏详细信息
                    const gameDetail = gameDetails.get(gameId);
                    
                    // 创建新游戏记录
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
            throw new Error('获取游戏库失败');
        }
    }

    // 搜索游戏库
    static async searchLibrary(keyword: string): Promise<OwnedGame[]> {
        try {
            const allGames = await this.getLibrary();
            return allGames.filter(game => 
                game.title.toLowerCase().includes(keyword.toLowerCase())
            );
        } catch (error) {
            console.error('Failed to search library:', error);
            throw new Error('搜索游戏库失败');
        }
    }

    // 获取游戏详情
    static async getGameDetails(gameId: number): Promise<OwnedGame | null> {
        try {
            const library = await this.getLibrary();
            return library.find(game => game.gameId === gameId) || null;
        } catch (error) {
            console.error(`Failed to fetch game details for ${gameId}:`, error);
            throw new Error('获取游戏详情失败');
        }
    }
}
