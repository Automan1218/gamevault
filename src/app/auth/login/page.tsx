
"use client";

import React, { useState, useEffect } from 'react';
import { App, Button, Alert } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthApi } from '@/lib/api/auth';
import { LoginRequest, RegisterRequest } from '@/types/api';
import { LoginForm } from '@/components/forms';
import { CustomTitle, CustomButton } from '@/components/ui';
import { cardStyle } from '@/components/common/theme';
import '@/components/common/animations.css';

export default function LoginPage() {
    const { message } = App.useApp();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard/library';
    const messageParam = searchParams.get('message');
    
    const [loading, setLoading] = useState(false);
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
        try {
            setLoading(true);
            const response = await AuthApi.login(values);
            if (response.token) {
                // 统一使用 auth_token 作为存储键名
                localStorage.setItem('auth_token', response.token);
                message.success('登录成功！');
                router.push(redirect);
            } else {
                message.error('登录失败，请检查用户名和密码');
            }
        } catch (error: any) {
            message.error(error.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    // 处理注册
    const handleRegister = async (values: RegisterRequest) => {
        try {
            setLoading(true);
            const response = await AuthApi.register(values);
            if (response.token) {
                // 注册成功后自动登录
                localStorage.setItem('auth_token', response.token);
                message.success('注册成功！');
                router.push(redirect);
            } else {
                message.success('注册成功！请登录');
            }
        } catch (error: any) {
            message.error(error.message || '注册失败');
        } finally {
            setLoading(false);
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
            const result = await AuthApi.checkEmail(value);
            if (result.exists) {
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
            const result = await AuthApi.checkUsername(value);
            if (result.exists) {
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
                    onClick={() => router.push('/')}
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