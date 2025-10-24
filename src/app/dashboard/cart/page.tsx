"use client";

import React, { useState } from "react";
import {
  App,
  Card,
  Button,
  InputNumber,
  Row,
  Col,
  Layout,
  Empty,
  Skeleton,
  Space,
  Divider,
  Modal,
  Radio,
  Image,
} from "antd";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Menubar } from "@/components/layout";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { cardStyle, primaryButtonStyle } from "@/components/common/theme";
import type { CartItemDTO } from "@/lib/api/StoreTypes";
import { getFullImageUrl } from "@/lib/utils/imageUtils";
import "@/components/common/animations.css";

const { Header, Content } = Layout;
export const dynamic = 'force-dynamic';
export default function CartPage() {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, checkout } = useCart();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Handle quantity change
  const handleQuantityChange = async (gameId: number, newQuantity: number | null) => {
    if (!newQuantity || newQuantity < 1) return;

    try {
      await updateQuantity(gameId, newQuantity);
      message.success("Quantity updated");
    } catch (error: any) {
      message.error(error?.message || "Update failed");
    }
  };

  // Handle item removal
  const handleRemoveItem = (gameId: number, gameTitle: string) => {
    modal.confirm({
      title: "Confirm Removal",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to remove "${gameTitle}" from your cart?`,
      okText: "Confirm",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await removeFromCart(gameId);
          message.success("Removed");
        } catch (error) {
          message.error("Removal failed");
        }
      },
    });
  };

  // Handle clear cart
  const handleClearCart = () => {
    modal.confirm({
      title: "Confirm Clear Cart",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to clear your cart? This action cannot be undone.",
      okText: "Confirm Clear",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await clearCart();
          message.success("Cart cleared");
        } catch (error) {
          message.error("Clear failed");
        }
      },
    });
  };

  // Handle checkout
  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      await checkout(paymentMethod);
      message.success("Order created, please go to orders page to complete payment!");
      setCheckoutModalOpen(false);
      
      // Navigate to orders page
      setTimeout(() => {
        router.push("/dashboard/orders");
      }, 1000);
    } catch (error) {
      message.error("Failed to create order, please try again");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    if (!cart?.cartItems) return 0;
    return cart.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  // Sort cart items (by add time or game ID to maintain stable order)
  const sortedCartItems = React.useMemo(() => {
    if (!cart?.cartItems) return [];
    // Sort by cartItemId to ensure stable order
    return [...cart.cartItems].sort((a, b) => a.cartItemId - b.cartItemId);
  }, [cart?.cartItems]);

  // Render cart item card
  const renderCartItem = (item: CartItemDTO, index: number) => (
    <Card
      key={item.cartItemId}
      className="fade-in-up"
      style={{
        marginBottom: 16,
        ...cardStyle,
        borderRadius: 16,
        animationDelay: `${index * 0.05}s`,
        transition: "all 0.3s ease",
      }}
      styles={{ body: { padding: 20 } }}
      hoverable
    >
      <Row gutter={24} align="middle">
        {/* Game cover */}
        <Col xs={24} sm={6} md={4}>
          <Image
            src={getFullImageUrl(item.game.imageUrl)}
            alt={item.game.title}
            style={{
              width: "100%",
              height: 120,
              objectFit: "cover",
              borderRadius: 12,
            }}
            preview={false}
          />
        </Col>

        {/* Game info */}
        <Col xs={24} sm={12} md={10}>
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#fff",
                marginBottom: 8,
              }}
            >
              {item.game.title}
            </div>
            <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 4 }}>
              Developer:{item.game.developer}
            </div>
            <div style={{ color: "#6366f1", fontSize: 16, fontWeight: 600 }}>
              Unit Price: ¥{item.unitPrice.toFixed(2)}
            </div>
          </div>
        </Col>

        {/* Quantity control */}
        <Col xs={12} sm={6} md={4}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 8 }}>
              Quantity
            </div>
            <InputNumber
              min={1}
              max={10}
              value={item.quantity}
              onChange={(val) => handleQuantityChange(item.game.gameId, val)}
              style={{ width: "100%" }}
              size="large"
            />
          </div>
        </Col>

        {/* Subtotal and actions */}
        <Col xs={12} sm={6} md={6}>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#22c55e",
                marginBottom: 12,
              }}
            >
              ￥{item.subtotal.toFixed(2)}
            </div>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveItem(item.game.gameId, item.game.title)}
            >
              Remove
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );

  // Render checkout summary
  const renderSummary = () => {
    const total = calculateTotal();
    const itemCount = cart?.cartItems.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
      <Card
        style={{
          ...cardStyle,
          borderRadius: 16,
          position: "sticky",
          top: 80,
        }}
        styles={{ body: { padding: 24 } }}
      >
        <div style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 20 }}>
          Order Summary
        </div>

        <Divider style={{ borderColor: "rgba(75, 85, 99, 0.3)", margin: "16px 0" }} />

        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" style={{ marginBottom: 12 }}>
            <Col style={{ color: "#9ca3af" }}>Item Count</Col>
            <Col style={{ color: "#fff", fontWeight: 600 }}>{itemCount} items</Col>
          </Row>
          <Row justify="space-between" style={{ marginBottom: 12 }}>
            <Col style={{ color: "#9ca3af" }}>Total Price</Col>
            <Col style={{ color: "#fff", fontWeight: 600 }}>￥{total.toFixed(2)}</Col>
          </Row>
          {cart?.discountAmount && cart.discountAmount > 0 && (
            <Row justify="space-between" style={{ marginBottom: 12 }}>
              <Col style={{ color: "#ef4444" }}>Discount</Col>
              <Col style={{ color: "#ef4444", fontWeight: 600 }}>
                -￥{cart.discountAmount.toFixed(2)}
              </Col>
            </Row>
          )}
        </div>

        <Divider style={{ borderColor: "rgba(75, 85, 99, 0.3)", margin: "16px 0" }} />

        <Row justify="space-between" style={{ marginBottom: 24 }}>
          <Col style={{ fontSize: 18, color: "#fff", fontWeight: 600 }}>Total Amount Due</Col>
          <Col style={{ fontSize: 24, color: "#22c55e", fontWeight: 700 }}>
            ￥{(cart?.finalAmount || total).toFixed(2)}
          </Col>
        </Row>

        <Button
          type="primary"
          size="large"
          block
          icon={<CheckCircleOutlined />}
          onClick={() => setCheckoutModalOpen(true)}
          disabled={!cart?.cartItems || cart.cartItems.length === 0}
          style={{
            ...primaryButtonStyle,
            marginBottom: 12,
          }}
        >
          Place Order Now
        </Button>

        <Button
          type="default"
          size="large"
          block
          icon={<ClearOutlined />}
          onClick={handleClearCart}
          disabled={!cart?.cartItems || cart.cartItems.length === 0}
          danger
          style={{
            height: 44,
            borderRadius: 12,
          }}
        >
          Clear Cart
        </Button>
      </Card>
    );
  };

  // Skeleton screen
  const renderSkeleton = () => (
    <Card
      style={{
        marginBottom: 16,
        ...cardStyle,
        borderRadius: 16,
      }}
    >
      <Skeleton active avatar paragraph={{ rows: 2 }} />
    </Card>
  );

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
        <Menubar currentPath="/dashboard/cart" />
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
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
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
              <ShoppingCartOutlined style={{ marginRight: 12 }} />
              My Cart
            </div>
            <div style={{ color: "#9ca3af", fontSize: 16 }}>
              Buy your favorite games, start an exciting journey
            </div>
          </div>

          {/* Content area */}
          {!cart ? (
            // Loading
            <Row gutter={24}>
              <Col xs={24} lg={16}>
                {[...Array(3)].map((_, i) => (
                  <div key={i}>{renderSkeleton()}</div>
                ))}
              </Col>
              <Col xs={24} lg={8}>
                {renderSkeleton()}
              </Col>
            </Row>
          ) : cart.cartItems.length === 0 ? (
            // Empty cart
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
                      Cart is empty
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => router.push("/dashboard/store")}
                      style={{
                        ...primaryButtonStyle,
                      }}
                    >
                      Go to Store
                    </Button>
                  </div>
                }
              />
            </div>
          ) : (
            // Cart content
            <Row gutter={24}>
              {/* Left: Item list */}
              <Col xs={24} lg={16}>
                <Space direction="vertical" size={0} style={{ width: "100%" }}>
                  {sortedCartItems.map((item, index) => renderCartItem(item, index))}
                </Space>
              </Col>

              {/* Right: Checkout summary */}
              <Col xs={24} lg={8}>
                {renderSummary()}
              </Col>
            </Row>
          )}
        </div>
      </Content>

      {/* Checkout modal */}
      <Modal
        title={
          <div style={{ fontSize: 20, fontWeight: 600 }}>
            <CheckCircleOutlined style={{ marginRight: 8, color: "#6366f1" }} />
            Confirm Order
          </div>
        }
        open={checkoutModalOpen}
        onCancel={() => setCheckoutModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setCheckoutModalOpen(false)} size="large">
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={checkoutLoading}
            onClick={handleCheckout}
            size="large"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none",
            }}
          >
            Confirm Order
          </Button>,
        ]}
        width={500}
      >
        <div style={{ padding: "20px 0" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 16, marginBottom: 12, fontWeight: 600 }}>
              Select Payment Method:
            </div>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Radio value="CREDIT_CARD" style={{ fontSize: 15 }}>
                  💳 Credit Card Payment
                </Radio>
                <Radio value="ALIPAY" style={{ fontSize: 15 }}>
                  💰 Alipay
                </Radio>
                <Radio value="WECHAT_PAY" style={{ fontSize: 15 }}>
                  💚 WeChat Pay
                </Radio>
                <Radio value="PAYPAL" style={{ fontSize: 15 }}>
                  🌐 PayPal
                </Radio>
              </Space>
            </Radio.Group>
          </div>

          <Divider />

          <div>
            <Row justify="space-between" style={{ fontSize: 16, marginBottom: 8 }}>
              <Col>Total Items:</Col>
              <Col style={{ fontWeight: 600 }}>￥{calculateTotal().toFixed(2)}</Col>
            </Row>
            {cart?.discountAmount && cart.discountAmount > 0 && (
              <Row justify="space-between" style={{ fontSize: 16, marginBottom: 8 }}>
                <Col style={{ color: "#ef4444" }}>Discount:</Col>
                <Col style={{ color: "#ef4444", fontWeight: 600 }}>
                  -￥{cart.discountAmount.toFixed(2)}
                </Col>
              </Row>
            )}
            <Row justify="space-between" style={{ fontSize: 20, fontWeight: 700, marginTop: 16 }}>
              <Col>Total Amount Due:</Col>
              <Col style={{ color: "#22c55e" }}>
                ￥{(cart?.finalAmount || calculateTotal()).toFixed(2)}
              </Col>
            </Row>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

