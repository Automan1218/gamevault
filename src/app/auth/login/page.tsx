
"use client";

import React, { useState } from 'react';
import { App, Button } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthApi } from '@/api/auth';
import { LoginRequest, RegisterRequest } from '@/types/api';
import { LoginForm } from '@/components/forms';
import { CustomTitle, CustomButton } from '@/components/ui';
import { cardStyle } from '@/components/common/theme';
import '@/components/common/animations.css';

export default function LoginPage() {
    const { message } = App.useApp();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/library';
    
    const [loading, setLoading] = useState(false);

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
            await AuthApi.register(values);
            message.success('注册成功！请登录');
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
            const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(value)}`);
            const data = await response.json();
            
            if (response.status === 200 && data.exists) {
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
            const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(value)}`);
            const data = await response.json();
            
            if (response.status === 200 && data.exists) {
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