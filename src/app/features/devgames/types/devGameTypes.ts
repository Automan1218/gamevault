export interface DevGame {
    id: string;
    name: string;
    description: string;
    releaseDate: string;
    imageUrl: string;
    videoUrl?: string;
    zipUrl: string;
    developerId: string;
    downloads: number;
    rating: number;
    createdDate: string;
}

export interface DevGameListResponse {
    games: DevGame[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface UploadDevGameRequest {
    name: string;
    description: string;
    releaseDate: string; // ISO string
    image: File;
    video?: File;
    zip: File;
}

export interface PublicGame {
    id: string;
    name: string;
    description: string;
    coverImageUrl?: string; // Cover image download URL
    videoUrl?: string;      // Video resource URL
    zipUrl?: string;        // Game installation package download URL
}

export interface DevDashboardDetailedResponse {
    developerId: string;
    summary: DevDashboardSummary;
    games: DevGameStatsDetail[];
}

export interface DevGameStatsDetail {
    gameId: string;
    name: string;
    viewCount: number;
    downloadCount: number;
    rating: number;
    updatedAt: string;
}

export interface DevDashboardSummary {
    totalGames: number;
    totalViews: number;
    totalDownloads: number;
    averageRating: number;
}

export interface DevDashboardDetailedResponse {
    developerId: string;
    summary: DevDashboardSummary;
    games: DevGameStatsDetail[];
}

