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
} from "antd";
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Menubar } from "@/components/layout";
import { useOrders } from "@/app/features/orders/hooks/useOrders";
import { PaymentModal } from "@/components/modals/PaymentModal";
import { ENV } from "@/config/env";
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
  const [payModalOpen, setPayModalOpen] = useState<{ open: boolean; order: OrderDTO | null }>(
    { open: false, order: null }
  );
  

  // Get order status configuration
  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { color: string; icon: React.ReactNode; text: string; bgColor: string }
    > = {
      PENDING: {
        color: "gold",
        icon: <ClockCircleOutlined />,
        text: "Pending",
        bgColor: "rgba(250, 173, 20, 0.1)",
      },
      COMPLETED: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Completed",
        bgColor: "rgba(52, 211, 153, 0.1)",
      },
      CANCELLED: {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "Cancelled",
        bgColor: "rgba(239, 68, 68, 0.1)",
      },
    };
    return configs[status] || configs.PENDING;
  };

  // Real sandbox simulation: open payment form
  const handlePay = (order: OrderDTO) => {
    setPayModalOpen({ open: true, order });
  };

  // Simple RSA encryption (frontend example). Backend should also validate and decrypt.
  async function encryptWithPublicKey(plain: string, pemPublicKey: string): Promise<string> {
    const clean = pemPublicKey.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s+/g, "");
    const raw = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
      "spki",
      raw.buffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );
    const enc = new TextEncoder().encode(plain);
    const cipher = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, enc);
    return btoa(String.fromCharCode(...new Uint8Array(cipher)));
  }

  const handleConfirmPay = async (method: string, card: { cardHolder: string; cardNumber: string; expiry: string; cvc: string }) => {
    const order = payModalOpen.order;
    if (!order) return;
    try {
      setPayLoading(order.orderId);
      const pubKey = (process.env.NEXT_PUBLIC_PAYMENT_PUB_KEY as string) || (ENV as any).PAYMENT_PUB_KEY;
      const payload = JSON.stringify(card);
      const encrypted = pubKey ? await encryptWithPublicKey(payload, pubKey) : payload;
      // Call backend payment creation/confirmation API as needed (replace with real API if available)
      // Temporarily use existing payOrder(orderId) for simulation confirmation
      await payOrder(order.orderId);
      message.success("Payment successful! Game has been added to your library");
      setPayModalOpen({ open: false, order: null });
    } catch (e) {
      message.error("Payment failed, please try again");
    } finally {
      setPayLoading(null);
    }
  };

  // Handle cancel order
  const handleCancelOrder = (orderId: number) => {
    modal.confirm({
      title: "Cancel Order",
      icon: <ExclamationCircleOutlined style={{ color: "#ef4444" }} />,
      content: "Are you sure you want to cancel this order? This action cannot be undone.",
      okText: "Confirm Cancel",
      cancelText: "Don't Cancel",
      okType: "danger",
      onOk: async () => {
        setPayLoading(orderId);
        try {
          await failOrder(orderId);
          message.success("Order cancelled");
        } catch (error) {
          message.error("Failed to cancel order, please try again");
        } finally {
          setPayLoading(null);
        }
      },
    });
  };


  // Render order card
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
        styles={{ body: { padding: 24 } }}
      >
        {/* Order header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Space size={16}>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                Order #{order.orderId}
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
              Order Time: {new Date(order.orderDate).toLocaleString("en-US")}
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
              Payment Method: {order.paymentMethod || "Not Selected"}
            </div>
          </Col>
        </Row>

        <Divider style={{ borderColor: "rgba(75, 85, 99, 0.3)", margin: "16px 0" }} />

        {/* Order items list */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 12 }}>
            Item List:
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
                      {item.gameTitle || `Game #${item.gameId}`}
                    </div>
                    {item.discountPrice && item.discountPrice < item.unitPrice && (
                      <Tag color="red" style={{ fontSize: 12 }}>
                        Discount
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

        {/* Action buttons (payment related only) */}
        <Row gutter={12}>
          {isPending && (
            <>
              <Col>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  loading={payLoading === order.orderId}
                  onClick={() => handlePay(order)}
                  style={{
                    height: 44,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    border: "none",
                    minWidth: 140,
                  }}
                >
                  Pay Now
                </Button>
              </Col>
              <Col>
                <Button
                  danger
                  size="large"
                  icon={<CloseCircleOutlined />}
                  loading={payLoading === order.orderId}
                  onClick={() => handleCancelOrder(order.orderId)}
                  style={{
                    height: 44,
                    borderRadius: 12,
                    minWidth: 140,
                  }}
                >
                  Cancel Order
                </Button>
              </Col>
            </>
          )}
        </Row>
      </Card>
    );
  };

  // Payment form modal
  const payAmount = payModalOpen.order?.finalAmount;

  // Handle payment modal close
  const handlePaymentModalClose = () => {
    if (payModalOpen.order) {
      message.warning("Payment not completed. Please click 'Pay Now' again to finish.");
    }
    setPayModalOpen({ open: false, order: null });
  };

  const renderPayModal = () => (
    <PaymentModal
      open={payModalOpen.open}
      onClose={handlePaymentModalClose}
      amount={payAmount}
      onConfirm={handleConfirmPay}
    />
  );

  // Skeleton screen
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

  // Statistics
  const getStats = () => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const completed = orders.filter((o) => o.status === "COMPLETED").length;
    const totalAmount = orders.reduce((sum, o) => sum + o.finalAmount, 0);

    return { total, pending, completed, totalAmount };
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
      {/* Dynamic background decoration */}
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
        {/* Grid background */}
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

        {/* Floating light balls */}
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

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>

      {/* Fixed top navigation bar */}
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

      {/* Main page content */}
      <Content
        style={{
          marginTop: 64,
          padding: "32px 24px 64px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {renderPayModal()}
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Page title */}
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
              My Orders
            </div>
            <div style={{ color: "#9ca3af", fontSize: 16 }}>
              View and manage your purchase history
            </div>
          </div>

          {/* Statistics cards */}
          {!loading && orders.length > 0 && (
            <Row gutter={16} style={{ marginBottom: 32 }} className="fade-in-up">
              <Col xs={24} sm={12} md={6}>
                <Card
                  style={{
                    ...cardStyle,
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                  styles={{ body: { padding: 20 } }}
                >
                  <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 8 }}>
                    Total Orders
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
                  styles={{ body: { padding: 20 } }}
                >
                  <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 8 }}>
                    Pending
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
                  styles={{ body: { padding: 20 } }}
                >
                  <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 8 }}>
                    Completed
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>
                    {stats.completed}
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
                  styles={{ body: { padding: 20 } }}
                >
                  <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 8 }}>
                    Total Spent
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>
                    ￥{stats.totalAmount.toFixed(0)}
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {/* Order list */}
          {loading ? (
            // Loading
            <div>
              {[...Array(3)].map((_, i) => (
                <div key={i}>{renderSkeleton()}</div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            // Empty state
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
                      No orders yet
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
                      Go to Store
                    </Button>
                  </div>
                }
              />
            </div>
          ) : (
            // Order cards list
            <div>{orders.map((order, index) => renderOrderCard(order, index))}</div>
          )}
        </div>
      </Content>
    </Layout>
  );
}
