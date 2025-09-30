'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ProLayout,
  ProCard,
} from '@ant-design/pro-components';
import {
  Row, Col, Space, Button, Input, Badge, Avatar, Dropdown,
  Tag, Typography, ConfigProvider, theme, Card, List
} from 'antd';
import {
  SearchOutlined, ShoppingCartOutlined, BellOutlined, UserOutlined,
  AppstoreOutlined
} from '@ant-design/icons';

import { shoppingApi } from '../../features/shopping/services/shoppingApi';
import type { GameDTO } from '../../features/shopping/types/storeTypes';
import { apiClient } from '@/lib/api/client';


const { Title, Text } = Typography;
const { Search } = Input;
const { darkAlgorithm } = theme;

const ShoppingPage = () => {
  const router = useRouter();
  const [games, setGames] = useState<GameDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGames = async (params?: { q?: string; genre?: string; platform?: string }) => {
    try {
      setLoading(true);
      const response = await shoppingApi.getGames(params);
      setGames(response); // 后端直接返回 List<GameDTO>
    } catch (error) {
      console.error('加载游戏列表失败', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 不要加 "Bearer " 前缀，只放纯 token 字符串
    apiClient.setAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidGVzdHVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJhdmF0YXIiOiJodHRwczovL2V4YW1wbGUuY29tL2F2YXRhci5wbmciLCJpYXQiOjE2OTAwMDAwMDAsImV4cCI6MTk5MDAwMzYwMH0.YAQAR5si4csks7-fwd06xHOqXDGqkVxnxJJLsRD-AUY'); 
    fetchGames();
  }, []);


  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
      <ProLayout
        title="GameVault"
        logo="https://via.placeholder.com/40x40/6366f1/ffffff?text=GV"
        layout="top"
        fixedHeader
        navTheme="realDark"
        contentWidth="Fixed"
        onClick={()=>router.push('/dashboard')}
        headerContentRender={() => (
          <Row align="middle" style={{ width: '100%' }}>
            <Col flex="auto">
              <Space size="large">
                <Button type="text" style={{ color: '#fff' }}>Store</Button>
                <Button type="text" style={{ color: '#fff' }} onClick={() => router.push('/dashboard/forum')}>Forum</Button>
                <Button type="text" style={{ color: '#fff' }}>Library</Button>
                <Button type="text" style={{ color: '#fff' }}>市场</Button>
              </Space>
            </Col>
            <Col>
              <Space size="middle">
                <Search
                  placeholder="搜索游戏"
                  style={{ width: 300 }}
                  prefix={<SearchOutlined />}
                  onSearch={(value) => fetchGames({ q: value })}
                />
                <Badge count={3}><Button type="text" icon={<BellOutlined />} style={{ color: '#fff' }} /></Badge>
                <Badge count={2}><Button type="text" icon={<ShoppingCartOutlined />} style={{ color: '#fff' }} onClick = {()=> router.push('/dashboard/cart')}/></Badge>
                <Dropdown menu={{ items: [{ key: 'profile', label: '个人资料' }] }}>
                  <Avatar size="small" icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
                </Dropdown>
              </Space>
            </Col>
          </Row>
        )}
      >
        <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '20px' }}>
          {/* 游戏列表 */}
          <Row gutter={[16, 16]}>
            <Col span={18}>
              <Row gutter={[16, 16]}>
                {games.map((game) => (
                  <Col span={8} key={game.gameId}>
                    <Card
                      hoverable
                      cover={<img src={game.imageUrl} alt={game.title} />}
                      loading={loading}
                      onClick={() => router.push(`/dashboard/shopping/${game.gameId}`)}
                    >
                      <Card.Meta title={<Text strong>{game.title}</Text>} description={game.developer} />
                      <Space wrap style={{ marginTop: 8 }}>
                        {game.genre && <Tag>{game.genre}</Tag>}
                        {game.platform && <Tag>{game.platform}</Tag>}
                      </Space>
                      <div style={{ marginTop: 8 }}>
                        {game.discountPrice < game.price && <Text delete>¥{game.price}</Text>}
                        <Title level={4} style={{ display: 'inline', marginLeft: 8, color: '#52c41a' }}>
                          ¥{game.discountPrice}
                        </Title>
                      </div>
                      <Button type="primary" icon={<ShoppingCartOutlined />} block style={{ marginTop: 8 }}>
                        加入购物车
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>

            {/* 侧边栏 */}
            <Col span={6}>
              <ProCard title="销量排行榜" style={{ marginBottom: 24 }}>
                <List
                  dataSource={games.slice(0, 5)} // 取前 5 个作为占位
                  renderItem={item => <List.Item>{item.title}</List.Item>}
                />
              </ProCard>
              <ProCard title="推荐标签">
                <Space wrap>
                  <Tag color="blue">RPG</Tag>
                  <Tag color="green">动作</Tag>
                  <Tag color="purple">开放世界</Tag>
                </Space>
              </ProCard>
            </Col>
          </Row>
        </div>
      </ProLayout>
    </ConfigProvider>
  );
};

export default ShoppingPage;
