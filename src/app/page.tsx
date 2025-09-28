'use client';
import { useRouter } from 'next/navigation';
import { navigationRoutes } from '@/lib/navigation';

import type { MenuProps } from 'antd';
import React, { useState } from 'react';
import {
    ProLayout,
    ProCard,
    ProList,
} from '@ant-design/pro-components';
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
    Tabs,
    List,
    Badge,
    Statistic,
    Progress,
    Rate,
    Divider,
    Input,
    Dropdown,
    Menu,
    ConfigProvider,
    theme,
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
    TagOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    GlobalOutlined,
    SettingOutlined,
    BellOutlined,
    CommentOutlined,
    LikeOutlined,
    StarOutlined,
    TeamOutlined,
    TrophyOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import GlobalNavigation from '@/app/components/layout/GlobalNavigation';
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { darkAlgorithm } = theme;

// 在你的主页组件中

const HomePage = () => {
    const router = useRouter();

    const handleCommunityClick = () => {
        router.push(navigationRoutes.forum); // 跳转到 /dashboard/forum
    };

    const handleGamesClick = () => {
        router.push(navigationRoutes.shop); // 跳转到 /dashboard/forum/category/games
    };

    return (
        <div>
            <Button onClick={handleCommunityClick}>社区</Button>
            <Button onClick={handleGamesClick}>游戏</Button>
        </div>
    );
};
// 模拟数据
const featuredGames = [
    {
        id: 1,
        title: '赛博朋克2077：往日之影',
        image: 'https://via.placeholder.com/1920x600/1a1a2e/ffffff?text=Cyberpunk+2077',
        price: 298,
        discount: 35,
        tags: ['RPG', '开放世界', '科幻'],
        rating: 4.5,
    },
    {
        id: 2,
        title: '艾尔登法环',
        image: 'https://via.placeholder.com/1920x600/0f3460/ffffff?text=Elden+Ring',
        price: 398,
        discount: 25,
        tags: ['动作', '魂系', 'RPG'],
        rating: 4.8,
    },
    {
        id: 3,
        title: '博德之门3',
        image: 'https://via.placeholder.com/1920x600/16213e/ffffff?text=Baldur+Gate+3',
        price: 298,
        discount: 20,
        tags: ['RPG', '策略', '回合制'],
        rating: 4.9,
    },
];

const hotGames = [
    {
        id: 1,
        title: '黑神话：悟空',
        cover: 'https://via.placeholder.com/460x215/e94560/ffffff?text=Black+Myth',
        price: 268,
        originalPrice: 268,
        discount: 0,
        rating: 4.9,
        players: '100万+',
        tags: ['动作', 'RPG', '国产'],
        isNew: true,
        isHot: true,
    },
    {
        id: 2,
        title: '霍格沃茨之遗',
        cover: 'https://via.placeholder.com/460x215/0f3460/ffffff?text=Hogwarts+Legacy',
        price: 188,
        originalPrice: 298,
        discount: 37,
        rating: 4.5,
        players: '50万+',
        tags: ['RPG', '开放世界', '魔法'],
        isHot: true,
    },
    {
        id: 3,
        title: '星空',
        cover: 'https://via.placeholder.com/460x215/533483/ffffff?text=Starfield',
        price: 238,
        originalPrice: 298,
        discount: 20,
        rating: 4.2,
        players: '30万+',
        tags: ['RPG', '太空', '探索'],
    },
    {
        id: 4,
        title: '暗黑破坏神4',
        cover: 'https://via.placeholder.com/460x215/1a1a2e/ffffff?text=Diablo+4',
        price: 298,
        originalPrice: 398,
        discount: 25,
        rating: 4.3,
        players: '80万+',
        tags: ['ARPG', '暗黑', '刷宝'],
    },
];

const specialOffers = [
    {
        id: 1,
        title: '巫师3：狂猎 年度版',
        cover: 'https://via.placeholder.com/460x215/8b0000/ffffff?text=The+Witcher+3',
        price: 29,
        originalPrice: 127,
        discount: 77,
        endTime: '48小时',
        rating: 4.9,
        tags: ['RPG', '开放世界'],
    },
    {
        id: 2,
        title: 'GTA5',
        cover: 'https://via.placeholder.com/460x215/ff6b35/ffffff?text=GTA+V',
        price: 59,
        originalPrice: 189,
        discount: 69,
        endTime: '24小时',
        rating: 4.7,
        tags: ['动作', '开放世界'],
    },
    {
        id: 3,
        title: '文明6',
        cover: 'https://via.placeholder.com/460x215/004643/ffffff?text=Civilization+6',
        price: 39,
        originalPrice: 199,
        discount: 80,
        endTime: '36小时',
        rating: 4.6,
        tags: ['策略', '回合制'],
    },
];

