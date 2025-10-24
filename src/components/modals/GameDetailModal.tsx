// File path: @/components/shopping/GameDetailModal.tsx

import React, { useState } from "react";
import {
  Modal,
  Button,
  InputNumber,
  Tag,
  Divider,
  Row,
  Col,
  Space,
  Typography,
  App,
} from "antd";
import { getFullImageUrl } from "@/lib/utils/imageUtils";
import {
  ShoppingCartOutlined,
  CalendarOutlined,
  CodeOutlined,
  UserOutlined,
  DesktopOutlined,
  TagOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { GameDTO } from "@/lib/api/StoreTypes";
import { useCart } from "@/contexts/CartContext";

const { Title, Text, Paragraph } = Typography;

interface GameDetailModalProps {
  game: GameDTO | null;
  open: boolean;
  onClose: () => void;
}
export const dynamic = 'force-dynamic';
export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  open,
  onClose,
}) => {
  const { message } = App.useApp();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!game) return null;

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(game.gameId, quantity);
      message.success(`Added ${game.title} ×${quantity} to cart`);
      setQuantity(1);
      onClose();
    } catch {
      message.error("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const discountPercent = game.discountPrice
    ? Math.round(((game.price - game.discountPrice) / game.price) * 100)
    : 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      closeIcon={
        <CloseOutlined 
          style={{ 
            color: "#e5e7eb",
            fontSize: 18,
            transition: "all 0.3s",
          }} 
        />
      }
      styles={{
        body: { 
          padding: 0,
          background: "transparent",
        },
        content: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
        header: {
          background: "transparent",
        },
        mask: { 
          backdropFilter: "blur(12px)",
          background: "rgba(0, 0, 0, 0.75)",
        },
      }}
      style={{
        top: 40,
      }}
      modalRender={(node) => (
        <div
          style={{
            background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(99, 102, 241, 0.4)",
            boxShadow: "0 24px 64px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.2)",
          }}
        >
          {node}
        </div>
      )}
    >
      <div
        style={{
          background: "transparent",
        }}
      >
        {/* Game Cover */}
        <div
          style={{
            position: "relative",
            height: 400,
            background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(15,23,42,0.98)), url(${
              getFullImageUrl(game.imageUrl)
            }) center/cover no-repeat`,
            borderRadius: "16px 16px 0 0",
          }}
        >
          {/* Discount Tag */}
          {game.discountPrice && (
            <div
              style={{
                position: "absolute",
                top: 24,
                left: 24,
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 20,
                boxShadow: "0 4px 16px rgba(239, 68, 68, 0.5)",
              }}
            >
              -{discountPercent}%
            </div>
          )}

          {/* Game Title and Basic Info */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "32px",
              background: "linear-gradient(to top, rgba(15,23,42,0.95), transparent)",
            }}
          >
            <Title
              level={2}
              style={{
                color: "#fff",
                marginBottom: 12,
                textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              }}
            >
              {game.title}
            </Title>
            
            <Space size={[8, 8]} wrap>
              {game.genre && (
                <Tag
                  icon={<TagOutlined />}
                  color="blue"
                  style={{ fontSize: 13, padding: "4px 12px" }}
                >
                  {game.genre}
                </Tag>
              )}
              {game.platform && (
                <Tag
                  icon={<DesktopOutlined />}
                  color="purple"
                  style={{ fontSize: 13, padding: "4px 12px" }}
                >
                  {game.platform}
                </Tag>
              )}
              {game.isActive !== undefined && (
                <Tag
                  color={game.isActive ? "success" : "default"}
                  style={{ fontSize: 13, padding: "4px 12px" }}
                >
                  {game.isActive ? "Available" : "Discontinued"}
                </Tag>
              )}
            </Space>
          </div>
        </div>

        {/* Detail Content */}
        <div 
          style={{ 
            padding: "32px",
            background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 1) 100%)",
          }}
        >
          <Row gutter={[32, 32]}>
            {/* Left: Detailed Information */}
            <Col xs={24} md={14}>
              {/* Developer */}
              {game.developer && (
                <div style={{ marginBottom: 20 }}>
                  <Space align="center" style={{ marginBottom: 8 }}>
                    <UserOutlined style={{ color: "#6366f1", fontSize: 16 }} />
                    <Text strong style={{ color: "#e5e7eb", fontSize: 14 }}>
                      Developer
                    </Text>
                  </Space>
                  <div style={{ color: "#9ca3af", paddingLeft: 24 }}>
                    {game.developer}
                  </div>
                </div>
              )}

              {/* Release Date */}
              {game.releaseDate && (
                <div style={{ marginBottom: 20 }}>
                  <Space align="center" style={{ marginBottom: 8 }}>
                    <CalendarOutlined style={{ color: "#6366f1", fontSize: 16 }} />
                    <Text strong style={{ color: "#e5e7eb", fontSize: 14 }}>
                      Release Date
                    </Text>
                  </Space>
                  <div style={{ color: "#9ca3af", paddingLeft: 24 }}>
                    {formatDate(game.releaseDate)}
                  </div>
                </div>
              )}

              {/* Game ID */}
              <div style={{ marginBottom: 20 }}>
                <Space align="center" style={{ marginBottom: 8 }}>
                  <CodeOutlined style={{ color: "#6366f1", fontSize: 16 }} />
                  <Text strong style={{ color: "#e5e7eb", fontSize: 14 }}>
                    Game ID
                  </Text>
                </Space>
                <div style={{ color: "#9ca3af", paddingLeft: 24, fontFamily: "monospace" }}>
                  #{game.gameId}
                </div>
              </div>

              <Divider style={{ borderColor: "rgba(99, 102, 241, 0.2)" }} />

              {/* Game Description */}
              <div>
                <Text strong style={{ color: "#e5e7eb", fontSize: 16, display: "block", marginBottom: 12 }}>
                  Game Description
                </Text>
                <Paragraph
                  style={{
                    color: "#9ca3af",
                    fontSize: 14,
                    lineHeight: 1.8,
                    textAlign: "justify",
                  }}
                >
                  {game.description || "No game description available"}
                </Paragraph>
              </div>
            </Col>

            {/* Right: Purchase Area */}
            <Col xs={24} md={10}>
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(31, 41, 55, 0.6) 100%)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: 16,
                  padding: 28,
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                <Title level={4} style={{ color: "#e5e7eb", marginBottom: 24 }}>
                  Purchase Options
                </Title>

                {/* Price Display */}
                <div style={{ marginBottom: 28 }}>
                  {game.discountPrice ? (
                    <>
                      <div
                        style={{
                          fontSize: 36,
                          fontWeight: 700,
                          color: "#22c55e",
                          marginBottom: 8,
                        }}
                      >
                        ￥{game.discountPrice.toFixed(2)}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Text
                          delete
                          style={{
                            fontSize: 18,
                            color: "#6b7280",
                          }}
                        >
                          ￥{game.price.toFixed(2)}
                        </Text>
                        <Tag color="red" style={{ margin: 0 }}>
                          Save ￥{(game.price - game.discountPrice).toFixed(2)}
                        </Tag>
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 700,
                        color: "#e5e7eb",
                      }}
                    >
                      ￥{game.price.toFixed(2)}
                    </div>
                  )}
                </div>

                <Divider style={{ borderColor: "rgba(99, 102, 241, 0.2)", margin: "24px 0" }} />

                {/* Quantity Selection */}
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ color: "#e5e7eb", display: "block", marginBottom: 12 }}>
                    Purchase Quantity
                  </Text>
                  <InputNumber
                    min={1}
                    max={10}
                    value={quantity}
                    onChange={(val) => setQuantity(val || 1)}
                    size="large"
                    style={{ width: "100%" }}
                  />
                </div>

                {/* Total */}
                <div
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    borderRadius: 12,
                    padding: "16px 20px",
                    marginBottom: 24,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: "#9ca3af", fontSize: 14 }}>Subtotal</Text>
                    <Text strong style={{ color: "#e5e7eb", fontSize: 20 }}>
                      ￥{((game.discountPrice || game.price) * quantity).toFixed(2)}
                    </Text>
                  </div>
                </div>

                {/* Purchase Button */}
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ShoppingCartOutlined />}
                  loading={loading}
                  disabled={!game.isActive}
                  onClick={handleAddToCart}
                  style={{
                    height: 52,
                    fontSize: 16,
                    fontWeight: 600,
                    background: game.isActive 
                      ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                      : undefined,
                    border: "none",
                    boxShadow: game.isActive 
                      ? "0 4px 16px rgba(99, 102, 241, 0.4)"
                      : undefined,
                  }}
                >
                  {game.isActive ? "Add to Cart" : "This game is no longer available"}
                </Button>

                {game.isActive && (
                  <Text
                    type="secondary"
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: 12,
                      fontSize: 12,
                      color: "#6b7280",
                    }}
                  >
                    Get activation codes immediately after purchase
                  </Text>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
  );
};