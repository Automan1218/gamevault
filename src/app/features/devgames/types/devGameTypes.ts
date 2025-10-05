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
    developerId: string;
    name: string;
    description: string;
    releaseDate: string; // ISO string
    image: File;
    video?: File;
    zip: File;
}