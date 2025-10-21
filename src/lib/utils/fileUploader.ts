// src/lib/utils/fileUploader.ts
import SparkMD5 from 'spark-md5';
import { fileApi } from '@/lib/api/file';
import type { FileUploadResponse } from '@/lib/api/file';

export interface UploadOptions {
    bizType?: string;
    bizId?: string;
    chunkSize?: number;
    onProgress?: (progress: UploadProgress) => void;
    onSuccess?: (result: FileUploadResponse) => void;
    onError?: (error: Error) => void;
}

export interface UploadProgress {
    stage: 'calculating' | 'uploading' | 'merging';
    percent: number;
    current?: number;
    total?: number;
    message?: string;
}

export class FileUploader {
    private file: File;
    private options: Required<UploadOptions>;
    private md5: string | null = null;
    private taskId: string | null = null;
    private aborted: boolean = false;

    // 文件大小阈值
    private static readonly CHUNK_THRESHOLD = 10 * 1024 * 1024; // 10MB
    private static readonly DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

    constructor(file: File, options: UploadOptions = {}) {
        this.file = file;
        this.options = {
            bizType: options.bizType || 'message',
            bizId: options.bizId || '',
            chunkSize: options.chunkSize || FileUploader.DEFAULT_CHUNK_SIZE,
            onProgress: options.onProgress || (() => {}),
            onSuccess: options.onSuccess || (() => {}),
            onError: options.onError || (() => {})
        };
    }

    /**
     * 计算文件MD5
     */
    private async calculateMD5(): Promise<string> {
        return new Promise((resolve, reject) => {
            const spark = new SparkMD5.ArrayBuffer();
            const fileReader = new FileReader();
            const chunkSize = 2 * 1024 * 1024; // 2MB per chunk for MD5
            let currentChunk = 0;
            const chunks = Math.ceil(this.file.size / chunkSize);

            fileReader.onload = (e) => {
                if (this.aborted) {
                    reject(new Error('上传已取消'));
                    return;
                }

                spark.append(e.target?.result as ArrayBuffer);
                currentChunk++;

                const percent = Math.round((currentChunk / chunks) * 100);
                this.options.onProgress({
                    stage: 'calculating',
                    percent,
                    message: `计算MD5: ${percent}%`
                });

                if (currentChunk < chunks) {
                    loadNext();
                } else {
                    this.md5 = spark.end();
                    resolve(this.md5);
                }
            };

            fileReader.onerror = () => reject(new Error('读取文件失败'));

            const loadNext = () => {
                const start = currentChunk * chunkSize;
                const end = Math.min(start + chunkSize, this.file.size);
                fileReader.readAsArrayBuffer(this.file.slice(start, end));
            };

            loadNext();
        });
    }

    /**
     * 智能上传（自动选择上传方式）
     */
    async upload(): Promise<FileUploadResponse> {
        try {
            // 计算MD5
            this.options.onProgress({
                stage: 'calculating',
                percent: 0,
                message: '正在计算文件指纹...'
            });

            await this.calculateMD5();

            // 根据文件大小选择上传方式
            if (this.file.size < FileUploader.CHUNK_THRESHOLD) {
                return await this.uploadSimple();
            } else {
                return await this.uploadWithChunks();
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error('上传失败');
            this.options.onError(err);
            throw err;
        }
    }

    /**
     * 小文件直接上传
     */
    private async uploadSimple(): Promise<FileUploadResponse> {
        this.options.onProgress({
            stage: 'uploading',
            percent: 0,
            message: '开始上传...'
        });

        const result = await fileApi.uploadSimple(this.file, {
            bizType: this.options.bizType,
            bizId: this.options.bizId,
            fileMd5: this.md5 || undefined,
            onProgress: (percent) => {
                this.options.onProgress({
                    stage: 'uploading',
                    percent,
                    message: `上传中: ${percent}%`
                });
            }
        });

        this.options.onSuccess(result);
        return result;
    }

    /**
     * 分片上传
     */
    private async uploadWithChunks(): Promise<FileUploadResponse> {
        const totalChunks = Math.ceil(this.file.size / this.options.chunkSize);

        // 1. 初始化分片上传
        const initResponse = await fileApi.initChunkUpload({
            fileName: this.file.name,
            fileSize: this.file.size,
            fileMd5: this.md5!,
            chunkSize: this.options.chunkSize,
            totalChunks: totalChunks,
            mimeType: this.file.type,
            bizType: this.options.bizType,
            bizId: this.options.bizId
        });

        this.taskId = initResponse.taskId;

        // 2. 准备分片
        const chunks = [];
        for (let i = 0; i < totalChunks; i++) {
            const start = i * this.options.chunkSize;
            const end = Math.min(start + this.options.chunkSize, this.file.size);
            chunks.push({
                number: i + 1,
                blob: this.file.slice(start, end),
                url: initResponse.chunkUploadUrls[i].uploadUrl
            });
        }

        // 3. 并发上传分片
        const uploadedChunks = await this.uploadChunksConcurrently(chunks, 3);

        // 4. 完成上传
        this.options.onProgress({
            stage: 'merging',
            percent: 100,
            message: '正在合并文件...'
        });

        const completeResponse = await fileApi.completeChunkUpload({
            taskId: this.taskId,
            chunks: uploadedChunks
        });

        const result: FileUploadResponse = {
            fileId: completeResponse.fileId,
            fileName: completeResponse.fileName,
            fileSize: completeResponse.fileSize,
            fileType: completeResponse.fileType,
            fileExt: completeResponse.fileExt,
            accessUrl: completeResponse.downloadUrl,
            quickUpload: false,
            needChunkUpload: true,
            message: completeResponse.message
        };

        this.options.onSuccess(result);
        return result;
    }

    /**
     * 并发上传分片
     */
    private async uploadChunksConcurrently(
        chunks: Array<{ number: number; blob: Blob; url: string }>,
        concurrency: number
    ): Promise<Array<{ chunkNumber: number; etag: string }>> {
        const results: Array<{ chunkNumber: number; etag: string }> = [];
        const executing: Promise<void>[] = [];

        for (const chunk of chunks) {
            if (this.aborted) throw new Error('上传已取消');

            const promise = this.uploadSingleChunk(chunk).then(result => {
                results.push(result);
                const percent = Math.round((results.length / chunks.length) * 100);
                this.options.onProgress({
                    stage: 'uploading',
                    percent,
                    current: results.length,
                    total: chunks.length,
                    message: `上传分片: ${results.length}/${chunks.length}`
                });
            });

            executing.push(promise);

            if (executing.length >= concurrency) {
                await Promise.race(executing);
                const index = executing.findIndex(p => p === promise);
                if (index !== -1) executing.splice(index, 1);
            }
        }

        await Promise.all(executing);
        return results.sort((a, b) => a.chunkNumber - b.chunkNumber);
    }

    /**
     * 上传单个分片
     */
    private async uploadSingleChunk(chunk: {
        number: number;
        blob: Blob;
        url: string;
    }): Promise<{ chunkNumber: number; etag: string }> {
        const response = await fetch(chunk.url, {
            method: 'PUT',
            body: chunk.blob,
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });

        if (!response.ok) {
            throw new Error(`分片 ${chunk.number} 上传失败`);
        }

        const etag = response.headers.get('ETag')?.replace(/"/g, '') || '';

        return {
            chunkNumber: chunk.number,
            etag: etag
        };
    }

    /**
     * 取消上传
     */
    abort(): void {
        this.aborted = true;
    }

    /**
     * 格式化文件大小
     */
    static formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
}