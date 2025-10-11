"use client";

import React from "react";
import { Card, Button, Tooltip } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

interface StoreGameCardProps {
  gameId: number;
  title: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  onAddToCart: () => void;
  index?: number;
}

export const StoreGameCard: React.FC<StoreGameCardProps> = ({
  title,
  price,
  discountPrice,
  imageUrl,
  onAddToCart,
  index = 0,
}) => {
  const finalPrice = discountPrice ?? price;

  return (
    <Card
      hoverable
      cover={
        <div
          style={{
            position: "relative",
            height: 180,
            background: `url(${imageUrl || "/placeholder-game.jpg"}) center/cover no-repeat`,
            borderRadius: "12px 12px 0 0",
          }}
        />
      }
      style={{
        borderRadius: 16,
        background: "rgba(31, 41, 55, 0.8)",
        border: "1px solid rgba(75, 85, 99, 0.3)",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, color: "#fff" }}>
        {title}
      </div>
      <div style={{ color: "#9ca3af", marginBottom: 12 }}>
        {discountPrice ? (
          <>
            <span style={{ color: "#22c55e", fontWeight: 500, marginRight: 8 }}>
              ￥{discountPrice.toFixed(2)}
            </span>
            <span style={{ textDecoration: "line-through", color: "#9ca3af" }}>
              ￥{price.toFixed(2)}
            </span>
          </>
        ) : (
          <span>￥{price.toFixed(2)}</span>
        )}
      </div>
      <Tooltip title="加入购物车">
        <Button
          type="primary"
          shape="round"
          icon={<ShoppingCartOutlined />}
          onClick={onAddToCart}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            border: "none",
          }}
        >
          加入购物车
        </Button>
      </Tooltip>
    </Card>
  );
};
