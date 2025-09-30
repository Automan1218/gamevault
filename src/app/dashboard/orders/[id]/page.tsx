'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  List,
  Avatar,
  Typography,
  Spin,
  Result,
  Button,
  Space,
  Card,
  Divider,
  message,
} from 'antd';
import { orderApi } from '../../../features/shopping/services/orderApi';
import type { OrderDTO, OrderItemDTO } from '../../../features/shopping/types/storeTypes';
import { apiClient } from '@/lib/api/client';
import { ENV } from '@/config/env';

const { Title, Text } = Typography;

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params?.id);

  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      console.error('加载订单失败', err);
      setError('加载失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ⚠️ 开发环境使用 DEV_TOKEN，生产环境走登录态
    apiClient.setAuthToken(ENV.DEV_TOKEN);

    if (!Number.isNaN(orderId)) fetchOrder();
  }, [orderId]);

  // 模拟支付成功
  const handlePay = async () => {
    try {
      if (!order) return;
      const updated = await orderApi.payOrder(order.orderId);
      message.success('支付成功');
      setOrder(updated);
    } catch {
      message.error('支付失败');
    }
  };

  // 模拟支付失败
  const handleFail = async () => {
    try {
      if (!order) return;
      await orderApi.failOrder(order.orderId);
      message.error('支付失败，订单已更新');
      fetchOrder(); // 重新拉取订单
    } catch {
      message.error('操作失败');
    }
  };

  if (loading) return <Spin style={{ margin: 40 }} />;
  if (error) {
    return (
      <Result
        status="error"
        title="订单加载失败"
        subTitle={error}
        extra={<Button onClick={() => router.back()}>返回</Button>}
      />
    );
  }
  if (!order) return null;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: 24 }}>
      <Card style={{ maxWidth: 900, margin: '0 auto', background: '#111', borderColor: '#333' }}>
        <Title level={3} style={{ color: '#fff' }}>
          订单 #{order.orderId}
        </Title>
        <Text style={{ color: '#aaa' }}>
          下单时间：{new Date(order.orderDate).toLocaleString()}
        </Text>
        <Divider />

        <List
          itemLayout="horizontal"
          dataSource={order.orderItems}
          renderItem={(item: OrderItemDTO) => (
            <List.Item
              key={item.orderItemId}
              style={{ alignItems: 'center' }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={item.imageUrl || 'https://via.placeholder.com/64x64?text=Game'}
                    shape="square"
                    size={64}
                  />
                }
                title={<Text style={{ color: '#fff' }}>{item.gameTitle}</Text>}
              />

              {/* 右侧价格 + 激活码 */}
              <Space direction="vertical" align="end" style={{ minWidth: 200 }}>
                <Text style={{ color: '#ccc' }}>单价 ¥{item.unitPrice}</Text>
                {item.activationCode && (
                  <Text copyable style={{ color: '#52c41a' }}>
                    激活码: {item.activationCode}
                  </Text>
                )}
              </Space>
            </List.Item>
          )}
        />
        <Divider />
        <div style={{ textAlign: 'right' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text style={{ color: '#aaa' }}>支付方式：{order.paymentMethod}</Text>
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              总金额 ¥{order.finalAmount}
            </Title>
            <Text style={{ color: '#aaa' }}>订单状态：{order.status}</Text>
          </Space>
        </div>

        <Divider />
        <Space>
          <Button type="primary" onClick={handlePay}>
            模拟支付成功
          </Button>
          <Button danger onClick={handleFail}>
            模拟支付失败
          </Button>
        </Space>
      </Card>
    </div>
  );
}
