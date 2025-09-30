'use client';
import React, { useEffect, useState } from 'react';
import { List, Avatar, Typography, Spin, Button, Space, Card, Divider, message, Pagination } from 'antd';
import { useRouter } from 'next/navigation';
import { orderApi } from '../../features/shopping/services/orderApi';
import type { OrderDTO, OrderItemDTO } from '../../features/shopping/types/storeTypes';
import { apiClient } from '@/lib/api/client';
import { ENV } from '@/config/env';

const { Title, Text } = Typography;

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      apiClient.setAuthToken(ENV.DEV_TOKEN);
      const data = await orderApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('加载订单失败', err);
      message.error('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePay = async (orderId: number) => {
    try {
      const updated = await orderApi.payOrder(orderId);
      message.success(`订单 ${orderId} 支付成功`);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === updated.orderId ? updated : o))
      );
    } catch {
      message.error('支付失败');
    }
  };

  const pagedOrders = orders.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <Spin style={{ margin: 40 }} />;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: 24 }}>
      <Title level={2} style={{ color: '#fff' }}>我的订单</Title>
      <Divider />

      {pagedOrders.map((order) => (
        <Card
          key={order.orderId}
          style={{ marginBottom: 24, background: '#111', borderColor: '#333', cursor: 'pointer' }}
          hoverable
          onClick={() => router.push(`/dashboard/orders/${order.orderId}`)} // ✅ 点击跳详情
        >
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              订单 #{order.orderId}
            </Title>
            <Button
              type="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // ✅ 阻止冒泡，不触发卡片跳转
                handlePay(order.orderId);
              }}
              disabled={order.status === 'PAID' || order.status === 'COMPLETED'}
            >
              模拟支付成功
            </Button>
          </Space>
          <Text style={{ color: '#aaa' }}>
            下单时间：{new Date(order.orderDate).toLocaleString()}
          </Text>
          <Divider style={{ borderColor: '#333' }} />

          <List
            itemLayout="horizontal"
            dataSource={order.orderItems}
            renderItem={(item: OrderItemDTO) => (
              <List.Item key={item.orderItemId}>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={item.imageUrl || 'https://via.placeholder.com/64x64?text=Game'}
                      shape="square"
                      size={64}
                    />
                  }
                  title={<Text style={{ color: '#fff' }}>{item.gameTitle}</Text>}
                  description={
                    <Space>
                      <Text type="secondary">单价 ¥{item.unitPrice}</Text>
                      <Text type="secondary">状态 {item.orderStatus}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />

          <Divider style={{ borderColor: '#333' }} />
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text style={{ color: '#aaa' }}>支付方式：{order.paymentMethod}</Text>
            <Title level={5} style={{ color: '#52c41a', margin: 0 }}>
              总金额 ¥{order.finalAmount}
            </Title>
            <Text style={{ color: '#aaa' }}>订单状态：{order.status}</Text>
          </Space>
        </Card>
      ))}

      <Pagination
        current={page}
        pageSize={pageSize}
        total={orders.length}
        onChange={(p) => setPage(p)}
        style={{ marginTop: 16, textAlign: 'center' }}
      />
    </div>
  );
}
