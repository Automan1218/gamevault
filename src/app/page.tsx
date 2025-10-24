'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLoginRedirectUrl, navigationRoutes } from '@/lib/navigation';
import { Menubar } from '@/components/layout';
import { darkTheme, gradientBackground, cardStyle, primaryButtonStyle } from '@/components/common/theme';
import { HomepageApi } from '@/lib/api/homepage';
import { ProfileApi } from '@/lib/api/profile';
import { ENV } from '@/config/env';
import { useCart } from '@/contexts/CartContext';
import type { 
    HomepageStats, 
    FeaturedGame, 
    HotGame, 
    SpecialOffer, 
    CommunityPost, 
    FeaturedDeveloper, 
    FriendActivity 
} from '@/lib/api/homepage';

import {
    Avatar,
    Button,
    Space,
    Tag,
    Typography,
    Carousel,
    Row,
    Col,
    Card,
    List,
    Badge,
    Statistic,
    Progress,
    Rate,
    Divider,
    Input,
    ConfigProvider,
    Spin,
    Empty,
    message,
    BackTop,
    Alert,
    App,
} from 'antd';
import {
    ShoppingCartOutlined,
    UserOutlined,
    SearchOutlined,
    FireOutlined,
    ThunderboltOutlined,
    CrownOutlined,
    GiftOutlined,
    DownloadOutlined,
    PlayCircleOutlined,
    HeartOutlined,
    HeartFilled,
    AppstoreOutlined,
    CommentOutlined,
    LikeOutlined,
    TeamOutlined,
    TrophyOutlined,
    RocketOutlined,
    LogoutOutlined,
    LoginOutlined,
    CalendarOutlined,
    TrophyOutlined as TrophyIcon,
    CodeOutlined,
    BulbOutlined,
    ReloadOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
export const dynamic = 'force-dynamic';
const GameVaultHomepage = () => {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [likedGames, setLikedGames] = useState(new Set());
    const [error, setError] = useState<string | null>(null);
    
    // Data state
    const [featuredGames, setFeaturedGames] = useState<FeaturedGame[]>([]);
    const [hotGames, setHotGames] = useState<HotGame[]>([]);
    const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);
    const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
    const [featuredDevelopers, setFeaturedDevelopers] = useState<FeaturedDeveloper[]>([]);
    const [friendActivities, setFriendActivities] = useState<FriendActivity[]>([]);
    const [userGameStats, setUserGameStats] = useState<{
        totalGames: number;
        achievements: number;
        level: number;
        xp: number;
        nextLevelXp: number;
    } | null>(null);
    const [userProfile, setUserProfile] = useState<{
        username: string;
        nickname?: string;
        avatarUrl?: string;
    } | null>(null);

    const router = useRouter();
    const { addToCart } = useCart();
    const { message: messageApi } = App.useApp();

    // Handle image URL, ensure it's a complete URL
    const getImageUrl = (imageUrl?: string): string | undefined => {
        // If no image URL, return undefined
        if (!imageUrl || imageUrl.trim() === '') {
            return undefined;
        }
        
        // If already a complete URL, return directly
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        // If relative path, add server base URL
        const baseUrl = ENV.AUTH_API_URL.replace('/api', '');
        return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    };

    // Ensure component renders after client-side mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    // Dynamically check login status
    const isLoggedIn = mounted ? (typeof window !== 'undefined' && !!localStorage.getItem('auth_token')) : false;

    // Load user information
    const loadUserProfile = async () => {
        if (!isLoggedIn) return;
        
        try {
            const profile = await ProfileApi.getProfile();
            setUserProfile({
                username: profile.username,
                nickname: profile.nickname,
                avatarUrl: profile.avatarUrl
            });
        } catch (error) {
            console.error('Failed to get user info:', error);
            // If failed, use default info
            setUserProfile({
                username: 'Gamer',
                nickname: undefined,
                avatarUrl: undefined
            });
        }
    };

    // Load homepage data
    const loadHomepageData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const [
                featured,
                hot,
                offers,
                posts,
                developers,
                friends,
                userStats
            ] = await Promise.allSettled([
                HomepageApi.getFeaturedGames(),
                HomepageApi.getHotGames(),
                HomepageApi.getSpecialOffers(),
                HomepageApi.getCommunityPosts(),
                HomepageApi.getFeaturedDevelopers(),
                HomepageApi.getFriendActivities(),
                isLoggedIn ? HomepageApi.getUserGameStats() : Promise.resolve(null)
            ]);

            // Handle featured games (games with biggest discounts)
            if (featured.status === 'fulfilled') {
                setFeaturedGames(featured.value);
            }

            // Handle hot games
            if (hot.status === 'fulfilled') {
                setHotGames(hot.value);
            }

            // Handle special offers
            if (offers.status === 'fulfilled') {
                setSpecialOffers(offers.value);
            }


            // Handle community posts
            if (posts.status === 'fulfilled') {
                setCommunityPosts(posts.value);
            }

            // Handle featured developers
            if (developers.status === 'fulfilled') {
                setFeaturedDevelopers(developers.value);
            }

            // Handle friend activities
            if (friends.status === 'fulfilled') {
                setFriendActivities(friends.value);
            }

            // Handle user statistics
            if (userStats.status === 'fulfilled') {
                setUserGameStats(userStats.value);
            }

            // Check for serious errors
            const errors = [featured, hot, offers].filter(
                result => result.status === 'rejected'
            );
            
            if (errors.length > 0) {
                console.warn('Some data loading failed:', errors);
                setError('Some data loading failed, please refresh and try again');
            }

        } catch (error) {
            console.error('Failed to load homepage data:', error);
            setError('Data loading failed, please check network connection');
        } finally {
            setLoading(false);
        }
    };

    // Initialize data loading
    useEffect(() => {
        if (mounted) {
            loadHomepageData();
            loadUserProfile();
        }
    }, [mounted, isLoggedIn]);

    const toggleLike = (gameId: string | number) => {
        setLikedGames(prev => {
            const newSet = new Set(prev);
            if (newSet.has(gameId)) {
                newSet.delete(gameId);
                message.success('Removed from wishlist');
            } else {
                newSet.add(gameId);
                message.success('Added to wishlist');
            }
            return newSet;
        });
    };

    // Handle login
    const handleLogin = () => {
        const target = typeof window !== 'undefined'
            ? window.location.pathname + window.location.search
            : navigationRoutes.home;
        router.push(getLoginRedirectUrl(target));
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        router.push('/');
        message.success('Successfully logged out');
    };

    // Handle add to cart
    const handleAddToCart = async (gameId: number, gameTitle?: string) => {
        if (!isLoggedIn) {
            messageApi.warning('Please login first to add games to cart');
            handleLogin();
            return;
        }
        
        try {
            await addToCart(gameId, 1);
            const gameName = gameTitle || 'Game';
            messageApi.success({
                content: `🎮 ${gameName} has been successfully added to cart!`,
                duration: 3,
                style: {
                    marginTop: '20px',
                }
            });
        } catch (error) {
            console.error('Failed to add to cart:', error);
            messageApi.error({
                content: '❌ Failed to add to cart, please try again',
                duration: 3,
            });
        }
    };

    // Handle game detail view
    const handleGameDetail = (gameId: number) => {
        message.info('Redirecting to game details...');
        // Navigate to game detail page
    };

    // Handle community navigation
    const handleCommunityClick = () => {
        router.push(navigationRoutes.forum);
    };

    // Handle developer area navigation
    const handleDeveloperClick = () => {
        if (!isLoggedIn) {
            message.warning('Please login first to access developer area');
            handleLogin();
            return;
        }
        router.push(navigationRoutes.developer);
    };

    // Refresh data
    const handleRefresh = () => {
        loadHomepageData();
    };

    // Avoid SSR hydration issues
    if (!mounted) {
        return null;
    }

    // Loading state
    if (loading) {
    return (
            <ConfigProvider theme={darkTheme}>
                <App>
                    <Menubar currentPath="/" />
                    <div style={{ 
                        background: gradientBackground, 
                        minHeight: '100vh', 
                        padding: '96px 0 20px 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Spin size="large" />
                    </div>
                </App>
            </ConfigProvider>
        );
    }

    return (
        <ConfigProvider theme={darkTheme}>
            <App>
            {/* Top navigation bar */}
            <Menubar currentPath="/" />
            
            <div style={{ 
                background: gradientBackground, 
                minHeight: '100vh', 
                padding: '96px 24px 20px 24px'
            }}>
                {/* Error alert */}
                {error && (
                    <div style={{ marginBottom: 24 }}>
                        <Alert
                            message="Data loading error"
                            description={error}
                            type="warning"
                            showIcon
                            action={
                                <Button size="small" icon={<ReloadOutlined />} onClick={handleRefresh}>
                                    Refresh
                                </Button>
                            }
                            closable
                            onClose={() => setError(null)}
                        />
                    </div>
                )}

                {/* Hero section - Carousel (games with biggest discounts) */}
                {featuredGames.length > 0 && (
                    <div style={{ marginBottom: 48 }}>
                        <Carousel 
                            autoplay 
                            effect="fade"
                            style={{ 
                                borderRadius: 16,
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                            }}
                        >
                        {featuredGames.map(game => (
                                <div key={game.gameId}>
                                    <div style={{ 
                                        position: 'relative', 
                                        height: 500, 
                                        background: getImageUrl(game.imageUrl) 
                                            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${getImageUrl(game.imageUrl)}) center/cover`
                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                                    }}>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                                            padding: '60px 40px 40px'
                                    }}>
                                        <Row gutter={24} align="bottom">
                                            <Col span={16}>
                                                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                                        <div>
                                                            <Title level={1} style={{ 
                                                                color: '#fff', 
                                                                margin: 0,
                                                                fontSize: '3rem',
                                                                fontWeight: 700,
                                                                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                                                            }}>
                                                    {game.title}
                                                </Title>
                                                            <Paragraph style={{ 
                                                                color: '#fff', 
                                                                fontSize: '1.2rem',
                                                                marginTop: 16,
                                                                opacity: 0.9
                                                            }}>
                                                                {game.description}
                                                            </Paragraph>
                                                </div>
                                                        
                                                        <Space size="large" wrap>
                                                            {game.genre && (
                                                                <Tag color="blue" style={{ 
                                                                    fontSize: 14, 
                                                                    padding: '4px 12px',
                                                                    borderRadius: 20
                                                                }}>
                                                                    {game.genre}
                                                                </Tag>
                                                            )}
                                                            {game.platform && (
                                                                <Tag color="green" style={{ 
                                                                    fontSize: 14, 
                                                                    padding: '4px 12px',
                                                                    borderRadius: 20
                                                                }}>
                                                                    {game.platform}
                                                                </Tag>
                                                            )}
                                                        </Space>
                                                    </Space>
                                            </Col>
                                            <Col span={8} style={{ textAlign: 'right' }}>
                                                    <Space direction="vertical" size="large" align="end">
                                                        {game.discount && game.discount > 0 && (
                                                            <Tag color="green" style={{ 
                                                                fontSize: 24, 
                                                                padding: '12px 24px',
                                                                borderRadius: 8,
                                                                fontWeight: 'bold'
                                                            }}>
                                                        -{game.discount}%
                                                    </Tag>
                                                )}
                                                        
                                                <div>
                                                            {game.discountPrice && game.discountPrice > 0 && game.discountPrice < game.price && (
                                                                <Text delete style={{ 
                                                                    color: '#999', 
                                                                    fontSize: 20,
                                                                    display: 'block',
                                                                    marginBottom: 8
                                                                }}>
                                                            ${game.price}
                                                        </Text>
                                                    )}
                                                            <Title level={1} style={{ 
                                                                color: '#52c41a', 
                                                                display: 'inline',
                                                                fontSize: '3rem',
                                                                fontWeight: 'bold',
                                                                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                                                            }}>
                                                                ${game.discountPrice || game.price}
                                                    </Title>
                                                </div>
                                                        
                                                        <Space size="large">
                                                            <Button 
                                                                type="primary" 
                                                                size="large" 
                                                                icon={<ShoppingCartOutlined />}
                                                                style={{
                                                                    ...primaryButtonStyle,
                                                                    height: 50,
                                                                    fontSize: 16,
                                                                    padding: '0 32px'
                                                                }}
                                                                onClick={() => handleAddToCart(game.gameId, game.title)}
                                                            >
                                                        Add to Cart
                                                    </Button>
                                                            <Button 
                                                                size="large" 
                                                                icon={<HeartOutlined />}
                                                                style={{
                                                                    height: 50,
                                                                    fontSize: 16,
                                                                    padding: '0 24px',
                                                                    border: '2px solid #ff4d4f',
                                                                    color: '#ff4d4f',
                                                                    background: 'transparent'
                                                                }}
                                                                onClick={() => toggleLike(game.gameId)}
                                                            >
                                                        Add to Wishlist
                                                    </Button>
                                                        </Space>
                                                </Space>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Carousel>
                    </div>
                )}


                    {/* Main content area */}
                <Row gutter={[32, 32]}>
                    <Col xs={24} lg={16}>
                            {/* Hot Games */}
                        {hotGames.length > 0 && (
                            <Card 
                                style={{...cardStyle, marginBottom: 32}}
                                title={
                                    <Space>
                                        <FireOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                                        <Title level={3} style={{ color: '#fff', margin: 0 }}>
                                        Hot Games
                                        </Title>
                                    </Space>
                                }
                                extra={
                                    <Button type="link" style={{ color: '#1890ff' }}>
                                        View All
                                    </Button>
                                }
                            >
                                <Row gutter={[16, 16]}>
                                    {hotGames.map(game => (
                                        <Col xs={24} sm={12} key={game.gameId}>
                                            <Card
                                                hoverable
                                                style={{
                                                    ...cardStyle,
                                                    height: '100%',
                                                    transition: 'all 0.3s ease',
                                                }}
                                                cover={
                                                    <div style={{ position: 'relative', height: 200 }}>
                                                        {getImageUrl(game.imageUrl) ? (
                                                            <img 
                                                                alt={game.title} 
                                                                src={getImageUrl(game.imageUrl)} 
                                                                style={{ 
                                                                    width: '100%', 
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }} 
                                                            />
                                                        ) : (
                                                            <div style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#fff',
                                                                fontSize: '14px',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                No Image
                                                            </div>
                                                        )}
                                                        {game.isNew && (
                                                            <Badge.Ribbon text="New" color="blue" />
                                                        )}
                                                        {game.isHot && !game.isNew && (
                                                            <Badge.Ribbon text="Hot" color="red" />
                                                        )}
                                                    </div>
                                                }
                                            >
                                                <Card.Meta
                                                    title={
                                                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                            <Text strong style={{ color: '#fff', fontSize: 16 }}>
                                                                {game.title}
                                                            </Text>
                                                            <Button
                                                                type="text"
                                                                icon={likedGames.has(game.gameId) ? 
                                                                    <HeartFilled style={{ color: '#ff4d4f' }} /> : 
                                                                    <HeartOutlined />
                                                                }
                                                                onClick={() => toggleLike(game.gameId)}
                                                            />
                                                        </Space>
                                                    }
                                                    description={
                                                        <Space direction="vertical" style={{ width: '100%' }}>
                                                            <Space wrap>
                                                                {game.genre && (
                                                                    <Tag color="default" style={{ fontSize: 12 }}>
                                                                        {game.genre}
                                                                    </Tag>
                                                                )}
                                                                {game.platform && (
                                                                    <Tag color="default" style={{ fontSize: 12 }}>
                                                                        {game.platform}
                                                                    </Tag>
                                                                )}
                                                            </Space>
                                                            
                                                            <Row justify="space-between" align="middle">
                                                                <Col>
                                                                    <Space>
                                                                        <Rate disabled defaultValue={game.rating || 4.5} style={{ fontSize: 12 }} />
                                                                        <Text type="secondary" style={{ color: '#999' }}>
                                                                            {game.rating?.toFixed(1) || '4.5'}
                                                                        </Text>
                                                                    </Space>
                                                                </Col>
                                                                <Col>
                                                                    <Space>
                                                                        <TeamOutlined style={{ color: '#999' }} />
                                                                        <Text type="secondary" style={{ color: '#999' }}>
                                                                            {game.players || '1M+'}
                                                                        </Text>
                                                                    </Space>
                                                                </Col>
                                                            </Row>
                                                            
                                                            <Divider style={{ margin: '8px 0' }} />
                                                            
                                                            <Row justify="space-between" align="middle">
                                                                <Col>
                                                                    <Text strong style={{ 
                                                                        fontSize: 18, 
                                                                        color: '#52c41a',
                                                                        display: 'block'
                                                                    }}>
                                                                        ${game.discountPrice || game.price}
                                                                    </Text>
                                                                </Col>
                                                                <Col>
                                                                    <Button 
                                                                        type="primary" 
                                                                        icon={<ShoppingCartOutlined />}
                                                                        onClick={() => handleAddToCart(game.gameId, game.title)}
                                                                        style={primaryButtonStyle}
                                                                    >
                                                                        Add to Cart
                                                                    </Button>
                                                                </Col>
                                                            </Row>
                                                        </Space>
                                                    }
                                                />
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Card>
                        )}

                            {/* Special Offers */}
                        {specialOffers.length > 0 && (
                            <Card 
                                style={{...cardStyle, marginBottom: 32}}
                                title={
                                    <Space>
                                        <GiftOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                                        <Title level={3} style={{ color: '#fff', margin: 0 }}>
                                        Special Offers
                                        </Title>
                                    </Space>
                                }
                                extra={
                                    <Button type="link" style={{ color: '#1890ff' }}>
                                        View All
                                    </Button>
                                }
                            >
                                <List
                                    dataSource={specialOffers}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={
                                                    getImageUrl(item.imageUrl) ? (
                                                        <img 
                                                            src={getImageUrl(item.imageUrl)} 
                                                            style={{ 
                                                                width: 120, 
                                                                height: 68,
                                                                borderRadius: 8,
                                                                objectFit: 'cover'
                                                            }} 
                                                            alt={item.title}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: 120,
                                                            height: 68,
                                                            borderRadius: 8,
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#fff',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            No Image
                                                        </div>
                                                    )
                                                }
                                                title={
                                                    <Space>
                                                        <Text strong style={{ color: '#fff' }}>
                                                            {item.title}
                                                        </Text>
                                                        <Tag color="orange">
                                                            Remaining {item.endTime}
                                                        </Tag>
                                                    </Space>
                                                }
                                                description={
                                                    <Space wrap>
                                                        {item.genre && (
                                                            <Tag style={{ fontSize: 12 }}>
                                                                {item.genre}
                                                            </Tag>
                                                        )}
                                                        <Divider type="vertical" />
                                                        <Rate disabled defaultValue={item.rating || 4.5} style={{ fontSize: 12 }} />
                                                    </Space>
                                                }
                                            />
                                            <Space direction="vertical" align="end">
                                                <Tag color="green" style={{ fontSize: 16, padding: '4px 8px' }}>
                                                    -{item.discount}%
                                                </Tag>
                                                <Text delete style={{ color: '#999' }}>
                                                    ${item.originalPrice}
                                                </Text>
                                                <Text strong style={{ fontSize: 20, color: '#52c41a' }}>
                                                    ${item.discountPrice || item.price}
                                                </Text>
                                                <Button 
                                                    type="primary" 
                                                    icon={<ShoppingCartOutlined />}
                                                    onClick={() => handleAddToCart(item.gameId, item.title)}
                                                    style={primaryButtonStyle}
                                                >
                                                    Add to Cart
                                                </Button>
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        )}

                        </Col>

                        {/* Sidebar */}
                    <Col xs={24} lg={8}>
                        {/* User info card */}
                        {isLoggedIn && userGameStats ? (
                            <Card style={{...cardStyle, marginBottom: 24}}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Space>
                                        <Avatar 
                                            size={64} 
                                            src={userProfile?.avatarUrl ? getImageUrl(userProfile.avatarUrl) : undefined}
                                            icon={!userProfile?.avatarUrl ? <UserOutlined /> : undefined}
                                        />
                                        <Space direction="vertical">
                                            <Text strong style={{ color: '#fff', fontSize: 18 }}>
                                                {userProfile?.nickname || userProfile?.username || 'Gamer'}
                                            </Text>
                                            <Text type="secondary" style={{ color: '#999' }}>
                                                Level {userGameStats.level}
                                            </Text>
                                        </Space>
                                    </Space>
                                    <Progress 
                                        percent={Math.floor((userGameStats.xp / userGameStats.nextLevelXp) * 100)} 
                                        showInfo={false} 
                                    />
                                    <Text type="secondary" style={{ color: '#999' }}>
                                        {userGameStats.nextLevelXp - userGameStats.xp} XP to next level
                                    </Text>
                                    <Divider />
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Statistic 
                                                title="Games" 
                                                value={userGameStats.totalGames} 
                                                prefix={<AppstoreOutlined />} 
                                                valueStyle={{ color: '#1890ff' }}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic 
                                                title="Achievements" 
                                                value={userGameStats.achievements} 
                                                prefix={<TrophyIcon />} 
                                                valueStyle={{ color: '#faad14' }}
                                            />
                                        </Col>
                                    </Row>
                                </Space>
                            </Card>
                        ) : (
                            <Card style={{...cardStyle, marginBottom: 24}}>
                                <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
                                    <Avatar size={64} icon={<UserOutlined />} />
                                    <Title level={4} style={{ color: '#fff', margin: 0 }}>
                                        Welcome to GameVault
                                    </Title>
                                    <Text type="secondary" style={{ color: '#999' }}>
                                        Login to enjoy the full gaming experience
                                    </Text>
                                    <Button 
                                        type="primary" 
                                        size="large" 
                                        icon={<LoginOutlined />}
                                        onClick={handleLogin}
                                        style={primaryButtonStyle}
                                        block
                                    >
                                        Login Now
                                    </Button>
                                </Space>
                            </Card>
                        )}

                            {/* Community Activity */}
                        {communityPosts.length > 0 && (
                            <Card 
                                style={{...cardStyle, marginBottom: 24}}
                                title={
                                    <Space>
                                        <CommentOutlined style={{ color: '#1890ff' }} />
                                        <Title level={4} style={{ color: '#fff', margin: 0 }}>
                                        Community Activity
                                        </Title>
                                    </Space>
                                }
                                extra={
                                    <Button type="link" onClick={handleCommunityClick} style={{ color: '#1890ff' }}>
                                        Enter Community
                                    </Button>
                                }
                            >
                                <List
                                    dataSource={communityPosts}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar 
                                                        src={item.avatar ? getImageUrl(item.avatar) : undefined}
                                                        icon={!item.avatar ? <UserOutlined /> : undefined}
                                                    />
                                                }
                                                title={
                                                    <Space direction="vertical" style={{ width: '100%' }}>
                                                        <Text strong style={{ color: '#fff' }}>
                                                            {item.author}
                                                        </Text>
                                                        <Text type="secondary" style={{ fontSize: 12, color: '#999' }}>
                                                            {item.time} · {item.game}
                                                        </Text>
                                                    </Space>
                                                }
                                                description={
                                                    <Space direction="vertical" style={{ width: '100%' }}>
                                                        <Paragraph 
                                                            ellipsis={{ rows: 2 }}
                                                            style={{ color: '#999', margin: 0 }}
                                                        >
                                                            {item.content}
                                                        </Paragraph>
                                                        <Space>
                                                            <Button type="text" size="small" icon={<LikeOutlined />}>
                                                                {item.likes}
                                                            </Button>
                                                            <Button type="text" size="small" icon={<CommentOutlined />}>
                                                                {item.comments}
                                                            </Button>
                                                        </Space>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        )}

                        {/* Developer Showcase */}
                        {featuredDevelopers.length > 0 && (
                            <Card 
                                style={{...cardStyle, marginBottom: 24}}
                                title={
                                    <Space>
                                        <CodeOutlined style={{ color: '#faad14' }} />
                                        <Title level={4} style={{ color: '#fff', margin: 0 }}>
                                            Featured Developers
                                        </Title>
                                    </Space>
                                }
                                extra={
                                    <Button type="link" onClick={handleDeveloperClick} style={{ color: '#1890ff' }}>
                                        Developer Center
                                    </Button>
                                }
                            >
                                <List
                                    dataSource={featuredDevelopers}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Avatar src={item.avatar} size={48} />}
                                                title={
                                                    <Space direction="vertical" style={{ width: '100%' }}>
                                                        <Text strong style={{ color: '#fff' }}>
                                                            {item.name}
                                                        </Text>
                                                        <Text type="secondary" style={{ fontSize: 12, color: '#999' }}>
                                                            {item.description}
                                                        </Text>
                                                    </Space>
                                                }
                                                description={
                                                    <Space direction="vertical" style={{ width: '100%' }}>
                                                        <Text type="secondary" style={{ fontSize: 12, color: '#999' }}>
                                                            Featured: {item.featuredGame}
                                                        </Text>
                                                        <Row justify="space-between">
                                                            <Col>
                                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                                    {item.games} games
                                                                </Text>
                                                            </Col>
                                                            <Col>
                                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                                    {item.followers} followers
                                                                </Text>
                                                            </Col>
                                                        </Row>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        )}

                            {/* Friend Activities */}
                        {friendActivities.length > 0 && (
                            <Card 
                                style={cardStyle}
                                title={
                                    <Space>
                                        <TeamOutlined style={{ color: '#52c41a' }} />
                                        <Title level={4} style={{ color: '#fff', margin: 0 }}>
                                            Friend Activities
                                        </Title>
                                    </Space>
                                }
                            >
                                <List
                                    dataSource={friendActivities}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={
                                                    <Badge dot status={item.status === 'Online' ? 'success' : 'processing'}>
                                                        <Avatar icon={<UserOutlined />} />
                                                    </Badge>
                                                }
                                                title={
                                                    <Text strong style={{ color: '#fff' }}>
                                                        {item.name}
                                                    </Text>
                                                }
                                                description={
                                                    <Space direction="vertical">
                                                        <Text type="secondary" style={{ color: '#999' }}>
                                                            {item.game}
                                                        </Text>
                                                        <Text type="secondary" style={{ fontSize: 12, color: '#999' }}>
                                                            Playtime {item.time}
                                                        </Text>
                                                    </Space>
                                                }
                                            />
                                            <Button size="small" icon={<PlayCircleOutlined />}>
                                                Join
                                            </Button>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        )}
                        </Col>
                    </Row>
                </div>

                {/* Back to top */}
                <BackTop />
            </App>
        </ConfigProvider>
    );
};

export default GameVaultHomepage;
