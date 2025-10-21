import { fileApiClient } from './client';
import { ENV } from '@/config/env';

// ============= 类型定义 =============
export interface FileUploadResponse {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileExt: string;
    accessUrl?: string;
    uploadUrl?: string;
    urlExpiresAt?: number;
    thumbnailUrl?: string;
    quickUpload: boolean;
    needChunkUpload: boolean;
    taskId?: string;
    message: string;
}

export interface FileInfoResponse {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileSizeFormatted: string;
    fileType: string;
    mimeType: string;
    fileExt: string;
    accessUrl?: string;
    downloadUrl?: string;
    urlExpiresAt?: number;
    thumbnailUrl?: string;
    downloadCount: number;
    status: number;
    userId: number;
    bizType?: string;
    bizId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InitChunkUploadResponse {
    taskId: string;
    fileName: string;
    fileSize: number;
    chunkSize: number;
    totalChunks: number;
    uploadId: string;
    chunkUploadUrls: Array<{
        chunkNumber: number;
        uploadUrl: string;
        urlExpiresAt: number;
    }>;
    expiresAt: number;
    message: string;
}

export interface CompleteChunkUploadResponse {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileExt: string;
    downloadUrl: string;
    urlExpiresAt: number;
    status: string;
    message: string;
}

// ============= File API Class =============
export class FileApi {
    /**
     * 小文件直接上传（后端中转）
     */
    async uploadSimple(
        file: File,
        options: {
            bizType?: string;
            bizId?: string;
            fileMd5?: string;
            onProgress?: (percent: number) => void;
        } = {}
    ): Promise<FileUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);

        if (options.fileMd5) formData.append('fileMd5', options.fileMd5);
        if (options.bizType) formData.append('bizType', options.bizType);
        if (options.bizId) formData.append('bizId', options.bizId);

        // 使用 XMLHttpRequest 来支持上传进度
        if (options.onProgress) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                const token = fileApiClient.getAuthToken();

                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        options.onProgress?.(percent);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            if (response.code === 0) {
                                resolve(response.data);
                            } else {
                                reject(new Error(response.message || '上传失败'));
                            }
                        } catch (error) {
                            reject(new Error('解析响应失败'));
                        }
                    } else {
                        reject(new Error(`上传失败: ${xhr.status}`));
                    }
                });

                xhr.addEventListener('error', () => reject(new Error('网络错误')));
                xhr.addEventListener('abort', () => reject(new Error('上传已取消')));

                xhr.open('POST', `${ENV.FILE_API_URL}/file/upload/simple`);
                if (token) {
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                }
                xhr.send(formData);
            });
        }

        // 没有进度回调时使用普通方式
        return fileApiClient.post<FileUploadResponse>(
            '/file/upload/simple',
            formData
        );
    }

    /**
     * 获取预签名上传URL（前端直传MinIO）
     */
    async getPresignedUploadUrl(params: {
        fileName: string;
        fileSize: number;
        fileMd5?: string;
        fileType?: string;
        mimeType?: string;
        bizType?: string;
        bizId?: string;
    }): Promise<FileUploadResponse> {
        return fileApiClient.post<FileUploadResponse>(
            '/file/upload/presigned-url',
            params
        );
    }

    /**
     * 初始化分片上传
     */
    async initChunkUpload(params: {
        fileName: string;
        fileSize: number;
        fileMd5: string;
        chunkSize: number;
        totalChunks: number;
        fileType?: string;
        mimeType?: string;
        bizType?: string;
        bizId?: string;
    }): Promise<InitChunkUploadResponse> {
        return fileApiClient.post<InitChunkUploadResponse>(
            '/file/upload/chunk/init',
            params
        );
    }

    /**
     * 完成分片上传
     */
    async completeChunkUpload(params: {
        taskId: string;
        chunks: Array<{
            chunkNumber: number;
            etag: string;
            chunkMd5?: string;
        }>;
    }): Promise<CompleteChunkUploadResponse> {
        return fileApiClient.post<CompleteChunkUploadResponse>(
            '/file/upload/chunk/complete',
            params
        );
    }

    /**
     * 获取文件详情
     */
    async getFileInfo(fileId: string): Promise<FileInfoResponse> {
        return fileApiClient.get<FileInfoResponse>(`/file/${fileId}`);
    }

    /**
     * 查询文件列表
     */
    async listFiles(params: {
        bizType?: string;
        bizId?: string;
        fileType?: string;
        page?: number;
        size?: number;
    } = {}): Promise<{ content: FileInfoResponse[]; totalElements: number }> {
        return fileApiClient.post('/file/list', {
            ...params,
            status: 1,
            sortBy: 'createdAt',
            sortDir: 'desc'
        });
    }

    /**
     * 删除文件
     */
    async deleteFile(fileId: string, physicalDelete: boolean = false): Promise<void> {
        return fileApiClient.post('/file/delete', {
            fileId,
            physicalDelete
        });
    }
}

export const fileApi = new FileApi();