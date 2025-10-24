
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { App, Button, Alert } from 'antd';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/features/auth/hooks/useAuth';
import { LoginRequest, RegisterRequest } from '@/types/api';
import { LoginForm } from '@/components/forms';
import { CustomTitle } from '@/components/ui';
import { cardStyle } from '@/components/common/theme';
import '@/components/common/animations.css';
export const dynamic = 'force-dynamic'

// Component that uses useSearchParams - needs to be wrapped in Suspense
function LoginPageContent() {
    const { message } = App.useApp();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard/library';
    const messageParam = searchParams.get('message');
    
    const { login, register, checkEmailExists, checkUsernameExists, loading } = useAuth();
    const [showMessage, setShowMessage] = useState<string | null>(null);

    // Check URL parameters and display corresponding messages
    useEffect(() => {
        if (messageParam === 'password_changed') {
            setShowMessage('Password changed successfully, please login again');
        } else if (messageParam === 'email_changed') {
            setShowMessage('Email changed successfully, please login again');
        }
    }, [messageParam]);

    // Handle login
    const handleLogin = async (values: LoginRequest) => {
        const result = await login(values, redirect);
        if (result.success) {
            message.success(result.message);
        } else {
            message.error(result.message);
        }
    };

    // Handle registration
    const handleRegister = async (values: RegisterRequest) => {
        const result = await register(values, redirect);
        if (result.success) {
            message.success(result.message);
        } else {
            message.error(result.message);
        }
    };

    // Handle forgot password
    const handleForgotPassword = () => {
        message.info('Forgot password feature is under development...');
    };

    // Email uniqueness validation
    const validateEmail = async (rule: any, value: string) => {
        if (!value) return Promise.resolve();
        
        try {
            const exists = await checkEmailExists(value);
            if (exists) {
                return Promise.reject(new Error('This email is already registered'));
            }
            return Promise.resolve();
        } catch (error) {
            console.error('Email validation failed:', error);
            return Promise.resolve(); // Don't block submission when validation fails
        }
    };

    // Username uniqueness validation
    const validateUsername = async (rule: any, value: string) => {
        if (!value) return Promise.resolve();
        
        try {
            const exists = await checkUsernameExists(value);
            if (exists) {
                return Promise.reject(new Error('This username is already taken'));
            }
            return Promise.resolve();
        } catch (error) {
            console.error('Username validation failed:', error);
            return Promise.resolve(); // Don't block submission when validation fails
        }
    };


    // Right card content (layout provided by (auth)/layout.tsx)
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
            {/* Form title */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <CustomTitle level={2} style={{ fontSize: '2rem' }}>
                    Welcome Back
                </CustomTitle>
            </div>

            {/* Display redirect message */}
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

            {/* Return to homepage */}
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
                    ← Back to Homepage
                </Button>
            </div>
        </div>
    );
}

// Main LoginPage component with Suspense boundary
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div
                className="login-card"
                style={{
                    width: '100%',
                    maxWidth: 500,
                    padding: '48px',
                    ...cardStyle,
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <CustomTitle level={2} style={{ fontSize: '2rem' }}>
                        Welcome Back
                    </CustomTitle>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '100%', 
                        height: '200px', 
                        background: 'rgba(31, 41, 55, 0.5)', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af'
                    }}>
                        Loading...
                    </div>
                </div>
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}