"use client";

import React from "react";
import { Modal, List, Button, Typography, Divider } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { CartDTO } from "@/lib/api/StoreTypes";

const { Text, Title } = Typography;

interface CartDetailModalProps {
  open: boolean;
  onClose: () => void;
  cart: CartDTO | null;
  onRemoveItem?: (gameId: number) => void;
  onClear?: () => void;
  onCheckout?: () => void;
}

export const CartDetailModal: React.FC<CartDetailModalProps> = ({
  open,
  onClose,
  cart,
  onRemoveItem,
  onClear,
  onCheckout,
}) => {
  return (
    <Modal
      open={open}
      title="购物车详情"
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      styles={{
        body: {
          background: "rgba(17, 24, 39, 0.9)",
          borderRadius: 16,
          color: "#fff",
          maxHeight: "70vh",
          overflowY: "auto",
        }
      }}
    >
      {cart && cart.cartItems && cart.cartItems.length > 0 ? (
        <>
          <List
            itemLayout="horizontal"
            dataSource={cart.cartItems}
            renderItem={(item) => (
              <List.Item
                style={{
                  background: "rgba(31, 41, 55, 0.85)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 12,
                  marginBottom: 12,
                  padding: "12px 16px",
                }}
                actions={[
                  <Button
                    key="remove"
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onRemoveItem?.(item.game.gameId)}
                    style={{ color: "#f87171" }}
                  >
                    移除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <span style={{ color: "#f9fafb", fontWeight: 600 }}>
                      {item.game.title}
                    </span>
                  }
                  description={
                    <Text style={{ color: "#9ca3af" }}>
                      单价: ￥{item.unitPrice.toFixed(2)}
                    </Text>
                  }
                />
                <div style={{ textAlign: "right" }}>
                  <Text strong style={{ color: "#a5b4fc" }}>
                    小计: ￥{(item.unitPrice * (item.quantity ?? 1)).toFixed(2)}
                  </Text>
                </div>
              </List.Item>
            )}
          />

          <Divider style={{ borderColor: "rgba(99,102,241,0.3)" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 8px",
            }}
          >
            <Title
              level={5}
              style={{ margin: 0, color: "#e5e7eb", fontWeight: 600 }}
            >
              总金额
            </Title>
            <Title
              level={4}
              style={{ margin: 0, color: "#a5b4fc", fontWeight: 700 }}
            >
              ￥{cart.finalAmount?.toFixed(2) ?? "0.00"}
            </Title>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 16,
            }}
          >
            <Button
              onClick={onClear}
              style={{
                borderColor: "rgba(99,102,241,0.3)",
                color: "#e5e7eb",
                background: "transparent",
              }}
            >
              清空购物车
            </Button>

            <Button
              type="primary"
              onClick={onCheckout}
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                border: "none",
                fontWeight: 600,
              }}
            >
              去结账
            </Button>
          </div>
        </>
      ) : (
        <div
          style={{
            textAlign: "center",
            color: "#9ca3af",
            padding: "60px 0",
            fontSize: "1.1rem",
          }}
        >
          购物车为空，快去挑选您喜欢的游戏吧！
        </div>
      )}
    </Modal>
  );
};