const upcomingGames = [
    {
        id: 1,
        title: '地平线：西部禁域',
        cover: 'https://via.placeholder.com/460x215/f25287/ffffff?text=Horizon',
        releaseDate: '2025年3月21日',
        preOrderPrice: 268,
        tags: ['动作', 'RPG', '开放世界'],
        wishlist: 125000,
    },
    {
        id: 2,
        title: '刺客信条：幻景',
        cover: 'https://via.placeholder.com/460x215/441151/ffffff?text=Assassins+Creed',
        releaseDate: '2025年4月15日',
        preOrderPrice: 298,
        tags: ['动作', '潜行', '历史'],
        wishlist: 89000,
    },
];

const communityPosts = [
    {
        id: 1,
        author: '游戏达人',
        avatar: 'https://via.placeholder.com/50x50/f77f00/ffffff?text=User',
        content: '黑神话悟空真的太震撼了！国产游戏之光！',
        game: '黑神话：悟空',
        likes: 2890,
        comments: 156,
        time: '2小时前',
    },
    {
        id: 2,
        author: '资深玩家',
        avatar: 'https://via.placeholder.com/50x50/d62828/ffffff?text=Pro',
        content: '博德之门3的剧情设计真的绝了，每个选择都有意义',
        game: '博德之门3',
        likes: 1560,
        comments: 89,
        time: '5小时前',
    },
];

