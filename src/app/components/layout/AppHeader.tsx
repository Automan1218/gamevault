// src/components/layout/AppHeader.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Badge, Button, Dropdown, Space, type MenuProps } from 'antd';
import {
    BellOutlined,
    FileTextOutlined,
    HeartOutlined,
    LogoutOutlined,
    SettingOutlined,
    UserOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import { AuthApi } from '@/lib/api/auth';
import { UsersApi } from '@/lib/api/users'; // 如为默认导出，请改为：import UsersApi from '@/api/users';
import { navigationRoutes } from '@/lib/navigation';


export default function AppHeader() {
    const router = useRouter();
    const isLoggedIn = AuthApi.isAuthenticated();

    // 统一由后端异步获取；初始值为 null，避免把 Promise 塞给 useState
    const [username, setUsername] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        if (!isLoggedIn) { setUsername(null); setUserId(null); return; }
        let alive = true;
        (async () => {
            const [name, id] = await Promise.all([
                UsersApi.getUsername(),
                UsersApi.getUserId(),
            ] as const); // 关键：把输入标成只读元组，TS 就能推断成 [Promise<string|null>, Promise<number|null>]
            if (alive) { setUsername(name); setUserId(id); }
        })();
        return () => { alive = false; };
    }, [isLoggedIn]);


    const avatarLetter = useMemo(
        () => (username && username.length > 0 ? username[0].toUpperCase() : 'U'),
        [username],
    );

    const goProfile = () => router.push(userId ? navigationRoutes.profile(userId) : '/profile');
    const goMyPosts = () => router.push(navigationRoutes.myPosts);
    const goFavorites = () => router.push(navigationRoutes.favorites);
    const goLibrary = () => router.push(navigationRoutes.library);
    const goSettings = () => router.push(navigationRoutes.settings);
    const goNotifications = () => router.push(navigationRoutes.notifications);
    const handleLogout = () => {
        AuthApi.logout();
        router.push('/');
    };

    const userMenuItems: MenuProps['items'] = [
        { key: 'profile', label: '个人中心', icon: <UserOutlined /> },
        { key: 'library', label: '游戏库', icon: <AppstoreOutlined /> },
        { key: 'my-posts', label: '我的发帖', icon: <FileTextOutlined /> },
        { key: 'favorites', label: '我的收藏', icon: <HeartOutlined /> },
        { type: 'divider' },
        { key: 'settings', label: '设置', icon: <SettingOutlined /> },
        { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, danger: true },
    ];

    return (
        <Space size="large">
            <Badge count={5} dot>
                <BellOutlined
                    style={{ fontSize: 20, cursor: 'pointer' }}
                    onClick={goNotifications}
                />
            </Badge>

            {isLoggedIn ? (
                <Dropdown
                    menu={{
                        items: userMenuItems,
                        onClick: ({ key }) => {
                            switch (key) {
                                case 'profile':
                                    goProfile();
                                    break;
                                case 'library':
                                    goLibrary();
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
                                default:
                                    break;
                            }
                        },
                    }}
                >
                    <Avatar style={{ cursor: 'pointer' }} icon={<UserOutlined />}>
                        {avatarLetter}
                    </Avatar>
                </Dropdown>
            ) : (
                <Space>
                    <Button onClick={() => router.push('/login')}>登录</Button>
                    <Button type="primary" onClick={() => router.push('/login')}>
                        注册
                    </Button>
                </Space>
            )}
        </Space>
    );
}
