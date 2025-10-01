// // src/app/post_page.tsx
// 'use client';
//
// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//     ProLayout,
//     PageContainer,
// } from '@ant-design/pro-components';
// import {
//     Avatar,
//     Badge,
//     Button,
//     Card,
//     Col,
//     Divider,
//     Empty,
//     Input,
//     message,
//     Row,
//     Space,
//     Spin,
//     Statistic,
//     Tabs,
//     Tag,
//     Typography,
//     ConfigProvider,
//     theme,
//     Carousel, List,
// } from 'antd';
// import {
//     AppstoreOutlined,
//     BarChartOutlined,
//     BellOutlined,
//     ClockCircleOutlined,
//     CommentOutlined,
//     EyeOutlined,
//     FileTextOutlined,
//     FireOutlined,
//     GlobalOutlined,
//     HeartOutlined,
//     LikeOutlined,
//     MessageOutlined,
//     PlusOutlined,
//     SearchOutlined,
//     ShareAltOutlined,
//     StarOutlined,
//     TagsOutlined,
//     TeamOutlined,
//     UserOutlined,
// } from '@ant-design/icons';
//
// // Import API from your existing API files
// import { PostsApi, Post, PostListResponse } from '@/lib/api/posts';
// import { UsersApi, User } from '@/lib/api/users';
// import { AuthApi } from '@/lib/api/auth';
//
// const { Title, Text, Paragraph } = Typography;
// const { Search } = Input;
// const { TabPane } = Tabs;
//
// export default function ForumHome() {
//     const router = useRouter();
//     const [darkMode, setDarkMode] = useState(true);
//     const [loading, setLoading] = useState(false);
//     const [searchLoading, setSearchLoading] = useState(false);
//
//     // 帖子数据
//     const [posts, setPosts] = useState<Post[]>([]);
//     const [currentPage, setCurrentPage] = useState(0);
//     const [totalPages, setTotalPages] = useState(0);
//     const [totalPosts, setTotalPosts] = useState(0);
//
//     // 用户数据
//     const [activeUsers, setActiveUsers] = useState<User[]>([]);
//     const [currentUser, setCurrentUser] = useState<User | null>(null);
//
//     // UI状态
//     const [activeTab, setActiveTab] = useState('latest');
//     const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
//
//     // 论坛统计（模拟数据，可以从后端获取）
//     const [forumStats] = useState({
//         todayPosts: 128,
//         onlineUsers: 892,
//         totalUsers: 12680,
//     });
//
//     // 游戏板块（模拟数据）
//     const gameBoards = [
//         { name: '原神', icon: '🌟', posts: 15234, online: 892, color: '#FFD700' },
//         { name: '王者荣耀', icon: '👑', posts: 12456, online: 765, color: '#FF6B6B' },
//         { name: '永劫无间', icon: '⚔️', posts: 9876, online: 543, color: '#4ECDC4' },
//         { name: 'CS2', icon: '🔫', posts: 8765, online: 432, color: '#95E1D3' },
//         { name: '崩坏：星穹铁道', icon: '🚂', posts: 7654, online: 321, color: '#A8E6CF' },
//         { name: 'APEX英雄', icon: '🎯', posts: 6543, online: 210, color: '#FFD3B6' },
//     ];
//
//     // 获取帖子列表
//     const fetchPosts = async (page: number = 0) => {
//         try {
//             setLoading(true);
//             const response: PostListResponse = await PostsApi.getPosts(page, 20);
//
//             if (page === 0) {
//                 setPosts(response.posts);
//             } else {
//                 setPosts(prev => [...prev, ...response.posts]);
//             }
//
//             setCurrentPage(response.currentPage);
//             setTotalPages(response.totalPages);
//             setTotalPosts(response.totalCount);
//         } catch (error) {
//             console.error('获取帖子失败:', error);
//             message.error('获取帖子列表失败，请稍后重试');
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     // 搜索帖子
//     const handleSearch = async (keyword: string) => {
//         if (!keyword.trim()) {
//             fetchPosts(0);
//             return;
//         }
//
//         try {
//             setSearchLoading(true);
//             const response = await PostsApi.searchPosts(keyword, 0, 20);
//             setPosts(response.posts);
//             setCurrentPage(response.currentPage);
//             setTotalPages(response.totalPages);
//             message.success(`找到 ${response.totalCount} 条相关内容`);
//         } catch (error) {
//             console.error('搜索失败:', error);
//             message.error('搜索失败，请稍后重试');
//         } finally {
//             setSearchLoading(false);
//         }
//     };
//
//     // 获取活跃用户
//     const fetchActiveUsers = async () => {
//         try {
//             const users = await UsersApi.getActiveUsers(0, 5);
//             setActiveUsers(users);
//         } catch (error) {
//             console.error('获取活跃用户失败:', error);
//         }
//     };
//
//     // 获取当前用户信息
//     const fetchCurrentUser = async () => {
//         if (AuthApi.isAuthenticated()) {
//             try {
//                 const user = await AuthApi.getCurrentUser();
//                 setCurrentUser(user);
//             } catch (error) {
//                 console.error('获取用户信息失败:', error);
//             }
//         }
//     };
//
//     // 删除帖子
//     const handleDeletePost = async (postId: number) => {
//         try {
//             await PostsApi.deletePost(postId);
//             message.success('删除成功');
//             fetchPosts(currentPage);
//         } catch (error) {
//             message.error('删除失败');
//         }
//     };
//
//     // 点赞帖子（前端模拟，实际需要后端支持）
//     const handleLikePost = (postId: number) => {
//         setLikedPosts(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(postId)) {
//                 newSet.delete(postId);
//                 message.success('取消点赞');
//             } else {
//                 newSet.add(postId);
//                 message.success('点赞成功');
//             }
//             return newSet;
//         });
//     };
//
//     // 加载更多
//     const loadMore = () => {
//         if (currentPage < totalPages - 1 && !loading) {
//             fetchPosts(currentPage + 1);
//         }
//     };
//
//     // 初始化数据
//     useEffect(() => {
//         fetchPosts(0);
//         // fetchActiveUsers();
//         fetchCurrentUser();
//     }, []);
//
//     // 渲染帖子卡片
//     const renderPostCard = (post: Post) => (
//         <Card
//             key={post.postId}
//             hoverable
//             style={{
//                 marginBottom: 16,
//                 background: darkMode ? '#1a1a1a' : '#fff',
//                 borderColor: darkMode ? '#333' : '#f0f0f0',
//             }}
//             onClick={() => router.push(`/post/${post.postId}`)}
//         >
//             <Space direction="vertical" style={{ width: '100%' }}>
//                 <div>
//                     <Space size="small">
//                         <Tag color="volcano">游戏</Tag>
//                         <Text type="secondary" style={{ fontSize: 12 }}>
//                             {new Date(post.createdDate).toLocaleDateString()}
//                         </Text>
//                     </Space>
//                 </div>
//
//                 <Title level={4} style={{
//                     margin: '8px 0',
//                     color: darkMode ? '#fff' : '#000',
//                     fontSize: '18px',
//                     fontWeight: 600,
//                 }}>
//                     {post.title}
//                 </Title>
//
//                 {post.bodyPlain && (
//                     <Paragraph
//                         ellipsis={{ rows: 2 }}
//                         style={{
//                             margin: '8px 0',
//                             color: darkMode ? '#999' : '#666'
//                         }}
//                     >
//                         {post.bodyPlain.substring(0, 150)}...
//                     </Paragraph>
//                 )}
//
//                 <Space split={<Divider type="vertical" />}>
//                     <Space size={4}>
//                         <Avatar
//                             size="small"
//                             icon={<UserOutlined />}
//                             style={{ backgroundColor: '#87d068' }}
//                         />
//                         <Text type="secondary">
//                             {post.authorNickname || post.authorName || `用户${post.authorId}`}
//                         </Text>
//                     </Space>
//                 </Space>
//
//                 <Row gutter={24} style={{ marginTop: 12 }}>
//                     <Col span={6}>
//                         <Statistic
//                             value={post.viewCount || 0}
//                             prefix={<EyeOutlined />}
//                             valueStyle={{ fontSize: 14, color: darkMode ? '#a0a0a0' : '#666' }}
//                         />
//                     </Col>
//                     <Col span={6}>
//                         <Statistic
//                             value={post.replyCount || 0}
//                             prefix={<MessageOutlined />}
//                             valueStyle={{ fontSize: 14, color: darkMode ? '#a0a0a0' : '#666' }}
//                         />
//                     </Col>
//                     <Col span={6}>
//                         <Statistic
//                             value={post.likeCount + (likedPosts.has(post.postId) ? 1 : 0)}
//                             prefix={
//                                 <LikeOutlined
//                                     style={{ color: likedPosts.has(post.postId) ? '#ff4d4f' : undefined }}
//                                 />
//                             }
//                             valueStyle={{
//                                 fontSize: 14,
//                                 color: likedPosts.has(post.postId) ? '#ff4d4f' : darkMode ? '#a0a0a0' : '#666'
//                             }}
//                         />
//                     </Col>
//                     <Col span={6}>
//                         <Space>
//                             <Button
//                                 type="text"
//                                 icon={<HeartOutlined />}
//                                 size="small"
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     message.info('收藏功能开发中');
//                                 }}
//                             >
//                                 收藏
//                             </Button>
//                             <Button
//                                 type="text"
//                                 icon={<ShareAltOutlined />}
//                                 size="small"
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     message.info('分享功能开发中');
//                                 }}
//                             >
//                                 分享
//                             </Button>
//                             {currentUser && currentUser.userId === post.authorId && (
//                                 <Button
//                                     type="text"
//                                     danger
//                                     size="small"
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleDeletePost(post.postId);
//                                     }}
//                                 >
//                                     删除
//                                 </Button>
//                             )}
//                         </Space>
//                     </Col>
//                 </Row>
//             </Space>
//         </Card>
//     );
//
//     // 渲染游戏板块
//     const renderGameBoard = (board: any) => (
//         <Card
//             hoverable
//             style={{
//                 background: `linear-gradient(135deg, ${board.color}20 0%, ${board.color}10 100%)`,
//                 borderColor: board.color,
//                 borderWidth: 2,
//                 marginBottom: 16,
//                 cursor: 'pointer',
//             }}
//         >
//             <Space direction="vertical" align="center" style={{ width: '100%' }}>
//                 <div style={{ fontSize: 48 }}>{board.icon}</div>
//                 <Title level={5} style={{ margin: 0 }}>{board.name}</Title>
//                 <Space>
//                     <Text type="secondary" style={{ fontSize: 12 }}>
//                         帖子 {board.posts}
//                     </Text>
//                     <Divider type="vertical" />
//                     <Text type="success" style={{ fontSize: 12 }}>
//                         <Badge status="processing" />
//                         在线 {board.online}
//                     </Text>
//                 </Space>
//             </Space>
//         </Card>
//     );
//
//     // 主题配置
//     const darkTheme = {
//         algorithm: theme.darkAlgorithm,
//         token: {
//             colorPrimary: '#FF6B6B',
//             colorBgContainer: '#1a1a1a',
//             colorBgElevated: '#262626',
//             colorBgLayout: '#0d0d0d',
//         },
//     };
//
//     return (
//         <ConfigProvider theme={darkMode ? darkTheme : undefined}>
//             <ProLayout
//                 title="GameVault"
//                 logo="🎮"
//                 layout="top"
//                 contentWidth="Fixed"
//                 fixedHeader
//                 navTheme={darkMode ? "realDark" : "light"}
//
//                 route={{
//                     path: '/',
//                     routes: [
//                         { path: '/home', name: '首页', icon: <AppstoreOutlined /> },
//                         { path: '/games', name: '游戏板块', icon: <AppstoreOutlined /> },
//                         { path: '/community', name: '社区', icon: <TeamOutlined /> },
//                         { path: '/ranking', name: '排行榜', icon: <BarChartOutlined /> },
//                         { path: '/news', name: '资讯', icon: <GlobalOutlined /> },
//                     ],
//                 }}
//                 rightContentRender={() => (
//                     <Space size="large">
//                         <Search
//                             placeholder="搜索帖子"
//                             style={{ width: 240 }}
//                             loading={searchLoading}
//                             onSearch={handleSearch}
//                             enterButton
//                         />
//                         <Badge count={5} dot>
//                             <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
//                         </Badge>
//                         {currentUser ? (
//                             <Avatar
//                                 src={currentUser.avatarUrl}
//                                 icon={!currentUser.avatarUrl && <UserOutlined />}
//                                 onClick={() => router.push(`/profile/${currentUser.userId}`)}
//                                 style={{ cursor: 'pointer' }}
//                             />
//                         ) : (
//                             <Button
//                                 type="primary"
//                                 onClick={() => router.push('/login')}
//                             >
//                                 登录
//                             </Button>
//                         )}
//                         <Button
//                             type="text"
//                             onClick={() => setDarkMode(!darkMode)}
//                             icon={darkMode ? '☀️' : '🌙'}
//                         />
//                     </Space>
//                 )}
//             >
//                 <PageContainer
//                     header={{ title: null, breadcrumb: {} }}
//                     style={{
//                         background: darkMode ? '#0d0d0d' : '#f0f2f5',
//                         minHeight: '100vh',
//                     }}
//                 >
//                     {/* 轮播Banner */}
//                     <Card style={{ marginBottom: 24, padding: 0 }}>
//                         <Carousel autoplay>
//                             <div>
//                                 <div style={{
//                                     height: 300,
//                                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     color: '#fff',
//                                 }}>
//                                     <Space direction="vertical" align="center">
//                                         <Title level={1} style={{ color: '#fff', margin: 0 }}>
//                                             欢迎来到 GameVault
//                                         </Title>
//                                         <Text style={{ color: '#fff', fontSize: 18 }}>
//                                             游戏玩家的交流社区
//                                         </Text>
//                                         {AuthApi.isAuthenticated() ? (
//                                             <Button
//                                                 type="primary"
//                                                 size="large"
//                                                 style={{ marginTop: 16 }}
//                                                 onClick={() => router.push('/post/create')}
//                                             >
//                                                 发布新帖
//                                             </Button>
//                                         ) : (
//                                             <Button
//                                                 type="primary"
//                                                 size="large"
//                                                 style={{ marginTop: 16 }}
//                                                 onClick={() => router.push('/login')}
//                                             >
//                                                 立即加入
//                                             </Button>
//                                         )}
//                                     </Space>
//                                 </div>
//                             </div>
//                         </Carousel>
//                     </Card>
//
//                     {/* 统计数据 */}
//                     <Row gutter={16} style={{ marginBottom: 24 }}>
//                         <Col xs={12} sm={6}>
//                             <Card>
//                                 <Statistic
//                                     title="今日发帖"
//                                     value={forumStats.todayPosts}
//                                     prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
//                                     valueStyle={{ color: '#1890ff' }}
//                                 />
//                             </Card>
//                         </Col>
//                         <Col xs={12} sm={6}>
//                             <Card>
//                                 <Statistic
//                                     title="在线用户"
//                                     value={forumStats.onlineUsers}
//                                     prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
//                                     valueStyle={{ color: '#52c41a' }}
//                                 />
//                             </Card>
//                         </Col>
//                         <Col xs={12} sm={6}>
//                             <Card>
//                                 <Statistic
//                                     title="总帖子数"
//                                     value={totalPosts}
//                                     prefix={<FileTextOutlined style={{ color: '#faad14' }} />}
//                                     valueStyle={{ color: '#faad14' }}
//                                 />
//                             </Card>
//                         </Col>
//                         <Col xs={12} sm={6}>
//                             <Card>
//                                 <Statistic
//                                     title="注册用户"
//                                     value={forumStats.totalUsers}
//                                     prefix={<UserOutlined style={{ color: '#722ed1' }} />}
//                                     valueStyle={{ color: '#722ed1' }}
//                                 />
//                             </Card>
//                         </Col>
//                     </Row>
//
//                     <Row gutter={24}>
//                         {/* 左侧内容区 */}
//                         <Col xs={24} lg={16}>
//                             <Card style={{ marginBottom: 24 }}>
//                                 <Tabs
//                                     activeKey={activeTab}
//                                     onChange={setActiveTab}
//                                     size="large"
//                                 >
//                                     <TabPane
//                                         tab={
//                                             <span>
//                         <ClockCircleOutlined style={{ color: '#52c41a' }} />
//                         最新发布
//                       </span>
//                                         }
//                                         key="latest"
//                                     >
//                                         <Spin spinning={loading}>
//                                             {posts.length > 0 ? (
//                                                 <>
//                                                     {posts.map(post => renderPostCard(post))}
//                                                     {currentPage < totalPages - 1 && (
//                                                         <div style={{ textAlign: 'center', marginTop: 24 }}>
//                                                             <Button
//                                                                 type="primary"
//                                                                 size="large"
//                                                                 onClick={loadMore}
//                                                                 loading={loading}
//                                                             >
//                                                                 加载更多
//                                                             </Button>
//                                                         </div>
//                                                     )}
//                                                 </>
//                                             ) : (
//                                                 <Empty description="暂无帖子" />
//                                             )}
//                                         </Spin>
//                                     </TabPane>
//
//                                     <TabPane
//                                         tab={
//                                             <span>
//                         <FireOutlined style={{ color: '#ff4d4f' }} />
//                         热门讨论
//                       </span>
//                                         }
//                                         key="hot"
//                                     >
//                                         <Empty description="热门功能开发中" />
//                                     </TabPane>
//
//                                     <TabPane
//                                         tab={
//                                             <span>
//                         <StarOutlined style={{ color: '#faad14' }} />
//                         精华帖
//                       </span>
//                                         }
//                                         key="essence"
//                                     >
//                                         <Empty description="精华功能开发中" />
//                                     </TabPane>
//                                 </Tabs>
//                             </Card>
//                         </Col>
//
//                         {/* 右侧边栏 */}
//                         <Col xs={24} lg={8}>
//                             {/* 发帖按钮 */}
//                             {AuthApi.isAuthenticated() && (
//                                 <Card style={{ marginBottom: 16 }}>
//                                     <Button
//                                         type="primary"
//                                         size="large"
//                                         block
//                                         icon={<PlusOutlined />}
//                                         style={{
//                                             height: 48,
//                                             fontSize: 16,
//                                             background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
//                                         }}
//                                         onClick={() => router.push('/post/create')}
//                                     >
//                                         发布新帖
//                                     </Button>
//                                 </Card>
//                             )}
//
//                             {/* 游戏板块 */}
//                             <Card
//                                 title={
//                                     <Space>
//                                         <AppstoreOutlined />
//                                         <span>热门游戏板块</span>
//                                     </Space>
//                                 }
//                                 extra={<a>查看全部</a>}
//                                 style={{ marginBottom: 16 }}
//                             >
//                                 <Row gutter={[8, 8]}>
//                                     {gameBoards.slice(0, 6).map((board, index) => (
//                                         <Col span={12} key={index}>
//                                             {renderGameBoard(board)}
//                                         </Col>
//                                     ))}
//                                 </Row>
//                             </Card>
//
//                             {/* 活跃用户榜 */}
//                             <Card
//                                 title={
//                                     <Space>
//                                         <TeamOutlined />
//                                         <span>活跃用户</span>
//                                     </Space>
//                                 }
//                                 style={{ marginBottom: 16 }}
//                             >
//                                 <List
//                                     dataSource={activeUsers}
//                                     renderItem={(user, index) => (
//                                         <List.Item>
//                                             <List.Item.Meta
//                                                 avatar={
//                                                     <Badge
//                                                         count={index + 1}
//                                                         style={{
//                                                             backgroundColor:
//                                                                 index === 0 ? '#FFD700' :
//                                                                     index === 1 ? '#C0C0C0' :
//                                                                         index === 2 ? '#CD7F32' : '#52c41a'
//                                                         }}
//                                                     >
//                                                         <Avatar
//                                                             src={user.avatarUrl}
//                                                             icon={!user.avatarUrl && <UserOutlined />}
//                                                         />
//                                                     </Badge>
//                                                 }
//                                                 title={
//                                                     <a onClick={() => router.push(`/profile/${user.userId}`)}>
//                                                         {user.nickname || user.username}
//                                                     </a>
//                                                 }
//                                                 description={user.bio || '这个人很懒，什么都没有留下'}
//                                             />
//                                         </List.Item>
//                                     )}
//                                 />
//                             </Card>
//
//                             {/* 热门标签 */}
//                             <Card
//                                 title={
//                                     <Space>
//                                         <TagsOutlined />
//                                         <span>热门标签</span>
//                                     </Space>
//                                 }
//                             >
//                                 <Space wrap>
//                                     <Tag color="magenta">3A大作</Tag>
//                                     <Tag color="red">独立游戏</Tag>
//                                     <Tag color="volcano">开放世界</Tag>
//                                     <Tag color="orange">RPG</Tag>
//                                     <Tag color="gold">FPS</Tag>
//                                     <Tag color="lime">MOBA</Tag>
//                                     <Tag color="green">生存</Tag>
//                                     <Tag color="cyan">恐怖</Tag>
//                                     <Tag color="blue">策略</Tag>
//                                     <Tag color="geekblue">卡牌</Tag>
//                                     <Tag color="purple">二次元</Tag>
//                                 </Space>
//                             </Card>
//                         </Col>
//                     </Row>
//                 </PageContainer>
//             </ProLayout>
//         </ConfigProvider>
//     );
// }
//
//
//
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

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { darkAlgorithm } = theme;

// 在你的主页组件中

const HomePage = () => {
    const router = useRouter();

    const handleCommunityClick = () => {
        router.push(navigationRoutes.community); // 跳转到 /dashboard/forum
    };

    const handleGamesClick = () => {
        router.push(navigationRoutes.games); // 跳转到 /dashboard/forum/category/games
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
        router.push(navigationRoutes.community);
    };

    const handleGamesClick = () => {
        router.push(navigationRoutes.games);
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
                            <Space size="large">
                                <Button type="text" style={{ color: '#fff' }}>商店</Button>
                                <Button type="text" style={{ color: '#fff' }} onClick={handleCommunityClick}>Forum</Button>
                                <Button type="text" style={{ color: '#fff' }}>游戏库</Button>
                                <Button type="text" style={{ color: '#fff' }}>市场</Button>
                                <Button
                                    type="text"
                                    style={{ color: '#fff' }}
                                    onClick={() => router.push(navigationRoutes.developer)}
                                >
                                    developer community
                                </Button>

                            </Space>
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