const GameVaultHomepage = () => {
    const [mounted, setMounted] = useState(false);

    const router = useRouter();

    const handleCommunityClick = () => {
        router.push(navigationRoutes.forum);
    };

    const handleGamesClick = () => {
        router.push(navigationRoutes.shop);
    };
    const [likedGames, setLikedGames] = useState(new Set());
    const [selectedCategory, setSelectedCategory] = useState('all');

    // 确保组件在客户端挂载后再渲染
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const toggleLike = (gameId: string | number) => {
        setLikedGames(prev => {
            const newSet = new Set(prev);
            if (newSet.has(gameId)) {
                newSet.delete(gameId);
            } else {
                newSet.add(gameId);
            }
            return newSet;
        });
    };

    const userMenuItems: MenuProps['items'] = [
        { key: 'profile', icon: <UserOutlined />, label: '个人资料' },
        { key: 'library', icon: <AppstoreOutlined />, label: '游戏库' },
        { key: 'wishlist', icon: <HeartOutlined />, label: '愿望单' },
        { key: 'friends', icon: <TeamOutlined />, label: '好友' },
        { type: 'divider' },
        { key: 'settings', icon: <SettingOutlined />, label: '设置' },
    ];
    // 避免SSR hydration问题
    if (!mounted) {
        return null;
    }

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <ProLayout
                title="GameVault"
                logo="https://via.placeholder.com/40x40/6366f1/ffffff?text=GV"
                layout="top"
                fixedHeader
                navTheme="realDark"
                contentWidth="Fixed"
                breakpoint={false}
                headerContentRender={() => (
                    <Row align="middle" style={{ width: '100%' }}>
                        <Col flex="auto">
                            <GlobalNavigation />
                        </Col>
                        <Col>
                            <Space size="middle">
                                <Search
                                    placeholder="搜索游戏"
                                    style={{ width: 300 }}
                                    prefix={<SearchOutlined />}
                                />
                                <Badge count={3} size="small">
                                    <Button type="text" icon={<BellOutlined />} style={{ color: '#fff' }} />
                                </Badge>
                                <Badge count={2} size="small">
                                    <Button type="text" icon={<ShoppingCartOutlined />} style={{ color: '#fff' }} />
                                </Badge>
                                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                                    <Avatar
                                        size="small"
                                        icon={<UserOutlined />}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </Dropdown>
                            </Space>
                        </Col>
                    </Row>
                )}
            >
                <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '20px 0' }}>
                    {/* 轮播大图 */}
                    <Carousel autoplay style={{ marginBottom: 24 }}>
                        {featuredGames.map(game => (
                            <div key={game.id}>
                                <div style={{ position: 'relative', height: 400, background: `url(${game.image}) center/cover` }}>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                                        padding: '40px'
                                    }}>
                                        <Row gutter={24} align="bottom">
                                            <Col span={16}>
                                                <Title level={2} style={{ color: '#fff', margin: 0 }}>
                                                    {game.title}
                                                </Title>
                                                <Space style={{ marginTop: 8, marginBottom: 16 }}>
                                                    {game.tags.map(tag => (
                                                        <Tag key={tag} color="blue">{tag}</Tag>
                                                    ))}
                                                </Space>
                                                <div>
                                                    <Rate disabled defaultValue={game.rating} style={{ fontSize: 16 }} />
                                                    <Text style={{ color: '#fff', marginLeft: 8 }}>{game.rating}</Text>
                                                </div>
                                            </Col>
                                            <Col span={8} style={{ textAlign: 'right' }}>
                                                {game.discount > 0 && (
                                                    <Tag color="green" style={{ fontSize: 20, padding: '8px 16px', marginBottom: 8 }}>
                                                        -{game.discount}%
                                                    </Tag>
                                                )}
                                                <div>
                                                    {game.discount > 0 && (
                                                        <Text delete style={{ color: '#999', fontSize: 16 }}>
                                                            ¥{game.price}
                                                        </Text>
                                                    )}
                                                    <Title level={2} style={{ color: '#52c41a', display: 'inline', marginLeft: 8 }}>
                                                        ¥{Math.floor(game.price * (1 - game.discount / 100))}
                                                    </Title>
                                                </div>
                                                <Space style={{ marginTop: 16 }}>
                                                    <Button type="primary" size="large" icon={<ShoppingCartOutlined />}>
                                                        立即购买
                                                    </Button>
                                                    <Button size="large" icon={<HeartOutlined />}>
                                                        加入愿望单
                                                    </Button>
                                                </Space>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Carousel>

                    {/* 快速分类导航 */}
                    <ProCard style={{ marginBottom: 24 }}>
                        <Space size="large" wrap>
                            <Button
                                type={selectedCategory === 'all' ? 'primary' : 'default'}
                                icon={<AppstoreOutlined />}
                                onClick={() => setSelectedCategory('all')}
                            >
                                全部游戏
                            </Button>
                            <Button
                                type={selectedCategory === 'hot' ? 'primary' : 'default'}
                                icon={<FireOutlined />}
                                onClick={() => setSelectedCategory('hot')}
                            >
                                热门推荐
                            </Button>
                            <Button
                                type={selectedCategory === 'new' ? 'primary' : 'default'}
                                icon={<ThunderboltOutlined />}
                                onClick={() => setSelectedCategory('new')}
                            >
                                新品上架
                            </Button>
                            <Button
                                type={selectedCategory === 'sale' ? 'primary' : 'default'}
                                icon={<GiftOutlined />}
                                onClick={() => setSelectedCategory('sale')}
                            >
                                限时特惠
                            </Button>
                            <Button
                                type={selectedCategory === 'free' ? 'primary' : 'default'}
                                icon={<CrownOutlined />}
                                onClick={() => setSelectedCategory('free')}
                            >
                                免费游戏
                            </Button>
                            <Button
                                type={selectedCategory === 'upcoming' ? 'primary' : 'default'}
                                icon={<RocketOutlined />}
                                onClick={() => setSelectedCategory('upcoming')}
                            >
                                即将推出
                            </Button>
                        </Space>
                    </ProCard>

                    {/* 主要内容区域 */}
                    <Row gutter={[24, 24]}>
                        <Col span={18}>
                            {/* 热门游戏 */}
                            <ProCard
                                title={
                                    <Space>
                                        <FireOutlined style={{ color: '#ff4d4f' }} />
                                        热门游戏
                                    </Space>
                                }
                                extra={<Button type="link">查看全部</Button>}
                                style={{ marginBottom: 24 }}
                            >
                                <Row gutter={[16, 16]}>
                                    {hotGames.map(game => (
                                        <Col span={12} key={game.id}>
                                            <Card
                                                hoverable
                                                cover={
                                                    <div style={{ position: 'relative' }}>
                                                        <img alt={game.title} src={game.cover} style={{ width: '100%' }} />
                                                        {game.isNew && (
                                                            <Badge.Ribbon text="新品" color="blue" />
                                                        )}
                                                        {game.isHot && !game.isNew && (
                                                            <Badge.Ribbon text="热门" color="red" />
                                                        )}
                                                        {game.discount > 0 && (
                                                            <Tag
                                                                color="green"
                                                                style={{
                                                                    position: 'absolute',
                                                                    bottom: 8,
                                                                    left: 8,
                                                                    fontSize: 16,
                                                                    padding: '4px 8px'
                                                                }}
                                                            >
                                                                -{game.discount}%
                                                            </Tag>
                                                        )}
                                                    </div>
                                                }
                                            >
                                                <Card.Meta
                                                    title={
                                                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                            <Text strong>{game.title}</Text>
                                                            <Button
                                                                type="text"
                                                                icon={likedGames.has(game.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                                                                onClick={() => toggleLike(game.id)}
                                                            />
                                                        </Space>
                                                    }
                                                    description={
                                                        <>
                                                            <Space wrap style={{ marginBottom: 8 }}>
                                                                {game.tags.map(tag => (
                                                                    <Tag key={tag} color="default">{tag}</Tag>
                                                                ))}
                                                            </Space>
                                                            <Row justify="space-between" align="middle">
                                                                <Col>
                                                                    <Space>
                                                                        <Rate disabled defaultValue={game.rating} style={{ fontSize: 12 }} />
                                                                        <Text type="secondary">{game.rating}</Text>
                                                                    </Space>
                                                                </Col>
                                                                <Col>
                                                                    <Space>
                                                                        <TeamOutlined />
                                                                        <Text type="secondary">{game.players}</Text>
                                                                    </Space>
                                                                </Col>
                                                            </Row>
                                                            <Divider style={{ margin: '8px 0' }} />
                                                            <Row justify="space-between" align="middle">
                                                                <Col>
                                                                    {game.discount > 0 && (
                                                                        <Text delete type="secondary">¥{game.originalPrice}</Text>
                                                                    )}
                                                                    <Text strong style={{ fontSize: 18, marginLeft: 8, color: '#52c41a' }}>
                                                                        ¥{game.price}
                                                                    </Text>
                                                                </Col>
                                                                <Col>
                                                                    <Button type="primary" icon={<ShoppingCartOutlined />}>
                                                                        购买
                                                                    </Button>
                                                                </Col>
                                                            </Row>
                                                        </>
                                                    }
                                                />
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </ProCard>

                            {/* 限时特惠 */}
                            <ProCard
                                title={
                                    <Space>
                                        <GiftOutlined style={{ color: '#52c41a' }} />
                                        限时特惠
                                    </Space>
                                }
                                extra={<Button type="link">查看全部</Button>}
                                style={{ marginBottom: 24 }}
                            >
                                <List
                                    dataSource={specialOffers}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<img src={item.cover} style={{ width: 120, height: 56 }} />}
                                                title={
                                                    <Space>
                                                        <Text strong>{item.title}</Text>
                                                        <Tag color="orange">剩余 {item.endTime}</Tag>
                                                    </Space>
                                                }
                                                description={
                                                    <Space>
                                                        {item.tags.map(tag => (
                                                            <Tag key={tag}>{tag}</Tag>
                                                        ))}
                                                        <Divider type="vertical" />
                                                        <Rate disabled defaultValue={item.rating} style={{ fontSize: 12 }} />
                                                    </Space>
                                                }
                                            />
                                            <Space direction="vertical" align="end">
                                                <Tag color="green" style={{ fontSize: 18 }}>-{item.discount}%</Tag>
                                                <Text delete>¥{item.originalPrice}</Text>
                                                <Text strong style={{ fontSize: 20, color: '#52c41a' }}>¥{item.price}</Text>
                                                <Button type="primary" icon={<ShoppingCartOutlined />}>立即抢购</Button>
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            </ProCard>

                            {/* 即将推出 */}
                            <ProCard
                                title={
                                    <Space>
                                        <RocketOutlined style={{ color: '#1890ff' }} />
                                        即将推出
                                    </Space>
                                }
                                extra={<Button type="link">查看全部</Button>}
                            >
                                <Row gutter={16}>
                                    {upcomingGames.map(game => (
                                        <Col span={12} key={game.id}>
                                            <Card
                                                hoverable
                                                cover={<img alt={game.title} src={game.cover} />}
                                            >
                                                <Card.Meta
                                                    title={game.title}
                                                    description={
                                                        <>
                                                            <Space wrap style={{ marginBottom: 8 }}>
                                                                {game.tags.map(tag => (
                                                                    <Tag key={tag}>{tag}</Tag>
                                                                ))}
                                                            </Space>
                                                            <Paragraph>
                                                                <CalendarOutlined /> 发售日期：{game.releaseDate}
                                                            </Paragraph>
                                                            <Row justify="space-between" align="middle">
                                                                <Col>
                                                                    <Statistic
                                                                        value={game.wishlist}
                                                                        prefix={<HeartOutlined />}
                                                                        suffix="人想要"
                                                                        valueStyle={{ fontSize: 14 }}
                                                                    />
                                                                </Col>
                                                                <Col>
                                                                    <Text strong style={{ fontSize: 18 }}>
                                                                        预购 ¥{game.preOrderPrice}
                                                                    </Text>
                                                                </Col>
                                                            </Row>
                                                            <Button type="primary" block icon={<HeartOutlined />} style={{ marginTop: 8 }}>
                                                                加入愿望单
                                                            </Button>
                                                        </>
                                                    }
                                                />
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </ProCard>
                        </Col>

                        {/* 侧边栏 */}
                        <Col span={6}>
                            {/* 用户信息 */}
                            <ProCard style={{ marginBottom: 24 }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Space>
                                        <Avatar size={64} icon={<UserOutlined />} />
                                        <Space direction="vertical">
                                            <Text strong>游戏玩家</Text>
                                            <Text type="secondary">等级 42</Text>
                                        </Space>
                                    </Space>
                                    <Progress percent={75} showInfo={false} />
                                    <Text type="secondary">距离下一级还需 250 经验</Text>
                                    <Divider />
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Statistic title="游戏数" value={168} prefix={<AppstoreOutlined />} />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic title="成就" value={892} prefix={<TrophyOutlined />} />
                                        </Col>
                                    </Row>
                                </Space>
                            </ProCard>

                            {/* 社区动态 */}
                            <ProCard
                                title={
                                    <Space>
                                        <CommentOutlined />
                                        社区动态
                                    </Space>
                                }
                                style={{ marginBottom: 24 }}
                            >
                                <List
                                    dataSource={communityPosts}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Avatar src={item.avatar} />}
                                                title={
                                                    <Space direction="vertical" style={{ width: '100%' }}>
                                                        <Text strong>{item.author}</Text>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {item.time} · {item.game}
                                                        </Text>
                                                    </Space>
                                                }
                                                description={
                                                    <>
                                                        <Paragraph ellipsis={{ rows: 2 }}>
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
                                                    </>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </ProCard>

                            {/* 好友动态 */}
                            <ProCard
                                title={
                                    <Space>
                                        <TeamOutlined />
                                        好友在玩
                                    </Space>
                                }
                            >
                                <List
                                    dataSource={[
                                        { name: '小明', game: '艾尔登法环', status: '在线', time: '2小时' },
                                        { name: '小红', game: '赛博朋克2077', status: '游戏中', time: '30分钟' },
                                        { name: '小李', game: '博德之门3', status: '在线', time: '1小时' },
                                    ]}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={
                                                    <Badge dot status={item.status === '在线' ? 'success' : 'processing'}>
                                                        <Avatar icon={<UserOutlined />} />
                                                    </Badge>
                                                }
                                                title={item.name}
                                                description={
                                                    <Space direction="vertical">
                                                        <Text type="secondary">{item.game}</Text>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            已玩 {item.time}
                                                        </Text>
                                                    </Space>
                                                }
                                            />
                                            <Button size="small" icon={<PlayCircleOutlined />}>
                                                加入
                                            </Button>
                                        </List.Item>
                                    )}
                                />
                            </ProCard>
                        </Col>
                    </Row>
                </div>
            </ProLayout>
        </ConfigProvider>
    );
};

// 添加日历图标引入（忘记引入了）
import { CalendarOutlined } from '@ant-design/icons';

export default GameVaultHomepage;