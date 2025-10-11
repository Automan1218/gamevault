"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount?: number;
  onConfirm: (method: string) => Promise<void>;
}

export function PaymentModal({ open, onClose, amount, onConfirm }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const { cardNumber, paymentMethod } = await form.validateFields();
      if (!/^(\d{4}-\*{4}-\*{4}-\d{4})$/.test(cardNumber)) {
        message.error("卡号格式应为 1234-****-****-5678");
        return;
      }
      setLoading(true);
      await onConfirm(paymentMethod);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="支付"
      cancelText="取消"
      confirmLoading={loading}
      title="模拟支付"
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="paymentMethod"
          label="支付方式"
          rules={[{ required: true, message: "请选择支付方式" }]}
        >
          <Select
            options={[
              { label: "信用卡", value: "CREDIT_CARD" },
              { label: "借记卡", value: "DEBIT_CARD" },
              { label: "钱包余额", value: "WALLET" },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="cardNumber"
          label="卡号"
          rules={[{ required: true, message: "请输入卡号" }]}
        >
          <Input placeholder="格式示例：1234-****-****-5678" />
        </Form.Item>
        <p style={{ textAlign: "right" }}>
          支付金额：<strong>￥{amount?.toFixed(2) || 0}</strong>
        </p>
      </Form>
    </Modal>
  );
}
