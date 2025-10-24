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
 * Avatar upload component
 * Display user avatar and support clicking "Edit Avatar" button to upload new avatar
 * Automatically delete old avatar when uploading new avatar
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

    // Handle file selection
    const handleFileSelect = async (file: File) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            message.error('Only JPG, PNG, GIF, WebP format images are supported');
            return false;
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            message.error('Image size cannot exceed 5MB');
            return false;
        }

        try {
            setLoading(true);
            
            // If avatar exists, delete old avatar first
            if (currentAvatar) {
                try {
                    await ProfileApi.deleteAvatar();
                    console.log('Old avatar deleted');
                } catch (deleteError) {
                    console.warn('Failed to delete old avatar, continuing with new avatar upload:', deleteError);
                    // Continue uploading new avatar even if deletion fails
                }
            }
            
            // Upload new avatar
            const result = await ProfileApi.uploadAvatar(file);
            message.success('Avatar updated successfully');
            onAvatarChange?.(result.avatarUrl);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Avatar upload failed';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }

        return false; // Prevent default upload behavior
    };

    // Preview avatar
    const handlePreview = () => {
        if (currentAvatar) {
            setPreviewVisible(true);
        }
    };

    // Handle avatar loading failure
    const onAvatarError = () => {
        handleAvatarError(new Error('Avatar loading failed'), true);
        return false;
    };

    // Trigger file selection
    const handleEditClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {/* Avatar display */}
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

            {/* Edit avatar button */}
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
                        Edit Avatar
                    </Button>
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        handleFileSelect(file);
                        // Clear input to allow selecting the same file again
                        e.target.value = '';
                    }
                }}
            />

            {/* Avatar preview modal */}
            <Modal
                open={previewVisible}
                title="Avatar Preview"
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                centered
            >
                <div style={{ textAlign: 'center' }}>
                    <Image
                        src={getAvatarUrl(currentAvatar)}
                        alt="Avatar preview"
                        style={{ maxWidth: '100%', maxHeight: '400px' }}
                        preview={false}
                    />
                </div>
            </Modal>
        </div>
    );
}
