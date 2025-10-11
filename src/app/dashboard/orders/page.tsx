"use client";

import React, { useState } from "react";
import {
  App,
  Card,
  Button,
  Row,
  Col,
  Layout,
  Empty,
  Skeleton,
  Tag,
  Space,
  Divider,
  Badge,
  Modal,
} from "antd";
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Menubar } from "@/components/layout";
import { useOrders } from "@/app/features/orders/hooks/useOrders";
import { useRouter } from "next/navigation";
import { cardStyle } from "@/components/common/theme";
import type { OrderDTO, OrderItemDTO } from "@/lib/api/StoreTypes";
import "@/components/common/animations.css";

const { Header, Content } = Layout;

export default function OrdersPage() {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const { orders, loading, payOrder, failOrder } = useOrders();

  const [payLoading, setPayLoading] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);

  // 获取订单状态配置
  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { color: string; icon: React.ReactNode; text: string; bgColor: string }
    > = {
      PENDING: {
        color: "gold",
        icon: <ClockCircleOutlined />,
        text: "待支付",
        bgColor: "rgba(250, 173, 20, 0.1)",
      },
      PAID: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "已支付",
        bgColor: "rgba(52, 211, 153, 0.1)",
      },
      COMPLETED: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "已完成",
        bgColor: "rgba(52, 211, 153, 0.1)",
      },
      FAILED: {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "支付失败",
        bgColor: "rgba(239, 68, 68, 0.1)",
      },
      CANCELLED: {
        color: "default",
        icon: <CloseCircleOutlined />,
        text: "已取消",
        bgColor: "rgba(107, 114, 128, 0.1)",
      },
    };
    return configs[status] || configs.PENDING;
  };

  // 处理支付成功
  const handlePaySuccess = (orderId: number) => {
    modal.confirm({
      title: "模拟支付成功",
      icon: <CheckCircleOutlined style={{ color: "#22c55e" }} />,
      content: "确认模拟此订单支付成功吗？",
      okText: "确认",
      cancelText: "取消",
      onOk: async () => {
        setPayLoading(orderId);
        try {
          await payOrder(orderId);
          message.success("支付成功！游戏已添加到您的库中");
        } catch (error) {
          message.error("支付失败，请重试");
        } finally {
          setPayLoading(null);
        }
      },
    });
  };

  // 处理支付失败
  const handlePayFail = (orderId: number) => {
    modal.confirm({
      title: "模拟支付失败",
      icon: <ExclamationCircleOutlined style={{ color: "#ef4444" }} />,
      content: "确认模拟此订单支付失败吗？",
      okText: "确认",
      cancelText: "取消",
      okType: "danger",
      onOk: async () => {
        setPayLoading(orderId);
        try {
          await failOrder(orderId);
          message.error("支付失败");
        } catch (error) {
          message.error("操作失败，请重试");
        } finally {
          setPayLoading(null);
        }
      },
    });
  };

  // 查看订单详情
  const handleViewDetail = (order: OrderDTO) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  // 渲染订单卡片
  const renderOrderCard = (order: OrderDTO, index: number) => {
    const statusConfig = getStatusConfig(order.status);
    const isPending = order.status === "PENDING";

    return (
      <Card
        key={order.orderId}
        className="fade-in-up"
        style={{
          marginBottom: 20,
          ...cardStyle,
          borderRadius: 16,
          animationDelay: `${index * 0.05}s`,
          transition: "all 0.3s ease",
        }}
        bodyStyle={{ padding: 24 }}
      >
        {/* 订单头部 */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Space size={16}>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                订单 #{order.orderId}
              </div>
              <Tag
                icon={statusConfig.icon}
                color={statusConfig.color}
                style={{
                  fontSize: 14,
                  padding: "4px 12px",
                  borderRadius: 8,
                  background: statusConfig.bgColor,
                }}
              >
                {statusConfig.text}
              </Tag>
            </Space>
            <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 6 }}>
              下单时间：{new Date(order.orderDate).toLocaleString("zh-CN")}
            </div>
          </Col>
          <Col>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#22c55e",
                textAlign: "right",
              }}
            >
              ￥{order.finalAmount.toFixed(2)}
            </div>
            <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "right" }}>
              支付方式：{order.paymentMethod || "未选择"}
            </div>
          </Col>
        </Row>

        <Divider style={{ borderColor: "rgba(75, 85, 99, 0.3)", margin: "16px 0" }} />

        {/* 订单商品列表 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 12 }}>
            商品清单：
          </div>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            {order.orderItems.map((item: OrderItemDTO) => (
              <Row
                key={item.orderItemId}
                justify="space-between"
                align="middle"
                style={{
                  padding: "8px 12px",
                  background: "rgba(31, 41, 55, 0.5)",
                  borderRadius: 8,
                }}
              >
                <Col>
                  <Space>
                    <div style={{ color: "#fff", fontSize: 15 }}>
                      {item.gameTitle || `游戏 #${item.gameId}`}
                    </div>
                    {item.discountPrice && item.discountPrice < item.unitPrice && (
                      <Tag color="red" style={{ fontSize: 12 }}>
                        折扣
                      </Tag>
                    )}
                  </Space>
                </Col>
                <Col>
                  <Space size={12}>
                    {item.discountPrice && item.discountPrice < item.unitPrice ? (
                      <>
                        <span style={{ color: "#6b7280", textDecoration: "line-through" }}>
                          ￥{item.unitPrice.toFixed(2)}
                        </span>
                        <span style={{ color: "#22c55e", fontWeight: 600 }}>
                          ￥{item.discountPrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span style={{ color: "#fff", fontWeight: 600 }}>
                        ￥{item.unitPrice.toFixed(2)}
                      </span>
                    )}
                  </Space>
                </Col>
              </Row>
            ))}
          </Space>
        </div>

        {/* 操作按钮 */}
        <Row gutter={12}>
          <Col flex="auto">
            <Button
              size="large"
              block
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(order)}
              style={{
                height: 44,
                borderRadius: 12,
                background: "rgba(99, 102, 241, 0.1)",
                borderColor: "rgba(99, 102, 241, 0.3)",
                color: "#a5b4fc",
              }}
            >
              查看详情
            </Button>
          </Col>
          {isPending && (
            <>
              <Col>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  loading={payLoading === order.orderId}
                  onClick={() => handlePaySuccess(order.orderId)}
                  style={{
                    height: 44,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    border: "none",
                    minWidth: 140,
                  }}
                >
                  模拟支付成功
                </Button>
              </Col>
              <Col>
                <Button
                  danger
                  size="large"
                  icon={<CloseCircleOutlined />}
                  loading={payLoading === order.orderId}
                  onClick={() => handlePayFail(order.orderId)}
                  style={{
                    height: 44,
                    borderRadius: 12,
                    minWidth: 140,
                  }}
                >
                  模拟支付失败
                </Button>
              </Col>
            </>
          )}
        </Row>
      </Card>
    );
  };

  // 骨架屏
  const renderSkeleton = () => (
    <Card
      style={{
        marginBottom: 20,
        ...cardStyle,
        borderRadius: 16,
      }}
    >
      <Skeleton active paragraph={{ rows: 4 }} />
    </Card>
  );

  // 统计信息
  const getStats = () => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const paid = orders.filter((o) => o.status === "PAID" || o.status === "COMPLETED").length;
    const totalAmount = orders.reduce((sum, o) => sum + o.finalAmount, 0);

    return { total, pending, paid, totalAmount };
  };

  const stats = getStats();

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: `
          linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
          linear-gradient(225deg, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
          linear-gradient(180deg, #0f172a 0%, #020617 100%)
        `,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 动态背景装饰 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {/* 网格背景 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            opacity: 0.4,
          }}
        />

        {/* 浮动光球 */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "float 20s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "60%",
            right: "10%",
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(80px)",
            animation: "float 25s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* CSS动画 */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>

      {/* 固定顶部导航栏 */}
      <Header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: 0,
          height: "auto",
          lineHeight: "normal",
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(99, 102, 241, 0.3)",
          boxShadow: "0 4px 24px rgba(99, 102, 241, 0.15), 0 2px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Menubar currentPath="/dashboard/orders" />
      </Header>

      {/* 页面主体内容 */}
      <Content
        style={{
          marginTop: 64,
          padding: "32px 24px 64px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* 页面标题 */}
          <div
            className="fade-in-up"
            style={{
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                background: "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: 8,
              }}
            >
              <ShoppingOutlined style={{ marginRight: 12 }} />
              我的订单
            </div>
            <div style={{ color: "#9ca3af", fontSize: 16 }}>
              查看和管理您的购买记录
            </div>
          </div>

          {/* 统计卡片 */}
          {!loading && orders.length > 0 && (
            <Row gutter={16} style={{ marginBottom: 32 }} className="fade-in-up">
              <Col xs={24} sm={12} md={6}>
                <Card
                  style={{
                    ...cardStyle,
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 8 }}>
                    总订单数
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#6366f1" }}>
                    {stats.total}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  style={{
                    ...cardStyle,
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 8 }}>
                    待支付
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>
                    <Badge count={stats.pending} showZero color="#f59e0b">
                      <span style={{ color: "#f59e0b" }}>{stats.pending}</span>
                    </Badge>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  style={{
                    ...cardStyle,
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 8 }}>
                    已完成
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>
                    {stats.paid}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  style={{
                    ...cardStyle,
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 8 }}>
                    总消费
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>
                    ￥{stats.totalAmount.toFixed(0)}
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {/* 订单列表 */}
          {loading ? (
            // 加载中
            <div>
              {[...Array(3)].map((_, i) => (
                <div key={i}>{renderSkeleton()}</div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            // 空状态
            <div
              className="fade-in-up"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "60vh",
                ...cardStyle,
                borderRadius: 16,
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <div style={{ color: "#9ca3af", fontSize: 18, marginBottom: 16 }}>
                      暂无订单记录
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => router.push("/dashboard/store")}
                      style={{
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        border: "none",
                        height: 44,
                        borderRadius: 12,
                      }}
                    >
                      去商店购物
                    </Button>
                  </div>
                }
              />
            </div>
          ) : (
            // 订单卡片列表
            <div>{orders.map((order, index) => renderOrderCard(order, index))}</div>
          )}
        </div>
      </Content>

      {/* 订单详情弹窗 */}
      <Modal
        title={
          <div style={{ fontSize: 20, fontWeight: 600 }}>
            <ShoppingOutlined style={{ marginRight: 8, color: "#6366f1" }} />
            订单详情 #{selectedOrder?.orderId}
          </div>
        }
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setDetailModalOpen(false);
              setSelectedOrder(null);
            }}
            size="large"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none",
            }}
          >
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedOrder && (
          <div style={{ padding: "20px 0" }}>
            {/* 订单基本信息 */}
            <div style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 4 }}>
                      订单状态
                    </div>
                    <Tag
                      icon={getStatusConfig(selectedOrder.status).icon}
                      color={getStatusConfig(selectedOrder.status).color}
                      style={{ fontSize: 14, padding: "4px 12px" }}
                    >
                      {getStatusConfig(selectedOrder.status).text}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 4 }}>
                      支付方式
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>
                      {selectedOrder.paymentMethod || "未选择"}
                    </div>
                  </div>
                </Col>
                <Col span={24}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 4 }}>
                      下单时间
                    </div>
                    <div style={{ fontSize: 15 }}>
                      {new Date(selectedOrder.orderDate).toLocaleString("zh-CN")}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* 商品列表 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                商品清单
              </div>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                {selectedOrder.orderItems.map((item: OrderItemDTO) => (
                  <Card
                    key={item.orderItemId}
                    size="small"
                    style={{
                      background: "rgba(31, 41, 55, 0.5)",
                      border: "1px solid rgba(75, 85, 99, 0.3)",
                    }}
                  >
                    <Row justify="space-between" align="middle">
                      <Col>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                          {item.gameTitle || `游戏 #${item.gameId}`}
                        </div>
                        {item.activationCode && (
                          <div style={{ fontSize: 13, color: "#22c55e" }}>
                            激活码：{item.activationCode}
                          </div>
                        )}
                      </Col>
                      <Col>
                        <div style={{ textAlign: "right" }}>
                          {item.discountPrice && item.discountPrice < item.unitPrice ? (
                            <>
                              <div
                                style={{
                                  color: "#6b7280",
                                  textDecoration: "line-through",
                                  fontSize: 13,
                                }}
                              >
                                ￥{item.unitPrice.toFixed(2)}
                              </div>
                              <div style={{ color: "#22c55e", fontWeight: 600, fontSize: 16 }}>
                                ￥{item.discountPrice.toFixed(2)}
                              </div>
                            </>
                          ) : (
                            <div style={{ fontWeight: 600, fontSize: 16 }}>
                              ￥{item.unitPrice.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            </div>

            <Divider />

            {/* 价格汇总 */}
            <Row justify="space-between" style={{ fontSize: 18, fontWeight: 700 }}>
              <Col>订单总额：</Col>
              <Col style={{ color: "#22c55e", fontSize: 24 }}>
                ￥{selectedOrder.finalAmount.toFixed(2)}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
