'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Row, Col, Typography, Spin, Button, Tag, Space, Result, Card, Divider, message
} from 'antd';
import { ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons';
import { shoppingApi } from '../../../features/shopping/services/shoppingApi';
import { cartApi } from '../../../features/shopping/services/cartApi';
import { profileApi, ProfileDTO } from '../../../features/shopping/services/profileApi';
import { apiClient } from '@/lib/api/client';
import { ENV } from '@/config/env';
import type { GameDTO } from '../../../features/shopping/types/storeTypes';

const { Title, Text, Paragraph } = Typography;

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = Number(params?.id);

  const [game, setGame] = useState<GameDTO | null>(null);
  const [user, setUser] = useState<ProfileDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 局部注入 DEV_TOKEN
    if (ENV.DEV_TOKEN) {
      apiClient.setAuthToken(ENV.DEV_TOKEN);
    }

    const fetchProfile = async () => {
      try {
        const profile = await profileApi.getProfile();
        setUser(profile);
      } catch (err) {
        console.error('加载用户信息失败', err);
      }
    };
    fetchProfile();

    const fetchGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await shoppingApi.getGameById(gameId);
        setGame(data);
      } catch (err) {
        console.error('加载游戏详情失败', err);
        setError('加载失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    if (!Number.isNaN(gameId)) fetchGame();
  }, [gameId]);

  if (loading) return <Spin style={{ margin: 40 }} />;
  if (error) {
    return (
      <Result
        status="error"
        title="游戏详情加载失败"
        subTitle={error}
        extra={<Button onClick={() => router.back()}>返回</Button>}
      />
    );
  }
  if (!game) return null;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 40 }}>
      {/* 顶部 Banner */}
      <div style={{ width: '100%', height: 400, overflow: 'hidden', background: '#000' }}>
        <img
          src={game.imageUrl || 'https://via.placeholder.com/1200x400?text=Game+Banner'}
          alt={game.title}
          style={{ width: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* 主体内容 */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Row gutter={32}>
          {/* 左侧：详情 */}
          <Col span={16}>
            <Title level={2} style={{ color: '#fff' }}>{game.title}</Title>
            <Text type="secondary">{game.developer}</Text>
            <Divider style={{ borderColor: '#444' }} />
            <Paragraph style={{ color: '#ddd', fontSize: 16, lineHeight: 1.6 }}>
              {game.description || '暂无游戏介绍'}
            </Paragraph>
            <Space style={{ marginTop: 16 }}>
              {game.genre && <Tag color="blue">{game.genre}</Tag>}
              {game.platform && <Tag color="green">{game.platform}</Tag>}
            </Space>
          </Col>

          {/* 右侧：购买信息 */}
          <Col span={8}>
            <Card style={{ background: '#111', borderColor: '#333' }}>
              <div style={{ marginBottom: 12 }}>
                {game.discountPrice < game.price && (
                  <Text delete style={{ fontSize: 16, color: '#999' }}>
                    ¥{game.price}
                  </Text>
                )}
                <Title level={2} style={{ display: 'inline', marginLeft: 8, color: '#52c41a' }}>
                  ¥{game.discountPrice}
                </Title>
              </div>
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                size="large"
                block
                style={{ marginBottom: 12 }}
                onClick={async () => {
                  if (!user) {
                    message.error('请先登录');
                    return;
                  }
                  try {
                    await cartApi.addToCart(user.uid, game.gameId, 1);
                    message.success('已加入购物车');
                    router.push('/dashboard/cart');
                  } catch (err) {
                    console.error('加入购物车失败', err);
                    message.error('加入购物车失败');
                  }
                }}
              >
                加入购物车
              </Button>
              <Button icon={<HeartOutlined />} size="large" block>
                加入愿望单
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
