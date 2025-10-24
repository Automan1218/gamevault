"use client";

import React, { useEffect, useState } from "react";
import { PageContainer, ProDescriptions } from "@ant-design/pro-components";
import { App, Tag } from "antd";
import { useParams } from "next/navigation";

type OrderItem = { gameId: number; unitPrice: number; discountPrice?: number; activationCode?: string };
type OrderDetail = {
  orderItemId: number; // Use order item as detail primary key
  orderId: number;
  userId: number;
  gameId: number;
  orderDate: string;
  orderStatus: string;
  unitPrice: number;
  discountPrice?: number;
  // Extension: Backend can join tables to get activation codes
  activationCodes?: string[];
};
export const dynamic = 'force-dynamic';
export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { message } = App.useApp();
  const [detail, setDetail] = useState<OrderDetail | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const res = await fetch(`/api/orders/${params.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const d = await res.json();
        if (!res.ok) throw new Error(d?.message || "Loading failed");
        setDetail(d);
      } catch (e: any) { message.error(e?.message || "Loading failed"); }
    })();
  }, [params.id, message]);

  return (
    <PageContainer header={{ title: `Order Details` }}>
      {detail && (
        <>
          <ProDescriptions column={2} dataSource={detail} columns={[
            { title: "Order Item ID", dataIndex: "orderItemId" },
            { title: "Order ID", dataIndex: "orderId" },
            { title: "User ID", dataIndex: "userId" },
            { title: "Game ID", dataIndex: "gameId" },
            { title: "Order Time", dataIndex: "orderDate", valueType: "dateTime" },
            { title: "Status", dataIndex: "orderStatus", render: (_, r) => <Tag>{r.orderStatus}</Tag> },
            { title: "Unit Price", dataIndex: "unitPrice", valueType: "money" },
            { title: "Discounted Price", dataIndex: "discountPrice", valueType: "money" },
          ]} />
          {detail.activationCodes && detail.activationCodes.length > 0 && (
            <>
              <ProDescriptions title="Activation Codes" dataSource={{}} columns={[] as any} />
              <ul style={{ marginTop: 12 }}>
                {detail.activationCodes.map((code, idx) => (
                  <li key={idx} style={{ padding: 8, borderBottom: "1px solid #222" }}>{code}</li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </PageContainer>
  );
}


