"use client";

import React, { useEffect, useState } from "react";
import { ProTable, ProColumns } from "@ant-design/pro-components";
import { App, Tag } from "antd";
import Link from "next/link";
import { PageContainer, Menubar } from '@/components/layout';

// 对齐 order_items 表
type OrderItemRow = {
  orderItemId: number; // order_item_id
  orderId: number;     // order_id
  userId: number;      // user_id
  gameId: number;      // game_id
  unitPrice: number;   // unit_price
  discountPrice?: number; // discount_price
  orderDate: string;   // order_date
  orderStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "COMPLETED";
};

export default function OrdersPage() {
  const { message } = App.useApp();
  const [data, setData] = useState<OrderItemRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const res = await fetch(`/api/orders`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const d = await res.json();
        if (!res.ok) throw new Error(d?.message || "加载失败");
        setData(d?.items || []);
      } catch (e: any) { message.error(e?.message || "加载失败"); }
    })();
  }, [message]);

  const columns: ProColumns<OrderItemRow>[] = [
    { title: "订单项ID", dataIndex: "orderItemId", render: (_, r) => <Link href={`/src/app/dashboard/orders/${r.orderItemId}`}>{r.orderItemId}</Link> },
    { title: "订单ID", dataIndex: "orderId" },
    { title: "游戏ID", dataIndex: "gameId" },
    { title: "下单时间", dataIndex: "orderDate", valueType: "dateTime" },
    { title: "单价", dataIndex: "unitPrice", valueType: "money" },
    { title: "折后价", dataIndex: "discountPrice", valueType: "money" },
    { title: "状态", dataIndex: "orderStatus", render: (_, r) => <Tag color={r.orderStatus === 'PAID' || r.orderStatus === 'COMPLETED' ? 'green' : r.orderStatus === 'PENDING' ? 'gold' : 'red'}>{r.orderStatus}</Tag> },
  ];

  return (
    <>
      {/* 顶部导航栏 */}
      <Menubar currentPath="/dashboard/orders" />
      
      <PageContainer
        title="购买记录"
        subtitle="查看您的订单历史 • 管理购买记录"
        showBackground={true}
        showDecorations={true}
      >
        <ProTable<OrderItemRow>
          rowKey="id"
          columns={columns}
          dataSource={data}
          search={false}
          pagination={{ pageSize: 10 }}
        />
      </PageContainer>
    </>
  );
}


