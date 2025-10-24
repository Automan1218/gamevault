"use client";

import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface DefaultAvatarProps {
    size?: number;
    style?: React.CSSProperties;
    className?: string;
    onClick?: () => void;
}

/**
 * Default avatar component
 * Used when user has no avatar set or avatar loading fails
 */
export default function DefaultAvatar({ 
    size = 32, 
    style, 
    className,
    onClick 
}: DefaultAvatarProps) {
    return (
        <Avatar
            size={size}
            icon={<UserOutlined />}
            style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                cursor: onClick ? 'pointer' : 'default',
                ...style,
            }}
            className={className}
            onClick={onClick}
        />
    );
}
