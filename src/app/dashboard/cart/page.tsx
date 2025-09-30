'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ProLayout,
  ProCard,
} from '@ant-design/pro-components';
import {
  Row, Col, Space, Button, Typography, ConfigProvider,
  theme, List, Avatar, InputNumber, Divider, message
} from 'antd';
import {
  UserOutlined, DeleteOutlined, WalletOutlined, CreditCardOutlined
} from '@ant-design/icons';

import { cartApi } from '../../features/shopping/services/cartApi';
import { profileApi, ProfileDTO } from '../../features/shopping/services/profileApi';
import { apiClient } from '@/lib/api/client';
import { ENV } from '@/config/env';
import type { CartDTO, CartItemDTO, OrderDTO } from '../../features/shopping/types/storeTypes';

const { Title, Text } = Typography;
const { darkAlgorithm } = theme;

const CartPage = () => {
  const router = useRouter();
  const [cart, setCart] = useState<CartDTO | null>(null);
  const [user, setUser] = useState<ProfileDTO | null>(null);
  const [loading, setLoading] = useState(false);

  // 加载用户 + 购物车
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 局部注入 DEV_TOKEN
        if (ENV.DEV_TOKEN) {
          apiClient.setAuthToken(ENV.DEV_TOKEN);
        }

        const profile = await profileApi.getProfile();
        setUser(profile);

        const cartData = await cartApi.getCart(profile.uid);
        setCart(cartData);
      } catch (err) {
        console.error(err);
        message.error('加载购物车失败');
      }
    };
    fetchData();
  }, []);

  // 删除
  const handleRemove = async (gameId: number) => {
    if (!user) return;
    try {
      const updated = await cartApi.removeFromCart(user.uid, gameId);
      setCart(updated);
    } catch {
      message.error('移除失败');
    }
  };

  // 清空
  const handleClear = async () => {
    if (!user) return;
    try {
      const updated = await cartApi.clearCart(user.uid);
      setCart(updated);
    } catch {
      message.error('清空失败');
    }
  };

  // 结账
  const handleCheckout = async (method: string) => {
    if (!user) return;
    try {
      const order: OrderDTO = await cartApi.checkout(user.uid, method);
      message.success(`结账成功，订单号 ${order.orderId}`);
      router.push('/dashboard/orders/');
    } catch {
      message.error('结账失败');
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
      <ProLayout
        title="GameVault"
        logo="https://via.placeholder.com/40x40/6366f1/ffffff?text=GV"
        layout="top"
        fixedHeader
        navTheme="realDark"
        contentWidth="Fixed"
      >
        <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '20px' }}>
          <Title level={2} style={{ color: '#fff' }}>购物车</Title>
          <Divider />

          <Row gutter={24}>
            {/* 左侧：购物车列表 */}
            <Col span={16}>
              <ProCard loading={loading}>
                <List
                  itemLayout="horizontal"
                  dataSource={cart?.cartItems || []}
                  locale={{ emptyText: '购物车空空如也' }}
                  renderItem={(item: CartItemDTO) => (
                    <List.Item
                      key={item.cartItemId}
                      actions={[
                        <Button
                          key={`remove-btn-${item.cartItemId}`}
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemove(item.game.gameId)}
                        >
                          删除
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar src={item.game.imageUrl} shape="square" size={64} icon={<UserOutlined />} />}
                        title={<Text style={{ color: '#fff' }}>{item.game.title}</Text>}
                        description={
                          <Space>
                            <Text type="secondary">{item.game.genre}</Text>
                            <Text type="secondary">{item.game.platform}</Text>
                          </Space>
                        }
                      />
                      <Space direction="vertical" align="end">
                        <InputNumber
                          min={1}
                          defaultValue={item.quantity}
                          onChange={(qty) =>
                            user && cartApi.addToCart(user.uid, item.game.gameId, Number(qty)).then(setCart)
                          }
                        />
                        <Text strong style={{ color: '#52c41a' }}>¥{item.subtotal}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </ProCard>

              {cart && cart.cartItems.length > 0 && (
                <Button danger block style={{ marginTop: 16 }} onClick={handleClear}>
                  清空购物车
                </Button>
              )}
            </Col>

            {/* 右侧：订单摘要 */}
            <Col span={8}>
              <ProCard title="订单摘要">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row justify="space-between">
                    <Text type="secondary">商品总价</Text>
                    <Text>¥{cart?.discountAmount ? cart.finalAmount + cart.discountAmount : cart?.finalAmount ?? 0}</Text>
                  </Row>
                  <Row justify="space-between">
                    <Text type="secondary">优惠</Text>
                    <Text>- ¥{cart?.discountAmount ?? 0}</Text>
                  </Row>
                  <Divider />
                  <Row justify="space-between">
                    <Title level={4} style={{ margin: 0, color: '#fff' }}>应付金额</Title>
                    <Title level={4} style={{ margin: 0, color: '#52c41a' }}>¥{cart?.finalAmount ?? 0}</Title>
                  </Row>

                  <Divider />
                  <Button
                    type="primary"
                    icon={<WalletOutlined />}
                    block
                    size="large"
                    onClick={() => handleCheckout('WALLET')}
                  >
                    钱包支付
                  </Button>
                  <Button
                    type="default"
                    icon={<CreditCardOutlined />}
                    block
                    size="large"
                    onClick={() => handleCheckout('CREDIT_CARD')}
                  >
                    信用卡支付
                  </Button>
                </Space>
              </ProCard>
            </Col>
          </Row>
        </div>
      </ProLayout>
    </ConfigProvider>
  );
};

export default CartPage;
