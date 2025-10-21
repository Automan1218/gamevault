// src/components/chat/FileUploadArea.tsx
import React, { useState, useRef } from 'react';
import { Upload, Progress, Button, Space, message, Image } from 'antd';
import {
    PaperClipOutlined,
    CloseOutlined,
    FileImageOutlined,
    FileOutlined,
    VideoCameraOutlined,
    AudioOutlined,
} from '@ant-design/icons';
import { FileUploader, UploadProgress } from '@/lib/utils/fileUploader';
import type { FileUploadResponse } from '@/lib/api/file';

interface FileUploadAreaProps {
    bizType?: string;
    bizId?: string;
    onUploadSuccess?: (fileInfo: FileUploadResponse) => void;
    onUploadError?: (error: Error) => void;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
                                                                  bizType = 'message',
                                                                  bizId,
                                                                  onUploadSuccess,
                                                                  onUploadError,
                                                              }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<UploadProgress | null>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const uploaderRef = useRef<FileUploader | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 处理文件选择
    const handleFileSelect = async (file: File) => {
        const allowedTypes = [
            // 图片
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml',
            // 视频
            'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv', 'video/webm',
            // 音频
            'audio/mp3', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/ogg', 'audio/m4a',
            // 文档
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed'
        ];

        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const isAllowedType = allowedTypes.includes(file.type) ||
            ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
                'txt', 'zip', 'rar', '7z', 'mp3', 'mp4', 'avi', 'mov'].includes(fileExtension || '');

        if (!isAllowedType) {
            message.error('不支持的文件类型');
            return;
        }

        // 文件大小限制（100MB）
        const maxSize = 100 * 1024 * 1024;

        if (file.size > maxSize) {
            message.error(`文件大小不能超过 100MB，当前文件：${formatFileSize(file.size)}`);
            return;
        }

        // 添加：大文件提示
        const chunkThreshold = 10 * 1024 * 1024; // 10MB
        if (file.size > chunkThreshold) {
            message.info('文件较大，将使用分片上传，请稍候...');
        }

        // 图片预览
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setPreviewFile(file);
        } else {
            setPreviewFile(file);
        }

        // 开始上传
        setUploading(true);

        const uploader = new FileUploader(file, {
            bizType,
            bizId,
            onProgress: (prog) => {
                setProgress(prog);
            },
            onSuccess: (result) => {
                message.success('上传成功！');
                setUploading(false);
                setProgress(null);
                setPreviewFile(null);
                setPreviewUrl('');
                onUploadSuccess?.(result);
            },
            onError: (error) => {
                message.error(`上传失败: ${error.message}`);
                setUploading(false);
                setProgress(null);
                setPreviewFile(null);
                setPreviewUrl('');
                onUploadError?.(error);
            },
        });

        uploaderRef.current = uploader;

        try {
            await uploader.upload();
        } catch (error) {
            console.error('上传错误:', error);
        }
    };

    //  添加：格式化文件大小的辅助函数
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    };

    // 取消上传
    const handleCancel = async () => {
        if (uploaderRef.current) {
            await uploaderRef.current.abort();
        }
        setUploading(false);
        setProgress(null);
        setPreviewFile(null);
        setPreviewUrl('');
        message.info('已取消上传');
    };

    // 获取文件图标
    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return <FileImageOutlined />;
        if (file.type.startsWith('video/')) return <VideoCameraOutlined />;
        if (file.type.startsWith('audio/')) return <AudioOutlined />;
        return <FileOutlined />;
    };

    return (
        <div>
            {/* 文件选择按钮 */}
            <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                    e.target.value = ''; // 清空，允许重复选择同一文件
                }}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z"
            />

            <Button
                icon={<PaperClipOutlined />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                type="text"
                title="上传文件"
            />

            {/* 上传进度显示 */}
            {uploading && previewFile && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 80,
                        left: 24,
                        right: 24,
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 8,
                        padding: 16,
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                    }}
                >
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Space>
                                {getFileIcon(previewFile)}
                                <span style={{ color: '#fff', fontSize: 14 }}>
                                    {previewFile.name}
                                </span>
                                <span style={{ color: '#999', fontSize: 12 }}>
                                    ({FileUploader.formatFileSize(previewFile.size)})
                                </span>
                            </Space>
                            <Button
                                type="text"
                                size="small"
                                icon={<CloseOutlined />}
                                onClick={handleCancel}
                                danger
                            />
                        </Space>

                        {/* 图片预览 */}
                        {previewUrl && (
                            <Image
                                src={previewUrl}
                                alt="预览"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: 150,
                                    borderRadius: 4,
                                    objectFit: 'cover',
                                }}
                                preview={false}
                            />
                        )}

                        {/* 进度条 */}
                        {progress && (
                            <>
                                <Progress
                                    percent={progress.percent}
                                    status={
                                        progress.stage === 'calculating' ? 'active' :
                                            progress.stage === 'merging' ? 'active' :
                                                'normal'
                                    }
                                    strokeColor={{
                                        '0%': '#6366f1',
                                        '100%': '#8b5cf6',
                                    }}
                                    format={(percent) => {
                                        if (progress.stage === 'calculating') {
                                            return `计算MD5: ${percent}%`;
                                        } else if (progress.stage === 'merging') {
                                            return `合并文件: ${percent}%`;
                                        } else if (progress.current && progress.total) {
                                            return `${progress.current}/${progress.total} 分片`;
                                        }
                                        return `${percent}%`;
                                    }}
                                />
                                <div style={{ color: '#999', fontSize: 12 }}>
                                    {progress.message || '上传中...'}
                                </div>
                            </>
                        )}
                    </Space>
                </div>
            )}
        </div>
    );
};