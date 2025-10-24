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

    // File size threshold
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
     * Calculate file MD5
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
                    reject(new Error('Upload cancelled'));
                    return;
                }

                spark.append(e.target?.result as ArrayBuffer);
                currentChunk++;

                const percent = Math.round((currentChunk / chunks) * 100);
                this.options.onProgress({
                    stage: 'calculating',
                    percent,
                    message: `Calculating MD5: ${percent}%`
                });

                if (currentChunk < chunks) {
                    loadNext();
                } else {
                    this.md5 = spark.end();
                    resolve(this.md5);
                }
            };

            fileReader.onerror = () => reject(new Error('Failed to read file'));

            const loadNext = () => {
                const start = currentChunk * chunkSize;
                const end = Math.min(start + chunkSize, this.file.size);
                fileReader.readAsArrayBuffer(this.file.slice(start, end));
            };

            loadNext();
        });
    }

    /**
     * Smart upload (automatically choose upload method)
     */
    async upload(): Promise<FileUploadResponse> {
        try {
            // Calculate MD5
            this.options.onProgress({
                stage: 'calculating',
                percent: 0,
                message: 'Calculating file fingerprint...'
            });

            await this.calculateMD5();

            // Choose upload method based on file size
            if (this.file.size < FileUploader.CHUNK_THRESHOLD) {
                return await this.uploadSimple();
            } else {
                return await this.uploadWithChunks();
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Upload failed');
            this.options.onError(err);
            throw err;
        }
    }

    /**
     * Direct upload for small files
     */
    private async uploadSimple(): Promise<FileUploadResponse> {
        this.options.onProgress({
            stage: 'uploading',
            percent: 0,
            message: 'Starting upload...'
        });

        const result = await fileApi.uploadSimple(this.file, {
            bizType: this.options.bizType,
            bizId: this.options.bizId,
            fileMd5: this.md5 || undefined,
            onProgress: (percent) => {
                this.options.onProgress({
                    stage: 'uploading',
                    percent,
                    message: `Uploading: ${percent}%`
                });
            }
        });

        this.options.onSuccess(result);
        return result;
    }

    /**
     * Chunked upload
     */
    private async uploadWithChunks(): Promise<FileUploadResponse> {
        const totalChunks = Math.ceil(this.file.size / this.options.chunkSize);

        // 1. Initialize chunked upload
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

        // 2. Prepare chunks
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

        // 3. Upload chunks concurrently
        const uploadedChunks = await this.uploadChunksConcurrently(chunks, 3);

        // 4. Complete upload
        this.options.onProgress({
            stage: 'merging',
            percent: 100,
            message: 'Merging files...'
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
     * Upload chunks concurrently
     */
    private async uploadChunksConcurrently(
        chunks: Array<{ number: number; blob: Blob; url: string }>,
        concurrency: number
    ): Promise<Array<{ chunkNumber: number; etag: string }>> {
        const results: Array<{ chunkNumber: number; etag: string }> = [];
        const executing: Promise<void>[] = [];

        for (const chunk of chunks) {
            if (this.aborted) throw new Error('Upload cancelled');

            const promise = this.uploadSingleChunk(chunk).then(result => {
                results.push(result);
                const percent = Math.round((results.length / chunks.length) * 100);
                this.options.onProgress({
                    stage: 'uploading',
                    percent,
                    current: results.length,
                    total: chunks.length,
                    message: `Uploading chunks: ${results.length}/${chunks.length}`
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
     * Upload single chunk
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
            throw new Error(`Chunk ${chunk.number} upload failed`);
        }

        const etag = response.headers.get('ETag')?.replace(/"/g, '') || '';

        return {
            chunkNumber: chunk.number,
            etag: etag
        };
    }

    /**
     * Cancel upload
     */
    abort(): void {
        this.aborted = true;
    }

    /**
     * Format file size
     */
    static formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
}