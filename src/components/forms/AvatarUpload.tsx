"use client";

import React, { useState, useRef } from 'react';
import { Avatar, Button, App, Modal, Image } from 'antd';
import { EditOutlined, LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { ProfileApi } from '@/lib/api/profile';
import { getAvatarUrl, handleAvatarError, getDefaultAvatarStyle } from '@/lib/api/avatar';

interface AvatarUploadProps {
    currentAvatar?: string;
    onAvatarChange?: (avatarUrl: string | null) => void;
    size?: number;
    showEditButton?: boolean;
}

/**
 * 头像上传组件
 * 显示用户头像，并支持点击"编辑头像"按钮上传新头像
 * 上传新头像时会自动删除旧头像
 */
export default function AvatarUpload({ 
    currentAvatar, 
    onAvatarChange, 
    size = 120,
    showEditButton = true
}: AvatarUploadProps) {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 处理文件选择
    const handleFileSelect = async (file: File) => {
        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            message.error('只支持 JPG、PNG、GIF、WebP 格式的图片');
            return false;
        }

        // 验证文件大小 (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            message.error('图片大小不能超过 5MB');
            return false;
        }

        try {
            setLoading(true);
            
            // 如果已有头像，先删除旧头像
            if (currentAvatar) {
                try {
                    await ProfileApi.deleteAvatar();
                    console.log('旧头像已删除');
                } catch (deleteError) {
                    console.warn('删除旧头像失败，继续上传新头像:', deleteError);
                    // 即使删除失败也继续上传新头像
                }
            }
            
            // 上传新头像
            const result = await ProfileApi.uploadAvatar(file);
            message.success('头像更新成功');
            onAvatarChange?.(result.avatarUrl);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '头像上传失败';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }

        return false; // 阻止默认上传行为
    };

    // 预览头像
    const handlePreview = () => {
        if (currentAvatar) {
            setPreviewVisible(true);
        }
    };

    // 处理头像加载失败
    const onAvatarError = () => {
        handleAvatarError(new Error('头像加载失败'), true);
        return false;
    };

    // 触发文件选择
    const handleEditClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {/* 头像显示 */}
            {size > 0 && (
                <div style={{ marginBottom: showEditButton ? 16 : 0 }}>
                    <Avatar
                        size={size}
                        src={getAvatarUrl(currentAvatar)}
                        icon={<UserOutlined />}
                        onError={onAvatarError}
                        style={{
                            cursor: currentAvatar ? 'pointer' : 'default',
                            transition: 'all 0.3s ease',
                            ...getDefaultAvatarStyle(size),
                        }}
                        onClick={currentAvatar ? handlePreview : undefined}
                    />
                </div>
            )}

            {/* 编辑头像按钮 */}
            {showEditButton && (
                <div>
                    <Button
                        type="primary"
                        icon={loading ? <LoadingOutlined /> : <EditOutlined />}
                        onClick={handleEditClick}
                        loading={loading}
                        disabled={loading}
                        style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            height: '40px',
                            padding: '0 24px',
                            fontWeight: 500,
                        }}
                    >
                        编辑头像
                    </Button>
                </div>
            )}

            {/* 隐藏的文件输入 */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        handleFileSelect(file);
                        // 清空input，以便可以重复选择同一个文件
                        e.target.value = '';
                    }
                }}
            />

            {/* 头像预览模态框 */}
            <Modal
                open={previewVisible}
                title="头像预览"
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                centered
            >
                <div style={{ textAlign: 'center' }}>
                    <Image
                        src={getAvatarUrl(currentAvatar)}
                        alt="头像预览"
                        style={{ maxWidth: '100%', maxHeight: '400px' }}
                        preview={false}
                    />
                </div>
            </Modal>
        </div>
    );
}
