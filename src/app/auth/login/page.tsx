
"use client";

import React, { useState, useEffect } from 'react';
import { App, Button, Alert } from 'antd';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/features/auth/hooks/useAuth';
import { LoginRequest, RegisterRequest } from '@/types/api';
import { LoginForm } from '@/components/forms';
import { CustomTitle } from '@/components/ui';
import { cardStyle } from '@/components/common/theme';
import '@/components/common/animations.css';

export default function LoginPage() {
    const { message } = App.useApp();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard/library';
    const messageParam = searchParams.get('message');
    
    const { login, register, checkEmailExists, checkUsernameExists, loading } = useAuth();
    const [showMessage, setShowMessage] = useState<string | null>(null);

    // 检查URL参数并显示相应消息
    useEffect(() => {
        if (messageParam === 'password_changed') {
            setShowMessage('密码修改成功，请重新登录');
        } else if (messageParam === 'email_changed') {
            setShowMessage('邮箱修改成功，请重新登录');
        }
    }, [messageParam]);

    // 处理登录
    const handleLogin = async (values: LoginRequest) => {
        const result = await login(values, redirect);
        if (result.success) {
            message.success(result.message);
        } else {
            message.error(result.message);
        }
    };

    // 处理注册
    const handleRegister = async (values: RegisterRequest) => {
        const result = await register(values, redirect);
        if (result.success) {
            message.success(result.message);
        } else {
            message.error(result.message);
        }
    };

    // 忘记密码处理
    const handleForgotPassword = () => {
        message.info('忘记密码功能开发中...');
    };

    // 邮箱唯一性验证
    const validateEmail = async (rule: any, value: string) => {
        if (!value) return Promise.resolve();
        
        try {
            const exists = await checkEmailExists(value);
            if (exists) {
                return Promise.reject(new Error('该邮箱已被注册'));
            }
            return Promise.resolve();
        } catch (error) {
            console.error('邮箱验证失败:', error);
            return Promise.resolve(); // 验证失败时不阻止提交
        }
    };

    // 用户名唯一性验证
    const validateUsername = async (rule: any, value: string) => {
        if (!value) return Promise.resolve();
        
        try {
            const exists = await checkUsernameExists(value);
            if (exists) {
                return Promise.reject(new Error('该用户名已被使用'));
            }
            return Promise.resolve();
        } catch (error) {
            console.error('用户名验证失败:', error);
            return Promise.resolve(); // 验证失败时不阻止提交
        }
    };


    // 右侧卡片内容（布局已由 (auth)/layout.tsx 提供）
    return (
        <div
            className="login-card"
            style={{
                width: '100%',
                maxWidth: 500,
                padding: '48px',
                ...cardStyle,
            }}
        >
            {/* 表单标题 */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <CustomTitle level={2} style={{ fontSize: '2rem' }}>
                    欢迎回来
                </CustomTitle>
            </div>

            {/* 显示重定向消息 */}
            {showMessage && (
                <Alert
                    message={showMessage}
                    type="success"
                    showIcon
                    style={{
                        marginBottom: 24,
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: 8,
                    }}
                />
            )}

            <LoginForm
                onLogin={handleLogin}
                onRegister={handleRegister}
                loading={loading}
                onForgotPassword={handleForgotPassword}
                validateEmail={validateEmail}
                validateUsername={validateUsername}
            />

            {/* 返回首页 */}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Button 
                    type="default" 
                    onClick={() => window.location.href = '/'}
                    style={{
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        border: '1px solid rgba(75, 85, 99, 0.3)',
                        background: 'rgba(31, 41, 55, 0.5)',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        height: 'auto',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                        e.currentTarget.style.color = '#9ca3af';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)';
                        e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.3)';
                        e.currentTarget.style.color = '#6b7280';
                    }}
                >
                    ← 返回首页
                </Button>
            </div>
        </div>
    );
}