// 文件路径: @/components/shopping/GameDetailModal.tsx

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
      message.success(`已将 ${game.title} ×${quantity} 加入购物车`);
      setQuantity(1);
      onClose();
    } catch {
      message.error("加入购物车失败");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "未知";
    try {
      return new Date(dateString).toLocaleDateString("zh-CN", {
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
        {/* 游戏封面 */}
        <div
          style={{
            position: "relative",
            height: 400,
            background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(15,23,42,0.98)), url(${
              game.imageUrl || "/placeholder-game.jpg"
            }) center/cover no-repeat`,
            borderRadius: "16px 16px 0 0",
          }}
        >
          {/* 折扣标签 */}
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

          {/* 游戏标题和基本信息 */}
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
                  {game.isActive ? "在售中" : "已下架"}
                </Tag>
              )}
            </Space>
          </div>
        </div>

        {/* 详情内容 */}
        <div 
          style={{ 
            padding: "32px",
            background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 1) 100%)",
          }}
        >
          <Row gutter={[32, 32]}>
            {/* 左侧：详细信息 */}
            <Col xs={24} md={14}>
              {/* 开发商 */}
              {game.developer && (
                <div style={{ marginBottom: 20 }}>
                  <Space align="center" style={{ marginBottom: 8 }}>
                    <UserOutlined style={{ color: "#6366f1", fontSize: 16 }} />
                    <Text strong style={{ color: "#e5e7eb", fontSize: 14 }}>
                      开发商
                    </Text>
                  </Space>
                  <div style={{ color: "#9ca3af", paddingLeft: 24 }}>
                    {game.developer}
                  </div>
                </div>
              )}

              {/* 发行日期 */}
              {game.releaseDate && (
                <div style={{ marginBottom: 20 }}>
                  <Space align="center" style={{ marginBottom: 8 }}>
                    <CalendarOutlined style={{ color: "#6366f1", fontSize: 16 }} />
                    <Text strong style={{ color: "#e5e7eb", fontSize: 14 }}>
                      发行日期
                    </Text>
                  </Space>
                  <div style={{ color: "#9ca3af", paddingLeft: 24 }}>
                    {formatDate(game.releaseDate)}
                  </div>
                </div>
              )}

              {/* 游戏ID */}
              <div style={{ marginBottom: 20 }}>
                <Space align="center" style={{ marginBottom: 8 }}>
                  <CodeOutlined style={{ color: "#6366f1", fontSize: 16 }} />
                  <Text strong style={{ color: "#e5e7eb", fontSize: 14 }}>
                    游戏ID
                  </Text>
                </Space>
                <div style={{ color: "#9ca3af", paddingLeft: 24, fontFamily: "monospace" }}>
                  #{game.gameId}
                </div>
              </div>

              <Divider style={{ borderColor: "rgba(99, 102, 241, 0.2)" }} />

              {/* 游戏描述 */}
              <div>
                <Text strong style={{ color: "#e5e7eb", fontSize: 16, display: "block", marginBottom: 12 }}>
                  游戏简介
                </Text>
                <Paragraph
                  style={{
                    color: "#9ca3af",
                    fontSize: 14,
                    lineHeight: 1.8,
                    textAlign: "justify",
                  }}
                >
                  {game.description || "暂无游戏描述"}
                </Paragraph>
              </div>
            </Col>

            {/* 右侧：购买区域 */}
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
                  购买选项
                </Title>

                {/* 价格展示 */}
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
                          省 ￥{(game.price - game.discountPrice).toFixed(2)}
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

                {/* 数量选择 */}
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ color: "#e5e7eb", display: "block", marginBottom: 12 }}>
                    购买数量
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

                {/* 总计 */}
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
                    <Text style={{ color: "#9ca3af", fontSize: 14 }}>小计</Text>
                    <Text strong style={{ color: "#e5e7eb", fontSize: 20 }}>
                      ￥{((game.discountPrice || game.price) * quantity).toFixed(2)}
                    </Text>
                  </div>
                </div>

                {/* 购买按钮 */}
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
                  {game.isActive ? "加入购物车" : "该游戏已下架"}
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
                    购买后立即获得激活码
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