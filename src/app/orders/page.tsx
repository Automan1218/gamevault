"use client";

import React, { useEffect, useState } from "react";
import { ProTable, ProColumns } from "@ant-design/pro-components";
import { App, Tag } from "antd";
import Link from "next/link";
import { PageContainer, Menubar } from '@/components/layout';

// Align with order_items table
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
        if (!res.ok) throw new Error(d?.message || "Loading failed");
        setData(d?.items || []);
      } catch (e: any) { message.error(e?.message || "Loading failed"); }
    })();
  }, [message]);

  const columns: ProColumns<OrderItemRow>[] = [
    { title: "Order Item ID", dataIndex: "orderItemId", render: (_, r) => <Link href={`/orders/${r.orderItemId}`}>{r.orderItemId}</Link> },
    { title: "Order ID", dataIndex: "orderId" },
    { title: "Game ID", dataIndex: "gameId" },
    { title: "Order Time", dataIndex: "orderDate", valueType: "dateTime" },
    { title: "Unit Price", dataIndex: "unitPrice", valueType: "money" },
    { title: "Discounted Price", dataIndex: "discountPrice", valueType: "money" },
    { title: "Status", dataIndex: "orderStatus", render: (_, r) => <Tag color={r.orderStatus === 'PAID' || r.orderStatus === 'COMPLETED' ? 'green' : r.orderStatus === 'PENDING' ? 'gold' : 'red'}>{r.orderStatus}</Tag> },
  ];

  return (
    <>
      {/* Top navigation bar */}
      <Menubar currentPath="/orders" />
      
      <PageContainer
        title="Purchase History"
        subtitle="View your order history • Manage purchase records"
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


