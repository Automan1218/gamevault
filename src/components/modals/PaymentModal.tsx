"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Select } from "antd";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount?: number;
  onConfirm: (method: string, card: { cardHolder: string; cardNumber: string; expiry: string; cvc: string }) => Promise<void>;
}

export function PaymentModal({ open, onClose, amount, onConfirm }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Luhn 校验
  const luhnCheck = (card: string): boolean => {
    const digits = card.replace(/\s+/g, "").replace(/-/g, "");
    if (!/^\d{12,19}$/.test(digits)) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const validateExpiry = (val: string): boolean => {
    if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(val)) return false;
    const [mm, yy] = val.split("/");
    const month = parseInt(mm, 10);
    const year = 2000 + parseInt(yy, 10);
    const now = new Date();
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    return endOfMonth >= now;
  };

  const normalizeCardNumber = (value: string): string => {
    const digits = value.replace(/[^\d]/g, "").slice(0, 19);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };
  const normalizeCvc = (value: string): string => value.replace(/[^\d]/g, "").slice(0, 4);
  const normalizeExpiry = (value: string): string => {
    const digits = value.replace(/[^\d]/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleOk = async () => {
    try {
      await form.validateFields();
      const { paymentMethod, cardHolder, cardNumber, expiry, cvc } = form.getFieldsValue();
      setLoading(true);
      await onConfirm(paymentMethod, { cardHolder, cardNumber, expiry, cvc });
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
          name="cardHolder"
          label="持卡人姓名"
          rules={[{ required: true, message: "请输入持卡人姓名" }]}
        >
          <Input placeholder="与卡面一致的姓名" />
        </Form.Item>
        <Form.Item
          name="cardNumber"
          label="卡号"
          rules={[
            { required: true, message: "请输入卡号" },
            {
              validator: (_, value) => {
                const normalized = (value || "").replace(/\s+/g, "");
                if (!/^\d{12,19}$/.test(normalized)) {
                  return Promise.reject(new Error("卡号应为12-19位数字"));
                }
                if (!luhnCheck(value || "")) {
                  return Promise.reject(new Error("卡号未通过校验"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            placeholder="1234 5678 9012 3456"
            inputMode="numeric"
            onChange={(e) => {
              const formatted = normalizeCardNumber(e.target.value);
              form.setFieldsValue({ cardNumber: formatted });
            }}
          />
        </Form.Item>
        <div style={{ display: "flex", gap: 12 }}>
          <Form.Item
            name="expiry"
            label="有效期 (MM/YY)"
            style={{ flex: 1 }}
            rules={[
              { required: true, message: "请输入有效期" },
              {
                validator: (_, value) =>
                  validateExpiry(value || "")
                    ? Promise.resolve()
                    : Promise.reject(new Error("有效期格式或日期无效")),
              },
            ]}
          >
            <Input
              placeholder="MM/YY"
              inputMode="numeric"
              onChange={(e) => {
                const formatted = normalizeExpiry(e.target.value);
                form.setFieldsValue({ expiry: formatted });
              }}
            />
          </Form.Item>
          <Form.Item
            name="cvc"
            label="CVC"
            style={{ flex: 1 }}
            rules={[
              { required: true, message: "请输入 CVC" },
              {
                validator: (_, value) =>
                  /^\d{3,4}$/.test((value || "").trim())
                    ? Promise.resolve()
                    : Promise.reject(new Error("CVC 应为 3-4 位数字")),
              },
            ]}
          >
            <Input
              placeholder="3-4位数字"
              inputMode="numeric"
              onChange={(e) => {
                const formatted = normalizeCvc(e.target.value);
                form.setFieldsValue({ cvc: formatted });
              }}
            />
          </Form.Item>
        </div>
        <p style={{ textAlign: "right" }}>
          支付金额：<strong>￥{amount?.toFixed(2) || 0}</strong>
        </p>
      </Form>
    </Modal>
  );
}
