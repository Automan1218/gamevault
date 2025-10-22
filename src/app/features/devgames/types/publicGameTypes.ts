// src/app/features/devgames/types/publicGameTypes.ts

/**
 * 公共可浏览游戏（对应 DevGameResponse）
 */
export interface PublicGame {
    id: string;
    name: string;
    description: string;
    coverImageUrl?: string; // 封面图片下载地址
    videoUrl?: string;      // 视频资源地址
    zipUrl?: string;        // 游戏安装包下载地址
}

/**
 * 公共游戏分页响应（对应 DevGameListResponse）
 */
export interface PublicGameListResponse {
    games: PublicGame[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}
