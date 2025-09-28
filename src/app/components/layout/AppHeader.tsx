import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Badge, Button, Dropdown, Space, type MenuProps } from 'antd';
import {
    BellOutlined,
    FileTextOutlined,
    HeartOutlined,
    LogoutOutlined,
    SettingOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { AuthApi } from '@/lib/api/auth';
import { UsersApi } from '@/lib/api/users';
import { navigationRoutes } from '@/lib/navigation';

export default function AppHeader() {
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [userInfoLoaded, setUserInfoLoaded] = useState(false);

    // 缓存登录状态，避免每次渲染都调用
    const [isLoggedIn, setIsLoggedIn] = useState(() => AuthApi.isAuthenticated());

    // 使用 useCallback 避免函数重新创建
    const fetchUserInfo = useCallback(async () => {
        if (!isLoggedIn || userInfoLoaded) return;

        try {
            const [name, id] = await Promise.all([
                UsersApi.getUsername(),
                UsersApi.getUserId(),
            ]);
            setUsername(name);
            setUserId(id);
            setUserInfoLoaded(true);
        } catch (error) {
            console.error('获取用户信息失败:', error);
            // 如果获取用户信息失败，可能 token 已过期
            setIsLoggedIn(false);
            setUsername(null);
            setUserId(null);
        }
    }, [isLoggedIn, userInfoLoaded]);

    // 监听认证状态变化
    useEffect(() => {
        const checkAuthStatus = () => {
            const currentAuthStatus = AuthApi.isAuthenticated();
            if (currentAuthStatus !== isLoggedIn) {
                setIsLoggedIn(currentAuthStatus);
                setUserInfoLoaded(false);
                if (!currentAuthStatus) {
                    setUsername(null);
                    setUserId(null);
                }
            }
        };

        // 立即检查
        checkAuthStatus();

        // 定期检查认证状态（可选）
        const interval = setInterval(checkAuthStatus, 30000); // 30秒检查一次

        return () => clearInterval(interval);
    }, [isLoggedIn]);

    // 当登录状态改变且为已登录时，获取用户信息
    useEffect(() => {
        if (isLoggedIn && !userInfoLoaded) {
            fetchUserInfo();
        }
    }, [isLoggedIn, userInfoLoaded, fetchUserInfo]);

    const avatarLetter = useMemo(
        () => (username && username.length > 0 ? username[0].toUpperCase() : 'U'),
        [username],
    );

    const goProfile = () => router.push(userId ? navigationRoutes.profile(userId) : '/profile');
    const goMyPosts = () => router.push(navigationRoutes.myPosts);
    const goFavorites = () => router.push(navigationRoutes.favorites);
    const goSettings = () => router.push(navigationRoutes.settings);
    const goNotifications = () => router.push(navigationRoutes.notifications);

    const handleLogout = () => {
        AuthApi.logout();
        // 清除缓存状态
        setIsLoggedIn(false);
        setUsername(null);
        setUserId(null);
        setUserInfoLoaded(false);
        router.push('/');
    };

    const userMenuItems: MenuProps['items'] = [
        { key: 'profile', label: '个人中心', icon: <UserOutlined /> },
        { key: 'my-posts', label: '我的发帖', icon: <FileTextOutlined /> },
        { key: 'favorites', label: '我的收藏', icon: <HeartOutlined /> },
        { type: 'divider' },
        { key: 'settings', label: '设置', icon: <SettingOutlined /> },
        { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, danger: true },
    ];

    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        switch (key) {
            case 'profile':
                goProfile();
                break;
            case 'my-posts':
                goMyPosts();
                break;
            case 'favorites':
                goFavorites();
                break;
            case 'settings':
                goSettings();
                break;
            case 'logout':
                handleLogout();
                break;
        }
    };

    return (
        <Space size="large">
            <Badge count={5} dot>
                <BellOutlined
                    style={{ fontSize: 20, cursor: 'pointer' }}
                    onClick={goNotifications}
                />
            </Badge>

            {isLoggedIn ? (
                <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }}>
                    <Space style={{ cursor: 'pointer' }}>
                        <Avatar size="small">
                            {userInfoLoaded ? avatarLetter : 'L'}
                        </Avatar>
                        <span>{userInfoLoaded ? (username || '用户') : '加载中...'}</span>
                    </Space>
                </Dropdown>
            ) : (
                <Button
                    type="primary"
                    onClick={() => router.push('/auth/login')}
                >
                    登录
                </Button>
            )}
        </Space>
    );
}